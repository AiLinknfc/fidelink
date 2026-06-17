import type { CardModelProps } from './types';
import { adjustColor, hexToRgba } from './colorUtils';

export default function StaffCard(props: CardModelProps) {
  const c = props.colorHex || '#14141c';
  const c2 = adjustColor(c, 10);
  const c3 = adjustColor(c, -20);

  return (
    <div className="w-full cursor-pointer select-none flex flex-col items-center">
      {/* Lanyard strap */}
      <div
        className="relative z-[1] rounded-[4px_4px_0_0]"
        style={{
          width: 36, height: 130,
          background: 'repeating-linear-gradient(90deg, #6e0f1f 0px, #6e0f1f 12px, #8a1428 12px, #8a1428 24px)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        }}
      >
        <div
          className="absolute whitespace-nowrap text-center"
          style={{
            top: 10, left: '50%', transform: 'translateX(-50%) rotate(90deg)',
            transformOrigin: 'center', width: 120,
            fontFamily: 'Oswald, sans-serif', fontSize: '0.5rem', letterSpacing: '0.15em',
            color: 'rgba(255,255,255,0.75)',
          }}
        >
          AI LINK · ACCESO TOTAL · AI LINK · ACCESO TOTAL
        </div>
      </div>
      {/* Clasp */}
      <div
        className="z-[2] rounded-[0_0_4px_4px]"
        style={{
          width: 30, height: 18, marginTop: -2,
          background: 'linear-gradient(180deg, #e6e6e6, #9a9a9a 50%, #cfcfcf 60%, #7a7a7a)',
          boxShadow: '0 3px 6px rgba(0,0,0,0.4)',
        }}
      />

      {/* Card — colorHex drives the background gradient */}
      <div
        className="w-full relative rounded-[16px] overflow-hidden flex flex-col"
        style={{
          maxWidth: 260,
          aspectRatio: '260 / 380',
          marginTop: 6,
          background: `
            radial-gradient(circle at 50% 0%, ${hexToRgba(c, 0.12)}, transparent 55%),
            linear-gradient(165deg, ${c} 0%, ${c2} 40%, ${c3} 100%)
          `,
          boxShadow: '0 28px 55px -14px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.06) inset',
        }}
      >
        {/* Punch hole */}
        <div
          className="absolute z-[6] rounded-[6px]"
          style={{
            top: 14, left: '50%', transform: 'translateX(-50%)',
            width: 26, height: 10,
            background: '#0a0a0d',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.9)',
          }}
        />

        {/* Sheen */}
        <div
          className="absolute top-0 pointer-events-none z-[5]"
          style={{
            left: '-160%', width: '55%', height: '100%',
            background: `linear-gradient(100deg, transparent 25%, rgba(180,140,255,0) 42%, ${hexToRgba(c, 0.25)} 50%, rgba(180,140,255,0) 58%, transparent 75%)`,
            transform: 'skewX(-18deg)',
            animation: 'staffSheen 6s ease-in-out infinite',
            mixBlendMode: 'screen',
          }}
        />
        <style>{`@keyframes staffSheen{0%{left:-160%}45%{left:160%}100%{left:160%}}`}</style>

        {/* Top */}
        <div className="relative z-[2] text-center p-[32px_22px_16px]">
          <div style={{
            fontFamily: '"Cinzel", serif', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.12em',
            background: `linear-gradient(180deg, #fff, ${hexToRgba(c, 0.7)} 60%, ${hexToRgba(c, 0.4)})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {props.businessName || 'Ai Link'}
          </div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.52rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: hexToRgba(c, 0.7), marginTop: 3 }}>
            {props.cardTitle || 'Staff Credential'}
          </div>
        </div>

        {/* Photo */}
        <div
          className="relative z-[2] mx-auto flex items-center justify-center rounded-[14px]"
          style={{
            width: 96, height: 96,
            background: `linear-gradient(150deg, ${adjustColor(c, 30)}, ${adjustColor(c, -10)})`,
            border: `2px solid ${hexToRgba(c, 0.4)}`,
            boxShadow: '0 8px 18px -6px rgba(0,0,0,0.6)',
          }}
        >
          <svg width="50%" height="50%" viewBox="0 0 24 24" fill="none" stroke={hexToRgba(c, 0.7)} strokeWidth="1.5">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
          </svg>
        </div>

        {/* Name/role */}
        <div className="relative z-[2] text-center px-[22px]" style={{ paddingTop: 12 }}>
          <div style={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, fontSize: '1.2rem', color: '#fff' }}>
            {props.businessName || 'Camilo Vargas'}
          </div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: hexToRgba(c, 0.8), marginTop: 4 }}>
            {props.rewardDescription || 'Producción Técnica'}
          </div>
        </div>

        {/* Divider */}
        <div
          className="relative z-[2] mx-[22px]"
          style={{
            marginTop: 16, height: 1,
            background: `linear-gradient(90deg, transparent, ${hexToRgba(c, 0.4)}, transparent)`,
          }}
        />

        {/* Info */}
        <div className="relative z-[2] flex justify-around px-[22px]" style={{ paddingTop: 14 }}>
          <div className="text-center">
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: hexToRgba(c, 0.6) }}>
              Área
            </div>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.72rem', color: '#d8d2ec', fontWeight: 700, marginTop: 3 }}>
              {props.category || 'Backstage'}
            </div>
          </div>
          <div className="text-center">
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: hexToRgba(c, 0.6) }}>
              Válido
            </div>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.72rem', color: '#d8d2ec', fontWeight: 700, marginTop: 3 }}>
              Todo el evento
            </div>
          </div>
        </div>

        {/* Footer barcode */}
        <div className="mt-auto relative z-[2] flex items-center justify-center p-[16px_0_18px]">
          <span style={{ fontFamily: '"Libre Barcode 128", sans-serif', fontSize: '1.6rem', color: '#d8d2ec', lineHeight: 1 }}>
            A4 471 932 02
          </span>
        </div>
      </div>
    </div>
  );
}
