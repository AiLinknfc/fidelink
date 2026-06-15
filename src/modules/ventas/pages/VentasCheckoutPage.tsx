import { useOutletContext, useNavigate } from 'react-router-dom';
import CartCheckout from '../components/dashboard/CartCheckout';
import type { VentasContextType } from './VentasPage';

export default function VentasCheckoutPage() {
  const ctx = useOutletContext<VentasContextType>();
  const navigate = useNavigate();

  return (
    <CartCheckout
      cart={ctx.cart}
      onRemoveFromCart={ctx.removeFromCart}
      onUpdateQuantity={ctx.updateQuantity}
      onClearCart={ctx.clearCart}
      onPaymentSuccess={ctx.handlePaymentSuccess}
      onBackToShop={() => navigate('/sales/products')}
    />
  );
}
