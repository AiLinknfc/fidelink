import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ChevronLeft, ChevronRight, Check, Loader2, Camera, Building2,
  Sparkles, Palette, Star, Trophy, MapPin, Globe, Tag,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getCardConfig, upsertCardConfig, uploadBusinessLogo,
  mapLoyaltyError, type CardConfig,
} from '@/services/loyaltyService';
import { getOrCreatePrimaryQr } from '@/services/qrLinkService';
import LoyaltyCard from './LoyaltyCard';

interface CreateProgramWizardProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const CATEGORIES = ['Food & Drink', 'Retail & Shopping', 'Health & Beauty', 'Entertainment', 'Services', 'Other'];

const CARD_COLORS = [
  '#3525cd', '#E040FB', '#00BFA5', '#FF6D00',
  '#D50000', '#2979FF', '#FF4081', '#00E676',
  '#FFAB00', '#651FFF', '#006c49', '#213145',
];

type FormState = {
  businessName: string;
  category: string;
  colorHex: string;
  logoUrl: string | null;
  description: string;
  totalStamps: number;
  rewardDescription: string;
  address: string;
  website: string;
};

const INITIAL: FormState = {
  businessName: '',
  category: '',
  colorHex: '#3525cd',
  logoUrl: null,
  description: '',
  totalStamps: 10,
  rewardDescription: 'Producto gratis',
  address: '',
  website: '',
};

const STEPS = [
  { key: 'identity',  title: 'Identidad',   icon: Building2, hint: 'Cómo se llama y qué hace tu negocio' },
  { key: 'visual',    title: 'Estilo',      icon: Palette,   hint: 'Color, logo y descripción' },
  { key: 'mechanic',  title: 'Mecánica',    icon: Star,      hint: 'Cuántos sellos y qué recompensa' },
  { key: 'contact',   title: 'Contacto',    icon: MapPin,    hint: 'Dónde te encuentran (opcional)' },
  { key: 'review',    title: 'Resumen',     icon: Trophy,    hint: 'Revisa y crea el programa' },
] as const;

export default function CreateProgramWizard({ open, onClose, onCreated }: CreateProgramWizardProps) {
  const { user } = useAuth();
  const businessId = user?.id ?? '';
  const logoFileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // Carga inicial: si ya existe config, prefilear (el wizard también sirve para "rehacer").
  useEffect(() => {
    if (!open || !businessId) return;
    setStep(0);
    setError('');
    setDone(false);
    setLoading(true);

    getCardConfig(businessId).then(({ data }) => {
      if (data) {
        setForm({
          businessName:      data.businessName      ?? INITIAL.businessName,
          category:          data.category          ?? INITIAL.category,
          colorHex:          data.colorHex          ?? INITIAL.colorHex,
          logoUrl:           data.logoUrl           ?? INITIAL.logoUrl,
          description:       data.description       ?? INITIAL.description,
          totalStamps:       data.totalStamps       ?? INITIAL.totalStamps,
          rewardDescription: data.rewardDescription ?? INITIAL.rewardDescription,
          address:           data.address           ?? INITIAL.address,
          website:           data.website           ?? INITIAL.website,
        });
      } else {
        setForm(INITIAL);
      }
      setLoading(false);
    });
  }, [open, businessId]);

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  }

  async function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !businessId) return;
    setUploadingLogo(true);
    setError('');
    const { data: url, error: upErr } = await uploadBusinessLogo(businessId, file);
    if (upErr || !url) {
      const raw = upErr?.message ?? '';
      let friendly = `No se pudo subir el logo: ${raw || 'error desconocido'}.`;
      if (raw === 'NO_SESSION') friendly = 'Tu sesión expiró. Cierra sesión y vuelve a entrar.';
      else if (/row-level security|violates|policy/i.test(raw)) friendly = 'Permiso denegado por el servidor. Falta aplicar el fix de policies de storage (ver supabase/migrations/20260518000001_fix_storage_policies.sql).';
      else if (/payload too large|too big/i.test(raw)) friendly = 'El archivo es demasiado grande. Sube un logo de menos de 1 MB.';
      else if (/mime type/i.test(raw)) friendly = 'Formato no permitido. Usa PNG o JPG.';
      setError(friendly);
    } else {
      update('logoUrl', url);
    }
    setUploadingLogo(false);
  }

  const isLast = step === STEPS.length - 1;

  function canAdvance(): boolean {
    if (step === 0) return form.businessName.trim().length > 0;
    if (step === 2) return form.rewardDescription.trim().length > 0 && form.totalStamps >= 1 && form.totalStamps <= 20;
    return true;
  }

  async function handleCreate() {
    if (!businessId) return;
    setSubmitting(true);
    setError('');

    const payload: Partial<CardConfig> = {
      businessName: form.businessName.trim(),
      colorHex: form.colorHex,
      totalStamps: form.totalStamps,
      rewardDescription: form.rewardDescription.trim(),
      logoUrl: form.logoUrl,
      description: form.description.trim() || null,
      category: form.category.trim() || null,
      address: form.address.trim() || null,
      website: form.website.trim() || null,
    };

    const { error: cfgErr } = await upsertCardConfig(businessId, payload);
    if (cfgErr) {
      setError(mapLoyaltyError(cfgErr));
      setSubmitting(false);
      return;
    }

    // Garantizar QR principal (idempotente).
    await getOrCreatePrimaryQr(businessId, payload.businessName ?? '', user?.email ?? null);
    setDone(true);
    setSubmitting(false);
    onCreated?.();
  }

  function handleNext() {
    if (!canAdvance()) {
      setError('Completa los campos requeridos antes de continuar.');
      return;
    }
    if (isLast) {
      handleCreate();
    } else {
      setStep(s => Math.min(s + 1, STEPS.length - 1));
    }
  }

  function handleBack() {
    setError('');
    setStep(s => Math.max(s - 1, 0));
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 md:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="bg-surface-container-lowest w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <header className="px-6 md:px-8 py-5 border-b border-outline-variant flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-primary-container text-on-primary-container rounded-xl shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-headline-sm font-bold text-on-surface">
                    {done ? '¡Programa creado!' : 'Nuevo programa de fidelización'}
                  </h2>
                  <p className="text-body-sm text-on-surface-variant truncate">
                    {done ? 'Tu tarjeta y QR estable están listos para usar.' : STEPS[step].hint}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Stepper */}
            {!done && (
              <div className="px-6 md:px-8 py-4 border-b border-outline-variant overflow-x-auto">
                <div className="flex items-center gap-2 min-w-max">
                  {STEPS.map((s, i) => {
                    const Active = i === step;
                    const Done = i < step;
                    return (
                      <div key={s.key} className="flex items-center gap-2">
                        <div
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-label-md font-bold transition-all ${
                            Active
                              ? 'bg-primary text-on-primary shadow-md'
                              : Done
                                ? 'bg-secondary-container text-on-secondary-container'
                                : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {Done ? <Check className="w-3.5 h-3.5" /> : <s.icon className="w-3.5 h-3.5" />}
                          <span>{s.title}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`w-6 h-px ${Done ? 'bg-secondary' : 'bg-outline-variant'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : done ? (
                <DoneScreen form={form} onClose={onClose} />
              ) : (
                <>
                  {step === 0 && <StepIdentity form={form} update={update} />}
                  {step === 1 && (
                    <StepVisual
                      form={form}
                      update={update}
                      uploadingLogo={uploadingLogo}
                      onLogoClick={() => logoFileRef.current?.click()}
                    />
                  )}
                  {step === 2 && <StepMechanic form={form} update={update} />}
                  {step === 3 && <StepContact form={form} update={update} />}
                  {step === 4 && <StepReview form={form} />}

                  <input
                    ref={logoFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />

                  {error && (
                    <div className="mt-6 p-3 bg-error-container text-on-error-container rounded-xl text-body-sm">
                      {error}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {!done && (
              <footer className="px-6 md:px-8 py-4 border-t border-outline-variant flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 0 || submitting}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-label-md font-bold text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Atrás
                </button>
                <p className="text-label-md text-on-surface-variant hidden sm:block">
                  Paso {step + 1} de {STEPS.length}
                </p>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={submitting || !canAdvance()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-label-md font-bold shadow-md hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isLast ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Crear programa
                    </>
                  ) : (
                    <>
                      Siguiente
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </footer>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Step components ────────────────────────────────────────────────────────

function StepIdentity({
  form, update,
}: { form: FormState; update: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h3 className="text-headline-sm font-bold text-on-surface">¿Cómo se llama tu negocio?</h3>
        <p className="text-body-sm text-on-surface-variant">Aparecerá en la cara frontal de la tarjeta del cliente.</p>
      </div>
      <div className="space-y-2">
        <label className="text-body-sm font-semibold text-on-surface-variant">Nombre del negocio *</label>
        <input
          type="text"
          value={form.businessName}
          onChange={e => update('businessName', e.target.value)}
          placeholder="Ej. Café Central"
          className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-body-md outline-none transition-all"
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <label className="text-body-sm font-semibold text-on-surface-variant flex items-center gap-2">
          <Tag className="w-3.5 h-3.5" />
          Categoría
        </label>
        <select
          value={form.category}
          onChange={e => update('category', e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant focus:border-primary rounded-xl px-4 py-3 text-body-md outline-none transition-all"
        >
          <option value="">Sin categoría</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
}

function StepVisual({
  form, update, uploadingLogo, onLogoClick,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  uploadingLogo: boolean;
  onLogoClick: () => void;
}) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-headline-sm font-bold text-on-surface">Dale identidad visual</h3>
        <p className="text-body-sm text-on-surface-variant">Color, logo y una descripción corta.</p>
      </div>

      {/* Color */}
      <div className="space-y-2">
        <label className="text-body-sm font-semibold text-on-surface-variant">Color de tarjeta</label>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
          {CARD_COLORS.map(color => (
            <button
              key={color}
              type="button"
              style={{ backgroundColor: color }}
              onClick={() => update('colorHex', color)}
              className={`w-10 h-10 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform ${
                form.colorHex === color ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              aria-label={color}
            />
          ))}
        </div>
      </div>

      {/* Logo + Description */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-body-sm font-semibold text-on-surface-variant">Logo (opcional)</label>
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              {form.logoUrl ? (
                <img
                  src={form.logoUrl}
                  alt="Logo"
                  className="w-24 h-24 rounded-2xl object-cover shadow-md border border-outline-variant bg-white"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-surface-container-low border border-dashed border-outline-variant flex items-center justify-center text-on-surface-variant">
                  <Building2 className="w-7 h-7" />
                </div>
              )}
              <button
                type="button"
                onClick={onLogoClick}
                disabled={uploadingLogo}
                className="absolute -bottom-2 -right-2 bg-primary text-on-primary p-2 rounded-full shadow-lg disabled:opacity-60"
                aria-label="Subir logo"
              >
                {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-on-surface-variant text-center">Se sube al instante.</p>
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-body-sm font-semibold text-on-surface-variant">Descripción</label>
          <textarea
            value={form.description}
            onChange={e => update('description', e.target.value)}
            rows={4}
            maxLength={240}
            placeholder="Qué hace especial a tu negocio (máx. 240 caracteres)"
            className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-body-md outline-none resize-none transition-all"
          />
          <p className="text-[11px] text-on-surface-variant text-right">
            {form.description.length} / 240
          </p>
        </div>
      </div>
    </div>
  );
}

function StepMechanic({
  form, update,
}: { form: FormState; update: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-headline-sm font-bold text-on-surface">Define la mecánica</h3>
        <p className="text-body-sm text-on-surface-variant">Cuántos sellos junta el cliente y qué se gana.</p>
      </div>

      <div className="space-y-3">
        <label className="text-body-sm font-semibold text-on-surface-variant">
          Sellos para recompensa: <strong className="text-primary">{form.totalStamps}</strong>
        </label>
        <input
          type="range"
          min={1}
          max={20}
          value={form.totalStamps}
          onChange={e => update('totalStamps', Number(e.target.value))}
          className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[11px] text-on-surface-variant font-bold">
          <span>1</span><span>10</span><span>20</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-body-sm font-semibold text-on-surface-variant">Recompensa *</label>
        <input
          type="text"
          value={form.rewardDescription}
          onChange={e => update('rewardDescription', e.target.value)}
          placeholder="Ej. Café gratis, 20% de descuento"
          className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-body-md outline-none transition-all"
        />
      </div>
    </div>
  );
}

function StepContact({
  form, update,
}: { form: FormState; update: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h3 className="text-headline-sm font-bold text-on-surface">¿Dónde te encuentran?</h3>
        <p className="text-body-sm text-on-surface-variant">Estos datos se muestran al reverso de la tarjeta. Todo es opcional.</p>
      </div>

      <div className="space-y-2">
        <label className="text-body-sm font-semibold text-on-surface-variant flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5" />
          Dirección
        </label>
        <input
          type="text"
          value={form.address}
          onChange={e => update('address', e.target.value)}
          placeholder="Calle 123 #45-67, Ciudad"
          className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-body-md outline-none transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-body-sm font-semibold text-on-surface-variant flex items-center gap-2">
          <Globe className="w-3.5 h-3.5" />
          Sitio web
        </label>
        <input
          type="url"
          value={form.website}
          onChange={e => update('website', e.target.value)}
          placeholder="https://mi-negocio.com"
          className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-body-md outline-none transition-all"
        />
      </div>
    </div>
  );
}

function StepReview({ form }: { form: FormState }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-headline-sm font-bold text-on-surface">Listo para crear</h3>
        <p className="text-body-sm text-on-surface-variant">
          Esta es la tarjeta que verán tus clientes. Vamos a generar también un QR estable que nunca cambia.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-surface-container rounded-2xl p-6 flex justify-center">
          <div className="w-full max-w-sm">
            <LoyaltyCard
              businessName={form.businessName || 'Tu negocio'}
              totalStamps={form.totalStamps}
              currentStamps={Math.min(3, form.totalStamps)}
              rewardDescription={form.rewardDescription || 'Recompensa'}
              colorHex={form.colorHex}
            />
          </div>
        </div>

        <div className="space-y-2 text-body-sm">
          <SummaryRow label="Nombre" value={form.businessName} />
          <SummaryRow label="Categoría" value={form.category || '—'} />
          <SummaryRow label="Sellos" value={`${form.totalStamps}`} />
          <SummaryRow label="Recompensa" value={form.rewardDescription} />
          <SummaryRow label="Descripción" value={form.description || '—'} />
          <SummaryRow label="Dirección" value={form.address || '—'} />
          <SummaryRow label="Sitio web" value={form.website || '—'} />
          <SummaryRow label="Logo" value={form.logoUrl ? 'Subido ✓' : 'Sin logo'} />
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 px-3 py-2 bg-surface-container rounded-lg">
      <span className="text-on-surface-variant font-semibold">{label}</span>
      <span className="text-on-surface font-bold truncate text-right max-w-[60%]" title={value}>{value}</span>
    </div>
  );
}

function DoneScreen({ form, onClose }: { form: FormState; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-6 space-y-5">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 14 }}
        className="w-20 h-20 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-md"
      >
        <Check className="w-10 h-10" />
      </motion.div>
      <div>
        <h3 className="text-headline-sm font-bold">¡Programa listo!</h3>
        <p className="text-body-sm text-on-surface-variant mt-1">
          <strong>{form.businessName}</strong> ya puede empezar a entregar sellos.
        </p>
      </div>
      <div className="w-full max-w-sm">
        <LoyaltyCard
          businessName={form.businessName}
          totalStamps={form.totalStamps}
          currentStamps={0}
          rewardDescription={form.rewardDescription}
          colorHex={form.colorHex}
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl text-label-md font-bold border border-outline-variant text-on-surface hover:bg-surface-container transition-colors"
        >
          Cerrar
        </button>
        <a
          href="/business/card-editor"
          className="px-5 py-2.5 rounded-xl text-label-md font-bold bg-primary text-on-primary hover:opacity-90 transition-opacity"
        >
          Editar detalles
        </a>
      </div>
    </div>
  );
}
