import { Users, CreditCard, PartyPopper, Plus, QrCode, Mail, Settings2, ChevronRight, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateProgramWizard from '@/components/business/CreateProgramWizard';
import WhatsappOutbox from '@/components/business/WhatsappOutbox';
import { useAuth } from '@/context/AuthContext';
import {
  getBusinessKpis, getPurchasesByDay, getRecentPurchases, timeAgo,
  type BusinessKpis, type DailyPoint, type RecentPurchase,
} from '@/services/statsService';

export default function BusinessDashboard() {
  const { user } = useAuth();
  const businessId = user?.id ?? '';
  const businessName = (user?.user_metadata?.name as string | undefined) ?? user?.email ?? '';
  const [wizardOpen, setWizardOpen] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const navigate = useNavigate();

  const [kpis, setKpis] = useState<BusinessKpis | null>(null);
  const [chart, setChart] = useState<DailyPoint[] | null>(null);
  const [recent, setRecent] = useState<RecentPurchase[] | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) return;
    let cancelled = false;
    setStatsLoading(true);
    setStatsError(null);

    Promise.all([
      getBusinessKpis(businessId),
      getPurchasesByDay(businessId, 7),
      getRecentPurchases(businessId, 5),
    ]).then(([k, c, r]) => {
      if (cancelled) return;
      if (k.error || c.error || r.error) {
        setStatsError('No se pudieron cargar las métricas. Reintenta.');
      } else {
        setKpis(k.data);
        setChart(c.data);
        setRecent(r.data);
      }
      setStatsLoading(false);
    });

    return () => { cancelled = true; };
  }, [businessId, wizardOpen]); // refetch al cerrar wizard (por si se creó el programa)

  const chartData = useMemo(
    () => (chart ?? []).map((p) => ({ name: p.label, value: p.value })),
    [chart]
  );

  const completionRate = useMemo(() => {
    if (!kpis || kpis.totalCustomers === 0) return null;
    return Math.round((kpis.completedCards / kpis.totalCustomers) * 100);
  }, [kpis]);

  return (
    <div className="bg-surface min-h-screen">
      <main className="pt-8 pb-32 md:pb-12 px-4 max-w-7xl mx-auto space-y-10">

        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-headline-lg text-on-surface font-bold">Resumen del negocio</h2>
            <p className="text-body-md text-on-surface-variant">
              Hola{businessName ? `, ${businessName}` : ''}. Esto es lo que está pasando con tu programa de fidelización.
            </p>
          </div>
          <button
            onClick={() => setWizardOpen(true)}
            className="bg-primary-container text-on-primary-container px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md hover:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5" />
            Crear nuevo programa
          </button>
        </section>

        {statsError && (
          <div className="p-4 bg-error-container text-on-error-container rounded-xl text-body-sm">
            {statsError}
          </div>
        )}

        {/* KPI Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiCard
            icon={Users}
            iconBg="bg-primary-fixed"
            iconColor="text-primary"
            label="Clientes con tarjeta"
            value={kpis?.totalCustomers}
            loading={statsLoading}
            hint="Tarjetas únicas emitidas por tu negocio"
          />
          <KpiCard
            icon={CreditCard}
            iconBg="bg-secondary-fixed"
            iconColor="text-secondary"
            label="Tarjetas activas"
            value={kpis?.activeRecords}
            loading={statsLoading}
            hint="Con al menos 1 sello"
          />
          <KpiCard
            icon={PartyPopper}
            iconBg="bg-tertiary-fixed"
            iconColor="text-tertiary"
            label="Recompensas listas"
            value={kpis?.completedCards}
            loading={statsLoading}
            hint={completionRate !== null ? `${completionRate}% de tus clientes` : 'Tarjetas completas'}
          />
        </section>

        {/* Analytics & Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-headline-sm text-on-surface font-bold">Sellos por día</h4>
                <p className="text-body-sm text-on-surface-variant">Últimos 7 días</p>
              </div>
              {statsLoading && <Loader2 className="w-4 h-4 animate-spin text-on-surface-variant" />}
            </div>
            <div className="h-64 w-full">
              {chartData.length === 0 && !statsLoading ? (
                <div className="h-full flex items-center justify-center text-on-surface-variant text-body-sm">
                  Aún no hay actividad en los últimos 7 días.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3525cd" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3525cd" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c7c4d8" opacity={0.3} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#464555', fontSize: 12, fontWeight: 600}} />
                    <YAxis hide allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                      itemStyle={{ fontWeight: 700, color: '#3525cd' }}
                      formatter={(v: number) => [`${v} sellos`, 'Actividad']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#3525cd" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-inverse-surface text-on-primary-container p-8 rounded-2xl shadow-lg h-full">
              <h4 className="text-headline-sm mb-6 text-white font-bold">Quick Actions</h4>
              <div className="space-y-4">
                {[
                  {
                    icon: QrCode,
                    label: 'Gestionar QR',
                    sub: 'Editar destino del QR estable',
                    onClick: () => navigate('/business/card-editor'),
                  },
                  {
                    icon: Mail,
                    label: 'Campañas WhatsApp',
                    sub: 'Simulacro · listo para Meta Cloud API',
                    onClick: () => setWhatsappOpen(true),
                  },
                  {
                    icon: Settings2,
                    label: 'Reglas del programa',
                    sub: 'Sellos, recompensa y branding',
                    onClick: () => navigate('/business/card-editor'),
                  },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={action.onClick}
                    className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all group active:scale-[0.98] text-left"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <action.icon className="w-5 h-5 text-white shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-white text-body-md truncate">{action.label}</p>
                        <p className="text-[11px] text-white/70 truncate">{action.sub}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/50 group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Table */}
        <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-8 border-b border-outline-variant flex items-center justify-between">
            <div>
              <h4 className="text-headline-sm font-bold">Actividad reciente</h4>
              <p className="text-body-sm text-on-surface-variant">Últimas 5 compras registradas</p>
            </div>
            <button
              onClick={() => navigate('/business/clients')}
              className="text-primary font-bold text-label-md hover:underline"
            >
              Ver clientes
            </button>
          </div>
          <div className="overflow-x-auto">
            {statsLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (recent?.length ?? 0) === 0 ? (
              <div className="py-12 text-center text-on-surface-variant text-body-sm">
                Aún no hay compras registradas. Cuando registres una compra (o un cliente la registre con su recibo) aparecerá aquí.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-surface-container-low text-label-md text-on-surface-variant font-bold">
                  <tr>
                    <th className="px-8 py-4 uppercase tracking-widest">Cliente</th>
                    <th className="px-8 py-4 uppercase tracking-widest">Email</th>
                    <th className="px-8 py-4 uppercase tracking-widest">Acción</th>
                    <th className="px-8 py-4 uppercase tracking-widest">Cuándo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {recent!.map((row) => {
                    const initials = row.customerName.slice(0, 2).toUpperCase();
                    return (
                      <tr key={row.id} className="hover:bg-surface-container/30 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-label-md">
                              {initials}
                            </div>
                            <span className="font-bold text-on-surface">{row.customerName}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-body-md text-on-surface-variant">{row.customerEmail}</td>
                        <td className="px-8 py-5">
                          <span className="px-4 py-1.5 rounded-full text-label-md font-bold bg-secondary-container text-on-secondary-container">
                            +1 sello
                          </span>
                        </td>
                        <td className="px-8 py-5 text-on-surface-variant text-body-sm font-medium">
                          {timeAgo(row.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      <CreateProgramWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />

      <WhatsappOutbox
        open={whatsappOpen}
        onClose={() => setWhatsappOpen(false)}
      />
    </div>
  );
}

interface KpiCardProps {
  icon: typeof Users;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number | undefined;
  loading: boolean;
  hint: string;
}

function KpiCard({ icon: Icon, iconBg, iconColor, label, value, loading, hint }: KpiCardProps) {
  const formatted =
    typeof value === 'number'
      ? value >= 1000 ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k` : String(value)
      : '—';
  return (
    <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant flex flex-col justify-between hover:shadow-md transition-shadow min-h-[180px]">
      <div className="flex items-center justify-between mb-8">
        <div className={`p-3 ${iconBg} rounded-xl ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-on-surface-variant" />}
      </div>
      <div>
        <p className="text-label-md text-on-surface-variant uppercase tracking-wider font-bold">{label}</p>
        <h3 className="text-points-display text-on-surface">
          {loading ? <span className="opacity-30">—</span> : formatted}
        </h3>
        <p className="text-[11px] text-on-surface-variant mt-1">{hint}</p>
      </div>
    </div>
  );
}
