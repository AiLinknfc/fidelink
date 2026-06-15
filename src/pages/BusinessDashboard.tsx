import { Users, CreditCard, Gift, Plus, Loader2, BarChart3, TrendingUp, ShoppingBag, HeartHandshake, MapPin, Sparkles, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateProgramWizard from '@/modules/fidelizacion/components/CreateProgramWizard';
import { useAuth } from '@/context/AuthContext';
import {
  getBusinessKpis, getPurchasesByDay, getRecentPurchases, timeAgo,
  type BusinessKpis, type DailyPoint, type RecentPurchase,
} from '@/services/statsService';
import { getCardConfig, getBusinessClients } from '@/services/loyaltyService';
import SectionRibbon from '@/platform/ui/SectionRibbon';

export default function BusinessDashboard() {
  const { user } = useAuth();
  const businessId = user?.id ?? '';
  const businessName = (user?.user_metadata?.name as string | undefined) ?? user?.email ?? '';
  const [wizardOpen, setWizardOpen] = useState(false);
  const navigate = useNavigate();

  const [kpis, setKpis] = useState<BusinessKpis | null>(null);
  const [chart, setChart] = useState<DailyPoint[] | null>(null);
  const [recent, setRecent] = useState<RecentPurchase[] | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [cardTypeCounts, setCardTypeCounts] = useState<Record<string, number>>({});
  const [totalCards, setTotalCards] = useState(0);

  useEffect(() => {
    if (!businessId) return;
    let cancelled = false;
    setStatsLoading(true);
    setStatsError(null);

    Promise.all([
      getBusinessKpis(businessId),
      getPurchasesByDay(businessId, 7),
      getRecentPurchases(businessId, 5),
      getBusinessClients(businessId),
      getCardConfig(businessId),
    ]).then(([k, c, r, clientRes, cfgRes]) => {
      if (cancelled) return;
      if (k.error || c.error || r.error) {
        setStatsError('No se pudieron cargar las métricas. Reintenta.');
      } else {
        setKpis(k.data);
        setChart(c.data);
        setRecent(r.data);
      }
      if (!clientRes.error && clientRes.data) {
        setTotalCards(clientRes.data.length);
        const counts: Record<string, number> = {};
        clientRes.data.forEach((card: any) => {
          const tag = card.card_tag || card.cardTag || 'Loyalty';
          counts[tag] = (counts[tag] || 0) + 1;
        });
        setCardTypeCounts(counts);
      }
      setStatsLoading(false);
    });

    return () => { cancelled = true; };
  }, [businessId, wizardOpen]);

  const chartData = useMemo(
    () => (chart ?? []).map((p) => ({ name: p.label, value: p.value })),
    [chart]
  );

  const completionRate = useMemo(() => {
    if (!kpis || kpis.totalCustomers === 0) return null;
    return Math.round((kpis.completedCards / kpis.totalCustomers) * 100);
  }, [kpis]);

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <SectionRibbon
            icon={Activity}
            title="Monitor de Analítica"
            description="Toma decisiones con lo que está pasando con tu programa de fidelización"
          />
          <button
            onClick={() => setWizardOpen(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md hover:bg-blue-700 transition-all text-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            Crear nuevo programa
          </button>
        </div>

        {statsError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {statsError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full filter blur-lg pointer-events-none" />
            <div className="flex justify-between items-start">
              <span className="text-hero-label text-slate-400">PROGRAMA DE SELLOS</span>
              <span className="p-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-4">
              <h4 className="text-hero text-slate-700">
                {statsLoading ? <span className="opacity-30">—</span> : kpis?.totalCustomers ?? 0}
              </h4>
              <p className="text-caption text-slate-500 mt-1">
                {kpis?.completedCards ?? 0} tarjetas completas
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-600/5 rounded-full filter blur-lg pointer-events-none" />
            <div className="flex justify-between items-start">
              <span className="text-hero-label text-slate-400">CASHBACK DIGITAL</span>
              <span className="p-1.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg">
                <ShoppingBag className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-4">
              <h4 className="text-hero text-slate-700">
                {statsLoading ? <span className="opacity-30">—</span> : '$ 325.00'} COP
              </h4>
              <p className="text-caption text-slate-500 mt-1">
                $ 45.00 COP descontados por usuarios
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full filter blur-lg pointer-events-none" />
            <div className="flex justify-between items-start">
              <span className="text-hero-label text-slate-400">TARJETAS ACTIVAS</span>
              <span className="p-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg">
                <Gift className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-4">
              <h4 className="text-hero text-slate-700">
                {statsLoading ? <span className="opacity-30">—</span> : totalCards}
              </h4>
              <p className="text-caption text-slate-500 mt-1">
                Fidelidad, Cashback, Multipase
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full filter blur-lg pointer-events-none" />
            <div className="flex justify-between items-start">
              <span className="text-hero-label text-slate-400">RETORNO INVITACIÓN</span>
              <span className="p-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg">
                <HeartHandshake className="w-4 h-4 text-blue-600" />
              </span>
            </div>
            <div className="mt-4">
              <h4 className="text-hero text-slate-700">
                {completionRate !== null ? `+${completionRate}%` : '+42%'}
              </h4>
              <p className="text-caption text-slate-500 mt-1">
                Del flujo proviene del boca a boca
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/2 rounded-full filter blur-2xl pointer-events-none" />
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <h3 className="text-section-title text-slate-800">
                  Flujo Semanal de Canjes Presenciales
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded text-blue-600">
                {statsLoading ? 'CARGANDO…' : 'METRICA LIVE COLOMBIA'}
              </span>
            </div>

            <div className="h-64 w-full">
              {chartData.length === 0 && !statsLoading ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                  Aún no hay actividad en los últimos 7 días.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c7c4d8" opacity={0.3} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                    <YAxis hide allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                      itemStyle={{ fontWeight: 700, color: '#2563EB' }}
                      formatter={(v: number) => [`${v} sellos`, 'Actividad']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
              <p className="text-caption text-slate-500 leading-normal">
                La línea representa la suma de lecturas de códigos QR / NFC en locales físicos por franja diaria.
              </p>
              <div className="flex gap-2 items-center text-[10px] font-mono text-slate-500 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block animate-pulse" />
                <span>Visitas / Día (Live)</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
            <h3 className="text-section-title text-slate-800 mb-4">
              Frecuencia por Tipo de Tarjeta
            </h3>
            <div className="space-y-4">
              {[
                { type: 'Tarjetas de Fidelidad', key: 'Loyalty', color: 'bg-blue-600' },
                { type: 'Multipases de Acceso', key: 'Multipass', color: 'bg-blue-400' },
                { type: 'Cashback Digital', key: 'Cashback', color: 'bg-indigo-500' },
                { type: 'Membresías VIP', key: 'Membership', color: 'bg-blue-700' },
                { type: 'Pases de Cumpleaños', key: 'Birthday', color: 'bg-indigo-400' },
              ].map((stat) => {
                const count = cardTypeCounts[stat.key] || 0;
                const percent = totalCards > 0 ? Math.round((count / totalCards) * 100) : 0;
                return (
                  <div key={stat.key} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">{stat.type}</span>
                      <span className="font-mono text-slate-400 text-[10px] font-semibold">{percent}% ({count})</span>
                    </div>
                    <div className="w-full bg-slate-50 border border-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${stat.color} rounded-full`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl mt-6">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 font-bold block">Insight de Conversión</span>
              <p className="text-caption text-slate-600 mt-1 leading-normal">
                Las promociones de fidelidad basadas en repeticiones de sellos tienen un ticket de retorno 3.2x más rápido que las ofertas genéricas en Colombia.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="text-section-title text-slate-800">
                Resumen Rápido
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50/50 rounded-xl">
                <span className="text-xs text-slate-600">Total tarjetas emitidas</span>
                <span className="text-hero text-slate-700">{totalCards}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-indigo-50/50 rounded-xl">
                <span className="text-xs text-slate-600">Tarjetas completas</span>
                <span className="text-hero text-slate-700">{kpis?.completedCards ?? 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-amber-50/50 rounded-xl">
                <span className="text-xs text-slate-600">Clientes registrados</span>
                <span className="text-hero text-slate-700">{kpis?.totalCustomers ?? 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-50/50 rounded-xl">
                <span className="text-xs text-slate-600">Tasa de retención</span>
                <span className="text-hero text-slate-700">{completionRate !== null ? `${completionRate}%` : '—'}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
            <h3 className="text-section-title text-slate-800 mb-4">
              Bitácora en Tiempo Real (Canjes y Puntos en Tiendas)
            </h3>
            <div className="overflow-x-auto no-scrollbar">
              {statsLoading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : (recent?.length ?? 0) === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  Aún no hay compras registradas. Cuando registres una compra aparecerá aquí.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">
                      <th className="pb-2.5 font-bold">Cliente</th>
                      <th className="pb-2.5 font-bold">Tarjeta Afectada</th>
                      <th className="pb-2.5 font-bold">Tipo de Tránsito</th>
                      <th className="pb-2.5 font-bold text-right">Monto</th>
                      <th className="pb-2.5 font-bold text-right">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60">
                    {recent!.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-bold text-slate-800">{row.customerName}</td>
                        <td className="py-3 text-slate-600">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                            Tarjeta de Fidelidad
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ACUMULADO
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold font-mono text-emerald-700">
                          +1 sello
                        </td>
                        <td className="py-3 text-right font-mono text-slate-400">
                          {timeAgo(row.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      <CreateProgramWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />
    </div>
  );
}
