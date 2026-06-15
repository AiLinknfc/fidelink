import { useState, type MouseEvent } from 'react';

interface RealisticCardPreviewProps {
  businessName: string;
  cardTitle: string;
  cardTag: string;
  colorHex: string;
  totalStamps: number;
  rewardDescription: string;
  category: string;
  logoUrl?: string | null;
}

export default function RealisticCardPreview({
  businessName,
  cardTitle,
  cardTag,
  colorHex,
  totalStamps,
  rewardDescription,
  category,
  logoUrl,
}: RealisticCardPreviewProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [shine, setShine] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotX = Math.min(Math.max(-((y / rect.height) - 0.5) * 18, -15), 15);
    const rotY = Math.min(Math.max(((x / rect.width) - 0.5) * 18, -15), 15);
    setRotate({ x: rotX, y: rotY });
    setShine({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  const typeLabel = cardTag?.toUpperCase() || 'LOYALTY';
  const secondaryColor = adjustColor(colorHex, -30);
  const displayPoints = totalStamps;

  return (
    <div
      className="w-full cursor-pointer select-none transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="w-full rounded-2xl relative overflow-hidden transition-all duration-300 aspect-[1.58/1] flex flex-col justify-between p-5"
        style={{
          background: `linear-gradient(135deg, ${colorHex} 0%, ${secondaryColor} 100%)`,
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: 'preserve-3d',
          transition: isHovered ? 'transform 0.05s linear' : 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 140px at ${shine.x}% ${shine.y}%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0) 80%)`,
            mixBlendMode: 'overlay',
            opacity: isHovered ? 1 : 0,
          }}
        />
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:10px_10px] pointer-events-none" />

        <div className="flex justify-between items-start z-10" style={{ transform: 'translateZ(15px)' }}>
          <div>
            <div className="flex items-center gap-1.5 bg-black/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/5 w-fit">
              {logoUrl && (
                <img src={logoUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
              )}
              <p className="text-[9px] font-bold tracking-widest uppercase text-white/95 leading-none">
                {businessName || 'Tu negocio'}
              </p>
            </div>
            <p className="text-[13px] font-bold tracking-tight mt-1.5 leading-tight text-white drop-shadow-sm">
              {cardTitle || 'Tarjeta de Fidelidad'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[8px] font-mono tracking-widest bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full font-bold uppercase border border-white/10">
              {typeLabel}
            </span>
            <svg className="w-4 h-4 text-white mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 8c1.33 1 3 1.5 4.5 1.5s3.17-.5 4.5-1.5" />
              <path d="M3 12c2.13 1.6 4.8 2.4 7.2 2.4s5.07-.8 7.2-2.4" />
              <path d="M1 16c2.93 2.2 6.6 3.3 9.9 3.3s6.97-1.1 9.9-3.3" />
            </svg>
          </div>
        </div>

        <div className="flex justify-between items-center my-0.5 z-10" style={{ transform: 'translateZ(20px)' }}>
          <div className="w-9 h-7 bg-gradient-to-br from-[#FFE194] via-[#DFB15B] to-[#99732B] rounded-lg p-1 shadow-md border border-[#D9A343]/60 flex flex-wrap gap-[1px] opacity-95 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full animate-pulse pointer-events-none" />
            <div className="w-[30%] h-[35%] border-r border-b border-black/30 rounded-xs" />
            <div className="w-[36%] h-[35%] border-l border-r border-b border-black/30 rounded-xs" />
            <div className="w-[30%] h-[35%] border-l border-b border-black/30 rounded-xs" />
            <div className="w-[30%] h-[35%] border-r border-t border-black/30 rounded-xs" />
            <div className="w-[36%] h-[35%] border-l border-r border-t border-black/30 rounded-xs" />
            <div className="w-[30%] h-[35%] border-l border-t border-black/30 rounded-xs" />
          </div>
          <div className="text-right">
            <span className="text-[7px] tracking-wider uppercase font-mono text-white/60 block leading-none">LOYALTY CHIP</span>
            <span className="text-[10px] font-mono tracking-widest text-zinc-100 font-bold">FIDELINK PASS</span>
          </div>
        </div>

        <div className="flex justify-between items-end pt-1.5 border-t border-white/10 z-10" style={{ transform: 'translateZ(10px)' }}>
          <div>
            <p className="text-[7.5px] font-mono tracking-widest uppercase text-white/70 leading-none">
              {typeLabel === 'CASHBACK' ? 'SALDO DISPONIBLE' : 'BENEFICIO'}
            </p>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-base font-bold tracking-tight text-white font-mono">{displayPoints}</span>
              <span className="text-[10px] text-white/75 font-mono">/ {totalStamps} {typeLabel === 'CASHBACK' ? '%' : typeLabel === 'MULTIPASS' ? 'pases' : 'pts'}</span>
            </div>
          </div>
          <div className="flex flex-col items-end leading-none">
            <span className="text-[7px] font-mono text-white/60 tracking-wider block mb-0.5">Nº MIEMBRO</span>
            <div className="text-[9px] font-mono tracking-widest text-[#F2F4F7] uppercase">•••• 7892</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xFF) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
