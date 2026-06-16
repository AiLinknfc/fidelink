import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';

interface FunnelStep {
  name: string;
  value: number;
}

interface FunnelChartProps {
  funnelData: FunnelStep[];
  globalCR: number;
}

export default function FunnelChart({ funnelData, globalCR }: FunnelChartProps) {
  const { brand } = useModuleBrand();
  const [tooltip, setTooltip] = useState<number | null>(null);

  return (
    <div className="bg-white p-5 border border-slate-200 rounded-2xl lg:col-span-2">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-section-heading text-slate-900">Embudo de Conversión</h3>
          <p className="text-[11px] font-sans text-slate-500 mt-0.5">Ads → Visitas → Leads → Ventas</p>
        </div>
        <HelpCircle className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
      </div>

      <div className="space-y-3">
        {funnelData.map((step, idx) => {
          const maxVal = funnelData[0].value || 1;
          const pct = (step.value / maxVal) * 100;
          const isActive = tooltip === idx;
          return (
            <div
              key={idx}
              className="relative cursor-default"
              onMouseEnter={() => setTooltip(idx)}
              onMouseLeave={() => setTooltip(null)}
            >
              <div className="flex justify-between mb-1">
                <span className="text-[11px] font-sans font-medium text-slate-600">{step.name}</span>
                <span
                  className="text-[12px] font-bold font-sans tabular-nums transition-colors duration-200"
                  style={{ color: isActive ? brand.colorHex : '#0f172a' }}
                >
                  {step.value.toLocaleString()}
                  {idx > 0 && <span className="text-[10px] font-jakarta text-slate-400 ml-1">({pct.toFixed(1)}%)</span>}
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(pct, 2)}%`,
                    backgroundColor: isActive ? brand.colorHex : '#6366f1',
                    transition: 'width 0.5s ease, background-color 0.25s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="mt-5 px-4 py-3 rounded-xl flex items-center justify-between transition-colors duration-300"
        style={{ backgroundColor: `${brand.colorHex}0d`, border: `1px solid ${brand.colorHex}22` }}
      >
        <span className="text-[11px] font-sans text-slate-600">Tasa de conversión (visita → venta)</span>
        <span
          className="text-[14px] font-bold font-headline tabular-nums"
          style={{ color: brand.colorHex }}
        >
          {globalCR.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}
