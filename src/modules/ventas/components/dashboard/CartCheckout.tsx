import { useState } from 'react';
import { Trash2, Minus, Plus, ShoppingCart, CreditCard, ArrowLeft } from 'lucide-react';
import type { CartItem } from '../../types';

interface CartCheckoutProps {
  cart: CartItem[];
  onRemoveFromCart: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
  onPaymentSuccess: (data: { leadName: string; phone: string; productId: string; amount: number; gateway: string }) => void;
  onBackToShop: () => void;
}

export default function CartCheckout({
  cart,
  onRemoveFromCart,
  onUpdateQuantity,
  onClearCart,
  onPaymentSuccess,
  onBackToShop,
}: CartCheckoutProps) {
  const [selectedGateway, setSelectedGateway] = useState('Nequi');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.12;
  const total = subtotal + tax;

  const handleGatewayPay = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    const first = cart[0];
    setTimeout(() => {
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
    <div className="h-full overflow-y-auto p-6">
      <button onClick={onBackToShop} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-4 cursor-pointer">
        <ArrowLeft className="w-3.5 h-3.5" /> Seguir comprando
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Carrito de Compras</h3>
              </div>
              {cart.length > 0 && (
                <button onClick={onClearCart} className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Vaciar Carrito
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium">Tu carrito está vacío</p>
                <p className="text-xs mt-1">Agrega productos desde la tienda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                    <img src={item.product.imageUrl} alt={item.product.name}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{item.product.name}</h4>
                      <p className="text-xs font-mono font-bold text-indigo-600">${item.product.price.toFixed(2)} COP</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                        className="p-1 bg-slate-200 hover:bg-slate-300 rounded-md cursor-pointer">
                        <Minus className="w-3 h-3 text-slate-600" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold font-mono">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 bg-slate-200 hover:bg-slate-300 rounded-md cursor-pointer">
                        <Plus className="w-3 h-3 text-slate-600" />
                      </button>
                    </div>
                    <div className="text-right min-w-[70px]">
                      <div className="text-sm font-bold font-mono">${(item.product.price * item.quantity).toFixed(2)}</div>
                      <button onClick={() => onRemoveFromCart(item.product.id)} className="text-[10px] text-red-400 hover:text-red-600 cursor-pointer">
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-5 border border-slate-200 rounded-2xl sticky top-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Resumen de Compra</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-bold">${subtotal.toFixed(2)} COP</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Impuestos (12%)</span>
                <span className="font-mono font-bold">${tax.toFixed(2)} COP</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-bold text-slate-900">
                <span>Total</span>
                <span className="font-mono text-indigo-600">${total.toFixed(2)} COP</span>
              </div>
            </div>

            {cart.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Método de Pago</p>
                  {[
                    { name: 'Nequi', desc: 'Pago celular directo' },
                    { name: 'Bancolombia', desc: 'Transferencia PSE o QR' },
                    { name: 'Daviplata', desc: 'Banco Davivienda' },
                    { name: 'Tarjeta', desc: 'Crédito o débito' },
                  ].map((gw) => (
                    <label key={gw.name}
                      className={`flex items-center justify-between p-2.5 border rounded-xl cursor-pointer transition-all ${
                        selectedGateway === gw.name ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-white'
                      }`}>
                      <div>
                        <div className="text-xs font-bold text-slate-950">{gw.name}</div>
                        <div className="text-[9px] text-slate-400">{gw.desc}</div>
                      </div>
                      <input type="radio" name="gateway" value={gw.name} checked={selectedGateway === gw.name}
                        onChange={() => setSelectedGateway(gw.name)} className="accent-indigo-600 cursor-pointer" />
                    </label>
                  ))}
                </div>

                <button onClick={handleGatewayPay} disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all cursor-pointer disabled:opacity-50">
                  {isProcessing ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Procesando...</>
                  ) : (
                    <><CreditCard className="w-4 h-4" /> Pagar ${total.toFixed(2)} con {selectedGateway}</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
