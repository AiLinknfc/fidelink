import { CreditCard, Zap, LogOut, X, Wallet, DollarSign, BarChart3, Megaphone, Gift, Target, UserCheck, ShoppingCart, Radio, Book, LayoutDashboard, Users, TrendingUp, MessageSquare, ShoppingBag, MapPin, Award, Calendar, Key, Coins, Building2, History, ClipboardList, Globe, type LucideIcon } from 'lucide-react';
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
  const isClientUser = role === 'client';
  const roleLabel = isClientUser ? 'Cliente' : 'Empresa';
  const RoleIcon = isClientUser ? UserCheck : Building2;

  const brandColor = brand.colorHex;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="bg-white w-80 h-full shadow-xl p-6 flex flex-col overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-light tracking-wider shrink-0 ring-1 ring-white/20 shadow-md"
              style={{
                backgroundColor: brandColor,
                boxShadow: `0 4px 16px ${brandColor}40, inset 0 1px 0 rgba(255,255,255,0.25)`,
              }}
            >
              {brand.logo}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-headline text-slate-800 leading-tight tracking-wide truncate">
                {brand.name}
              </h2>
              <p className="text-tech-label text-slate-400 leading-none mt-0.5">v0.0.0</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-2 rounded-full hover:bg-slate-100 -mr-1"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Admin: Cross-module navigation */}
        {isAdmin && (
          <div className="mb-4 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-light text-slate-400 uppercase tracking-[0.14em] px-4 mb-2">Admin Global</p>
            <nav className="space-y-0.5">
              <SidebarItem icon={LayoutDashboard} label="Dashboard Global" isActive={isActive('/admin')} onClick={() => { navigate('/admin'); onClose(); }} />
              <SidebarItem icon={Users} label="Clientes Cross-Module" isActive={isActive('/admin/clients')} onClick={() => { navigate('/admin/clients'); onClose(); }} />
            </nav>
          </div>
        )}

        {/* Fidelización section */}
        {(activeModule === 'fidelizacion' || isAdmin) && (
          <div className="mb-4">
            <p className="text-[10px] font-light text-slate-400 uppercase tracking-[0.14em] px-4 mb-2">Fidelización</p>
            <nav className="space-y-0.5">
              <SidebarItem icon={BarChart3} label="Analítica" isActive={isActive('/business')} onClick={() => { navigate('/business'); onClose(); }} />
              <SidebarItem icon={CreditCard} label="Personalizar tarjeta" isActive={isActive('/business/card-editor')} onClick={() => { navigate('/business/card-editor'); onClose(); }} />
              <SidebarItem icon={UserCheck} label="Clientes" isActive={isActive('/business/crm')} onClick={() => { navigate('/business/crm'); onClose(); }} />
            </nav>
          </div>
        )}

        {/* Biografías section */}
        {(activeModule === 'biografias' || isAdmin) && (
          <div className="mb-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-light text-slate-400 uppercase tracking-[0.14em] px-4 mb-2">Biografías</p>
            <nav className="space-y-0.5">
              <SidebarItem icon={Book} label="Mis Biografías" isActive={isActive('/biography')} onClick={() => { navigate('/biography'); onClose(); }} />
              <SidebarItem icon={Globe} label="Ecosistema de Bios" isActive={isActive('/biography/bios')} onClick={() => { navigate('/biography/bios'); onClose(); }} />
            </nav>
          </div>
        )}

        {/* Ventas section */}
        {(activeModule === 'ventas' || isAdmin) && (
          <div className="mb-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-light text-slate-400 uppercase tracking-[0.14em] px-4 mb-2">Ventas</p>
            <nav className="space-y-0.5">
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
            <p className="text-[10px] font-light text-slate-400 uppercase tracking-[0.14em] px-4 mb-2">Gestión</p>
            <nav className="space-y-0.5">
              <SidebarItem icon={Radio} label="Segmentación & CRM" isActive={isActive('/business/audiencia-crm')} onClick={() => { navigate('/business/audiencia-crm'); onClose(); }} />
              <SidebarItem icon={DollarSign} label="Pagos" isActive={isActive('/business/payment')} onClick={() => { navigate('/business/payment'); onClose(); }} />
            </nav>
          </div>
        )}

        {/* CAMPAÑAS */}
        {(activeModule === 'fidelizacion' || isAdmin) && (
          <div className="mb-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-light text-slate-400 uppercase tracking-[0.14em] px-4 mb-2">Campañas</p>
            <nav className="space-y-0.5">
              <SidebarItem icon={Megaphone} label="Campañas" isActive={false} onClick={() => {}} badge="3" />
              <SidebarItem icon={Target} label="Crear campaña" isActive={false} onClick={() => {}} />
              <SidebarItem icon={Gift} label="Plantillas" isActive={false} onClick={() => {}} />
            </nav>
          </div>
        )}

        {/* PLATAFORMA GENERAL */}
        {(activeModule === 'fidelizacion' || activeModule === 'biografias' || isAdmin) && (
          <div className="mb-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-light text-slate-400 uppercase tracking-[0.14em] px-4 mb-2">Plataforma General</p>
            <nav className="space-y-0.5">
              <SidebarItem icon={Zap} label="Automatizaciones" isActive={isActive('/business/automatizaciones')} onClick={() => { navigate('/business/automatizaciones'); onClose(); }} />
            </nav>
          </div>
        )}

        {/* EXPERIENCIA DEL CLIENTE */}
        {!isAdmin && role !== 'business' && (
          <div className="mb-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-light text-slate-400 uppercase tracking-[0.14em] px-4 mb-2">Experiencia del Cliente</p>
            <nav className="space-y-0.5">
              <SidebarItem icon={Wallet} label="Wallet Móvil" isActive={isActive('/wallet')} onClick={() => { navigate('/wallet'); onClose(); }} />
            </nav>
          </div>
        )}

        {/* PROMOCIONES */}
        <div className="mb-4 pt-4 border-t border-slate-100">
          <p className="text-[10px] font-light text-slate-400 uppercase tracking-[0.14em] px-4 mb-2">Promociones</p>
          <nav className="space-y-0.5">
            <SidebarItem icon={MapPin} label="Explorar Radar" isActive={isActive('/promociones/explorar') || isActive('/promociones')} onClick={() => { navigate('/promociones/explorar'); onClose(); }} />
            <SidebarItem icon={Award} label="Pasaporte Club" isActive={isActive('/promociones/lealtad')} onClick={() => { navigate('/promociones/lealtad'); onClose(); }} />
            <SidebarItem icon={Calendar} label="Mis Reservas" isActive={isActive('/promociones/reservas')} onClick={() => { navigate('/promociones/reservas'); onClose(); }} />
            <SidebarItem icon={MessageSquare} label="Chat en Vivo" isActive={isActive('/promociones/chat')} onClick={() => { navigate('/promociones/chat'); onClose(); }} />
          </nav>
        </div>

        {/* NAPILINK */}
        <div className="mb-4 pt-4 border-t border-slate-100">
          <p className="text-[10px] font-light uppercase tracking-[0.14em] px-4 mb-2" style={{ color: '#b45309' }}>Napilink</p>
          <nav className="space-y-0.5">
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
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
            <span className="font-light tracking-wide">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, isActive, onClick, badge }: { icon: LucideIcon; label: string; isActive: boolean; onClick: () => void; badge?: string }) {
  const { brand } = useModuleBrand();
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full transition-all text-[13px] tracking-wide ${
        isActive
          ? 'font-normal'
          : 'font-light text-slate-600 hover:bg-slate-50 hover:text-slate-800'
      }`}
      style={isActive ? { backgroundColor: `${brand.colorHex}12`, color: brand.colorHex } : undefined}
    >
      <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.5} />
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className="text-[9px] font-light text-white bg-red-500 px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight shadow-sm">
          {badge}
        </span>
      )}
    </button>
  );
}
