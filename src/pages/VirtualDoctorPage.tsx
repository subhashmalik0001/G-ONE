import { motion } from "framer-motion";
import { ArrowLeft, Stethoscope, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VirtualDoctorAvatar from "@/components/ai/virtual-doctor-avatar";

const VirtualDoctorPage = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout currentRole="patient">
      <div className="space-y-6 max-w-[1100px] mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#05050a] text-[#b8ff00] text-[10px] font-black uppercase tracking-widest mb-2">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Interactive Tele-Consultation</span>
            </div>
            <h1 className="text-[34px] sm:text-[42px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
              Virtual Doctor
            </h1>
            <p className="text-[14px] text-[#8a8a8a] mt-1 font-medium">
              Real-time conversational medical avatar with voice synthesis and symptom triage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/5 bg-white text-[12px] font-bold text-[#05050a] hover:bg-black/5 transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
          </div>
        </div>

        {/* Avatar Component Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-[28px] border border-black/5 p-4 sm:p-6 shadow-sm"
        >
          <VirtualDoctorAvatar />
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default VirtualDoctorPage;