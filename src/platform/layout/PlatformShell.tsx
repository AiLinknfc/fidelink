import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import Sidebar from '@/components/layout/Sidebar';
import CartPanel from '@/modules/ventas/components/dashboard/CartPanel';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';
import { useCart } from '@/context/CartContext';

function CursorGlow() {
  useEffect(() => {
    const glow = document.getElementById('ambient-glow-cursor');
    if (!glow) return;
    const handler = (e: MouseEvent) => {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);
  return <div id="ambient-glow-cursor" className="ambient-glow-cursor" />;
}

export default function PlatformShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { activeModule } = useModuleBrand();
  const { cart, isCartOpen, closeCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const isLoginRoute = location.pathname === '/';
  const isPromoRoute = location.pathname.startsWith('/promociones');
  const isNapiRoute = location.pathname.startsWith('/napilink');

  if (isLoginRoute) return <Outlet />;

  return (
    <div className="min-h-screen flex flex-col font-sans fidelia-dark-canvas relative">
      <CursorGlow />
      <TopBar onSidebarOpen={() => setSidebarOpen(true)} />
      <div className="flex-grow relative z-10">
        <Outlet />
      </div>
      {(activeModule || isPromoRoute || isNapiRoute) ? (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      ) : null}

      {isCartOpen && (
        <CartPanel
          cart={cart}
          onRemoveFromCart={removeFromCart}
          onUpdateQuantity={updateQuantity}
          onClose={closeCart}
          onPaymentSuccess={() => { clearCart(); closeCart(); }}
          onClearCart={clearCart}
          onGoToCheckout={() => { closeCart(); navigate('/sales/checkout'); }}
        />
      )}
    </div>
  );
}
