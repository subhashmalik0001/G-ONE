import { motion } from "framer-motion";
import { Activity, Brain, Pill, ShieldAlert, FileText, MapPin, ChevronRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const toolkitActions = [
  {
    id: "symptom-check",
    title: "Symptom Check",
    subtitle: "AI-powered diagnosis",
    icon: Activity,
    badge: "24/7 AI",
    path: "/health/symptom-checker"
  },
  {
    id: "mental-health",
    title: "Mental Health",
    subtitle: "Talk to AI therapist",
    icon: Brain,
    badge: "Private",
    path: "/health/mental-health"
  },
  {
    id: "prescription",
    title: "Scan Medicine",
    subtitle: "Read prescriptions",
    icon: Pill,
    badge: "OCR AI",
    path: "/tools/prescription-scanner"
  },
  {
    id: "first-aid",
    title: "First Aid",
    subtitle: "Visual wound checker",
    icon: ShieldAlert,
    badge: "Instant",
    path: "/tools/first-aid"
  },
  {
    id: "health-records",
    title: "Health Records",
    subtitle: "Digital patient files",
    icon: FileText,
    badge: "Vault",
    path: "/health-records"
  },
  {
    id: "pharmacy",
    title: "Find Medicine",
    subtitle: "Check availability",
    icon: MapPin,
    badge: "Nearby",
    path: "/pharmacy"
  }
];

export function QuickActionsSection() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-black/[0.04]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#05050a] text-[#b8ff00] text-[10px] font-black uppercase tracking-widest mb-2">
            <Sparkles className="w-3 h-3 text-[#b8ff00]" />
            <span>Clinical Suite</span>
          </div>
          <h2 className="text-[28px] sm:text-[34px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
            Your <span className="text-[#b8ff00] bg-[#05050a] px-3 py-0.5 rounded-xl inline-block rotate-[-1deg]">Health Toolkit</span>
          </h2>
          <p className="text-[14px] font-medium text-[#8a8a8a] mt-2 max-w-xl">
            Quick access to AI-powered health services designed for your wellbeing.
          </p>
        </div>

        <button
          onClick={() => navigate("/tools")}
          className="text-[12px] font-bold text-[#8a8a8a] hover:text-[#05050a] transition-colors flex items-center gap-1 shrink-0"
        >
          View all 12 tools <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of 6 Modern Toolkit Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {toolkitActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.path)}
              className="group cursor-pointer rounded-[24px] bg-white border border-black/5 p-5 shadow-xs hover:shadow-xl hover:shadow-black/5 transition-all duration-300 flex flex-col justify-between min-h-[140px] relative overflow-hidden"
            >
              {/* Top row: Icon & Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="h-11 w-11 rounded-2xl bg-[#05050a] text-[#b8ff00] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-md shadow-black/5">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-[#fafaf8] border border-black/5 text-[#8a8a8a] group-hover:bg-[#05050a] group-hover:text-[#b8ff00] transition-colors">
                  {action.badge}
                </span>
              </div>

              {/* Bottom row: Title, Subtitle & Arrow */}
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-[16px] font-black tracking-tight text-[#05050a] transition-colors group-hover:text-black" style={{ fontFamily: "var(--font-display)" }}>
                    {action.title}
                  </h3>
                  <p className="text-[12px] font-medium text-[#8a8a8a] mt-0.5">
                    {action.subtitle}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center text-[#8a8a8a] group-hover:bg-[#05050a] group-hover:text-[#b8ff00] transition-all shrink-0">
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
