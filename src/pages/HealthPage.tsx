import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Activity, Brain, Heart, Stethoscope, ChevronRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HealthMetricsCard } from "@/components/dashboard/health-metrics-card";
import { useLanguage } from "@/contexts/language-context";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const HealthPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const healthFeatures = [
    {
      id: "symptom-checker",
      title: t('ai.symptom.checker'),
      description: t('get.ai.powered.analysis'),
      icon: <Stethoscope className="w-5 h-5" />,
      color: "#05050a",
      path: "/health/symptom-checker",
      badge: "AI Triage"
    },
    {
      id: "emg-monitor",
      title: "EMG Muscle Monitor",
      description: "Real-time muscle signal capture via Arduino Uno — fatigue and strain alerts",
      icon: <Activity className="w-5 h-5" />,
      color: "#05050a",
      path: "/health/emg",
      badge: "Sensors"
    },
    {
      id: "lab-analysis",
      title: t('report.analysis'),
      description: t('ai.powered.lab.analysis'),
      icon: <Activity className="w-5 h-5" />,
      color: "#05050a",
      path: "/health/lab-analysis",
      badge: "Vision AI"
    },
    {
      id: "mental-health",
      title: t('mental.health.assistant'),
      description: t('talk.to.ai.therapist'),
      icon: <Brain className="w-5 h-5" />,
      color: "#05050a",
      path: "/health/mental-health",
      badge: "CBT Guide"
    },
    {
      id: "sleep-health",
      title: t('sleep.health.analyzer'),
      description: t('track.analyze.sleep'),
      icon: <Activity className="w-5 h-5" />,
      color: "#05050a",
      path: "/health/sleep-analyzer",
      badge: "Circadian"
    },
    {
      id: "diet-advisor",
      title: t('diet.advisor'),
      description: t('personalized.nutrition.advice'),
      icon: <Heart className="w-5 h-5" />,
      color: "#05050a",
      path: "/health/diet-advisor",
      badge: "NutriGuide"
    },
    {
      id: "vaccine-tracker",
      title: t('child.vaccine.tracker'),
      description: t('track.vaccination.schedules'),
      icon: <Heart className="w-5 h-5" />,
      color: "#05050a",
      path: "/health/vaccine-tracker",
      badge: "Pediatric"
    },
    {
      id: "cognitive-health",
      title: t('cognitive.health.screener'),
      description: t('monitor.cognitive.function'),
      icon: <Brain className="w-5 h-5" />,
      color: "#05050a",
      path: "/health/cognitive-health",
      badge: "Cognitive"
    }
  ];

  const mockHealthMetrics = [
    {
      label: t('heart.rate'),
      value: 72,
      maxValue: 100,
      status: "good" as const,
      icon: <Heart className="w-4 h-4" />,
      unit: " bpm"
    },
    {
      label: t('sleep.quality'),
      value: 65,
      maxValue: 100,
      status: "warning" as const,
      icon: <Activity className="w-4 h-4" />,
      unit: "%"
    },
    {
      label: "Stress Level",
      value: 30,
      maxValue: 100,
      status: "good" as const,
      icon: <Brain className="w-4 h-4" />,
      unit: "%"
    }
  ];

  return (
    <DashboardLayout currentRole="patient">
      <div className="space-y-8 max-w-[1400px] mx-auto pb-16">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#05050a] text-[#b8ff00] text-[10px] font-black uppercase tracking-widest mb-2">
              <Sparkles className="w-3 h-3 text-[#b8ff00]" />
              <span>Diagnostic Center</span>
            </div>
            <h1 className="text-[34px] sm:text-[42px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
              {t('health.dashboard')}
            </h1>
            <p className="text-[14px] text-[#8a8a8a] mt-1 font-medium">
              {t('your.complete.health.overview')}
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/5 bg-white text-[12px] font-bold text-[#05050a] hover:bg-black/5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>

        {/* Health Metrics Card */}
        <div className="premium-card rounded-[32px] p-6 sm:p-8">
          <HealthMetricsCard metrics={mockHealthMetrics} />
        </div>

        {/* Health Features Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[20px] font-black tracking-tight text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
              {t('health.features')}
            </h2>
            <span className="text-[11px] font-bold text-[#8a8a8a]">8 Active Modules</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthFeatures.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(feature.path)}
                className="premium-card rounded-[24px] p-6 cursor-pointer hover:border-black/10 group flex items-start gap-4 transition-all"
              >
                <div className="h-12 w-12 rounded-2xl bg-[#05050a] text-[#b8ff00] flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 shadow-md">
                  {feature.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-black text-[15px] text-[#05050a] tracking-tight truncate group-hover:text-[#4c6ef5] transition-colors" style={{ fontFamily: "var(--font-display)" }}>
                      {feature.title}
                    </h3>
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#05050a] bg-[#b8ff00] px-2 py-0.5 rounded-md shrink-0">
                      {feature.badge}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[#8a8a8a] leading-relaxed line-clamp-2">
                    {feature.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#b0b0b0] group-hover:text-[#05050a] group-hover:translate-x-1 transition-all self-center shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HealthPage;