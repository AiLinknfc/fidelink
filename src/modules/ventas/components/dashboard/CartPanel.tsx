import { useState } from 'react';
import { X, Minus, Plus, Trash2, ShoppingCart, CreditCard, ExternalLink } from 'lucide-react';
import type { CartItem } from '../../types';

interface CartPanelProps {
  cart: CartItem[];
  onRemoveFromCart: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClose: () => void;
  onPaymentSuccess: (data: { leadName: string; phone: string; productId: string; amount: number; gateway: string }) => void;
  onClearCart: () => void;
  onGoToCheckout: () => void;
}

export default function CartPanel({
  cart, onRemoveFromCart, onUpdateQuantity, onClose,
  onPaymentSuccess, onClearCart, onGoToCheckout
}: CartPanelProps) {
  const [selectedGateway, setSelectedGateway] = useState('Nequi');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.12;
  const total = subtotal + tax;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePay = () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      const first = cart[0];
      onPaymentSuccess({
        leadName: 'Comprador Tienda',
        phone: '+57 300 000 0000',
        productId: first.product.id,
        amount: total,
        gateway: selectedGateway,
      });
      onClearCart();
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/10" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900">Carrito ({itemCount})</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">Carrito vacío</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex items-center gap-2 p-2.5 border border-slate-100 rounded-xl">
                <img src={item.product.imageUrl} alt={item.product.name}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{item.product.name}</p>
                  <p className="text-[10px] font-mono font-bold text-indigo-600">${item.product.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                    className="p-0.5 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer">
                    <Minus className="w-2.5 h-2.5 text-slate-500" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold font-mono">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    className="p-0.5 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer">
                    <Plus className="w-2.5 h-2.5 text-slate-500" />
                  </button>
                </div>
                <button onClick={() => onRemoveFromCart(item.product.id)}
                  className="p-1 text-red-300 hover:text-red-500 cursor-pointer">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-slate-200 p-4 space-y-3">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono font-bold">${subtotal.toFixed(2)} COP</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Impuestos (12%)</span>
              <span className="font-mono font-bold">${tax.toFixed(2)} COP</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-bold text-slate-900">
              <span>Total</span>
              <span className="font-mono text-indigo-600">${total.toFixed(2)} COP</span>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Método de Pago</p>
              {['Nequi', 'Bancolombia', 'Daviplata', 'Tarjeta'].map((gw) => (
                <label key={gw}
                  className={`flex items-center justify-between p-2 border rounded-xl cursor-pointer transition-all ${
                    selectedGateway === gw ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white'
                  }`}>
                  <span className="text-xs font-bold text-slate-900">{gw}</span>
                  <input type="radio" name="gw" value={gw} checked={selectedGateway === gw}
                    onChange={() => setSelectedGateway(gw)} className="accent-indigo-600 cursor-pointer" />
                </label>
              ))}
            </div>

            <button onClick={handlePay} disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all cursor-pointer disabled:opacity-50">
              {isProcessing ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Procesando...</>
              ) : (
                <><CreditCard className="w-4 h-4" /> Pagar ${total.toFixed(2)} con {selectedGateway}</>
              )}
            </button>

            <button onClick={onGoToCheckout}
              className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-50 transition-all cursor-pointer">
              <ExternalLink className="w-3.5 h-3.5" /> Ver carrito completo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
