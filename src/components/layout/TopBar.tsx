import { Menu, QrCode, ScanLine, X, CreditCard, ShoppingCart, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/index';
import { useAuth } from '@/context/AuthContext';
import { getProfile } from '@/services/profileService';
import ProfileDrawer from '@/components/profile/ProfileDrawer';
import QrScanner from '@/components/qr/QrScanner';
import { parseScannedSlug, parseScannedClientCardId, resolveSlugToBusinessEmail } from '@/services/qrLinkService';
import { resolveClientByCardId, getCardConfig } from '@/services/loyaltyService';

interface TopBarProps {
  onSidebarOpen?: () => void;
}

export default function TopBar({ onSidebarOpen }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState<'client' | 'business' | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [businessLogo, setBusinessLogo] = useState<string | null>(null);

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

  const isBusiness = location.pathname.startsWith('/business');
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
        setScanError('Este QR no corresponde a una tarjeta FideliCard de cliente.');
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
      setScanError('Este QR no corresponde a una tarjeta FideliCard.');
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

  return (
    <>
      <header className="bg-surface sticky top-0 z-40 border-b border-outline-variant">
        <div className="flex justify-between items-center w-full px-4 h-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {isBusiness ? (
              <button
                className="text-primary hover:bg-surface-container transition-colors p-2 rounded-full scale-95 active:opacity-80"
                onClick={onSidebarOpen}
              >
                <Menu className="w-6 h-6" />
              </button>
            ) : (
              <button
                className="text-primary hover:bg-surface-container transition-colors p-2 rounded-full scale-95 active:opacity-80"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
            <h1
              className="text-headline-md font-bold text-primary cursor-pointer"
              onClick={() => navigate(isBusiness ? '/business' : '/wallet')}
            >
              FideliCard
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {isBusiness ? (
              <>
                <button
                  onClick={() => { setScanError(null); setScannerMode('business'); }}
                  className="bg-primary text-on-primary px-3 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all scale-95 active:opacity-80 shadow-md"
                  aria-label="Escanear QR del cliente"
                >
                  <ScanLine className="w-5 h-5" />
                  <span className="font-label-md text-label-md hidden sm:inline">Escanear</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => { setScanError(null); setScannerMode('client'); }}
                className="bg-primary text-on-primary px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all scale-95 active:opacity-80"
              >
                <QrCode className="w-5 h-5" />
                <span className="font-label-md text-label-md">{t('Scan QR') ?? 'Scan QR'}</span>
              </button>
            )}

            <button
              onClick={() => setProfileOpen(true)}
              className="ml-2 w-9 h-9 rounded-full overflow-hidden bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-label-md ring-2 ring-transparent hover:ring-primary/30 transition-all"
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
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[80] bg-error-container text-on-error-container px-4 py-3 rounded-xl shadow-lg text-body-sm max-w-sm">
          {scanError}
          <button
            onClick={() => setScanError(null)}
            className="ml-3 font-bold underline"
          >
            Cerrar
          </button>
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
