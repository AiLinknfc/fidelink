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
import { Users, Search, UserCheck } from 'lucide-react';
import SectionRibbon from '@/platform/ui/SectionRibbon';

function Spinner({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">{label}</p>
      </div>
    </div>
  );
}

export default function CRM() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
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

  const filtered = query.trim()
    ? clients.filter((c) =>
        (c.client?.name ?? '').toLowerCase().includes(query.toLowerCase()) ||
        (c.client?.email ?? '').toLowerCase().includes(query.toLowerCase())
      )
    : clients;

  if (authLoading || dataLoading) return <Spinner label="Cargando clientes…" />;
  if (!businessId) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        <SectionRibbon
          icon={UserCheck}
          title="Clientes"
          description="Visualiza la lista de tarjetahabientes activos de tu programa de fidelización"
        />
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold font-headline text-slate-800">Clientes</h2>
            <p className="text-sm text-slate-500">
              {clients.length} {clients.length === 1 ? 'cliente registrado' : 'clientes registrados'}
            </p>
          </div>
          {clients.length > 0 && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o correo…"
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-slate-800"
              />
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {!errorMsg && clients.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-lg text-slate-500 mb-2">Aún no tienes clientes registrados</p>
            <p className="text-sm text-slate-400">
              Comienza registrando compras para agregar clientes
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-slate-500 py-8 text-sm">
            No se encontraron clientes con &quot;{query}&quot;.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((client, idx) => {
              const isComplete = client.currentStamps >= client.totalStamps;
              return (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="space-y-3"
                >
                  {/* Client badge */}
                  <div className="flex items-center justify-between px-1">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate text-sm">
                        {client.client?.name ?? 'Sin nombre'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {client.client?.email ?? ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {isComplete && (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          COMPLETA
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-500">
                        {client.currentStamps}/{client.totalStamps}
                      </span>
                    </div>
                  </div>

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
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
