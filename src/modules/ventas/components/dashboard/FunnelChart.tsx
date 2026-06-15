import { HelpCircle } from 'lucide-react';

interface FunnelStep {
  name: string;
  value: number;
}

interface FunnelChartProps {
  funnelData: FunnelStep[];
  globalCR: number;
}

export default function FunnelChart({ funnelData, globalCR }: FunnelChartProps) {
  return (
    <div className="bg-white p-5 border border-slate-200 rounded-2xl lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Embudo de Conversión Automatizado (IA & WhatsApp)</h3>
          <p className="text-xs text-slate-500">Métricas acumuladas de ads, visitas, chats y pasarelas</p>
        </div>
        <HelpCircle className="w-5 h-5 text-slate-400" />
      </div>

      <div className="space-y-4 py-2">
        {funnelData.map((step, idx) => {
          const maxVal = funnelData[0].value || 1;
          const pct = ((step.value / maxVal) * 100);
          return (
            <div key={idx} className="relative">
              <div className="flex justify-between text-xs text-slate-600 font-medium mb-1 px-1">
                <span>{step.name}</span>
                <span className="font-mono font-bold text-slate-950">
                  {step.value.toLocaleString()} {idx > 0 && `(${pct.toFixed(1)}%)`}
                </span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3.5 bg-indigo-50 text-xs text-indigo-800 rounded-xl flex items-center justify-between">
        <span className="font-medium">Tasa de Conversión General (Visita a Venta):</span>
        <span className="font-bold font-mono text-sm">{globalCR.toFixed(2)}%</span>
      </div>
    </div>
  );
}
