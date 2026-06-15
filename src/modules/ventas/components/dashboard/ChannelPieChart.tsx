import { ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface ChannelData {
  name: string;
  value: number;
}

interface ChannelPieChartProps {
  channelPieData: ChannelData[];
  COLORS: string[];
}

export default function ChannelPieChart({ channelPieData, COLORS }: ChannelPieChartProps) {
  return (
    <div className="bg-white p-5 border border-slate-200 rounded-2xl flex flex-col justify-between">
      <div>
        <h3 className="text-base font-bold text-slate-900">Distribución por Canal Ads</h3>
        <p className="text-xs text-slate-500 mb-4">Origen de prospectos detectados</p>
      </div>

      <div className="h-44 w-full flex items-center justify-center">
        {channelPieData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={channelPieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {channelPieData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-xs text-slate-400 italic">No hay leads registrados aún</div>
        )}
      </div>

      <div className="space-y-1.5 mt-2">
        {channelPieData.map((ch, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
              <span>{ch.name}</span>
            </div>
            <span className="font-mono font-bold">{ch.value} can.</span>
          </div>
        ))}
      </div>
    </div>
  );
}
