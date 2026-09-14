import React, { useState, useCallback } from 'react';
import { GazeTarget } from './GazeTarget';
import { useDirectionalEye } from '@/contexts/eye-control-context';
import { Volume2, Delete, Trash2 } from 'lucide-react';


const WORDS: Record<string, string[]> = {
  subjects: ['I', 'You', 'We', 'Doctor', 'Nurse', 'Family', 'मैं', 'आप'],
  verbs:    ['want', 'need', 'feel', 'have', 'cannot', 'चाहता हूं', 'चाहिए', 'दर्द है'],
  nouns:    ['water', 'food', 'medicine', 'rest', 'help', 'blanket', 'bathroom', 'पानी', 'खाना', 'दवाई'],
  modifiers: ['more', 'less', 'now', 'please', 'pain', 'better', 'cold', 'hot', 'अभी', 'कृपया'],
};

export function SentenceBuilder() {
  const { speak } = useDirectionalEye();

  const [sentence, setSentence] = useState<string[]>([]);
  const [category, setCategory] = useState<keyof typeof WORDS>('subjects');

  const addWord = useCallback((word: string) => {
    setSentence(prev => [...prev, word]);
  }, []);

  const backspace = useCallback(() => {
    setSentence(prev => prev.slice(0, -1));
  }, []);

  const clear = useCallback(() => setSentence([]), []);

  const speakSentence = useCallback(() => {
    if (sentence.length === 0) return;
    speak(sentence.join(' '));
  }, [sentence, speak]);

  const categories = Object.keys(WORDS) as (keyof typeof WORDS)[];

  return (
    <div className="flex flex-col items-center pt-4 pb-20 px-2 sm:px-4 max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#b0b0b0]">DYNAMIC AAC SYNTHESIS</p>
        <h3 className="text-[22px] font-black tracking-tight text-[#05050a]">Sentence Builder</h3>
        <p className="text-[13px] text-[#8a8a8a] font-medium">
          Compose multi-word phrases using hands-free gaze selection.
        </p>
      </div>

      {/* Current sentence box */}
      <div className="w-full premium-card p-6 rounded-[28px] bg-white border border-black/5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex-1 text-center sm:text-left">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#8a8a8a] block mb-1">Constructed Sentence</span>
          <span className="text-[20px] font-bold text-[#05050a]">
            {sentence.length > 0 ? sentence.join(' ') : <span className="text-[#b0b0b0] italic font-normal">Look at words below to compose...</span>}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {sentence.length > 0 && (
            <>
              <GazeTarget id="sent-back" onSelect={backspace}>
                <button className="px-3.5 py-3 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-[#05050a] text-xs font-bold flex items-center gap-1.5 transition-all">
                  <Delete className="w-4 h-4" /> Back
                </button>
              </GazeTarget>
              <GazeTarget id="sent-clear" onSelect={clear}>
                <button className="px-3.5 py-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-bold flex items-center gap-1.5 transition-all">
                  <Trash2 className="w-4 h-4" /> Clear
                </button>
              </GazeTarget>
            </>
          )}

          <GazeTarget id="sent-speak" onSelect={speakSentence} important>
            <button
              disabled={sentence.length === 0}
              className="px-6 py-3 rounded-xl bg-[#05050a] disabled:opacity-40 text-[#b8ff00] text-[13px] font-black uppercase tracking-wider flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-md"
            >
              <Volume2 className="w-4 h-4" /> Speak
            </button>
          </GazeTarget>
        </div>
      </div>

      {/* Category selector */}
      <div className="flex gap-2 p-1.5 bg-black/[0.03] rounded-2xl flex-wrap justify-center w-full">
        {categories.map(cat => (
          <GazeTarget key={cat} id={`cat-${cat}`} onSelect={() => setCategory(cat)}>
            <button
              className={`px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all ${
                category === cat
                  ? 'bg-[#05050a] text-[#b8ff00] shadow-sm'
                  : 'text-[#8a8a8a] hover:text-[#05050a]'
              }`}
            >
              {cat}
            </button>
          </GazeTarget>
        ))}
      </div>

      {/* Words grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
        {WORDS[category].map(word => (
          <GazeTarget key={word} id={`word-${word}`} onSelect={() => addWord(word)} className="w-full">
            <div className="premium-card p-5 rounded-[22px] border border-black/5 bg-white flex items-center justify-center text-center cursor-pointer hover:border-black/15 transition-all min-h-[80px]">
              <span className="text-[16px] font-black text-[#05050a]">{word}</span>
            </div>
          </GazeTarget>
        ))}
      </div>
    </div>
  );
}
