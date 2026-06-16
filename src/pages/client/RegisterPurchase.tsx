import { useState, useEffect, useRef, type ComponentType, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  findProfileByEmail,
  getCardConfig,
  getClientCards,
  addStampSecure,
  mapLoyaltyError,
  searchBusinesses,
  type BusinessSearchResult,
} from '@/services/loyaltyService';
import { getProfile } from '@/services/profileService';
import { sendPurchaseNotification } from '@/services/whatsappService';
import LoyaltyCard from '@/modules/fidelizacion/components/LoyaltyCard';
import ReceiptCapture from '@/components/receipt/ReceiptCapture';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Mail, Check, Camera, CheckCircle, PartyPopper,
  Coffee, Utensils, Gem, Monitor, Ticket, ShoppingCart,
  Heart, Scissors, Dumbbell, Crown,
  Receipt as ReceiptIcon, ArrowLeft, Lock, ScanLine,
} from 'lucide-react';
import QrScanner from '@/components/qr/QrScanner';
import { parseScannedSlug, resolveSlugToBusinessEmail } from '@/services/qrLinkService';
import type { Receipt } from '@/services/receiptService';

// ── Category definitions ────────────────────────────────────────────────────

interface CategoryDef {
  value: string;
  label: string;
  desc: string;
  Icon: ComponentType<{ className?: string }>;
  bg: string;
}

const CLIENT_CATEGORIES: CategoryDef[] = [
  { value: 'Cafetería y Bar',  label: 'Cafetería y Bar',  desc: 'Café, bar y bebidas',      Icon: Coffee,       bg: 'linear-gradient(135deg,#78350f 0%,#d97706 100%)' },
  { value: 'Restaurante',      label: 'Restaurante',      desc: 'Gastronomía y comida',      Icon: Utensils,     bg: 'linear-gradient(135deg,#991b1b 0%,#ea580c 100%)' },
  { value: 'Moda y Joyas',     label: 'Moda y Joyas',     desc: 'Ropa, joyería y accesorios',Icon: Gem,          bg: 'linear-gradient(135deg,#5b21b6 0%,#be185d 100%)' },
  { value: 'Tecnología',       label: 'Tecnología',       desc: 'Gadgets y electrónica',     Icon: Monitor,      bg: 'linear-gradient(135deg,#1e3a8a 0%,#0e7490 100%)' },
  { value: 'Entretenimiento',  label: 'Entretenimiento',  desc: 'Ocio y diversión',          Icon: Ticket,       bg: 'linear-gradient(135deg,#312e81 0%,#7c3aed 100%)' },
  { value: 'Tienda',           label: 'Tienda',           desc: 'Compras y mercados',        Icon: ShoppingCart, bg: 'linear-gradient(135deg,#065f46 0%,#16a34a 100%)' },
  { value: 'Salud',            label: 'Salud',            desc: 'Bienestar y salud',         Icon: Heart,        bg: 'linear-gradient(135deg,#9f1239 0%,#db2777 100%)' },
  { value: 'Belleza',          label: 'Belleza',          desc: 'Estética y cuidado',        Icon: Scissors,     bg: 'linear-gradient(135deg,#831843 0%,#a21caf 100%)' },
  { value: 'Gimnasio',         label: 'Gimnasio',         desc: 'Fitness y deporte',         Icon: Dumbbell,     bg: 'linear-gradient(135deg,#0f172a 0%,#334155 100%)' },
  { value: 'Servicios VIP',    label: 'Servicios VIP',    desc: 'Exclusivo y premium',       Icon: Crown,        bg: 'linear-gradient(135deg,#78350f 0%,#b45309 100%)' },
];

type SearchMode = 'category' | 'email';

// ── Helpers ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

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

  // Category search
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryQuery, setCategoryQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BusinessSearchResult[]>([]);
  const [searchingCategory, setSearchingCategory] = useState(false);

  // Business flow
  const [businessProfile, setBusinessProfile] = useState<any>(null);
  const [cardConfig, setCardConfig] = useState<any>(null);
  const [previewCard, setPreviewCard] = useState<any>(null);
  const [confirmedCard, setConfirmedCard] = useState<any>(null);
  const [completeCard, setCompleteCard] = useState<any>(null);

  // Receipt
  const [validatedReceipt, setValidatedReceipt] = useState<Receipt | null>(null);
  const [receiptIsMock, setReceiptIsMock] = useState(false);
  const [showReceiptCapture, setShowReceiptCapture] = useState(false);

  // QR Scanner
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !clientId) navigate('/');
  }, [authLoading, clientId, navigate]);

  // Auto-buscar empresa si llegamos con ?email= (desde QR scanner)
  useEffect(() => {
    if (authLoading || !clientId) return;
    if (autoSearchedRef.current) return;
    if (!prefilledEmail) return;
    autoSearchedRef.current = true;
    runSearch(prefilledEmail);
    searchParams.delete('email');
    setSearchParams(searchParams, { replace: true });
  }, [authLoading, clientId, prefilledEmail]);

  // Buscar negocios por categoría
  useEffect(() => {
    if (searchMode !== 'category') return;
    if (!selectedCategory && !categoryQuery.trim()) { setSearchResults([]); return; }
    setSearchingCategory(true);
    searchBusinesses({ category: selectedCategory ?? undefined, query: categoryQuery.trim() || undefined })
      .then(({ data }) => { setSearchResults(data ?? []); setSearchingCategory(false); });
  }, [selectedCategory, categoryQuery, searchMode]);

  async function handleScanResult(text: string) {
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
    setScannerOpen(false);
    setScanError(null);
    await runSearch(data.businessEmail);
  }

  function reset() {
    setEmail('');
    setErrorMsg('');
    setBusinessProfile(null);
    setCardConfig(null);
    setPreviewCard(null);
    setConfirmedCard(null);
    setCompleteCard(null);
    setValidatedReceipt(null);
    setReceiptIsMock(false);
    setShowReceiptCapture(false);
    setSelectedCategory(null);
    setCategoryQuery('');
    setSearchResults([]);
  }

  async function handleSelectBusiness(result: BusinessSearchResult) {
    await runSearch(result.email);
  }

  async function handleEmailSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await runSearch(email);
  }

  async function runSearch(searchEmail: string) {
    if (!clientId) return;
    const trimmed = searchEmail.trim();
    if (!trimmed) return;
    setErrorMsg('');
    setBusinessProfile(null); setCardConfig(null);
    setPreviewCard(null); setConfirmedCard(null); setCompleteCard(null);
    setValidatedReceipt(null); setShowReceiptCapture(false);
    setLoading(true);

    const { data: profile, error: profileError } = await findProfileByEmail(trimmed);
    if (profileError) { setErrorMsg(mapLoyaltyError(profileError)); setLoading(false); return; }
    if (!profile) { setErrorMsg('No se encontró ninguna empresa con ese correo.'); setLoading(false); return; }
    if (profile.role === 'client') { setErrorMsg('Ese correo corresponde a un cliente, no a una empresa.'); setLoading(false); return; }

    const { data: config, error: configError } = await getCardConfig(profile.id);
    if (configError) { setErrorMsg(mapLoyaltyError(configError)); setLoading(false); return; }
    if (!config) { setErrorMsg('Esta empresa aún no ha configurado su tarjeta de fidelización.'); setLoading(false); return; }

    const { data: clientCards } = await getClientCards(clientId);
    const existing = clientCards?.find((c) => c.businessId === profile.id) ?? null;

    setBusinessProfile(profile);
    setCardConfig(config);
    setPreviewCard(existing);
    setLoading(false);
  }

  async function handleConfirm() {
    if (!clientId || !businessProfile) return;
    if (!validatedReceipt) { setErrorMsg('Escanea el comprobante de compra antes de confirmar.'); return; }
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

  // ── Steps data ─────────────────────────────────────────────────────────────
  const steps = [
    { n: 1, label: 'Empresa',  done: true },
    { n: 2, label: 'Recibo',   done: !!validatedReceipt },
    { n: 3, label: 'Confirmar', done: false },
  ];

  return (
    <div className="min-h-screen bg-surface pb-32">

      {/* ── Gradient hero ──────────────────────────────────────────────────── */}
      <div className="bg-primary pt-10 pb-24 px-4">
        <div className="max-w-xl mx-auto">
          {showFlow && (
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1.5 text-white/75 hover:text-white mb-4 text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Cambiar empresa
            </button>
          )}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">
                {showFlow ? (cardConfig?.businessName ?? 'Registrar Compra') : 'Registrar Compra'}
              </h1>
              <p className="text-white/65 text-sm leading-relaxed">
                {showFlow
                  ? `${previewCurrentStamps} de ${cardConfig?.totalStamps} ${cardConfig?.totalStamps === 1 ? 'sello' : 'sellos'} acumulados`
                  : 'Acumula sellos y gana premios en tus lugares favoritos'}
              </p>
            </div>
            {!showFlow && (
              <button
                type="button"
                onClick={() => { setScanError(null); setScannerOpen(true); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all text-[13px] font-bold flex-shrink-0 mt-1"
              >
                <ScanLine className="w-4 h-4" />
                Escanear QR
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="max-w-xl mx-auto px-4 -mt-14 relative z-10 space-y-4 pb-8">
        <AnimatePresence mode="wait">

          {/* ── Search phase ──────────────────────────────────────────────── */}
          {!showFlow && !confirmedCard && !completeCard && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Mode tabs */}
              <div className="bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant/20 p-1.5 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => { setSearchMode('category'); setErrorMsg(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-label-md transition-all ${
                    searchMode === 'category'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Por sector
                </button>
                <button
                  type="button"
                  onClick={() => { setSearchMode('email'); setErrorMsg(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-label-md transition-all ${
                    searchMode === 'email'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Por correo
                </button>
              </div>

              {/* ── Category search ──────────────────────────────────────── */}
              {searchMode === 'category' && (
                <div className="space-y-4">
                  {/* Text search */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
                    <input
                      type="text"
                      value={categoryQuery}
                      onChange={(e) => setCategoryQuery(e.target.value)}
                      placeholder="Buscar negocio por nombre…"
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-2xl text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>

                  {/* Category grid — 2 columns, gradient cards */}
                  <div className="grid grid-cols-2 gap-3">
                    {CLIENT_CATEGORIES.map(({ value, label, desc, Icon, bg }) => {
                      const active = selectedCategory === value;
                      return (
                        <motion.button
                          key={value}
                          type="button"
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setSelectedCategory(active ? null : value)}
                          className={`relative overflow-hidden rounded-2xl text-left transition-all ${
                            active
                              ? 'ring-[2.5px] ring-white ring-offset-2 ring-offset-surface shadow-xl'
                              : 'shadow-sm hover:shadow-md'
                          }`}
                          style={{ height: '96px' }}
                        >
                          {/* Gradient background */}
                          <div className="absolute inset-0" style={{ background: bg }} />
                          {/* Bottom shade for text legibility */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                          {/* Content */}
                          <div className="relative z-10 p-3 h-full flex flex-col justify-between">
                            <Icon className="w-7 h-7 text-white drop-shadow" />
                            <div>
                              <p className="text-white font-bold text-[13px] leading-tight drop-shadow">{label}</p>
                              <p className="text-white/65 text-[10px] leading-tight mt-0.5">{desc}</p>
                            </div>
                          </div>
                          {/* Selected check */}
                          {active && (
                            <div className="absolute top-2 right-2 z-20 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                              <Check className="w-3 h-3 text-primary" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Error */}
                  {errorMsg && (
                    <div className="p-4 bg-error-container text-on-error-container rounded-xl" role="alert">{errorMsg}</div>
                  )}

                  {/* Loading */}
                  {searchingCategory && (
                    <div className="flex justify-center py-6">
                      <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Results */}
                  {!searchingCategory && searchResults.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest px-1">
                        {searchResults.length} {searchResults.length === 1 ? 'negocio encontrado' : 'negocios encontrados'}
                        {selectedCategory && ` · ${selectedCategory}`}
                      </p>
                      {searchResults.map((biz, idx) => (
                        <motion.button
                          key={biz.id}
                          type="button"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          onClick={() => handleSelectBusiness(biz)}
                          disabled={loading}
                          className="w-full text-left p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant hover:bg-surface-container transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            {biz.config.logoUrl ? (
                              <img
                                src={biz.config.logoUrl}
                                alt={biz.config.businessName}
                                className="w-12 h-12 rounded-xl object-cover border border-outline-variant shrink-0"
                              />
                            ) : (
                              <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black text-white shrink-0"
                                style={{ backgroundColor: biz.config.colorHex }}
                              >
                                {biz.config.businessName.slice(0, 1).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-on-surface truncate">{biz.config.businessName}</p>
                              {biz.config.category && (
                                <p className="text-body-sm text-on-surface-variant">{biz.config.category}</p>
                              )}
                              {biz.config.address && (
                                <p className="text-[11px] text-on-surface-variant truncate mt-0.5">{biz.config.address}</p>
                              )}
                            </div>
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: biz.config.colorHex }} />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {!searchingCategory && (selectedCategory || categoryQuery.trim()) && searchResults.length === 0 && (
                    <p className="text-center text-on-surface-variant py-6 text-body-sm">
                      No se encontraron negocios con esos criterios.
                    </p>
                  )}

                  {loading && (
                    <div className="flex justify-center py-4">
                      <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              )}

              {/* ── Email search ──────────────────────────────────────────── */}
              {searchMode === 'email' && (
                <form onSubmit={handleEmailSearch} className="space-y-3" noValidate>
                  <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-5 space-y-4">
                    <label className="block text-label-md text-on-surface-variant font-bold" htmlFor="bizEmail">
                      Correo de la empresa
                    </label>
                    <input
                      id="bizEmail"
                      type="email"
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                      placeholder="empresa@ejemplo.com"
                      required
                      disabled={loading}
                    />
                    {errorMsg && (
                      <div className="p-3 bg-error-container text-on-error-container rounded-xl text-body-sm" role="alert">{errorMsg}</div>
                    )}
                    <button
                      type="submit"
                      className="w-full bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                      disabled={loading || !email.trim()}
                    >
                      {loading
                        ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : 'Buscar empresa'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

          {/* ── Business flow ─────────────────────────────────────────────── */}
          {showFlow && (
            <motion.div
              key="flow"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Loyalty card */}
              <div className="bg-surface-container-lowest rounded-3xl shadow-lg border border-outline-variant/20 p-4">
                <LoyaltyCard
                  businessName={cardConfig.businessName}
                  totalStamps={cardConfig.totalStamps}
                  currentStamps={previewCurrentStamps}
                  rewardDescription={cardConfig.rewardDescription}
                  colorHex={cardConfig.colorHex}
                  cardTitle={cardConfig.cardTitle ?? null}
                  branding={{
                    logoUrl:        cardConfig.logoUrl        ?? null,
                    description:    cardConfig.description    ?? null,
                    category:       cardConfig.category       ?? null,
                    address:        cardConfig.address        ?? null,
                    website:        cardConfig.website        ?? null,
                    email:          cardConfig.email          ?? null,
                    instagram:      cardConfig.instagram      ?? null,
                    facebook:       cardConfig.facebook       ?? null,
                    cardTag:        cardConfig.cardTag        ?? 'Loyalty',
                    programType:    cardConfig.programType    ?? 'stamp_based',
                    termsOfService: cardConfig.termsOfService ?? null,
                  }}
                />
              </div>

              {/* Step indicator */}
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 px-5 py-4">
                <div className="flex items-start">
                  {steps.map((step, idx) => (
                    <div key={step.n} className="flex items-start flex-1">
                      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${
                          step.done
                            ? 'bg-primary text-on-primary shadow-sm'
                            : idx === 1 && !validatedReceipt
                              ? 'bg-surface-container-high text-on-surface border-2 border-primary/40'
                              : 'bg-surface-container-high text-on-surface-variant'
                        }`}>
                          {step.done ? <Check className="w-3.5 h-3.5" /> : step.n}
                        </div>
                        <span className={`text-[10px] font-bold whitespace-nowrap ${
                          step.done ? 'text-primary' : 'text-on-surface-variant'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                      {idx < steps.length - 1 && (
                        <div className={`flex-1 h-px mt-3.5 mx-2 transition-colors ${
                          step.done ? 'bg-primary' : 'bg-outline-variant'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Receipt section — mismo estilo que el lado empresa */}
              <div className="bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-surface-container rounded-xl shrink-0">
                      <ReceiptIcon className="w-4 h-4 text-on-surface-variant" />
                    </div>
                    <div>
                      <p className="text-body-sm font-bold text-on-surface">Comprobante de compra</p>
                      <p className="text-[11px] text-on-surface-variant">
                        {validatedReceipt ? 'Comprobante validado' : 'Requerido para confirmar'}
                      </p>
                    </div>
                  </div>
                  {!showReceiptCapture && !validatedReceipt && (
                    <button
                      type="button"
                      onClick={() => setShowReceiptCapture(true)}
                      className="flex items-center gap-1.5 text-primary text-label-md font-bold hover:underline shrink-0"
                    >
                      <Camera className="w-4 h-4" />
                      Escanear
                    </button>
                  )}
                  {validatedReceipt && (
                    <button
                      type="button"
                      onClick={() => { setValidatedReceipt(null); setShowReceiptCapture(false); }}
                      className="text-[11px] text-on-surface-variant hover:text-error transition-colors shrink-0"
                    >
                      Cambiar
                    </button>
                  )}
                </div>

                {/* Validated receipt info */}
                {validatedReceipt && (
                  <div className="flex items-start gap-2.5 p-3 bg-secondary-container text-on-secondary-container rounded-xl">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0 text-body-sm">
                      <p className="font-bold truncate">{validatedReceipt.ocrPayload.business_name ?? 'Comprobante validado'}</p>
                      <p className="opacity-80 text-[11px]">
                        Total: {validatedReceipt.ocrPayload.total ?? '—'} {validatedReceipt.ocrPayload.currency ?? ''}
                        {validatedReceipt.ocrPayload.date && ` · ${validatedReceipt.ocrPayload.date}`}
                      </p>
                    </div>
                    {receiptIsMock && (
                      <span className="text-[10px] uppercase tracking-widest bg-tertiary-container text-on-tertiary-container px-1.5 py-0.5 rounded-full font-bold shrink-0">
                        Simulacro
                      </span>
                    )}
                  </div>
                )}

                {/* ReceiptCapture inline */}
                {showReceiptCapture && clientId && (
                  <ReceiptCapture
                    businessId={businessProfile.id}
                    clientId={clientId}
                    source="client"
                    onSuccess={(r, mock) => {
                      setValidatedReceipt(r);
                      setReceiptIsMock(mock);
                      setShowReceiptCapture(false);
                      setErrorMsg('');
                    }}
                    onCancel={() => setShowReceiptCapture(false)}
                  />
                )}
              </div>

              {/* Error */}
              {errorMsg && (
                <div className="p-4 bg-error-container text-on-error-container rounded-xl" role="alert">{errorMsg}</div>
              )}

              {/* Confirm button */}
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading || !validatedReceipt}
                className="w-full py-4 rounded-2xl font-bold text-body-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-on-primary hover:opacity-90"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : !validatedReceipt ? (
                  <><Lock className="w-4 h-4" /> Escanea el comprobante primero</>
                ) : (
                  'Confirmar compra'
                )}
              </button>
            </motion.div>
          )}

          {/* ── Confirmed ─────────────────────────────────────────────────── */}
          {confirmedCard && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className="space-y-4"
              role="status"
            >
              <div className="bg-secondary-container text-on-secondary-container rounded-3xl p-6 text-center">
                <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <CheckCircle className="w-9 h-9" />
                </div>
                <h2 className="text-headline-sm font-black mb-1">¡Compra registrada!</h2>
                <p className="text-body-md opacity-80">
                  {confirmedCard.currentStamps} de {confirmedCard.totalStamps} {confirmedCard.totalStamps === 1 ? 'sello' : 'sellos'} acumulados
                </p>
              </div>
              <LoyaltyCard
                businessName={confirmedCard.businessName}
                totalStamps={confirmedCard.totalStamps}
                currentStamps={confirmedCard.currentStamps}
                rewardDescription={confirmedCard.rewardDescription}
                colorHex={confirmedCard.colorHex}
                cardId={confirmedCard.id}
              />
              <button
                type="button"
                onClick={reset}
                className="w-full py-3 border border-outline-variant rounded-2xl font-bold text-on-surface hover:bg-surface-container transition-all"
              >
                Nueva búsqueda
              </button>
            </motion.div>
          )}

          {/* ── Card complete ──────────────────────────────────────────────── */}
          {completeCard && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className="space-y-4"
              role="alert"
            >
              <div className="bg-tertiary-container text-on-tertiary-container rounded-3xl p-6 text-center">
                <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <PartyPopper className="w-9 h-9" />
                </div>
                <h2 className="text-headline-sm font-black mb-1">¡Tarjeta completa!</h2>
                <p className="text-body-md opacity-80">Ya tienes todos los sellos. ¡Reclama tu premio!</p>
              </div>
              <LoyaltyCard
                businessName={completeCard.businessName}
                totalStamps={completeCard.totalStamps}
                currentStamps={completeCard.currentStamps}
                rewardDescription={completeCard.rewardDescription}
                colorHex={completeCard.colorHex}
                cardId={completeCard.id}
              />
              <button
                type="button"
                onClick={reset}
                className="w-full py-3 border border-outline-variant rounded-2xl font-bold text-on-surface hover:bg-surface-container transition-all"
              >
                Nueva búsqueda
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <QrScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScanResult}
        title="Escanear código QR"
        subtitle="Apunta la cámara hacia el código QR de la empresa."
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
