import type { CardModelProps } from './types';
import { hexToRgba } from './colorUtils';

export default function BoardingPassCard(props: CardModelProps) {
  const c = props.colorHex || '#0b2545';
  const s = props.secondaryColorHex || '#d4af37';
  return (
    <div className="w-full cursor-pointer select-none">
      <div
        className="w-full flex relative rounded-[10px]"
        style={{
          aspectRatio: '620 / 230',
          boxShadow: '0 25px 50px -14px rgba(0,0,0,0.55), 0 8px 20px -8px rgba(0,0,0,0.35)',
          background: '#fbfaf7',
        }}
      >
        {/* Main section */}
        <div
          className="flex-1 relative overflow-hidden rounded-l-[10px] p-[22px_26px_18px]"
          style={{
            background: `radial-gradient(circle at 100% 0%, ${hexToRgba(c, 0.06)}, transparent 60%), linear-gradient(135deg, #ffffff 0%, #f7f6f2 100%)`,
          }}
        >
          {/* Top accent bar — colorHex drives it */}
          <div
            className="absolute top-0 left-0 right-0"
            style={{ height: 5, background: `linear-gradient(90deg, ${c}, ${hexToRgba(c, 0.7)} 35%, ${c} 70%, ${s})` }}
          />

          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-[9px]">
              <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5">
                <path d="M12 2L2 19h20L12 2z" fill={c} />
              </svg>
              <div>
                <div style={{ fontFamily: '"Cinzel", serif', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '0.06em', color: c }}>
                  {props.businessName || 'Meridian Air'}
                </div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.5rem', letterSpacing: '0.3em', color: s, fontWeight: 500, marginTop: 1 }}>
                  {props.cardTitle || 'First Class Boarding'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9a9488' }}>
                Cabina
              </div>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: '0.85rem', fontWeight: 700, color: s, letterSpacing: '0.08em' }}>
                {props.rewardDescription || 'PRIMERA'}
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="flex items-center justify-between" style={{ margin: '18px 0 14px' }}>
            <div className="flex flex-col">
              <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.6rem', color: c, lineHeight: 1, letterSpacing: '0.02em' }}>BOG</span>
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a8478', marginTop: 2 }}>Bogotá</span>
            </div>
            <div className="flex-1 flex flex-col items-center px-[18px]" style={{ position: 'relative', top: -6 }}>
              <div className="mb-[4px]" style={{ color: c }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2.5 1.5V22l4-1 4 1v-1.5L13 19v-5.5z" />
                </svg>
              </div>
              <div style={{ width: '100%', height: 1, background: `repeating-linear-gradient(90deg, ${s} 0, ${s} 5px, transparent 5px, transparent 9px)` }} />
            </div>
            <div className="flex flex-col">
              <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.6rem', color: c, lineHeight: 1, letterSpacing: '0.02em' }}>MAD</span>
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a8478', marginTop: 2 }}>Madrid</span>
            </div>
          </div>

          {/* Info grid */}
          <div
            className="grid grid-cols-4 gap-[14px]"
            style={{ marginTop: 6, paddingTop: 14, borderTop: '1px solid #e4ddc8' }}
          >
            {[
              { label: 'Pasajero', value: props.businessName || 'A. Restrepo' },
              { label: 'Vuelo', value: 'MA 0427' },
              { label: 'Puerta', value: 'C14' },
              { label: 'Abordaje', value: '21:40' },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.52rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9488' }}>
                  {item.label}
                </div>
                <div style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.78rem', color: '#1a1a18', fontWeight: 700, marginTop: 3 }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Perforation line */}
        <div className="relative" style={{ borderLeft: '2px dashed #d8d0bc' }}>
          <div className="absolute w-[18px] h-[18px] rounded-full bg-[#0a0a0d]" style={{ left: -9, top: -9 }} />
          <div className="absolute w-[18px] h-[18px] rounded-full bg-[#0a0a0d]" style={{ left: -9, bottom: -9 }} />
        </div>

        {/* Stub */}
        <div
          className="flex-shrink-0 flex flex-col justify-between rounded-r-[10px] p-[20px_18px] relative"
          style={{
            width: 160,
            background: `radial-gradient(circle at 0% 0%, ${hexToRgba(c, 0.06)}, transparent 60%), linear-gradient(135deg, #f3f1e8 0%, #e9e4d4 100%)`,
          }}
        >
          <div>
            <div style={{ fontFamily: '"Cinzel", serif', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.1em', color: c }}>
              {props.businessName || 'Meridian Air'}
            </div>
            <div className="flex items-center gap-[8px]" style={{ marginTop: 10 }}>
              <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.3rem', color: c }}>BOG</span>
              <span style={{ color: s, fontSize: '0.8rem' }}>&rarr;</span>
              <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.3rem', color: c }}>MAD</span>
            </div>
          </div>
          <div className="flex flex-col gap-[7px]">
            <div className="flex justify-between">
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: s }}>Asiento</span>
              <span style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.7rem', color: '#1a1a18', fontWeight: 700 }}>2A</span>
            </div>
            <div className="flex justify-between">
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: s }}>Grupo</span>
              <span style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.7rem', color: '#1a1a18', fontWeight: 700 }}>01</span>
            </div>
            <div style={{ fontFamily: '"Libre Barcode 128", sans-serif', fontSize: '1.7rem', color: '#1a1a18', textAlign: 'center', lineHeight: 1, marginTop: 6 }}>
              1234567890
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
