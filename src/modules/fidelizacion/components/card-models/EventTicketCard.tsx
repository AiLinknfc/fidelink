import type { CardModelProps } from './types';
import { hexToRgba } from './colorUtils';

export default function EventTicketCard(props: CardModelProps) {
  const c = props.colorHex || '#a8884f';
  return (
    <div className="w-full cursor-pointer select-none">
      <div
        className="w-full relative flex rounded-md overflow-hidden"
        style={{
          aspectRatio: '380 / 170',
          background: `
            repeating-linear-gradient(0deg, rgba(0,0,0,0.012) 0px, rgba(0,0,0,0.012) 1px, transparent 1px, transparent 2px),
            radial-gradient(ellipse at 30% 20%, ${hexToRgba(c, 0.06)}, transparent 60%),
            linear-gradient(155deg, #fdfcf9 0%, #f7f5ef 45%, #f1eee5 100%)
          `,
          boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 25px 50px -12px rgba(0,0,0,0.55), 0 8px 16px -4px rgba(0,0,0,0.3)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(115deg, rgba(120,110,90,0.025) 0px, transparent 1.2px, transparent 3px),
              repeating-linear-gradient(25deg, rgba(120,110,90,0.02) 0px, transparent 1px, transparent 2.4px)
            `,
            mixBlendMode: 'multiply',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-50%', left: '-20%', width: '60%', height: '200%',
            background: 'linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.55) 48%, rgba(255,255,255,0.15) 53%, transparent 70%)',
            transform: 'rotate(8deg)',
          }}
        />
        <div
          className="absolute top-0 bottom-0"
          style={{ right: 84, borderLeft: `2px dashed ${hexToRgba(c, 0.45)}`, zIndex: 4 }}
        />
        <div
          className="absolute"
          style={{
            top: 14, right: 18, width: 34, height: 34, borderRadius: '50%',
            border: `1px solid ${hexToRgba(c, 0.55)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3,
          }}
        >
          <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke={c} strokeWidth="1.3">
            <polygon points="12 2 4 8 6 21 18 21 20 8" />
          </svg>
        </div>

        <div className="flex-1 relative z-[2] flex flex-col justify-between p-[22px_20px_18px_26px]">
          <div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: c, fontWeight: 500 }}>
              {props.cardTitle || 'Invitación Especial'}
            </div>
            <div style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontWeight: 600, fontSize: '1.55rem', color: '#222018', marginTop: 6, letterSpacing: '0.01em' }}>
              {props.businessName || 'Evento'}
            </div>
            <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '0.92rem', color: '#6b6357', marginTop: 2, letterSpacing: '0.02em' }}>
              {props.rewardDescription || 'Beneficio exclusivo'}
            </div>
          </div>
          <div>
            <div style={{ height: 1, background: `linear-gradient(90deg, ${hexToRgba(c, 0.5)}, transparent)`, margin: '10px 0 8px', width: '80%' }} />
            <div style={{ display: 'flex', gap: 26 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a9082', fontFamily: 'Oswald, sans-serif' }}>Fecha</span>
                <span style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.78rem', color: '#2c2a24', fontWeight: 700, letterSpacing: '0.03em' }}>Hoy</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a9082', fontFamily: 'Oswald, sans-serif' }}>Puerta</span>
                <span style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.78rem', color: '#2c2a24', fontWeight: 700, letterSpacing: '0.03em' }}>A — 19:30</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a9082', fontFamily: 'Oswald, sans-serif' }}>Asiento</span>
                <span style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.78rem', color: '#2c2a24', fontWeight: 700, letterSpacing: '0.03em' }}>GA-014</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-[2] flex items-center justify-center" style={{ width: 84, flexShrink: 0, padding: '14px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transform: 'rotate(180deg)' }}>
            <span style={{ fontFamily: '"Libre Barcode 128", sans-serif', fontSize: '2.6rem', lineHeight: 1, color: '#1c1a16', writingMode: 'vertical-rl', letterSpacing: 2, filter: 'contrast(1.1)' }}>8 901234 567890</span>
          </div>
          <span style={{
            position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%) rotate(-90deg)',
            fontFamily: 'Oswald, sans-serif', fontSize: '0.5rem', letterSpacing: '0.3em',
            color: c, whiteSpace: 'nowrap', textTransform: 'uppercase',
          }}>Admit One</span>
        </div>
      </div>
    </div>
  );
}
