import { type FormEvent, useState } from 'react';
import { Plus, ShoppingCart, ShoppingBag, X } from 'lucide-react';
import type { Product, CartItem } from '../../types';

interface ProductsTabProps {
  products: Product[];
  newProductName: string;
  newProductPrice: number;
  newProductDesc: string;
  newProductCat: string;
  newProductImg: string;
  newProductDelType: 'ebook' | 'course' | 'membership' | 'document';
  newProductDelCont: string;
  setNewProductName: (v: string) => void;
  setNewProductPrice: (v: number) => void;
  setNewProductDesc: (v: string) => void;
  setNewProductCat: (v: string) => void;
  setNewProductImg: (v: string) => void;
  setNewProductDelType: (v: 'ebook' | 'course' | 'membership' | 'document') => void;
  setNewProductDelCont: (v: string) => void;
  handleCreateProduct: (e: FormEvent) => void;
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
}

export default function ProductsTab({
  products,
  newProductName,
  newProductPrice,
  newProductDesc,
  newProductCat,
  newProductImg,
  newProductDelType,
  newProductDelCont,
  setNewProductName,
  setNewProductPrice,
  setNewProductDesc,
  setNewProductCat,
  setNewProductImg,
  setNewProductDelType,
  setNewProductDelCont,
  handleCreateProduct,
  cart,
  onAddToCart,
}: ProductsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const cartProductIds = new Set(cart.map(i => i.product.id));

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 border border-slate-200 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Catálogo de Productos — Tienda Pública</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold font-mono">
              {products.length} productos
            </span>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar Producto
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((p) => {
            const inCart = cartProductIds.has(p.id);
            return (
              <div key={p.id} className="p-4 border border-slate-200 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all bg-white relative">
                <div className="flex gap-3">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="font-bold text-sm text-slate-950">{p.name}</div>
                    <div className="font-mono font-bold text-indigo-600 text-sm mt-0.5">${p.price.toFixed(2)} COP</div>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider inline-block mt-1">
                      {p.category}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3 flex-1">{p.description}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => onAddToCart(p)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      inCart
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {inCart ? 'Agregado ✓' : 'Agregar al Carrito'}
                  </button>
                </div>
                <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-indigo-50 text-[9px] font-mono font-bold text-indigo-700 rounded select-none">
                  ID: {p.id}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <div className="bg-white p-6 border border-slate-200 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Agregar Producto o Servicio Digital</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={(e) => { handleCreateProduct(e); setShowForm(false); }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nombre del Producto</label>
                <input type="text" required placeholder="Ej: Café Bourbon Rosado Especial" value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600 text-slate-800 placeholder:text-slate-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Precio ($ COP)</label>
                  <input type="number" required min={1} value={newProductPrice}
                    onChange={(e) => setNewProductPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600 text-slate-800 placeholder:text-slate-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Categoría</label>
                  <select value={newProductCat} onChange={(e) => setNewProductCat(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-indigo-600">
                    <option value="Físico">Físico (Café Bolsa)</option>
                    <option value="E-book">E-book (PDF)</option>
                    <option value="Curso">Curso Digital</option>
                    <option value="Membresía">Membresía VIP</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Descripción Comercial para la IA</label>
                <textarea rows={2} required placeholder="La IA usará este texto para vender y responder preguntas frecuentes..."
                  value={newProductDesc} onChange={(e) => setNewProductDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600 text-slate-800 placeholder:text-slate-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">URL Imagen (Unsplash)</label>
                <input type="text" required value={newProductImg} onChange={(e) => setNewProductImg(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600 text-slate-800 placeholder:text-slate-400 font-sans" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Tipo de Entrega Automática</label>
                <select value={newProductDelType} onChange={(e) => setNewProductDelType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-indigo-600">
                  <option value="document">Escribir Instrucción de Envío Terrestre</option>
                  <option value="ebook">Link de Descarga del Ebook (PDF)</option>
                  <option value="course">Link Premium de Acceso a Clases / Video</option>
                  <option value="membership">Invitación de Membresía / Comunidad</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Contenido del Entregable</label>
                <textarea rows={2} required placeholder="Escribe el enlace directo o el mensaje que la pasarela entregará al cliente justo después de pagar."
                  value={newProductDelCont} onChange={(e) => setNewProductDelCont(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600 text-slate-800 placeholder:text-slate-400 font-sans" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 transition-all cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all cursor-pointer">
                  <Plus className="w-4 h-4" /> Agregar al Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
