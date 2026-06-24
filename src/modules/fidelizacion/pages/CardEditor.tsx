import { useState, useEffect, useRef, type ChangeEvent, type ComponentType } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { QrCode, Settings, Eye, Download, Share2, Check, X, Link as LinkIcon, Pencil, Building2, Camera, Loader2, MapPin, Globe, Coffee, ShoppingBag, Ticket, Heart, Star, Utensils, Gem, Monitor, ShoppingCart, Scissors, Dumbbell, Crown, Save } from 'lucide-react';
import LoyaltyCard, { STAMP_ICON_OPTIONS } from '../components/LoyaltyCard';
import RealisticCard from '@/components/wallet/RealisticCard';
import { getCardComponent, hasCardComponent } from '../components/card-models';
import { toPng, toSvg, toBlob } from 'html-to-image';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '@/i18n/index';
import { useAuth } from '@/context/AuthContext';
import { getCardConfig, upsertCardConfig, uploadBusinessLogo, mapLoyaltyError, type CardConfig, type ProgramType } from '@/services/loyaltyService';
import { getOrCreatePrimaryQr, updateQrTarget, buildQrUrl, type QrLink } from '@/services/qrLinkService';
import SectionRibbon from '@/platform/ui/SectionRibbon';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';

// ─── Constants ────────────────────────────────────────────────────────────────

const COLOR_PALETTE = [
  '#3525cd', '#4338ca', '#6366f1', '#818cf8', '#a5b4fc',
  '#006c49', '#059669', '#10b981', '#34d399', '#6ee7b7',
  '#FF6D00', '#ea580c', '#f97316', '#fb923c', '#fdba74',
  '#0b2545', '#1e3a5f', '#2d4a7a', '#3b5f9e', '#5b7fc7',
  '#caa14b', '#d4af37', '#e9c878', '#f3da9d', '#f8ecc8',
  '#14141c', '#2a2a30', '#3d3d45', '#4a4a52', '#6b6b78',
  '#e63946', '#ef4444', '#f87171', '#fca5a5', '#fecaca',
  '#457b9d', '#4895ef', '#60a5fa', '#93c5fd', '#bfdbfe',
  '#2a9d8f', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4',
  '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe',
  '#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8', '#fce7f3',
  '#581c87', '#7e22ce', '#9333ea', '#c026d3', '#d946ef',
  '#4c1d95', '#6d28d9', '#7c3aed', '#d8b4fe', '#e9d5ff',
  '#b91c1c', '#fde68a', '#a7f3d0',
];

const DEFAULT_MODEL_COLORS: Record<string, string> = {
  Loyalty: '#3525cd',
  Cashback: '#3525cd',
  Voucher: '#3525cd',
  'Gift Cards': '#3525cd',
  Cupón: '#3525cd',
  Birthday: '#3525cd',
  Multipass: '#3525cd',
  Membership: '#3525cd',
  EventTicket: '#a8884f',
  VIPGold: '#caa14b',
  PremiumGift: '#caa14b',
  BoardingPass: '#0b2545',
  EventBadge: '#0b2545',
  StaffCard: '#14141c',
  CreditCashback: '#0f7a4c',
  CreditBenefits: '#ff7a3d',
  CreditRewards: '#2b1366',
  CreditAccess: '#0e3a44',
  CreditPremium: '#2a2a30',
};

const DEFAULT_MODEL_SECONDARY_COLORS: Record<string, string> = {
  Loyalty: '#ffd700',
  Cashback: '#ffd700',
  Voucher: '#ffd700',
  'Gift Cards': '#ffd700',
  Cupón: '#ffd700',
  Birthday: '#ffd700',
  Multipass: '#ffd700',
  Membership: '#ffd700',
  EventTicket: '#b3a06a',
  VIPGold: '#e9c878',
  PremiumGift: '#e9c878',
  BoardingPass: '#d4af37',
  EventBadge: '#d4af37',
  StaffCard: '#7a5fc4',
  CreditCashback: '#e9c45a',
  CreditBenefits: '#9b1d8f',
  CreditRewards: '#ffe79a',
  CreditAccess: '#d4af37',
  CreditPremium: '#d4af37',
};

type QrColorOption = 'black' | 'white' | 'custom';

function blendWithBlackWhite(hex: string, blend: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  let nr: number, ng: number, nb: number;
  if (blend <= 50) {
    const t = blend / 50;
    nr = Math.round(r * t);
    ng = Math.round(g * t);
    nb = Math.round(b * t);
  } else {
    const t = (blend - 50) / 50;
    nr = Math.round(r + (255 - r) * t);
    ng = Math.round(g + (255 - g) * t);
    nb = Math.round(b + (255 - b) * t);
  }
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

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
  // Nuevos modelos — credenciales hiperrealistas
  EventTicket: { title: 'Ticket de Evento Elegante', desc: 'Formato de ticket de papel con acabado satinado, código de barras y estilo premium.' },
  VIPGold: { title: 'VIP Gold Pass', desc: 'Pase VIP negro y dorado con marco de doble filigrana y brillo especular.' },
  PremiumGift: { title: 'Gift Card Premium', desc: 'Tarjeta de regalo oscura con textura rayada, marco dorado y brillo animado.' },
  BoardingPass: { title: 'Boarding Pass', desc: 'Pase de abordar estilo aerolínea premium, con talón perforado y código de barras.' },
  EventBadge: { title: 'Credencial de Evento', desc: 'Escarapela con clip, foto circular, código QR y cinta de acceso total.' },
  StaffCard: { title: 'Carnet de Staff', desc: 'Credencial tipo lanyard con correa texturizada, foto y banda magnética.' },
  // Nuevos modelos — tarjetas de crédito hiperrealistas
  CreditCashback: { title: 'Cashback Esmeralda', desc: 'Verde esmeralda con franja de oro pulido y devolución de efectivo.' },
  CreditBenefits: { title: 'Beneficios Premium', desc: 'Degradado festivo coral-magenta con listón de regalo en relieve.' },
  CreditRewards: { title: 'Recompensa Iridiscente', desc: 'Púrpura iridiscente que cambia de tono según el ángulo de luz.' },
  CreditAccess: { title: 'Pase de Accesos', desc: 'Estilo ticket con perforación troquelada, muescas y código de barras.' },
  CreditPremium: { title: 'Premium Metálico', desc: 'Metal cepillado negro con grabado láser dorado y borde realzado.' },
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
  secondaryColorHex: '#ffd700',
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
  secondaryColorHex: string;
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
  const [qrColorOption, setQrColorOption] = useState<QrColorOption>('black');
  const [qrCustomColor, setQrCustomColor] = useState('#3525cd');
  const [qrCustomColorBase, setQrCustomColorBase] = useState('#3525cd');
  const [qrCustomColorBlend, setQrCustomColorBlend] = useState(50);
  const [showQrColorPicker, setShowQrColorPicker] = useState(false);
  const [showCardColorPicker, setShowCardColorPicker] = useState(false);
  const [showSecondaryColorPicker, setShowSecondaryColorPicker] = useState(false);
  const [cardColorBase, setCardColorBase] = useState(DEFAULTS.colorHex);
  const [cardColorBlend, setCardColorBlend] = useState(50);
  const [secondaryColorBase, setSecondaryColorBase] = useState(DEFAULTS.secondaryColorHex);
  const [secondaryColorBlend, setSecondaryColorBlend] = useState(50);
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

  // Auto-set cardTitle and reset color to model's original default
  const selectedModel = CARD_TYPE_DETAILS[form.cardTag as keyof typeof CARD_TYPE_DETAILS];
  useEffect(() => {
    if (selectedModel) {
      const defaultColor = DEFAULT_MODEL_COLORS[form.cardTag] ?? '#3525cd';
      const defaultSecondary = DEFAULT_MODEL_SECONDARY_COLORS[form.cardTag] ?? '#ffd700';
      setForm(prev => ({ ...prev, cardTitle: selectedModel.title, colorHex: defaultColor, secondaryColorHex: defaultSecondary }));
    }
  }, [form.cardTag]);

  // Auto-select preview type based on model
  const showNewCardPreview = hasCardComponent(form.cardTag);
  const showRealisticPreview = !showNewCardPreview && (form.cardTag === 'Membership' || form.cardTag === 'Multipass');

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
      setTimeout(() => setErrorMsg(''), 6000);
    } else {
      setSuccessMsg('Tarjeta guardada correctamente');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
    setSaving(false);
  }

  function handleDownloadQR() {
    // Use the hidden 512 px canvas for high-res PNG
    const canvas = qrDownloadRef.current?.querySelector('canvas');
    if (!canvas) return;

    // Download canvas with matching background
    const out = document.createElement('canvas');
    const pad = 24;
    out.width  = canvas.width  + pad * 2;
    out.height = canvas.height + pad * 2;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = qrBgHex;
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

    // Build padded canvas with matching background
    const out = document.createElement('canvas');
    const pad = 24;
    out.width  = canvas.width  + pad * 2;
    out.height = canvas.height + pad * 2;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = qrBgHex;
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

  const qrFgColor = qrColorOption === 'custom' ? qrCustomColor : (qrColorOption === 'black' ? '#000000' : '#ffffff');
  const qrBgHex = qrColorOption === 'white' ? '#000000' : '#ffffff';

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
          fgColor={qrFgColor}
          bgColor={qrBgHex}
          includeMargin={false}
        />
      </div>

      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 h-12 flex flex-row items-center justify-between gap-2 select-none overflow-hidden flex-shrink-0">

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
            className="text-[12px] font-light font-sans whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out"
            style={{
              maxWidth: chipHovered ? '600px' : '0px',
              opacity: chipHovered ? 1 : 0,
              paddingLeft: chipHovered ? '6px' : '0px',
              color: `${brand.colorHex}99`,
            }}
          >
            · Personaliza tu programa de fidelización y su identidad visual
          </span>
        </div>

        {/* RIGHT — estado + botón guardar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {successMsg && (
            <span className="text-[11px] text-emerald-600 font-semibold whitespace-nowrap">{successMsg}</span>
          )}
          {errorMsg && (
            <span className="text-[11px] text-red-600 font-semibold whitespace-nowrap">{errorMsg}</span>
          )}
          <button type="button" onClick={handleSave}
            disabled={saving || !form.businessName.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[11px] transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            style={{
              backgroundColor: saving ? '#94a3b8' : brand.colorHex,
              color: '#fff',
            }}>
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Publicar</span>
          </button>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: brand.colorHex }} />
            <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">Editor de tarjeta</span>
          </div>
        </div>
      </div>
      <main className="flex-1 overflow-y-auto px-4 md:px-6 pt-3 pb-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── Editor Controls ──────────────────────────────────────────── */}
          <section className="lg:col-span-7 space-y-6">

            {/* Category picker — full width, above bento */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <label className="text-[10px] font-bold uppercase tracking-wider block mb-3 font-jakarta" style={{ color: brand.colorHex }}>
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
                      className="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all"
                      style={active ? {
                        backgroundColor: brand.colorHex,
                        color: '#fff',
                        borderColor: brand.colorHex,
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
                        transform: 'scale(1.04)',
                      } : undefined}
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
              <label className="text-[10px] font-bold uppercase tracking-wider block mb-3 font-jakarta" style={{ color: brand.colorHex }}>
                Modelo de Tarjeta Digital
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(Object.keys(CARD_TYPE_DETAILS) as Array<keyof typeof CARD_TYPE_DETAILS>).map((typeKey) => {
                  const details = CARD_TYPE_DETAILS[typeKey];
                  const active = form.cardTag === typeKey;
                  return (
                    <button key={typeKey} type="button" onClick={() => handleChange('cardTag', typeKey)}
                      className="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all"
                      style={active ? {
                        backgroundColor: brand.colorHex,
                        color: '#fff',
                        borderColor: brand.colorHex,
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
                        transform: 'scale(1.04)',
                      } : undefined}>
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
                <label className="text-[10px] font-bold uppercase tracking-wider font-jakarta" style={{ color: brand.colorHex }}>Identidad</label>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-600">Nombre del negocio</span>
                  <input value={form.businessName} onChange={e => handleChange('businessName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-xl px-3 py-2 text-xs outline-none transition-all text-slate-800 placeholder:text-slate-400"
                    placeholder="Ej. Café Central" type="text" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-600">Beneficio o Regalo (Canjeable)</span>
                  <input value={form.rewardDescription} onChange={e => handleChange('rewardDescription', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-xl px-3 py-2 text-xs outline-none transition-all text-slate-800 placeholder:text-slate-400"
                    placeholder="Ej. Café gratis, 20% descuento…" type="text" />
                </div>
              </div>

              {/* Points Engine */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-wider font-jakarta" style={{ color: brand.colorHex }}>Sistema de puntos</label>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-600">Tipo de sistema</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleChange('programType', 'stamp_based')}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border border-slate-200 text-slate-500 hover:bg-slate-50"
                      style={form.programType === 'stamp_based' ? {
                        backgroundColor: brand.colorHex,
                        color: '#fff',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      } : undefined}
                    >
                      Por sellos
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('programType', 'accumulative')}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border border-slate-200 text-slate-500 hover:bg-slate-50"
                      style={form.programType === 'accumulative' ? {
                        backgroundColor: brand.colorHex,
                        color: '#fff',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      } : undefined}
                    >
                      Acumulativo
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">
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
                        className="w-full pl-7 pr-16 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-xl py-2 text-xs outline-none transition-all text-slate-800 placeholder:text-slate-400"
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
                    <strong style={{ color: brand.colorHex }}>{form.totalStamps}</strong>
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={form.programType === 'stamp_based' ? 20 : 100}
                    value={form.totalStamps}
                    onChange={e => handleChange('totalStamps', Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                    <span>1</span>
                    <span>{form.programType === 'stamp_based' ? 20 : 100}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Brand Identity — aparece en el reverso de la tarjeta del cliente */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" style={{ color: brand.colorHex }} />
                <h3 className="text-sm font-bold text-slate-800">Identidad de Marca</h3>
                <span className="text-[9px] text-slate-400 ml-auto">Reverso de la tarjeta</span>
              </div>

              <div className="flex items-start gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Logo</label>
                  <div className="relative">
                    {form.logoUrl ? (
                      <img src={form.logoUrl} alt="Logo"
                        className="w-16 h-16 rounded-xl object-cover shadow-sm border border-slate-200 bg-white" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                        <Building2 className="w-5 h-5" />
                      </div>
                    )}
                    <button type="button" onClick={() => logoFileRef.current?.click()} disabled={uploadingLogo}
                      className="absolute -bottom-1 -right-1 text-white p-1 rounded-full shadow hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                      style={{ backgroundColor: brand.colorHex }}
                      aria-label="Subir logo">
                      {uploadingLogo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                    </button>
                    <input ref={logoFileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Descripción</label>
                  <textarea value={form.description} onChange={e => handleChange('description', e.target.value)}
                    rows={2} maxLength={240}
                    placeholder="¿Qué te hace especial? (máx. 240 caracteres)"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-xl px-3 py-2 text-xs outline-none transition-all resize-none text-slate-800 placeholder:text-slate-400" />
                  <p className="text-[10px] text-slate-400 text-right mt-0.5">{form.description.length} / 240</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-0.5 mb-0.5">
                    <MapPin className="w-3 h-3" /> Dirección
                  </label>
                  <input type="text" value={form.address} onChange={e => handleChange('address', e.target.value)}
                    placeholder="Calle 123 #45-67"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-xl px-3 py-2 text-xs outline-none transition-all text-slate-800 placeholder:text-slate-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-0.5 mb-0.5">
                    <Globe className="w-3 h-3" /> Sitio web
                  </label>
                  <input type="url" value={form.website} onChange={e => handleChange('website', e.target.value)}
                    placeholder="mi-negocio.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-xl px-3 py-2 text-xs outline-none transition-all text-slate-800 placeholder:text-slate-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-0.5 block">Email</label>
                  <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)}
                    placeholder="contacto@email.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-xl px-3 py-2 text-xs outline-none transition-all text-slate-800 placeholder:text-slate-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-0.5 block">Instagram</label>
                  <input type="text" value={form.instagram} onChange={e => handleChange('instagram', e.target.value)}
                    placeholder="@mi_negocio"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-xl px-3 py-2 text-xs outline-none transition-all text-slate-800 placeholder:text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Color de tarjeta</label>
                  <div className="flex items-center gap-1.5">
                    <button type="button"
                      onClick={() => setShowCardColorPicker(!showCardColorPicker)}
                      className="w-7 h-7 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform shrink-0 overflow-hidden"
                      style={{
                        background: `conic-gradient(#3525cd, #006c49, #FF6D00, #caa14b, #e63946, #8b5cf6, #ec4899, #3525cd)`,
                      }}>
                      <span className="block w-full h-full rounded-full"
                        style={{ background: `radial-gradient(circle at 40% 35%, transparent 30%, rgba(255,255,255,0.3) 40%, transparent 50%)` }} />
                    </button>
                    {showCardColorPicker && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowCardColorPicker(false)} />
                        <div className="absolute left-0 bottom-full mb-2 z-50 bg-white rounded-[24px] shadow-xl border border-slate-200 p-4 min-w-[256px]">
                          <div className="grid grid-cols-7 gap-2 mb-3">
                            {[...COLOR_PALETTE.slice(0, 41), '#ffffff'].map(color => (
                              <button key={color} type="button" style={{ backgroundColor: color }}
                                onClick={() => { setCardColorBase(color); setCardColorBlend(50); handleChange('colorHex', color); }}
                                className={`w-6 h-6 rounded-full border border-white/40 shadow-sm hover:scale-110 transition-transform ${
                                  form.colorHex === color ? 'ring-2 ring-slate-400 ring-offset-2' : ''
                                } ${color === '#ffffff' ? 'border-slate-300' : ''}`} />
                            ))}
                          </div>
                          <div className="mb-3">
                            <input type="range" min={0} max={100} value={cardColorBlend}
                              onChange={e => {
                                const v = Number(e.target.value);
                                setCardColorBlend(v);
                                handleChange('colorHex', blendWithBlackWhite(cardColorBase, v));
                              }}
                              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(90deg, #000, ${cardColorBase} 50%, #fff)`,
                                accentColor: cardColorBase,
                              }} />
                            <div className="flex items-center justify-between text-[8px] text-slate-400 mt-1 px-0.5">
                              <span>oscuro</span>
                              <span className="text-[8px] text-slate-400 font-mono">
                                RGB {parseInt(form.colorHex.slice(1,3), 16)} {parseInt(form.colorHex.slice(3,5), 16)} {parseInt(form.colorHex.slice(5,7), 16)}
                              </span>
                              <span>claro</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                            <span className="w-7 h-7 rounded-full shrink-0 ring-1 ring-black/10"
                              style={{ backgroundColor: form.colorHex }} />
                            <div className="flex-1">
                              <input type="text" value={form.colorHex}
                                onChange={e => { const v = e.target.value; if (/^#[0-9a-fA-F]{0,6}$/.test(v)) { handleChange('colorHex', v); setCardColorBase(v); setCardColorBlend(50); } }}
                                onBlur={() => { if (!/^#[0-9a-fA-F]{6}$/.test(form.colorHex)) handleChange('colorHex', DEFAULT_MODEL_COLORS[form.cardTag] ?? '#3525cd'); }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-[11px] font-mono outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-center text-slate-400" />
                            </div>
                            <button type="button" onClick={() => {
                              const original = DEFAULT_MODEL_COLORS[form.cardTag] ?? '#3525cd';
                              setCardColorBase(original); setCardColorBlend(50); handleChange('colorHex', original);
                              setShowCardColorPicker(false);
                            }}
                              className="text-[10px] text-slate-400 hover:text-slate-700 font-medium whitespace-nowrap shrink-0">
                              Reset
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Color secundario</label>
                  <div className="flex items-center gap-1.5">
                    <button type="button"
                      onClick={() => setShowSecondaryColorPicker(!showSecondaryColorPicker)}
                      className="w-7 h-7 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform shrink-0 overflow-hidden"
                      style={{
                        background: `conic-gradient(#3525cd, #006c49, #FF6D00, #caa14b, #e63946, #8b5cf6, #ec4899, #3525cd)`,
                      }}>
                      <span className="block w-full h-full rounded-full"
                        style={{ background: `radial-gradient(circle at 40% 35%, transparent 30%, rgba(255,255,255,0.3) 40%, transparent 50%)` }} />
                    </button>
                    {showSecondaryColorPicker && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowSecondaryColorPicker(false)} />
                        <div className="absolute left-0 bottom-full mb-2 z-50 bg-white rounded-[24px] shadow-xl border border-slate-200 p-4 min-w-[256px]">
                          <div className="grid grid-cols-7 gap-2 mb-3">
                            {[...COLOR_PALETTE.slice(0, 41), '#ffffff'].map(color => (
                              <button key={color} type="button" style={{ backgroundColor: color }}
                                onClick={() => { setSecondaryColorBase(color); setSecondaryColorBlend(50); handleChange('secondaryColorHex', color); }}
                                className={`w-6 h-6 rounded-full border border-white/40 shadow-sm hover:scale-110 transition-transform ${
                                  form.secondaryColorHex === color ? 'ring-2 ring-slate-400 ring-offset-2' : ''
                                } ${color === '#ffffff' ? 'border-slate-300' : ''}`} />
                            ))}
                          </div>
                          <div className="mb-3">
                            <input type="range" min={0} max={100} value={secondaryColorBlend}
                              onChange={e => {
                                const v = Number(e.target.value);
                                setSecondaryColorBlend(v);
                                handleChange('secondaryColorHex', blendWithBlackWhite(secondaryColorBase, v));
                              }}
                              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(90deg, #000, ${secondaryColorBase} 50%, #fff)`,
                                accentColor: secondaryColorBase,
                              }} />
                            <div className="flex items-center justify-between text-[8px] text-slate-400 mt-1 px-0.5">
                              <span>oscuro</span>
                              <span className="text-[8px] text-slate-400 font-mono">
                                RGB {parseInt(form.secondaryColorHex.slice(1,3), 16)} {parseInt(form.secondaryColorHex.slice(3,5), 16)} {parseInt(form.secondaryColorHex.slice(5,7), 16)}
                              </span>
                              <span>claro</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                            <span className="w-7 h-7 rounded-full shrink-0 ring-1 ring-black/10"
                              style={{ backgroundColor: form.secondaryColorHex }} />
                            <div className="flex-1">
                              <input type="text" value={form.secondaryColorHex}
                                onChange={e => { const v = e.target.value; if (/^#[0-9a-fA-F]{0,6}$/.test(v)) { handleChange('secondaryColorHex', v); setSecondaryColorBase(v); setSecondaryColorBlend(50); } }}
                                onBlur={() => { if (!/^#[0-9a-fA-F]{6}$/.test(form.secondaryColorHex)) handleChange('secondaryColorHex', DEFAULT_MODEL_SECONDARY_COLORS[form.cardTag] ?? '#ffd700'); }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-[11px] font-mono outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-center text-slate-400" />
                            </div>
                            <button type="button" onClick={() => {
                              const original = DEFAULT_MODEL_SECONDARY_COLORS[form.cardTag] ?? '#ffd700';
                              setSecondaryColorBase(original); setSecondaryColorBlend(50); handleChange('secondaryColorHex', original);
                              setShowSecondaryColorPicker(false);
                            }}
                              className="text-[10px] text-slate-400 hover:text-slate-700 font-medium whitespace-nowrap shrink-0">
                              Reset
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Términos del Servicio */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <Settings className="w-5 h-5" style={{ color: brand.colorHex }} />
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
                        ? 'text-white'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                    style={form.termsOfService === text ? {
                      backgroundColor: brand.colorHex,
                      borderColor: brand.colorHex,
                    } : undefined}>
                    {label}
                  </button>
                ))}
              </div>
              <textarea value={form.termsOfService} onChange={e => handleChange('termsOfService', e.target.value)}
                rows={3} maxLength={400}
                placeholder="Elige una plantilla o escribe aquí. Reemplaza [X], [monto] y [beneficio] con tus datos reales…"
                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-xl px-3 py-2 text-xs outline-none transition-all text-slate-800 placeholder:text-slate-400 resize-none" />
              <p className="text-[10px] text-slate-600 text-right mt-1">{form.termsOfService.length} / 400</p>
            </div>
          </section>

          {/* ── Preview + Terms ─────────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-6">

            {/* Vista previa */}
            <div className="bg-white/80 backdrop-blur-sm p-5 rounded-[24px] flex flex-col items-center gap-5 border border-slate-200 shadow-sm">

              <div className="w-full flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase font-jakarta">
                  Vista previa
                </span>
              </div>

              <div ref={cardExportRef} className="w-full">
                {showNewCardPreview ? (
                  (() => {
                    const CardComponent = getCardComponent(form.cardTag)!;
                    return <CardComponent businessName={form.businessName || 'Tu negocio'}
                      cardTitle={selectedModel?.title || 'Tarjeta de Fidelidad'} cardTag={form.cardTag || 'Loyalty'}
                      colorHex={form.colorHex} secondaryColorHex={form.secondaryColorHex} totalStamps={form.totalStamps}
                      rewardDescription={form.rewardDescription || 'Recompensa'} category={form.category} logoUrl={form.logoUrl} />;
                  })()
                ) : showRealisticPreview ? (
                  <RealisticCard businessName={form.businessName || 'Tu negocio'}
                    cardTitle={selectedModel?.title || 'Tarjeta de Fidelidad'} cardTag={form.cardTag || 'Loyalty'}
                    colorHex={form.colorHex} totalStamps={form.totalStamps}
                    rewardDescription={form.rewardDescription || 'Recompensa'} category={form.category} logoUrl={form.logoUrl} secondaryColorHex={form.secondaryColorHex} />
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
                <p className="text-[9px] font-bold text-slate-500 text-center mb-2 uppercase tracking-wider font-jakarta">Ícono de sello</p>
                <div className="flex justify-center gap-1.5">
                  {STAMP_ICON_OPTIONS.map(({ key, label, Icon }) => (
                    <button key={key} type="button" onClick={() => handleChange('category', ICON_TO_CATEGORY[key] ?? '')}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all text-slate-500 hover:bg-slate-100"
                      style={previewIconKey === key ? {
                        backgroundColor: brand.colorHex,
                        color: '#fff',
                        transform: 'scale(1.1)',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      } : undefined}>
                      <Icon className="w-4 h-4" />
                      <span className="text-[8px] font-bold leading-none">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full bg-white rounded-2xl p-5 shadow-sm flex flex-col items-center gap-3 border border-slate-200">
                <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-center">
                  <QRCodeSVG value={qrValue} size={140} level={ecLevel} fgColor={qrFgColor} bgColor={qrBgHex} includeMargin={false} />
                </div>
                <div className="text-center space-y-0.5 w-full">
                  <p className="text-xs font-bold text-slate-800">Escanear para registrar compra</p>
                  <p className="text-xs text-slate-600 font-mono truncate" title={qrValue}>{qrValue}</p>
                  <p className="text-[9px] text-slate-400">Nivel <strong style={{ color: brand.colorHex }}>{ecLevel}</strong> — {selectedEc.desc.split(' — ')[0]}</p>
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
                  className="flex-1 py-2.5 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98]"
                  style={copied ? {
                    backgroundColor: '#10b981',
                    color: '#fff',
                  } : {
                    backgroundColor: brand.colorHex,
                    color: '#fff',
                  }}>
                  {copied ? <><Check className="w-3.5 h-3.5" />OK</> : <><Share2 className="w-3.5 h-3.5" />COMPARTIR</>}
                </button>
              </div>

              <button type="button" onClick={() => setShowPreview(true)}
                className="w-full bg-slate-50 text-slate-600 py-2.5 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1.5 hover:bg-white transition-all border border-slate-200">
                <Eye className="w-3.5 h-3.5" /> VISTA PREVIA COMPLETA
              </button>
            </div>

            {/* QR Customization */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="w-4 h-4" style={{ color: brand.colorHex }} />
                <h3 className="text-sm font-bold text-slate-800">Personalización del QR</h3>
              </div>

              <div className="mb-3 space-y-2">
                  <div className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <LinkIcon className="w-3 h-3 mt-0.5 shrink-0" style={{ color: brand.colorHex }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800">Link estable del QR</p>
                      <span className="text-[8px] uppercase tracking-widest font-bold" style={{ color: brand.colorHex }}>
                        no cambia jamás
                      </span>
                    </div>
                    <p className="text-xs font-mono mt-0.5 break-all" style={{ color: brand.colorHex }}>{qrValue}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      El QR siempre apuntará a este link. Puedes cambiar el destino real cuantas veces quieras sin reimprimir.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-xl">
                  <Settings className="w-3 h-3 text-slate-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-xs font-bold text-slate-800">Destino actual</p>
                      {!editingTarget && (
                        <button type="button" onClick={() => setEditingTarget(true)}
                          className="text-[10px] font-bold hover:underline flex items-center gap-0.5" style={{ color: brand.colorHex }}>
                          <Pencil className="w-2.5 h-2.5" /> Editar
                        </button>
                      )}
                    </div>
                    {editingTarget ? (
                      <div className="flex gap-1.5 mt-1">
                        <input type="url" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)}
                          placeholder="https://tu-pagina.com/promo"
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-400 text-slate-800 placeholder:text-slate-400" />
                        <button type="button" onClick={handleSaveTarget}
                          disabled={savingTarget || !targetUrl.trim() || targetUrl === qrLink?.targetUrl}
                          className="px-2.5 py-1.5 text-white rounded-lg text-[10px] font-bold disabled:opacity-40"
                          style={{ backgroundColor: brand.colorHex }}>
                          {savingTarget ? '…' : 'Guardar'}
                        </button>
                        <button type="button"
                          onClick={() => { setEditingTarget(false); setTargetUrl(qrLink?.targetUrl ?? ''); }}
                          className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-[10px] text-slate-500">
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 font-mono break-all">{qrLink?.targetUrl ?? '—'}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-0.5">Color del QR</label>
                  <div className="flex gap-1">
                    {(['black', 'white', 'custom'] as const).map(option => (
                      <button key={option} type="button" onClick={() => setQrColorOption(option)}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-slate-200 text-slate-500 hover:bg-slate-50"
                        style={qrColorOption === option ? {
                          backgroundColor: brand.colorHex,
                          color: '#fff',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        } : undefined}>
                        <span className={`w-3 h-3 rounded-full border ${option === 'white' ? 'border-slate-300' : 'border-white/40'} shadow-sm shrink-0`}
                          style={{ backgroundColor: option === 'custom' ? qrCustomColor : (option === 'black' ? '#000' : '#fff') }} />
                        {option === 'black' ? 'Negro' : option === 'white' ? 'Blanco' : 'Color'}
                      </button>
                    ))}
                    {qrColorOption === 'custom' && (
                      <div className="relative">
                        <button type="button"
                          onClick={() => setShowQrColorPicker(!showQrColorPicker)}
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform shrink-0 overflow-hidden"
                          style={{
                            background: `conic-gradient(#3525cd, #006c49, #FF6D00, #caa14b, #e63946, #8b5cf6, #ec4899, #3525cd)`,
                          }}>
                          <span className="block w-full h-full rounded-full"
                            style={{ background: `radial-gradient(circle at 40% 35%, transparent 30%, rgba(255,255,255,0.3) 40%, transparent 50%)` }} />
                        </button>
                        {showQrColorPicker && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowQrColorPicker(false)} />
                            <div className="absolute left-0 bottom-full mb-2 z-50 bg-white rounded-[24px] shadow-xl border border-slate-200 p-4 min-w-[256px]">
                              <div className="grid grid-cols-7 gap-2 mb-3">
                                {[...COLOR_PALETTE.slice(0, 41), '#ffffff'].map(color => (
                                  <button key={color} type="button" style={{ backgroundColor: color }}
                                    onClick={() => { setQrCustomColorBase(color); setQrCustomColorBlend(50); setQrCustomColor(color); }}
                                    className={`w-6 h-6 rounded-full border border-white/40 shadow-sm hover:scale-110 transition-transform ${
                                      qrCustomColor === color ? 'ring-2 ring-slate-400 ring-offset-2' : ''
                                    } ${color === '#ffffff' ? 'border-slate-300' : ''}`} />
                                ))}
                              </div>
                              <div className="mb-3">
                                <input type="range" min={0} max={100} value={qrCustomColorBlend}
                                  onChange={e => {
                                    const v = Number(e.target.value);
                                    setQrCustomColorBlend(v);
                                    setQrCustomColor(blendWithBlackWhite(qrCustomColorBase, v));
                                  }}
                                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                                  style={{
                                    background: `linear-gradient(90deg, #000, ${qrCustomColorBase} 50%, #fff)`,
                                    accentColor: qrCustomColorBase,
                                  }} />
                                <div className="flex items-center justify-between text-[8px] text-slate-400 mt-1 px-0.5">
                                  <span>oscuro</span>
                                  <span className="text-[8px] text-slate-400 font-mono">
                                    RGB {parseInt(qrCustomColor.slice(1,3), 16)} {parseInt(qrCustomColor.slice(3,5), 16)} {parseInt(qrCustomColor.slice(5,7), 16)}
                                  </span>
                                  <span>claro</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                <span className="w-7 h-7 rounded-full shrink-0 ring-1 ring-black/10"
                                  style={{ backgroundColor: qrCustomColor }} />
                                <div className="flex-1">
                                  <input type="text" value={qrCustomColor}
                                    onChange={e => { const v = e.target.value; if (/^#[0-9a-fA-F]{0,6}$/.test(v)) { setQrCustomColor(v); setQrCustomColorBase(v); setQrCustomColorBlend(50); } }}
                                    onBlur={() => { if (!/^#[0-9a-fA-F]{6}$/.test(qrCustomColor)) setQrCustomColor('#3525cd'); }}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-[11px] font-mono outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-center text-slate-400" />
                                </div>
                                <button type="button" onClick={() => {
                                  setQrCustomColorBase('#3525cd'); setQrCustomColorBlend(50); setQrCustomColor('#3525cd');
                                  setShowQrColorPicker(false);
                                }}
                                  className="text-[10px] text-slate-400 hover:text-slate-700 font-medium whitespace-nowrap shrink-0">
                                  Reset
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-0.5">Corrección de error</label>
                  <div className="flex gap-0.5">
                    {EC_LEVELS.map(({ value, label }) => (
                      <button key={value} type="button" onClick={() => setEcLevel(value)}
                      className="flex-1 py-1 rounded-lg text-[10px] font-bold transition-all border border-slate-200 text-slate-500 hover:bg-slate-50"
                      style={ecLevel === value ? {
                        backgroundColor: brand.colorHex,
                        color: '#fff',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      } : undefined}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug mt-0.5">{selectedEc.desc}</p>
                </div>
              </div>
            </div>

          </div>

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
              {showNewCardPreview ? (
                (() => {
                  const CardComponent = getCardComponent(form.cardTag)!;
                  return <CardComponent businessName={form.businessName || 'Tu negocio'}
                    cardTitle={selectedModel?.title || 'Tarjeta de Fidelidad'} cardTag={form.cardTag || 'Loyalty'}
                    colorHex={form.colorHex} secondaryColorHex={form.secondaryColorHex} totalStamps={form.totalStamps}
                    rewardDescription={form.rewardDescription || 'Recompensa'} category={form.category} logoUrl={form.logoUrl} />;
                })()
              ) : showRealisticPreview ? (
                <RealisticCard businessName={form.businessName || 'Tu negocio'}
                  cardTitle={selectedModel?.title || 'Tarjeta de Fidelidad'} cardTag={form.cardTag || 'Loyalty'}
                  colorHex={form.colorHex} totalStamps={form.totalStamps}
                  rewardDescription={form.rewardDescription || 'Recompensa'} category={form.category} logoUrl={form.logoUrl} secondaryColorHex={form.secondaryColorHex} />
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
