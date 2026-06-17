import { CreditCard, Zap, LogOut, X, Wallet, DollarSign, BarChart3, Megaphone, Gift, Target, UserCheck, ShoppingCart, Radio, Book, LayoutDashboard, Users, TrendingUp, MessageSquare, ShoppingBag, MapPin, Award, Calendar, Key, Coins, Building2, History, ClipboardList } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { brand, activeModule } = useModuleBrand();

  async function handleSignOut() {
    onClose();
    await signOut();
    navigate('/');
  }

  if (!isOpen) return null;

  const isActive = (path: string) => location.pathname === path;
  const role = user?.user_metadata?.role as string | undefined;
  const isAdmin = role === 'admin';

  const brandColor = brand.colorHex;
  const accentLight = `${brandColor}15`;

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
              style={{ backgroundColor: brandColor }}
            >
              {brand.logo}
            </div>
            <div>
              <h2 className="text-sm font-bold font-headline text-slate-800 leading-tight">{brand.name}</h2>
              <p className="text-[9px] font-mono text-slate-500 font-semibold flex items-center gap-1.5">
                Consola v1.0 PRO
                <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ backgroundColor: brandColor }} />
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

        {/* Admin: Cross-module navigation */}
        {isAdmin && (
          <div className="mb-4 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2 font-mono">Admin Global</p>
            <nav className="space-y-1">
              <SidebarItem icon={LayoutDashboard} label="Dashboard Global" isActive={isActive('/admin')} onClick={() => { navigate('/admin'); onClose(); }} />
              <SidebarItem icon={Users} label="Clientes Cross-Module" isActive={isActive('/admin/clients')} onClick={() => { navigate('/admin/clients'); onClose(); }} />
            </nav>
          </div>
        )}

        {/* MODULE-SPECIFIC SECTIONS — shown based on activeModule + admin access */}
        {/* Fidelización section */}
        {(activeModule === 'fidelizacion' || isAdmin) && (
          <div className="mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2 font-mono">Fidelización</p>
            <nav className="space-y-1">
              <SidebarItem icon={CreditCard} label="Personalizar tarjeta" isActive={isActive('/business/card-editor')} onClick={() => { navigate('/business/card-editor'); onClose(); }} />
              <SidebarItem icon={UserCheck} label="Clientes" isActive={isActive('/business/crm')} onClick={() => { navigate('/business/crm'); onClose(); }} />
              <SidebarItem icon={ShoppingCart} label="Registrar compra" isActive={isActive('/business/register-purchase')} onClick={() => { navigate('/business/register-purchase'); onClose(); }} />
            </nav>
          </div>
        )}

        {/* Biografías section */}
        {(activeModule === 'biografias' || isAdmin) && (
          <div className="mb-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2 font-mono">Biografías</p>
            <nav className="space-y-1">
              <SidebarItem icon={Book} label="Mis Biografías" isActive={isActive('/biography')} onClick={() => { navigate('/biography'); onClose(); }} />
            </nav>
          </div>
        )}

        {/* Ventas section */}
        {(activeModule === 'ventas' || isAdmin) && (
          <div className="mb-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2 font-mono">Ventas</p>
            <nav className="space-y-1">
              <SidebarItem icon={BarChart3} label="Analítica y Embudos" isActive={isActive('/sales/analytics')} onClick={() => { navigate('/sales/analytics'); onClose(); }} />
              <SidebarItem icon={Megaphone} label="Campañas y Pixel Logs" isActive={isActive('/sales/campaigns')} onClick={() => { navigate('/sales/campaigns'); onClose(); }} />
              <SidebarItem icon={Users} label="CRM Leads Calificados" isActive={isActive('/sales/crm')} onClick={() => { navigate('/sales/crm'); onClose(); }} />
              <SidebarItem icon={ShoppingBag} label="Catálogo de Productos" isActive={isActive('/sales/products')} onClick={() => { navigate('/sales/products'); onClose(); }} />
              <SidebarItem icon={ClipboardList} label="Recolección de datos" isActive={isActive('/sales/data-collection')} onClick={() => { navigate('/sales/data-collection'); onClose(); }} />
            </nav>
          </div>
        )}

        {/* Gestión */}
        {(activeModule === 'fidelizacion' || isAdmin) && (
          <div className="mb-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2 font-mono">Gestión</p>
            <nav className="space-y-1">
              <SidebarItem icon={Radio} label="Segmentación & CRM" isActive={isActive('/business/audiencia-crm')} onClick={() => { navigate('/business/audiencia-crm'); onClose(); }} />
              <SidebarItem icon={DollarSign} label="Pagos" isActive={isActive('/business/payment')} onClick={() => { navigate('/business/payment'); onClose(); }} />
            </nav>
          </div>
        )}

        {/* CAMPAÑAS */}
        {(activeModule === 'fidelizacion' || isAdmin) && (
          <div className="mb-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2 font-mono">Campañas</p>
            <nav className="space-y-1">
              <SidebarItem icon={Megaphone} label="Campañas" isActive={false} onClick={() => {}} badge="3" />
              <SidebarItem icon={Target} label="Crear campaña" isActive={false} onClick={() => {}} />
              <SidebarItem icon={Gift} label="Plantillas" isActive={false} onClick={() => {}} />
            </nav>
          </div>
        )}

        {/* PLATAFORMA GENERAL */}
        {(activeModule === 'fidelizacion' || activeModule === 'biografias' || isAdmin) && (
          <div className="mb-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2 font-mono">Plataforma General</p>
            <nav className="space-y-1">
              <SidebarItem icon={Zap} label="Automatizaciones" isActive={isActive('/business/automatizaciones')} onClick={() => { navigate('/business/automatizaciones'); onClose(); }} />
              <SidebarItem icon={BarChart3} label="Analítica" isActive={isActive('/business')} onClick={() => { navigate('/business'); onClose(); }} />
            </nav>
          </div>
        )}

        {/* EXPERIENCIA DEL CLIENTE */}
        {!isAdmin && role !== 'business' && (
          <div className="mb-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2 font-mono">Experiencia del Cliente</p>
            <nav className="space-y-1">
              <SidebarItem icon={Wallet} label="Wallet Móvil" isActive={isActive('/wallet')} onClick={() => { navigate('/wallet'); onClose(); }} />
            </nav>
          </div>
        )}

        {/* PROMOCIONES */}
        <div className="mb-4 pt-4 border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2 font-mono">Promociones</p>
          <nav className="space-y-1">
            <SidebarItem icon={MapPin} label="Explorar Radar" isActive={isActive('/promociones/explorar') || isActive('/promociones')} onClick={() => { navigate('/promociones/explorar'); onClose(); }} />
            <SidebarItem icon={Award} label="Pasaporte Club" isActive={isActive('/promociones/lealtad')} onClick={() => { navigate('/promociones/lealtad'); onClose(); }} />
            <SidebarItem icon={Calendar} label="Mis Reservas" isActive={isActive('/promociones/reservas')} onClick={() => { navigate('/promociones/reservas'); onClose(); }} />
            <SidebarItem icon={MessageSquare} label="Chat en Vivo" isActive={isActive('/promociones/chat')} onClick={() => { navigate('/promociones/chat'); onClose(); }} />
          </nav>
        </div>

        {/* NAPILINK */}
        <div className="mb-4 pt-4 border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2 font-mono" style={{ color: '#b45309' }}>Napilink</p>
          <nav className="space-y-1">
            <SidebarItem icon={TrendingUp} label="Dashboard Propinas" isActive={isActive('/napilink/dashboard') || isActive('/napilink')} onClick={() => { navigate('/napilink/dashboard'); onClose(); }} />
            <SidebarItem icon={Key} label="Billetera Bre-B" isActive={isActive('/napilink/wallet')} onClick={() => { navigate('/napilink/wallet'); onClose(); }} />
            <SidebarItem icon={Coins} label="Puntos Colombia" isActive={isActive('/napilink/puntos')} onClick={() => { navigate('/napilink/puntos'); onClose(); }} />
            <SidebarItem icon={Building2} label="Comercios y Personal" isActive={isActive('/napilink/comercios')} onClick={() => { navigate('/napilink/comercios'); onClose(); }} />
            <SidebarItem icon={History} label="Historial de Propinas" isActive={isActive('/napilink/historial')} onClick={() => { navigate('/napilink/historial'); onClose(); }} />
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

function SidebarItem({ icon: Icon, label, isActive, onClick, badge }: { icon: any; label: string; isActive: boolean; onClick: () => void; badge?: string }) {
  const { brand } = useModuleBrand();
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm ${
        isActive
          ? 'font-semibold'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
      }`}
      style={isActive ? { backgroundColor: `${brand.colorHex}15`, color: brand.colorHex } : undefined}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className="text-[9px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight shadow-sm">
          {badge}
        </span>
      )}
    </button>
  );
}
