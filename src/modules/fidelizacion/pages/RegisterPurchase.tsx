import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Receipt as ReceiptIcon, Camera, CheckCircle, Smartphone, AlertCircle, ScanLine, ShoppingCart } from 'lucide-react';
import QrScanner from '@/components/qr/QrScanner';
import { parseScannedClientCardId } from '@/services/qrLinkService';
import { resolveClientByCardId } from '@/services/loyaltyService';
import {
  findProfileByEmail,
  addStampSecure,
  resetCard,
  getCardConfig,
  mapLoyaltyError,
  type CardConfig,
} from '@/services/loyaltyService';
import { getProfile } from '@/services/profileService';
import { sendPurchaseNotification } from '@/services/whatsappService';
import ReceiptCapture from '@/components/receipt/ReceiptCapture';
import type { Receipt } from '@/services/receiptService';
import { useI18n } from '@/i18n/index';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';

function Spinner() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function RegisterPurchase() {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const { brand } = useModuleBrand();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const businessId = user?.id;
  const prefilledEmail = searchParams.get('email') ?? '';

  const [email, setEmail] = useState(prefilledEmail);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState<{ name: string; currentStamps: number; totalStamps: number } | null>(null);
  const [completeCard, setCompleteCard] = useState<any>(null);
  const [clientProfile, setClientProfile] = useState<{ id: string; name: string } | null>(null);
  const [showReceiptCapture, setShowReceiptCapture] = useState(false);
  const [attachedReceipt, setAttachedReceipt] = useState<Receipt | null>(null);
  const [scannedNotice, setScannedNotice] = useState<string | null>(prefilledEmail ? `Cliente identificado vía QR: ${prefilledEmail}` : null);
  const [notifyStatus, setNotifyStatus] = useState<'idle' | 'sent' | 'skipped'>('idle');
  const [cardConfig, setCardConfig] = useState<CardConfig | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState<string>('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [chipHovered, setChipHovered] = useState(false);
  const autoStampedRef = useRef(false);
  const accent = brand.colorHex;

  // Cargamos la config del programa para conocer programType (stamps vs acumulativo).
  useEffect(() => {
    if (!businessId) return;
    getCardConfig(businessId).then(({ data }) => setCardConfig(data));
  }, [businessId]);

  const isAccumulative = cardConfig?.programType === 'accumulative';
  const amountPerPoint = cardConfig?.amountPerPoint ?? 1000;
  const computedPoints = isAccumulative
    ? Math.floor((Number(purchaseAmount) || 0) / amountPerPoint)
    : 1;

  useEffect(() => {
    if (!authLoading && !businessId) {
      navigate('/');
    }
  }, [authLoading, businessId, navigate]);

  // Si llegamos con ?email= (típicamente desde el escáner QR del cliente),
  // disparamos la asignación de sello automáticamente una sola vez.
  useEffect(() => {
    if (authLoading || !businessId) return;
    if (autoStampedRef.current) return;
    if (!prefilledEmail) return;
    autoStampedRef.current = true;
    runStamp(prefilledEmail);
    // limpia el param para no relanzar en refresh
    searchParams.delete('email');
    setSearchParams(searchParams, { replace: true });
  }, [authLoading, businessId, prefilledEmail]);

  function reset() {
    setEmail('');
    setErrorMsg('');
    setSuccessData(null);
    setCompleteCard(null);
    setClientProfile(null);
    setShowReceiptCapture(false);
    setAttachedReceipt(null);
    setScannedNotice(null);
    setNotifyStatus('idle');
    setPurchaseAmount('');
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await runStamp(email);
  }

  async function runStamp(targetEmail: string) {
    if (!businessId) return;
    const trimmed = targetEmail.trim();
    if (!trimmed) return;
    setErrorMsg('');
    setSuccessData(null);
    setCompleteCard(null);

    // Pre-validación acumulativo: requiere monto y al menos 1 punto.
    let unitsToAward = 1;
    if (isAccumulative) {
      const amt = Number(purchaseAmount);
      if (!amt || amt <= 0) {
        setErrorMsg('Ingresa el monto de la compra (mayor a 0).');
        return;
      }
      unitsToAward = Math.floor(amt / amountPerPoint);
      if (unitsToAward < 1) {
        setErrorMsg(`El monto es menor al mínimo de $${amountPerPoint.toLocaleString()} por punto.`);
        return;
      }
    }

    setLoading(true);

    const { data: profile, error: profileError } = await findProfileByEmail(trimmed);

    if (profileError) {
      setErrorMsg(mapLoyaltyError(profileError));
      setLoading(false);
      return;
    }

    if (!profile) {
      setErrorMsg('No se encontró ningún cliente con ese correo');
      setLoading(false);
      return;
    }

    if (profile.role === 'business') {
      setErrorMsg('El correo ingresado corresponde a una empresa, no a un cliente');
      setLoading(false);
      return;
    }

    // Acumulativo: hacemos N llamadas secuenciales a addStampSecure (cada
    // una es atómica + crea un audit_log). El recibo se asocia solo a la
    // primera. Si una intermedia falla, conservamos el progreso parcial.
    let card: any = null;
    let lastError: any = null;
    for (let i = 0; i < unitsToAward; i++) {
      const { data, error: stampError } = await addStampSecure({
        businessId,
        clientId: profile.id,
        receiptId: i === 0 ? attachedReceipt?.id : undefined,
      });
      if (stampError) { lastError = stampError; break; }
      card = data;
    }

    if (lastError) {
      if (lastError.message === 'CARD_COMPLETE') {
        setCompleteCard((lastError as any).card ?? card);
      } else {
        setErrorMsg(mapLoyaltyError(lastError));
      }
      setLoading(false);
      return;
    }

    setClientProfile({ id: profile.id, name: profile.name });
    setSuccessData({
      name: profile.name,
      currentStamps: card!.currentStamps,
      totalStamps: card!.totalStamps,
    });
    setLoading(false);

    // Notificación WhatsApp (modo simulacro — ver whatsappService.ts).
    const { data: fullProfile } = await getProfile(profile.id);
    const msg = await sendPurchaseNotification({
      to: fullProfile?.phone ?? null,
      clientName: profile.name,
      businessName: card!.businessName,
      currentStamps: card!.currentStamps,
      totalStamps: card!.totalStamps,
      rewardDescription: card!.rewardDescription,
      trigger: { actor: 'business', actorId: businessId, cardId: card!.id },
    });
    setNotifyStatus(msg ? 'sent' : 'skipped');
  }

  async function handleScanResult(text: string) {
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
    setScannerOpen(false);
    setScanError(null);
    setEmail(data.clientEmail);
    setScannedNotice(`Cliente identificado vía QR: ${data.clientEmail}`);
    runStamp(data.clientEmail);
  }

  async function handleResetCard() {
    if (!completeCard) return;
    setLoading(true);
    setErrorMsg('');

    const { error } = await resetCard(completeCard.id);

    if (error) {
      setErrorMsg(mapLoyaltyError(error));
    } else {
      setCompleteCard(null);
      setSuccessData(null);
      setEmail('');
    }
    setLoading(false);
  }

  if (authLoading) return <Spinner />;
  if (!businessId) return null;

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Barra secundaria */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 h-12 flex flex-row items-center justify-between gap-2 select-none overflow-hidden flex-shrink-0">

        {/* LEFT — chip expandible */}
        <div
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-white cursor-default transition-all duration-500 ease-in-out min-w-0"
          style={{
            color: accent,
            borderColor: chipHovered ? `${accent}55` : 'rgb(226 232 240 / 0.6)',
            boxShadow: chipHovered
              ? `0 0 0 3px ${accent}18, 0 2px 12px ${accent}22`
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
              background: `linear-gradient(90deg, ${accent}06 0%, ${accent}14 50%, ${accent}06 100%)`,
            }}
          />
          <ShoppingCart
            className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300"
            style={{ transform: chipHovered ? 'rotate(-15deg) scale(1.2)' : 'none' }}
          />
          <span className="text-[12px] font-bold font-sans whitespace-nowrap flex-shrink-0 tracking-wide">Registrar Compra</span>
          <span
            className="text-[12px] font-light font-sans whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out"
            style={{
              maxWidth: chipHovered ? '600px' : '0px',
              opacity: chipHovered ? 1 : 0,
              paddingLeft: chipHovered ? '6px' : '0px',
              color: `${accent}99`,
            }}
          >
            · {isAccumulative ? 'Suma puntos según el monto de la compra' : 'Agrega un sello a la tarjeta del cliente'}
          </span>
        </div>

        {/* RIGHT — acciones */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-full flex-shrink-0">
            <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: accent }} />
            <span className="text-status text-slate-600 whitespace-nowrap">Registro de sellos</span>
          </div>
          <button
            type="button"
            onClick={() => { setScanError(null); setScannerOpen(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-light text-[11px] transition-all active:scale-[0.97] shadow-sm text-white tracking-wide"
            style={{ backgroundColor: accent }}
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Escanear QR</span>
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 md:px-6 pt-3 pb-6 space-y-4">

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm max-w-2xl mx-auto">
          {scannedNotice && (
            <div className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2 border"
              style={{ backgroundColor: `${accent}10`, color: accent, borderColor: `${accent}30` }}>
              <Camera className="w-4 h-4 shrink-0" />
              <span className="flex-1">{scannedNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-data-primary text-slate-700 mb-1.5" htmlFor="clientEmail">
                Correo del cliente
              </label>
              <input
                id="clientEmail"
                type="email"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all"
                style={{ focusRing: accent }}
                onFocus={(e) => { e.target.style.borderColor = accent; e.target.style.setProperty('--tw-ring-color', `${accent}40`); }}
                onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.setProperty('--tw-ring-color', ''); }}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg('');
                  setSuccessData(null);
                  setCompleteCard(null);
                }}
                placeholder="cliente@ejemplo.com"
                required
                disabled={loading}
              />
            </div>

            {isAccumulative && (
              <div>
                <label className="block text-data-primary text-slate-700 mb-1.5" htmlFor="purchaseAmount">
                  Monto de la compra
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-data-secondary text-slate-500">$</span>
                  <input
                    id="purchaseAmount"
                    type="number"
                    min={0}
                    step={amountPerPoint}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all"
                    onFocus={(e) => { e.target.style.borderColor = accent; e.target.style.setProperty('--tw-ring-color', `${accent}40`); }}
                    onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.setProperty('--tw-ring-color', ''); }}
                    value={purchaseAmount}
                    onChange={e => { setPurchaseAmount(e.target.value); setErrorMsg(''); }}
                    placeholder={String(amountPerPoint * 5)}
                    disabled={loading}
                  />
                </div>
                <p className="text-data-secondary text-slate-500 mt-1.5">
                  {computedPoints > 0 ? (
                    <>Esto otorgará <strong style={{ color: accent }}>{computedPoints} {computedPoints === 1 ? 'punto' : 'puntos'}</strong> · 1 punto = ${amountPerPoint.toLocaleString()}.</>
                  ) : (
                    <>Mínimo por punto: ${amountPerPoint.toLocaleString()}.</>
                  )}
                </p>
              </div>
            )}

            {/* Recibo opcional */}
            <div className="p-4 border border-dashed border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ReceiptIcon className="w-4 h-4 text-slate-400" />
                  <p className="text-data-primary text-slate-700">{t('Recibo (opcional)')}</p>
                </div>
                {!showReceiptCapture && !attachedReceipt && (
                  <button
                    type="button"
                    className="text-[11px] font-light hover:underline tracking-wide"
                    style={{ color: accent }}
                    onClick={() => setShowReceiptCapture(true)}
                  >
                    Escanear recibo
                  </button>
                )}
              </div>
              {attachedReceipt && (
                <div className="flex items-center gap-2 text-data-secondary text-slate-500">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Recibo adjunto · Total: {attachedReceipt.ocrPayload.total ?? '—'} {attachedReceipt.ocrPayload.currency ?? ''}</span>
                </div>
              )}
              {showReceiptCapture && businessId && (
                <ReceiptCapture
                  businessId={businessId}
                  clientId={businessId}
                  source="business"
                  onSuccess={(r) => { setAttachedReceipt(r); setShowReceiptCapture(false); }}
                  onCancel={() => setShowReceiptCapture(false)}
                />
              )}
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            {successData && (
              <div className="p-4 rounded-xl border" role="status"
                style={{ backgroundColor: `${accent}08`, borderColor: `${accent}25` }}>
                <div className="flex items-center gap-2 font-medium mb-2">
                  <CheckCircle className="w-4 h-4 shrink-0" style={{ color: accent }} />
                  <span className="text-data-primary" style={{ color: accent }}>{successData.name}</span>
                </div>
                <p className="text-data-secondary text-slate-600 mb-2">
                  {isAccumulative ? 'Puntos' : 'Sellos'}: {successData.currentStamps} / {successData.totalStamps}
                </p>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(successData.currentStamps / successData.totalStamps) * 100}%`, backgroundColor: accent }}
                  />
                </div>
                {notifyStatus === 'sent' && (
                  <div className="flex items-center gap-1.5 text-status text-slate-500 mt-2">
                    <Smartphone className="w-3.5 h-3.5 shrink-0" />
                    <span>WhatsApp enviado al cliente (modo simulacro).</span>
                  </div>
                )}
                {notifyStatus === 'skipped' && (
                  <div className="flex items-center gap-1.5 text-status text-slate-500 mt-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>El cliente no tiene WhatsApp registrado — no se envió notificación.</span>
                  </div>
                )}
              </div>
            )}

            {completeCard && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl" role="alert">
                <p className="text-data-primary text-amber-800 mb-3">
                  Este cliente ya completó su tarjeta. Puedes reiniciarla.
                </p>
                <button
                  type="button"
                  className="w-full bg-white text-amber-700 px-5 py-2.5 rounded-xl font-light tracking-wide text-sm hover:bg-amber-50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-amber-200"
                  onClick={handleResetCard}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Reiniciar tarjeta'
                  )}
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 text-white px-5 py-2.5 rounded-xl font-light tracking-wide text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                style={{ backgroundColor: accent }}
                disabled={loading || !email.trim()}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isAccumulative ? (
                  computedPoints > 0 ? `Sumar ${computedPoints} ${computedPoints === 1 ? 'punto' : 'puntos'}` : 'Sumar puntos'
                ) : (
                  'Agregar Sello'
                )}
              </button>

              {(successData || completeCard || errorMsg) && (
                <button
                  type="button"
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-light tracking-wide text-sm hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={reset}
                  disabled={loading}
                >
                  Nueva búsqueda
                </button>
              )}
            </div>
          </form>
        </div>

      </main>

      <QrScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScanResult}
        title="Escanear cliente"
        subtitle="Apunta a la cara B de la tarjeta del cliente para registrar la compra."
      />

      {scanError && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[80] bg-red-50 text-red-600 px-4 py-2.5 rounded-xl shadow-lg text-xs max-w-sm border border-red-200">
          {scanError}
          <button onClick={() => setScanError(null)} className="ml-3 font-bold underline">Cerrar</button>
        </div>
      )}
    </div>
  );
}
