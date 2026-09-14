import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  ShieldCheck, 
  ArrowLeft, 
  Activity, 
  Download, 
  Cpu, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Terminal,
  Zap,
  Copy,
  Check,
  Radio,
  Share2,
  Info
} from 'lucide-react';
import { useEmgStream } from '@/hooks/emg/useEmgStream';
import { EMGControlPanel } from '@/components/emg/EMGControlPanel';
import { EMGFatigueGauge } from '@/components/emg/EMGFatigueGauge';
import { EMGLiveChart } from '@/components/emg/EMGLiveChart';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const ARDUINO_FIRMWARE_CODE = `/*
 * G-ONE Biomedical EMG Firmware
 * Target: Arduino Uno / Nano / Mega / ESP32
 * Baud Rate: 115200 bps
 * Analog Input: Pin A0
 */

const int EMG_PIN = A0;
const unsigned long SAMPLING_INTERVAL_MS = 25; // 40 Hz streaming rate (smooth real-time graph)
unsigned long lastSampleTime = 0;

// Moving average noise filter (window size = 5)
const int FILTER_WINDOW = 5;
int filterBuffer[FILTER_WINDOW];
int filterIndex = 0;
long runningSum = 0;

void setup() {
  // Initialize Serial at high-speed 115200 baud
  Serial.begin(115200);
  
  // Set ADC pin mode
  pinMode(EMG_PIN, INPUT);

  // Pre-fill filter buffer
  int initialRead = analogRead(EMG_PIN);
  for (int i = 0; i < FILTER_WINDOW; i++) {
    filterBuffer[i] = initialRead;
    runningSum += initialRead;
  }

  // Wait for serial stabilization
  delay(200);
}

void loop() {
  unsigned long now = millis();

  if (now - lastSampleTime >= SAMPLING_INTERVAL_MS) {
    lastSampleTime = now;

    // 1. Read Raw Analog Signal (0 - 1023 on Uno)
    int rawValue = analogRead(EMG_PIN);

    // 2. Moving Average Low-Pass Filter
    runningSum -= filterBuffer[filterIndex];
    filterBuffer[filterIndex] = rawValue;
    runningSum += rawValue;
    filterIndex = (filterIndex + 1) % FILTER_WINDOW;
    int smoothedSignal = runningSum / FILTER_WINDOW;

    // 3. Transmit JSON Line Delimited (NDJSON format)
    Serial.print("{\\"signal\\":");
    Serial.print(smoothedSignal);
    Serial.print(",\\"timestamp\\":");
    Serial.print(now);
    Serial.println("}"); // println sends '\\n' for line buffering
  }
}
`;

export default function EMGHealthPage() {
  const navigate = useNavigate();
  const {
    mode, 
    setMode, 
    isConnected, 
    isSessionActive, 
    currentSignal,
    fatigueLevel, 
    strainDetected, 
    history, 
    durationSeconds, 
    connectionError,
    connect, 
    disconnect, 
    startSession, 
    stopSession
  } = useEmgStream();

  const [showArduinoGuide, setShowArduinoGuide] = useState(false);
  const [copiedFirmware, setCopiedFirmware] = useState(false);

  const downloadArduinoSketch = () => {
    const blob = new Blob([ARDUINO_FIRMWARE_CODE], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'emg_sensor.ino';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyFirmware = () => {
    navigator.clipboard.writeText(ARDUINO_FIRMWARE_CODE);
    setCopiedFirmware(true);
    setTimeout(() => setCopiedFirmware(false), 2000);
  };

  return (
    <DashboardLayout currentRole="patient">
      <div className="space-y-10 max-w-[1400px] mx-auto pb-20 px-2 sm:px-4">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-black/5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#05050a] text-[#b8ff00] text-[10px] font-black uppercase tracking-widest">
              <Activity className="w-3.5 h-3.5" />
              <span>Biometric Neuromuscular Lab</span>
            </div>
            <h1 className="text-[36px] sm:text-[42px] font-black tracking-tighter text-[#05050a] leading-[1.1]" style={{ fontFamily: "var(--font-display)" }}>
              EMG <span className="text-[#b8ff00] bg-[#05050a] px-3 rounded-xl inline-block rotate-[-1deg]">Telemetry</span> Monitor
            </h1>
            <p className="text-[15px] font-medium text-[#8a8a8a] max-w-xl">
              Live surface electromyography monitoring, dynamic baseline calibration, and real-time neuromuscular fatigue analysis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowArduinoGuide(prev => !prev)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/10 bg-white text-[12px] font-bold text-[#05050a] hover:bg-black/5 transition-all shadow-sm"
            >
              <Cpu className="w-4 h-4 text-[#05050a]" />
              <span>Hardware & Wiring Guide</span>
              {showArduinoGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => navigate("/health")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/5 bg-white text-[12px] font-bold text-[#05050a] hover:bg-black/5 transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Health
            </button>
          </div>
        </div>

        {/* Arduino Setup Modal/Drawer Guide if toggled */}
        {showArduinoGuide && (
          <div className="premium-card p-6 sm:p-8 rounded-[32px] bg-[#05050a] text-white space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b8ff00]">HARDWARE ARCHITECTURE</span>
                <h3 className="text-[22px] font-black tracking-tight text-white mt-1">Arduino Uno / Nano / ESP32 Hardware Integration</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={copyFirmware}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-extrabold text-[12px] uppercase tracking-wider transition-all"
                >
                  {copiedFirmware ? <Check className="w-4 h-4 text-[#b8ff00]" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedFirmware ? "Copied!" : "Copy Code"}</span>
                </button>
                <button
                  onClick={downloadArduinoSketch}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#b8ff00] text-[#05050a] font-extrabold text-[12px] uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-md"
                >
                  <Download className="w-4 h-4" /> Download .ino
                </button>
              </div>
            </div>

            {/* Hardware Pinout & Wiring */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-[13px] font-medium text-white/80">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-[#b8ff00] font-black text-[12px] uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4" /> 1. Pin-to-Pin Connection
                </div>
                <div className="font-mono text-[11px] bg-black/50 p-3 rounded-xl border border-white/10 space-y-1">
                  <div>VCC    ──► 5V (or 3.3V ESP32)</div>
                  <div>GND    ──► GND</div>
                  <div>SIGNAL ──► A0 (Analog In)</div>
                </div>
                <p className="text-[12px] text-white/70">Works with MyoWare 2.0, MyoWare 1.0, AD8226, or OYMotion EMG sensors.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-[#b8ff00] font-black text-[12px] uppercase tracking-widest">
                  <Radio className="w-4 h-4" /> 2. 3-Lead Electrode Placement
                </div>
                <ul className="text-[12px] space-y-1.5 text-white/80 list-disc list-inside">
                  <li><strong className="text-white">Red (Positive):</strong> Center belly of target muscle.</li>
                  <li><strong className="text-white">Green (Negative):</strong> 2-3 cm along muscle fiber.</li>
                  <li><strong className="text-white">Black (Reference):</strong> Bony area (elbow, wrist bone).</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-[#b8ff00] font-black text-[12px] uppercase tracking-widest">
                  <Zap className="w-4 h-4" /> 3. Power Noise Tip
                </div>
                <p className="text-[12px] text-white/70 leading-relaxed">
                  Power Arduino via laptop USB. When testing, run laptop on <strong className="text-white">battery power</strong> to eliminate 50Hz/60Hz AC wall outlet electrical hum.
                </p>
              </div>
            </div>

            {/* Architecture Pipeline Flow */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-[#b8ff00] font-black text-[12px] uppercase tracking-widest">
                <Share2 className="w-4 h-4" /> End-to-End Biomedical Communication Pipeline
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-[11px] font-mono">
                <div className="bg-black/60 p-2.5 rounded-xl border border-white/10">
                  <div className="text-[#b8ff00] font-bold">µV Muscle</div>
                  <div className="text-white/60 text-[10px]">Action Potential</div>
                </div>
                <div className="bg-black/60 p-2.5 rounded-xl border border-white/10">
                  <div className="text-[#b8ff00] font-bold">Op-Amps</div>
                  <div className="text-white/60 text-[10px]">Rectify & Filter</div>
                </div>
                <div className="bg-black/60 p-2.5 rounded-xl border border-white/10">
                  <div className="text-[#b8ff00] font-bold">10-Bit ADC</div>
                  <div className="text-white/60 text-[10px]">A0 (0-1023)</div>
                </div>
                <div className="bg-black/60 p-2.5 rounded-xl border border-white/10">
                  <div className="text-[#b8ff00] font-bold">JSON Stream</div>
                  <div className="text-white/60 text-[10px]">115200 Baud</div>
                </div>
                <div className="bg-black/60 p-2.5 rounded-xl border border-white/10">
                  <div className="text-[#b8ff00] font-bold">Web Serial</div>
                  <div className="text-white/60 text-[10px]">navigator.serial</div>
                </div>
                <div className="bg-black/60 p-2.5 rounded-xl border border-white/10">
                  <div className="text-[#b8ff00] font-bold">Line Buffer</div>
                  <div className="text-white/60 text-[10px]">Chunk Assembly</div>
                </div>
                <div className="bg-black/60 p-2.5 rounded-xl border border-white/10">
                  <div className="text-[#b8ff00] font-bold">React DSP</div>
                  <div className="text-white/60 text-[10px]">MVC & Fatigue</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Column: Live Chart & AI Diagnosis */}
          <div className="xl:col-span-8 space-y-8">
            <div className="premium-card rounded-[32px] p-8 md:p-10 flex flex-col gap-6 relative overflow-hidden bg-[#05050a] text-white shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8a8a8a]">Live Muscle Activation</p>
                  <div className="flex items-baseline gap-4">
                    <h2 className="text-[54px] font-black tracking-tighter text-[#b8ff00] leading-none" style={{ fontFamily: "var(--font-mono)" }}>
                      {currentSignal}
                    </h2>
                    <span className="text-[14px] font-black text-[#8a8a8a] uppercase tracking-wider">% Normalized MVC</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-white/90">
                    <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-[#b8ff00] animate-pulse' : 'bg-zinc-500'}`} />
                    <span>{isConnected ? (mode === 'serial' ? 'USB Live' : 'Simulating') : 'Standby'}</span>
                  </div>
                  {strainDetected && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/30 rounded-full animate-pulse">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-[11px] font-black uppercase tracking-widest">Strain Alert</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-[320px] w-full relative z-10">
                <EMGLiveChart history={history} />
              </div>

              {/* Glowing background ambient element */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#b8ff00] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />
            </div>

            {/* AI Clinical Health Insight Card */}
            <div className="premium-card rounded-[32px] p-8 space-y-6 border border-black/5 bg-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#05050a] flex items-center justify-center text-[#b8ff00]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-[20px] font-black tracking-tight text-[#05050a]">AI Clinical Status</h3>
                  <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#b0b0b0]">Algorithmic Evaluation</p>
                </div>
              </div>
              <p className="text-[15px] font-medium text-[#05050a] leading-relaxed">
                {fatigueLevel === 'high' 
                  ? "Significant neuromuscular fatigue accumulated. Muscle contractile capacity is decreased; active rest or cessation of high-load repetitions is strongly advised."
                  : strainDetected 
                  ? "Acute strain spike detected above 85% maximum threshold. Rapid decelerations or force mitigation recommended to protect tendon attachment points."
                  : isSessionActive
                  ? "Neuromuscular activation is stable and calibrated within normal rest and contraction parameters."
                  : "Device is ready. Start session to initiate dynamic baseline tracking, MVC normalization, and strain monitoring."}
              </p>
            </div>
          </div>

          {/* Right Column: Controls & Gauge */}
          <div className="xl:col-span-4 space-y-8">
            <EMGControlPanel
              mode={mode}
              isConnected={isConnected}
              isSessionActive={isSessionActive}
              connectionError={connectionError}
              onSetMode={setMode}
              onConnect={connect}
              onDisconnect={disconnect}
              onStartSession={startSession}
              onStopSession={stopSession}
            />

            <div className="premium-card rounded-[32px] p-8 space-y-6 bg-white border border-black/5">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-black uppercase tracking-widest text-[#05050a]">Fatigue Analysis</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#b0b0b0]">DSP Index</span>
              </div>
              <EMGFatigueGauge 
                fatigueLevel={fatigueLevel} 
                fatigueIndex={history[history.length - 1]?.fatigueIndex || 0} 
              />
              
              <div className="flex justify-between items-center pt-4 border-t border-black/5">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#8a8a8a]">Session Duration</span>
                <span className="text-[14px] font-black text-[#05050a]" style={{ fontFamily: "var(--font-mono)" }}>
                  {Math.floor(durationSeconds / 60)}m {durationSeconds % 60}s
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#8a8a8a]">Total Data Points</span>
                <span className="text-[14px] font-black text-[#05050a]" style={{ fontFamily: "var(--font-mono)" }}>
                  {history.length} samples
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
