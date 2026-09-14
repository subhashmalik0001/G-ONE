import type { FatigueLevel } from '@/lib/emg/emg-processing';
import { cn } from '@/lib/utils';

const levelConfig = {
  low:      { color: '#b8ff00', label: 'Low',      bg: 'bg-[#b8ff00]/10', border: 'border-[#b8ff00]/20' },
  moderate: { color: '#f59e0b', label: 'Moderate', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  high:     { color: '#ef4444', label: 'High',     bg: 'bg-red-500/10',   border: 'border-red-500/20' },
};

export function EMGFatigueGauge({ fatigueLevel, fatigueIndex }: { fatigueLevel: FatigueLevel; fatigueIndex: number }) {
  const { color, label, bg, border } = levelConfig[fatigueLevel] || levelConfig.low;
  const pct = Math.min(1, Math.max(0, fatigueIndex * 3.33));
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * pct;

  return (
    <div className={cn("flex flex-col items-center justify-center p-6 rounded-[32px] border transition-colors duration-500", bg, border)}>
      <svg width="120" height="120" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" className="text-black/5" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
        <text x="50" y="46" textAnchor="middle" fontSize="16" fontWeight="900" fill="#05050a">
          {Math.round(pct * 100)}%
        </text>
        <text x="50" y="62" textAnchor="middle" fontSize="10" fontWeight="800" fill="#8a8a8a" className="uppercase tracking-widest">
          Fatigue
        </text>
      </svg>
      <span className="text-[14px] font-black uppercase tracking-widest mt-4" style={{ color }}>{label} Risk</span>
    </div>
  );
}
