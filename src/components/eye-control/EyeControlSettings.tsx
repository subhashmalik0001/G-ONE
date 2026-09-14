import React from 'react';
import { useDirectionalEye } from '@/contexts/eye-control-context';
import { RefreshCw, Volume2 } from 'lucide-react';

const SPEECH_RATES = ['slow', 'normal', 'fast'] as const;
const BLINK_WINDOWS = [500, 700, 900, 1200] as const;

export function EyeControlSettings() {
  const { settings, updateSettings, recalibrate } = useDirectionalEye();

  return (
    <div className="space-y-5 max-w-xl mx-auto pt-4 pb-20 px-2 sm:px-4">
      <div className="text-center space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#b0b0b0]">CONFIGURATION</p>
        <h3 className="text-[22px] font-black tracking-tight text-[#05050a]">Eye Control Settings</h3>
        <p className="text-[13px] text-[#8a8a8a] font-medium">
          Adjust blink window, speech, and direction sensitivity.
        </p>
      </div>

      {/* Recalibrate */}
      <div className="p-5 rounded-[24px] bg-[#05050a] text-white flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#b8ff00] block">Neutral Eye Calibration</span>
          <p className="text-[13px] text-white/70 mt-0.5">Re-learn your neutral gaze center position.</p>
        </div>
        <button
          onClick={recalibrate}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#b8ff00] text-[#05050a] text-[12px] font-black uppercase tracking-wider hover:scale-105 transition-all shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Recalibrate
        </button>
      </div>

      {/* Double Blink Window */}
      <div className="p-5 rounded-[24px] bg-white border border-black/5 space-y-3">
        <div>
          <h4 className="text-[14px] font-black text-[#05050a]">Double-Blink Selection Window</h4>
          <p className="text-[12px] text-[#8a8a8a]">Time window between two blinks to trigger selection.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {BLINK_WINDOWS.map(ms => (
            <button
              key={ms}
              onClick={() => updateSettings({ doubleBinkWindowMs: ms })}
              className={`px-4 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all ${
                settings.doubleBinkWindowMs === ms
                  ? 'bg-[#05050a] text-[#b8ff00] shadow-sm'
                  : 'bg-black/[0.03] text-[#8a8a8a] hover:text-[#05050a]'
              }`}
            >
              {ms}ms
            </button>
          ))}
        </div>
      </div>

      {/* Speech Feedback */}
      <div className="p-5 rounded-[24px] bg-white border border-black/5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[14px] font-black text-[#05050a]">Speech Audio</h4>
            <p className="text-[12px] text-[#8a8a8a]">Speak selected phrases aloud via browser TTS.</p>
          </div>
          <button
            onClick={() => updateSettings({ speechEnabled: !settings.speechEnabled })}
            className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider ${
              settings.speechEnabled ? 'bg-[#b8ff00] text-[#05050a]' : 'bg-black/10 text-[#8a8a8a]'
            }`}
          >
            {settings.speechEnabled ? 'Enabled' : 'Muted'}
          </button>
        </div>

        {settings.speechEnabled && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SPEECH_RATES.map(rate => (
              <button
                key={rate}
                onClick={() => updateSettings({ speechRate: rate })}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all ${
                  settings.speechRate === rate
                    ? 'bg-[#05050a] text-[#b8ff00]'
                    : 'bg-black/[0.03] text-[#8a8a8a] hover:text-[#05050a]'
                }`}
              >
                <Volume2 className="w-3 h-3" /> {rate}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dev Mode */}
      <div className="p-5 rounded-[24px] bg-white border border-black/5 flex items-center justify-between">
        <div>
          <h4 className="text-[14px] font-black text-[#05050a]">Developer Debug Panel</h4>
          <p className="text-[12px] text-[#8a8a8a]">Shows telemetry (EAR, direction, source) in the eye control page header.</p>
        </div>
        <button
          onClick={() => updateSettings({ devMode: !settings.devMode })}
          className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider ${
            settings.devMode ? 'bg-amber-400 text-[#05050a]' : 'bg-black/10 text-[#8a8a8a]'
          }`}
        >
          {settings.devMode ? 'On' : 'Off'}
        </button>
      </div>
    </div>
  );
}
