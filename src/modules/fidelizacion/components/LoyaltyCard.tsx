import { useState, type ComponentType } from 'react';
import {
  Star, Coffee, Heart, ShoppingBag, Ticket,
  RefreshCw, MapPin, Globe, Building2, Nfc,
  Utensils, Gem, Monitor, ShoppingCart, Scissors, Dumbbell, Crown,
  BadgeCheck, Mail, Instagram, Facebook,
} from 'lucide-react';
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import type { BusinessBranding } from '@/services/loyaltyService';

// ── Stamp icon options (exported for picker) ──────────────────────────────────

export const STAMP_ICON_OPTIONS: { key: string; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { key: 'Star',        label: 'Estrella',  Icon: Star        },
  { key: 'Coffee',      label: 'Café',      Icon: Coffee      },
  { key: 'Heart',       label: 'Favorito',  Icon: Heart       },
  { key: 'ShoppingBag', label: 'Compras',   Icon: ShoppingBag },
  { key: 'Ticket',      label: 'Evento',    Icon: Ticket      },
];

// Category → stamp icon key
const CATEGORY_ICON_KEY: Record<string, string> = {
  // New Spanish categories
  'Cafetería y Bar':  'Coffee',
  'Restaurante':      'Coffee',
  'Moda y Joyas':     'ShoppingBag',
  'Tecnología':       'Star',
  'Entretenimiento':  'Ticket',
  'Tienda':           'ShoppingBag',
  'Salud':            'Heart',
  'Belleza':          'Heart',
  'Gimnasio':         'Heart',
  'Servicios VIP':    'Star',
  // Legacy English keys
  'Food & Drink':      'Coffee',
  'Health & Beauty':   'Heart',
  'Retail & Shopping': 'ShoppingBag',
  'Entertainment':     'Ticket',
};

// Category label (Spanish fallback)
const CATEGORY_LABEL_ES: Record<string, string> = {
  'Food & Drink':      'Comida & Bebida',
  'Health & Beauty':   'Salud & Belleza',
  'Retail & Shopping': 'Tiendas & Compras',
  'Entertainment':     'Entretenimiento',
};

const ICON_COMPONENT: Record<string, ComponentType<{ className?: string }>> = Object.fromEntries(
  STAMP_ICON_OPTIONS.map(({ key, Icon }) => [key, Icon])
);

function StampIcon({ iconKey, className }: { iconKey?: string | null; className?: string }) {
  const Icon = ICON_COMPONENT[iconKey ?? ''] ?? Star;
  return <Icon className={className} />;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function buildClientQrUrl(cardId: string): string {
  return `https://ailink.com.co/card/${cardId}`;
}

function formatMemberId(cardId?: string): string {
  if (!cardId || cardId === 'PREVIEW') return '0000 0000';
  const clean = cardId.replace(/-/g, '');
  const last8 = clean.slice(-8).toUpperCase();
  return last8.slice(0, 4) + ' ' + last8.slice(4);
}

function stampGridCols(total: number): string {
  if (total <= 5) {
    if (total <= 1) return 'grid-cols-1';
    if (total === 2) return 'grid-cols-2';
    if (total === 3) return 'grid-cols-3';
    if (total === 4) return 'grid-cols-4';
    return 'grid-cols-5';
  }
  return 'grid-cols-10';
}

function catLabel(category: string | null | undefined): string {
  if (!category) return '';
  return CATEGORY_LABEL_ES[category] ?? category;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface LoyaltyCardProps {
  businessName: string;
  totalStamps: number;
  currentStamps: number;
  rewardDescription: string;
  colorHex: string;
  isCompact?: boolean;
  cardId?: string;
  branding?: BusinessBranding;
  stampIcon?: string | null;
  cardTitle?: string | null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LoyaltyCard({
  businessName,
  totalStamps,
  currentStamps,
  rewardDescription,
  colorHex,
  isCompact = false,
  cardId,
  branding,
  stampIcon,
  cardTitle,
}: LoyaltyCardProps) {
  const progress   = Math.min((currentStamps / totalStamps) * 100, 100);
  const isComplete = currentStamps >= totalStamps;
  const flippable  = !!cardId;
  const isAccum    = branding?.programType === 'accumulative';
  const unitLabel  = isAccum
    ? (currentStamps === 1 ? 'punto' : 'puntos')
    : (currentStamps === 1 ? 'sello' : 'sellos');

  const iconKey   = stampIcon ?? CATEGORY_ICON_KEY[branding?.category ?? ''] ?? 'Star';
  const largeCols = totalStamps > 5;

  const [flipped, setFlipped] = useState(false);

  const cardStyle = {
    background: `linear-gradient(135deg, ${colorHex}ee, ${colorHex}99)`,
  };

  // ── Compact variant ─────────────────────────────────────────────────────────
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
            <div className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold">¡Completa!</div>
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
          <p className="text-sm font-medium">{currentStamps} / {totalStamps} {unitLabel}</p>
        </div>
      </div>
    );
  }

  // ── Stamp grid ───────────────────────────────────────────────────────────────
  const StampGrid = (
    <div className={`grid ${stampGridCols(totalStamps)} ${largeCols ? 'gap-1' : 'gap-2'}`}>
      {Array.from({ length: totalStamps }).map((_, i) => (
        <div key={i} className="aspect-square flex items-center justify-center">
          {i < currentStamps ? (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.04, type: 'spring' }}
            >
              <StampIcon iconKey={iconKey} className={largeCols ? 'w-4 h-4' : 'w-5 h-5'} />
            </motion.div>
          ) : (
            <div className={`rounded-full bg-white/25 border border-white/20 ${largeCols ? 'w-2 h-2' : 'w-3 h-3'}`} />
          )}
        </div>
      ))}
    </div>
  );

  // ── Logo widget (reusable) ───────────────────────────────────────────────────
  const LogoWidget = (
    <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/30 shrink-0 shadow-md">
      {branding?.logoUrl ? (
        <img src={branding.logoUrl} alt={businessName} className="w-full h-full object-cover bg-white/20" />
      ) : (
        <div className="w-full h-full bg-white/20 flex items-center justify-center">
          <Building2 className="w-4 h-4" />
        </div>
      )}
    </div>
  );

  // ── FRONT face ───────────────────────────────────────────────────────────────
  const Front = (
    <div
      className="card-shine-trigger absolute inset-0 rounded-3xl shadow-xl text-white overflow-hidden flex flex-col"
      style={{ ...cardStyle, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
    >
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-14 -mt-14 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mb-10 pointer-events-none" />
      <div className="card-shine" aria-hidden="true" />

      {/* Logo — absolute top-left */}
      <div className="absolute top-3 left-3 z-20 w-11 h-11 rounded-xl overflow-hidden border-2 border-white/40 shadow-lg">
        {branding?.logoUrl ? (
          <img src={branding.logoUrl} alt={businessName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-white/20 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Flip — absolute top-right */}
      {flippable && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setFlipped(true); }}
            aria-label="Girar tarjeta"
            className="absolute top-3 right-3 z-20 bg-white/20 hover:bg-white/35 backdrop-blur-sm p-1.5 rounded-full transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {/* Card tag badge — below flip button */}
          <div className="absolute top-10 right-2 z-20">
            <span className="bg-white/20 backdrop-blur-sm text-white text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-white/30 leading-none">
              {branding?.cardTag || 'Loyalty'}
            </span>
          </div>
        </>
      )}

      {/* ── Top text: name + cardTitle + reward ── */}
      <div className="relative z-10 pl-16 pr-10 pt-4">
        <div className="flex items-center gap-1">
          <h3 className="font-bold text-lg leading-tight truncate">{businessName}</h3>
          <BadgeCheck className="w-3.5 h-3.5 shrink-0 text-yellow-300 opacity-90" />
        </div>
        <p className="text-[11px] font-semibold opacity-85 mt-0.5 truncate">
          {cardTitle || 'Tarjeta de fidelidad'}
        </p>
        <p className="text-[10px] opacity-60 mt-0.5 line-clamp-1">{rewardDescription}</p>
      </div>

      {/* ── Middle: stamps / accumulative ── */}
      <div className="relative z-10 flex-1 flex items-center px-4">
        {isAccum ? (
          <div className="text-center w-full">
            <motion.p
              key={currentStamps}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 18 }}
              className="text-4xl font-extrabold tracking-tight"
            >
              {currentStamps}
              <span className="text-xl opacity-70"> / {totalStamps}</span>
            </motion.p>
            <p className="text-xs opacity-80 uppercase tracking-widest mt-0.5">{unitLabel}</p>
          </div>
        ) : (
          StampGrid
        )}
      </div>

      {/* ── Bottom: progress + info | QR ── */}
      <div className="relative z-10 flex items-end gap-2 px-4 pb-4">
        <div className="flex-1 space-y-1 min-w-0">
          <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-white rounded-full"
            />
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="font-medium">{currentStamps} de {totalStamps} {unitLabel}</span>
            {isComplete && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold animate-pulse text-[10px]">
                ¡Premio listo!
              </span>
            )}
          </div>
          {/* Website / address on front */}
          {(branding?.website || branding?.address) && (
            <div className="flex gap-2.5 text-[9px] opacity-65 leading-none pt-0.5">
              {branding.website && (
                <div className="flex items-center gap-0.5 min-w-0">
                  <Globe className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate max-w-[90px]">
                    {branding.website.replace(/^https?:\/\//, '')}
                  </span>
                </div>
              )}
              {branding.address && (
                <div className="flex items-center gap-0.5 min-w-0">
                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate max-w-[90px]">{branding.address}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* QR bottom-right */}
        {cardId && cardId !== 'PREVIEW' && (
          <div className="bg-white rounded-xl p-1.5 shadow-md shrink-0">
            <QRCodeSVG
              value={buildClientQrUrl(cardId)}
              size={48}
              level="L"
              fgColor="#000000"
              bgColor="#ffffff"
              includeMargin={false}
            />
          </div>
        )}
        {cardId === 'PREVIEW' && (
          <div className="bg-white/20 rounded-xl p-1.5 shrink-0 border border-white/30">
            <div className="w-[48px] h-[48px] flex items-center justify-center opacity-55">
              <span className="text-[8px] font-bold text-center leading-tight">QR</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── BACK face — credit-card style ────────────────────────────────────────────
  const defaultTerms = 'Al usar esta tarjeta aceptas los términos y condiciones del programa. Sin valor en efectivo. No acumulable con otras promociones. El negocio se reserva el derecho de modificar las condiciones.';

  const Back = (
    <div
      className="card-shine-trigger absolute inset-0 rounded-3xl shadow-xl text-white overflow-hidden flex flex-col"
      style={{
        ...cardStyle,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
      }}
    >
      <div className="card-shine" aria-hidden="true" />

      {/* Magnetic stripe */}
      <div className="h-9 bg-black/70 w-full shrink-0" />

      {/* Flip-back button — mismo nivel que el flip del frente */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
        aria-label="Volver al frente"
        className="absolute top-3 right-3 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-1.5 rounded-full transition-colors"
      >
        <RefreshCw className="w-3 h-3" />
      </button>

      {/* Content — 3-column: contacts | NFC + member | Google Review */}
      <div className="flex-1 flex items-stretch px-3 pt-2 pb-1 gap-1 min-h-0">

        {/* LEFT — info de contacto */}
        <div className="flex-1 flex flex-col justify-center gap-[5px] text-[8px] opacity-75 min-w-0">
          {branding?.email && (
            <div className="flex items-center gap-[3px]">
              <Mail className="w-[9px] h-[9px] shrink-0" />
              <span className="truncate">{branding.email}</span>
            </div>
          )}
          {branding?.address && (
            <div className="flex items-center gap-[3px]">
              <MapPin className="w-[9px] h-[9px] shrink-0" />
              <span className="truncate">{branding.address}</span>
            </div>
          )}
          {branding?.website && (
            <div className="flex items-center gap-[3px]">
              <Globe className="w-[9px] h-[9px] shrink-0" />
              <span className="truncate">{branding.website.replace(/^https?:\/\//, '')}</span>
            </div>
          )}
          {branding?.instagram && (
            <div className="flex items-center gap-[3px]">
              <Instagram className="w-[9px] h-[9px] shrink-0" />
              <span className="truncate">{branding.instagram.startsWith('@') ? branding.instagram : `@${branding.instagram}`}</span>
            </div>
          )}
          {branding?.facebook && (
            <div className="flex items-center gap-[3px]">
              <Facebook className="w-[9px] h-[9px] shrink-0" />
              <span className="truncate">{branding.facebook.startsWith('@') ? branding.facebook : `@${branding.facebook}`}</span>
            </div>
          )}
        </div>

        {/* Thin divider */}
        <div className="w-px bg-white/15 self-stretch my-2 shrink-0" />

        {/* CENTER — NFC + member number */}
        <div className="flex flex-col items-center justify-center shrink-0 w-[108px] gap-1">
          {/* NFC con anillos */}
          <div className="relative flex items-center justify-center w-14 h-14">
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute inset-[6px] rounded-full border border-white/15" />
            <div className="relative z-10 bg-white/15 rounded-full p-2 border border-white/30">
              <Nfc className="w-6 h-6 opacity-90" />
            </div>
          </div>
          <span className="text-[7px] opacity-50 uppercase tracking-[0.2em] font-bold leading-none">NFC</span>
          {/* Member number — below NFC */}
          <div className="text-center mt-0.5">
            <p className="text-[6.5px] uppercase tracking-[0.18em] opacity-45 font-bold leading-none">N° MIEMBRO</p>
            <p className="text-[10px] font-mono font-bold tracking-[0.12em] opacity-80 mt-0.5 leading-none">
              •••• {formatMemberId(cardId)}
            </p>
          </div>
        </div>

        {/* Thin divider */}
        <div className="w-px bg-white/15 self-stretch my-2 shrink-0" />

        {/* RIGHT — Google Review */}
        <div className="flex-1 flex flex-col items-center justify-center gap-1">
          <div className="flex gap-0.5">
            {[0,1,2,3,4].map(i => (
              <Star key={i} className="w-2 h-2 text-yellow-300" style={{ fill: 'currentColor' }} />
            ))}
          </div>
          <p className="text-[8px] font-black tracking-wide opacity-90 leading-none">Google</p>
          <p className="text-[6.5px] uppercase tracking-wider opacity-55 leading-none">Reseña</p>
          <p className="text-[6.5px] uppercase tracking-wider opacity-55 leading-none">tu visita</p>
        </div>
      </div>

      {/* Terms footer */}
      <div className="px-4 py-2 border-t border-white/20 shrink-0">
        <p className="text-[8px] opacity-50 leading-relaxed line-clamp-2">
          {branding?.termsOfService || defaultTerms}
        </p>
      </div>
    </div>
  );

  // ── Non-flip (no cardId) ─────────────────────────────────────────────────────
  if (!flippable) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="card-shine-trigger rounded-3xl shadow-xl text-white relative overflow-hidden w-full max-w-[340px] mx-auto flex flex-col"
        style={{ ...cardStyle, aspectRatio: '1.58 / 1' }}
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-14 -mt-14 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mb-10 pointer-events-none" />
        <div className="card-shine" aria-hidden="true" />

        {/* Logo — absolute top-left */}
        <div className="absolute top-3 left-3 z-20 w-11 h-11 rounded-xl overflow-hidden border-2 border-white/40 shadow-lg">
          {branding?.logoUrl ? (
            <img src={branding.logoUrl} alt={businessName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-white/20 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Card tag badge — top-right (non-flippable) */}
        <div className="absolute top-3 right-3 z-20">
          <span className="bg-white/20 backdrop-blur-sm text-white text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-white/30 leading-none">
            {branding?.cardTag || 'Loyalty'}
          </span>
        </div>

        {/* Top text */}
        <div className="relative z-10 pl-16 pr-4 pt-4">
          <div className="flex items-center gap-1">
            <h3 className="font-bold text-lg leading-tight truncate">{businessName}</h3>
            <BadgeCheck className="w-3.5 h-3.5 shrink-0 text-yellow-300 opacity-90" />
          </div>
          <p className="text-[11px] font-semibold opacity-85 mt-0.5 truncate">
            {cardTitle || 'Tarjeta de fidelidad'}
          </p>
          <p className="text-[10px] opacity-60 mt-0.5 line-clamp-1">{rewardDescription}</p>
        </div>

        {/* Middle */}
        <div className="relative z-10 flex-1 flex items-center px-4">
          {StampGrid}
        </div>

        {/* Bottom */}
        <div className="relative z-10 px-4 pb-4">
          <div className="h-1.5 bg-white/30 rounded-full overflow-hidden mb-1.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-white rounded-full"
            />
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="font-medium">{currentStamps} de {totalStamps} {unitLabel}</span>
            {isComplete && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold animate-pulse text-[10px]">
                ¡Premio listo!
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Flip mode ────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative max-w-[340px] mx-auto w-full cursor-pointer"
      style={{ perspective: '1200px', aspectRatio: '1.58 / 1' }}
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
        className="relative w-full h-full"
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
