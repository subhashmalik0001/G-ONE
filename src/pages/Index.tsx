import { useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PatientDashboardView from "@/components/dashboard/PatientDashboardView";
import { QuickActionsSection } from "@/components/sections/quick-actions-section";
import { HealthMetricsSection } from "@/components/sections/health-metrics-section";
import { useLanguage } from "@/contexts/language-context";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useNavigate } from "react-router-dom";
import { Eye, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Index() {
  const mainRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <ErrorBoundary>
      <DashboardLayout currentRole="patient">
        <div ref={mainRef} className="space-y-12">
          {/* Main New Visual Identity & Vitals Dashboard */}
          <PatientDashboardView />

          {/* Quick Health Actions Section - Your Health Toolkit */}
          <section className="premium-card rounded-[32px] p-6 sm:p-8">
            <QuickActionsSection />
          </section>

          {/* Health Modules & Specialty Diagnostics */}
          <section className="premium-card rounded-[32px] p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Clinical Suite</p>
                <h2 className="text-2xl font-black text-[#05050a] tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                  {t('health.modules')}
                </h2>
              </div>
              <button 
                onClick={() => navigate("/tools")}
                className="text-[12px] font-bold text-[#4c6ef5] hover:underline"
              >
                Explore All 12 Tools →
              </button>
            </div>
            <HealthMetricsSection />
          </section>

          {/* Eye Control Assistive Access Trigger */}
          <motion.div
            className="fixed bottom-24 right-28 sm:bottom-24 sm:right-32 z-40 hidden sm:block"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <motion.button
              onClick={() => navigate("/tools/eye-control")}
              className="group relative w-12 h-12 bg-white hover:bg-[#05050a] text-[#05050a] hover:text-[#b8ff00] rounded-2xl shadow-xl border border-black/10 transition-all duration-300 flex items-center justify-center"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              title="Eye Control — Assistive Gaze Interface"
            >
              <Eye className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
}
