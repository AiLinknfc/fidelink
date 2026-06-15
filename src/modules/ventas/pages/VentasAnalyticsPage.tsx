import { useOutletContext } from 'react-router-dom';
import { AnalyticsTab } from '../components/dashboard';
import type { VentasContextType } from './VentasPage';

export default function VentasAnalyticsPage() {
  const ctx = useOutletContext<VentasContextType>();

  const totalSpent = ctx.campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalRevenue = ctx.transactions.reduce((sum, t) => sum + (t.status === 'completed' ? t.amount : 0), 0);
  const totalClicks = ctx.campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalLeadsCount = ctx.leads.length;
  const purchasesCount = ctx.transactions.length;
  const cpl = totalLeadsCount > 0 ? (totalSpent / totalLeadsCount) : 0;
  const cac = purchasesCount > 0 ? (totalSpent / purchasesCount) : 0;
  const roi = totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0;
  const ltv = purchasesCount > 0 ? (totalRevenue / Array.from(new Set(ctx.transactions.map(t => t.leadName))).length) : 0;
  const globalCR = totalClicks > 0 ? ((purchasesCount / totalClicks) * 100) : 0;

  const funnelData = [
    { name: '1. Impresiones Anuncios', value: ctx.campaigns.reduce((sum, c) => sum + c.impressions, 0) },
    { name: '2. Clics / Visitas Landing', value: totalClicks },
    { name: '3. Conversaciones / Leads', value: totalLeadsCount },
    { name: '4. Compras Convertidas', value: purchasesCount },
  ];

  const channelCounts = ctx.leads.reduce((acc: Record<string, number>, curr) => {
    acc[curr.channel] = (acc[curr.channel] || 0) + 1;
    return acc;
  }, {});

  const channelPieData = Object.entries(channelCounts).map(([key, val]) => ({ name: key, value: val }));
  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

  return (
    <main className="h-full overflow-y-auto p-6">
      <AnalyticsTab totalSpent={totalSpent} totalRevenue={totalRevenue} roi={roi} cpl={cpl} cac={cac} ltv={ltv}
        globalCR={globalCR} funnelData={funnelData} channelPieData={channelPieData} COLORS={COLORS} transactions={ctx.transactions} />
    </main>
  );
}
