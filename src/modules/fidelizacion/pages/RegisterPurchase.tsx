import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Receipt as ReceiptIcon, Camera, CheckCircle, Smartphone, AlertCircle, ScanLine } from 'lucide-react';
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
  const autoStampedRef = useRef(false);

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
    <div className="min-h-screen bg-surface pb-32">
      <main className="max-w-7xl mx-auto px-4 md:px-12 pt-8 space-y-8">
        <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant shadow-sm max-w-2xl mx-auto">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="text-headline-lg text-on-surface font-bold">Registrar Compra</h2>
            <button
              type="button"
              onClick={() => { setScanError(null); setScannerOpen(true); }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all text-[13px] font-bold flex-shrink-0"
            >
              <ScanLine className="w-4 h-4" />
              Escanear QR
            </button>
          </div>
          <p className="text-body-md text-on-surface-variant mb-4">
            {isAccumulative
              ? 'Suma puntos a la tarjeta del cliente según el monto de la compra'
              : 'Agrega un sello a la tarjeta de un cliente'}
          </p>

          {scannedNotice && (
            <div className="mb-6 p-3 bg-primary-container text-on-primary-container rounded-xl text-body-sm flex items-center gap-2">
              <Camera className="w-4 h-4 shrink-0" />
              <span className="flex-1">{scannedNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label className="block text-label-md text-on-surface-variant font-bold mb-2" htmlFor="clientEmail">
                Correo del cliente
              </label>
              <input
                id="clientEmail"
                type="email"
                className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
                <label className="block text-label-md text-on-surface-variant font-bold mb-2" htmlFor="purchaseAmount">
                  Monto de la compra
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-body-md text-on-surface-variant">$</span>
                  <input
                    id="purchaseAmount"
                    type="number"
                    min={0}
                    step={amountPerPoint}
                    className="flex-1 px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    value={purchaseAmount}
                    onChange={e => { setPurchaseAmount(e.target.value); setErrorMsg(''); }}
                    placeholder={String(amountPerPoint * 5)}
                    disabled={loading}
                  />
                </div>
                <p className="text-[12px] text-on-surface-variant mt-2">
                  {computedPoints > 0 ? (
                    <>Esto otorgará <strong className="text-primary">{computedPoints} {computedPoints === 1 ? 'punto' : 'puntos'}</strong> · 1 punto = ${amountPerPoint.toLocaleString()}.</>
                  ) : (
                    <>Mínimo por punto: ${amountPerPoint.toLocaleString()}.</>
                  )}
                </p>
              </div>
            )}

            {/* Recibo opcional (validación cruzada) */}
            <div className="p-4 border border-dashed border-outline-variant rounded-xl space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ReceiptIcon className="w-4 h-4 text-on-surface-variant" />
                  <p className="text-body-sm font-bold text-on-surface">{t('Recibo (opcional)')}</p>
                </div>
                {!showReceiptCapture && !attachedReceipt && (
                  <button
                    type="button"
                    className="text-primary text-label-md font-bold hover:underline"
                    onClick={() => setShowReceiptCapture(true)}
                  >
                    Escanear recibo
                  </button>
                )}
              </div>
              {attachedReceipt && (
                <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Recibo adjunto · Total: {attachedReceipt.ocrPayload.total ?? '—'} {attachedReceipt.ocrPayload.currency ?? ''}</span>
                </div>
              )}
              {showReceiptCapture && businessId && (
                <ReceiptCapture
                  businessId={businessId}
                  clientId={businessId /* placeholder — empresa registra; recibo se asigna al pre-resolver email */}
                  source="business"
                  onSuccess={(r) => { setAttachedReceipt(r); setShowReceiptCapture(false); }}
                  onCancel={() => setShowReceiptCapture(false)}
                />
              )}
            </div>

            {errorMsg && (
              <div className="p-4 bg-error-container text-on-error-container rounded-xl" role="alert">
                {errorMsg}
              </div>
            )}

            {successData && (
              <div className="p-4 bg-secondary-container text-on-secondary-container rounded-xl" role="status">
                <div className="flex items-center gap-2 font-bold mb-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{successData.name}</span>
                </div>
                <p className="mb-3">
                  {isAccumulative ? 'Puntos' : 'Sellos'}: {successData.currentStamps} / {successData.totalStamps}
                </p>
                <div className="h-3 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${(successData.currentStamps / successData.totalStamps) * 100}%` }}
                  />
                </div>
                {notifyStatus === 'sent' && (
                  <div className="flex items-center gap-1.5 text-[11px] mt-2 opacity-80">
                    <Smartphone className="w-3.5 h-3.5 shrink-0" />
                    <span>WhatsApp enviado al cliente (modo simulacro).</span>
                  </div>
                )}
                {notifyStatus === 'skipped' && (
                  <div className="flex items-center gap-1.5 text-[11px] mt-2 opacity-80">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>El cliente no tiene WhatsApp registrado — no se envió notificación.</span>
                  </div>
                )}
              </div>
            )}

            {completeCard && (
              <div className="p-4 bg-tertiary-container text-on-tertiary-container rounded-xl" role="alert">
                <p className="font-bold mb-3">
                  Este cliente ya completó su tarjeta. Puedes reiniciarla.
                </p>
                <button
                  type="button"
                  className="w-full bg-white text-tertiary px-6 py-3 rounded-xl font-bold hover:bg-surface-container transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  onClick={handleResetCard}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-tertiary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Reiniciar tarjeta'
                  )}
                </button>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading || !email.trim()}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isAccumulative ? (
                  computedPoints > 0 ? `Sumar ${computedPoints} ${computedPoints === 1 ? 'punto' : 'puntos'}` : 'Sumar puntos'
                ) : (
                  'Agregar Sello'
                )}
              </button>

              {(successData || completeCard || errorMsg) && (
                <button
                  type="button"
                  className="px-6 py-3 border border-outline-variant text-on-surface rounded-xl font-bold hover:bg-surface-container transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
