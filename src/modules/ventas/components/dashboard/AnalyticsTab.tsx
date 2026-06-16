import { useState } from 'react';
import KPICards from './KPICards';
import FunnelChart from './FunnelChart';
import ChannelPieChart from './ChannelPieChart';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';
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
  const { brand } = useModuleBrand();
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <KPICards totalSpent={totalSpent} totalRevenue={totalRevenue} roi={roi} cpl={cpl} cac={cac} ltv={ltv} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <FunnelChart funnelData={funnelData} globalCR={globalCR} />
        <ChannelPieChart channelPieData={channelPieData} COLORS={COLORS} />
      </div>

      {/* Transactions Table */}
      <div className="bg-white p-5 border border-slate-200 rounded-2xl">
        <div className="mb-4">
          <h3 className="text-section-heading text-slate-900">Transacciones de Pago en Pasarelas</h3>
          <p className="text-[11px] font-sans text-slate-500 mt-0.5">Historial de cobros procesados en el simulador</p>
        </div>

        {/* Header row */}
        <div className="grid grid-cols-12 gap-3 px-3 pb-2 border-b border-slate-100">
          <div className="col-span-1 text-[12px] font-bold font-jakarta uppercase tracking-wider text-slate-400 text-center">ID</div>
          <div className="col-span-2 text-[12px] font-bold font-jakarta uppercase tracking-wider text-slate-400 text-left">Cliente</div>
          <div className="col-span-3 text-[12px] font-bold font-jakarta uppercase tracking-wider text-slate-400 text-left">Producto</div>
          <div className="col-span-1 text-[12px] font-bold font-jakarta uppercase tracking-wider text-slate-400 text-center">Monto</div>
          <div className="col-span-2 text-[12px] font-bold font-jakarta uppercase tracking-wider text-slate-400 text-center">Pasarela</div>
          <div className="col-span-2 text-[12px] font-bold font-jakarta uppercase tracking-wider text-slate-400 text-center">Envío</div>
          <div className="col-span-1 text-[12px] font-bold font-jakarta uppercase tracking-wider text-slate-400 text-center">Estado</div>
        </div>

        {/* Data rows */}
        <div className="divide-y divide-slate-50">
          {transactions.map((tx) => {
            const isHovered = hoveredRow === tx.id;
            return (
              <div
                key={tx.id}
                className="grid grid-cols-12 gap-3 px-3 py-3 items-center cursor-default transition-colors duration-200"
                style={{
                  backgroundColor: isHovered ? `${brand.colorHex}06` : 'transparent',
                  borderLeft: isHovered ? `3px solid ${brand.colorHex}` : '3px solid transparent',
                  transition: 'background-color 0.25s ease, border-left-color 0.25s ease',
                }}
                onMouseEnter={() => setHoveredRow(tx.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <div className="col-span-1 text-center">
                  <span className="text-[11px] font-bold font-jakarta text-slate-400 tabular-nums">{tx.id}</span>
                </div>
                <div className="col-span-2 text-left">
                  <span className="text-[12px] font-semibold font-sans text-slate-900">{tx.leadName}</span>
                </div>
                <div className="col-span-3 text-left">
                  <span className="text-[11px] font-sans text-slate-600 truncate block">{tx.productName}</span>
                </div>
                <div className="col-span-1 text-center">
                  <span
                    className="text-[12px] font-bold font-sans tabular-nums transition-colors duration-200"
                    style={{ color: isHovered ? brand.colorHex : '#4f46e5' }}
                  >
                    ${tx.amount.toFixed(2)}
                  </span>
                </div>
                <div className="col-span-2 text-center">
                  <span
                    className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold font-jakarta"
                    style={{
                      backgroundColor: isHovered ? `${brand.colorHex}14` : '#eef2ff',
                      color: isHovered ? brand.colorHex : '#4338ca',
                    }}
                  >
                    {tx.gateway}
                  </span>
                </div>
                <div className="col-span-2 flex justify-center">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold font-sans text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    Enviado CAPI
                  </span>
                </div>
                <div className="col-span-1 flex justify-center">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-semibold font-sans whitespace-nowrap">
                    Completado
                  </span>
                </div>
              </div>
            );
          })}
          {transactions.length === 0 && (
            <div className="py-8 text-center text-[11px] font-sans text-slate-400">
              No hay pagos registrados aún en el simulador.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
