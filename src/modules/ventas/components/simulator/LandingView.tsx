import { ArrowLeft, MessageSquare } from 'lucide-react';
import type { Product } from '../../types';

interface LandingViewProps {
  products: Product[];
  agentConfig: any;
  handleLandingWhaChat: () => void;
  handleLandingDirectBuy: (prod: Product) => void;
  setMobileTab: (tab: 'ad' | 'landing' | 'whatsapp' | 'checkout' | 'delivery') => void;
}

export default function LandingView({ products, agentConfig, handleLandingWhaChat, handleLandingDirectBuy, setMobileTab }: LandingViewProps) {
  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      <div className="p-3 bg-white text-slate-900 border-b border-slate-200 flex items-center gap-2">
        <button onClick={() => setMobileTab('ad')} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-xs truncate font-mono font-semibold text-slate-500">origenes-cafe.com/landing</div>
      </div>

      <img src="https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=600&auto=format&fit=crop&q=80" alt="Gourmet Coffee" className="w-full h-32 object-cover" referrerPolicy="no-referrer" />

      <div className="p-4 space-y-4">
        <div className="text-center">
          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">{agentConfig.merchantName}</span>
          <h1 className="text-base font-black text-slate-950 mt-1 pb-1">Caf&eacute;s Especiales al Alcance de tu Taza</h1>
          <p className="text-xs text-slate-500 leading-normal">Cultivos tradicionales premium directo de origen a precio justo. Vive el caf&eacute; de especialidad.</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase border-b border-slate-100 pb-1">Productos Estrella</h3>
          {products.map(p => (
            <div key={p.id} className="p-2.5 border border-slate-200 rounded-xl hover:border-indigo-200 transition-all">
              <div className="flex gap-2">
                <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
                  <span className="text-xs font-black text-indigo-600 font-mono">${p.price} COP</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 lines-clamp-2">{p.description}</p>
              <button onClick={() => handleLandingDirectBuy(p)}
                className="w-full border border-indigo-600 hover:bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold py-1 mt-2.5 transition-all text-center cursor-pointer">
                Comprar Directo
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-slate-100 p-3 mt-auto">
        <button onClick={handleLandingWhaChat}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs py-2.5 shadow-md flex items-center justify-center gap-2 animate-bounce cursor-pointer">
          <MessageSquare className="w-4 h-4 fills-current" />
          Chatear con el Barista en WhatsApp
        </button>
      </div>
    </div>
  );
}
