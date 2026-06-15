import { ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import type { Campaign, Product } from '../../types';

interface AdViewProps {
  activeCamp?: Campaign;
  agentConfig: any;
  flagshipProduct: Product;
  handleAdClick: () => void;
}

export default function AdView({ activeCamp, agentConfig, flagshipProduct, handleAdClick }: AdViewProps) {
  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-y-auto">
      <div className="bg-white p-3 border-b border-slate-200 flex items-center justify-between shadow-xs">
        <span className="text-xs font-bold text-slate-600 font-sans">Patrocinado &bull; Meta Ads</span>
        <span className="text-[10px] text-slate-400 font-semibold uppercase">{activeCamp?.platform}</span>
      </div>

      <div className="p-3">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="flex items-center gap-2 p-3 font-sans">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-inner">CO</div>
            <div>
              <div className="text-xs font-bold text-slate-950 hover:underline cursor-pointer">{agentConfig.merchantName}</div>
              <div className="text-[9px] text-slate-400 font-semibold">Publicidad Patrocinada &bull; Meta</div>
            </div>
          </div>

          <div className="px-3 pb-2 text-xs text-slate-700 leading-relaxed font-sans">
            &iquest;Cansado de tomar caf&eacute; com&uacute;n? Descubre nuestro caf&eacute; de origen seleccionado y tuesta al pedido. ☕🌱 Directo de fincas Colombianas y con asesor&iacute;a experta en WhatsApp de Barismo. &iexcl;Haz clic abajo para ver el cat&aacute;logo y conversar!
          </div>

          <div className="relative">
            <img src={flagshipProduct.imageUrl} alt="Flagship Gourmet Coffee" className="w-full h-44 object-cover" referrerPolicy="no-referrer" />
            <div className="absolute bottom-2 right-2 bg-slate-700/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">Premium</div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Cat&aacute;logo Disponible</span>
              <h4 className="text-xs font-bold text-slate-950">{flagshipProduct.name}</h4>
            </div>
            <button onClick={handleAdClick}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 font-sans">
              Ver Cat&aacute;logo
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 py-2 flex justify-between text-slate-500 text-[11px] font-sans">
        <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600"><ThumbsUp className="w-3.5 h-3.5" /> Me gusta</span>
        <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600"><MessageCircle className="w-3.5 h-3.5" /> Comentar</span>
        <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600"><Share2 className="w-3.5 h-3.5" /> Compartir</span>
      </div>
    </div>
  );
}
