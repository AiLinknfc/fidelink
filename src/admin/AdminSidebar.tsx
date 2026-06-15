import { X, LayoutDashboard, Users, Settings, Book, CreditCard, LogOut, ShoppingBag } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { brand } = useModuleBrand();

  async function handleSignOut() {
    onClose();
    await signOut();
    navigate('/');
  }

  if (!isOpen) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="bg-white w-80 h-full shadow-xl p-6 flex flex-col overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shrink-0"
              style={{ backgroundColor: brand.colorHex }}
            >
              {brand.logo}
            </div>
            <div>
              <h2 className="text-sm font-bold font-headline text-slate-800 leading-tight">{brand.name}</h2>
              <p className="text-[9px] font-mono text-slate-500 font-semibold flex items-center gap-1.5">
                Panel de Control
                <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ backgroundColor: brand.colorHex }} />
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-2 rounded-full hover:bg-slate-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2 font-mono">Admin Global</p>
          <nav className="space-y-1">
            <SidebarItem icon={LayoutDashboard} label="Dashboard Global" isActive={isActive('/admin')} onClick={() => { navigate('/admin'); onClose(); }} />
            <SidebarItem icon={Users} label="Clientes Cross-Module" isActive={isActive('/admin/clients')} onClick={() => { navigate('/admin/clients'); onClose(); }} />
            <SidebarItem icon={Settings} label="Módulos" isActive={isActive('/admin/modules')} onClick={() => { navigate('/admin/modules'); onClose(); }} />
          </nav>
        </div>

        <div className="mb-4 pt-4 border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2 font-mono">Acceso a Módulos</p>
          <nav className="space-y-1">
            <SidebarItem icon={CreditCard} label="Fidelización" isActive={location.pathname.startsWith('/business')} onClick={() => { navigate('/business'); onClose(); }} />
            <SidebarItem icon={Book} label="Biografías" isActive={location.pathname.startsWith('/biography')} onClick={() => { navigate('/biography'); onClose(); }} />
            <SidebarItem icon={ShoppingBag} label="Ventas" isActive={location.pathname.startsWith('/sales')} onClick={() => { navigate('/sales'); onClose(); }} />
          </nav>
        </div>

        <div className="mt-auto pt-8 border-t border-slate-100">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, isActive, onClick }: { icon: any; label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm ${
        isActive
          ? 'bg-violet-50 text-violet-700 font-semibold'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
      }`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
}
