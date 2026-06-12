import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getClientCards, type LoyaltyCard } from '@/services/loyaltyService';
import LoyaltyCardComponent from '@/components/loyalty/LoyaltyCard';
import { motion } from 'motion/react';

function sortCards(cards: LoyaltyCard[]) {
  return [...cards].sort((a, b) => {
    const aComplete = a.currentStamps >= a.totalStamps ? 1 : 0;
    const bComplete = b.currentStamps >= b.totalStamps ? 1 : 0;
    if (bComplete !== aComplete) return bComplete - aComplete;
    const aProgress = a.totalStamps > 0 ? a.currentStamps / a.totalStamps : 0;
    const bProgress = b.totalStamps > 0 ? b.currentStamps / b.totalStamps : 0;
    return bProgress - aProgress;
  });
}

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

export default function MyCards() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const clientId = user?.id;

  const [cards, setCards] = useState<LoyaltyCard[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!clientId) {
      navigate('/');
      return;
    }

    let cancelled = false;
    setDataLoading(true);

    getClientCards(clientId).then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        setErrorMsg('No se pudieron cargar tus tarjetas. Intenta de nuevo.');
      } else {
        setCards(sortCards(data ?? []));
      }
      setDataLoading(false);
    });

    return () => { cancelled = true; };
  }, [authLoading, clientId, navigate]);

  if (authLoading || dataLoading) return <Spinner label="Cargando tarjetas…" />;
  if (!clientId) return null;

  return (
    <div className="min-h-screen bg-surface pb-32">
      <main className="max-w-7xl mx-auto px-4 md:px-12 pt-8 space-y-8">
        <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant shadow-sm">
          <h2 className="text-headline-lg text-on-surface font-bold mb-2">
            Mis Tarjetas ({cards.length})
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Gestiona todas tus tarjetas de fidelización en un solo lugar.{' '}
            <span className="text-on-surface-variant/80">
              Toca cualquier tarjeta para ver el QR y los datos de la empresa.
            </span>
          </p>

          {errorMsg && (
            <div className="mt-6 p-4 bg-error-container text-on-error-container rounded-xl" role="alert">
              {errorMsg}
            </div>
          )}

          {!errorMsg && cards.length === 0 ? (
            <div className="mt-8 text-center py-12">
              <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-body-lg text-on-surface-variant mb-2">No tienes tarjetas aún</p>
              <p className="text-body-md text-on-surface-variant">
                Registra una compra para obtener tu primera tarjeta
              </p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cards.map((card, idx) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <LoyaltyCardComponent
                    businessName={card.businessName}
                    totalStamps={card.totalStamps}
                    currentStamps={card.currentStamps}
                    rewardDescription={card.rewardDescription}
                    colorHex={card.colorHex}
                    cardId={card.id}
                    branding={card.business}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
