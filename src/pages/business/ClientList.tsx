import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/index';
import { useAuth } from '@/context/AuthContext';
import { getBusinessClients, type LoyaltyCard as LoyaltyCardType } from '@/services/loyaltyService';
import LoyaltyCard from '@/components/loyalty/LoyaltyCard';
import { motion, AnimatePresence } from 'motion/react';

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
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const businessId = user?.id;

  const [clients, setClients] = useState<LoyaltyCardType[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!businessId) {
      navigate('/');
      return;
    }

    let cancelled = false;
    setDataLoading(true);

    getBusinessClients(businessId).then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        setErrorMsg('No se pudieron cargar los clientes. Intenta de nuevo.');
      } else {
        const sorted = (data ?? []).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setClients(sorted);
      }
      setDataLoading(false);
    });

    return () => { cancelled = true; };
  }, [authLoading, businessId, navigate]);

  function handleRowClick(clientId: string) {
    setSelectedClientId((prev) => (prev === clientId ? null : clientId));
  }

  const selectedClient = clients.find((c) => c.clientId === selectedClientId);

  if (authLoading || dataLoading) return <Spinner label={t('Cargando clientes…') ?? 'Cargando clientes…'} />;
  if (!businessId) return null;

  return (
    <div className="min-h-screen bg-surface pb-32">
      <main className="max-w-7xl mx-auto px-4 md:px-12 pt-8 space-y-8">
        <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant shadow-sm">
          <h2 className="text-headline-lg text-on-surface font-bold mb-2">{t('Mis Clientes')}</h2>
          <p className="text-body-md text-on-surface-variant mb-8">{t('Gestiona las tarjetas de fidelización de tus clientes') ?? 'Gestiona las tarjetas de fidelización de tus clientes'}</p>

          {errorMsg && (
            <div className="p-4 bg-error-container text-on-error-container rounded-xl mb-6" role="alert">
              {errorMsg}
            </div>
          )}

          {!errorMsg && clients.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-body-lg text-on-surface-variant mb-2">Aún no tienes clientes registrados</p>
              <p className="text-body-md text-on-surface-variant">
                Comienza registrando compras para agregar clientes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {clients.map((client) => {
                const isComplete = client.currentStamps >= client.totalStamps;
                const progress = client.totalStamps > 0
                  ? Math.min(client.currentStamps / client.totalStamps, 1)
                  : 0;
                const isSelected = selectedClientId === client.clientId;

                return (
                  <div key={client.id} className="border border-outline-variant rounded-xl overflow-hidden">
                    <button
                      className={`w-full p-4 text-left transition-all ${
                        isSelected ? 'bg-surface-container' : 'bg-surface-container-lowest hover:bg-surface-container/50'
                      }`}
                      onClick={() => handleRowClick(client.clientId)}
                      aria-expanded={isSelected}
                      aria-label={`Ver tarjeta de ${client.client?.name ?? 'Cliente'}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-on-surface truncate">
                              {client.client?.name ?? 'Sin nombre'}
                            </span>
                            {isComplete && (
                              <span className="flex-shrink-0 bg-tertiary-container text-on-tertiary-container text-label-md font-bold px-2 py-1 rounded-full">
                                ¡COMPLETA!
                              </span>
                            )}
                          </div>
                          <span className="text-body-sm text-on-surface-variant block">
                            {client.client?.email ?? ''}
                          </span>
                        </div>

                        <div className="flex-shrink-0 text-right min-w-[120px]">
                          <span className="text-label-md text-on-surface-variant font-bold block mb-1">
                            {client.currentStamps} / {client.totalStamps}
                          </span>
                          <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${progress * 100}%` }}
                              role="progressbar"
                              aria-valuenow={client.currentStamps}
                              aria-valuemin={0}
                              aria-valuemax={client.totalStamps}
                            />
                          </div>
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isSelected && selectedClient && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-outline-variant p-4 bg-surface-container"
                        >
                          <div className="flex justify-center">
                            <LoyaltyCard
                              businessName={selectedClient.businessName}
                              totalStamps={selectedClient.totalStamps}
                              currentStamps={selectedClient.currentStamps}
                              rewardDescription={selectedClient.rewardDescription}
                              colorHex={selectedClient.colorHex}
                              isCompact={true}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
