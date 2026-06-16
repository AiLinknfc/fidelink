import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  getBusinessClients, getCardConfig,
  type LoyaltyCard as LoyaltyCardType,
  type BusinessBranding,
} from '@/services/loyaltyService';
import LoyaltyCard from '../components/LoyaltyCard';
import { motion } from 'motion/react';
import { Users, UserCheck, Search } from 'lucide-react';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';

function Spinner({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-on-surface-variant">{label}</p>
      </div>
    </div>
  );
}

export default function ClientList() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { brand } = useModuleBrand();
  const businessId = user?.id;

  const [clients, setClients] = useState<LoyaltyCardType[]>([]);
  const [branding, setBranding] = useState<BusinessBranding | null>(null);
  const [cardTitle, setCardTitle] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!businessId) { navigate('/'); return; }

    let cancelled = false;
    setDataLoading(true);

    Promise.all([
      getBusinessClients(businessId),
      getCardConfig(businessId),
    ]).then(([clientsRes, configRes]) => {
      if (cancelled) return;
      if (clientsRes.error) setErrorMsg('No se pudieron cargar los clientes. Intenta de nuevo.');
      else {
        const sorted = (clientsRes.data ?? []).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setClients(sorted);
      }
      if (!configRes.error && configRes.data) {
        const cfg = configRes.data;
        setBranding({
          logoUrl:        cfg.logoUrl        ?? null,
          description:    cfg.description    ?? null,
          category:       cfg.category       ?? null,
          address:        cfg.address        ?? null,
          website:        cfg.website        ?? null,
          email:          cfg.email          ?? null,
          instagram:      cfg.instagram      ?? null,
          facebook:       cfg.facebook       ?? null,
          cardTag:        cfg.cardTag        ?? 'Loyalty',
          programType:    cfg.programType    ?? 'stamp_based',
          termsOfService: cfg.termsOfService ?? null,
        });
        setCardTitle(cfg.cardTitle ?? null);
      }
      setDataLoading(false);
    });
    return () => { cancelled = true; };
  }, [authLoading, businessId, navigate]);

  const [chipHovered, setChipHovered] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const filtered = query.trim()
    ? clients.filter((c) =>
        (c.client?.name ?? '').toLowerCase().includes(query.toLowerCase()) ||
        (c.client?.email ?? '').toLowerCase().includes(query.toLowerCase())
      )
    : clients;

  if (authLoading || dataLoading) return <Spinner label="Cargando clientes…" />;
  if (!businessId) return null;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="bg-[#f8fafc] border-b border-slate-200 px-4 sm:px-6 h-10 flex flex-row items-center justify-between gap-2 select-none overflow-hidden flex-shrink-0">

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
          <UserCheck
            className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300"
            style={{ transform: chipHovered ? 'rotate(-15deg) scale(1.2)' : 'none' }}
          />
          <span className="text-[12px] font-bold font-sans whitespace-nowrap flex-shrink-0">Tarjetahabientes activos</span>
          <span
            className="text-[12px] font-sans whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out"
            style={{
              maxWidth: chipHovered ? '600px' : '0px',
              opacity: chipHovered ? 1 : 0,
              paddingLeft: chipHovered ? '6px' : '0px',
              color: `${brand.colorHex}99`,
              fontWeight: 500,
            }}
          >
            · Visualiza la lista de tarjetahabientes activos de tu programa de fidelización
          </span>
        </div>

        {/* RIGHT — estado + búsqueda */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-full flex-shrink-0">
            <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: brand.colorHex }} />
            <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">{clients.length} {clients.length === 1 ? 'cliente' : 'clientes'}</span>
          </div>
          {clients.length > 0 && (
            <div className="relative w-44 sm:w-56 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar…"
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] focus:outline-none focus:border-slate-400 text-slate-800 placeholder:text-slate-400"
              />
            </div>
          )}
        </div>
      </div>
      <main className="flex-1 overflow-y-auto px-4 md:px-6 pt-3 pb-6 space-y-4">

        {errorMsg && (
          <div className="p-4 bg-error-container text-on-error-container rounded-xl" role="alert">
            {errorMsg}
          </div>
        )}

        {!errorMsg && clients.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-12 text-center">
            <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-on-surface-variant" />
            </div>
            <p className="text-body-lg text-on-surface-variant mb-2">Aún no tienes clientes registrados</p>
            <p className="text-body-md text-on-surface-variant">
              Comienza registrando compras para agregar clientes
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-on-surface-variant py-8">
            No se encontraron clientes con "{query}".
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((client, idx) => {
              const isComplete = client.currentStamps >= client.totalStamps;
              const isHovered = hoveredCard === client.id;
              return (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative space-y-3 p-3 rounded-2xl border transition-all duration-300 ease-in-out overflow-hidden cursor-default"
                  style={{
                    backgroundColor: isHovered ? `${brand.colorHex}05` : 'transparent',
                    borderColor: isHovered ? `${brand.colorHex}44` : 'transparent',
                    boxShadow: isHovered
                      ? `0 0 0 3px ${brand.colorHex}12, 0 6px 20px ${brand.colorHex}16`
                      : '0 0 0 0px transparent',
                  }}
                  onMouseEnter={() => setHoveredCard(client.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Glow sweep */}
                  <div
                    className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-500"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      background: `linear-gradient(135deg, ${brand.colorHex}04 0%, ${brand.colorHex}10 50%, ${brand.colorHex}04 100%)`,
                    }}
                  />

                  {/* Client badge */}
                  <div className="relative flex items-center justify-between px-1">
                    <div className="min-w-0">
                      <p
                        className="text-[12px] font-semibold truncate transition-colors duration-300"
                        style={{ color: isHovered ? brand.colorHex : '#1e293b' }}
                      >
                        {client.client?.name ?? 'Sin nombre'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {client.client?.email ?? ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {isComplete && (
                        <span
                          className="text-label-md font-bold px-2 py-0.5 rounded-full border transition-colors duration-300"
                          style={isHovered ? {
                            backgroundColor: `${brand.colorHex}14`,
                            color: brand.colorHex,
                            borderColor: `${brand.colorHex}44`,
                          } : {
                            backgroundColor: '#f0fdf4',
                            color: '#15803d',
                            borderColor: '#bbf7d0',
                          }}
                        >
                          ¡COMPLETA!
                        </span>
                      )}
                      <span
                        className="text-label-md font-bold transition-colors duration-300"
                        style={{ color: isHovered ? brand.colorHex : '#64748b' }}
                      >
                        {client.currentStamps}/{client.totalStamps}
                      </span>
                    </div>
                  </div>

                  <div className="relative">
                    <LoyaltyCard
                      businessName={client.businessName}
                      totalStamps={client.totalStamps}
                      currentStamps={client.currentStamps}
                      rewardDescription={client.rewardDescription}
                      colorHex={client.colorHex}
                      cardId={client.id}
                      branding={branding ?? undefined}
                      cardTitle={cardTitle}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
