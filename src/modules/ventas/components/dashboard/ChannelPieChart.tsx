import { ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';

interface ChannelData {
  name: string;
  value: number;
}

interface ChannelPieChartProps {
  channelPieData: ChannelData[];
  COLORS: string[];
}

export default function ChannelPieChart({ channelPieData, COLORS }: ChannelPieChartProps) {
  const { brand } = useModuleBrand();

  return (
    <div className="bg-white p-5 border border-slate-200 rounded-2xl flex flex-col">
      <div className="mb-4">
        <h3 className="text-section-heading text-slate-900">Canales de Origen</h3>
        <p className="text-[11px] font-sans text-slate-500 mt-0.5">Distribución de prospectos por canal</p>
      </div>

      <div className="h-44 w-full flex items-center justify-center">
        {channelPieData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={channelPieData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
              >
                {channelPieData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: '11px', fontFamily: 'Inter, sans-serif', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-[11px] font-sans text-slate-400">No hay leads registrados aún</div>
        )}
      </div>

      <div className="space-y-2 mt-3 pt-3 border-t border-slate-100">
        {channelPieData.map((ch, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
              <span className="text-[11px] font-sans text-slate-600">{ch.name}</span>
            </div>
            <span
              className="text-[12px] font-bold font-sans tabular-nums"
              style={{ color: brand.colorHex }}
            >
              {ch.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
