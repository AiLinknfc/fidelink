import { useState, type FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ShoppingBag, Smartphone } from 'lucide-react';
import { ProductsTab } from '../components/dashboard';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';
import type { VentasContextType } from './VentasPage';

export default function VentasProductsPage() {
  const ctx = useOutletContext<VentasContextType>();
  const { brand } = useModuleBrand();
  const [chipHovered, setChipHovered] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState(15);
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductCat, setNewProductCat] = useState('Digital');
  const [newProductImg, setNewProductImg] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80');
  const [newProductDelType, setNewProductDelType] = useState<'ebook' | 'course' | 'membership' | 'document'>('ebook');
  const [newProductDelCont, setNewProductDelCont] = useState('');

  const handleCreateProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;
    ctx.handleAddProduct({
      name: newProductName, price: Number(newProductPrice), description: newProductDesc,
      category: newProductCat, imageUrl: newProductImg,
      deliveryType: newProductDelType, deliveryContent: newProductDelCont || "¡Hola! Gracias por tu compra. Pronto recibirás tus accesos exclusivos por mail.",
      stock: 100
    });
    setNewProductName(''); setNewProductDesc(''); setNewProductDelCont('');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Barra secundaria ── */}
      <div className="bg-[#f8fafc] border-b border-slate-200 px-4 sm:px-6 h-10
                      flex flex-row items-center justify-between
                      gap-2 select-none overflow-hidden flex-shrink-0">

        {/* LEFT — chip expandible */}
        <div
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-white cursor-default transition-all duration-500 ease-in-out min-w-0"
          style={{
            color: brand.colorHex,
            borderColor: chipHovered ? `${brand.colorHex}55` : 'rgb(226 232 240 / 0.6)',
            boxShadow: chipHovered
              ? `0 0 0 3px ${brand.colorHex}18, 0 2px 12px ${brand.colorHex}22`
              : '0 0 0 0px transparent',
            flex: chipHovered ? '1 1 0%' : '0 0 auto',
          }}
          onMouseEnter={() => setChipHovered(true)}
          onMouseLeave={() => setChipHovered(false)}
        >
          <div
            className="absolute inset-0 pointer-events-none rounded-full transition-opacity duration-500"
            style={{
              opacity: chipHovered ? 1 : 0,
              background: `linear-gradient(90deg, ${brand.colorHex}06 0%, ${brand.colorHex}14 50%, ${brand.colorHex}06 100%)`,
            }}
          />
          <ShoppingBag
            className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300"
            style={{ transform: chipHovered ? 'rotate(-15deg) scale(1.2)' : 'none' }}
          />
          <span className="text-[12px] font-bold font-sans whitespace-nowrap flex-shrink-0">Catálogo de Productos</span>
          <span
            className="text-[12px] font-sans whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out"
            style={{
              maxWidth: chipHovered ? '600px' : '0px',
              opacity: chipHovered ? 1 : 0,
              paddingLeft: chipHovered ? '6px' : '0px',
              color: `${brand.colorHex}99`,
              fontWeight: 500,
            }}
          >
            · Productos digitales con entrega automática vía WhatsApp
          </span>
        </div>

        {/* RIGHT — contador + simulador */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-full flex-shrink-0">
            <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: brand.colorHex }} />
            <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">
              {ctx.products.length} {ctx.products.length === 1 ? 'producto' : 'productos'}
            </span>
          </div>
          <button
            onClick={ctx.openSimulator}
            title="Simulador de cliente"
            className="p-1.5 rounded-xl transition-all cursor-pointer flex-shrink-0"
            style={{ backgroundColor: `${brand.colorHex}14`, color: brand.colorHex }}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Contenido scrollable ── */}
      <main className="flex-1 overflow-y-auto px-4 md:px-6 pt-3 pb-6">
        <ProductsTab
          products={ctx.products}
          newProductName={newProductName}
          newProductPrice={newProductPrice}
          newProductDesc={newProductDesc}
          newProductCat={newProductCat}
          newProductImg={newProductImg}
          newProductDelType={newProductDelType}
          newProductDelCont={newProductDelCont}
          setNewProductName={setNewProductName}
          setNewProductPrice={setNewProductPrice}
          setNewProductDesc={setNewProductDesc}
          setNewProductCat={setNewProductCat}
          setNewProductImg={setNewProductImg}
          setNewProductDelType={setNewProductDelType}
          setNewProductDelCont={setNewProductDelCont}
          handleCreateProduct={handleCreateProduct}
          cart={ctx.cart}
          onAddToCart={ctx.addToCart}
        />
      </main>
    </div>
  );
}
