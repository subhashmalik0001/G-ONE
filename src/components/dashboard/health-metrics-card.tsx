import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HealthMetric {
  label: string;
  value: number;
  maxValue: number;
  status: "good" | "warning" | "critical";
  icon: React.ReactNode;
  unit?: string;
}

interface HealthMetricsCardProps {
  metrics: HealthMetric[];
  className?: string;
}

export function HealthMetricsCard({ metrics, className }: HealthMetricsCardProps) {
  if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
    return (
      <div className={cn("p-6 text-center text-sm text-[#8a8a8a]", className)}>
        No health metrics available
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const percent = Math.min(100, Math.round((metric.value / metric.maxValue) * 100));
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -2 }}
              className="p-5 rounded-[24px] bg-[#fafaf8] border border-black/5 hover:border-black/10 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#05050a] text-[#b8ff00] flex items-center justify-center shadow-xs">
                    {metric.icon}
                  </div>
                  <span className="text-[14px] font-black text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
                    {metric.label}
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-black/5 text-emerald-700">
                  Tracked
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-[28px] font-black tracking-tight text-[#05050a] font-mono">
                    {metric.value}<span className="text-[14px] text-[#8a8a8a] font-bold">{metric.unit}</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#8a8a8a] font-bold">
                    {percent}% nominal
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-black/5 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-[#05050a] transition-all duration-700" 
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}