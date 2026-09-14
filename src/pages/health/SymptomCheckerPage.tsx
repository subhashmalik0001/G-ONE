import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LoadingShimmer } from "@/components/ui/loading-shimmer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Stethoscope, Sparkles, AlertTriangle, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { EmergencyTriage } from "@/components/ai/emergency-triage";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const SymptomCheckerPage = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout currentRole="patient">
      <div className="space-y-8 max-w-[1200px] mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#05050a] text-[#b8ff00] text-[10px] font-black uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#b8ff00]" />
              <span>Diagnostic Engine Active</span>
            </div>
            <h1 className="text-[34px] sm:text-[42px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
              AI Symptom Checker
            </h1>
            <p className="text-[14px] text-[#8a8a8a] mt-1 font-medium">
              Real-time clinical symptom analysis with Gemini 3.6 Flash triage recommendations.
            </p>
          </div>

          <button
            onClick={() => navigate("/health")}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/5 bg-white text-[12px] font-bold text-[#05050a] hover:bg-black/5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Health Hub
          </button>
        </div>

        <ErrorBoundary 
          fallback={
            <div className="premium-card rounded-[32px] p-8 text-center">
              <LoadingShimmer lines={3} showIcon />
              <p className="text-[#8a8a8a] mt-4 text-sm font-medium">
                Unable to load symptom triage module.
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-[#05050a] text-[#b8ff00] rounded-xl"
              >
                Reload Component
              </Button>
            </div>
          }
        >
          {/* How G-ONE Triage Works */}
          <div className="premium-card rounded-[32px] p-6 sm:p-8">
            <h2 className="text-[18px] sm:text-[20px] font-black text-[#05050a] tracking-tight mb-4 flex items-center gap-2.5" style={{ fontFamily: "var(--font-display)" }}>
              <span>How G-ONE Clinical Triage Works</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { step: "1", title: "Describe Symptoms", desc: "Type or use voice to explain your condition, duration, and severity." },
                { step: "2", title: "AI Analysis", desc: "Clinical models cross-reference medical databases to assess urgency." },
                { step: "3", title: "Triage & Care Plan", desc: "Receive immediate actionable recommendations and clinical next steps." },
              ].map((item) => (
                <div key={item.step} className="p-4 rounded-2xl bg-[#fafaf8] border border-black/5 space-y-1.5">
                  <span className="h-7 w-7 rounded-xl bg-[#05050a] text-[#b8ff00] text-[11px] font-black flex items-center justify-center">
                    {item.step}
                  </span>
                  <h3 className="font-bold text-[14px] text-[#05050a]">{item.title}</h3>
                  <p className="text-[12px] text-[#8a8a8a] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Main Triage Interactive Component */}
          <div className="premium-card rounded-[32px] p-6 sm:p-8 shadow-sm">
            <EmergencyTriage />
          </div>

          {/* Medical Disclaimer */}
          <div className="premium-card rounded-[24px] p-5 border-l-[6px] border-l-[#4c6ef5] flex items-start gap-4">
            <ShieldCheck className="text-[#4c6ef5] w-6 h-6 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-black text-[13px] text-[#05050a] uppercase tracking-wider">
                Clinical Safety Standard
              </h4>
              <p className="text-[12px] text-[#8a8a8a] leading-relaxed">
                G-ONE Symptom Checker provides evidence-based information to assist healthcare decisions. It does not replace clinical diagnosis by a licensed physician. If you experience chest pain, difficulty breathing, or severe trauma, seek immediate medical care or call 108.
              </p>
            </div>
          </div>
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  );
};

export default SymptomCheckerPage;
