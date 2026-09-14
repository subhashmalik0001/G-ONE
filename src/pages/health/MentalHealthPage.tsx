import { useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, ShieldCheck } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { NeuroMate } from "@/components/ai/neuromate";

const MentalHealthPage = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout currentRole="patient">
      <div className="space-y-10 max-w-[1400px] mx-auto pb-20 px-2 sm:px-4">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-black/5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#05050a] text-[#b8ff00] text-[10px] font-black uppercase tracking-widest">
              <Brain className="w-3.5 h-3.5" />
              <span>Cognitive & Emotional Support</span>
            </div>
            <h1 className="text-[36px] sm:text-[42px] font-black tracking-tighter text-[#05050a] leading-[1.1]" style={{ fontFamily: "var(--font-display)" }}>
              NeuroMate <span className="text-[#b8ff00] bg-[#05050a] px-3 rounded-xl inline-block rotate-[-1deg]">Wellness</span> Companion
            </h1>
            <p className="text-[15px] font-medium text-[#8a8a8a] max-w-xl">
              Private AI companion for real-time stress mitigation, cognitive reframing, and long-term emotional resilience.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> End-to-End Private
            </div>
            <button
              onClick={() => navigate("/health")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/5 bg-white text-[12px] font-bold text-[#05050a] hover:bg-black/5 transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Health
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div>
          <NeuroMate />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MentalHealthPage;