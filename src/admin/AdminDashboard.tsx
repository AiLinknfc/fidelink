import { Users, Book, CreditCard, TrendingUp, Activity, ShoppingBag, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';
import SectionRibbon from '@/platform/ui/SectionRibbon';

const MODULES = [
  {
    id: 'fidelizacion',
    name: 'Fidelización',
    icon: CreditCard,
    color: 'bg-violet-500',
    status: 'healthy' as const,
    version: '1.0.0',
    users: 42,
    uptime: '99.9%',
    lastDeploy: '2026-06-10',
  },
  {
    id: 'biografias',
    name: 'Biografías',
    icon: Book,
    color: 'bg-indigo-500',
    status: 'healthy' as const,
    version: '0.1.0',
    users: 28,
    uptime: '98.5%',
    lastDeploy: '2026-06-12',
  },
  {
    id: 'ventas',
    name: 'Ventas',
    icon: ShoppingBag,
    color: 'bg-emerald-500',
    status: 'healthy' as const,
    version: '1.0.0',
    users: 15,
    uptime: '99.2%',
    lastDeploy: '2026-06-14',
  },
];

export default function AdminDashboard() {
  const modules = MODULES;
  const totalUsers = modules.reduce((s, m) => s + m.users, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-0 pb-6 space-y-4">
      <div className="-mt-1 z-40 relative">
        <SectionRibbon
          icon={Activity}
          title="Panel de Administración"
          description="Métricas consolidadas de todos los módulos"
          badge="Cross-module view"
        />
      </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Users className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Usuarios Totales</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalUsers}</p>
            <p className="text-xs text-emerald-600 font-medium">+12% este mes</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Módulos Activos</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{modules.length}</p>
            <p className="text-xs text-slate-500 font-medium">Fidelización + Biografías + Ventas</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Actividad Reciente</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">156</p>
            <p className="text-xs text-slate-500 font-medium">Acciones en las últimas 24h</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {MODULES.map((mod) => (
            <div key={mod.id} className="bg-white rounded-2xl border border-slate-200 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${mod.color} flex items-center justify-center`}>
                    <mod.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{mod.name}</h3>
                    <p className="text-xs text-slate-400">v{mod.version}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {mod.status === 'healthy' ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs font-semibold text-emerald-600">Saludable</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs font-semibold text-amber-600">Atención</span>
                    </>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Usuarios</span>
                  <span className="text-lg font-bold text-slate-800">{mod.users}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Uptime</span>
                  <span className="text-lg font-bold text-slate-800">{mod.uptime}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Deploy</span>
                  <span className="text-sm font-bold text-slate-800">{mod.lastDeploy}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3">
          <h2 className="font-bold text-slate-900 mb-4">Distribución de Usuarios por Módulo</h2>
          <div className="space-y-3">
            {modules.map((mod) => {
              const pct = Math.round((mod.users / totalUsers) * 100);
              return (
                <div key={mod.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{mod.name}</span>
                    <span className="text-slate-500">{mod.users} usuarios ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${mod.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
    </div>
  );
}
