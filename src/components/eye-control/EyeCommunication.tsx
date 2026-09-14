import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GazeTarget } from './GazeTarget';
import { useDirectionalEye } from '@/contexts/eye-control-context';
import { Volume2, ShieldAlert } from 'lucide-react';

interface CommOption {
  id: string;
  emoji: string;
  label: string;
  phrase: string;
  important: boolean;
}

const OPTIONS: CommOption[] = [
  { id: 'water',    emoji: '💧', label: 'WATER',    phrase: 'I would like some water, please.',              important: false },
  { id: 'food',     emoji: '🍽️', label: 'FOOD',     phrase: 'I am hungry. I would like something to eat.',   important: false },
  { id: 'bathroom', emoji: '🚻', label: 'BATHROOM', phrase: 'I need help getting to the bathroom.',          important: false },
  { id: 'medicine', emoji: '💊', label: 'MEDICINE', phrase: 'I need my medicine, please.',                   important: false },
  { id: 'pain',     emoji: '😣', label: 'PAIN',     phrase: 'I am experiencing pain. Please help me.',       important: true },
  { id: 'position', emoji: '🛏️', label: 'POSITION', phrase: 'Please help me change my position.',           important: false },
  { id: 'family',   emoji: '❤️', label: 'FAMILY',   phrase: 'Please contact my family.',                    important: false },
  { id: 'help',     emoji: '🆘', label: 'HELP',     phrase: 'I need help urgently.',                        important: true },
];

interface EyeCommunicationProps {
  onSOS?: () => void;
}

export function EyeCommunication({ onSOS }: EyeCommunicationProps) {
  const { speak } = useDirectionalEye();
  const [spoken, setSpoken] = useState<CommOption | null>(null);

  const handleSelect = useCallback((opt: CommOption) => {
    speak(opt.phrase);
    setSpoken(opt);
    setTimeout(() => setSpoken(null), 3500);
  }, [speak]);

  return (
    <div className="flex flex-col items-center justify-start pt-4 pb-20 px-2 sm:px-4 max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#b0b0b0]">AAC COMMUNICATION BOARD</p>
        <h3 className="text-[22px] font-black tracking-tight text-[#05050a]">
          Communication Board
        </h3>
        <p className="text-[13px] text-[#8a8a8a] font-medium">
          Click or use eye direction to select — speaks the phrase aloud.
        </p>
      </div>

      <AnimatePresence>
        {spoken && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-lg p-5 bg-[#05050a] text-white rounded-[24px] shadow-2xl flex items-center gap-4 border border-black/10"
          >
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-[#b8ff00]">
              <Volume2 className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#b8ff00] block">G-ONE Spoke Aloud</span>
              <p className="text-[15px] font-bold text-white mt-0.5">
                "{spoken.phrase}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
        {OPTIONS.map(opt => (
          <GazeTarget
            key={opt.id}
            id={`comm-${opt.id}`}
            onSelect={() => handleSelect(opt)}
            important={opt.important}
            className="w-full"
          >
            <div className={`p-6 rounded-[28px] border border-black/5 bg-white flex flex-col items-center justify-center gap-3 cursor-pointer min-h-[140px] text-center group hover:border-black/15 hover:shadow-md transition-all ${opt.important ? 'border-red-200 bg-red-50/20' : ''}`}>
              <span className="text-4xl group-hover:scale-110 transition-transform">{opt.emoji}</span>
              <div className="space-y-0.5">
                <span className="text-[15px] font-black text-[#05050a] tracking-tight block">{opt.label}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a8a8a] block line-clamp-1">
                  {opt.phrase}
                </span>
              </div>
            </div>
          </GazeTarget>
        ))}
      </div>

      {onSOS && (
        <div className="w-full pt-4">
          <GazeTarget id="comm-sos" onSelect={onSOS} important className="w-full">
            <div className="p-5 rounded-[24px] bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-red-600/20 transition-all">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              <div className="text-left">
                <span className="text-[14px] font-black uppercase tracking-wider block">🚨 Activate Emergency SOS</span>
                <span className="text-[11px] font-bold opacity-90 block">Triggers emergency sirens and GPS location broadcast</span>
              </div>
            </div>
          </GazeTarget>
        </div>
      )}
    </div>
  );
}
