import type { CardModelProps } from './types';
import { adjustColor, hexToRgba } from './colorUtils';

export default function EventBadgeCard(props: CardModelProps) {
  const c = props.colorHex || '#0b2545';
  const s = props.secondaryColorHex || '#f3da9d';
  const c2 = adjustColor(c, 20);
  const c3 = adjustColor(c, -10);

  return (
    <div className="w-full cursor-pointer select-none flex flex-col items-center">
      {/* Clip */}
      <div
        className="relative z-[2] rounded-[6px_6px_3px_3px]"
        style={{
          width: 64, height: 26,
          background: 'linear-gradient(180deg, #d8d8d8, #9a9a9a 45%, #c4c4c4 55%, #7a7a7a)',
          boxShadow: '0 3px 6px rgba(0,0,0,0.4)',
        }}
      >
        <div
          className="absolute rounded-[3px]"
          style={{
            top: 6, left: '50%', transform: 'translateX(-50%)',
            width: 34, height: 6,
            background: 'linear-gradient(180deg, #4a4a4a, #222)',
          }}
        />
      </div>
      <div
        className="z-[3] rounded-full"
        style={{
          width: 10, height: 10,
          background: '#0a0a0d',
          marginTop: -7,
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)',
        }}
      />

      {/* Card body */}
      <div
        className="w-full relative rounded-[14px] flex flex-col overflow-hidden"
        style={{
          maxWidth: 300,
          aspectRatio: '300 / 420',
          background: 'linear-gradient(160deg, #ffffff 0%, #f4f2ec 100%)',
          boxShadow: '0 25px 50px -14px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.8) inset',
          marginTop: -3,
        }}
      >
        {/* Top colored section — driven by colorHex */}
        <div
          className="relative text-center overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${c} 0%, ${c2} 60%, ${c3} 100%)`,
            padding: '22px 20px 26px',
          }}
        >
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{ height: 3, background: `linear-gradient(90deg, ${c}, ${s}, ${c})` }}
          />
          <div style={{ fontFamily: '"Cinzel", serif', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.1em', color: '#fff', textTransform: 'uppercase' }}>
            {props.cardTitle || 'Summit Visionarios'}
          </div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.58rem', letterSpacing: '0.25em', color: s, marginTop: 4, textTransform: 'uppercase' }}>
            {props.businessName || 'Conferencia Anual'}
          </div>
        </div>

        {/* Photo circle */}
        <div
          className="relative z-[4] mx-auto rounded-full"
          style={{
            width: 108, height: 108,
            marginTop: -46,
            background: 'linear-gradient(135deg, #fff, #e8e4d8)',
            padding: 4,
            boxShadow: '0 8px 20px -6px rgba(0,0,0,0.4)',
          }}
        >
          <div
            className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
            style={{ background: 'linear-gradient(150deg, #c9c2ae, #9c9482)' }}
          >
            <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="#6e6856" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
            </svg>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col items-center text-center px-6">
          <div style={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, fontSize: '1.3rem', color: '#181818', marginTop: 8 }}>
            {props.businessName || 'Daniela Ortiz'}
          </div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: c, marginTop: 3, fontWeight: 500 }}>
            {props.cardTitle || 'Ponente Principal'}
          </div>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '0.85rem', color: '#8a8478', marginTop: 2 }}>
            {props.category || 'Estudio Lumen & Co.'}
          </div>

          {/* Tier badge */}
          <div
            className="mt-4 px-[22px] py-[6px] rounded-full"
            style={{
              background: `linear-gradient(135deg, ${c}, ${s} 45%, ${hexToRgba(c, 0.6)})`,
              fontFamily: '"Cinzel", serif', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em',
              color: '#fff',
              boxShadow: `0 4px 10px -2px ${hexToRgba(c, 0.5)}`,
            }}
          >
            {props.rewardDescription || 'ACCESO TOTAL'}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex flex-col items-center gap-[8px] p-[16px_24px_20px]">
          <div
            className="border-[6px] border-white"
            style={{
              width: 64, height: 64,
              background: 'conic-gradient(#1a1a18 90deg, transparent 90deg 180deg, #1a1a18 180deg 270deg, transparent 270deg)',
              backgroundSize: '8px 8px',
              boxShadow: '0 0 0 1px #e0ddd2',
            }}
          />
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.62rem', letterSpacing: '0.08em', color: '#8a8478' }}>
            ID-0042-SV25
          </div>
        </div>
      </div>
    </div>
  );
}
