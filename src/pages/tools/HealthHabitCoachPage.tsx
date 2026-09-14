import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Target, CheckCircle2, Flame, History, Zap } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { aiClient } from "@/lib/ai-client";
import { toast } from "@/components/ui/use-toast";
import { aiLogger } from "@/lib/ai-logger";

const SUGGESTIONS = [
  ["No caffeine after 6 PM", "Try 5-minute gratitude journaling", "10-minute evening walk"],
  ["Drink 8 glasses of water", "Do 5 minutes of deep box breathing", "Eat a fruit with breakfast"],
  ["Wind down by 10 PM", "Take a 15-minute sunshine walk", "Write down 3 daily wins"],
  ["Limit screen time after 9 PM", "Calf and hamstring stretch", "Mindful hydration check-in"],
];

const getAIPersonalizedChallenges = async (mood: string, symptoms: string) => {
  aiLogger.aiStart('Health Habit Coach', 'Challenge Generation', `${mood} | ${symptoms}`);
  
  try {
    const prompt = `Based on mood: "${mood}" and symptoms: "${symptoms}", provide 3 personalized health habit challenges for the next 3 days. Focus on simple, actionable habits that address the specific mood and symptoms mentioned.`;
    const response = await aiClient.getHealthAdvice(prompt, 'en');
    
    const challenges = response.advice.split(/[.!]/).filter(s => s.trim().length > 10).slice(0, 3);
    const result = challenges.length >= 3 ? challenges : SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)];
    
    aiLogger.aiSuccess('Health Habit Coach', 'Challenge Generation', { challenges: result.length });
    return result;
  } catch (error) {
    aiLogger.aiError('Health Habit Coach', 'Challenge Generation', error);
    return SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)];
  }
};

const getChallenges = () => {
  const stored = localStorage.getItem('health-habit-challenges');
  return stored ? JSON.parse(stored) : [];
};

const addChallenge = (date: string, mood: string, symptoms: string, challenges: string[]) => {
  const challengeList = getChallenges();
  const newChallenge = {
    id: Date.now(),
    date,
    mood,
    symptoms,
    challenges,
    progress: 0
  };
  challengeList.unshift(newChallenge);
  localStorage.setItem('health-habit-challenges', JSON.stringify(challengeList));
};

const updateChallengeProgress = (id: number, progress: number) => {
  const challengeList = getChallenges();
  const updated = challengeList.map((challenge: any) => 
    challenge.id === id ? { ...challenge, progress } : challenge
  );
  localStorage.setItem('health-habit-challenges', JSON.stringify(updated));
};

const HealthHabitCoachPage = () => {
  const navigate = useNavigate();
  const [mood, setMood] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const challenges = getChallenges();
    setHistory(challenges);
    setCurrentChallenge(challenges[0] || null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood && !symptoms) return;
    
    setIsGenerating(true);
    try {
      const challenges = await getAIPersonalizedChallenges(mood, symptoms);
      const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      addChallenge(date, mood, symptoms, challenges);
      const updated = getChallenges();
      setHistory(updated);
      setCurrentChallenge(updated[0]);
      setMood("");
      setSymptoms("");
      toast({ title: '🎯 AI Habits Generated', description: 'Your personalized micro-challenge is active' });
    } catch (error) {
      toast({ title: 'Generation failed', description: 'Please try again', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProgress = (id: number, progress: number) => {
    updateChallengeProgress(id, progress);
    const updated = getChallenges();
    setHistory(updated);
    if (currentChallenge && currentChallenge.id === id) {
      setCurrentChallenge({ ...currentChallenge, progress });
    }
  };

  return (
    <DashboardLayout currentRole="patient">
      <div className="space-y-6 max-w-[1100px] mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#05050a] text-[#b8ff00] text-[10px] font-black uppercase tracking-widest mb-2">
              <Target className="w-3.5 h-3.5" />
              <span>Behavioral Health & Micro-Habits</span>
            </div>
            <h1 className="text-[34px] sm:text-[42px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
              AI Health Habit Coach
            </h1>
            <p className="text-[14px] text-[#8a8a8a] mt-1 font-medium">
              Adaptive micro-challenges calibrated to your daily cognitive mood and physical symptoms.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/tools")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/5 bg-white text-[12px] font-bold text-[#05050a] hover:bg-black/5 transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Tools
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          {/* Form Card */}
          <div className="md:col-span-6 bg-white rounded-[28px] border border-black/5 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-black/5">
              <div className="w-8 h-8 rounded-xl bg-[#05050a] text-[#b8ff00] flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <h2 className="text-[17px] font-black text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
                Today's Calibration
              </h2>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8a8a8a] mb-1.5">
                  How are you feeling today?
                </label>
                <input
                  type="text"
                  className="w-full h-11 px-3.5 rounded-xl border border-black/10 bg-[#fafaf8] text-[13.5px] font-medium text-[#05050a] focus:outline-none focus:ring-2 focus:ring-[#05050a]"
                  placeholder="e.g. Sluggish, High Stress, Sore Back, Energetic..."
                  value={mood}
                  onChange={e => setMood(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8a8a8a] mb-1.5">
                  Any physical symptoms?
                </label>
                <input
                  type="text"
                  className="w-full h-11 px-3.5 rounded-xl border border-black/10 bg-[#fafaf8] text-[13.5px] font-medium text-[#05050a] focus:outline-none focus:ring-2 focus:ring-[#05050a]"
                  placeholder="e.g. Mild headache, Eye strain, Tight shoulders..."
                  value={symptoms}
                  onChange={e => setSymptoms(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={(!mood && !symptoms) || isGenerating}
                className="w-full h-12 rounded-xl bg-[#05050a] text-[#b8ff00] font-black text-[13px] hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#b8ff00]/30 border-t-[#b8ff00] rounded-full animate-spin" />
                    <span>SYNTHESIZING CHALLENGES...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>GENERATE 3-DAY PROTOCOL</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Active Challenge Card */}
          <div className="md:col-span-6 space-y-4">
            {currentChallenge ? (
              <div className="bg-[#05050a] text-white rounded-[28px] p-6 shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#b8ff00]">
                    Active 3-Day Micro-Plan ({currentChallenge.date})
                  </span>
                  <span className="text-[11px] font-mono text-white/60">
                    {currentChallenge.mood || "Balanced"}
                  </span>
                </div>

                <div className="space-y-2.5 my-4">
                  {currentChallenge.challenges.map((c: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                      <div className="w-5 h-5 rounded-full bg-[#b8ff00] text-[#05050a] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-[13px] text-white/90 font-medium leading-relaxed">{c}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[12px] font-bold text-white/70">Completion Progress:</span>
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3].map(p => (
                      <button
                        key={p}
                        onClick={() => handleProgress(currentChallenge.id, p)}
                        className={`w-8 h-8 rounded-lg font-mono text-[12px] font-bold transition-all ${
                          currentChallenge.progress === p
                            ? 'bg-[#b8ff00] text-[#05050a] shadow-sm'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <span className="text-[11px] text-white/40 font-mono ml-1">/ 3 Days</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[220px] rounded-[28px] border-2 border-dashed border-black/10 bg-white/50 flex flex-col items-center justify-center p-6 text-center">
                <Target className="w-10 h-10 text-[#8a8a8a] mb-2" />
                <h3 className="text-[15px] font-black text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
                  No Active Habit Challenge
                </h3>
                <p className="text-[12px] text-[#8a8a8a] mt-1 max-w-[260px]">
                  Fill in your mood and symptoms to generate your next 3-day health routine.
                </p>
              </div>
            )}

            {/* History Card */}
            {history.length > 1 && (
              <div className="bg-white rounded-[28px] border border-black/5 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <History className="w-4 h-4 text-[#8a8a8a]" />
                  <h3 className="text-[15px] font-black text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
                    Habit History
                  </h3>
                </div>

                <div className="space-y-3">
                  {history.slice(1, 4).map((c: any) => (
                    <div key={c.id} className="p-3 rounded-2xl bg-[#fafaf8] border border-black/5 text-[12px]">
                      <div className="flex justify-between items-center font-bold text-[#05050a] mb-1">
                        <span>{c.date}</span>
                        <span className="font-mono text-[10px] text-[#8a8a8a]">Progress {c.progress}/3</span>
                      </div>
                      <p className="text-[#8a8a8a] truncate">{c.challenges.join(" · ")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HealthHabitCoachPage;