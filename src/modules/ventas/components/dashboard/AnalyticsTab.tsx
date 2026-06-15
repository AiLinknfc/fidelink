import KPICards from './KPICards';
import FunnelChart from './FunnelChart';
import ChannelPieChart from './ChannelPieChart';
import type { PaymentTransaction } from '../../types';

interface AnalyticsTabProps {
  totalSpent: number;
  totalRevenue: number;
  roi: number;
  cpl: number;
  cac: number;
  ltv: number;
  globalCR: number;
  funnelData: { name: string; value: number }[];
  channelPieData: { name: string; value: number }[];
  COLORS: string[];
  transactions: PaymentTransaction[];
}

export default function AnalyticsTab({ totalSpent, totalRevenue, roi, cpl, cac, ltv, globalCR, funnelData, channelPieData, COLORS, transactions }: AnalyticsTabProps) {
  return (
    <div className="space-y-6">
      <KPICards totalSpent={totalSpent} totalRevenue={totalRevenue} roi={roi} cpl={cpl} cac={cac} ltv={ltv} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FunnelChart funnelData={funnelData} globalCR={globalCR} />
        <ChannelPieChart channelPieData={channelPieData} COLORS={COLORS} />
      </div>
      <div className="bg-white p-5 border border-slate-200 rounded-2xl">
        <h3 className="text-base font-bold text-slate-900 mb-4">Transacciones de Pago en Pasarelas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold text-xs">
                <th className="pb-3 px-2">ID</th>
                <th className="pb-3 px-2">Cliente</th>
                <th className="pb-3 px-2">Producto</th>
                <th className="pb-3 px-2">Monto</th>
                <th className="pb-3 px-2">Pasarela Latam</th>
                <th className="pb-3 px-2">Envío de Conversión</th>
                <th className="pb-3 px-2">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-2 font-mono font-bold text-xs text-slate-500">{tx.id}</td>
                  <td className="py-3 px-2 font-medium text-slate-900">{tx.leadName}</td>
                  <td className="py-3 px-2">{tx.productName}</td>
                  <td className="py-3 px-2 font-mono font-bold text-indigo-600">${tx.amount.toFixed(2)}</td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-md font-bold font-mono">{tx.gateway}</span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Enviado CAPI
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">Completado</span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={7} className="text-center py-6 text-slate-400 italic">No hay pagos registrados aún en el simulador.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
