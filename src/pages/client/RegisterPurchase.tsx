import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  findProfileByEmail,
  getCardConfig,
  getClientCards,
  addStampSecure,
  mapLoyaltyError,
} from '@/services/loyaltyService';
import { getProfile } from '@/services/profileService';
import { sendPurchaseNotification } from '@/services/whatsappService';
import LoyaltyCard from '@/components/loyalty/LoyaltyCard';
import ReceiptCapture from '@/components/receipt/ReceiptCapture';
import { motion } from 'motion/react';
import type { Receipt } from '@/services/receiptService';

function Spinner() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function RegisterPurchase() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const clientId = user?.id;

  const prefilledEmail = searchParams.get('email') ?? '';
  const [email, setEmail] = useState(prefilledEmail);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const autoSearchedRef = useRef(false);

  const [businessProfile, setBusinessProfile] = useState<any>(null);
  const [cardConfig, setCardConfig] = useState<any>(null);
  const [previewCard, setPreviewCard] = useState<any>(null);

  const [confirmedCard, setConfirmedCard] = useState<any>(null);
  const [completeCard, setCompleteCard] = useState<any>(null);
  const [validatedReceipt, setValidatedReceipt] = useState<Receipt | null>(null);
  const [receiptIsMock, setReceiptIsMock] = useState(false);

  useEffect(() => {
    if (!authLoading && !clientId) {
      navigate('/');
    }
  }, [authLoading, clientId, navigate]);

  // Auto-buscar empresa si llegamos con ?email= (típicamente desde el escáner QR).
  useEffect(() => {
    if (authLoading || !clientId) return;
    if (autoSearchedRef.current) return;
    if (!prefilledEmail) return;
    autoSearchedRef.current = true;
    runSearch(prefilledEmail);
    // limpia el query param para que un refresh no relance la búsqueda
    searchParams.delete('email');
    setSearchParams(searchParams, { replace: true });
  }, [authLoading, clientId, prefilledEmail]);

  function reset() {
    setEmail('');
    setErrorMsg('');
    setBusinessProfile(null);
    setCardConfig(null);
    setPreviewCard(null);
    setConfirmedCard(null);
    setCompleteCard(null);
    setValidatedReceipt(null);
  }

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await runSearch(email);
  }

  async function runSearch(searchEmail: string) {
    if (!clientId) return;
    const trimmed = searchEmail.trim();
    if (!trimmed) return;
    setErrorMsg('');
    setBusinessProfile(null);
    setCardConfig(null);
    setPreviewCard(null);
    setConfirmedCard(null);
    setCompleteCard(null);
    setLoading(true);

    const { data: profile, error: profileError } = await findProfileByEmail(trimmed);

    if (profileError) {
      setErrorMsg(mapLoyaltyError(profileError));
      setLoading(false);
      return;
    }

    if (!profile) {
      setErrorMsg('No se encontró ninguna empresa con ese correo');
      setLoading(false);
      return;
    }

    if (profile.role === 'client') {
      setErrorMsg('El correo ingresado corresponde a un cliente, no a una empresa');
      setLoading(false);
      return;
    }

    const { data: config, error: configError } = await getCardConfig(profile.id);

    if (configError) {
      setErrorMsg(mapLoyaltyError(configError));
      setLoading(false);
      return;
    }

    if (!config) {
      setErrorMsg('Esta empresa aún no ha configurado su tarjeta de fidelización');
      setLoading(false);
      return;
    }

    const { data: clientCards } = await getClientCards(clientId);
    const existing = clientCards?.find((c) => c.businessId === profile.id) ?? null;

    setBusinessProfile(profile);
    setCardConfig(config);
    setPreviewCard(existing);
    setLoading(false);
  }

  async function handleConfirm() {
    if (!clientId || !businessProfile) return;
    if (!validatedReceipt) {
      setErrorMsg('Debes validar el recibo de compra antes de confirmar.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    const { data: updatedCard, error: stampError } = await addStampSecure({
      businessId: businessProfile.id,
      clientId,
      receiptId: validatedReceipt.id,
    });

    if (stampError) {
      if (stampError.message === 'CARD_COMPLETE') {
        setCompleteCard((stampError as any).card);
      } else {
        setErrorMsg(mapLoyaltyError(stampError));
      }
      setLoading(false);
      return;
    }

    setConfirmedCard(updatedCard);
    setLoading(false);

    // Notificación WhatsApp al propio cliente (modo simulacro).
    const { data: fullProfile } = await getProfile(clientId);
    await sendPurchaseNotification({
      to: fullProfile?.phone ?? null,
      clientName: fullProfile?.name ?? 'Cliente',
      businessName: updatedCard!.businessName,
      currentStamps: updatedCard!.currentStamps,
      totalStamps: updatedCard!.totalStamps,
      rewardDescription: updatedCard!.rewardDescription,
      trigger: { actor: 'client', actorId: clientId, cardId: updatedCard!.id },
    });
  }

  const previewCurrentStamps = previewCard?.currentStamps ?? 0;
  const showPreview = businessProfile && cardConfig && !confirmedCard && !completeCard;
  const showConfirmed = !!confirmedCard;
  const showComplete = !!completeCard;

  if (authLoading) return <Spinner />;
  if (!clientId) return null;

  return (
    <div className="min-h-screen bg-surface pb-32">
      <main className="max-w-7xl mx-auto px-4 md:px-12 pt-8 space-y-8">
        <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant shadow-sm">
          <h2 className="text-headline-lg text-on-surface font-bold mb-2">Registrar Compra</h2>
          <p className="text-body-md text-on-surface-variant mb-8">
            Busca la empresa por correo electrónico para registrar tu compra
          </p>

          <form onSubmit={handleSearch} className="space-y-6" noValidate>
            <div>
              <label className="block text-label-md text-on-surface-variant font-bold mb-2" htmlFor="businessEmail">
                Correo de la empresa
              </label>
              <input
                id="businessEmail"
                type="email"
                className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="empresa@ejemplo.com"
                required
                disabled={loading}
              />
            </div>

            {errorMsg && (
              <div className="p-4 bg-error-container text-on-error-container rounded-xl" role="alert">
                {errorMsg}
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
                ) : (
                  'Buscar Empresa'
                )}
              </button>

              {(showPreview || showConfirmed || showComplete || errorMsg) && (
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

          {showPreview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-4"
            >
              <div className="p-4 bg-surface-container rounded-xl">
                <p className="text-body-md text-on-surface-variant">
                  Empresa: <strong className="text-on-surface">{cardConfig.businessName}</strong>
                </p>
                <p className="text-body-md text-on-surface-variant">
                  Progreso actual: <strong className="text-on-surface">{previewCurrentStamps} / {cardConfig.totalStamps} sellos</strong>
                </p>
              </div>

              <div className="flex justify-center">
                <LoyaltyCard
                  businessName={cardConfig.businessName}
                  totalStamps={cardConfig.totalStamps}
                  currentStamps={previewCurrentStamps}
                  rewardDescription={cardConfig.rewardDescription}
                  colorHex={cardConfig.colorHex}
                />
              </div>

              {!validatedReceipt ? (
                <ReceiptCapture
                  businessId={businessProfile.id}
                  clientId={clientId}
                  source="client"
                  onSuccess={(r, mock) => { setValidatedReceipt(r); setReceiptIsMock(mock); setErrorMsg(''); }}
                />
              ) : (
                <div className="p-4 bg-secondary-container text-on-secondary-container rounded-xl">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold mb-1">✅ Recibo validado</p>
                    {receiptIsMock && (
                      <span className="text-[10px] uppercase tracking-widest bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-full font-bold">
                        Simulacro
                      </span>
                    )}
                  </div>
                  <p className="text-body-sm">
                    {validatedReceipt.ocrPayload.business_name ?? 'Negocio'} ·{' '}
                    Total: {validatedReceipt.ocrPayload.total ?? '—'}{' '}
                    {validatedReceipt.ocrPayload.currency ?? ''}
                    {validatedReceipt.ocrPayload.date && ` · ${validatedReceipt.ocrPayload.date}`}
                  </p>
                  {receiptIsMock && (
                    <p className="text-[11px] opacity-75 mt-1">
                      Datos generados a partir de la imagen — OCR real se activa al configurar GEMINI_API_KEY.
                    </p>
                  )}
                </div>
              )}

              <button
                className="w-full bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleConfirm}
                disabled={loading || !validatedReceipt}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'Confirmar Compra'
                )}
              </button>
            </motion.div>
          )}

          {showConfirmed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-4"
              role="status"
            >
              <div className="p-4 bg-secondary-container text-on-secondary-container rounded-xl">
                <p className="text-body-md font-bold">
                  ✅ ¡Compra registrada! Nuevo progreso: {confirmedCard.currentStamps} / {confirmedCard.totalStamps} sellos
                </p>
              </div>
              <div className="flex justify-center">
                <LoyaltyCard
                  businessName={confirmedCard.businessName}
                  totalStamps={confirmedCard.totalStamps}
                  currentStamps={confirmedCard.currentStamps}
                  rewardDescription={confirmedCard.rewardDescription}
                  colorHex={confirmedCard.colorHex}
                />
              </div>
            </motion.div>
          )}

          {showComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-4"
              role="alert"
            >
              <div className="p-4 bg-tertiary-container text-on-tertiary-container rounded-xl">
                <p className="text-body-md font-bold">
                  🎉 ¡Tarjeta completada! Ya tienes todos los sellos.
                </p>
              </div>
              <div className="flex justify-center">
                <LoyaltyCard
                  businessName={completeCard.businessName}
                  totalStamps={completeCard.totalStamps}
                  currentStamps={completeCard.currentStamps}
                  rewardDescription={completeCard.rewardDescription}
                  colorHex={completeCard.colorHex}
                />
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
