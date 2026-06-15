import { Search, CreditCard, Book, ShoppingBag, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

const MOCK_CLIENTS = [
  { id: '1', name: 'Carlos Mendoza', email: 'carlos@ejemplo.com', module: 'fidelizacion', cards: 3, joined: '2026-01-15' },
  { id: '2', name: 'Laura Silva', email: 'laura@ejemplo.com', module: 'biografias', cards: 0, joined: '2026-02-20' },
  { id: '3', name: 'María García', email: 'maria@ejemplo.com', module: 'fidelizacion', cards: 5, joined: '2026-03-10' },
  { id: '4', name: 'Juan Pérez', email: 'juan@ejemplo.com', module: 'biografias', cards: 0, joined: '2026-04-05' },
  { id: '5', name: 'Ana Martínez', email: 'ana@ejemplo.com', module: 'ventas', cards: 0, joined: '2026-05-20' },
];

export default function AdminClients() {
  const [filter, setFilter] = useState<'all' | 'fidelizacion' | 'biografias' | 'ventas'>('all');

  const filtered = filter === 'all' ? MOCK_CLIENTS : MOCK_CLIENTS.filter((c) => c.module === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes Cross-Module</h1>
          <p className="text-sm text-slate-500">Todos los clientes de la plataforma</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Buscar clientes..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm" />
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {(['all', 'fidelizacion', 'biografias', 'ventas'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-colors ${filter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {f === 'all' ? 'Todos' : f === 'fidelizacion' ? 'Fidelización' : f === 'biografias' ? 'Biografías' : 'Ventas'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <div className="grid grid-cols-5 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span className="col-span-2">Cliente</span>
          <span>Módulo</span>
          <span>Tarjetas</span>
          <span>Ingreso</span>
        </div>
        {filtered.map((client) => (
          <div key={client.id} className="grid grid-cols-5 gap-4 p-4 border-b border-slate-100 items-center hover:bg-slate-50 transition-colors">
            <div className="col-span-2 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                {client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{client.name}</p>
                <p className="text-xs text-slate-400">{client.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {client.module === 'fidelizacion' ? (
                <CreditCard className="w-3.5 h-3.5 text-violet-500" />
              ) : client.module === 'ventas' ? (
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Book className="w-3.5 h-3.5 text-indigo-500" />
              )}
              <span className="text-xs font-medium text-slate-600 capitalize">{client.module}</span>
            </div>
            <span className="text-sm font-semibold text-slate-700">{client.cards}</span>
            <span className="text-xs text-slate-400">{client.joined}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
