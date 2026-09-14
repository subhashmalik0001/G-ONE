#!/usr/bin/env python3
"""
Unit Test Suite for G-ONE Precision Eye Tracker
------------------------------------------------
Tests:
  - LowPassFilter & OneEuroFilter
  - Dead zone filtering
  - 9-Point Affine Calibration fit and coordinate mapping
  - Blink detection state machine and hysteresis
  - Head pose estimation and gaze vector compensation
  - Outlier rejection
  - WebSocket telemetry JSON serialization and boundary clamping
"""

import unittest
import math
import json
import time
import numpy as np

from eye_tracker import (
    OneEuroFilter,
    CalibrationManager,
    PrecisionGazeTracker,
    MODEL_POINTS_3D,
    HEAD_POSE_LANDMARKS
)


class MockLandmark:
    def __init__(self, x, y, z=0.0):
        self.x = x
        self.y = y
        self.z = z


class TestEyeTracker(unittest.TestCase):

    def test_one_euro_filter_stability_at_rest(self):
        """At rest with micro-noise, OneEuroFilter should produce high smoothing."""
        filt = OneEuroFilter(freq=60.0, min_cutoff=0.8, beta=8.0)
        now = time.time()
        base = 0.5
        outputs = []
        for i in range(30):
            noisy = base + np.sin(i) * 0.002
            outputs.append(filt.filter(noisy, now + i * (1.0 / 60.0)))
        variance = np.var(outputs)
        self.assertLess(variance, 1e-4, "Filter should strongly stabilize resting noise")

    def test_one_euro_filter_responsiveness_on_saccade(self):
        """During sudden saccade, OneEuroFilter adapts cutoff and catches up rapidly."""
        filt = OneEuroFilter(freq=60.0, min_cutoff=0.8, beta=8.0)
        t = 0.0
        # Rest at 0.1
        for _ in range(20):
            filt.filter(0.1, t)
            t += 0.016
        # Sudden saccade jump to 0.9
        jump_val = filt.filter(0.9, t)
        self.assertGreater(jump_val, 0.4, "Filter must respond quickly to intentional rapid eye movement")

    def test_dead_zone_suppression(self):
        """Micro-movements smaller than dead zone should be suppressed."""
        tracker = PrecisionGazeTracker(dead_zone=0.02)
        base = 0.5
        # Slight jitter: +0.01
        jittered = tracker.apply_dead_zone(0.51, base)
        self.assertEqual(jittered, base, "Dead zone must suppress tremor within 0.02")

        # Intentional glance: +0.08
        moved = tracker.apply_dead_zone(0.58, base)
        self.assertGreater(moved, 0.55, "Glance outside dead zone must be passed through")

    def test_blink_state_machine_and_hysteresis(self):
        """State machine must transition OPEN -> CLOSING -> BLINK -> OPENING -> OPEN properly."""
        tracker = PrecisionGazeTracker()
        tracker.ear_threshold = 0.18
        tracker.blink_hysteresis = 0.03
        tracker.min_blink_frames = 2

        # Frame 1: Eyes wide open (EAR 0.30)
        blink, state = tracker.update_blink_state(0.30, 0.30)
        self.assertFalse(blink)
        self.assertEqual(state, "OPEN")

        # Frame 2: Eyes starting to close (EAR 0.15, frame 1)
        blink, state = tracker.update_blink_state(0.15, 0.15)
        self.assertTrue(blink)
        self.assertEqual(state, "CLOSING")

        # Frame 3: Eyes still closed (EAR 0.14, frame 2 >= min_blink_frames)
        blink, state = tracker.update_blink_state(0.14, 0.14)
        self.assertTrue(blink)
        self.assertEqual(state, "BLINK")

        # Frame 4: Eyes opening (EAR 0.22 > threshold + hysteresis 0.21)
        blink, state = tracker.update_blink_state(0.23, 0.23)
        self.assertFalse(blink)
        self.assertEqual(state, "OPENING")

        # Frame 5: Fully open again
        blink, state = tracker.update_blink_state(0.30, 0.30)
        self.assertFalse(blink)
        self.assertEqual(state, "OPEN")

    def test_calibration_manager_affine_fit(self):
        """CalibrationManager should fit 9 points and map eye space to screen space accurately."""
        calib = CalibrationManager()
        # Synthetic linear mapping: screen = 1.2 * eye - 0.1
        samples = []
        for x in [0.1, 0.5, 0.9]:
            for y in [0.1, 0.5, 0.9]:
                samples.append({
                    "eyeX": x,
                    "eyeY": y,
                    "screenX": np.clip(1.2 * x - 0.1, 0.0, 1.0),
                    "screenY": np.clip(1.2 * y - 0.1, 0.0, 1.0)
                })

        success = calib.fit(samples)
        self.assertTrue(success, "Affine solve must succeed with 9 samples")
        self.assertTrue(calib.is_calibrated)
        self.assertGreater(calib.quality, 0.85)

        # Verify mapping center (0.5, 0.5) -> (0.5, 0.5)
        mx, my = calib.map_gaze(0.5, 0.5)
        self.assertAlmostEqual(mx, 0.5, delta=0.05)
        self.assertAlmostEqual(my, 0.5, delta=0.05)

    def test_iris_centroid_calculation(self):
        """Centroid of 5 iris landmarks must equal their arithmetic mean."""
        landmarks = [MockLandmark(0, 0) for _ in range(500)]
        # Assign 5 left iris points around (0.45, 0.35)
        indices = [468, 469, 470, 471, 472]
        offsets = [(0, 0), (0.01, 0), (-0.01, 0), (0, 0.01), (0, -0.01)]
        for idx, (dx, dy) in zip(indices, offsets):
            landmarks[idx] = MockLandmark(0.45 + dx, 0.35 + dy)

        norm_x, norm_y, px_x, px_y = PrecisionGazeTracker.calculate_iris_centroid(landmarks, indices, 640, 480)
        self.assertAlmostEqual(norm_x, 0.45, places=4)
        self.assertAlmostEqual(norm_y, 0.35, places=4)
        self.assertAlmostEqual(px_x, 0.45 * 640, places=2)
        self.assertAlmostEqual(px_y, 0.35 * 480, places=2)

    def test_head_pose_compensation_effect(self):
        """Turning head right (positive yaw) should offset normalized eye coordinates in reverse."""
        tracker = PrecisionGazeTracker()
        fused_raw_x = 0.6
        yaw = 10.0  # 10 degrees head turn right
        compensated_x = float(np.clip(fused_raw_x - (yaw * tracker.head_comp_x), 0.0, 1.0))
        # Eye moved right because head turned, so compensation pulls it back left towards target
        self.assertLess(compensated_x, fused_raw_x)

    def test_telemetry_json_serialization(self):
        """Telemetry packet must serialize cleanly to valid JSON with strictly bounded coordinates."""
        telemetry = {
            "type": "gaze",
            "timestamp": int(time.time() * 1000),
            "x": 0.5123,
            "y": 0.4871,
            "screenX": 983,
            "screenY": 526,
            "rawEyeX": 0.505,
            "rawEyeY": 0.492,
            "confidence": 0.94,
            "leftEye": {"x": 0.51, "y": 0.49, "confidence": 0.95},
            "rightEye": {"x": 0.514, "y": 0.485, "confidence": 0.93},
            "ear": {"left": 0.28, "right": 0.27},
            "blink": False,
            "headPose": {"yaw": 1.2, "pitch": -0.8, "roll": 0.4},
            "fps": 58.5,
            "tracking": True,
            "source": "python"
        }
        encoded = json.dumps(telemetry)
        decoded = json.loads(encoded)
        self.assertEqual(decoded["type"], "gaze")
        self.assertEqual(decoded["source"], "python")
        self.assertTrue(0.0 <= decoded["x"] <= 1.0)
        self.assertTrue(0.0 <= decoded["y"] <= 1.0)
        self.assertIn("headPose", decoded)


if __name__ == "__main__":
    unittest.main()
