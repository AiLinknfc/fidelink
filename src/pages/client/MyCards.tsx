import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getClientCards, type LoyaltyCard } from '@/services/loyaltyService';
import LoyaltyCardComponent from '@/modules/fidelizacion/components/LoyaltyCard';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function sortCards(cards: LoyaltyCard[]) {
  return [...cards].sort((a, b) => {
    const aComplete = a.currentStamps >= a.totalStamps ? 1 : 0;
    const bComplete = b.currentStamps >= b.totalStamps ? 1 : 0;
    if (bComplete !== aComplete) return bComplete - aComplete;
    const aP = a.totalStamps > 0 ? a.currentStamps / a.totalStamps : 0;
    const bP = b.totalStamps > 0 ? b.currentStamps / b.totalStamps : 0;
    return bP - aP;
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

const SWIPE_THRESHOLD = 50;

export default function MyCards() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const clientId = user?.id;

  const [cards, setCards] = useState<LoyaltyCard[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  useEffect(() => {
    if (authLoading) return;
    if (!clientId) { navigate('/'); return; }

    let cancelled = false;
    setDataLoading(true);
    getClientCards(clientId).then(({ data, error }) => {
      if (cancelled) return;
      if (error) setErrorMsg('No se pudieron cargar tus tarjetas. Intenta de nuevo.');
      else setCards(sortCards(data ?? []));
      setDataLoading(false);
    });
    return () => { cancelled = true; };
  }, [authLoading, clientId, navigate]);

  function prev() {
    if (activeIdx === 0) return;
    setDirection(-1);
    setActiveIdx((i) => i - 1);
  }

  function next() {
    if (activeIdx === cards.length - 1) return;
    setDirection(1);
    setActiveIdx((i) => i + 1);
  }

  if (authLoading || dataLoading) return <Spinner label="Cargando tarjetas…" />;
  if (!clientId) return null;

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 280 : -280, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -280 : 280, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-surface pb-32">
      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-headline-lg text-on-surface font-bold">
              Mis Tarjetas
            </h2>
            {cards.length > 0 && (
              <span className="text-body-sm text-on-surface-variant font-bold">
                {activeIdx + 1} / {cards.length}
              </span>
            )}
          </div>
          <p className="text-body-md text-on-surface-variant">
            Toca la tarjeta para ver el QR y los datos de la empresa.
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
            <div className="mt-6 space-y-5">
              {/* Carousel */}
              <div className="relative overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={activeIdx}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.15}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -SWIPE_THRESHOLD) next();
                      else if (info.offset.x > SWIPE_THRESHOLD) prev();
                    }}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <LoyaltyCardComponent
                      businessName={cards[activeIdx].businessName}
                      totalStamps={cards[activeIdx].totalStamps}
                      currentStamps={cards[activeIdx].currentStamps}
                      rewardDescription={cards[activeIdx].rewardDescription}
                      colorHex={cards[activeIdx].colorHex}
                      cardId={cards[activeIdx].id}
                      branding={cards[activeIdx].business}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              {cards.length > 1 && (
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={prev}
                    disabled={activeIdx === 0}
                    className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors disabled:opacity-30"
                    aria-label="Tarjeta anterior"
                  >
                    <ChevronLeft className="w-5 h-5 text-on-surface" />
                  </button>

                  {/* Dot indicators */}
                  <div className="flex gap-2">
                    {cards.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { setDirection(i > activeIdx ? 1 : -1); setActiveIdx(i); }}
                        className={`rounded-full transition-all ${
                          i === activeIdx
                            ? 'w-6 h-2.5 bg-primary'
                            : 'w-2.5 h-2.5 bg-outline-variant hover:bg-on-surface-variant'
                        }`}
                        aria-label={`Ir a tarjeta ${i + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={next}
                    disabled={activeIdx === cards.length - 1}
                    className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors disabled:opacity-30"
                    aria-label="Siguiente tarjeta"
                  >
                    <ChevronRight className="w-5 h-5 text-on-surface" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
