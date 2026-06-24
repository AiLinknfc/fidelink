import { useState } from 'react';
import { Users, Book, CreditCard, TrendingUp, Activity, ShoppingBag, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';

const MODULES = [
  { id: 'fidelizacion', name: 'Fidelización', icon: CreditCard,  colorHex: '#7c3aed', status: 'healthy' as const, version: '1.0.0', users: 42, uptime: '99.9%', lastDeploy: '2026-06-10' },
  { id: 'biografias',   name: 'Biografías',   icon: Book,         colorHex: '#6366f1', status: 'healthy' as const, version: '0.1.0', users: 28, uptime: '98.5%', lastDeploy: '2026-06-12' },
  { id: 'ventas',       name: 'Ventas',        icon: ShoppingBag,  colorHex: '#10b981', status: 'healthy' as const, version: '1.0.0', users: 15, uptime: '99.2%', lastDeploy: '2026-06-14' },
];

export default function AdminDashboard() {
  const { brand } = useModuleBrand();
  const totalUsers = MODULES.reduce((s, m) => s + m.users, 0);

  const [chipHovered, setChipHovered]     = useState(false);
  const [hoveredStat, setHoveredStat]     = useState<string | null>(null);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  const statCards = [
    { id: 'users',    icon: Users,      label: 'Usuarios Totales',   value: String(totalUsers),     sub: '+12% este mes',                          subColor: 'text-emerald-600' },
    { id: 'modules',  icon: TrendingUp, label: 'Módulos Activos',    value: String(MODULES.length), sub: 'Fidelización + Biografías + Ventas',      subColor: 'text-slate-500'   },
    { id: 'activity', icon: Activity,   label: 'Actividad Reciente', value: '156',                  sub: 'Acciones en las últimas 24h',             subColor: 'text-slate-500'   },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Barra secundaria ── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 h-12
                      flex flex-row items-center justify-between gap-2 select-none overflow-hidden flex-shrink-0">

        {/* LEFT — chip expandible */}
        <div
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-white cursor-default transition-all duration-500 ease-in-out min-w-0"
          style={{
            color: brand.colorHex,
            borderColor: chipHovered ? `${brand.colorHex}55` : 'rgb(226 232 240 / 0.6)',
            boxShadow: chipHovered
              ? `0 0 0 3px ${brand.colorHex}18, 0 2px 12px ${brand.colorHex}22`
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
              background: `linear-gradient(90deg, ${brand.colorHex}06 0%, ${brand.colorHex}14 50%, ${brand.colorHex}06 100%)`,
            }}
          />
          <BarChart3
            className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300"
            style={{ transform: chipHovered ? 'rotate(-15deg) scale(1.2)' : 'none' }}
          />
          <span className="text-[12px] font-bold font-sans whitespace-nowrap flex-shrink-0">Panel de Administración</span>
          <span
            className="text-[12px] font-light font-sans whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out"
            style={{
              maxWidth: chipHovered ? '600px' : '0px',
              opacity: chipHovered ? 1 : 0,
              paddingLeft: chipHovered ? '6px' : '0px',
              color: `${brand.colorHex}99`,
            }}
          >
            · Métricas consolidadas de todos los módulos
          </span>
        </div>

        {/* RIGHT — badge cross-module */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200/60 bg-slate-50 flex-shrink-0">
          <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: brand.colorHex }} />
          <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">Cross-module</span>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 md:px-6 pt-3 pb-6 space-y-4">

        {/* Stats KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {statCards.map((s) => {
            const Icon = s.icon;
            const isHovered = hoveredStat === s.id;
            return (
              <div
                key={s.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 relative overflow-hidden shadow-sm cursor-default transition-all duration-300 ease-in-out"
                style={{
                  borderColor: isHovered ? brand.colorHex : 'rgb(226 232 240)',
                  boxShadow: isHovered
                    ? `0 0 0 3px ${brand.colorHex}22, 0 6px 20px ${brand.colorHex}28`
                    : undefined,
                }}
                onMouseEnter={() => setHoveredStat(s.id)}
                onMouseLeave={() => setHoveredStat(null)}
              >
                <div className="relative flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-kpi-label text-slate-400 block mb-1.5">{s.label}</span>
                    <span
                      className="text-data-number transition-colors duration-300"
                      style={{ color: isHovered ? brand.colorHex : '#0f172a' }}
                    >
                      {s.value}
                    </span>
                    <p className={`text-kpi-sub mt-1 ${s.subColor}`}>{s.sub}</p>
                  </div>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{
                      backgroundColor: isHovered ? `${brand.colorHex}18` : `${brand.colorHex}0d`,
                      color: brand.colorHex,
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cards de módulo — hover variante A */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            const isHovered = hoveredModule === mod.id;
            return (
              <div
                key={mod.id}
                className="relative bg-white rounded-2xl border transition-all duration-300 ease-in-out p-4 space-y-3 overflow-hidden shadow-sm cursor-default"
                style={{
                  borderColor: isHovered ? `${brand.colorHex}88` : 'rgb(226 232 240)',
                  boxShadow: isHovered
                    ? `0 0 0 3px ${brand.colorHex}22, 0 6px 20px ${brand.colorHex}28`
                    : '0 0 0 0px transparent',
                }}
                onMouseEnter={() => setHoveredModule(mod.id)}
                onMouseLeave={() => setHoveredModule(null)}
              >
                <div
                  className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-500"
                  style={{
                    opacity: isHovered ? 1 : 0,
                    background: `linear-gradient(135deg, ${brand.colorHex}08 0%, ${brand.colorHex}18 50%, ${brand.colorHex}08 100%)`,
                  }}
                />

                {/* Cabecera de card */}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                      style={{ backgroundColor: isHovered ? `${brand.colorHex}22` : `${mod.colorHex}18` }}
                    >
                      <Icon
                        className="w-4.5 h-4.5 transition-colors duration-300"
                        style={{ color: isHovered ? brand.colorHex : mod.colorHex }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="text-[12px] font-bold font-sans transition-colors duration-300 truncate"
                        style={{ color: isHovered ? brand.colorHex : '#0f172a' }}
                      >
                        {mod.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-sans">v{mod.version}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {mod.status === 'healthy' ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[11px] font-semibold font-sans text-emerald-600">Saludable</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[11px] font-semibold font-sans text-amber-600">Atención</span>
                      </>
                    )}
                  </div>
                </div>

                {/* KPIs de módulo */}
                <div className="relative grid grid-cols-3 gap-0 pt-3 border-t border-slate-100">
                  <div className="pr-2 border-r border-slate-100">
                    <span className="text-kpi-label text-slate-400 block mb-0.5">Usuarios</span>
                    <span
                      className="text-data-number transition-colors duration-300"
                      style={{ color: isHovered ? brand.colorHex : '#1e293b' }}
                    >
                      {mod.users}
                    </span>
                  </div>
                  <div className="px-2 border-r border-slate-100">
                    <span className="text-kpi-label text-slate-400 block mb-0.5">Uptime</span>
                    <span className="text-data-number text-slate-800">{mod.uptime}</span>
                  </div>
                  <div className="pl-2">
                    <span className="text-kpi-label text-slate-400 block mb-0.5">Deploy</span>
                    <span className="text-[11px] font-semibold font-sans text-slate-600 leading-tight">{mod.lastDeploy}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Distribución de usuarios */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <h2 className="text-section-heading text-slate-900 mb-4">Distribución de usuarios por módulo</h2>
          <div className="space-y-3">
            {MODULES.map((mod) => {
              const pct = Math.round((mod.users / totalUsers) * 100);
              return (
                <div key={mod.name}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[12px] font-semibold font-sans text-slate-700">{mod.name}</span>
                    <span className="text-[11px] font-sans text-slate-500 tabular-nums">{mod.users} usuarios · {pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: mod.colorHex }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
