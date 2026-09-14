import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, Volume2, Wifi, WifiOff, RefreshCw, Settings, Bug } from 'lucide-react';
import { useDirectionalEye, AACOption } from '@/contexts/eye-control-context';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

// ─── AAC Options grid definition ──────────────────────────────────────────────
const AAC_OPTIONS: AACOption[] = [
  { id: 'water',     emoji: '💧', label: 'WATER',     phrase: 'I would like some water, please.',              row: 0, col: 0 },
  { id: 'food',      emoji: '🍽️', label: 'FOOD',      phrase: 'I am hungry. I would like something to eat.',   row: 0, col: 1 },
  { id: 'bathroom',  emoji: '🚻', label: 'BATHROOM',  phrase: 'I need help getting to the bathroom.',          row: 0, col: 2 },
  { id: 'pain',      emoji: '😣', label: 'PAIN',      phrase: 'I am in pain. Please help me.',                 row: 1, col: 0 },
  { id: 'help',      emoji: '🆘', label: 'HELP',      phrase: 'I need help urgently.',                         row: 1, col: 1, isEmergency: true },
  { id: 'medicine',  emoji: '💊', label: 'MEDICINE',  phrase: 'I need my medicine, please.',                   row: 1, col: 2 },
  { id: 'emergency', emoji: '🚨', label: 'EMERGENCY', phrase: 'Emergency! Please call for help immediately.',  row: 2, col: 1, isEmergency: true },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EyeControlPage() {
  const navigate  = useNavigate();
  const eye       = useDirectionalEye();
  const [showDevMode,   setShowDevMode]   = useState(false);
  const [showSettings,  setShowSettings]  = useState(false);
  const selectionFlashRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectionFlash, setSelectionFlash] = useState<string | null>(null);

  // Set options into context on mount
  useEffect(() => {
    eye.setOptions(AAC_OPTIONS);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Flash confirmation when something is selected
  useEffect(() => {
    if (eye.lastSelectedOption) {
      setSelectionFlash(eye.lastSelectedOption.id);
      if (selectionFlashRef.current) clearTimeout(selectionFlashRef.current);
      selectionFlashRef.current = setTimeout(() => setSelectionFlash(null), 2000);
    }
  }, [eye.lastSelectedOption]);

  const handleStart = useCallback(async () => {
    await eye.activate();
  }, [eye]);

  const isActive = eye.state !== 'IDLE' && eye.state !== 'ERROR' && eye.state !== 'REQUESTING_CAMERA';

  return (
    <DashboardLayout currentRole="patient">
      <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

        {/* ── Slim top bar ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-black/5 bg-white/80 backdrop-blur-sm">
          <button
            onClick={() => { eye.deactivate(); navigate('/tools'); }}
            className="flex items-center gap-2 text-[13px] font-bold text-[#05050a]/60 hover:text-[#05050a] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-[#05050a]">
            <Eye className="w-4 h-4 text-[#b8ff00]" />
            G-ONE Eye Control
          </div>

          <div className="flex items-center gap-2">
            {isActive && (
              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                {eye.pythonConnected
                  ? <><Wifi className="w-3.5 h-3.5 text-emerald-500" /><span className="text-emerald-600 font-bold">Python</span></>
                  : <><WifiOff className="w-3.5 h-3.5 text-amber-500" /><span className="text-amber-600 font-bold">Browser</span></>
                }
                <span className="text-[#8a8a8a]">|</span>
                <span className="text-[#8a8a8a]">{eye.fps} FPS</span>
              </div>
            )}
            <button
              onClick={() => setShowDevMode(p => !p)}
              className={`p-1.5 rounded-lg transition ${showDevMode ? 'bg-[#b8ff00]' : 'hover:bg-black/5'}`}
              title="Developer Mode"
            >
              <Bug className={`w-4 h-4 ${showDevMode ? 'text-[#05050a]' : 'text-[#8a8a8a]'}`} />
            </button>
          </div>
        </div>

        {/* ── Dev mode panel ───────────────────────────────────────────── */}
        {showDevMode && (
          <DevModePanel eye={eye} />
        )}

        {/* ── Main content ──────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
          {eye.state === 'IDLE' && (
            <WelcomeScreen onStart={handleStart} />
          )}
          {eye.state === 'REQUESTING_CAMERA' && (
            <LoadingScreen message="Requesting camera access…" />
          )}
          {eye.state === 'ALIGNING' && (
            <AlignmentScreen eye={eye} />
          )}
          {eye.state === 'ERROR' && (
            <ErrorScreen onRetry={handleStart} onBack={() => navigate('/tools')} />
          )}
          {(eye.state === 'READY' || eye.state === 'PAUSED') && (
            <AACGridScreen
              eye={eye}
              selectionFlash={selectionFlash}
            />
          )}
        </div>

        {/* ── Selection flash banner ─────────────────────────────────── */}
        <AnimatePresence>
          {eye.lastSelectedOption && selectionFlash && (
            <motion.div
              key="selection-banner"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-[#05050a] text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 max-w-md"
            >
              <Volume2 className="w-5 h-5 text-[#b8ff00] animate-pulse shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#b8ff00]">Selected & Speaking</p>
                <p className="text-[15px] font-bold mt-0.5">{eye.lastSelectedOption.emoji} {eye.lastSelectedOption.phrase}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

// ─── Welcome Screen ───────────────────────────────────────────────────────────
function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="max-w-lg w-full text-center space-y-10">
      <div className="space-y-4">
        <div className="w-24 h-24 rounded-3xl bg-[#05050a] flex items-center justify-center mx-auto shadow-2xl">
          <Eye className="w-12 h-12 text-[#b8ff00]" />
        </div>
        <h1 className="text-[40px] font-black tracking-tight text-[#05050a]">G-ONE<br />Eye Control</h1>
        <p className="text-[17px] text-[#5a5a5a] font-medium leading-relaxed">
          Use your eyes to navigate.<br />
          <strong className="text-[#05050a]">Blink twice</strong> to choose an option.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-left max-w-sm mx-auto">
        {[
          { icon: '👁️', label: 'Look left/right/up/down', sub: 'to move between options' },
          { icon: '😑', label: 'Blink twice quickly', sub: 'to select highlighted option' },
        ].map(item => (
          <div key={item.label} className="p-4 rounded-2xl bg-[#f7f7f5] border border-black/5 space-y-1">
            <span className="text-2xl">{item.icon}</span>
            <p className="text-[13px] font-black text-[#05050a]">{item.label}</p>
            <p className="text-[11px] text-[#8a8a8a] font-medium">{item.sub}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 py-5 px-8 rounded-2xl bg-[#05050a] text-[#b8ff00] font-black text-[16px] uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
      >
        <Eye className="w-5 h-5" />
        Start Eye Control
      </button>
    </div>
  );
}

// ─── Loading Screen ───────────────────────────────────────────────────────────
function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 border-4 border-[#05050a]/10 border-t-[#05050a] rounded-full animate-spin mx-auto" />
      <p className="text-[17px] font-medium text-[#5a5a5a]">{message}</p>
    </div>
  );
}

// ─── Alignment Screen ─────────────────────────────────────────────────────────
function AlignmentScreen({ eye }: { eye: ReturnType<typeof useDirectionalEye> }) {
  const [dotSize, setDotSize] = useState(1.0);
  const [collected, setCollected] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  // Animate dot pulsing
  useEffect(() => {
    let t = 0;
    intervalRef.current = setInterval(() => {
      t += 0.05;
      setDotSize(1.0 + Math.sin(t) * 0.15);
    }, 60);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Show collecting progress from eyeEvent
  useEffect(() => {
    if (eye.eyeEvent && eye.eyeEvent.calibPhase === 'collecting') {
      // Fake progress based on confidence signal
      setCollected(c => Math.min(c + (eye.faceDetected ? 3 : 0), 100));
    }
  }, [eye.eyeEvent, eye.faceDetected]);

  return (
    <div className="max-w-md w-full text-center space-y-12">
      <div className="space-y-3">
        <h2 className="text-[32px] font-black tracking-tight text-[#05050a]">
          Look at the center dot
        </h2>
        <p className="text-[17px] text-[#5a5a5a] font-medium leading-relaxed">
          Keep your head comfortable and still.<br />
          We're learning your natural eye position.
        </p>
      </div>

      {/* The alignment dot */}
      <div className="flex items-center justify-center py-8">
        <motion.div
          style={{ transform: `scale(${dotSize})` }}
          className="relative"
        >
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-2 border-[#05050a]/10 scale-[2.5]" />
          {/* Inner dot */}
          <div className="w-12 h-12 rounded-full bg-[#05050a] shadow-2xl" />
        </motion.div>
      </div>

      {/* Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full transition-colors ${eye.faceDetected ? 'bg-emerald-500' : 'bg-[#d0d0d0]'}`} />
          <span className="text-[14px] font-medium text-[#5a5a5a]">
            {eye.faceDetected ? 'Face detected — hold still…' : 'Looking for your face…'}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-[#f0f0f0] rounded-full overflow-hidden max-w-xs mx-auto">
          <motion.div
            className="h-full bg-[#05050a] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${collected}%` }}
            transition={{ type: 'spring', damping: 30 }}
          />
        </div>
        <p className="text-[12px] text-[#a0a0a0] font-medium">
          Aligning eye position…
        </p>
      </div>
    </div>
  );
}

// ─── Error Screen ─────────────────────────────────────────────────────────────
function ErrorScreen({ onRetry, onBack }: { onRetry: () => void; onBack: () => void }) {
  return (
    <div className="max-w-sm text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto text-4xl">
        📷
      </div>
      <div>
        <h2 className="text-[24px] font-black text-[#05050a]">Camera Unavailable</h2>
        <p className="text-[15px] text-[#5a5a5a] mt-2 font-medium">
          Please allow camera access in your browser, or check that your webcam is connected.
        </p>
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onBack}
          className="px-5 py-3 rounded-xl border border-black/10 text-[13px] font-bold hover:bg-black/5 transition"
        >
          Go Back
        </button>
        <button
          onClick={onRetry}
          className="px-5 py-3 rounded-xl bg-[#05050a] text-white text-[13px] font-bold hover:bg-[#1a1a2e] transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// ─── AAC Grid Screen ──────────────────────────────────────────────────────────
function AACGridScreen({
  eye,
  selectionFlash,
}: {
  eye: ReturnType<typeof useDirectionalEye>;
  selectionFlash: string | null;
}) {
  const currentOption = eye.options[eye.selectedIndex];

  // Group options by row
  const rows = [0, 1, 2].map(row => eye.options.filter(o => o.row === row).sort((a, b) => a.col - b.col));

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Title bar */}
      <div className="text-center space-y-1">
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#a0a0a0]">How can I help?</p>
        <div className="flex items-center justify-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${eye.faceDetected ? 'bg-emerald-500 animate-pulse' : 'bg-[#d0d0d0]'}`} />
          <span className="text-[13px] font-bold text-[#5a5a5a]">
            {eye.faceDetected ? 'Eyes tracked' : 'Face not detected'}
          </span>
          {eye.blinkCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="text-[11px] font-black text-amber-700">Blink 2 to select</span>
            </div>
          )}
        </div>
      </div>

      {/* AAC Grid */}
      <div className="space-y-4">
        {rows.map((rowOpts, rowIdx) => (
          <div key={rowIdx} className={`flex gap-4 ${rowIdx === 2 ? 'justify-center' : 'justify-center'}`}>
            {rowOpts.map(opt => {
              const isSelected = eye.selectedIndex === eye.options.indexOf(opt);
              const isFlashing = selectionFlash === opt.id;
              return (
                <AACCard
                  key={opt.id}
                  option={opt}
                  isSelected={isSelected}
                  isFlashing={isFlashing}
                  isWide={opt.row === 2}
                  onClick={() => eye.onSelect(eye.options.indexOf(opt))}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Navigation hint bar */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <NavHint label="Look ← → ↑ ↓" sub="to navigate" />
        <div className="w-1 h-6 bg-black/5 rounded-full" />
        <NavHint label="Blink twice" sub="to select" />
        <div className="w-1 h-6 bg-black/5 rounded-full" />
        <button
          onClick={eye.recalibrate}
          className="flex items-center gap-1.5 text-[11px] font-bold text-[#a0a0a0] hover:text-[#05050a] transition"
        >
          <RefreshCw className="w-3 h-3" />
          Recalibrate
        </button>
      </div>

      {/* Direction indicator (subtle, for orientation) */}
      <DirectionIndicator direction={eye.direction} />
    </div>
  );
}

// ─── AAC Card ─────────────────────────────────────────────────────────────────
function AACCard({
  option,
  isSelected,
  isFlashing,
  isWide,
  onClick,
}: {
  option: AACOption;
  isSelected: boolean;
  isFlashing: boolean;
  isWide: boolean;
  onClick: () => void;
}) {
  const emergency = option.isEmergency;

  return (
    <motion.button
      onClick={onClick}
      animate={{
        scale: isSelected ? 1.04 : 1,
      }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`
        relative flex flex-col items-center justify-center gap-3 rounded-3xl border-4 transition-colors select-none
        ${isWide ? 'px-10 py-8' : 'w-[168px] h-[168px]'}
        ${isFlashing
          ? 'bg-[#b8ff00] border-[#b8ff00] shadow-[0_0_40px_rgba(184,255,0,0.6)]'
          : isSelected
            ? emergency
              ? 'bg-red-600 border-red-600 text-white shadow-[0_0_32px_rgba(220,38,38,0.4)]'
              : 'bg-[#05050a] border-[#05050a] text-[#b8ff00] shadow-[0_0_32px_rgba(5,5,10,0.3)]'
            : emergency
              ? 'bg-red-50 border-red-200 hover:border-red-400'
              : 'bg-white border-black/10 hover:border-black/25'
        }
      `}
    >
      {/* Selection indicator ring */}
      {isSelected && !isFlashing && (
        <div className={`absolute -inset-2 rounded-[28px] border-2 pointer-events-none ${emergency ? 'border-red-400' : 'border-[#b8ff00]'}`} />
      )}

      <span className={`text-5xl transition-transform ${isSelected ? 'scale-110' : ''}`}>
        {option.emoji}
      </span>
      <span className={`text-[14px] font-black uppercase tracking-wider ${
        isFlashing ? 'text-[#05050a]' : isSelected ? (emergency ? 'text-white' : 'text-[#b8ff00]') : emergency ? 'text-red-700' : 'text-[#05050a]'
      }`}>
        {option.label}
      </span>

      {isSelected && (
        <span className={`text-[10px] font-bold uppercase tracking-widest ${
          isFlashing ? 'text-[#05050a]/70' : emergency ? 'text-red-200' : 'text-[#b8ff00]/70'
        }`}>
          {isFlashing ? '✓ Selected' : 'SELECTED'}
        </span>
      )}
    </motion.button>
  );
}

// ─── Direction Indicator ──────────────────────────────────────────────────────
function DirectionIndicator({ direction }: { direction: string }) {
  const DIRS = [
    { key: 'UP',    symbol: '↑', top: 0,  left: '50%', transform: 'translateX(-50%)'   },
    { key: 'LEFT',  symbol: '←', top: '50%', left: 0,   transform: 'translateY(-50%)'   },
    { key: 'RIGHT', symbol: '→', top: '50%', right: 0,  transform: 'translateY(-50%)'   },
    { key: 'DOWN',  symbol: '↓', bottom: 0, left: '50%', transform: 'translateX(-50%)'  },
  ];

  return (
    <div className="relative w-16 h-16 mx-auto opacity-60">
      {/* Center dot */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-colors ${
        direction === 'CENTER' ? 'bg-[#05050a]' : 'bg-[#d0d0d0]'
      }`} />
      {DIRS.map(d => (
        <div
          key={d.key}
          className={`absolute text-[14px] font-black transition-colors ${
            direction === d.key ? 'text-[#05050a]' : 'text-[#d0d0d0]'
          }`}
          style={{
            top: d.top, left: (d as any).left, right: (d as any).right,
            bottom: (d as any).bottom, transform: d.transform,
          }}
        >
          {d.symbol}
        </div>
      ))}
    </div>
  );
}

// ─── Nav Hint ─────────────────────────────────────────────────────────────────
function NavHint({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="text-center">
      <p className="text-[13px] font-black text-[#05050a]">{label}</p>
      <p className="text-[11px] font-medium text-[#a0a0a0]">{sub}</p>
    </div>
  );
}

// ─── Dev Mode Panel ───────────────────────────────────────────────────────────
function DevModePanel({ eye }: { eye: ReturnType<typeof useDirectionalEye> }) {
  return (
    <div className="bg-[#05050a] text-[#b8ff00] font-mono text-[12px] px-5 py-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 border-b border-white/10">
      <DevCell label="Direction"  value={eye.direction}     highlight={eye.direction !== 'CENTER'} />
      <DevCell label="Source"     value={eye.source}        />
      <DevCell label="FPS"        value={String(eye.fps)}   />
      <DevCell label="Face"       value={eye.faceDetected ? 'YES' : 'NO'} highlight={eye.faceDetected} />
      <DevCell label="Confidence" value={`${Math.round(eye.confidence * 100)}%`} />
      <DevCell label="Blink"      value={eye.isBlinking ? 'YES' : 'NO'} highlight={eye.isBlinking} />
      <DevCell label="Blink #"    value={String(eye.blinkCount)} />
      <DevCell label="Calibrated" value={eye.calibrated ? 'YES' : 'NO'} highlight={eye.calibrated} />
      <DevCell label="State"      value={eye.state} />
      <DevCell label="Selected"   value={eye.options[eye.selectedIndex]?.label ?? '—'} />
      {eye.eyeEvent && (
        <>
          <DevCell label="Eye X"    value={eye.eyeEvent.x.toFixed(3)} />
          <DevCell label="Eye Y"    value={eye.eyeEvent.y.toFixed(3)} />
          <DevCell label="Neutral X" value={eye.eyeEvent.neutralX.toFixed(3)} />
          <DevCell label="Neutral Y" value={eye.eyeEvent.neutralY.toFixed(3)} />
          <DevCell label="EAR"      value={eye.eyeEvent.ear.toFixed(3)} />
          <DevCell label="Python WS" value={eye.pythonConnected ? 'CONNECTED' : 'OFF'} highlight={eye.pythonConnected} />
        </>
      )}
    </div>
  );
}

function DevCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-white/40 text-[9px] uppercase tracking-widest">{label}</p>
      <p className={`font-bold text-[13px] ${highlight ? 'text-[#b8ff00]' : 'text-white/90'}`}>{value}</p>
    </div>
  );
}
