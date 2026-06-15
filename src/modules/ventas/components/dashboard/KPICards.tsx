import { DollarSign, TrendingUp, Users, Megaphone } from 'lucide-react';

interface KPICardsProps {
  totalSpent: number;
  totalRevenue: number;
  roi: number;
  cpl: number;
  cac: number;
  ltv: number;
}

export default function KPICards({ totalSpent, totalRevenue, roi, cpl, cac, ltv }: KPICardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
        <div>
          <span className="text-xs text-slate-400 font-medium">Inversión Ad Ads</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">${totalSpent.toFixed(2)} COP</h3>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">Presupuesto en Meta Ads</p>
        </div>
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Megaphone className="w-6 h-6" />
        </div>
      </div>

      <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
        <div>
          <span className="text-xs text-slate-400 font-medium">Ventas Convertidas</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">${totalRevenue.toFixed(2)} COP</h3>
          <p className="text-[10px] text-emerald-500 font-semibold mt-1 font-mono">
            ROI Global: {roi.toFixed(0)}%
          </p>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
          <DollarSign className="w-6 h-6" />
        </div>
      </div>

      <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
        <div>
          <span className="text-xs text-slate-400 font-medium">Costo por Lead (CPL)</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">${cpl.toFixed(2)} COP</h3>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">Adquisición por WhatsApp</p>
        </div>
        <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
          <TrendingUp className="w-6 h-6" />
        </div>
      </div>

      <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
        <div>
          <span className="text-xs text-slate-400 font-medium">Costo de Adquisición (CAC)</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">${cac.toFixed(2)} COP</h3>
          <p className="text-[10px] text-indigo-600 font-semibold mt-1 font-mono">
            LTV Promedio: ${ltv.toFixed(1)}
          </p>
        </div>
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          <Users className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
