// src/lib/emg/emg-processing.ts
export type FatigueLevel = 'low' | 'moderate' | 'high';

export interface ProcessedEMG {
  timestamp: number;
  rawSignal: number;
  raw: number;              // alias for rawSignal to maintain compatibility
  normalized: number;       // 0 to 1
  fatigueIndex: number;     // 0 to 1
  fatigueLevel: FatigueLevel;
  strainDetected: boolean;
}

const MAX_RAW_SIGNAL = 1023; // 1023 for Arduino Uno, change to 4095 for ESP32
const FATIGUE_DECAY = 0.98;
const STRAIN_THRESHOLD = 0.85;
const FATIGUE_INCREMENT = 0.05;

export class EMGProcessor {
  private fatigueIndex = 0;
  private baselineBuffer: number[] = [];
  private baseline = 0;

  processReading(rawSignal: number, timestamp: number = Date.now()): ProcessedEMG {
    // 1. Dynamic Baseline compensation (tracking rest state)
    if (rawSignal < this.baseline + 50 || this.baselineBuffer.length < 100) {
      this.baselineBuffer.push(rawSignal);
      if (this.baselineBuffer.length > 100) this.baselineBuffer.shift();
      this.baseline = this.baselineBuffer.reduce((a, b) => a + b, 0) / this.baselineBuffer.length;
    }

    // 2. Normalization (0 to 1)
    let normalized = (rawSignal - this.baseline) / (MAX_RAW_SIGNAL - this.baseline);
    normalized = Math.max(0, Math.min(1, normalized));

    // 3. Neuromuscular Fatigue Accumulation & Decay
    if (normalized > 0.5) {
      this.fatigueIndex += (normalized - 0.5) * FATIGUE_INCREMENT;
    } else {
      this.fatigueIndex *= FATIGUE_DECAY;
    }
    this.fatigueIndex = Math.max(0, Math.min(1, this.fatigueIndex));

    // 4. Fatigue Risk Levels
    let fatigueLevel: FatigueLevel = 'low';
    if (this.fatigueIndex > 0.7) {
      fatigueLevel = 'high';
    } else if (this.fatigueIndex > 0.3) {
      fatigueLevel = 'moderate';
    }

    // 5. Strain Detection (> 85% activation)
    const strainDetected = normalized > STRAIN_THRESHOLD;

    return {
      timestamp,
      rawSignal,
      raw: rawSignal,
      normalized,
      fatigueIndex: this.fatigueIndex,
      fatigueLevel,
      strainDetected,
    };
  }

  reset() {
    this.fatigueIndex = 0;
    this.baselineBuffer = [];
    this.baseline = 0;
  }
}

// Backward-compatible utility functions
export function normalizeSignal(raw: number, max: number = MAX_RAW_SIGNAL): number {
  return Math.min(1, Math.max(0, raw / max));
}

export function computeFatigueIndex(history: number[]): number {
  if (history.length < 10) return 0;
  const overall = history.reduce((a, b) => a + b, 0) / history.length;
  const recent = history.slice(-10).reduce((a, b) => a + b, 0) / 10;
  const ratio = overall > 0 ? recent / overall : 1;
  return Math.min(1, Math.max(0, ratio - 1));
}

export function detectMuscleStrain(history: number[]): boolean {
  if (history.length < 5) return false;
  return history.slice(-5).every(v => v > STRAIN_THRESHOLD);
}

export function detectFatigueTrend(history: number[]): FatigueLevel {
  const fi = computeFatigueIndex(history);
  if (fi > 0.3) return 'high';
  if (fi > 0.1) return 'moderate';
  return 'low';
}

export function processEMGReading(raw: number, normalizedHistory: number[] = []): ProcessedEMG {
  const normalized = normalizeSignal(raw);
  const fatigueIndex = computeFatigueIndex(normalizedHistory);
  const fatigueLevel = detectFatigueTrend(normalizedHistory);
  const strainDetected = detectMuscleStrain(normalizedHistory);
  return {
    timestamp: Date.now(),
    rawSignal: raw,
    raw,
    normalized,
    fatigueIndex,
    fatigueLevel,
    strainDetected,
  };
}
