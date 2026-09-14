import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldAlert, Sparkles, PhoneCall } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FirstAidAdvisor from "@/components/ai/first-aid-advisor";

const FirstAidAdvisorPage = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout currentRole="patient">
      <div className="space-y-6 max-w-[1100px] mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500 text-white text-[10px] font-black uppercase tracking-widest mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Emergency Triage & Wound Analysis</span>
            </div>
            <h1 className="text-[34px] sm:text-[42px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
              First Aid Advisor
            </h1>
            <p className="text-[14px] text-[#8a8a8a] mt-1 font-medium">
              Computer vision injury classification, step-by-step triage protocols, and tourniquet/burn guidance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/sos")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-[12px] font-black hover:bg-red-700 transition-all shadow-sm animate-pulse"
            >
              <PhoneCall className="w-4 h-4" /> Call SOS (112)
            </button>
            <button
              onClick={() => navigate("/tools")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/5 bg-white text-[12px] font-bold text-[#05050a] hover:bg-black/5 transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Tools
            </button>
          </div>
        </div>

        {/* Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-[28px] border border-black/5 p-4 sm:p-6 shadow-sm"
        >
          <FirstAidAdvisor />
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default FirstAidAdvisorPage;