import { Search, CreditCard, Book, ShoppingBag, Users } from 'lucide-react';
import { useState } from 'react';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';

const MOCK_CLIENTS = [
  { id: '1', name: 'Carlos Mendoza',  email: 'carlos@ejemplo.com', module: 'fidelizacion', cards: 3, joined: '2026-01-15' },
  { id: '2', name: 'Laura Silva',     email: 'laura@ejemplo.com',  module: 'biografias',   cards: 0, joined: '2026-02-20' },
  { id: '3', name: 'María García',    email: 'maria@ejemplo.com',  module: 'fidelizacion', cards: 5, joined: '2026-03-10' },
  { id: '4', name: 'Juan Pérez',      email: 'juan@ejemplo.com',   module: 'biografias',   cards: 0, joined: '2026-04-05' },
  { id: '5', name: 'Ana Martínez',    email: 'ana@ejemplo.com',    module: 'ventas',       cards: 0, joined: '2026-05-20' },
];

const MODULE_FILTERS = [
  { value: 'all',          label: 'Todos'       },
  { value: 'fidelizacion', label: 'Fidelización' },
  { value: 'biografias',   label: 'Biografías'  },
  { value: 'ventas',       label: 'Ventas'      },
] as const;

type Filter = typeof MODULE_FILTERS[number]['value'];

const MODULE_COLORS: Record<string, string> = {
  fidelizacion: '#7c3aed',
  ventas: '#10b981',
  biografias: '#6366f1',
};

function ModuleIcon({ module, isHovered, brandColor }: { module: string; isHovered: boolean; brandColor: string }) {
  const color = isHovered ? brandColor : (MODULE_COLORS[module] ?? '#6366f1');
  const Icon = module === 'fidelizacion' ? CreditCard : module === 'ventas' ? ShoppingBag : Book;
  return <Icon className="w-3.5 h-3.5 transition-colors duration-300" style={{ color }} />;
}

export default function AdminClients() {
  const { brand } = useModuleBrand();

  const [filter, setFilter]       = useState<Filter>('all');
  const [query, setQuery]         = useState('');
  const [chipHovered, setChipHovered] = useState(false);
  const [hoveredRow, setHoveredRow]   = useState<string | null>(null);

  const filtered = MOCK_CLIENTS.filter((c) => {
    const matchModule = filter === 'all' || c.module === filter;
    const matchQuery  = !query.trim() ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase());
    return matchModule && matchQuery;
  });

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Barra secundaria ── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 h-12
                      flex flex-row items-center justify-between
                      gap-2 select-none overflow-hidden flex-shrink-0">

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
          <Users
            className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300"
            style={{ transform: chipHovered ? 'rotate(-15deg) scale(1.2)' : 'none' }}
          />
          <span className="text-[12px] font-bold font-sans whitespace-nowrap flex-shrink-0">Clientes Cross-Module</span>
          <span
            className="text-[12px] font-light font-sans whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out"
            style={{
              maxWidth: chipHovered ? '600px' : '0px',
              opacity: chipHovered ? 1 : 0,
              paddingLeft: chipHovered ? '6px' : '0px',
              color: `${brand.colorHex}99`,
            }}
          >
            · Todos los clientes registrados en la plataforma
          </span>
        </div>

        {/* RIGHT — estado + búsqueda */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-full flex-shrink-0">
            <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: brand.colorHex }} />
            <span className="text-status text-slate-600 whitespace-nowrap">
              {filtered.length} {filtered.length === 1 ? 'cliente' : 'clientes'}
            </span>
          </div>
          <div className="relative w-44 sm:w-56 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar…"
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-400 text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 md:px-6 pt-3 pb-6 space-y-4">

        {/* Filtros de módulo — variante C: botón de selección activa */}
        <div className="flex gap-1.5 flex-wrap">
          {MODULE_FILTERS.map(({ value, label }) => {
            const isActive = filter === value;
            return (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className="relative px-3 py-1.5 rounded-full text-chip border transition-all duration-300 ease-in-out overflow-hidden"
                style={{
                  borderColor:     isActive ? brand.colorHex       : 'rgb(226 232 240)',
                  backgroundColor: isActive ? `${brand.colorHex}10` : '#ffffff',
                  color:           isActive ? brand.colorHex       : '#64748b',
                  boxShadow: isActive
                    ? `0 0 0 3px ${brand.colorHex}18, 0 2px 8px ${brand.colorHex}20`
                    : 'none',
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none rounded-full transition-opacity duration-500"
                  style={{
                    opacity: isActive ? 1 : 0,
                    background: `linear-gradient(135deg, ${brand.colorHex}04 0%, ${brand.colorHex}14 50%, ${brand.colorHex}04 100%)`,
                  }}
                />
                <span className="relative">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Tabla de clientes */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

          {/* Cabecera */}
          <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
            <span className="col-span-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider font-jakarta text-left">Cliente</span>
            <span className="col-span-3 text-[12px] font-bold text-slate-500 uppercase tracking-wider font-jakarta text-left">Correo</span>
            <span className="col-span-2 text-[12px] font-bold text-slate-500 uppercase tracking-wider font-jakarta text-left">Módulo</span>
            <span className="col-span-1 text-[12px] font-bold text-slate-500 uppercase tracking-wider font-jakarta text-center">Cards</span>
            <span className="col-span-2 text-[12px] font-bold text-slate-500 uppercase tracking-wider font-jakarta text-center">Ingreso</span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No se encontraron clientes.</p>
            </div>
          ) : (
            filtered.map((client) => {
              const isHovered = hoveredRow === client.id;
              return (
                <div
                  key={client.id}
                  className="relative grid grid-cols-12 gap-3 px-4 py-3 border-b border-slate-100 items-center overflow-hidden"
                  style={{
                    backgroundColor: isHovered ? `${brand.colorHex}0d` : '#ffffff',
                    borderLeft: `3px solid ${isHovered ? brand.colorHex : 'transparent'}`,
                    transition: 'background-color 0.25s ease, border-left-color 0.25s ease',
                  }}
                  onMouseEnter={() => setHoveredRow(client.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {/* Glow sweep */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      background: `linear-gradient(105deg, ${brand.colorHex}08 0%, ${brand.colorHex}18 50%, ${brand.colorHex}08 100%)`,
                    }}
                  />

                  {/* Cliente */}
                  <div className="relative col-span-4 flex items-center justify-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-avatar transition-colors duration-300"
                      style={isHovered ? {
                        backgroundColor: `${brand.colorHex}18`,
                        color: brand.colorHex,
                      } : {
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                      }}
                    >
                      {client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <p
                      className="text-data-primary transition-colors duration-300"
                      style={{ color: isHovered ? brand.colorHex : '#1e293b' }}
                    >
                      {client.name}
                    </p>
                  </div>

                  {/* Correo */}
                  <div className="relative col-span-3">
                    <span className="text-data-secondary text-slate-400 truncate block">{client.email}</span>
                  </div>

                  {/* Módulo */}
                  <div className="relative col-span-2 flex items-center gap-1.5">
                    <ModuleIcon module={client.module} isHovered={isHovered} brandColor={brand.colorHex} />
                    <span className="text-chip-sub text-slate-600 capitalize truncate transition-colors duration-300"
                      style={{ color: isHovered ? brand.colorHex : '#475569' }}
                    >{client.module}</span>
                  </div>

                  {/* Tarjetas */}
                  <div className="relative col-span-1 flex justify-center">
                    <span
                      className="text-data-number transition-colors duration-300"
                      style={{ color: isHovered ? brand.colorHex : '#334155' }}
                    >
                      {client.cards}
                    </span>
                  </div>

                  {/* Ingreso */}
                  <div className="relative col-span-2 flex justify-center">
                    <span className="text-[11px] font-sans text-slate-400 tabular-nums">{client.joined}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
