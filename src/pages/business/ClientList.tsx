import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getBusinessClients, type LoyaltyCard as LoyaltyCardType } from '@/services/loyaltyService';
import LoyaltyCard from '@/components/loyalty/LoyaltyCard';
import { motion } from 'motion/react';
import { Users } from 'lucide-react';

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
  const businessId = user?.id;

  const [clients, setClients] = useState<LoyaltyCardType[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!businessId) { navigate('/'); return; }

    let cancelled = false;
    setDataLoading(true);
    getBusinessClients(businessId).then(({ data, error }) => {
      if (cancelled) return;
      if (error) setErrorMsg('No se pudieron cargar los clientes. Intenta de nuevo.');
      else {
        const sorted = (data ?? []).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setClients(sorted);
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
    <div className="min-h-screen bg-surface pb-32">
      <main className="max-w-7xl mx-auto px-4 md:px-12 pt-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-headline-lg text-on-surface font-bold">Mis Clientes</h2>
            <p className="text-body-md text-on-surface-variant">
              {clients.length} {clients.length === 1 ? 'cliente registrado' : 'clientes registrados'}
            </p>
          </div>
          {clients.length > 0 && (
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o correo…"
              className="w-full sm:w-72 px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          )}
        </div>

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
                      <p className="font-bold text-on-surface truncate">
                        {client.client?.name ?? 'Sin nombre'}
                      </p>
                      <p className="text-body-sm text-on-surface-variant truncate">
                        {client.client?.email ?? ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {isComplete && (
                        <span className="bg-tertiary-container text-on-tertiary-container text-label-md font-bold px-2 py-0.5 rounded-full">
                          ¡COMPLETA!
                        </span>
                      )}
                      <span className="text-label-md font-bold text-on-surface-variant">
                        {client.currentStamps}/{client.totalStamps}
                      </span>
                    </div>
                  </div>

                  {/* Full flippable card (cardId enables flip + QR) */}
                  <LoyaltyCard
                    businessName={client.businessName}
                    totalStamps={client.totalStamps}
                    currentStamps={client.currentStamps}
                    rewardDescription={client.rewardDescription}
                    colorHex={client.colorHex}
                    cardId={client.id}
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
