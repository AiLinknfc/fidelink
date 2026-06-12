import { CreditCard, ShoppingCart, LayoutDashboard, Users, Wallet, Search, ReceiptText, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '@/context/AuthContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const clientNav = [
  { icon: CreditCard, label: 'Tarjetas', path: '/client/my-cards' },
  { icon: ShoppingCart, label: 'Comprar', path: '/client/register-purchase' },
  { icon: Wallet, label: 'Wallet', path: '/wallet' },
  { icon: User, label: 'Perfil', path: '/profile' },
];

const businessNav = [
  { icon: LayoutDashboard, label: 'Resumen', path: '/business' },
  { icon: CreditCard, label: 'Tarjeta', path: '/business/card-editor' },
  { icon: ShoppingCart, label: 'Compras', path: '/business/register-purchase' },
  { icon: Users, label: 'Clientes', path: '/business/clients' },
];

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  // Welcome screen y mientras carga: oculto
  if (location.pathname === '/' || !user) return null;

  // Rol-aware: nav cliente vs nav empresa según rol del usuario,
  // no según la ruta (evita perder contexto al navegar entre secciones).
  const role = (user.user_metadata?.role as 'client' | 'business' | undefined) ?? 'client';
  const navItems = role === 'business' ? businessNav : clientNav;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface-container-lowest shadow-[0_-4px_12px_0_rgba(0,0,0,0.04)] px-4 py-3 pb-safe border-t border-outline-variant/30 rounded-t-xl transition-all">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center px-5 py-1 transition-all rounded-full",
                isActive 
                  ? "bg-primary-container text-on-primary-container scale-110" 
                  : "text-on-surface-variant hover:bg-surface-variant/50"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && "fill-current")} />
              <span className="text-label-md mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
