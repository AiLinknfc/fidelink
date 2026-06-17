import React, { useState, type MouseEvent, type ReactNode } from 'react';
import type { CardModelProps } from './types';
import { adjustColor, hexToRgba, hexToRadialOverlay } from './colorUtils';

type CreditVariant = 'cashback' | 'benefits' | 'rewards' | 'access' | 'premium';

const VARIANT_MAP: Record<string, CreditVariant> = {
  CreditCashback: 'cashback',
  CreditBenefits: 'benefits',
  CreditRewards: 'rewards',
  CreditAccess: 'access',
  CreditPremium: 'premium',
};

function CardLabel({ label, tier }: { label: string; tier: string }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.18em', opacity: 0.92 }}>{label}</span>
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.22em',
        padding: '5px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.3)',
        background: 'rgba(255,255,255,0.08)',
      }}>{tier}</span>
    </div>
  );
}

function Chip({ color }: { color: string }) {
  return (
    <svg width={50} height={38} viewBox="0 0 50 38" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))' }}>
      <defs>
        <linearGradient id={`chip-g-${color}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset=".45" stopColor="#e9c45a" />
          <stop offset=".7" stopColor="#a87617" />
          <stop offset="1" stopColor="#ffe79a" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="48" height="36" rx="6" fill={color} />
      <g stroke="rgba(0,0,0,0.38)" strokeWidth="1.4" fill="none">
        <line x1="17" y1="1" x2="17" y2="14" /><line x1="33" y1="1" x2="33" y2="14" />
        <line x1="17" y1="24" x2="17" y2="37" /><line x1="33" y1="24" x2="33" y2="37" />
        <rect x="13" y="13" width="24" height="12" rx="3" />
        <line x1="1" y1="19" x2="13" y2="19" /><line x1="37" y1="19" x2="49" y2="19" />
      </g>
      <rect x="1" y="1" width="48" height="36" rx="6" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
    </svg>
  );
}

function NfcIcon({ color }: { color: string }) {
  return (
    <svg width={24} height={30} viewBox="0 0 24 30">
      <g fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round">
        <path d="M5 8 C9 12 9 18 5 22" />
        <path d="M10 5 C16 11 16 19 10 25" />
        <path d="M15 2 C23 10 23 20 15 28" />
      </g>
    </svg>
  );
}

function MastercardLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <i style={{
        width: 26, height: 26, borderRadius: '50%', display: 'block',
        background: 'radial-gradient(circle at 35% 30%, #ff7a59, #eb001b)',
      }} />
      <i style={{
        width: 26, height: 26, borderRadius: '50%', display: 'block',
        marginLeft: -12,
        background: 'radial-gradient(circle at 35% 30%, #ffd24d, #f79e1b)',
        mixBlendMode: 'screen',
      }} />
    </div>
  );
}

function VisaLogo() {
  return (
    <span style={{
      fontStyle: 'italic', fontWeight: 900, fontSize: 24, letterSpacing: -0.5,
      background: 'linear-gradient(180deg,#fff,#cdd2e6)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      textShadow: '0 1px 2px rgba(0,0,0,0.25)',
    }}>VISA</span>
  );
}

function buildDynamicBg(base: string, colorHex: string): string {
  const c1 = colorHex;
  const c2 = adjustColor(c1, -40);
  const c3 = adjustColor(c1, -70);
  const overlay = hexToRadialOverlay(c1);
  return `
    radial-gradient(120% 90% at 82% -10%, ${hexToRgba(c1, 0.22)}, transparent 42%),
    repeating-linear-gradient(58deg, ${hexToRgba(c1, 0.04)} 0 2px, transparent 2px 9px),
    linear-gradient(140deg, ${c1} 0%, ${c2} 45%, ${c3} 100%)
  `;
}

interface ThemeConfig {
  stripe?: (colorHex: string, secondaryHex: string) => ReactNode;
  decorator?: (colorHex: string, secondaryHex: string) => ReactNode;
  chipColor: string;
  nfcColor: string;
  bg: (colorHex: string) => string;
  rightElement: (colorHex: string, secondaryHex: string) => ReactNode;
  networkLogo: ReactNode;
}

function goldTextStyle(secondaryHex: string): React.CSSProperties {
  return {
    background: `linear-gradient(135deg,${adjustColor(secondaryHex, 60)},${secondaryHex} 38%,${adjustColor(secondaryHex, -50)} 65%,${adjustColor(secondaryHex, 40)})`,
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    fontWeight: 800,
  };
}

function buildStripeGradient(secondaryHex: string): string {
  return `linear-gradient(90deg, transparent, ${adjustColor(secondaryHex, 50)}, ${secondaryHex}, ${adjustColor(secondaryHex, -40)}, ${adjustColor(secondaryHex, 30)}, transparent)`;
}

function buildEdgeColor(secondaryHex: string): string {
  return hexToRgba(secondaryHex, 0.45);
}

const THEMES: Record<CreditVariant, ThemeConfig> = {
  cashback: {
    bg: (colorHex: string) => buildDynamicBg('cashback', colorHex),
    stripe: (_c: string, s: string) => (
      <div style={{
        position: 'absolute', zIndex: 5, right: -40, top: 38, width: 240, height: 46,
        transform: 'rotate(-12deg)',
        background: buildStripeGradient(s),
        opacity: 0.85, boxShadow: '0 6px 14px rgba(0,0,0,0.35)',
      }} />
    ),
    chipColor: 'url(#chip-g-cashback)',
    nfcColor: '#fff',
    rightElement: (_c: string, s: string) => (
      <span style={{
        fontSize: 46, fontWeight: 900, letterSpacing: -2, lineHeight: 1, ...goldTextStyle(s),
      }}>$$$</span>
    ),
    networkLogo: <MastercardLogo />,
  },
  benefits: {
    bg: (colorHex: string) => {
      const c1 = colorHex;
      const c2 = adjustColor(c1, -40);
      const c3 = adjustColor(c1, -70);
      return `
        radial-gradient(120% 100% at 15% -10%, ${hexToRgba(c1, 0.28)}, transparent 45%),
        linear-gradient(135deg, ${c1} 0%, ${c2} 48%, ${c3} 100%)
      `;
    },
    decorator: (_c: string, s: string) => (
      <>
        <div style={{ position: 'absolute', zIndex: 5, inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: 0, left: '64%', width: 30, height: '100%', background: `linear-gradient(90deg, transparent, ${hexToRgba(s, 0.28)}, transparent)` }} />
          <div style={{ position: 'absolute', left: 0, top: '30%', width: '100%', height: 30, background: `linear-gradient(180deg, transparent, ${hexToRgba(s, 0.22)}, transparent)` }} />
        </div>
        <span style={{
          position: 'absolute', zIndex: 6, left: '64%', top: '30%',
          transform: 'translate(-30%,-25%)', fontSize: 30,
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
        }}>🎀</span>
      </>
    ),
    chipColor: '#f2e2c0',
    nfcColor: '#fff',
    rightElement: () => <span style={{ fontSize: 34, fontWeight: 900, letterSpacing: -1 }}>🎁</span>,
    networkLogo: <VisaLogo />,
  },
  rewards: {
    bg: (colorHex: string) => {
      const c1 = colorHex;
      const c2 = adjustColor(c1, -30);
      const c3 = adjustColor(c1, -55);
      return `
        radial-gradient(120% 100% at 80% 0%, ${hexToRgba(c1, 0.22)}, transparent 45%),
        linear-gradient(135deg, ${c1} 0%, ${c2} 45%, ${c3} 100%)
      `;
    },
    decorator: () => (
      <div style={{
        position: 'absolute', inset: 0, zIndex: 4, mixBlendMode: 'color-dodge', opacity: 0.35, pointerEvents: 'none',
        background: 'conic-gradient(from 200deg at 30% 20%, #ff5ad9, #5a8bff, #5affd0, #ffd75a, #ff5ad9)',
      }} />
    ),
    chipColor: '#cfd6ee',
    nfcColor: '#fff',
    rightElement: (_c: string, s: string) => (
      <span style={{
        fontSize: 30, fontWeight: 900, letterSpacing: -1, ...goldTextStyle(s),
      }}>48.250 pts</span>
    ),
    networkLogo: <MastercardLogo />,
  },
  access: {
    bg: (colorHex: string) => {
      const c1 = colorHex;
      const c2 = adjustColor(c1, -25);
      const c3 = adjustColor(c1, -50);
      return `
        radial-gradient(120% 100% at 20% -10%, ${hexToRgba(c1, 0.16)}, transparent 45%),
        linear-gradient(150deg, ${c1} 0%, ${c2} 45%, ${c3} 100%)
      `;
    },
    decorator: () => (
      <>
        <div style={{ position: 'absolute', zIndex: 5, left: '30%', top: 0, bottom: 0, borderLeft: '2px dashed rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', zIndex: 7, width: 22, height: 22, borderRadius: '50%', background: '#0a0b10', left: '30%', transform: 'translateX(-50%)', top: -11, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)' }} />
        <div style={{ position: 'absolute', zIndex: 7, width: 22, height: 22, borderRadius: '50%', background: '#0a0b10', left: '30%', transform: 'translateX(-50%)', bottom: -11, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)' }} />
      </>
    ),
    chipColor: '#cfd6ee',
    nfcColor: '#fff',
    rightElement: () => <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: 1 }}>🎫</span>,
    networkLogo: <VisaLogo />,
  },
  premium: {
    bg: (colorHex: string) => {
      const c1 = adjustColor(colorHex, 20);
      const c2 = adjustColor(colorHex, -15);
      const c3 = adjustColor(colorHex, -35);
      return `
        linear-gradient(135deg, rgba(255,255,255,0.07), transparent 38%),
        repeating-linear-gradient(108deg, ${hexToRgba(c1, 0.1)} 0 1px, transparent 1px 3px),
        repeating-linear-gradient(72deg, ${hexToRgba(c1, 0.08)} 0 1px, transparent 1px 4px),
        linear-gradient(160deg, ${c1} 0%, ${c2} 52%, ${c3} 100%)
      `;
    },
    decorator: (_c: string, s: string) => (
      <div style={{
        position: 'absolute', inset: 6, zIndex: 5, border: `1px solid ${buildEdgeColor(s)}`,
        borderRadius: 14, pointerEvents: 'none',
      }} />
    ),
    chipColor: 'url(#chip-g-premium)',
    nfcColor: '#e8d9a8',
    rightElement: (_c: string, s: string) => (
      <span style={{
        fontSize: 26, fontWeight: 900, letterSpacing: 3, ...goldTextStyle(s),
      }}>VIP</span>
    ),
    networkLogo: <MastercardLogo />,
  },
};

export default function CreditStyleCard(props: CardModelProps) {
  const variant = VARIANT_MAP[props.cardTag] || 'cashback';
  const theme = THEMES[variant];
  const colorHex = props.colorHex || '#3525cd';
  const secondaryHex = props.secondaryColorHex || '#ffd700';
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [shine, setShine] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setShine({ x: px * 100, y: py * 100 });
    const rx = (0.5 - py) * 14;
    const ry = (px - 0.5) * 16;
    setRotate({ x: rx, y: ry });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  const stars = variant === 'rewards' ? (
    <div style={{
      position: 'absolute', zIndex: 5, right: 18, top: 60, fontSize: 18, letterSpacing: 3,
      color: secondaryHex, textShadow: `0 0 10px ${hexToRgba(secondaryHex, 0.6)}`,
    }}>★ ★ ★ ★ ☆</div>
  ) : null;

  const barcode = variant === 'access' ? (
    <div style={{
      height: 34, width: 130,
      background: 'repeating-linear-gradient(90deg, #fff 0 2px, transparent 2px 3px, #fff 3px 4px, transparent 4px 7px)',
      borderRadius: 3, opacity: 0.9,
    }} />
  ) : null;

  return (
    <div
      className="w-full cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="w-full rounded-[20px] relative overflow-hidden aspect-[1.586/1] flex flex-col justify-between p-[22px_24px]"
        style={{
          background: theme.bg(colorHex),
          transform: `perspective(1400px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: 'preserve-3d',
          transition: isHovered ? 'transform 0.05s linear' : 'transform 0.6s cubic-bezier(0.2,0.8,0.3,1)',
          boxShadow: variant === 'premium'
            ? '0 2px 3px rgba(0,0,0,0.5), 0 34px 50px -14px rgba(0,0,0,0.8), 0 64px 90px -30px rgba(0,0,0,0.75), inset 0 1px 1px rgba(255,255,255,0.18), inset 0 -2px 5px rgba(0,0,0,0.6)'
            : '0 1px 2px rgba(0,0,0,0.4), 0 26px 40px -14px rgba(0,0,0,0.65), 0 50px 70px -30px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.22), inset 0 -2px 4px rgba(0,0,0,0.35)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-[6]"
          style={{
            background: `radial-gradient(180px 180px at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.42), rgba(255,255,255,0.06) 45%, transparent 70%)`,
            mixBlendMode: 'screen',
            opacity: isHovered ? 1 : 0,
          }}
        />
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-[4]" style={{
          mixBlendMode: 'overlay',
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
        }} />
        <div className="absolute inset-0 z-[3]" />
        {theme.stripe?.(colorHex, secondaryHex)}
        {theme.decorator?.(colorHex, secondaryHex)}
        {stars}

        <div className="relative z-[7] flex flex-col justify-between h-full" style={{ transform: 'translateZ(10px)' }}>
          <CardLabel label={props.cardTitle || 'TARJETA'} tier={props.rewardDescription} />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Chip color={theme.chipColor} />
              <NfcIcon color={theme.nfcColor} />
              <div style={{ marginLeft: 'auto' }}>{theme.rightElement(colorHex, secondaryHex)}</div>
            </div>
            <div style={{
              fontFamily: '"Courier New", monospace', fontSize: 20, letterSpacing: 2.5, fontWeight: 700,
              marginTop: 2, color: '#f3f3f6',
              textShadow: '0 1px 0 rgba(255,255,255,0.55), 0 2px 2px rgba(0,0,0,0.5), 0 -1px 1px rgba(0,0,0,0.35)',
            }}>
              {variant === 'premium'
                ? '3782  001932  55104'
                : '••••  ••••  ••••  ••••'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 9, letterSpacing: '0.16em', opacity: 0.7, display: 'block', marginBottom: 3, fontWeight: 600, color: variant === 'premium' ? '#b8a96e' : undefined }}>
                {variant === 'premium' ? 'EXPERIENCIAS · COMUNIDAD' : variant === 'cashback' ? 'TITULAR' : variant === 'benefits' ? 'GIFT CARD INCLUIDA' : variant === 'rewards' ? 'NIVEL · RECOMPENSAS' : 'TICKETS · ENTRADAS'}
              </span>
              <span style={{
                fontSize: 12, letterSpacing: '0.14em', fontWeight: 600, textTransform: 'uppercase',
                color: variant === 'premium' ? '#e8d9a8' : '#f3f3f6',
                textShadow: variant === 'premium' ? undefined : '0 1px 0 rgba(255,255,255,0.55), 0 2px 2px rgba(0,0,0,0.5), 0 -1px 1px rgba(0,0,0,0.35)',
              }}>
                {props.businessName || 'TU NEGOCIO'}
              </span>
              {barcode}
            </div>
            {theme.networkLogo}
          </div>
        </div>
      </div>
    </div>
  );
}
