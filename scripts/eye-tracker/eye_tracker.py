#!/usr/bin/env python3
"""
G-ONE Directional Eye Control  —  Production
=============================================
Calibrated for real MediaPipe iris landmark values.
Real measurements on this machine:
  - EAR open mean ≈ 0.45, blink threshold at 70% ≈ 0.32
  - Iris X raw range ≈ 0.40–0.55 (raw normalized coords)

Key fixes:
  1. EAR threshold calibrated dynamically from user's real open-eye EAR
  2. LEFT/RIGHT correct: looking left → iris raw-X increases (mirror) → negate dx
  3. Direction uses raw iris X (not socket-relative) for simplicity and accuracy
  4. Rich debug overlay: shows EAR value, threshold, dx/dy live
"""

import sys, time, json, asyncio, threading, math
from typing import Optional, Dict, Any, List, Tuple
import numpy as np

try:
    import cv2
    import mediapipe as mp
    import websockets
except ImportError as e:
    print(f"[FATAL] Missing: {e}"); sys.exit(1)

# ─── Tuning ──────────────────────────────────────────────────────────────────
WS_HOST = "0.0.0.0"
WS_PORT = 8765
CAM_INDEX = 0

# Direction thresholds — applied to RAW iris X/Y (MediaPipe 0..1 coords)
# Real iris X range is ~0.15 wide. 0.020 = small deliberate glance.
DIR_H_ENTER = 0.022   # horizontal: enter LEFT/RIGHT when |dx| > this
DIR_H_EXIT  = 0.010   # return to CENTER when |dx| < this
DIR_V_ENTER = 0.018   # vertical: enter UP/DOWN
DIR_V_EXIT  = 0.008

# Blink: ratio of open-eye EAR below which a blink is counted
BLINK_RATIO     = 0.70   # blink_thr = open_ear * 0.70
BLINK_HYS_ADD   = 0.04   # re-open hysteresis above blink_thr
MIN_BLINK_FRAMES = 2     # frames eye must be below thr to count
MAX_BLINK_FRAMES = 30    # > 1s = not a blink (deliberate closure)

# Calibration
CALIB_SECONDS = 2.5      # collect for this long
CALIB_FRAMES  = 45       # or until this many good frames
CALIB_EAR_RATIO = 0.75   # discard frames where EAR < open_ear * 0.75

# MediaPipe landmark indices
LEFT_IRIS  = [468, 469, 470, 471, 472]
RIGHT_IRIS = [473, 474, 475, 476, 477]
L_TOP=159; L_BOT=145; L_OUT=33;  L_IN=133
R_TOP=386; R_BOT=374; R_IN=362;  R_OUT=263


# ─── Utilities ───────────────────────────────────────────────────────────────
class LowPass:
    def __init__(self, alpha=0.20):
        self.alpha = alpha; self.v: Optional[float] = None
    def update(self, x: float) -> float:
        self.v = x if self.v is None else self.alpha*x + (1-self.alpha)*self.v
        return self.v
    def reset(self): self.v = None


def iris_center(lm, indices) -> Tuple[float, float]:
    return (float(np.mean([lm[i].x for i in indices])),
            float(np.mean([lm[i].y for i in indices])))


def calc_ear(lm, top, bot, out, inn, w, h) -> float:
    p = lambda i: np.array([lm[i].x*w, lm[i].y*h])
    v  = np.linalg.norm(p(top) - p(bot))
    hh = np.linalg.norm(p(out) - p(inn))
    return float(v / hh) if hh > 1e-6 else 0.30


# ─── Tracker ─────────────────────────────────────────────────────────────────
class EyeTracker:
    def __init__(self):
        self.fm = mp.solutions.face_mesh.FaceMesh(
            max_num_faces=1, refine_landmarks=True,
            min_detection_confidence=0.55, min_tracking_confidence=0.55)

        # ── Calibration state
        self.calibrated   = False
        self.calib_phase  = "waiting"   # waiting | collecting | done
        self.calib_t0     : Optional[float] = None
        self.sx_buf: List[float] = []
        self.sy_buf: List[float] = []
        self.ear_buf: List[float] = []

        # ── Calibrated neutral
        self.nx = 0.5           # neutral iris X
        self.ny = 0.5           # neutral iris Y
        self.ear_open  = 0.45   # updated from calibration
        self.blink_thr = self.ear_open * BLINK_RATIO
        self.calib_ear_min = self.ear_open * CALIB_EAR_RATIO

        # ── Smoothing
        self.lpx = LowPass(0.25)
        self.lpy = LowPass(0.25)

        # ── Direction state
        self.direction = "CENTER"
        self.dx = 0.0; self.dy = 0.0

        # ── Blink state machine
        self.blink_state   = "OPEN"
        self.blink_frames  = 0
        self.blink_ok      = False   # True for exactly one frame on blink-complete
        self.last_ear      = 0.40

        # ── FPS
        self.fps = 0.0; self.fc = 0; self.ft = time.time()

    # ── Blink SM ─────────────────────────────────────────────────────────────
    def update_blink(self, ear: float):
        self.blink_ok = False
        thr = self.blink_thr; hys = BLINK_HYS_ADD
        if ear < thr:
            self.blink_frames += 1
            self.blink_state = "BLINK" if self.blink_frames >= MIN_BLINK_FRAMES else "CLOSING"
        elif ear > thr + hys:
            if self.blink_state in ("BLINK", "CLOSING"):
                if MIN_BLINK_FRAMES <= self.blink_frames <= MAX_BLINK_FRAMES:
                    self.blink_ok = True
                    print(f"[BLINK] ✓  EAR={ear:.3f}  frames={self.blink_frames}")
            self.blink_state = "OPEN"
            self.blink_frames = 0
        # hysteresis band — don't change state

    def is_blinking(self): return self.blink_state in ("BLINK","CLOSING")

    # ── Calibration ──────────────────────────────────────────────────────────
    def calib_feed(self, sx, sy, ear, now) -> bool:
        if ear < self.calib_ear_min:
            return False
        if self.calib_phase == "waiting":
            self.calib_t0   = now
            self.calib_phase = "collecting"
            self.sx_buf.clear(); self.sy_buf.clear(); self.ear_buf.clear()

        self.sx_buf.append(sx); self.sy_buf.append(sy); self.ear_buf.append(ear)
        elapsed = now - self.calib_t0

        if elapsed >= CALIB_SECONDS and len(self.sx_buf) >= CALIB_FRAMES:
            self._finish_calib()
            return True
        if elapsed > 20:   # force finish
            self._finish_calib(); return True
        return False

    def _finish_calib(self):
        self.nx = float(np.median(self.sx_buf))
        self.ny = float(np.median(self.sy_buf))
        if self.ear_buf:
            # Use 30th percentile as the typical open-eye level (conservative)
            self.ear_open  = float(np.percentile(self.ear_buf, 30))
            self.blink_thr = self.ear_open * BLINK_RATIO
            self.calib_ear_min = self.ear_open * CALIB_EAR_RATIO
        self.calibrated  = True
        self.calib_phase = "done"
        self.lpx.reset(); self.lpy.reset()
        print(f"[Calib] nx={self.nx:.4f}  ny={self.ny:.4f}")
        print(f"[Calib] EAR open={self.ear_open:.3f}  blink_thr={self.blink_thr:.3f}")

    def recalibrate(self):
        self.calibrated = False; self.calib_phase = "waiting"
        self.sx_buf.clear(); self.sy_buf.clear(); self.ear_buf.clear()
        self.lpx.reset(); self.lpy.reset()
        self.direction = "CENTER"; self.dx = 0; self.dy = 0
        print("[Calib] Recalibrating...")

    # ── Direction ─────────────────────────────────────────────────────────────
    def classify(self, sx, sy) -> str:
        """
        sx, sy: smoothed raw iris position (0..1 MediaPipe coords).
        When image is flipped with cv2.flip(1):
          user looks LEFT  → iris raw-X INCREASES (mirror effect)
          user looks RIGHT → iris raw-X DECREASES
        So we NEGATE dx to get intuitive mapping.
        """
        self.dx = -(sx - self.nx)   # negate for flip correction
        self.dy =   sy - self.ny    # UP = negative dy (y=0 at top)

        prev = self.direction

        if prev == "CENTER":
            if   self.dx < -DIR_H_ENTER: return "LEFT"
            elif self.dx >  DIR_H_ENTER: return "RIGHT"
            elif self.dy < -DIR_V_ENTER: return "UP"
            elif self.dy >  DIR_V_ENTER: return "DOWN"
            return "CENTER"
        else:
            # Hysteresis exit
            if prev == "LEFT"  and self.dx > -DIR_H_EXIT:
                return "RIGHT" if self.dx >  DIR_H_ENTER else "CENTER"
            if prev == "RIGHT" and self.dx <  DIR_H_EXIT:
                return "LEFT"  if self.dx < -DIR_H_ENTER else "CENTER"
            if prev == "UP"    and self.dy > -DIR_V_EXIT:
                return "DOWN"  if self.dy >  DIR_V_ENTER else "CENTER"
            if prev == "DOWN"  and self.dy <  DIR_V_EXIT:
                return "UP"    if self.dy < -DIR_V_ENTER else "CENTER"
            # Cross-transition
            if   self.dx < -DIR_H_ENTER: return "LEFT"
            elif self.dx >  DIR_H_ENTER: return "RIGHT"
            elif self.dy < -DIR_V_ENTER: return "UP"
            elif self.dy >  DIR_V_ENTER: return "DOWN"
            return prev

    # ── Per-frame ─────────────────────────────────────────────────────────────
    def process(self, frame: np.ndarray) -> Tuple[np.ndarray, Dict]:
        h, w = frame.shape[:2]; now = time.time()

        # FPS
        self.fc += 1
        if now - self.ft >= 0.5:
            self.fps = self.fc / (now - self.ft); self.fc = 0; self.ft = now

        frame = cv2.flip(frame, 1)
        results = self.fm.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

        pkt: Dict = {
            "type":"eye_direction", "direction":"CENTER",
            "x":self.nx, "y":self.ny, "confidence":0.0,
            "blink":False, "blinkComplete":False,
            "ear": round(self.last_ear,3),
            "neutralX":self.nx, "neutralY":self.ny,
            "faceDetected":False, "calibrated":self.calibrated,
            "calibPhase":self.calib_phase, "fps":round(self.fps,1),
        }

        if not results.multi_face_landmarks:
            cv2.putText(frame,"NO FACE",(10,40),cv2.FONT_HERSHEY_SIMPLEX,1,(0,60,255),2)
            return frame, pkt

        lm = results.multi_face_landmarks[0].landmark
        pkt["faceDetected"] = True

        # ── EAR ──────────────────────────────────────────────────────────────
        le = calc_ear(lm, L_TOP,L_BOT,L_OUT,L_IN, w,h)
        re = calc_ear(lm, R_TOP,R_BOT,R_OUT,R_IN, w,h)
        ear = (le+re)/2.0
        self.last_ear = ear
        self.update_blink(ear)
        pkt["blink"]         = self.is_blinking()
        pkt["blinkComplete"] = self.blink_ok
        pkt["ear"]           = round(ear, 3)

        # ── Iris centroids (raw MediaPipe normalized) ─────────────────────────
        lx, ly = iris_center(lm, LEFT_IRIS)
        rx, ry = iris_center(lm, RIGHT_IRIS)
        fused_x = (lx + rx) / 2.0
        fused_y = (ly + ry) / 2.0
        sx = self.lpx.update(fused_x)
        sy = self.lpy.update(fused_y)
        pkt["x"] = round(float(sx), 4)
        pkt["y"] = round(float(sy), 4)

        # Confidence
        eye_agree = 1.0 - min(abs(lx-rx)*5, 1.0)
        ear_health = max(0.0, min(1.0, (ear - self.blink_thr) / 0.10))
        conf = eye_agree * ear_health if not self.is_blinking() else 0.0
        pkt["confidence"] = round(float(conf), 2)

        # ── Calibration phase ─────────────────────────────────────────────────
        if not self.calibrated:
            if not self.is_blinking() and conf > 0.2:
                done = self.calib_feed(sx, sy, ear, now)
                if done:
                    pkt["calibrated"] = True; pkt["calibPhase"] = "done"

            # Progress bar
            n = len(self.sx_buf); pct = min(n/CALIB_FRAMES, 1.0)
            bar = int(pct*(w-40))
            cv2.rectangle(frame,(20,h-22),(20+bar,h-8),(184,255,0),-1)
            cv2.rectangle(frame,(20,h-22),(w-20,h-8),(80,80,80),1)
            msg = f"LOOK STRAIGHT — Calibrating {int(pct*100)}%"
            cv2.putText(frame,msg,(22,h-28),cv2.FONT_HERSHEY_SIMPLEX,0.5,(184,255,0),1)

            # Live EAR indicator
            cv2.putText(frame,f"EAR={ear:.3f}  thr={self.blink_thr:.3f}",
                        (10,35),cv2.FONT_HERSHEY_SIMPLEX,0.55,(200,200,100),1)
            # Iris dots
            cv2.circle(frame,(int(lx*w),int(ly*h)),5,(0,255,184),-1)
            cv2.circle(frame,(int(rx*w),int(ry*h)),5,(0,255,184),-1)
            return frame, pkt

        # ── Direction (post-calibration) ─────────────────────────────────────
        if not self.is_blinking():
            self.direction = self.classify(sx, sy)
        pkt["direction"] = self.direction
        pkt["neutralX"]  = round(self.nx, 4)
        pkt["neutralY"]  = round(self.ny, 4)

        # ── Debug overlay ─────────────────────────────────────────────────────
        # Top bar
        cv2.rectangle(frame,(0,0),(w,32),(15,15,15),-1)
        dir_col = (0,255,140) if self.direction!="CENTER" else (150,150,150)
        cv2.putText(frame,f"DIR: {self.direction:<8}",
                    (8,22),cv2.FONT_HERSHEY_SIMPLEX,0.65,dir_col,2)
        cv2.putText(frame,f"dx={self.dx:+.4f}  dy={self.dy:+.4f}",
                    (180,22),cv2.FONT_HERSHEY_SIMPLEX,0.50,(180,180,180),1)
        cv2.putText(frame,f"FPS={self.fps:.0f}",
                    (w-75,22),cv2.FONT_HERSHEY_SIMPLEX,0.50,(120,120,120),1)

        # Bottom bar — EAR + blink
        blink_col = (0,80,255) if self.is_blinking() else (130,130,130)
        if self.blink_ok: blink_col = (0,255,200)
        cv2.rectangle(frame,(0,h-30),(w,h),(15,15,15),-1)
        ear_pct = max(0.0, min(1.0, (ear - self.blink_thr) / (self.ear_open - self.blink_thr)))
        bar_w = int(ear_pct * 160)
        cv2.rectangle(frame,(120,h-22),(120+bar_w,h-10),(0,200,100),-1)
        cv2.rectangle(frame,(120,h-22),(280,h-10),(60,60,60),1)
        blink_txt = "BLINK!" if self.blink_ok else ("EYES CLOSED" if self.is_blinking() else "open")
        cv2.putText(frame,f"EAR={ear:.3f}/{self.blink_thr:.3f}  {blink_txt}",
                    (8,h-10),cv2.FONT_HERSHEY_SIMPLEX,0.45,blink_col,1)

        # Threshold indicator lines in bar
        cv2.putText(frame,f"conf={conf:.2f}",
                    (w-95,h-10),cv2.FONT_HERSHEY_SIMPLEX,0.40,(100,100,100),1)

        # Iris dots
        cv2.circle(frame,(int(lx*w),int(ly*h)),5,(0,255,184),-1)
        cv2.circle(frame,(int(rx*w),int(ry*h)),5,(0,255,184),-1)
        # Neutral crosshair
        nx_px, ny_px = int(self.nx*w), int(self.ny*h)
        cv2.drawMarker(frame,(nx_px,ny_px),(184,255,0),cv2.MARKER_CROSS,20,1)

        return frame, pkt


# ─── WebSocket ────────────────────────────────────────────────────────────────
_clients: set = set()
_lock = threading.Lock()
_pkt: Dict = {"type":"eye_direction","direction":"CENTER","blink":False,"blinkComplete":False,"fps":0}
_tracker: Optional[EyeTracker] = None

async def _ws_handler(ws):
    _clients.add(ws)
    print(f"[WS] +client  total={len(_clients)}")
    try:
        async def send():
            while True:
                with _lock: data=json.dumps(_pkt)
                await ws.send(data)
                await asyncio.sleep(0.033)
        async def recv():
            async for m in ws:
                try:
                    if json.loads(m).get("type")=="recalibrate" and _tracker:
                        _tracker.recalibrate()
                except: pass
        await asyncio.gather(send(), recv())
    except websockets.exceptions.ConnectionClosed: pass
    finally:
        _clients.discard(ws)
        print(f"[WS] -client  total={len(_clients)}")

async def _ws_main():
    async with websockets.serve(_ws_handler, WS_HOST, WS_PORT):
        print(f"[WS] ws://{WS_HOST}:{WS_PORT}")
        await asyncio.Future()   # run forever

def _run_ws(loop):
    asyncio.set_event_loop(loop)
    loop.run_until_complete(_ws_main())


# ─── Main ────────────────────────────────────────────────────────────────────
def main():
    global _tracker, _pkt
    print("="*55)
    print("  G-ONE EYE DIRECTION TRACKER")
    print(f"  Python {sys.version.split()[0]}  OpenCV {cv2.__version__}  MediaPipe {mp.__version__}")
    print("="*55)

    cap = cv2.VideoCapture(CAM_INDEX)
    if not cap.isOpened():
        print("[FATAL] Camera not available"); sys.exit(1)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)

    tracker = EyeTracker()
    _tracker = tracker

    ws_loop   = asyncio.new_event_loop()
    ws_thread = threading.Thread(target=_run_ws, args=(ws_loop,), daemon=True)
    ws_thread.start()

    cv2.namedWindow("G-ONE Eye Tracker", cv2.WINDOW_AUTOSIZE)
    print("\n[READY]  Look STRAIGHT at screen for 2-3 seconds to calibrate.")
    print("  R = recalibrate   Q/ESC = quit\n")

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                time.sleep(0.033); continue

            annotated, pkt = tracker.process(frame)

            with _lock: _pkt = pkt

            cv2.imshow("G-ONE Eye Tracker", annotated)
            k = cv2.waitKey(1) & 0xFF
            if k in (27, ord('q'), ord('Q')): break
            elif k in (ord('r'), ord('R')):   tracker.recalibrate()

    except KeyboardInterrupt:
        print("\n[Exit] Keyboard interrupt")
    finally:
        cap.release()
        cv2.destroyAllWindows()
        print("[Exit] Done")

if __name__ == "__main__":
    main()
