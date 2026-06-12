import { useState, useRef, type ComponentType, type MouseEvent } from 'react';
import { Star, Coffee, Heart, ShoppingBag, Ticket, RefreshCw, MapPin, Globe, Tag, Building2, Download } from 'lucide-react';

const CATEGORY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  'Food & Drink': Coffee,
  'Health & Beauty': Heart,
  'Retail & Shopping': ShoppingBag,
  'Entertainment': Ticket,
};

function StampIcon({ category, className }: { category?: string | null; className?: string }) {
  const Icon = (category && CATEGORY_ICONS[category]) ?? Star;
  return <Icon className={className} />;
}
import { motion } from 'motion/react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import type { BusinessBranding } from '@/services/loyaltyService';

interface LoyaltyCardProps {
  businessName: string;
  totalStamps: number;
  currentStamps: number;
  rewardDescription: string;
  colorHex: string;
  isCompact?: boolean;
  /** Si se provee, la tarjeta es flippable y muestra la cara B (info + QR). */
  cardId?: string;
  branding?: BusinessBranding;
}

/** URL pública del QR personal del cliente (usado por la empresa para identificar la tarjeta). */
export function buildClientQrUrl(cardId: string): string {
  return `https://ailink.com.co/card/${cardId}`;
}

export default function LoyaltyCard({
  businessName,
  totalStamps,
  currentStamps,
  rewardDescription,
  colorHex,
  isCompact = false,
  cardId,
  branding,
}: LoyaltyCardProps) {
  const progress = (currentStamps / totalStamps) * 100;
  const isComplete = currentStamps >= totalStamps;
  const flippable = !!cardId;
  const isAccumulative = branding?.programType === 'accumulative';
  const unitLabel = isAccumulative
    ? (currentStamps === 1 ? 'punto' : 'puntos')
    : (currentStamps === 1 ? 'sello' : 'sellos');
  const [flipped, setFlipped] = useState(false);
  const qrDownloadRef = useRef<HTMLCanvasElement>(null);

  function handleDownloadQr(e: MouseEvent) {
    e.stopPropagation();
    const canvas = qrDownloadRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessName.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const cardStyle = {
    background: `linear-gradient(135deg, ${colorHex}dd, ${colorHex}99)`,
  };

  if (isCompact) {
    return (
      <div
        className="card-shine-trigger rounded-2xl p-4 shadow-lg text-white relative overflow-hidden"
        style={cardStyle}
      >
        <div className="card-shine" aria-hidden="true" />
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg">{businessName}</h3>
            <p className="text-sm opacity-90">{rewardDescription}</p>
          </div>
          {isComplete && (
            <div className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold">
              ¡COMPLETA!
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-white"
            />
          </div>
          <p className="text-sm font-medium">
            {currentStamps} / {totalStamps} sellos
          </p>
        </div>
      </div>
    );
  }

  const Front = (
    <div
      className="card-shine-trigger absolute inset-0 rounded-3xl p-6 shadow-xl text-white overflow-hidden flex flex-col justify-between"
      style={{
        ...cardStyle,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
      <div className="card-shine" aria-hidden="true" />

      <div className="relative z-10 flex justify-between items-start gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-2xl mb-1 truncate">{businessName}</h3>
          <p className="text-sm opacity-90 line-clamp-2">{rewardDescription}</p>
        </div>
        {flippable && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setFlipped(true); }}
            aria-label="Girar tarjeta"
            className="shrink-0 bg-white/15 hover:bg-white/25 backdrop-blur-sm p-2 rounded-full transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {isAccumulative ? (
        <div className="relative z-10 my-4 flex items-center justify-center">
          <div className="text-center">
            <motion.p
              key={currentStamps}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 18 }}
              className="text-6xl font-extrabold tracking-tight"
            >
              {currentStamps}
              <span className="text-3xl opacity-70"> / {totalStamps}</span>
            </motion.p>
            <p className="text-sm opacity-80 uppercase tracking-widest mt-1">{unitLabel}</p>
          </div>
        </div>
      ) : (
        <div className="relative z-10 my-4">
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: totalStamps }).map((_, index) => (
              <div
                key={index}
                className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                  index < currentStamps
                    ? 'bg-white/30 shadow-inner'
                    : 'bg-white/10 border-2 border-white/20'
                }`}
              >
                {index < currentStamps && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.05, type: 'spring' }}
                  >
                    <StampIcon category={branding?.category} className="w-5 h-5 fill-white" />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative z-10 space-y-2">
        <div className="h-3 bg-white/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-white rounded-full"
          />
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium">
            {currentStamps} de {totalStamps} {unitLabel}
          </span>
          {isComplete && (
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              ¡Recompensa lista!
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const Back = (
    <div
      className="card-shine-trigger absolute inset-0 rounded-3xl p-5 shadow-xl text-white overflow-hidden flex flex-col"
      style={{
        ...cardStyle,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
      }}
    >
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full" />
      <div className="card-shine" aria-hidden="true" />

      <div className="relative z-10 flex items-start gap-3">
        {branding?.logoUrl ? (
          <img
            src={branding.logoUrl}
            alt={businessName}
            className="w-14 h-14 rounded-xl object-cover bg-white/20 shadow-md border-2 border-white/30 shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border-2 border-white/30">
            <Building2 className="w-6 h-6" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg leading-tight truncate">{businessName}</h3>
          {branding?.category && (
            <p className="text-[11px] uppercase tracking-wider opacity-80 flex items-center gap-1 mt-0.5">
              <Tag className="w-3 h-3" />
              {branding.category}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
          aria-label="Volver a la cara frontal"
          className="shrink-0 bg-white/15 hover:bg-white/25 backdrop-blur-sm p-1.5 rounded-full transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {branding?.description && (
        <p className="relative z-10 text-[12px] opacity-90 mt-3 line-clamp-3 leading-snug">
          {branding.description}
        </p>
      )}

      <div className="relative z-10 mt-3 space-y-1 text-[11px] opacity-90">
        {branding?.address && (
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
            <span className="truncate">{branding.address}</span>
          </div>
        )}
        {branding?.website && (
          <div className="flex items-start gap-1.5">
            <Globe className="w-3 h-3 mt-0.5 shrink-0" />
            <span className="truncate">{branding.website}</span>
          </div>
        )}
      </div>

      {cardId && (
        <div className="relative z-10 mt-auto flex flex-col items-center gap-1.5 pt-3">
          <QRCodeCanvas
            ref={qrDownloadRef}
            value={buildClientQrUrl(cardId)}
            size={512}
            level="M"
            fgColor="#000000"
            bgColor="#ffffff"
            style={{ display: 'none', position: 'absolute', pointerEvents: 'none' }}
          />
          <div className="bg-white rounded-xl p-2 shadow-md">
            <QRCodeSVG
              value={buildClientQrUrl(cardId)}
              size={88}
              level="M"
              fgColor="#000000"
              bgColor="#ffffff"
              includeMargin={false}
            />
          </div>
          <p className="text-[10px] opacity-80 tracking-wider uppercase">
            Muestra este QR al pagar
          </p>
          <button
            type="button"
            onClick={handleDownloadQr}
            className="flex items-center gap-1 text-[11px] font-bold bg-white/15 hover:bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors"
            aria-label="Descargar QR como imagen"
          >
            <Download className="w-3 h-3" />
            Descargar QR
          </button>
        </div>
      )}
    </div>
  );

  if (!flippable) {
    // Modo legacy: sin flip, render plano (preserva uso en RegisterPurchase preview).
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="card-shine-trigger rounded-3xl p-6 shadow-xl text-white relative overflow-hidden min-h-[280px] flex flex-col justify-between"
        style={cardStyle}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
        <div className="card-shine" aria-hidden="true" />
        <div className="relative z-10">
          <h3 className="font-bold text-2xl mb-1">{businessName}</h3>
          <p className="text-sm opacity-90">{rewardDescription}</p>
        </div>
        <div className="relative z-10 my-4">
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: totalStamps }).map((_, index) => (
              <div
                key={index}
                className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                  index < currentStamps
                    ? 'bg-white/30 shadow-inner'
                    : 'bg-white/10 border-2 border-white/20'
                }`}
              >
                {index < currentStamps && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.05, type: 'spring' }}
                  >
                    <StampIcon category={branding?.category} className="w-5 h-5 fill-white" />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 space-y-2">
          <div className="h-3 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-white rounded-full"
            />
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">
              {currentStamps} de {totalStamps} sellos
            </span>
            {isComplete && (
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                ¡Recompensa lista!
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Modo flip: contenedor con perspective y wrapper que rota 3D al click.
  return (
    <div
      className="relative w-full min-h-[300px] cursor-pointer"
      style={{ perspective: '1200px' }}
      onClick={() => setFlipped((f) => !f)}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setFlipped((f) => !f);
        }
      }}
    >
      <motion.div
        className="relative w-full h-full min-h-[300px]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {Front}
        {Back}
      </motion.div>
    </div>
  );
}
