import { CreditCard, Book, ShoppingBag, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';

const MODULES = [
  {
    id: 'fidelizacion',
    name: 'Fidelización',
    icon: CreditCard,
    color: 'violet',
    status: 'healthy',
    version: '1.0.0',
    users: 42,
    uptime: '99.9%',
    lastDeploy: '2026-06-10',
  },
  {
    id: 'biografias',
    name: 'Biografías',
    icon: Book,
    color: 'indigo',
    status: 'healthy',
    version: '0.1.0',
    users: 28,
    uptime: '98.5%',
    lastDeploy: '2026-06-12',
  },
  {
    id: 'ventas',
    name: 'Ventas',
    icon: ShoppingBag,
    color: 'emerald',
    status: 'healthy',
    version: '1.0.0',
    users: 15,
    uptime: '99.2%',
    lastDeploy: '2026-06-14',
  },
];

const colorMap: Record<string, string> = {
  violet: 'bg-violet-500',
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
};

export default function AdminModules() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Estado de Módulos</h1>
          <p className="text-sm text-slate-500">Monitoreo y salud de cada módulo de la plataforma</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <div key={mod.id} className="bg-white rounded-2xl border border-slate-200 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${colorMap[mod.color] || 'bg-slate-500'} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
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
              <button className="w-full py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" /> Ver dashboard del módulo
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
