import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { ProcessedEMG } from '@/lib/emg/emg-processing';

export function EMGLiveChart({ history }: { history: ProcessedEMG[] }) {
  const data = useMemo(() =>
    history.slice(-100).map((h, i) => ({
      t: i,
      signal: Math.round(h.normalized * 100),
    })),
    [history]
  );

  return (
    <div className="w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="t" hide />
          <YAxis domain={[0, 100]} hide />
          <Tooltip
            contentStyle={{ background: '#05050a', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 900, color: '#b8ff00' }}
            formatter={(v: number) => [`${v}%`, 'Signal']}
            labelFormatter={() => ''}
            cursor={{ stroke: 'rgba(184, 255, 0, 0.2)', strokeWidth: 2 }}
          />
          <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'STRAIN THRESHOLD', fill: '#ef4444', fontSize: 10, fontWeight: 900 }} />
          <ReferenceLine y={50} stroke="#b0b0b0" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'BASELINE', fill: '#b0b0b0', fontSize: 10, fontWeight: 900 }} />
          <Line
            type="step"
            dataKey="signal"
            stroke="#b8ff00"
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
