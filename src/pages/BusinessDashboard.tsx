import { Gift, Plus, Loader2, BarChart3, TrendingUp, ShoppingBag, HeartHandshake, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useMemo, useState } from 'react';
import CreateProgramWizard from '@/modules/fidelizacion/components/CreateProgramWizard';
import { useAuth } from '@/context/AuthContext';
import {
  getBusinessKpis, getPurchasesByDay, getRecentPurchases, timeAgo,
  type BusinessKpis, type DailyPoint, type RecentPurchase,
} from '@/services/statsService';
import { getBusinessClients } from '@/services/loyaltyService';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';

export default function BusinessDashboard() {
  const { user } = useAuth();
  const { brand } = useModuleBrand();
  const businessId = user?.id ?? '';
  const [wizardOpen, setWizardOpen] = useState(false);
  const [chipHovered, setChipHovered] = useState(false);

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
    ]).then(([k, c, r, clientRes]) => {
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
        clientRes.data.forEach((card) => {
          const tag = (card as { card_tag?: string; cardTag?: string }).card_tag
            || (card as { cardTag?: string }).cardTag
            || 'Loyalty';
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

  const accent = brand.colorHex;

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Barra secundaria — Fidelización / Analítica */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 h-12
                      flex flex-row items-center justify-between
                      gap-2 select-none overflow-hidden flex-shrink-0">

        <div
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-white cursor-default transition-all duration-500 ease-in-out min-w-0"
          style={{
            color: accent,
            borderColor: chipHovered ? `${accent}55` : 'rgb(226 232 240 / 0.6)',
            boxShadow: chipHovered
              ? `0 0 0 3px ${accent}18, 0 2px 12px ${accent}22`
              : '0 0 0 0px transparent',
            flex: chipHovered ? '1 1 0%' : '0 0 auto',
          }}
          onMouseEnter={() => setChipHovered(true)}
          onMouseLeave={() => setChipHovered(false)}
        >
          <div
            className="absolute inset-0 pointer-events-none rounded-full transition-opacity duration-500"
            style={{
              opacity: chipHovered ? 1 : 0,
              background: `linear-gradient(90deg, ${accent}06 0%, ${accent}14 50%, ${accent}06 100%)`,
            }}
          />
          <Activity
            className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300"
            style={{ transform: chipHovered ? 'rotate(-15deg) scale(1.2)' : 'none' }}
          />
          <span className="text-[12px] font-bold font-sans whitespace-nowrap flex-shrink-0 tracking-wide">
            Monitor de Analítica
          </span>
          <span
            className="text-[12px] font-light font-sans whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out tracking-wide"
            style={{
              maxWidth: chipHovered ? '600px' : '0px',
              opacity: chipHovered ? 1 : 0,
              paddingLeft: chipHovered ? '6px' : '0px',
              color: `${accent}99`,
            }}
          >
            · Toma decisiones con lo que está pasando en tu programa de fidelización
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-full flex-shrink-0">
            <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: accent }} />
            <span className="text-status text-slate-600 whitespace-nowrap">
              {statsLoading ? 'Sincronizando…' : `${kpis?.totalCustomers ?? 0} clientes activos`}
            </span>
          </div>
          <button
            onClick={() => setWizardOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-light text-[11px] transition-all active:scale-[0.97] shadow-sm text-white tracking-wide"
            style={{ backgroundColor: accent }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nuevo programa</span>
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 md:px-6 pt-3 pb-6 space-y-4">

        {statsError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {statsError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: 'PROGRAMA DE SELLOS',
              icon: TrendingUp,
              value: statsLoading ? '—' : String(kpis?.totalCustomers ?? 0),
              sub: `${kpis?.completedCards ?? 0} tarjetas completas`,
            },
            {
              label: 'CASHBACK DIGITAL',
              icon: ShoppingBag,
              value: statsLoading ? '—' : '$ 325.00 COP',
              sub: '$ 45.00 COP descontados por usuarios',
            },
            {
              label: 'TARJETAS ACTIVAS',
              icon: Gift,
              value: statsLoading ? '—' : String(totalCards),
              sub: 'Fidelidad, Cashback, Multipase',
            },
            {
              label: 'RETORNO INVITACIÓN',
              icon: HeartHandshake,
              value: completionRate !== null ? `+${completionRate}%` : '+42%',
              sub: 'Del flujo proviene del boca a boca',
            },
          ].map((card) => (
            <div key={card.label} className="bg-white border border-slate-200 rounded-2xl p-4 relative overflow-hidden shadow-sm">
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-full filter blur-lg pointer-events-none"
                style={{ backgroundColor: `${accent}0d` }}
              />
              <div className="relative flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-tech-label text-slate-400 block mb-1.5">{card.label}</span>
                  <h4 className={`text-data-number text-slate-700 ${statsLoading ? 'opacity-30' : ''}`}>
                    {card.value}
                  </h4>
                  <p className="text-data-secondary text-slate-500 mt-1">{card.sub}</p>
                </div>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${accent}12`, color: accent }}
                >
                  <card.icon className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full filter blur-2xl pointer-events-none"
              style={{ backgroundColor: `${accent}08` }}
            />
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" style={{ color: accent }} />
                <h3 className="text-section-heading text-slate-800">
                  Flujo Semanal de Canjes Presenciales
                </h3>
              </div>
              <span
                className="text-tech-label px-2.5 py-0.5 rounded border"
                style={{ backgroundColor: `${accent}10`, color: accent, borderColor: `${accent}30` }}
              >
                {statsLoading ? 'CARGANDO…' : 'MÉTRICA LIVE COLOMBIA'}
              </span>
            </div>

            <div className="h-56 w-full">
              {chartData.length === 0 && !statsLoading ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm font-light">
                  Aún no hay actividad en los últimos 7 días.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={accent} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={accent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c7c4d8" opacity={0.3} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 400 }} />
                    <YAxis hide allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                      itemStyle={{ fontWeight: 600, color: accent }}
                      formatter={(v: number) => [`${v} sellos`, 'Actividad']}
                    />
                    <Area type="monotone" dataKey="value" stroke={accent} strokeWidth={2.5} fillOpacity={1} fill="url(#analyticsGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center gap-3">
              <p className="text-data-secondary text-slate-500 leading-normal">
                La línea representa lecturas de códigos QR / NFC en locales físicos por franja diaria.
              </p>
              <div className="flex gap-2 items-center text-data-secondary text-slate-500 flex-shrink-0">
                <span className="w-2 h-2 rounded-full animate-pulse inline-block" style={{ backgroundColor: accent }} />
                <span className="whitespace-nowrap">Visitas / Día</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
            <h3 className="text-section-heading text-slate-800 mb-4">
              Frecuencia por Tipo de Tarjeta
            </h3>
            <div className="space-y-3">
              {[
                { type: 'Tarjetas de Fidelidad', key: 'Loyalty' },
                { type: 'Multipases de Acceso', key: 'Multipass' },
                { type: 'Cashback Digital', key: 'Cashback' },
                { type: 'Membresías VIP', key: 'Membership' },
                { type: 'Pases de Cumpleaños', key: 'Birthday' },
              ].map((stat, i) => {
                const count = cardTypeCounts[stat.key] || 0;
                const percent = totalCards > 0 ? Math.round((count / totalCards) * 100) : 0;
                const barOpacity = 1 - i * 0.15;
                return (
                  <div key={stat.key} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-data-primary text-slate-700">{stat.type}</span>
                      <span className="text-data-secondary text-slate-400">{percent}% ({count})</span>
                    </div>
                    <div className="w-full bg-slate-50 border border-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: accent, opacity: barOpacity }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border p-3 rounded-xl mt-4" style={{ backgroundColor: `${accent}08`, borderColor: `${accent}20` }}>
              <span className="text-tech-label block" style={{ color: accent }}>Insight de Conversión</span>
              <p className="text-data-secondary text-slate-600 mt-1 leading-normal">
                Las promociones basadas en repeticiones de sellos tienen un ticket de retorno 3.2× más rápido que ofertas genéricas.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4" style={{ color: accent }} />
              <h3 className="text-section-heading text-slate-800">Resumen Rápido</h3>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Total tarjetas emitidas', value: totalCards },
                { label: 'Tarjetas completas', value: kpis?.completedCards ?? 0 },
                { label: 'Clientes registrados', value: kpis?.totalCustomers ?? 0 },
                { label: 'Tasa de retención', value: completionRate !== null ? `${completionRate}%` : '—' },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center p-3 rounded-xl"
                  style={{ backgroundColor: `${accent}08` }}
                >
                  <span className="text-data-secondary text-slate-600">{row.label}</span>
                  <span className="text-data-number text-slate-700">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
            <h3 className="text-section-heading text-slate-800 mb-4">
              Bitácora en Tiempo Real
            </h3>
            <div className="overflow-x-auto no-scrollbar">
              {statsLoading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: accent }} />
                </div>
              ) : (recent?.length ?? 0) === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm font-light">
                  Aún no hay compras registradas. Cuando registres una compra aparecerá aquí.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Cliente', 'Tarjeta Afectada', 'Tipo de Tránsito', 'Monto', 'Fecha'].map((col, i) => (
                        <th
                          key={col}
                          className={`pb-2.5 text-col-header text-slate-400 font-jakarta ${i >= 3 ? 'text-right' : ''}`}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60">
                    {recent!.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 text-data-primary text-slate-800">{row.customerName}</td>
                        <td className="py-3 text-data-secondary text-slate-600">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
                            Tarjeta de Fidelidad
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="inline-block px-2 py-0.5 rounded text-tech-label bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ACUMULADO
                          </span>
                        </td>
                        <td className="py-3 text-right text-data-number text-emerald-700">+1 sello</td>
                        <td className="py-3 text-right text-data-secondary text-slate-400">{timeAgo(row.createdAt)}</td>
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
