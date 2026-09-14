export type SpeechRate = 'slow' | 'normal' | 'fast';
const RATE_MAP: Record<SpeechRate, number> = { slow: 0.7, normal: 0.95, fast: 1.3 };

class SpeechService {
  private synth = window.speechSynthesis;

  speak(text: string, lang = 'en', rate: SpeechRate = 'normal'): void {
    this.stop();
    const utter = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = { en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', pa: 'pa-IN' };
    utter.lang = langMap[lang] ?? 'en-IN';
    utter.rate = RATE_MAP[rate];
    utter.pitch = 1.0;
    utter.volume = 1.0;
    const voices = this.synth.getVoices();
    const match = voices.find(v => v.lang.startsWith(utter.lang.split('-')[0]));
    if (match) utter.voice = match;
    this.synth.speak(utter);
  }

  stop(): void { this.synth.cancel(); }
  pause(): void { this.synth.pause(); }
  resume(): void { this.synth.resume(); }
  isSpeaking(): boolean { return this.synth.speaking; }
}

export const speechService = new SpeechService();
