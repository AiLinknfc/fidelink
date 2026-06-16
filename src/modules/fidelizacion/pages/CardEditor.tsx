import { useState, useEffect, useRef, type ChangeEvent, type ComponentType } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { QrCode, Settings, Eye, Download, Share2, Check, X, Link as LinkIcon, Pencil, Building2, Camera, Loader2, MapPin, Globe, Coffee, ShoppingBag, Ticket, Heart, Star, Utensils, Gem, Monitor, ShoppingCart, Scissors, Dumbbell, Crown } from 'lucide-react';
import LoyaltyCard, { STAMP_ICON_OPTIONS } from '../components/LoyaltyCard';
import RealisticCard from '@/components/wallet/RealisticCard';
import { toPng, toSvg, toBlob } from 'html-to-image';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '@/i18n/index';
import { useAuth } from '@/context/AuthContext';
import { getCardConfig, upsertCardConfig, uploadBusinessLogo, mapLoyaltyError, type CardConfig, type ProgramType } from '@/services/loyaltyService';
import { getOrCreatePrimaryQr, updateQrTarget, buildQrUrl, type QrLink } from '@/services/qrLinkService';
import SectionRibbon from '@/platform/ui/SectionRibbon';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_COLORS = ['#3525cd', '#006c49', '#FF6D00'];

const QR_COLORS = ['#000000', '#3525cd', '#684000'];

type ECLevel = 'L' | 'M' | 'Q' | 'H';

const EC_LEVELS: { value: ECLevel; label: string; desc: string }[] = [
  { value: 'L', label: 'L', desc: 'Patrón mínimo — escaneo más rápido en condiciones limpias' },
  { value: 'M', label: 'M', desc: 'Bajo — balance ideal para impresión limpia' },
  { value: 'Q', label: 'Q', desc: 'Medio — tolera pequeños daños físicos' },
  { value: 'H', label: 'H', desc: 'Alto — máxima redundancia, patrón más complejo' },
];

const CATEGORIES: { value: string; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'Cafetería y Bar',  label: 'Cafetería y Bar',  Icon: Coffee      },
  { value: 'Restaurante',      label: 'Restaurante',      Icon: Utensils    },
  { value: 'Moda y Joyas',     label: 'Moda y Joyas',     Icon: Gem         },
  { value: 'Tecnología',       label: 'Tecnología',       Icon: Monitor     },
  { value: 'Entretenimiento',  label: 'Entretenimiento',  Icon: Ticket      },
  { value: 'Tienda',           label: 'Tienda',           Icon: ShoppingCart },
  { value: 'Salud',            label: 'Salud',            Icon: Heart       },
  { value: 'Belleza',          label: 'Belleza',          Icon: Scissors    },
  { value: 'Gimnasio',         label: 'Gimnasio',         Icon: Dumbbell    },
  { value: 'Servicios VIP',    label: 'Servicios VIP',    Icon: Crown       },
];

const CATEGORY_TO_ICON: Record<string, string> = {
  'Cafetería y Bar':  'Coffee',
  'Restaurante':      'Coffee',
  'Moda y Joyas':     'ShoppingBag',
  'Tecnología':       'Star',
  'Entretenimiento':  'Ticket',
  'Tienda':           'ShoppingBag',
  'Salud':            'Heart',
  'Belleza':          'Heart',
  'Gimnasio':         'Heart',
  'Servicios VIP':    'Star',
};
const ICON_TO_CATEGORY: Record<string, string> = {
  Coffee: 'Cafetería y Bar', Heart: 'Salud',
  ShoppingBag: 'Tienda', Ticket: 'Entretenimiento', Star: 'Servicios VIP',
};

const CARD_TYPE_DETAILS = {
  Loyalty: { title: 'Tarjeta de Fidelidad (Puntos/Sellos)', desc: 'Para acumular visitas y sellar un consumo recurrente.' },
  Cashback: { title: 'Cashback Digital', desc: 'Acumula un % reembolsable de cada compra real del cliente.' },
  Voucher: { title: 'Bono / Multipase prepago', desc: 'Suma de sesiones cargadas (ej. 10 clases de yoga, 5 limpiezas).' },
  'Gift Cards': { title: 'Tarjeta de Regalo prepagada', desc: 'Saldo monetario que se puede obsequiar y canjear.' },
  Cupón: { title: 'Cupón de Descuento Exclusivo', desc: 'Ofertas puntuales de corta duración con códigos de canje.' },
  Birthday: { title: 'Regalo de Cumpleaños Sincronizado', desc: 'Envia sorpresas automáticas al correo en su día especial.' },
  Multipass: { title: 'Pasaporte Co-Branded', desc: 'Válido para visitar distintas locaciones registradas.' },
  Membership: { title: 'Membresía por Rangos', desc: 'Tiers Bronce, Plata, Oro y Platino con beneficios fijos.' },
} as const;

const TERMS_TEMPLATES: { label: string; text: string }[] = [
  {
    label: 'Sello por compra',
    text: 'Por cada compra, acumula 1 sello. Completa los [X] sellos y reclama tu [beneficio] gratis. Sin canje en efectivo. Válido únicamente en el establecimiento.',
  },
  {
    label: 'Compra mínima',
    text: 'Por cada compra mínima de $[monto], ganas 1 sello. Al completar [X] sellos recibe [beneficio]. No acumulable con otras promociones. Consulta restricciones.',
  },
  {
    label: 'Producto específico',
    text: 'Completa los [X] stickers comprando [producto]. Al terminar tu tarjeta recibe [beneficio] gratis. Un sello por visita. Promoción permanente sin fecha de vencimiento.',
  },
  {
    label: 'Visita frecuente',
    text: 'Por cada visita recibe 1 sello. Completa tu tarjeta con [X] sellos y obtén [beneficio]. Un sello por día. Sin fecha de vencimiento.',
  },
  {
    label: 'Puntos acumulativos',
    text: 'Por cada $[monto] de compra acumulas 1 punto. Al llegar a [X] puntos recibes [beneficio]. Los puntos no expiran. Consulta tu saldo en tu tarjeta digital.',
  },
];

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
  email: '',
  instagram: '',
  facebook: '',
  cardTag: 'Loyalty',
  programType: 'stamp_based' as ProgramType,
  amountPerPoint: 1000,
  termsOfService: '',
  cardTitle: '',
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
  email: string;
  instagram: string;
  facebook: string;
  cardTag: string;
  programType: ProgramType;
  amountPerPoint: number;
  termsOfService: string;
  cardTitle: string;
}

function Spinner({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">{label}</p>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CardEditor() {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const { brand } = useModuleBrand();
  const navigate = useNavigate();
  const businessId = user?.id ?? '';
  const businessEmail = user?.email ?? '';

  // Persisted form
  const [form, setForm] = useState<FormState>(DEFAULTS);

  // Visual-only settings (not in DB yet)
  const [qrColor, setQrColor] = useState('#000000');
  const [ecLevel, setEcLevel] = useState<ECLevel>('L');

  // UI state
  const [chipHovered, setChipHovered] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // QR dinámico estable
  const [qrLink, setQrLink] = useState<QrLink | null>(null);
  const [targetUrl, setTargetUrl] = useState('');
  const [savingTarget, setSavingTarget] = useState(false);
  const [editingTarget, setEditingTarget] = useState(false);

  // Auto-set cardTitle and preview type from selected model
  const selectedModel = CARD_TYPE_DETAILS[form.cardTag as keyof typeof CARD_TYPE_DETAILS];
  useEffect(() => {
    if (selectedModel) {
      setForm(prev => ({ ...prev, cardTitle: selectedModel.title }));
    }
  }, [form.cardTag]);

  // Auto-select preview type based on model
  const showRealisticPreview = form.cardTag === 'Membership' || form.cardTag === 'Multipass';

  // Logo upload
  const logoFileRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Ref to the hidden high-res canvas used for download
  const qrDownloadRef = useRef<HTMLDivElement>(null);
  const cardExportRef = useRef<HTMLDivElement>(null);
  const modalCardRef = useRef<HTMLDivElement>(null);

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
          termsOfService: data.termsOfService ?? DEFAULTS.termsOfService,
          cardTitle:      data.cardTitle      ?? DEFAULTS.cardTitle,
          email:          data.email          ?? DEFAULTS.email,
          instagram:      data.instagram      ?? DEFAULTS.instagram,
          facebook:       data.facebook       ?? DEFAULTS.facebook,
          cardTag:        data.cardTag        ?? DEFAULTS.cardTag,
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
      termsOfService: form.termsOfService.trim() || null,
      cardTitle:      form.cardTitle.trim() || null,
      email:          form.email.trim() || null,
      instagram:      form.instagram.trim() || null,
      facebook:       form.facebook.trim() || null,
      cardTag:        form.cardTag || 'Loyalty',
    };

    const { error } = await upsertCardConfig(businessId, payload);
    if (error) {
      setErrorMsg(mapLoyaltyError(error));
    } else {
      setSuccessMsg('Tarjeta guardada correctamente');
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
    link.download = `qr-${(form.businessName || 'fidelink').replace(/\s+/g, '-').toLowerCase()}.png`;
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
      link.download = `card-${(form.businessName || 'fidelink').replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Export failed', e);
    }
  }

  async function handleDownloadCardSvg() {
    if (!modalCardRef.current) return;
    try {
      const svgData = await toSvg(modalCardRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.href = svgData;
      link.download = `tarjeta-${(form.businessName || 'fidelink').replace(/\s+/g, '-').toLowerCase()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('SVG export failed', e);
    }
  }

  async function handleShareCard() {
    if (!modalCardRef.current) return;
    try {
      const blob = await toBlob(modalCardRef.current, { cacheBust: true });
      if (!blob) return;
      const fileName = `tarjeta-${(form.businessName || 'fidelink').replace(/\s+/g, '-').toLowerCase()}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: form.businessName || 'fidelink',
          text: `Mi tarjeta de ${form.businessName || 'fidelink'}`,
          files: [file],
        });
      } else {
        // Fallback: descarga como PNG
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Share card failed', e);
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

    const fileName = `qr-${(form.businessName || 'fidelink').replace(/\s+/g, '-').toLowerCase()}.png`;

    // Try native share sheet (works great on mobile)
    if (navigator.share) {
      try {
        const blob = await new Promise<Blob>((res, rej) =>
          out.toBlob(b => b ? res(b) : rej(new Error('toBlob failed')), 'image/png')
        );
        const file = new File([blob], fileName, { type: 'image/png' });
        const shareData: ShareData = {
          title: form.businessName || 'fidelink',
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

  const selectedEc = EC_LEVELS.find(l => l.value === ecLevel)!;
  const previewIconKey = CATEGORY_TO_ICON[form.category] ?? 'Star';

  // ── Guards ──────────────────────────────────────────────────────────────────
  if (authLoading || dataLoading) return <Spinner label="Cargando configuración…" />;
  if (!businessId) return null;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col overflow-hidden">
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

      <div className="bg-[#f8fafc] border-b border-slate-200 px-4 sm:px-6 h-10 flex flex-row items-center justify-between gap-2 select-none overflow-hidden flex-shrink-0">

        {/* LEFT — chip expandible con descripción en hover */}
        <div
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-white cursor-default transition-all duration-500 ease-in-out min-w-0"
          style={{
            color: brand.colorHex,
            borderColor: chipHovered ? `${brand.colorHex}55` : 'rgb(226 232 240 / 0.6)',
            boxShadow: chipHovered
              ? `0 0 0 3px ${brand.colorHex}18, 0 2px 12px ${brand.colorHex}22`
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
              background: `linear-gradient(90deg, ${brand.colorHex}06 0%, ${brand.colorHex}14 50%, ${brand.colorHex}06 100%)`,
            }}
          />
          <QrCode
            className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300"
            style={{ transform: chipHovered ? 'rotate(-15deg) scale(1.2)' : 'none' }}
          />
          <span className="text-[12px] font-bold font-sans whitespace-nowrap flex-shrink-0">Identidad & QR</span>
          <span
            className="text-[12px] font-sans whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out"
            style={{
              maxWidth: chipHovered ? '600px' : '0px',
              opacity: chipHovered ? 1 : 0,
              paddingLeft: chipHovered ? '6px' : '0px',
              color: `${brand.colorHex}99`,
              fontWeight: 500,
            }}
          >
            · Personaliza tu programa de fidelización y su identidad visual
          </span>
        </div>

        {/* RIGHT — estado */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-full flex-shrink-0">
          <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: brand.colorHex }} />
          <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">Editor de tarjeta</span>
        </div>
      </div>
      <main className="flex-1 overflow-y-auto px-4 md:px-8 pt-3 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── Left: Editor Controls ─────────────────────────────────────── */}
          <section className="lg:col-span-7 space-y-6">

            {/* Category picker — full width, above bento */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-3 font-mono">
                Categoría del negocio
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {CATEGORIES.map(({ value, label, Icon }) => {
                  const active = form.category === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleChange('category', value)}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all ${
                        active
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.04]'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-blue-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[9px] font-bold leading-tight text-center">{label}</span>
                    </button>
                  );
                })}
              </div>
              {form.category && (
                <button
                  type="button"
                  onClick={() => handleChange('category', '')}
                  className="mt-2 text-[10px] text-slate-500 hover:text-red-500 transition-colors"
                >
                  Quitar categoría
                </button>
              )}
            </div>

            {/* Card Type picker */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-3 font-mono">
                Modelo de Tarjeta Digital
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(Object.keys(CARD_TYPE_DETAILS) as Array<keyof typeof CARD_TYPE_DETAILS>).map((typeKey) => {
                  const details = CARD_TYPE_DETAILS[typeKey];
                  const active = form.cardTag === typeKey;
                  return (
                    <button key={typeKey} type="button" onClick={() => handleChange('cardTag', typeKey)}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all ${
                        active
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.04]'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-blue-400'
                      }`}>
                      <span className="text-[9px] font-bold leading-tight text-center">{details.title}</span>
                    </button>
                  );
                })}
              </div>
              {form.cardTag && (
                <button type="button" onClick={() => handleChange('cardTag', 'Loyalty')}
                  className="mt-2 text-[10px] text-slate-500 hover:text-red-500 transition-colors">
                  Restablecer a Loyalty
                </button>
              )}
            </div>

            {/* Config Bento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Card Identity */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest font-mono">Identidad</label>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-600">Nombre del negocio</span>
                  <input value={form.businessName} onChange={e => handleChange('businessName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition-all"
                    placeholder="Ej. Café Central" type="text" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-600">Beneficio o Regalo (Canjeable)</span>
                  <input value={form.rewardDescription} onChange={e => handleChange('rewardDescription', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition-all"
                    placeholder="Ej. Café gratis, 20% descuento…" type="text" />
                </div>
              </div>

              {/* Points Engine */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest font-mono">Sistema de puntos</label>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-600">Tipo de sistema</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleChange('programType', 'stamp_based')}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        form.programType === 'stamp_based'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      Por sellos
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('programType', 'accumulative')}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        form.programType === 'accumulative'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      Acumulativo
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-snug">
                    {form.programType === 'stamp_based'
                      ? '1 compra otorga 1 sello — independiente del monto. Ideal para cafés, salones, etc.'
                      : 'Cada compra otorga puntos según su monto. Ideal para retail con tickets variables.'}
                  </p>
                </div>

                {form.programType === 'accumulative' && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-600">
                      Monto por punto <span className="text-slate-400">(unidad local)</span>
                    </span>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-sm text-slate-500 pointer-events-none select-none">$</span>
                      <input
                        type="number"
                        min={1}
                        step={100}
                        value={form.amountPerPoint}
                        onChange={e => handleChange('amountPerPoint', Math.max(1, Number(e.target.value) || 1))}
                        className="w-full pl-7 pr-16 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-2 text-sm outline-none transition-all"
                      />
                      <span className="absolute right-3 text-[10px] text-slate-500 font-bold pointer-events-none select-none">=&nbsp;1&nbsp;pt</span>
                    </div>
                    <p className="text-[10px] text-slate-600">
                      Ej: con valor <strong>{form.amountPerPoint}</strong>, una compra de ${(form.amountPerPoint * 5).toLocaleString()} otorga 5 puntos.
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-600">
                    {form.programType === 'stamp_based' ? 'Sellos para recompensa' : 'Puntos para recompensa'}:{' '}
                    <strong className="text-blue-600">{form.totalStamps}</strong>
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={form.programType === 'stamp_based' ? 20 : 100}
                    value={form.totalStamps}
                    onChange={e => handleChange('totalStamps', Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                    <span>1</span>
                    <span>{form.programType === 'stamp_based' ? 20 : 100}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Brand Identity — aparece en el reverso de la tarjeta del cliente */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="text-blue-600 w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-800">Identidad de Marca</h3>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                Estos datos se muestran al reverso de la tarjeta del cliente cuando la gira.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Logo */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Logo</label>
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      {form.logoUrl ? (
                        <img src={form.logoUrl} alt="Logo"
                          className="w-16 h-16 rounded-xl object-cover shadow-md border border-slate-200 bg-white" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-500">
                          <Building2 className="w-5 h-5" />
                        </div>
                      )}
                      <button type="button" onClick={() => logoFileRef.current?.click()} disabled={uploadingLogo}
                        className="absolute -bottom-1.5 -right-1.5 bg-blue-600 text-white p-1 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                        aria-label="Subir logo">
                        {uploadingLogo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                      </button>
                      <input ref={logoFileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                    </div>
                    <p className="text-[9px] text-slate-600 text-center">PNG o JPG. Se sube al instante.</p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600">Descripción</label>
                  <textarea value={form.description} onChange={e => handleChange('description', e.target.value)}
                    rows={3} maxLength={240}
                    placeholder="Cuenta a tus clientes qué te hace especial (máx. 240 caracteres)"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition-all resize-none" />
                  <p className="text-[9px] text-slate-600 text-right">{form.description.length} / 240</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Dirección
                  </label>
                  <input type="text" value={form.address} onChange={e => handleChange('address', e.target.value)}
                    placeholder="Calle 123 #45-67, Ciudad"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Sitio web
                  </label>
                  <input type="url" value={form.website} onChange={e => handleChange('website', e.target.value)}
                    placeholder="https://mi-negocio.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Email de contacto</label>
                  <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)}
                    placeholder="contacto@mi-negocio.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Instagram</label>
                  <input type="text" value={form.instagram} onChange={e => handleChange('instagram', e.target.value)}
                    placeholder="@mi_negocio"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* QR Customization */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <QrCode className="text-blue-600 w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-800">Personalización del QR</h3>
              </div>

              <div className="mb-4 space-y-2">
                <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <LinkIcon className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800">Link estable del QR</p>
                      <span className="text-[9px] uppercase tracking-widest text-blue-600 font-bold">
                        no cambia jamás
                      </span>
                    </div>
                    <p className="text-xs font-mono text-blue-600 mt-1 break-all">{qrValue}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      El QR siempre apuntará a este link. Puedes cambiar el destino real cuantas veces quieras sin reimprimir.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl">
                  <Settings className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs font-bold text-slate-800">Destino actual</p>
                      {!editingTarget && (
                        <button type="button" onClick={() => setEditingTarget(true)}
                          className="text-blue-600 text-[10px] font-bold hover:underline flex items-center gap-1">
                          <Pencil className="w-3 h-3" /> Editar
                        </button>
                      )}
                    </div>
                    {editingTarget ? (
                      <div className="flex gap-2 mt-1">
                        <input type="url" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)}
                          placeholder="https://tu-pagina.com/promo"
                          className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button type="button" onClick={handleSaveTarget}
                          disabled={savingTarget || !targetUrl.trim() || targetUrl === qrLink?.targetUrl}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold disabled:opacity-40">
                          {savingTarget ? '…' : 'Guardar'}
                        </button>
                        <button type="button"
                          onClick={() => { setEditingTarget(false); setTargetUrl(qrLink?.targetUrl ?? ''); }}
                          className="px-3 py-1.5 border border-slate-200 rounded-lg text-[10px] text-slate-500">
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 font-mono break-all">{qrLink?.targetUrl ?? '—'}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Color de tarjeta</label>
                  <div className="flex items-center gap-2">
                    {CARD_COLORS.map(color => (
                      <button key={color} type="button" style={{ backgroundColor: color }}
                        onClick={() => handleChange('colorHex', color)}
                        className={`w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform ${
                          form.colorHex === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                        }`} />
                    ))}
                    <div className="w-px h-6 bg-slate-200" />
                    <input type="color" value={form.colorHex}
                      onChange={e => handleChange('colorHex', e.target.value)}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm cursor-pointer overflow-hidden p-0 bg-transparent hover:scale-110 transition-transform" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Color del QR</label>
                  <div className="flex gap-2">
                    {QR_COLORS.map(color => (
                      <button key={color} type="button" style={{ backgroundColor: color }}
                        onClick={() => setQrColor(color)}
                        className={`w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform ${
                          qrColor === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                        }`} />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Corrección de error</label>
                  <div className="flex gap-1">
                    {EC_LEVELS.map(({ value, label }) => (
                      <button key={value} type="button" onClick={() => setEcLevel(value)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                          ecLevel === value ? 'bg-blue-600 text-white shadow-md' : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug">{selectedEc.desc}</p>
                </div>
              </div>
            </div>

            {/* Términos del Servicio */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <Settings className="text-blue-600 w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-800">Términos del Servicio</h3>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Elige una plantilla o escribe tu propio texto. Aparece en el reverso de la tarjeta.
              </p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {TERMS_TEMPLATES.map(({ label, text }) => (
                  <button key={label} type="button" onClick={() => handleChange('termsOfService', text)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-full border transition-all ${
                      form.termsOfService === text
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-blue-400'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
              <textarea value={form.termsOfService} onChange={e => handleChange('termsOfService', e.target.value)}
                rows={3} maxLength={400}
                placeholder="Elige una plantilla o escribe aquí. Reemplaza [X], [monto] y [beneficio] con tus datos reales…"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition-all resize-none" />
              <p className="text-[10px] text-slate-600 text-right mt-1">{form.termsOfService.length} / 400</p>
            </div>

            {/* Save */}
            <div className="space-y-3">
              {successMsg && <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs">{successMsg}</div>}
              {errorMsg && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">{errorMsg}</div>}
              <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Guardar configuración</p>
                    <p className="text-xs text-slate-600">Los cambios se aplican a todos los clientes nuevos</p>
                  </div>
                </div>
                <button type="button" onClick={handleSave}
                  disabled={saving || !form.businessName.trim()}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md">
                  {saving
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : 'PUBLICAR LA TARJETA DIGITAL'}
                </button>
              </div>
            </div>
          </section>

          {/* ── Right: Live Preview ───────────────────────────────────────── */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-white/80 backdrop-blur-sm p-5 rounded-[24px] flex flex-col items-center gap-5 border border-slate-200 shadow-sm">

              <div className="w-full flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase font-mono">
                  Vista previa
                </span>
              </div>

              <div ref={cardExportRef} className="w-full">
                {showRealisticPreview ? (
                  <RealisticCard businessName={form.businessName || 'Tu negocio'}
                    cardTitle={selectedModel?.title || 'Tarjeta de Fidelidad'} cardTag={form.cardTag || 'Loyalty'}
                    colorHex={form.colorHex} totalStamps={form.totalStamps}
                    rewardDescription={form.rewardDescription || 'Recompensa'} category={form.category} logoUrl={form.logoUrl} />
                ) : (
                  <LoyaltyCard businessName={form.businessName || 'Tu negocio'} totalStamps={form.totalStamps}
                    currentStamps={Math.floor(form.totalStamps * 0.6)} rewardDescription={form.rewardDescription || 'Recompensa'}
                    colorHex={form.colorHex} cardTitle={selectedModel?.title || null} branding={{
                      logoUrl: form.logoUrl, description: form.description || null, category: form.category || null,
                      address: form.address || null, website: form.website || null, email: form.email || null,
                      instagram: form.instagram || null, facebook: form.facebook || null,
                      cardTag: form.cardTag || 'Loyalty', programType: form.programType, termsOfService: form.termsOfService || null,
                    }} />
                )}
              </div>

              {selectedModel && (
                <p className="text-[10px] text-slate-600 text-center leading-relaxed px-2">
                  {selectedModel.desc}
                </p>
              )}

              <div className="w-full">
                <p className="text-[9px] font-bold text-slate-500 text-center mb-2 uppercase tracking-widest font-mono">Ícono de sello</p>
                <div className="flex justify-center gap-1.5">
                  {STAMP_ICON_OPTIONS.map(({ key, label, Icon }) => (
                    <button key={key} type="button" onClick={() => handleChange('category', ICON_TO_CATEGORY[key] ?? '')}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                        previewIconKey === key ? 'bg-blue-600 text-white scale-110 shadow-md' : 'text-slate-500 hover:bg-slate-100'
                      }`}>
                      <Icon className="w-4 h-4" />
                      <span className="text-[8px] font-bold leading-none">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full bg-white rounded-2xl p-5 shadow-sm flex flex-col items-center gap-3 border border-slate-200">
                <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-center">
                  <QRCodeSVG value={qrValue} size={140} level={ecLevel} fgColor={qrColor} bgColor="transparent" includeMargin={false} />
                </div>
                <div className="text-center space-y-0.5 w-full">
                  <p className="text-xs font-bold text-slate-800">Escanear para registrar compra</p>
                  <p className="text-[10px] text-slate-600 font-mono truncate" title={qrValue}>{qrValue}</p>
                  <p className="text-[9px] text-slate-400">Nivel <strong className="text-blue-600">{ecLevel}</strong> — {selectedEc.desc.split(' — ')[0]}</p>
                </div>
              </div>

              <div className="flex gap-2 w-full">
                <button type="button" onClick={handleDownloadQR}
                  className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-all">
                  <Download className="w-3.5 h-3.5" /> QR
                </button>
                <button type="button" onClick={handleDownloadCardImage}
                  className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-all">
                  <Download className="w-3.5 h-3.5" /> TARJETA
                </button>
                <button type="button" onClick={handleShareQR}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98] ${
                    copied ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}>
                  {copied ? <><Check className="w-3.5 h-3.5" />OK</> : <><Share2 className="w-3.5 h-3.5" />COMPARTIR</>}
                </button>
              </div>

              <button type="button" onClick={() => setShowPreview(true)}
                className="w-full bg-slate-50 text-slate-600 py-2.5 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1.5 hover:bg-white transition-all border border-slate-200">
                <Eye className="w-3.5 h-3.5" /> VISTA PREVIA COMPLETA
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
            className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl flex flex-col gap-5"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Vista previa</h3>
                <p className="text-xs text-slate-600 mt-0.5">{showRealisticPreview ? 'Vista previa realista' : 'Toca la tarjeta para girarla'}</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Flippable card */}
            <div ref={modalCardRef}>
              {showRealisticPreview ? (
                <RealisticCard businessName={form.businessName || 'Tu negocio'}
                  cardTitle={selectedModel?.title || 'Tarjeta de Fidelidad'} cardTag={form.cardTag || 'Loyalty'}
                  colorHex={form.colorHex} totalStamps={form.totalStamps}
                  rewardDescription={form.rewardDescription || 'Recompensa'} category={form.category} logoUrl={form.logoUrl} />
              ) : (
                <LoyaltyCard
                  businessName={form.businessName || 'Tu negocio'}
                  totalStamps={form.totalStamps}
                  currentStamps={Math.floor(form.totalStamps * 0.6)}
                  rewardDescription={form.rewardDescription || 'Premio gratis'}
                  colorHex={form.colorHex}
                  cardTitle={selectedModel?.title || null}
                  cardId="PREVIEW"
                  branding={{
                    logoUrl: form.logoUrl,
                    description: form.description || null,
                    category: form.category || null,
                    address: form.address || null,
                    website: form.website || null,
                    email: form.email || null,
                    instagram: form.instagram || null,
                    facebook: form.facebook || null,
                    cardTag: form.cardTag || 'Loyalty',
                    programType: form.programType,
                    termsOfService: form.termsOfService || null,
                  }}
                />
              )}
            </div>

            {/* Card actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDownloadCardSvg}
                className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-all"
              >
                <Download className="w-4 h-4" />
                Descargar SVG
              </button>
              <button
                type="button"
                onClick={handleShareCard}
                className={`flex-1 py-3 rounded-xl font-bold text-label-md flex items-center justify-center gap-2 transition-all ${
                  copied ? 'bg-secondary text-white' : 'bg-primary text-white hover:opacity-90'
                }`}
              >
                {copied ? (
                  <><Check className="w-4 h-4" />Copiado</>
                ) : (
                  <><Share2 className="w-4 h-4" />Compartir tarjeta</>
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
