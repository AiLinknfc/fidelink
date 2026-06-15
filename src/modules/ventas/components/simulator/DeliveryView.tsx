import { Check, Download, ExternalLink } from 'lucide-react';
import type { Product, Message } from '../../types';

interface DeliveryViewProps {
  deliveredProduct: Product;
  deliveryContent: string;
  setChatMessages: (msgs: Message[]) => void;
  setMobileTab: (tab: 'ad' | 'landing' | 'whatsapp' | 'checkout' | 'delivery') => void;
}

export default function DeliveryView({ deliveredProduct, deliveryContent, setChatMessages, setMobileTab }: DeliveryViewProps) {
  return (
    <div className="flex flex-col h-full bg-white text-slate-900 p-5 overflow-y-auto space-y-5 text-center justify-center">
      <div className="mx-auto w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border border-emerald-400 animate-pulse text-white">
        <Check className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <span className="text-[10px] text-indigo-600 uppercase font-black font-mono tracking-wider">&iexcl;Compra Confirmada!</span>
        <h1 className="text-base font-black tracking-tight text-slate-900">Entrega de Contenido Activada</h1>
        <p className="text-xs text-indigo-500">Firma digital #TX-{Math.floor(Math.random() * 900 + 100)} recibida con &eacute;xito en Meta CAPI.</p>
      </div>

      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-3 font-sans">
        <div className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider">Servicio Adquirido</div>
        <div className="text-sm font-bold text-slate-900">{deliveredProduct.name}</div>
        <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 font-sans tracking-wide leading-relaxed">
          {deliveryContent}
        </p>

        <div className="pt-2">
          {deliveredProduct.deliveryType === 'ebook' && (
            <a href="https://docsend.com/view/example-barista-pdf-download" target="_blank" rel="noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg text-xs font-bold transition-all">
              <Download className="w-4 h-4" /> Descargar mi E-book PDF
            </a>
          )}
          {deliveredProduct.deliveryType === 'course' && (
            <a href="https://youtube.com" target="_blank" rel="noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-all">
              <ExternalLink className="w-4 h-4" /> Ingresar a mi Clase Virtual
            </a>
          )}
          {deliveredProduct.deliveryType === 'membership' && (
            <a href="https://discord.gg" target="_blank" rel="noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-all">
              <ExternalLink className="w-4 h-4" /> Unirse al Discord VIP
            </a>
          )}
        </div>
      </div>

      <button onClick={() => { setChatMessages([]); setMobileTab('ad'); }}
        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer">
        Volver a Probar Otro Embudo de Ventas
      </button>
    </div>
  );
}
