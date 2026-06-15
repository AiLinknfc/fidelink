import { ArrowLeft, ShieldCheck } from 'lucide-react';
import type { Product } from '../../types';

interface CheckoutViewProps {
  checkoutProduct: Product;
  selectedGateway: string;
  setSelectedGateway: (gw: string) => void;
  isPaying: boolean;
  handlePayCheckout: () => void;
  setMobileTab: (tab: 'ad' | 'landing' | 'whatsapp' | 'checkout' | 'delivery') => void;
}

export default function CheckoutView({ checkoutProduct, selectedGateway, setSelectedGateway, isPaying, handlePayCheckout, setMobileTab }: CheckoutViewProps) {
  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto font-sans p-4 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button onClick={() => setMobileTab('whatsapp')} className="p-1 hover:bg-slate-200 rounded-lg cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div>
          <h4 className="text-xs font-bold text-slate-900">Pasarela de Pagos Segura</h4>
          <p className="text-[9px] text-indigo-600 font-semibold uppercase font-sans">Pasarelas Integradas Latam</p>
        </div>
      </div>

      <div className="p-2 bg-indigo-50 text-[10px] text-indigo-800 rounded-lg flex items-center gap-1.5 border border-indigo-100">
        <ShieldCheck className="w-4 h-4" /> Encriptaci&oacute;n SSL de 256 bits activa.
      </div>

      <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Detalle del Pedido</div>
        <div className="text-xs font-bold text-slate-950 flex justify-between">
          <span>{checkoutProduct.name}</span>
          <span className="font-mono">${checkoutProduct.price.toFixed(2)} COP</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">M&eacute;todo de Pago Preferido</div>
        {[
          { name: 'Nequi', desc: 'Pago celular directo usando n&uacute;mero de cuenta' },
          { name: 'Bancolombia', desc: 'Transferencia por PSE o QR' },
          { name: 'Daviplata', desc: 'Banco Davivienda directo' },
          { name: 'PSE', desc: 'Cualquier banco de ahorros colombiano' },
          { name: 'Tarjeta', desc: 'Cr&eacute;dito o d&eacute;bito Visa / Mastercard' }
        ].map((gw) => (
          <label key={gw.name}
            className={`flex items-center justify-between p-2.5 border rounded-xl cursor-pointer hover:border-slate-300 transition-all ${
              selectedGateway === gw.name ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-white'
            }`}>
            <div>
              <div className="text-xs font-black text-slate-950">{gw.name}</div>
              <div className="text-[9px] text-slate-400">{gw.desc}</div>
            </div>
            <input type="radio" name="gateway" value={gw.name} checked={selectedGateway === gw.name}
              onChange={() => setSelectedGateway(gw.name)} className="accent-indigo-600 cursor-pointer" />
          </label>
        ))}
      </div>

      <button onClick={handlePayCheckout} disabled={isPaying}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs py-3.5 shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer">
        {isPaying ? (
          <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Validando Transacci&oacute;n...</>
        ) : (
          <><ShieldCheck className="w-4 h-4" /> Pagar ${checkoutProduct.price.toFixed(2)} COP Seguro</>
        )}
      </button>
    </div>
  );
}
