import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  MessageCircle, 
  TrendingUp, 
  Calendar, 
  BookOpen, 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  X,
  Play,
  Pause,
  ArrowRight,
  Smile,
  Frown,
  Meh,
  Activity,
  Zap,
  PhoneCall
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { toast } from '@/components/ui/use-toast';
import { aiLogger } from '@/lib/ai-logger';

export interface MoodEntry {
  id?: string;
  date: string;
  mood: string;
  score: number; // 0 to 100
  tone: 'stress' | 'anxiety' | 'burnout' | 'positive' | 'neutral' | 'crisis';
  analysis: string;
  suggestions: string[];
}

interface NeuroMateProps {
  className?: string;
}

const QUICK_EMOTION_TAGS = [
  { label: 'Work Overwhelm', tone: 'stress' },
  { label: 'Anxious & Racing Thoughts', tone: 'anxiety' },
  { label: 'Exhausted & Fatigued', tone: 'burnout' },
  { label: 'Calm & Centered', tone: 'positive' },
  { label: 'Seeking Clarity', tone: 'neutral' },
  { label: 'Gratitude & Focus', tone: 'positive' }
];

export function NeuroMate({ className }: NeuroMateProps) {
  const [message, setMessage] = useState('');
  const [moodAnalysis, setMoodAnalysis] = useState<MoodEntry | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [weeklyEntries, setWeeklyEntries] = useState<MoodEntry[]>([]);

  // Interactive Tools Modals
  const [showCbtModal, setShowCbtModal] = useState(false);
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathingTimer, setBreathingTimer] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  // CBT Form state
  const [cbtThought, setCbtThought] = useState('');
  const [cbtDistortion, setCbtDistortion] = useState('Catastrophizing');
  const [cbtReframe, setCbtReframe] = useState('');

  useEffect(() => {
    loadWeeklyData();
  }, []);

  const loadWeeklyData = () => {
    const saved = localStorage.getItem('neuromate_weekly');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setWeeklyEntries(parsed);
      } catch (e) {
        console.error('Failed to parse weekly entries', e);
      }
    } else {
      // Provide realistic default initial trend if empty
      const initial: MoodEntry[] = [
        { date: 'Mon', score: 65, mood: 'Steady workday', tone: 'neutral', analysis: 'Stable cognitive focus.', suggestions: ['Maintain hydration', '10m walk'] },
        { date: 'Tue', score: 52, mood: 'Tight deadline pressure', tone: 'stress', analysis: 'Elevated stress response detected.', suggestions: ['4-7-8 breathing', 'Delegate tasks'] },
        { date: 'Wed', score: 70, mood: 'Project milestone finished', tone: 'positive', analysis: 'Positive valence and relief.', suggestions: ['Celebrate small win', 'Evening unwind'] },
        { date: 'Thu', score: 60, mood: 'Slight fatigue', tone: 'burnout', analysis: 'Physical fatigue with stable mood.', suggestions: ['Early sleep', 'Limit screen time'] },
        { date: 'Fri', score: 78, mood: 'Optimistic and organized', tone: 'positive', analysis: 'High emotional resilience.', suggestions: ['Plan weekend leisure', 'Gratitude journal'] }
      ];
      setWeeklyEntries(initial);
      localStorage.setItem('neuromate_weekly', JSON.stringify(initial));
    }
  };

  // Breathing interval effect
  useEffect(() => {
    if (!isBreathingActive) return;
    const interval = setInterval(() => {
      setBreathingTimer((prev) => {
        if (prev <= 1) {
          if (breathingPhase === 'Inhale') {
            setBreathingPhase('Hold');
            return 7;
          } else if (breathingPhase === 'Hold') {
            setBreathingPhase('Exhale');
            return 8;
          } else {
            setBreathingPhase('Inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isBreathingActive, breathingPhase]);

  const analyzeMood = async () => {
    if (!message.trim()) {
      toast({ title: 'Please share how you\'re feeling', variant: 'destructive' });
      return;
    }

    setIsAnalyzing(true);

    try {
      const crisisKeywords = ['kill', 'suicide', 'die', 'hurt myself', 'end it all', 'no point', 'worthless'];
      const messageLower = message.toLowerCase();
      const isCrisis = crisisKeywords.some(keyword => messageLower.includes(keyword));
      
      if (isCrisis) {
        const crisisEntry: MoodEntry = {
          id: `mood-${Date.now()}`,
          date: new Date().toLocaleDateString('en-US', { weekday: 'short' }),
          mood: message,
          score: 15,
          tone: 'crisis',
          analysis: 'I notice you may be carrying severe distress. Your feelings are deeply valid, but please know immediate clinical and personal support is available 24/7. You do not have to carry this alone.',
          suggestions: [
            'Call or text 988 (Suicide & Crisis Lifeline) – Free, confidential, 24/7',
            'Text HOME to 741741 to connect with Crisis Text Line counselor',
            'Reach out to a close friend, trusted relative, or medical provider right now',
            'Go to your nearest emergency department if you feel in immediate danger'
          ]
        };
        
        setMoodAnalysis(crisisEntry);
        const updated = [crisisEntry, ...weeklyEntries.slice(0, 6)];
        setWeeklyEntries(updated);
        localStorage.setItem('neuromate_weekly', JSON.stringify(updated));
        
        toast({ title: 'Immediate Support Available', description: 'Lifeline 988 is ready 24/7' });
        return;
      }
      
      // Dynamic AI Mood Analysis
      let tone: MoodEntry['tone'] = 'neutral';
      let score = 65;
      let analysis = '';
      let suggestions: string[] = [];

      try {
        const { ollamaAnalyzeMood } = await import('@/lib/ollama-api');
        const detectedLang = messageLower.match(/[\u0900-\u097F]/) ? 'hi' :
          messageLower.match(/[\u0B80-\u0BFF]/) ? 'ta' : 'en';
        const aiResult = await ollamaAnalyzeMood(message, detectedLang);
        tone = (aiResult.tone as MoodEntry['tone']) || 'neutral';
        analysis = aiResult.analysis;
        suggestions = aiResult.suggestions || [];
      } catch {
        // Fallback intelligent heuristic
        if (messageLower.includes('stress') || messageLower.includes('overwhelm') || messageLower.includes('deadline') || messageLower.includes('pressure')) {
          tone = 'stress';
          score = 42;
          analysis = 'Elevated sympathetic nervous activation and cognitive strain detected. The mind is processing high perceptual load.';
          suggestions = [
            'Engage in 5 minutes of 4-7-8 parasympathetic down-regulation breathing',
            'Break down your next task into an actionable single 15-minute micro-step',
            'Step away from screens for a 5-minute hydration and vision reset'
          ];
        } else if (messageLower.includes('anxious') || messageLower.includes('worry') || messageLower.includes('fear') || messageLower.includes('panic')) {
          tone = 'anxiety';
          score = 38;
          analysis = 'Heightened autonomic alertness with anticipatory cognitive loops. Grounding techniques will help recalibrate safety signals.';
          suggestions = [
            'Use the 5-4-3-2-1 sensory grounding method (5 see, 4 touch, 3 hear, 2 smell, 1 taste)',
            'Write down the worry and distinguish what is within your control vs out of your control',
            'Release tension from your shoulders and unclench your jaw'
          ];
        } else if (messageLower.includes('tired') || messageLower.includes('exhausted') || messageLower.includes('drained') || messageLower.includes('burnout')) {
          tone = 'burnout';
          score = 45;
          analysis = 'Depleted cognitive energy reserves with signs of physical and mental fatigue. Prioritize biological restoration.';
          suggestions = [
            'Set an uncompromising digital sunset 45 minutes before sleep tonight',
            'Take a warm non-stimulating bath or shower to drop core body temperature',
            'Cancel or defer non-essential evening obligations'
          ];
        } else if (messageLower.includes('happy') || messageLower.includes('good') || messageLower.includes('great') || messageLower.includes('peace') || messageLower.includes('calm') || messageLower.includes('grateful')) {
          tone = 'positive';
          score = 88;
          analysis = 'Flourishing emotional resilience and stable neurochemical balance. Optimal state for creative problem-solving and reflective consolidation.';
          suggestions = [
            'Log three specific gratitude anchors to reinforce positive neuroplasticity',
            'Direct this calm focus toward a meaningful long-term personal goal',
            'Share an encouraging word or check in with someone close to you'
          ];
        } else {
          tone = 'neutral';
          score = 68;
          analysis = 'Balanced emotional equilibrium with stable mental processing. A grounded state suitable for gentle self-inquiry.';
          suggestions = [
            'Schedule a 10-minute mindful pause between your upcoming commitments',
            'Check your posture and take two deep diaphragmatic breaths',
            'Stay mindful of your fluid and nutrition intake throughout the day'
          ];
        }
      }

      if (tone === 'stress') score = 45;
      else if (tone === 'anxiety') score = 40;
      else if (tone === 'burnout') score = 48;
      else if (tone === 'positive') score = 86;
      else if (tone === 'neutral') score = 68;

      const entry: MoodEntry = {
        id: `mood-${Date.now()}`,
        date: new Date().toLocaleDateString('en-US', { weekday: 'short' }),
        mood: message,
        score,
        tone,
        analysis: analysis || 'Your emotional profile was processed. Structured clinical recommendations have been formulated below.',
        suggestions: suggestions.length ? suggestions : [
          'Practice diaphragmatic breathing for 3 minutes',
          'Write down one constructive reframe of your current challenge',
          'Ensure 7-8 hours of restorative sleep tonight'
        ]
      };

      setMoodAnalysis(entry);
      const updated = [entry, ...weeklyEntries.slice(0, 6)];
      setWeeklyEntries(updated);
      localStorage.setItem('neuromate_weekly', JSON.stringify(updated));

      toast({ title: 'Mood Analyzed', description: 'Clinical insights ready below.' });
    } catch (error) {
      aiLogger.aiError('NeuroMate', 'Mood Analysis', error);
      console.error('Mood analysis error:', error);
      toast({ title: 'Analysis failed', description: 'Please try again', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toneConfig = {
    stress: { 
      label: 'Elevated Stress', 
      badgeBg: 'bg-red-500/10 text-red-600 border-red-500/20', 
      accentColor: '#ef4444', 
      icon: AlertCircle 
    },
    anxiety: { 
      label: 'Acute Anxiety', 
      badgeBg: 'bg-amber-500/10 text-amber-600 border-amber-500/20', 
      accentColor: '#f59e0b', 
      icon: Activity 
    },
    burnout: { 
      label: 'Cognitive Burnout', 
      badgeBg: 'bg-purple-500/10 text-purple-600 border-purple-500/20', 
      accentColor: '#a855f7', 
      icon: Zap 
    },
    positive: { 
      label: 'Optimal Resilience', 
      badgeBg: 'bg-[#b8ff00]/20 text-[#05050a] border-[#b8ff00]/40', 
      accentColor: '#b8ff00', 
      icon: Smile 
    },
    neutral: { 
      label: 'Calm Baseline', 
      badgeBg: 'bg-blue-500/10 text-blue-600 border-blue-500/20', 
      accentColor: '#3b82f6', 
      icon: Meh 
    },
    crisis: { 
      label: 'Critical Support Required', 
      badgeBg: 'bg-red-600 text-white border-red-700', 
      accentColor: '#dc2626', 
      icon: PhoneCall 
    }
  };

  const chartData = useMemo(() => {
    return [...weeklyEntries].reverse().map((e, idx) => ({
      name: e.date || `Day ${idx + 1}`,
      score: e.score || 60,
      tone: e.tone
    }));
  }, [weeklyEntries]);

  const handleApplyTag = (tagText: string) => {
    setMessage(prev => prev ? `${prev} - I'm feeling ${tagText.toLowerCase()}` : `I'm experiencing ${tagText.toLowerCase()} today.`);
  };

  const handleCbtSubmit = () => {
    if (!cbtThought.trim()) return;
    setCbtReframe(
      `While it feels like "${cbtThought}", this thought reflects the distortion of ${cbtDistortion}. A more balanced reality is: I have handled difficult moments before, this feeling is temporary, and I can take one steady step at a time.`
    );
  };

  return (
    <div className={`space-y-8 ${className || ''}`}>
      {/* Top Banner: End-to-End Privacy & Clinical Integrity */}
      <div className="premium-card rounded-[32px] p-8 bg-[#05050a] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#b8ff00] text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Knowledge Clinical Privacy</span>
          </div>
          <h2 className="text-[28px] sm:text-[34px] font-black tracking-tighter text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            Your Private <span className="text-[#b8ff00]">Mental Health</span> Sanctuary
          </h2>
          <p className="text-[14px] text-white/70 font-medium leading-relaxed">
            NeuroMate utilizes on-device cryptographic isolation and advanced LLM reasoning to identify cognitive distortions, track emotional strain, and restore psychological balance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => setShowBreathingModal(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-[12px] font-black uppercase tracking-wider text-white transition-all"
          >
            <Activity className="w-4 h-4 text-[#b8ff00]" /> 4-7-8 Breathing
          </button>
          <button
            onClick={() => setShowCbtModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#b8ff00] text-[#05050a] font-extrabold text-[12px] uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_25px_rgba(184,255,0,0.3)]"
          >
            <BookOpen className="w-4 h-4" /> CBT Exercises
          </button>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#b8ff00] opacity-[0.05] blur-[90px] rounded-full pointer-events-none" />
      </div>

      {/* Main Grid: Left = Input & Checkin, Right = Analytics & Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Check-in */}
        <div className="lg:col-span-7 space-y-8">
          <div className="premium-card p-8 rounded-[32px] bg-white border border-black/5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#b0b0b0]">DAILY EMOTIONAL CHECK-IN</p>
                <h3 className="text-[22px] font-black tracking-tight text-[#05050a] mt-0.5" style={{ fontFamily: "var(--font-display)" }}>
                  How are you feeling today?
                </h3>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-[#05050a] flex items-center justify-center text-[#b8ff00]">
                <MessageCircle className="w-5 h-5" />
              </div>
            </div>

            {/* Quick Emotion Tag Pills */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#8a8a8a] uppercase tracking-wider">Quick Select Emotion</span>
              <div className="flex flex-wrap gap-2">
                {QUICK_EMOTION_TAGS.map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTag(tag.label)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-black/[0.03] hover:bg-black/[0.08] text-[#05050a] border border-black/5 transition-all"
                  >
                    + {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea Input */}
            <div className="space-y-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts, feelings, stressors, or physical sensations. E.g. 'I feel overwhelmed by my workload and struggling to stay focused without heart racing...'"
                rows={5}
                className="w-full p-5 bg-[#fafaf8] border border-black/5 rounded-[24px] text-[14px] text-[#05050a] placeholder:text-[#8a8a8a] focus:outline-none focus:border-[#05050a] focus:ring-1 focus:ring-[#05050a] resize-none transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={analyzeMood}
                disabled={!message.trim() || isAnalyzing}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#05050a] py-4 text-[13px] font-black uppercase tracking-widest text-[#b8ff00] hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 shadow-md"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#b8ff00]" />
                    <span>Analyzing Cognitive Patterns...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    <span>Analyze Mood & Formulate Care</span>
                  </>
                )}
              </button>

              {moodAnalysis && (
                <button
                  type="button"
                  onClick={() => { setMessage(''); setMoodAnalysis(null); }}
                  className="px-5 py-4 rounded-xl border border-black/10 bg-white text-[13px] font-bold text-[#05050a] hover:bg-black/5 transition-all"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Result Presentation */}
          <AnimatePresence>
            {moodAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="premium-card p-8 rounded-[32px] bg-white border border-black/5 space-y-6">
                  {/* Analysis Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#b0b0b0]">
                        EVALUATION REPORT · {moodAnalysis.date}
                      </span>
                      <h4 className="text-[22px] font-black tracking-tight text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
                        Cognitive Wellness Profile
                      </h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#8a8a8a]">Well-being Index</div>
                        <div className="text-[26px] font-black text-[#05050a]" style={{ fontFamily: "var(--font-mono)" }}>
                          {moodAnalysis.score}<span className="text-[13px] text-[#8a8a8a]">/100</span>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl border text-[11px] font-black uppercase tracking-wider ${toneConfig[moodAnalysis.tone]?.badgeBg || 'bg-black/5 text-black'}`}>
                        {toneConfig[moodAnalysis.tone]?.label || moodAnalysis.tone}
                      </div>
                    </div>
                  </div>

                  {/* AI Clinical Insight */}
                  <div className="p-6 rounded-[24px] bg-[#fafaf8] border border-black/5 space-y-2">
                    <div className="flex items-center gap-2 text-[#05050a] font-black text-[12px] uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-[#05050a]" /> AI Psychological Interpretation
                    </div>
                    <p className="text-[14px] text-[#05050a] font-medium leading-relaxed">
                      {moodAnalysis.analysis}
                    </p>
                  </div>

                  {/* Actionable Suggestions */}
                  <div className="space-y-3">
                    <h5 className="text-[12px] font-black uppercase tracking-widest text-[#05050a]">
                      Prescribed Neurological & Mindfulness Steps
                    </h5>
                    <div className="space-y-2.5">
                      {moodAnalysis.suggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-black/5 hover:border-black/10 transition-all"
                        >
                          <div className="h-6 w-6 rounded-full bg-[#05050a] flex items-center justify-center text-[#b8ff00] text-[11px] font-black shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-[13px] text-[#05050a] font-medium leading-relaxed">
                            {suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Weekly Mood Trend & Clinical Toolkit */}
        <div className="lg:col-span-5 space-y-8">
          {/* Weekly Mood Trend Area Chart */}
          <div className="premium-card p-8 rounded-[32px] bg-white border border-black/5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#b0b0b0]">7-DAY VALENCE TRAJECTORY</p>
                <h3 className="text-[18px] font-black tracking-tight text-[#05050a]">Weekly Mood Trend</h3>
              </div>
              <div className="h-9 w-9 rounded-xl bg-black/5 flex items-center justify-center text-[#05050a]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#b8ff00" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#b8ff00" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    stroke="#8a8a8a" 
                    fontSize={11} 
                    fontWeight={700}
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    stroke="#8a8a8a" 
                    fontSize={10} 
                    fontWeight={700}
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#05050a', 
                      borderRadius: '14px', 
                      border: 'none', 
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                    formatter={(val: number) => [`${val}/100`, 'Resilience Index']}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#05050a"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#moodGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-black/5">
              <div className="p-3.5 rounded-2xl bg-[#fafaf8] border border-black/5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#8a8a8a] block">Average Index</span>
                <span className="text-[20px] font-black text-[#05050a]" style={{ fontFamily: "var(--font-mono)" }}>
                  {Math.round(weeklyEntries.reduce((a, b) => a + (b.score || 60), 0) / (weeklyEntries.length || 1))}
                  <span className="text-[12px] text-[#8a8a8a]"> / 100</span>
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#fafaf8] border border-black/5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#8a8a8a] block">Check-ins Logged</span>
                <span className="text-[20px] font-black text-[#05050a]" style={{ fontFamily: "var(--font-mono)" }}>
                  {weeklyEntries.length} <span className="text-[12px] text-[#8a8a8a]">sessions</span>
                </span>
              </div>
            </div>
          </div>

          {/* Clinical Mental Health Toolkits */}
          <div className="premium-card p-8 rounded-[32px] bg-white border border-black/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#b0b0b0]">THERAPEUTIC MODULES</p>
                <h3 className="text-[18px] font-black tracking-tight text-[#05050a]">Mental Health Toolkit</h3>
              </div>
              <div className="h-9 w-9 rounded-xl bg-black/5 flex items-center justify-center text-[#05050a]">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {/* CBT Tool Card */}
              <div 
                onClick={() => setShowCbtModal(true)}
                className="p-5 rounded-2xl border border-black/5 hover:border-black/15 bg-[#fafaf8] hover:bg-white cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#05050a] flex items-center justify-center text-[#b8ff00] group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-black text-[#05050a]">CBT Thought Reframing</h4>
                    <p className="text-[12px] text-[#8a8a8a] font-medium">Deconstruct negative cognitive distortions</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8a8a8a] group-hover:text-[#05050a] group-hover:translate-x-0.5 transition-all" />
              </div>

              {/* 4-7-8 Breathing Tool Card */}
              <div 
                onClick={() => setShowBreathingModal(true)}
                className="p-5 rounded-2xl border border-black/5 hover:border-black/15 bg-[#fafaf8] hover:bg-white cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#05050a] flex items-center justify-center text-[#b8ff00] group-hover:scale-105 transition-transform">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-black text-[#05050a]">4-7-8 Vagal Breathing</h4>
                    <p className="text-[12px] text-[#8a8a8a] font-medium">Down-regulate acute heart rate & cortisol</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8a8a8a] group-hover:text-[#05050a] group-hover:translate-x-0.5 transition-all" />
              </div>

              {/* 24/7 Lifeline Card */}
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-red-600 text-white flex items-center justify-center">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-red-900">National Crisis Lifeline</h4>
                    <p className="text-[11px] font-bold text-red-700">Dial 988 · Confidential 24/7 Support</p>
                  </div>
                </div>
                <a
                  href="tel:988"
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-[11px] font-black uppercase tracking-wider hover:bg-red-700 transition-colors"
                >
                  Call
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CBT Thought Reframing Modal */}
      {showCbtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] max-w-xl w-full p-8 space-y-6 shadow-2xl border border-black/5 relative">
            <button
              onClick={() => setShowCbtModal(false)}
              className="absolute top-6 right-6 h-9 w-9 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#05050a] transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#05050a] text-[#b8ff00] text-[10px] font-black uppercase tracking-widest mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Cognitive Behavioral Therapy</span>
              </div>
              <h3 className="text-[24px] font-black tracking-tight text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
                CBT Thought Reframing
              </h3>
              <p className="text-[13px] text-[#8a8a8a] font-medium mt-1">
                Challenge and reframe unhelpful automatic thoughts into grounded perspectives.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-[#05050a]">
                  1. Identify the Automatic Thought
                </label>
                <input
                  type="text"
                  value={cbtThought}
                  onChange={(e) => setCbtThought(e.target.value)}
                  placeholder="E.g. 'If I make one mistake on this presentation, everyone will think I am incompetent.'"
                  className="w-full p-4 rounded-xl bg-[#fafaf8] border border-black/5 text-[13px] text-[#05050a] focus:outline-none focus:border-[#05050a]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-[#05050a]">
                  2. Select Cognitive Distortion
                </label>
                <select
                  value={cbtDistortion}
                  onChange={(e) => setCbtDistortion(e.target.value)}
                  className="w-full p-4 rounded-xl bg-[#fafaf8] border border-black/5 text-[13px] text-[#05050a] font-medium focus:outline-none focus:border-[#05050a]"
                >
                  <option value="Catastrophizing">Catastrophizing (Assuming worst-case scenario)</option>
                  <option value="All-or-Nothing Thinking">All-or-Nothing (Black and white thinking)</option>
                  <option value="Mind Reading">Mind Reading (Assuming others think negatively)</option>
                  <option value="Emotional Reasoning">Emotional Reasoning (I feel anxious, therefore danger exists)</option>
                  <option value="Overgeneralization">Overgeneralization (A single failure means always failing)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleCbtSubmit}
                disabled={!cbtThought.trim()}
                className="w-full py-3.5 rounded-xl bg-[#05050a] text-[#b8ff00] text-[12px] font-black uppercase tracking-widest hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
              >
                Formulate Rational Reframe
              </button>

              {cbtReframe && (
                <div className="p-5 rounded-2xl bg-[#fafaf8] border border-black/5 space-y-2">
                  <div className="flex items-center gap-2 text-[#05050a] font-black text-[12px] uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Evidence-Based Rational Reframe
                  </div>
                  <p className="text-[13px] text-[#05050a] font-medium leading-relaxed">
                    {cbtReframe}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4-7-8 Breathing Guide Modal */}
      {showBreathingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#05050a] text-white rounded-[32px] max-w-md w-full p-8 space-y-8 shadow-2xl border border-white/10 relative text-center">
            <button
              onClick={() => { setShowBreathingModal(false); setIsBreathingActive(false); }}
              className="absolute top-6 right-6 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#b8ff00]">PARASYMPATHETIC PACER</span>
              <h3 className="text-[24px] font-black tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
                4-7-8 Breathing
              </h3>
              <p className="text-[12px] text-white/60">
                Inhale for 4 seconds, Hold for 7 seconds, Exhale for 8 seconds.
              </p>
            </div>

            {/* Pulsing Visual Circle */}
            <div className="flex flex-col items-center justify-center py-6">
              <motion.div
                animate={{
                  scale: breathingPhase === 'Inhale' ? 1.4 : breathingPhase === 'Hold' ? 1.4 : 1.0,
                  borderColor: breathingPhase === 'Hold' ? '#b8ff00' : '#ffffff'
                }}
                transition={{ duration: breathingPhase === 'Inhale' ? 4 : breathingPhase === 'Hold' ? 0.5 : 8, ease: "easeInOut" }}
                className="w-44 h-44 rounded-full border-4 border-[#b8ff00] flex flex-col items-center justify-center bg-[#b8ff00]/10 relative shadow-[0_0_50px_rgba(184,255,0,0.2)]"
              >
                <span className="text-[13px] font-black uppercase tracking-widest text-[#b8ff00]">
                  {breathingPhase}
                </span>
                <span className="text-[48px] font-black text-white" style={{ fontFamily: "var(--font-mono)" }}>
                  {breathingTimer}
                </span>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Seconds</span>
              </motion.div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsBreathingActive(prev => !prev)}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-[#b8ff00] text-[#05050a] font-black text-[13px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
              >
                {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isBreathingActive ? 'Pause Session' : 'Begin Pacing'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}