import { Menu, ScanLine, X, CreditCard, ShoppingCart, LogOut, Bell } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/index';
import { useAuth } from '@/context/AuthContext';
import { getProfile } from '@/services/profileService';
import ProfileDrawer from '@/components/profile/ProfileDrawer';
import QrScanner from '@/components/qr/QrScanner';
import { parseScannedSlug, parseScannedClientCardId, resolveSlugToBusinessEmail } from '@/services/qrLinkService';
import { resolveClientByCardId, getCardConfig } from '@/services/loyaltyService';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';
import { useCart } from '@/context/CartContext';

interface TopBarProps {
  onSidebarOpen?: () => void;
}

export default function TopBar({ onSidebarOpen }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { brand } = useModuleBrand();
  useI18n(); // mantiene el contexto de idioma activo
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState<'client' | 'business' | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [businessLogo, setBusinessLogo] = useState<string | null>(null);
  const { cartCount, openCart } = useCart();

  useEffect(() => {
    if (!user) { setAvatarUrl(null); setBusinessLogo(null); return; }
    getProfile(user.id).then(async ({ data }) => {
      setAvatarUrl(data?.avatarUrl ?? null);
      if (data?.role === 'business') {
        const { data: cfg } = await getCardConfig(user.id);
        setBusinessLogo(cfg?.logoUrl ?? null);
      } else {
        setBusinessLogo(null);
      }
    });
  }, [user, profileOpen]);

  if (location.pathname === '/') return null;

  const isBusiness = location.pathname.startsWith('/business') || location.pathname.startsWith('/biography') || location.pathname.startsWith('/sales') || location.pathname.startsWith('/admin');
  const isClientRoute = location.pathname.startsWith('/client');

  const userInitials = user?.user_metadata?.name
    ? user.user_metadata.name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'U';

  const clientMenuItems = [
    { icon: CreditCard, label: 'Mis Tarjetas', path: '/client/my-cards' },
    { icon: ShoppingCart, label: 'Registrar Compra', path: '/client/register-purchase' },
  ];

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    navigate('/');
  }

  async function handleScanResult(text: string) {
    if (scannerMode === 'business') {
      const cardId = parseScannedClientCardId(text);
      if (!cardId) {
        setScanError('Este QR no corresponde a una tarjeta fidelink de cliente.');
        return;
      }
      const { data, error } = await resolveClientByCardId(cardId);
      if (error || !data) {
        setScanError('No se pudo identificar al cliente. Verifica que la tarjeta sea de tu negocio.');
        return;
      }
      setScannerMode(null);
      setScanError(null);
      navigate(`/business/register-purchase?email=${encodeURIComponent(data.clientEmail)}`);
      return;
    }

    // cliente escaneando QR de un negocio
    const slug = parseScannedSlug(text);
    if (!slug) {
      setScanError('Este QR no corresponde a una tarjeta fidelink.');
      return;
    }
    const { data, error } = await resolveSlugToBusinessEmail(slug);
    if (error || !data) {
      setScanError('No se pudo identificar la empresa del QR.');
      return;
    }
    setScannerMode(null);
    setScanError(null);
    navigate(`/client/register-purchase?email=${encodeURIComponent(data.businessEmail)}`);
  }

  const userEmail = user?.email ?? '';

  return (
    <>
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200">
        <div className="flex justify-between items-center w-full px-4 h-14 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            {isBusiness ? (
              <button
                className="hover:bg-slate-100 transition-colors p-2 rounded-full"
                style={{ color: brand.colorHex }}
                onClick={onSidebarOpen}
              >
                <Menu className="w-5 h-5" />
              </button>
            ) : (
              <button
                className="hover:bg-slate-100 transition-colors p-2 rounded-full"
                style={{ color: brand.colorHex }}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
            <div className="flex items-center gap-2">
              <h1
                className="text-xl font-bold font-headline cursor-pointer tracking-tight"
                style={{ color: brand.colorHex }}
                onClick={() => navigate(isBusiness ? '/business' : '/wallet')}
              >
                {brand.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 bg-white border border-slate-200 pl-3 pr-2.5 py-1.5 rounded-full shadow-xs text-xs text-slate-600">
              <div className="text-right">
                <p className="text-[9px] font-mono tracking-wide font-bold uppercase leading-none"
                  style={{ color: brand.colorHex }}
                >
                  {brand.name.toUpperCase()}
                </p>
                <p className="text-[10px] font-semibold text-slate-700 tracking-tight mt-0.5 truncate max-w-[150px]">
                  {userEmail}
                </p>
              </div>
            </div>

            {/* QR Scanner */}
            <button
              onClick={() => { setScanError(null); setScannerMode(isBusiness ? 'business' : 'client'); }}
              className="bg-primary text-on-primary px-3 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all scale-95 active:opacity-80 shadow-md"
              aria-label="Escáner QR"
            >
              <ScanLine className="w-5 h-5" />
              <span className="hidden sm:inline text-[11px] font-bold">Escáner</span>
            </button>

            {/* Cart */}
            {isBusiness && (
              <button
                onClick={openCart}
                className="relative w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all"
                aria-label="Carrito de compras"
              >
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[7px] font-bold flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Notifications */}
            {isBusiness && (
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(prev => !prev)}
                  className="relative w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all"
                  aria-label="Notificaciones de campaña"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[7px] font-bold flex items-center justify-center shadow-sm">
                    3
                  </span>
                </button>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                    <div className="absolute right-0 top-10 z-50 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 space-y-3">
                      <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notificaciones</p>
                      <div className="space-y-2">
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                          <p className="text-xs font-semibold text-slate-800">Meta Pixel: 12 eventos nuevos</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">3 compras detectadas vía CAPI</p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                          <p className="text-xs font-semibold text-slate-800">Campaña "Café Premium"</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Presupuesto cerca del límite diario ($45.50/$50.00)</p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                          <p className="text-xs font-semibold text-slate-800">Nuevo lead calificado</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">María González — Score 92/100 — vía WhatsApp</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Avatar */}
            <button
              onClick={() => setProfileOpen(true)}
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-bold text-[11px] ring-2 ring-transparent hover:ring-[var(--accent-color)] transition-all"
              style={{ backgroundColor: `${brand.colorHex}20`, color: brand.colorHex }}
              aria-label="Abrir perfil"
            >
              {isBusiness && businessLogo ? (
                <img src={businessLogo} alt="" className="w-full h-full object-cover bg-white" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{userInitials}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />

      <QrScanner
        open={scannerMode !== null}
        onClose={() => setScannerMode(null)}
        onScan={handleScanResult}
        title={scannerMode === 'business' ? 'Escanear cliente' : 'Escanear código QR'}
        subtitle={
          scannerMode === 'business'
            ? 'Apunta a la cara B de la tarjeta del cliente para registrar la compra.'
            : 'Apunta la cámara hacia el código QR de la empresa.'
        }
      />

      {scanError && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[80] bg-red-50 text-red-600 px-4 py-2.5 rounded-xl shadow-lg text-xs max-w-sm border border-red-200">
          {scanError}
          <button onClick={() => setScanError(null)} className="ml-3 font-bold underline">Cerrar</button>
        </div>
      )}

      {/* Client Hamburger Menu */}
      {!isBusiness && menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMenuOpen(false)}>
          <div
            className="bg-surface-container-lowest w-80 h-full shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-8">
              <h2 className="text-headline-md text-on-surface font-bold mb-1">Menú</h2>
              <p className="text-body-md text-on-surface-variant">
                {user?.user_metadata?.name ?? user?.email ?? 'Cliente'}
              </p>
            </div>

            <nav className="space-y-2">
              {clientMenuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isClientRoute && location.pathname === item.path
                      ? 'bg-primary-container text-on-primary-container'
                      : 'text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-outline-variant">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error-container transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
