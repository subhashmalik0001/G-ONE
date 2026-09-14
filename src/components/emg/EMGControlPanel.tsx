import { Usb, Play, Square, FlaskConical, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { EMGMode } from '@/hooks/emg/useEmgStream';

interface Props {
  mode: EMGMode;
  isConnected: boolean;
  isSessionActive: boolean;
  connectionError?: string | null;
  patientId?: string;
  onSetMode: (m: EMGMode) => void;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  onStartSession: (patientId?: string, activityType?: string) => Promise<void> | void;
  onStopSession: () => void | Promise<any>;
}

export function EMGControlPanel({
  mode,
  isConnected,
  isSessionActive,
  connectionError,
  onSetMode,
  onConnect,
  onDisconnect,
  onStartSession,
  onStopSession,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handle = async (fn: () => Promise<void> | void) => {
    setLoading(true);
    try {
      await fn();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 premium-card p-6 rounded-[32px]">
      <h3 className="text-[14px] font-black uppercase tracking-widest text-[#05050a]">Hardware Control</h3>
      
      {/* Mode toggle */}
      <div className="flex gap-2 p-1.5 bg-black/[0.03] rounded-xl">
        <button
          type="button"
          onClick={() => onSetMode('serial')}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-3 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all",
            mode === 'serial' ? "bg-[#05050a] text-[#b8ff00]" : "text-[#8a8a8a] hover:text-[#05050a]"
          )}
        >
          <Usb className="w-4 h-4" /> Wired USB
        </button>
        <button
          type="button"
          onClick={() => onSetMode('simulation')}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-3 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all",
            mode === 'simulation' ? "bg-[#05050a] text-[#b8ff00]" : "text-[#8a8a8a] hover:text-[#05050a]"
          )}
        >
          <FlaskConical className="w-4 h-4" /> Simulate
        </button>
      </div>

      {/* Connect / Disconnect */}
      <div className="flex flex-col gap-2 pt-2">
        {!isConnected ? (
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#05050a] py-4 text-[13px] font-black uppercase tracking-widest text-[#b8ff00] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            onClick={() => handle(onConnect)}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Usb className="w-5 h-5" />}
            Connect Device
          </button>
        ) : (
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#05050a] bg-white py-4 text-[13px] font-black uppercase tracking-widest text-[#05050a] active:scale-95 transition-all disabled:opacity-50"
            onClick={() => handle(onDisconnect)}
            disabled={loading}
          >
            Disconnect
          </button>
        )}
        {connectionError && (
          <div className="rounded-lg bg-red-50 p-3 mt-2 border border-red-100">
            <p className="text-[11px] font-bold text-red-600 leading-tight">{connectionError}</p>
          </div>
        )}
      </div>

      {/* Start / Stop session */}
      {isConnected && (
        <div className="flex gap-2">
          {!isSessionActive ? (
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#b8ff00] py-4 text-[13px] font-black uppercase tracking-widest text-[#05050a] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(184,255,0,0.3)] disabled:opacity-50"
              onClick={() => handle(onStartSession)}
              disabled={loading}
            >
              <Play className="w-5 h-5" fill="currentColor" /> Start Session
            </button>
          ) : (
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500 py-4 text-[13px] font-black uppercase tracking-widest text-white hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              onClick={onStopSession}
            >
              <Square className="w-5 h-5" fill="currentColor" /> Stop Session
            </button>
          )}
        </div>
      )}
    </div>
  );
}
