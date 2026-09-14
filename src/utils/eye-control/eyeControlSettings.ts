export type EyeControlState =
  | 'IDLE'
  | 'REQUESTING_CAMERA'
  | 'ALIGNING'
  | 'READY'
  | 'PAUSED'
  | 'ERROR';

export type EyeDirection = 'CENTER' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';

export interface EyeDirectionEvent {
  direction: EyeDirection;
  confidence: number;
  blink: boolean;
  blinkComplete: boolean;
  ear: number;
  x: number;
  y: number;
  neutralX: number;
  neutralY: number;
  faceDetected: boolean;
  calibrated: boolean;
  calibPhase: string;
  fps: number;
  source: 'python' | 'browser';
}

export interface DirectionalEyeSettings {
  speechEnabled: boolean;
  speechRate: 'slow' | 'normal' | 'fast';
  doubleBinkWindowMs: number;   // time window for double blink (ms)
  horizontalThreshold: number;  // normalized, enter threshold
  verticalThreshold: number;
  devMode: boolean;
}

export const DEFAULT_DIRECTIONAL_SETTINGS: DirectionalEyeSettings = {
  speechEnabled: true,
  speechRate: 'normal',
  doubleBinkWindowMs: 700,
  horizontalThreshold: 0.10,
  verticalThreshold: 0.08,
  devMode: false,
};

const SETTINGS_KEY   = 'gone-directional-eye-settings';
const CALIB_KEY      = 'gone-directional-calib';

export function loadDirectionalSettings(): DirectionalEyeSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_DIRECTIONAL_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_DIRECTIONAL_SETTINGS };
}

export function saveDirectionalSettings(s: DirectionalEyeSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export function saveNeutralCalib(x: number, y: number): void {
  localStorage.setItem(CALIB_KEY, JSON.stringify({ x, y }));
}

export function loadNeutralCalib(): { x: number; y: number } | null {
  try {
    const raw = localStorage.getItem(CALIB_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function clearNeutralCalib(): void {
  localStorage.removeItem(CALIB_KEY);
}
