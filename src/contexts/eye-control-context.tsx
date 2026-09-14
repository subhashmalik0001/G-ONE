import React, {
  createContext, useContext, useState, useCallback, useRef, useEffect,
} from 'react';
import {
  EyeControlState,
  EyeDirection,
  EyeDirectionEvent,
  DirectionalEyeSettings,
  loadDirectionalSettings,
  saveDirectionalSettings,
  saveNeutralCalib,
  loadNeutralCalib,
} from '@/utils/eye-control/eyeControlSettings';
import { speechService } from '@/services/speechService';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DirectionalNavEvent {
  direction: Exclude<EyeDirection, 'CENTER'>;
}

export interface SelectionEvent {
  /** no payload — caller uses current selectedIndex */
}

interface DirectionalEyeContextType {
  // State
  state: EyeControlState;
  settings: DirectionalEyeSettings;
  eyeEvent: EyeDirectionEvent | null;

  // Live metrics
  direction: EyeDirection;
  confidence: number;
  fps: number;
  faceDetected: boolean;
  isBlinking: boolean;
  blinkCount: number;   // 0 or 1 — waiting for double blink
  calibrated: boolean;
  source: 'python' | 'browser' | 'none';
  pythonConnected: boolean;

  // Navigation
  selectedIndex: number;
  lastNavDirection: Exclude<EyeDirection, 'CENTER'> | null;

  // Callbacks
  activate: () => Promise<void>;
  deactivate: () => void;
  recalibrate: () => void;
  updateSettings: (p: Partial<DirectionalEyeSettings>) => void;
  speak: (text: string) => void;

  // Navigation override for dev/manual use
  onNavigate: (dir: Exclude<EyeDirection, 'CENTER'>) => void;
  onSelect: (idx?: number) => void;

  // Grid configuration (set by page)
  setOptions: (opts: AACOption[]) => void;
  options: AACOption[];

  lastSelectedOption: AACOption | null;
}

export interface AACOption {
  id: string;
  emoji: string;
  label: string;
  phrase: string;
  isEmergency?: boolean;
  row: number;
  col: number;
}

// ─── Grid Navigation Helper ───────────────────────────────────────────────────

function navigateGrid(
  options: AACOption[],
  currentIdx: number,
  dir: Exclude<EyeDirection, 'CENTER'>,
): number {
  if (options.length === 0) return 0;
  const cur = options[currentIdx];
  if (!cur) return 0;

  let bestIdx = currentIdx;
  let bestScore = Infinity;

  for (let i = 0; i < options.length; i++) {
    if (i === currentIdx) continue;
    const o = options[i];

    let matches = false;
    let score = 0;

    if (dir === 'RIGHT' && o.col > cur.col && o.row === cur.row) {
      matches = true; score = o.col - cur.col;
    } else if (dir === 'LEFT' && o.col < cur.col && o.row === cur.row) {
      matches = true; score = cur.col - o.col;
    } else if (dir === 'DOWN' && o.row > cur.row) {
      matches = true; score = (o.row - cur.row) * 10 + Math.abs(o.col - cur.col);
    } else if (dir === 'UP' && o.row < cur.row) {
      matches = true; score = (cur.row - o.row) * 10 + Math.abs(o.col - cur.col);
    }

    if (matches && score < bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }

  return bestIdx;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const DirectionalEyeContext = createContext<DirectionalEyeContextType | null>(null);

// How long a direction must be held before we fire a nav event
const DIR_HOLD_MS = 180;
// After firing a nav event, must return to CENTER before next nav
const RETURN_TO_CENTER_REQUIRED = true;

export function DirectionalEyeProvider({ children }: { children: React.ReactNode }) {
  const [state,            setState]            = useState<EyeControlState>('IDLE');
  const [settings,         setSettings]         = useState(loadDirectionalSettings);
  const [eyeEvent,         setEyeEvent]         = useState<EyeDirectionEvent | null>(null);
  const [direction,        setDirection]        = useState<EyeDirection>('CENTER');
  const [confidence,       setConfidence]       = useState(0);
  const [fps,              setFps]              = useState(0);
  const [faceDetected,     setFaceDetected]     = useState(false);
  const [isBlinking,       setIsBlinking]       = useState(false);
  const [blinkCount,       setBlinkCount]       = useState(0);
  const [calibrated,       setCalibrated]       = useState(false);
  const [source,           setSource]           = useState<'python' | 'browser' | 'none'>('none');
  const [pythonConnected,  setPythonConnected]  = useState(false);
  const [selectedIndex,    setSelectedIndex]    = useState(0);
  const [lastNavDirection, setLastNavDirection] = useState<Exclude<EyeDirection, 'CENTER'> | null>(null);
  const [options,          setOptions]          = useState<AACOption[]>([]);
  const [lastSelectedOption, setLastSelectedOption] = useState<AACOption | null>(null);

  // Refs
  const wsRef             = useRef<WebSocket | null>(null);
  const pythonActiveRef   = useRef(false);
  const settingsRef       = useRef(settings);
  const optionsRef        = useRef(options);
  const selectedIdxRef    = useRef(selectedIndex);
  const directionRef      = useRef<EyeDirection>('CENTER');
  const stateRef          = useRef<EyeControlState>('IDLE');

  // Direction hold tracking
  const dirHoldStartRef   = useRef<number | null>(null);
  const navFiredRef       = useRef(false);    // did we fire a nav event for current held direction?
  const returnedToCenter  = useRef(true);     // did user return to CENTER after last nav?

  // Blink double-blink tracking
  const firstBlinkTimeRef  = useRef<number | null>(null);
  const prevBlinkRef       = useRef(false);   // was blinking on last frame?
  const selectionCooldown  = useRef(false);

  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { optionsRef.current = options; }, [options]);
  useEffect(() => { selectedIdxRef.current = selectedIndex; }, [selectedIndex]);
  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => { stateRef.current = state; }, [state]);

  // ── Speech ────────────────────────────────────────────────────────────────
  const speak = useCallback((text: string) => {
    if (!settingsRef.current.speechEnabled) return;
    const rateKey = settingsRef.current.speechRate;
    speechService.speak(text, rateKey);
  }, []);

  // ── Selection ─────────────────────────────────────────────────────────────
  const onSelect = useCallback((idx?: number) => {
    if (selectionCooldown.current) return;
    const i = idx ?? selectedIdxRef.current;
    const opt = optionsRef.current[i];
    if (!opt) return;

    setLastSelectedOption(opt);
    speak(opt.phrase);

    selectionCooldown.current = true;
    setTimeout(() => { selectionCooldown.current = false; }, 1500);

    // Reset blink state
    firstBlinkTimeRef.current = null;
    setBlinkCount(0);
  }, [speak]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const onNavigate = useCallback((dir: Exclude<EyeDirection, 'CENTER'>) => {
    setSelectedIndex(prev => {
      const next = navigateGrid(optionsRef.current, prev, dir);
      selectedIdxRef.current = next;
      return next;
    });
    setLastNavDirection(dir);
  }, []);

  // ── Core telemetry processing ─────────────────────────────────────────────
  const processTelemetry = useCallback((evt: EyeDirectionEvent) => {
    if (stateRef.current === 'IDLE' || stateRef.current === 'ERROR') return;

    setEyeEvent(evt);
    setConfidence(evt.confidence);
    setFps(evt.fps);
    setFaceDetected(evt.faceDetected);
    setIsBlinking(evt.blink);

    const dir = evt.direction as EyeDirection;
    setDirection(dir);

    // ── Calibration phase ────────────────────────────────────────────────
    if (!evt.calibrated) {
      if (stateRef.current !== 'ALIGNING') {
        stateRef.current = 'ALIGNING';
        setState('ALIGNING');
      }
      return;
    }

    if (!calibrated) {
      setCalibrated(true);
      if (stateRef.current === 'ALIGNING') {
        stateRef.current = 'READY';
        setState('READY');
      }
    }

    if (stateRef.current !== 'READY') return;

    const now = Date.now();

    // ── Double-blink detection ─────────────────────────────────────────────
    // blinkComplete fires for exactly one packet when a complete blink cycle ends
    if (evt.blinkComplete && !selectionCooldown.current && evt.faceDetected && evt.confidence > 0.3) {
      if (firstBlinkTimeRef.current === null) {
        // First blink recorded
        firstBlinkTimeRef.current = now;
        setBlinkCount(1);
      } else {
        const elapsed = now - firstBlinkTimeRef.current;
        if (elapsed <= settingsRef.current.doubleBinkWindowMs) {
          // Double blink!
          firstBlinkTimeRef.current = null;
          setBlinkCount(0);
          onSelect();
        } else {
          // Too slow — treat as new first blink
          firstBlinkTimeRef.current = now;
          setBlinkCount(1);
        }
      }
    }

    // Clear first blink if window expired
    if (firstBlinkTimeRef.current !== null &&
        (now - firstBlinkTimeRef.current) > settingsRef.current.doubleBinkWindowMs * 1.5) {
      firstBlinkTimeRef.current = null;
      setBlinkCount(0);
    }

    // ── Directional navigation ────────────────────────────────────────────
    if (dir === 'CENTER') {
      returnedToCenter.current = true;
      dirHoldStartRef.current = null;
      navFiredRef.current = false;
    } else {
      // Non-center direction
      if (!returnedToCenter.current) {
        // Must return to center before another nav event
        return;
      }

      if (dirHoldStartRef.current === null) {
        dirHoldStartRef.current = now;
        navFiredRef.current = false;
      }

      const heldMs = now - dirHoldStartRef.current;
      if (!navFiredRef.current && heldMs >= DIR_HOLD_MS) {
        // Fire nav event
        navFiredRef.current = true;
        returnedToCenter.current = false;
        onNavigate(dir as Exclude<EyeDirection, 'CENTER'>);
      }
    }
  }, [calibrated, onNavigate, onSelect]);

  // ── Python WebSocket ──────────────────────────────────────────────────────
  const connectPython = useCallback(() => {
    if (wsRef.current) {
      try { wsRef.current.close(); } catch {}
      wsRef.current = null;
    }

    const ws = new WebSocket('ws://localhost:8765');
    wsRef.current = ws;

    ws.onopen = () => {
      pythonActiveRef.current = true;
      setPythonConnected(true);
      setSource('python');
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type !== 'eye_direction') return;
        const evt: EyeDirectionEvent = { ...data, source: 'python' };
        processTelemetry(evt);
      } catch {}
    };

    ws.onerror = () => {
      pythonActiveRef.current = false;
      setPythonConnected(false);
      if (source === 'python') setSource('browser');
    };

    ws.onclose = () => {
      pythonActiveRef.current = false;
      setPythonConnected(false);
      if (source === 'python') setSource('browser');
    };
  }, [processTelemetry, source]);

  // ── Browser Fallback Eye Tracker ──────────────────────────────────────────
  const streamRef  = useRef<MediaStream | null>(null);
  const videoRef   = useRef<HTMLVideoElement | null>(null);
  const canvasRef  = useRef<HTMLCanvasElement | null>(null);
  const rafRef     = useRef(0);
  // Browser neutral calibration
  const brNeutralX = useRef(0.5);
  const brNeutralY = useRef(0.5);
  const brCalibSamplesX = useRef<number[]>([]);
  const brCalibSamplesY = useRef<number[]>([]);
  const brCalibrated = useRef(false);
  const brLpX = useRef(0.5);
  const brLpY = useRef(0.5);
  const brFps = useRef(0);
  const brFrames = useRef(0);
  const brFpsT = useRef(Date.now());

  const runBrowserTracker = useCallback((video: HTMLVideoElement) => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width  = 320;
      canvasRef.current.height = 240;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    brCalibrated.current = false;
    brCalibSamplesX.current = [];
    brCalibSamplesY.current = [];

    const ALPHA = 0.25;
    const H_ENTER = settingsRef.current.horizontalThreshold;
    const V_ENTER = settingsRef.current.verticalThreshold;
    const H_EXIT  = H_ENTER * 0.5;
    const V_EXIT  = V_ENTER * 0.5;
    let brDirection: EyeDirection = 'CENTER';

    let lastBlinkComplete = false;
    let wasLowLum = false;
    let lowLumFrames = 0;

    const tick = () => {
      if (!streamRef.current || !videoRef.current) return;
      if (pythonActiveRef.current) { rafRef.current = requestAnimationFrame(tick); return; }

      const now = Date.now();
      brFrames.current++;
      if (now - brFpsT.current >= 500) {
        brFps.current = Math.round(brFrames.current * 1000 / (now - brFpsT.current));
        brFrames.current = 0;
        brFpsT.current = now;
      }

      if (video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, 320, 240);
        const img = ctx.getImageData(0, 0, 320, 240);
        const data = img.data;

        // Simple skin detection for face bounding
        let minX = 320, maxX = 0, minY = 240, maxY = 0, skinCount = 0;
        for (let y = 15; y < 225; y += 4) {
          for (let x = 15; x < 305; x += 4) {
            const idx = (y * 320 + x) * 4;
            const r = data[idx], g = data[idx+1], b = data[idx+2];
            if (r > 60 && g > 40 && b > 20 && r > b && (r - g) > 10 && Math.abs(r - g) < 130) {
              skinCount++;
              if (x < minX) minX = x; if (x > maxX) maxX = x;
              if (y < minY) minY = y; if (y > maxY) maxY = y;
            }
          }
        }

        const faceOk = skinCount > 200 && (maxX - minX) > 50 && (maxY - minY) > 60;

        if (faceOk) {
          const fw = maxX - minX, fh = maxY - minY;

          const findPupil = (box: { x1: number; x2: number; y1: number; y2: number }) => {
            let minLum = 255;
            for (let y = box.y1; y < box.y2; y += 2) for (let x = box.x1; x < box.x2; x += 2) {
              const i = (y * 320 + x) * 4;
              const l = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
              if (l < minLum) minLum = l;
            }
            const thr = minLum + 25;
            let sx = 0, sy = 0, cnt = 0;
            for (let y = box.y1; y < box.y2; y += 2) for (let x = box.x1; x < box.x2; x += 2) {
              const i = (y * 320 + x) * 4;
              const l = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
              if (l <= thr) { const w = thr - l + 1; sx += x * w; sy += y * w; cnt += w; }
            }
            if (cnt > 0) {
              return {
                relX: (sx / cnt - box.x1) / Math.max(1, box.x2 - box.x1),
                relY: (sy / cnt - box.y1) / Math.max(1, box.y2 - box.y1),
                valid: true,
                avgLum: minLum
              };
            }
            return { relX: 0.5, relY: 0.5, valid: false, avgLum: minLum };
          };

          const lEye = findPupil({ x1: Math.floor(minX + fw * 0.16), x2: Math.floor(minX + fw * 0.44), y1: Math.floor(minY + fh * 0.25), y2: Math.floor(minY + fh * 0.48) });
          const rEye = findPupil({ x1: Math.floor(minX + fw * 0.56), x2: Math.floor(minX + fw * 0.84), y1: Math.floor(minY + fh * 0.25), y2: Math.floor(minY + fh * 0.48) });

          // Blink detection via eye region luminance
          const isBlink = !lEye.valid && !rEye.valid;
          const blinkNow = isBlink;
          lowLumFrames = blinkNow ? lowLumFrames + 1 : 0;
          const blinkComplete = !blinkNow && wasLowLum && lowLumFrames >= 2;
          wasLowLum = blinkNow;
          lastBlinkComplete = blinkComplete;

          if (!isBlink && lEye.valid && rEye.valid) {
            const rx = (lEye.relX + rEye.relX) / 2;
            const ry = (lEye.relY + rEye.relY) / 2;
            brLpX.current = ALPHA * rx + (1 - ALPHA) * brLpX.current;
            brLpY.current = ALPHA * ry + (1 - ALPHA) * brLpY.current;

            // Calibration
            if (!brCalibrated.current) {
              brCalibSamplesX.current.push(brLpX.current);
              brCalibSamplesY.current.push(brLpY.current);
              if (brCalibSamplesX.current.length >= 30) {
                const sortX = [...brCalibSamplesX.current].sort((a,b) => a-b);
                const sortY = [...brCalibSamplesY.current].sort((a,b) => a-b);
                const mid = Math.floor(sortX.length / 2);
                brNeutralX.current = sortX[mid];
                brNeutralY.current = sortY[mid];
                brCalibrated.current = true;
              }
            }

            // Direction
            if (brCalibrated.current) {
              const dx = brLpX.current - brNeutralX.current;
              const dy = brLpY.current - brNeutralY.current;
              let newDir: EyeDirection;
              if (brDirection === 'CENTER') {
                if (dx < -H_ENTER) newDir = 'LEFT';
                else if (dx > H_ENTER) newDir = 'RIGHT';
                else if (dy < -V_ENTER) newDir = 'UP';
                else if (dy > V_ENTER) newDir = 'DOWN';
                else newDir = 'CENTER';
              } else {
                const exitH = brDirection === 'LEFT' ? dx > -H_EXIT : brDirection === 'RIGHT' ? dx < H_EXIT : false;
                const exitV = brDirection === 'UP' ? dy > -V_EXIT : brDirection === 'DOWN' ? dy < V_EXIT : false;
                if ((exitH && (brDirection === 'LEFT' || brDirection === 'RIGHT')) ||
                    (exitV && (brDirection === 'UP' || brDirection === 'DOWN'))) {
                  newDir = 'CENTER';
                } else {
                  newDir = brDirection;
                }
              }
              brDirection = newDir;
            }
          }

          const brEvt: EyeDirectionEvent = {
            type: 'eye_direction' as any,
            direction: brCalibrated.current ? brDirection : 'CENTER',
            x: brLpX.current,
            y: brLpY.current,
            confidence: faceOk ? 0.6 : 0,
            blink: isBlink,
            blinkComplete: lastBlinkComplete,
            ear: 0.25,
            neutralX: brNeutralX.current,
            neutralY: brNeutralY.current,
            faceDetected: faceOk,
            calibrated: brCalibrated.current,
            calibPhase: brCalibrated.current ? 'done' : 'collecting',
            fps: brFps.current,
            source: 'browser',
          };
          processTelemetry(brEvt);
        } else {
          processTelemetry({
            type: 'eye_direction' as any,
            direction: 'CENTER',
            x: 0.5, y: 0.5,
            confidence: 0, blink: false, blinkComplete: false,
            ear: 0.3, neutralX: 0.5, neutralY: 0.5,
            faceDetected: false, calibrated: false, calibPhase: 'waiting',
            fps: brFps.current, source: 'browser',
          });
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [processTelemetry]);

  // ── Activate / Deactivate ─────────────────────────────────────────────────
  const activate = useCallback(async () => {
    stateRef.current = 'REQUESTING_CAMERA';
    setState('REQUESTING_CAMERA');
    setCalibrated(false);
    setSource('none');

    // Always try Python first
    connectPython();

    // Also request camera for browser fallback
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;

      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay  = true;
      video.playsInline = true;
      video.muted     = true;
      Object.assign(video.style, {
        position: 'fixed', top: '-9999px', left: '-9999px',
        width: '1px', height: '1px', opacity: '0.001', pointerEvents: 'none',
      });
      document.body.appendChild(video);
      videoRef.current = video;
      await new Promise<void>(r => { video.onloadedmetadata = () => r(); setTimeout(r, 2000); });
      await video.play().catch(() => {});
      setSource('browser');
      stateRef.current = 'ALIGNING';
      setState('ALIGNING');
      runBrowserTracker(video);
    } catch {
      stateRef.current = 'ERROR';
      setState('ERROR');
    }
  }, [connectPython, runBrowserTracker]);

  const deactivate = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (wsRef.current) { try { wsRef.current.close(); } catch {} wsRef.current = null; }
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      try { videoRef.current.remove(); } catch {}
      videoRef.current = null;
    }
    stateRef.current = 'IDLE';
    setState('IDLE');
    setCalibrated(false);
    setDirection('CENTER');
    setSource('none');
    setPythonConnected(false);
    pythonActiveRef.current = false;
    setBlinkCount(0);
    firstBlinkTimeRef.current = null;
  }, []);

  const recalibrate = useCallback(() => {
    // Tell Python to recalibrate
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'recalibrate' }));
    }
    // Reset browser calibration
    brCalibrated.current = false;
    brCalibSamplesX.current = [];
    brCalibSamplesY.current = [];
    setCalibrated(false);
    stateRef.current = 'ALIGNING';
    setState('ALIGNING');
    setDirection('CENTER');
    setBlinkCount(0);
    firstBlinkTimeRef.current = null;
    returnedToCenter.current = true;
    dirHoldStartRef.current  = null;
    navFiredRef.current      = false;
  }, []);

  const updateSettings = useCallback((p: Partial<DirectionalEyeSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...p };
      saveDirectionalSettings(next);
      return next;
    });
  }, []);

  return (
    <DirectionalEyeContext.Provider value={{
      state, settings, eyeEvent,
      direction, confidence, fps, faceDetected, isBlinking, blinkCount,
      calibrated, source, pythonConnected,
      selectedIndex, lastNavDirection,
      activate, deactivate, recalibrate, updateSettings, speak,
      onNavigate, onSelect,
      setOptions, options,
      lastSelectedOption,
    }}>
      {children}
    </DirectionalEyeContext.Provider>
  );
}

export function useDirectionalEye() {
  const ctx = useContext(DirectionalEyeContext);
  if (!ctx) throw new Error('useDirectionalEye must be used within DirectionalEyeProvider');
  return ctx;
}
