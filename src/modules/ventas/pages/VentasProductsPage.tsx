import { useState, type FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ProductsTab } from '../components/dashboard';
import type { VentasContextType } from './VentasPage';

export default function VentasProductsPage() {
  const ctx = useOutletContext<VentasContextType>();
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
    <main className="h-full overflow-y-auto p-6">
      <ProductsTab products={ctx.products}
        newProductName={newProductName} newProductPrice={newProductPrice} newProductDesc={newProductDesc}
        newProductCat={newProductCat} newProductImg={newProductImg} newProductDelType={newProductDelType} newProductDelCont={newProductDelCont}
        setNewProductName={setNewProductName} setNewProductPrice={setNewProductPrice} setNewProductDesc={setNewProductDesc}
        setNewProductCat={setNewProductCat} setNewProductImg={setNewProductImg} setNewProductDelType={setNewProductDelType} setNewProductDelCont={setNewProductDelCont}
        handleCreateProduct={handleCreateProduct} cart={ctx.cart} onAddToCart={ctx.addToCart} />
    </main>
  );
}
