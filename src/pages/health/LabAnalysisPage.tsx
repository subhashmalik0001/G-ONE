import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Sparkles, ShieldCheck } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LabAI } from "@/components/ai/lab-ai";

const LabAnalysisPage = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout currentRole="patient">
      <div className="space-y-6 max-w-[1100px] mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#05050a] text-[#b8ff00] text-[10px] font-black uppercase tracking-widest mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>Biochemical Diagnostic OCR</span>
            </div>
            <h1 className="text-[34px] sm:text-[42px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
              Lab Report Analyzer
            </h1>
            <p className="text-[14px] text-[#8a8a8a] mt-1 font-medium">
              Upload blood tests, pathology panels, and CBC reports for instant AI biomarker interpretation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> HIPAA Compliant Local OCR
            </div>
            <button
              onClick={() => navigate("/health")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/5 bg-white text-[12px] font-bold text-[#05050a] hover:bg-black/5 transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Health
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
          <LabAI />
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default LabAnalysisPage;