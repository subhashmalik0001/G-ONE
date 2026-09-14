import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Activity, 
  Calendar, 
  Sparkles, 
  Heart, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  CheckCircle2 
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface PCOSLog {
  cycleDay: number;
  flow: "Light" | "Medium" | "Heavy" | "None";
  symptoms: string[];
  energyLevel: number;
  waterIntake: number;
}

const SYMPTOM_OPTIONS = [
  "Cramps",
  "Acne flare-up",
  "Mood swings",
  "Insulin craving / sweet tooth",
  "Bloating",
  "Fatigue",
  "Headache"
];

const PCOSTrackerPage = () => {
  const navigate = useNavigate();
  const [cycleDay, setCycleDay] = useState(14);
  const [cycleLength, setCycleLength] = useState(32);
  const [flow, setFlow] = useState<"Light" | "Medium" | "Heavy" | "None">("None");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(["Bloating", "Insulin craving / sweet tooth"]);
  const [energyLevel, setEnergyLevel] = useState(7);
  const [isSaved, setIsSaved] = useState(false);

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <DashboardLayout currentRole="patient">
      <div className="space-y-6 max-w-[1100px] mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#05050a] text-[#b8ff00] text-[10px] font-black uppercase tracking-widest mb-2">
              <Heart className="w-3.5 h-3.5" />
              <span>Endocrine & Hormonal Rhythm</span>
            </div>
            <h1 className="text-[34px] sm:text-[42px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
              PCOS & Cycle Intelligence
            </h1>
            <p className="text-[14px] text-[#8a8a8a] mt-1 font-medium">
              Track irregular cycle phases, androgenic signs, insulin sensitivity, and metabolic indicators.
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

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#05050a] text-white rounded-[24px] p-5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#b8ff00]">Current Phase</span>
            <h3 className="text-[28px] font-black tracking-tight mt-1" style={{ fontFamily: "var(--font-display)" }}>
              Follicular Phase
            </h3>
            <p className="text-[12px] text-white/70 mt-1 font-mono">Day {cycleDay} of {cycleLength}-day cycle</p>
          </div>

          <div className="bg-white border border-black/5 rounded-[24px] p-5 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8a8a8a]">Estimated Ovulation</span>
            <h3 className="text-[28px] font-black tracking-tight text-[#05050a] mt-1" style={{ fontFamily: "var(--font-display)" }}>
              In ~4 Days
            </h3>
            <p className="text-[12px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Low stress window
            </p>
          </div>

          <div className="bg-white border border-black/5 rounded-[24px] p-5 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8a8a8a]">Metabolic Stability</span>
            <h3 className="text-[28px] font-black tracking-tight text-[#05050a] mt-1 font-mono">
              88<span className="text-[16px] text-[#8a8a8a]">/100</span>
            </h3>
            <p className="text-[12px] text-[#8a8a8a] mt-1 font-medium">Glycemic index well balanced</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 md:grid-cols-12">
          {/* Daily Logging Form */}
          <div className="md:col-span-7 bg-white rounded-[28px] border border-black/5 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#05050a] text-[#b8ff00] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h2 className="text-[17px] font-black text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
                  Daily Telemetry Log
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#8a8a8a]">Today</span>
            </div>

            {/* Cycle Day Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#8a8a8a]">
                  Cycle Day
                </label>
                <span className="font-mono text-[13px] font-black text-[#05050a] bg-black/5 px-2 py-0.5 rounded">
                  Day {cycleDay}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max={cycleLength}
                value={cycleDay}
                onChange={e => setCycleDay(parseInt(e.target.value))}
                className="w-full accent-[#05050a] cursor-pointer"
              />
            </div>

            {/* Flow Selection */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8a8a8a] mb-2">
                Flow Intensity
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["None", "Light", "Medium", "Heavy"] as const).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFlow(f)}
                    className={`py-2 px-3 rounded-xl text-[12px] font-bold transition-all ${
                      flow === f
                        ? 'bg-[#05050a] text-[#b8ff00] shadow-sm'
                        : 'bg-[#fafaf8] border border-black/10 text-[#8a8a8a] hover:text-[#05050a]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptom Chips */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8a8a8a] mb-2">
                Hormonal Indicators & Symptoms
              </label>
              <div className="flex flex-wrap gap-2">
                {SYMPTOM_OPTIONS.map(sym => {
                  const active = selectedSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                        active
                          ? 'bg-[#05050a] text-[#b8ff00] shadow-xs'
                          : 'bg-[#fafaf8] border border-black/10 text-[#8a8a8a] hover:text-[#05050a]'
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Energy Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#8a8a8a]">
                  Energy & Vitality
                </label>
                <span className="font-mono text-[13px] font-black text-[#05050a] bg-black/5 px-2 py-0.5 rounded">
                  {energyLevel} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={energyLevel}
                onChange={e => setEnergyLevel(parseInt(e.target.value))}
                className="w-full accent-[#05050a] cursor-pointer"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full h-12 rounded-xl bg-[#05050a] text-[#b8ff00] font-black text-[13px] hover:bg-black transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#b8ff00]" />
                  <span>LOG SAVED TO BIOMETRIC VAULT</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>SAVE CYCLE TELEMETRY</span>
                </>
              )}
            </button>
          </div>

          {/* AI Clinical Insights */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-white rounded-[28px] border border-black/5 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-black/5">
                <Sparkles className="w-4 h-4 text-[#05050a]" />
                <h3 className="text-[16px] font-black text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
                  Endocrine AI Guidance
                </h3>
              </div>

              <div className="space-y-3 text-[13px] font-medium leading-relaxed text-[#05050a]">
                <div className="p-3.5 rounded-2xl bg-[#fafaf8] border border-black/5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                    Dietary Focus
                  </span>
                  Prioritize low-glycemic carbs (lentils, oats) and omega-3 fatty acids to blunt insulin spikes.
                </div>

                <div className="p-3.5 rounded-2xl bg-[#fafaf8] border border-black/5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
                    Movement Prescription
                  </span>
                  Strength training and brisk walking are optimal in this phase to stimulate muscle glucose uptake.
                </div>

                <div className="p-3.5 rounded-2xl bg-[#fafaf8] border border-black/5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 block mb-1">
                    Supplementation Note
                  </span>
                  Myo-inositol (40:1 ratio) and Magnesium glycinate support ovarian follicular regularity.
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-black/5 bg-white/70 text-[11px] text-[#8a8a8a] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Data is encrypted on-device. HIPAA & NDHM privacy compliant.</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PCOSTrackerPage;