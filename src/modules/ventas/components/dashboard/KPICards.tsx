import { useState } from 'react';
import { DollarSign, TrendingUp, Users, Megaphone } from 'lucide-react';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';

interface KPICardsProps {
  totalSpent: number;
  totalRevenue: number;
  roi: number;
  cpl: number;
  cac: number;
  ltv: number;
}

export default function KPICards({ totalSpent, totalRevenue, roi, cpl, cac, ltv }: KPICardsProps) {
  const { brand } = useModuleBrand();
  const [hovered, setHovered] = useState<string | null>(null);

  const cards = [
    {
      id: 'spent',
      icon: Megaphone,
      label: 'Inversión Ad Ads',
      value: `$${totalSpent.toFixed(2)}`,
      unit: 'COP',
      sub: 'Presupuesto en Meta Ads',
      subColor: 'text-slate-500',
      iconBg: '#6366f114',
      iconColor: '#6366f1',
    },
    {
      id: 'revenue',
      icon: DollarSign,
      label: 'Ventas Convertidas',
      value: `$${totalRevenue.toFixed(2)}`,
      unit: 'COP',
      sub: `ROI Global: ${roi.toFixed(0)}%`,
      subColor: 'text-emerald-600',
      iconBg: '#10b98114',
      iconColor: '#10b981',
    },
    {
      id: 'cpl',
      icon: TrendingUp,
      label: 'Costo por Lead (CPL)',
      value: `$${cpl.toFixed(2)}`,
      unit: 'COP',
      sub: 'Adquisición por WhatsApp',
      subColor: 'text-slate-500',
      iconBg: '#7c3aed14',
      iconColor: '#7c3aed',
    },
    {
      id: 'cac',
      icon: Users,
      label: 'Adquisición (CAC)',
      value: `$${cac.toFixed(2)}`,
      unit: 'COP',
      sub: `LTV Promedio: $${ltv.toFixed(1)}`,
      subColor: 'text-indigo-600',
      iconBg: '#6366f114',
      iconColor: '#6366f1',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        const isHovered = hovered === c.id;
        return (
          <div
            key={c.id}
            className="bg-white border border-slate-200 rounded-2xl p-4 relative overflow-hidden shadow-sm cursor-default transition-all duration-300 ease-in-out"
            style={{
              boxShadow: isHovered
                ? `0 0 0 3px ${brand.colorHex}22, 0 6px 20px ${brand.colorHex}28`
                : undefined,
              borderColor: isHovered ? brand.colorHex : undefined,
            }}
            onMouseEnter={() => setHovered(c.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="relative flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="text-kpi-label text-slate-400 block mb-1.5">
                  {c.label}
                </span>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-data-number transition-colors duration-300"
                    style={{ color: isHovered ? brand.colorHex : '#0f172a' }}
                  >
                    {c.value}
                  </span>
                  <span className="text-kpi-unit text-slate-400">{c.unit}</span>
                </div>
                <p className={`text-kpi-sub mt-1 ${c.subColor}`}>{c.sub}</p>
              </div>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                style={{
                  backgroundColor: isHovered ? `${brand.colorHex}18` : c.iconBg,
                  color: isHovered ? brand.colorHex : c.iconColor,
                }}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
