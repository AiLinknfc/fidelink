import type { CardModelProps } from './types';
import { hexToRgba } from './colorUtils';

export default function PremiumGiftCard(props: CardModelProps) {
  const c = props.colorHex || '#caa14b';
  return (
    <div className="w-full cursor-pointer select-none">
      <div
        className="w-full relative rounded-[16px] overflow-hidden flex flex-col justify-between p-[24px_28px]"
        style={{
          aspectRatio: '380 / 230',
          background: `
            repeating-linear-gradient(125deg, ${hexToRgba(c, 0.04)} 0px, ${hexToRgba(c, 0.04)} 1px, transparent 1px, transparent 5px),
            linear-gradient(150deg, #181818 0%, #050505 55%, #000 100%)
          `,
          boxShadow: '0 28px 55px -14px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }}
      >
        {/* Gold frame */}
        <div
          className="absolute inset-[8px] rounded-[11px] pointer-events-none"
          style={{
            border: '1.4px solid',
            borderImage: `linear-gradient(135deg, #fff6d8, ${c} 30%, ${hexToRgba(c, 0.4)} 55%, #e9c878 80%, #fff6d8) 1`,
          }}
        />

        {/* Sheen */}
        <div
          className="absolute top-0 pointer-events-none"
          style={{
            left: '-160%', width: '55%', height: '100%',
            background: `linear-gradient(100deg, transparent 25%, rgba(255,245,210,0) 40%, ${hexToRgba(c, 0.4)} 50%, rgba(255,245,210,0) 60%, transparent 75%)`,
            transform: 'skewX(-20deg)',
            animation: 'giftSheen 5.5s ease-in-out infinite',
            mixBlendMode: 'screen',
          }}
        />
        <style>{`@keyframes giftSheen{0%{left:-160%}45%{left:160%}100%{left:160%}}`}</style>

        {/* Top row: stars + diamond + stars */}
        <div className="relative z-[2] flex items-start justify-between">
          <Stars color={c} />
          <svg width={26} height={26} viewBox="0 0 48 48" fill="none">
            <defs>
              <linearGradient id="gift-dia" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stopColor="#fff8e0" />
                <stop offset="45%" stopColor={c} />
                <stop offset="100%" stopColor={hexToRgba(c, 0.6)} />
              </linearGradient>
            </defs>
            <polygon points="24,4 36,18 24,44 12,18" fill="url(#gift-dia)" stroke="#fff6d8" strokeWidth="0.6" />
            <polygon points="12,18 36,18 24,4" fill="#fff8e0" opacity="0.5" />
          </svg>
          <Stars color={c} />
        </div>

        {/* Center */}
        <div className="relative z-[2] text-center">
          <div style={{
            fontFamily: '"Cinzel", serif', fontWeight: 900, fontSize: '2.5rem', letterSpacing: '0.15em',
            background: `linear-gradient(180deg, #fff8e0 0%, ${c} 38%, ${hexToRgba(c, 0.4)} 58%, #f3da9d 75%, ${c} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.6))',
          }}>
            {props.cardTitle || 'VIP'}
          </div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: c, marginTop: 2 }}>
            {props.rewardDescription || 'Exclusive Access'}
          </div>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '0.85rem', color: '#a8a195', marginTop: 6, letterSpacing: '0.02em' }}>
            {props.businessName || 'Experience'} · {props.category || 'Premium'}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-[2] flex items-center justify-between">
          <span style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.62rem', letterSpacing: '0.08em', color: '#7a756a' }}>
            {props.businessName || 'EVENT'} · HOY
          </span>
          <span style={{ fontFamily: '"Cinzel", serif', fontWeight: 700, fontSize: '0.95rem', color: c, letterSpacing: '0.08em' }}>
            {props.category || 'LOCATION'}
          </span>
        </div>
      </div>
    </div>
  );
}

function Stars({ color }: { color: string }) {
  const star = (i: number) => (
    <svg key={i} width={9} height={9} viewBox="0 0 10 10">
      <polygon points="5,0 6.5,3.5 10,4 6.8,6.2 7.5,10 5,7.7 2.5,10 3.2,6.2 0,4 3.5,3.5" fill={color} />
    </svg>
  );
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[0, 1, 2].map(star)}
    </div>
  );
}
