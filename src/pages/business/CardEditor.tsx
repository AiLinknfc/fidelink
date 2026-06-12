import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { QrCode, Settings, Eye, Download, Share2, Check, X, Link as LinkIcon, Pencil, Building2, Camera, Loader2, MapPin, Globe } from 'lucide-react';
import LoyaltyCard from '@/components/loyalty/LoyaltyCard';
import { toPng } from 'html-to-image';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../../i18n/index';
import { useAuth } from '@/context/AuthContext';
import { getCardConfig, upsertCardConfig, uploadBusinessLogo, mapLoyaltyError, type CardConfig, type ProgramType } from '@/services/loyaltyService';
import { getOrCreatePrimaryQr, updateQrTarget, buildQrUrl, type QrLink } from '@/services/qrLinkService';

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_COLORS = [
  '#3525cd', '#E040FB', '#00BFA5', '#FF6D00',
  '#D50000', '#2979FF', '#FF4081', '#00E676',
  '#FFAB00', '#651FFF', '#006c49', '#213145',
];

const QR_COLORS = ['#000000', '#1e1485', '#006c49', '#684000'];

type ECLevel = 'L' | 'M' | 'Q' | 'H';

const EC_LEVELS: { value: ECLevel; label: string; desc: string }[] = [
  { value: 'L', label: 'L', desc: 'Patrón mínimo — escaneo más rápido en condiciones limpias' },
  { value: 'M', label: 'M', desc: 'Bajo — balance ideal para impresión limpia' },
  { value: 'Q', label: 'Q', desc: 'Medio — tolera pequeños daños físicos' },
  { value: 'H', label: 'H', desc: 'Alto — máxima redundancia, patrón más complejo' },
];

const CATEGORIES = ['Food & Drink', 'Retail & Shopping', 'Health & Beauty', 'Entertainment'];

const DEFAULTS = {
  businessName: '',
  colorHex: '#3525cd',
  totalStamps: 10,
  rewardDescription: 'Producto gratis',
  logoUrl: null as string | null,
  description: '',
  category: '',
  address: '',
  website: '',
  programType: 'stamp_based' as ProgramType,
  amountPerPoint: 1000,
};

interface FormState {
  businessName: string;
  colorHex: string;
  totalStamps: number;
  rewardDescription: string;
  logoUrl: string | null;
  description: string;
  category: string;
  address: string;
  website: string;
  programType: ProgramType;
  amountPerPoint: number;
}

function Spinner({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-on-surface-variant">{label}</p>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CardEditor() {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const businessId = user?.id ?? '';
  const businessEmail = user?.email ?? '';

  // Persisted form
  const [form, setForm] = useState<FormState>(DEFAULTS);

  // Visual-only settings (not in DB yet)
  const [qrColor, setQrColor] = useState('#000000');
  const [ecLevel, setEcLevel] = useState<ECLevel>('L');

  // UI state
  const [dataLoading, setDataLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // QR dinámico estable
  const [qrLink, setQrLink] = useState<QrLink | null>(null);
  const [targetUrl, setTargetUrl] = useState('');
  const [savingTarget, setSavingTarget] = useState(false);
  const [editingTarget, setEditingTarget] = useState(false);

  // Logo upload
  const logoFileRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Ref to the hidden high-res canvas used for download
  const qrDownloadRef = useRef<HTMLDivElement>(null);
  const cardExportRef = useRef<HTMLDivElement>(null);

  // ── Auth guard + data load ──────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!businessId) { navigate('/'); return; }

    let cancelled = false;
    setDataLoading(true);

    getCardConfig(businessId).then(async ({ data, error }) => {
      if (cancelled) return;
      const businessName = (!error && data?.businessName) || DEFAULTS.businessName;
      if (!error && data) {
        setForm({
          businessName: data.businessName ?? DEFAULTS.businessName,
          colorHex:     data.colorHex     ?? DEFAULTS.colorHex,
          totalStamps:  data.totalStamps  ?? DEFAULTS.totalStamps,
          rewardDescription: data.rewardDescription ?? DEFAULTS.rewardDescription,
          logoUrl:      data.logoUrl      ?? DEFAULTS.logoUrl,
          description:  data.description  ?? DEFAULTS.description,
          category:     data.category     ?? DEFAULTS.category,
          address:      data.address      ?? DEFAULTS.address,
          website:      data.website      ?? DEFAULTS.website,
          programType:  data.programType  ?? DEFAULTS.programType,
          amountPerPoint: data.amountPerPoint ?? DEFAULTS.amountPerPoint,
        });
      }
      // Carga o crea el QR principal del negocio (slug inmutable).
      const { data: qr } = await getOrCreatePrimaryQr(businessId, businessName, businessEmail);
      if (!cancelled && qr) {
        setQrLink(qr);
        setTargetUrl(qr.targetUrl);
      }
      setDataLoading(false);
    });

    return () => { cancelled = true; };
  }, [authLoading, businessId, navigate]);

  async function handleSaveTarget() {
    if (!qrLink) return;
    setSavingTarget(true);
    setErrorMsg('');
    const next = targetUrl.trim();
    if (!/^https?:\/\//i.test(next)) {
      setErrorMsg('El destino debe empezar con http:// o https://');
      setSavingTarget(false);
      return;
    }
    const { data, error } = await updateQrTarget(qrLink.slug, { targetUrl: next });
    if (error) setErrorMsg('No se pudo guardar el destino del QR.');
    else if (data) {
      setQrLink(data);
      setEditingTarget(false);
      setSuccessMsg('Destino del QR actualizado.');
    }
    setSavingTarget(false);
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleChange<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [field]: value }));
    setSuccessMsg('');
    setErrorMsg('');
  }

  async function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !businessId) return;
    setUploadingLogo(true);
    setErrorMsg('');
    const { data: url, error } = await uploadBusinessLogo(businessId, file);
    if (error || !url) {
      const raw = error?.message ?? '';
      let friendly = `No se pudo subir el logo: ${raw || 'error desconocido'}.`;
      if (raw === 'NO_SESSION') friendly = 'Tu sesión expiró. Cierra sesión y vuelve a entrar.';
      else if (/row-level security|violates|policy/i.test(raw)) friendly = 'Permiso denegado por el servidor. Falta aplicar el fix de policies de storage (ver supabase/migrations/20260518000001_fix_storage_policies.sql).';
      else if (/payload too large|too big/i.test(raw)) friendly = 'El archivo es demasiado grande. Sube un logo de menos de 1 MB.';
      else if (/mime type/i.test(raw)) friendly = 'Formato no permitido. Usa PNG o JPG.';
      setErrorMsg(friendly);
      setUploadingLogo(false);
      return;
    }
    // Persistimos de inmediato para no perder el logo si el usuario no toca "Guardar".
    const { error: saveErr } = await upsertCardConfig(businessId, {
      logoUrl: url,
      // Campos requeridos por el constraint NOT NULL al insertar por primera vez.
      businessName: form.businessName || DEFAULTS.businessName,
      colorHex: form.colorHex,
      totalStamps: form.totalStamps,
      rewardDescription: form.rewardDescription,
    } as Partial<CardConfig>);
    if (saveErr) {
      setErrorMsg('No se pudo guardar el logo.');
    } else {
      setForm(prev => ({ ...prev, logoUrl: url }));
      setSuccessMsg('Logo actualizado.');
    }
    setUploadingLogo(false);
  }

  async function handleSave() {
    if (!businessId) return;
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    const payload: Partial<CardConfig> = {
      businessName: form.businessName,
      colorHex: form.colorHex,
      totalStamps: form.totalStamps,
      rewardDescription: form.rewardDescription,
      logoUrl: form.logoUrl,
      description: form.description.trim() || null,
      category: form.category.trim() || null,
      address: form.address.trim() || null,
      website: form.website.trim() || null,
      programType: form.programType,
      amountPerPoint: form.programType === 'accumulative' ? form.amountPerPoint : null,
    };

    const { error } = await upsertCardConfig(businessId, payload);
    if (error) {
      setErrorMsg(mapLoyaltyError(error));
    } else {
      setSuccessMsg('✅ Tarjeta guardada correctamente');
    }
    setSaving(false);
  }

  function handleDownloadQR() {
    // Use the hidden 512 px canvas for high-res PNG
    const canvas = qrDownloadRef.current?.querySelector('canvas');
    if (!canvas) return;

    // White-background download canvas
    const out = document.createElement('canvas');
    const pad = 24;
    out.width  = canvas.width  + pad * 2;
    out.height = canvas.height + pad * 2;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(canvas, pad, pad);

    const link = document.createElement('a');
    link.href = out.toDataURL('image/png');
    link.download = `qr-${(form.businessName || 'fidelicard').replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleDownloadCardImage() {
    if (!cardExportRef.current) return;
    try {
      const dataUrl = await toPng(cardExportRef.current, { cacheBust: true, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `card-${(form.businessName || 'fidelicard').replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Export failed', e);
    }
  }

  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  async function handleShareQR() {
    const canvas = qrDownloadRef.current?.querySelector('canvas');
    if (!canvas) return;

    // Build padded white-bg canvas (same as download)
    const out = document.createElement('canvas');
    const pad = 24;
    out.width  = canvas.width  + pad * 2;
    out.height = canvas.height + pad * 2;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(canvas, pad, pad);

    const fileName = `qr-${(form.businessName || 'fidelicard').replace(/\s+/g, '-').toLowerCase()}.png`;

    // Try native share sheet (works great on mobile)
    if (navigator.share) {
      try {
        const blob = await new Promise<Blob>((res, rej) =>
          out.toBlob(b => b ? res(b) : rej(new Error('toBlob failed')), 'image/png')
        );
        const file = new File([blob], fileName, { type: 'image/png' });
        const shareData: ShareData = {
          title: form.businessName || 'FideliCard',
          text: `Escanea este QR para registrar compras en ${form.businessName || 'mi negocio'}`,
          files: navigator.canShare?.({ files: [file] }) ? [file] : undefined,
        };
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    // Fallback: copy the QR data URL to clipboard as image, or just the email
    try {
      const blob = await new Promise<Blob>((res, rej) =>
        out.toBlob(b => b ? res(b) : rej(new Error('toBlob failed')), 'image/png')
      );
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
    } catch {
      // Last resort: copy the email text
      await navigator.clipboard.writeText(qrValue);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Derived ─────────────────────────────────────────────────────────────────

  // El QR codifica el LINK ESTABLE (https://ailink.com.co/c/{slug}).
  // El slug nunca cambia: la empresa puede reimprimir/modificar destino sin
  // perder los QR ya entregados a clientes. (Ver ADR-001 en docs/ARCHITECTURE.md)
  const qrValue = qrLink ? buildQrUrl(qrLink.slug) : (businessEmail || 'fidelicard@example.com');

  const progress = form.totalStamps > 0 ? Math.min((8 / form.totalStamps) * 100, 100) : 80;
  const selectedEc = EC_LEVELS.find(l => l.value === ecLevel)!;

  // ── Guards ──────────────────────────────────────────────────────────────────
  if (authLoading || dataLoading) return <Spinner label="Cargando configuración…" />;
  if (!businessId) return null;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-surface min-h-screen">
      {/* Hidden high-res QR canvas for download (off-screen, not display:none) */}
      <div
        ref={qrDownloadRef}
        style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
        aria-hidden="true"
      >
        <QRCodeCanvas
          value={qrValue}
          size={512}
          level={ecLevel}
          fgColor={qrColor}
          bgColor="#ffffff"
          includeMargin={false}
        />
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* ── Left: Editor Controls ─────────────────────────────────────── */}
          <section className="lg:col-span-7 space-y-10">
            <div>
              <h2 className="text-headline-lg text-on-surface font-bold">Card Design Studio</h2>
              <p className="text-body-lg text-on-surface-variant mt-2">
                Configura tu programa de fidelización y personaliza su identidad visual.
              </p>
            </div>

            {/* Config Bento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Card Identity */}
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30 space-y-6">
                <label className="text-label-md font-bold text-primary uppercase tracking-widest">Card Identity</label>

                <div className="space-y-2">
                  <span className="text-body-sm font-semibold text-on-surface-variant">Nombre del negocio</span>
                  <input
                    value={form.businessName}
                    onChange={e => handleChange('businessName', e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-body-md outline-none transition-all"
                    placeholder="Ej. Café Central"
                    type="text"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-body-sm font-semibold text-on-surface-variant">Categoría</span>
                  <select
                    value={form.category}
                    onChange={e => handleChange('category', e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant focus:border-primary rounded-xl px-4 py-3 text-body-md outline-none transition-all"
                  >
                    <option value="">Sin categoría</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Points Engine */}
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30 space-y-6">
                <label className="text-label-md font-bold text-primary uppercase tracking-widest">Points Engine</label>

                <div className="space-y-2">
                  <span className="text-body-sm font-semibold text-on-surface-variant">Tipo de sistema</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleChange('programType', 'stamp_based')}
                      className={`flex-1 px-3 py-2 rounded-lg text-label-md font-bold transition-all ${
                        form.programType === 'stamp_based'
                          ? 'bg-primary text-white shadow-md'
                          : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      Stamp Based
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('programType', 'accumulative')}
                      className={`flex-1 px-3 py-2 rounded-lg text-label-md font-bold transition-all ${
                        form.programType === 'accumulative'
                          ? 'bg-primary text-white shadow-md'
                          : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      Acumulativo
                    </button>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-snug">
                    {form.programType === 'stamp_based'
                      ? '1 compra otorga 1 sello — independiente del monto. Ideal para cafés, salones, etc.'
                      : 'Cada compra otorga puntos según su monto. Ideal para retail con tickets variables.'}
                  </p>
                </div>

                {form.programType === 'accumulative' && (
                  <div className="space-y-2">
                    <span className="text-body-sm font-semibold text-on-surface-variant">
                      Monto por punto <span className="text-on-surface-variant/70">(unidad local)</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-body-md text-on-surface-variant">$</span>
                      <input
                        type="number"
                        min={1}
                        step={100}
                        value={form.amountPerPoint}
                        onChange={e => handleChange('amountPerPoint', Math.max(1, Number(e.target.value) || 1))}
                        className="flex-1 bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-body-md outline-none transition-all"
                      />
                      <span className="text-body-sm text-on-surface-variant whitespace-nowrap">= 1 pt</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant">
                      Ej: con valor <strong>{form.amountPerPoint}</strong>, una compra de ${(form.amountPerPoint * 5).toLocaleString()} otorga 5 puntos.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-body-sm font-semibold text-on-surface-variant">
                    {form.programType === 'stamp_based' ? 'Sellos para recompensa' : 'Puntos para recompensa'}:{' '}
                    <strong className="text-primary">{form.totalStamps}</strong>
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={form.programType === 'stamp_based' ? 20 : 100}
                    value={form.totalStamps}
                    onChange={e => handleChange('totalStamps', Number(e.target.value))}
                    className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-on-surface-variant font-bold">
                    <span>1</span>
                    <span>{form.programType === 'stamp_based' ? 20 : 100}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-body-sm font-semibold text-on-surface-variant">Recompensa</span>
                  <input
                    value={form.rewardDescription}
                    onChange={e => handleChange('rewardDescription', e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-body-md outline-none transition-all"
                    placeholder="Ej. Producto gratis"
                    type="text"
                  />
                </div>
              </div>
            </div>

            {/* Brand Identity — aparece en el reverso de la tarjeta del cliente */}
            <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="text-primary w-6 h-6" />
                <h3 className="text-headline-sm font-bold">Identidad de Marca</h3>
              </div>
              <p className="text-body-sm text-on-surface-variant mb-6">
                Estos datos se muestran al reverso de la tarjeta del cliente cuando la gira.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Logo */}
                <div className="space-y-3">
                  <label className="text-body-sm font-semibold text-on-surface-variant">Logo</label>
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      {form.logoUrl ? (
                        <img
                          src={form.logoUrl}
                          alt="Logo"
                          className="w-28 h-28 rounded-2xl object-cover shadow-md border border-outline-variant bg-white"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-2xl bg-surface-container-low border border-dashed border-outline-variant flex items-center justify-center text-on-surface-variant">
                          <Building2 className="w-8 h-8" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => logoFileRef.current?.click()}
                        disabled={uploadingLogo}
                        className="absolute -bottom-2 -right-2 bg-primary text-on-primary p-2 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                        aria-label="Subir logo"
                      >
                        {uploadingLogo ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </button>
                      <input
                        ref={logoFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </div>
                    <p className="text-[11px] text-on-surface-variant text-center">
                      PNG o JPG. Se sube al instante.
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-body-sm font-semibold text-on-surface-variant">
                    Descripción
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => handleChange('description', e.target.value)}
                    rows={4}
                    maxLength={240}
                    placeholder="Cuenta a tus clientes qué te hace especial (máx. 240 caracteres)"
                    className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-body-md outline-none transition-all resize-none"
                  />
                  <p className="text-[11px] text-on-surface-variant text-right">
                    {form.description.length} / 240
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Address */}
                <div className="space-y-2">
                  <label className="text-body-sm font-semibold text-on-surface-variant flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={e => handleChange('address', e.target.value)}
                    placeholder="Calle 123 #45-67, Ciudad"
                    className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-body-md outline-none transition-all"
                  />
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <label className="text-body-sm font-semibold text-on-surface-variant flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" />
                    Sitio web
                  </label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={e => handleChange('website', e.target.value)}
                    placeholder="https://mi-negocio.com"
                    className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-body-md outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* QR Customization */}
            <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30">
              <div className="flex items-center gap-3 mb-8">
                <QrCode className="text-primary w-6 h-6" />
                <h3 className="text-headline-sm font-bold">QR Style Customization</h3>
              </div>

              {/* QR link info */}
              <div className="mb-6 space-y-3">
                <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <LinkIcon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-body-sm font-bold text-on-surface">Link estable del QR</p>
                      <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                        no cambia jamás
                      </span>
                    </div>
                    <p className="text-body-sm font-mono text-primary mt-1 break-all">{qrValue}</p>
                    <p className="text-[11px] text-on-surface-variant mt-1">
                      El QR siempre apuntará a este link. Puedes cambiar el destino real cuantas veces quieras sin reimprimir.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-surface-container rounded-xl">
                  <Settings className="w-4 h-4 text-on-surface-variant mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-body-sm font-bold text-on-surface">Destino actual</p>
                      {!editingTarget && (
                        <button
                          type="button"
                          onClick={() => setEditingTarget(true)}
                          className="text-primary text-label-md font-bold hover:underline flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3" />
                          Editar
                        </button>
                      )}
                    </div>
                    {editingTarget ? (
                      <div className="flex gap-2 mt-1">
                        <input
                          type="url"
                          value={targetUrl}
                          onChange={(e) => setTargetUrl(e.target.value)}
                          placeholder="https://tu-pagina.com/promo"
                          className="flex-1 px-3 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={handleSaveTarget}
                          disabled={savingTarget || !targetUrl.trim() || targetUrl === qrLink?.targetUrl}
                          className="px-3 py-2 bg-primary text-on-primary rounded-lg text-label-md font-bold disabled:opacity-40"
                        >
                          {savingTarget ? '…' : 'Guardar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditingTarget(false); setTargetUrl(qrLink?.targetUrl ?? ''); }}
                          className="px-3 py-2 border border-outline-variant rounded-lg text-label-md"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <p className="text-body-sm text-on-surface-variant font-mono break-all">
                        {qrLink?.targetUrl ?? '—'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Card Color */}
                <div className="space-y-3">
                  <label className="text-body-sm font-semibold text-on-surface-variant">Color de tarjeta</label>
                  <div className="grid grid-cols-4 gap-2">
                    {CARD_COLORS.map(color => (
                      <button
                        key={color} type="button"
                        style={{ backgroundColor: color }}
                        onClick={() => handleChange('colorHex', color)}
                        className={`w-9 h-9 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform ${
                          form.colorHex === color ? 'ring-2 ring-primary ring-offset-2' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* QR Color */}
                <div className="space-y-3">
                  <label className="text-body-sm font-semibold text-on-surface-variant">Color del QR</label>
                  <div className="flex gap-2.5">
                    {QR_COLORS.map(color => (
                      <button
                        key={color} type="button"
                        style={{ backgroundColor: color }}
                        onClick={() => setQrColor(color)}
                        className={`w-9 h-9 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform ${
                          qrColor === color ? 'ring-2 ring-primary ring-offset-2' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Error Correction Level */}
                <div className="space-y-3">
                  <label className="text-body-sm font-semibold text-on-surface-variant">
                    Corrección de error
                  </label>
                  <div className="flex gap-1.5">
                    {EC_LEVELS.map(({ value, label }) => (
                      <button
                        key={value} type="button"
                        onClick={() => setEcLevel(value)}
                        className={`flex-1 py-2 rounded-lg text-label-md font-bold transition-all ${
                          ecLevel === value
                            ? 'bg-primary text-white shadow-md'
                            : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-snug">
                    {selectedEc.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Save */}
            <div className="space-y-4">
              {successMsg && (
                <div className="p-4 bg-secondary-container text-on-secondary-container rounded-xl text-body-md">
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="p-4 bg-error-container text-on-error-container rounded-xl text-body-md">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center justify-between p-6 bg-primary/5 rounded-2xl border border-primary/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-body-md font-bold text-on-surface">Guardar configuración</p>
                    <p className="text-body-sm text-on-surface-variant">
                      Los cambios se aplican a todos los clientes nuevos
                    </p>
                  </div>
                </div>
                <button
                  type="button" onClick={handleSave}
                  disabled={saving || !form.businessName.trim()}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                >
                  {saving
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : 'Guardar'}
                </button>
              </div>
            </div>
          </section>

          {/* ── Right: Live Preview ───────────────────────────────────────── */}
          <aside className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="bg-surface-container p-8 md:p-10 rounded-[32px] flex flex-col items-center gap-8 shadow-inner">

              <div className="w-full flex justify-between items-center px-2">
                <span className="text-label-md font-bold text-on-surface-variant tracking-widest uppercase">
                  Live Preview
                </span>
              </div>

              {/* Card front */}
              <motion.div
                layout
                ref={cardExportRef}
                className="card-shine-trigger w-full max-w-[340px] aspect-[1.58/1] rounded-[24px] p-6 text-white shadow-2xl relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${form.colorHex}ee, ${form.colorHex}99)`,
                }}
              >
                <div
                  className="absolute -top-[20%] -right-[10%] w-48 h-48 rounded-full blur-3xl opacity-40"
                  style={{ backgroundColor: '#ffffff' }}
                />
                <div className="card-shine" aria-hidden="true" />
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h4 className="text-headline-sm font-bold truncate max-w-[180px]">
                      {form.businessName || 'Tu negocio'}
                    </h4>
                    <p className="text-label-md opacity-80 uppercase tracking-widest mt-1">
                      Loyalty Rewards
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                    <QrCode className="w-6 h-6" />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6 z-10">
                  <div className="flex justify-between items-end mb-2.5">
                    <span className="text-label-md font-bold opacity-80">PROGRESS</span>
                    <span className="text-body-md font-bold">8 / {form.totalStamps} STAMPS</span>
                  </div>
                  <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white/80"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ type: 'spring', stiffness: 50 }}
                    />
                  </div>
                  <p className="mt-4 text-[13px] font-bold opacity-80 truncate">
                    {form.rewardDescription || 'Recompensa'}
                  </p>
                </div>
              </motion.div>

              {/* Card back: real QR */}
              <div className="w-full max-w-[340px] bg-white rounded-[24px] p-8 shadow-xl flex flex-col items-center gap-5 border border-outline-variant/10">
                <div className="bg-surface-container-low rounded-2xl p-4 flex items-center justify-center">
                  {/* Visible SVG QR */}
                  <QRCodeSVG
                    value={qrValue}
                    size={160}
                    level={ecLevel}
                    fgColor={qrColor}
                    bgColor="transparent"
                    includeMargin={false}
                  />
                </div>
                <div className="text-center space-y-1 w-full">
                  <p className="text-body-md font-bold text-on-surface">
                    Escanear para registrar compra
                  </p>
                  <p className="text-body-sm text-on-surface-variant font-mono truncate" title={qrValue}>
                    {qrValue}
                  </p>
                  <p className="text-[11px] text-on-surface-variant">
                    Nivel <strong className="text-primary">{ecLevel}</strong>
                    {' — '}{selectedEc.desc.split(' — ')[0]}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={handleDownloadQR}
                  className="flex-1 bg-white/50 backdrop-blur-sm text-on-surface-variant py-3.5 rounded-xl font-bold text-label-md flex items-center justify-center gap-2 hover:bg-white transition-all shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  DESCARGAR
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCardImage}
                  className="flex-1 bg-white/50 backdrop-blur-sm text-on-surface-variant py-3.5 rounded-xl font-bold text-label-md flex items-center justify-center gap-2 hover:bg-white transition-all shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  DESCARGAR TARJETA
                </button>
                <button
                  type="button"
                  onClick={handleShareQR}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-label-md flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
                    copied
                      ? 'bg-secondary text-white'
                      : 'bg-primary text-white hover:opacity-90'
                  }`}
                >
                  {copied ? (
                    <><Check className="w-4 h-4" />COPIADO</>
                  ) : (
                    <><Share2 className="w-4 h-4" />COMPARTIR</>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="w-full bg-white/50 backdrop-blur-sm text-on-surface-variant py-3.5 rounded-xl font-bold text-label-md flex items-center justify-center gap-2 hover:bg-white transition-all shadow-sm border border-outline-variant/30"
              >
                <Eye className="w-4 h-4" />
                VISTA PREVIA COMPLETA
              </button>
            </div>
          </aside>

        </div>
      </main>

      {/* ── Full Card Preview Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
      {showPreview && (
        <motion.div
          key="card-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <motion.div
            key="card-modal-panel"
            initial={{ opacity: 0, scale: 0.88, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 22, delay: 0.07 } }}
            exit={{ opacity: 0, scale: 0.92, y: 16, transition: { duration: 0.18, ease: 'easeIn' } }}
            className="bg-surface-container-lowest rounded-[32px] p-6 w-full max-w-sm shadow-2xl flex flex-col gap-5"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-headline-sm font-bold text-on-surface">Vista previa</h3>
                <p className="text-body-sm text-on-surface-variant mt-0.5">Toca la tarjeta para girarla</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Flippable card */}
            <LoyaltyCard
              businessName={form.businessName || 'Tu negocio'}
              totalStamps={form.totalStamps}
              currentStamps={Math.floor(form.totalStamps * 0.6)}
              rewardDescription={form.rewardDescription || 'Premio gratis'}
              colorHex={form.colorHex}
              cardId="PREVIEW"
              branding={{
                logoUrl: form.logoUrl,
                description: form.description || null,
                category: form.category || null,
                address: form.address || null,
                website: form.website || null,
                programType: form.programType,
              }}
            />

            {/* QR actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDownloadQR}
                className="flex-1 bg-surface-container text-on-surface-variant py-3 rounded-xl font-bold text-label-md flex items-center justify-center gap-2 hover:bg-surface-container-high transition-all"
              >
                <Download className="w-4 h-4" />
                Descargar QR
              </button>
              <button
                type="button"
                onClick={handleShareQR}
                className={`flex-1 py-3 rounded-xl font-bold text-label-md flex items-center justify-center gap-2 transition-all ${
                  copied ? 'bg-secondary text-white' : 'bg-primary text-white hover:opacity-90'
                }`}
              >
                {copied ? (
                  <><Check className="w-4 h-4" />Copiado</>
                ) : (
                  <><Share2 className="w-4 h-4" />Compartir QR</>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
