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
  searchBusinesses,
  BUSINESS_CATEGORIES,
  type BusinessSearchResult,
} from '@/services/loyaltyService';
import { getProfile } from '@/services/profileService';
import { sendPurchaseNotification } from '@/services/whatsappService';
import LoyaltyCard from '@/components/loyalty/LoyaltyCard';
import ReceiptCapture from '@/components/receipt/ReceiptCapture';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Mail } from 'lucide-react';
import type { Receipt } from '@/services/receiptService';

type SearchMode = 'category' | 'email';

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
  const [searchMode, setSearchMode] = useState<SearchMode>(prefilledEmail ? 'email' : 'category');
  const [email, setEmail] = useState(prefilledEmail);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const autoSearchedRef = useRef(false);

  // Category search state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryQuery, setCategoryQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BusinessSearchResult[]>([]);
  const [searchingCategory, setSearchingCategory] = useState(false);

  const [businessProfile, setBusinessProfile] = useState<any>(null);
  const [cardConfig, setCardConfig] = useState<any>(null);
  const [previewCard, setPreviewCard] = useState<any>(null);
  const [confirmedCard, setConfirmedCard] = useState<any>(null);
  const [completeCard, setCompleteCard] = useState<any>(null);
  const [validatedReceipt, setValidatedReceipt] = useState<Receipt | null>(null);
  const [receiptIsMock, setReceiptIsMock] = useState(false);

  useEffect(() => {
    if (!authLoading && !clientId) navigate('/');
  }, [authLoading, clientId, navigate]);

  // Auto-buscar empresa si llegamos con ?email= (típicamente desde el escáner QR).
  useEffect(() => {
    if (authLoading || !clientId) return;
    if (autoSearchedRef.current) return;
    if (!prefilledEmail) return;
    autoSearchedRef.current = true;
    runSearch(prefilledEmail);
    searchParams.delete('email');
    setSearchParams(searchParams, { replace: true });
  }, [authLoading, clientId, prefilledEmail]);

  // Buscar negocios por categoría cuando cambia la selección o el query
  useEffect(() => {
    if (searchMode !== 'category') return;
    if (!selectedCategory && !categoryQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchingCategory(true);
    searchBusinesses({ category: selectedCategory ?? undefined, query: categoryQuery.trim() || undefined })
      .then(({ data }) => {
        setSearchResults(data ?? []);
        setSearchingCategory(false);
      });
  }, [selectedCategory, categoryQuery, searchMode]);

  function reset() {
    setEmail('');
    setErrorMsg('');
    setBusinessProfile(null);
    setCardConfig(null);
    setPreviewCard(null);
    setConfirmedCard(null);
    setCompleteCard(null);
    setValidatedReceipt(null);
    setSelectedCategory(null);
    setCategoryQuery('');
    setSearchResults([]);
  }

  async function handleSelectBusiness(result: BusinessSearchResult) {
    await runSearch(result.email);
  }

  async function handleEmailSearch(e: React.FormEvent<HTMLFormElement>) {
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
    if (profileError) { setErrorMsg(mapLoyaltyError(profileError)); setLoading(false); return; }
    if (!profile) { setErrorMsg('No se encontró ninguna empresa con ese correo'); setLoading(false); return; }
    if (profile.role === 'client') { setErrorMsg('El correo ingresado corresponde a un cliente, no a una empresa'); setLoading(false); return; }

    const { data: config, error: configError } = await getCardConfig(profile.id);
    if (configError) { setErrorMsg(mapLoyaltyError(configError)); setLoading(false); return; }
    if (!config) { setErrorMsg('Esta empresa aún no ha configurado su tarjeta de fidelización'); setLoading(false); return; }

    const { data: clientCards } = await getClientCards(clientId);
    const existing = clientCards?.find((c) => c.businessId === profile.id) ?? null;

    setBusinessProfile(profile);
    setCardConfig(config);
    setPreviewCard(existing);
    setLoading(false);
  }

  async function handleConfirm() {
    if (!clientId || !businessProfile) return;
    if (!validatedReceipt) { setErrorMsg('Debes validar el recibo de compra antes de confirmar.'); return; }
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
  const showFlow = businessProfile && cardConfig && !confirmedCard && !completeCard;

  if (authLoading) return <Spinner />;
  if (!clientId) return null;

  return (
    <div className="min-h-screen bg-surface pb-32">
      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
          <h2 className="text-headline-lg text-on-surface font-bold mb-1">Registrar Compra</h2>
          <p className="text-body-md text-on-surface-variant mb-5">
            Busca la empresa para registrar tu compra
          </p>

          {/* Mode tabs */}
          {!showFlow && !confirmedCard && !completeCard && (
            <div className="flex gap-2 mb-5">
              <button
                type="button"
                onClick={() => { setSearchMode('category'); reset(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-label-md transition-all border ${
                  searchMode === 'category'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant hover:bg-surface-container-high'
                }`}
              >
                <Search className="w-4 h-4" />
                Por sector
              </button>
              <button
                type="button"
                onClick={() => { setSearchMode('email'); reset(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-label-md transition-all border ${
                  searchMode === 'email'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant hover:bg-surface-container-high'
                }`}
              >
                <Mail className="w-4 h-4" />
                Por correo
              </button>
            </div>
          )}

          {/* ── Category Search ──────────────────────────────────── */}
          {searchMode === 'category' && !showFlow && !confirmedCard && !completeCard && (
            <div className="space-y-4">
              {/* Category chips */}
              <div className="flex flex-wrap gap-2">
                {BUSINESS_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    className={`px-3 py-1.5 rounded-full text-label-md font-bold transition-all border ${
                      selectedCategory === cat
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-surface-container text-on-surface-variant border-outline-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Text search within category */}
              <input
                type="text"
                value={categoryQuery}
                onChange={(e) => setCategoryQuery(e.target.value)}
                placeholder="Buscar por nombre del negocio…"
                className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
              />

              {errorMsg && (
                <div className="p-4 bg-error-container text-on-error-container rounded-xl" role="alert">
                  {errorMsg}
                </div>
              )}

              {/* Results */}
              {searchingCategory && (
                <div className="flex justify-center py-6">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!searchingCategory && searchResults.length > 0 && (
                <div className="space-y-3">
                  {searchResults.map((biz) => (
                    <motion.button
                      key={biz.id}
                      type="button"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleSelectBusiness(biz)}
                      disabled={loading}
                      className="w-full text-left p-4 bg-surface-container rounded-xl border border-outline-variant hover:bg-surface-container-high transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        {biz.config.logoUrl ? (
                          <img src={biz.config.logoUrl} alt={biz.config.businessName} className="w-12 h-12 rounded-xl object-cover border border-outline-variant" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-headline-sm font-bold text-on-primary-container bg-primary-container">
                            {biz.config.businessName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-on-surface truncate">{biz.config.businessName}</p>
                          {biz.config.category && (
                            <p className="text-body-sm text-on-surface-variant">{biz.config.category}</p>
                          )}
                          {biz.config.address && (
                            <p className="text-[11px] text-on-surface-variant truncate">{biz.config.address}</p>
                          )}
                        </div>
                        <div
                          className="w-4 h-4 rounded-full shrink-0"
                          style={{ backgroundColor: biz.config.colorHex }}
                        />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {!searchingCategory && (selectedCategory || categoryQuery) && searchResults.length === 0 && (
                <p className="text-center text-on-surface-variant py-6">
                  No se encontraron negocios con esos criterios.
                </p>
              )}

              {loading && (
                <div className="flex justify-center py-4">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}

          {/* ── Email Search ─────────────────────────────────────── */}
          {searchMode === 'email' && !showFlow && !confirmedCard && !completeCard && (
            <form onSubmit={handleEmailSearch} className="space-y-4" noValidate>
              <div>
                <label className="block text-label-md text-on-surface-variant font-bold mb-2" htmlFor="businessEmail">
                  Correo de la empresa
                </label>
                <input
                  id="businessEmail"
                  type="email"
                  className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
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
              <button
                type="submit"
                className="w-full bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={loading || !email.trim()}
              >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Buscar Empresa'}
              </button>
            </form>
          )}

          {/* ── Flow: vista previa + recibo + confirmar ──────────── */}
          {showFlow && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 bg-surface-container rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-on-surface">{cardConfig.businessName}</p>
                    <p className="text-body-sm text-on-surface-variant">
                      Progreso: {previewCurrentStamps} / {cardConfig.totalStamps} sellos
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={reset}
                    className="text-label-md text-primary font-bold hover:underline"
                  >
                    Cambiar
                  </button>
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
                  </div>
                )}

                {errorMsg && (
                  <div className="p-4 bg-error-container text-on-error-container rounded-xl" role="alert">
                    {errorMsg}
                  </div>
                )}

                <button
                  className="w-full bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
                  onClick={handleConfirm}
                  disabled={loading || !validatedReceipt}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : 'Confirmar Compra'}
                </button>
              </motion.div>
            </AnimatePresence>
          )}

          {/* ── Confirmado ───────────────────────────────────────── */}
          {confirmedCard && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4" role="status">
              <div className="p-4 bg-secondary-container text-on-secondary-container rounded-xl">
                <p className="font-bold">✅ ¡Compra registrada! Nuevo progreso: {confirmedCard.currentStamps} / {confirmedCard.totalStamps} sellos</p>
              </div>
              <div className="flex justify-center">
                <LoyaltyCard
                  businessName={confirmedCard.businessName}
                  totalStamps={confirmedCard.totalStamps}
                  currentStamps={confirmedCard.currentStamps}
                  rewardDescription={confirmedCard.rewardDescription}
                  colorHex={confirmedCard.colorHex}
                  cardId={confirmedCard.id}
                />
              </div>
              <button type="button" onClick={reset} className="w-full py-3 border border-outline-variant rounded-xl font-bold text-on-surface hover:bg-surface-container transition-all">
                Nueva búsqueda
              </button>
            </motion.div>
          )}

          {/* ── Tarjeta completa ─────────────────────────────────── */}
          {completeCard && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4" role="alert">
              <div className="p-4 bg-tertiary-container text-on-tertiary-container rounded-xl">
                <p className="font-bold">🎉 ¡Tarjeta completada! Ya tienes todos los sellos.</p>
              </div>
              <div className="flex justify-center">
                <LoyaltyCard
                  businessName={completeCard.businessName}
                  totalStamps={completeCard.totalStamps}
                  currentStamps={completeCard.currentStamps}
                  rewardDescription={completeCard.rewardDescription}
                  colorHex={completeCard.colorHex}
                  cardId={completeCard.id}
                />
              </div>
              <button type="button" onClick={reset} className="w-full py-3 border border-outline-variant rounded-xl font-bold text-on-surface hover:bg-surface-container transition-all">
                Nueva búsqueda
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
