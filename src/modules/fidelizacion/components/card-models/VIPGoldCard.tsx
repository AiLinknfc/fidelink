import type { CardModelProps } from './types';
import { hexToRgba } from './colorUtils';

export default function VIPGoldCard(props: CardModelProps) {
  const c = props.colorHex || '#caa14b';
  return (
    <div className="w-full cursor-pointer select-none mx-auto" style={{ maxWidth: 280 }}>
      <div
        className="w-full relative rounded-[18px] overflow-hidden"
        style={{
          aspectRatio: '280 / 430',
          background: `
            radial-gradient(circle at 50% 0%, ${hexToRgba(c, 0.06)}, transparent 55%),
            linear-gradient(160deg, #1c1c1c 0%, #0a0a0a 45%, #000000 100%)
          `,
          boxShadow: '0 30px 60px -15px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.8)',
          fontFamily: '"Cinzel", serif',
        }}
      >
        {/* Gold double frame — colorHex drives the frame */}
        <div
          className="absolute inset-[10px] rounded-[12px] pointer-events-none"
          style={{
            border: '2px solid',
            borderImage: `linear-gradient(135deg, #fff6d8, ${c} 25%, ${hexToRgba(c, 0.4)} 50%, #e8c772 75%, #fff6d8) 1`,
            zIndex: 5,
          }}
        >
          <div
            className="absolute inset-[6px] rounded-[8px] pointer-events-none"
            style={{ border: `1px solid ${hexToRgba(c, 0.55)}` }}
          />
        </div>

        {/* Corner ornaments */}
        {['tl', 'tr', 'bl', 'br'].map((pos) => (
          <div
            key={pos}
            className="absolute z-[6]"
            style={{
              width: 22, height: 22,
              ...(pos === 'tl' ? { top: 14, left: 14 } : {}),
              ...(pos === 'tr' ? { top: 14, right: 14, transform: 'scaleX(-1)' } : {}),
              ...(pos === 'bl' ? { bottom: 14, left: 14, transform: 'scaleY(-1)' } : {}),
              ...(pos === 'br' ? { bottom: 14, right: 14, transform: 'scale(-1,-1)' } : {}),
            }}
          >
            <svg viewBox="0 0 22 22" width={22} height={22} fill="none">
              <path d="M2 14V2H14" stroke={c} strokeWidth="1.4" />
              <path d="M2 8V2H8" stroke="#e9c878" strokeWidth="0.8" />
            </svg>
          </div>
        ))}

        {/* Sheen animation */}
        <div
          className="absolute top-0 pointer-events-none z-[7]"
          style={{
            left: '-150%', width: '60%', height: '100%',
            background: `linear-gradient(100deg, transparent 20%, rgba(255,235,180,0) 35%, ${hexToRgba(c, 0.35)} 48%, ${hexToRgba(c, 0.55)} 50%, ${hexToRgba(c, 0.35)} 52%, rgba(255,235,180,0) 65%, transparent 80%)`,
            transform: 'skewX(-18deg)',
            animation: 'vipSheen 4.5s ease-in-out infinite',
            mixBlendMode: 'screen',
          }}
        />
        <style>{`@keyframes vipSheen{0%{left:-150%}45%{left:160%}100%{left:160%}}`}</style>

        {/* Ribbon */}
        <div
          className="absolute z-[4]"
          style={{
            top: -2, left: '50%', transform: 'translateX(-50%)',
            width: 10, height: 30,
            background: `linear-gradient(180deg, ${c}, ${hexToRgba(c, 0.5)})`,
            borderRadius: 2,
          }}
        />

        {/* Hang ring */}
        <div className="absolute z-[8]" style={{ top: -26, left: '50%', transform: 'translateX(-50%)', width: 46, height: 46 }}>
          <svg viewBox="0 0 46 46" width={46} height={46} fill="none">
            <circle cx="23" cy="23" r="15" stroke={c} strokeWidth="2.5" />
            <circle cx="23" cy="23" r="15" fill="none" stroke="#fff6d8" strokeWidth="0.8" opacity="0.6" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-[3] h-full flex flex-col items-center text-center p-[54px_26px_30px]">
          {/* Diamond */}
          <svg width={46} height={46} className="mb-[18px]" viewBox="0 0 48 48" fill="none" style={{ filter: `drop-shadow(0 2px 6px ${hexToRgba(c, 0.5)})` }}>
            <defs>
              <linearGradient id="vip-dia" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stopColor="#fff8e0" />
                <stop offset="45%" stopColor={c} />
                <stop offset="100%" stopColor={hexToRgba(c, 0.6)} />
              </linearGradient>
            </defs>
            <polygon points="24,4 36,18 24,44 12,18" fill="url(#vip-dia)" stroke="#fff6d8" strokeWidth="0.6" />
            <polygon points="12,18 36,18 24,4" fill="#fff8e0" opacity="0.5" />
            <line x1="24" y1="4" x2="24" y2="44" stroke={hexToRgba(c, 0.6)} strokeWidth="0.5" opacity="0.6" />
            <line x1="12" y1="18" x2="36" y2="18" stroke={hexToRgba(c, 0.6)} strokeWidth="0.5" opacity="0.6" />
          </svg>

          <div style={{
            fontSize: '2.1rem', fontWeight: 900, letterSpacing: '0.12em',
            background: `linear-gradient(180deg, #fff8e0 0%, ${c} 38%, ${hexToRgba(c, 0.4)} 55%, #f3da9d 70%, ${c} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.6))',
          }}>
            {props.cardTitle || 'VIP'}
          </div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: c, marginTop: 6 }}>
            {props.businessName || 'Event Pass'}
          </div>

          <div style={{
            marginTop: 32, padding: '9px 30px', borderRadius: 100,
            border: `1.4px solid ${c}`,
            background: `linear-gradient(180deg, ${hexToRgba(c, 0.12)}, ${hexToRgba(c, 0.02)})`,
            fontFamily: '"Cinzel", serif', fontSize: '0.78rem', letterSpacing: '0.15em',
            color: c, fontWeight: 600,
          }}>
            {props.rewardDescription || 'ADMIT ONE'}
          </div>

          <div className="mt-auto w-full">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '26px 0 14px', color: c }}>
              <span style={{ height: 1, width: 34, background: `linear-gradient(90deg, transparent, ${c})` }} />
              <svg width={10} height={10} viewBox="0 0 10 10"><polygon points="5,0 10,5 5,10 0,5" fill={c} /></svg>
              <span style={{ height: 1, width: 34, background: `linear-gradient(90deg, ${c}, transparent)` }} />
            </div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#d8d4c8', fontWeight: 500 }}>
              {props.cardTitle || 'Event Name'}
            </div>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.68rem', color: '#8a8478', marginTop: 4, letterSpacing: '0.05em' }}>
              Hoy · {props.category || 'Location'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
