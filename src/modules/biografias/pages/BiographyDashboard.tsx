import React, { useState, useEffect, useRef } from 'react';
import { Biography, DemoUserRole, TemplateType, FontStyle, CardStyle } from '../types/biography';
import { getStoredBiographies, saveBiographies, INITIAL_BIOGRAPHIES } from '../data/biographyData';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';
import { DesignerPanel } from '../components/DesignerPanel';
import { ReviewsModule } from '../components/ReviewsModule';
import { PetModule } from '../components/PetModule';
import { WeddingModule } from '../components/WeddingModule';
import { VehicleModule } from '../components/VehicleModule';
import { SalonModule } from '../components/SalonModule';
import { GenericModule } from '../components/GenericModule';
import { CustomSectionsModule } from '../components/CustomSectionsModule';
import { FarmaciaModule } from '../components/FarmaciaModule';
import { DeportesModule } from '../components/DeportesModule';
import { MecanicoModule } from '../components/MecanicoModule';
import { InmobiliariaModule } from '../components/InmobiliariaModule';
import { ArtesaniasModule } from '../components/ArtesaniasModule';
import { TecnologiaModule } from '../components/TecnologiaModule';
import { DisenoModule } from '../components/DisenoModule';
import { VendedorModule } from '../components/VendedorModule';
import { AcarreosModule } from '../components/AcarreosModule';
import { TaxisModule } from '../components/TaxisModule';
import {
  Heart, Calendar, MapPin, Sparkles, MessageSquare, Plus, Check, Star,
  Share2, ShieldCheck, Eye, Compass, Layout, Palette, Crown,
  Smartphone, UserCheck, RefreshCw, Layers, ChevronRight, ChevronDown, CheckCircle2,
  Trash2, Archive, Tablet, Monitor, X, Rocket, Menu, LogIn, UserPlus,
  Camera, PawPrint, Gem, Car, Scissors, Globe, Pencil, LogOut, User as UserIcon,
  Settings, ChefHat, Building2, Truck
} from 'lucide-react';

type PreviewDevice = 'phone' | 'tablet' | 'web';

interface AuthUser {
  name: string;
  email: string;
  tags: string[];
}

const TEMPLATE_META: Record<TemplateType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  mascota:      { label: 'Mascota',        icon: PawPrint },
  boda:         { label: 'Boda',           icon: Gem },
  vehiculo:     { label: 'Vehículo',       icon: Car },
  salon:        { label: 'Estética',       icon: Scissors },
  generico:     { label: 'BioLink',        icon: Globe },
  farmacia:     { label: 'Farmacia',       icon: ShieldCheck },
  deportes:     { label: 'Entrenador',     icon: Sparkles },
  mecanico:     { label: 'Mecánico',       icon: Settings },
  inmobiliaria: { label: 'Agente Inmob.',  icon: Building2 },
  artesanias:   { label: 'Artesanías',     icon: Sparkles },
  tecnologia:   { label: 'Tecnología',     icon: Settings },
  diseno:       { label: 'Diseño & Pub.',  icon: Palette },
  vendedor:     { label: 'Vendedor',       icon: UserCheck },
  acarreos:     { label: 'Acarreos',       icon: Truck },
  taxis:        { label: 'Taxi',           icon: Car },
};

const PRESET_HEX: Record<string, string> = {
  emerald: '#10b981', rose: '#f43f5e', indigo: '#6366f1',
  violet: '#8b5cf6', amber: '#f59e0b', slate: '#64748b',
  fuchsia: '#d946ef', blue: '#3b82f6', orange: '#f97316',
};

const ACCENT_COLORS: { [key: string]: { border: string; bg: string; text: string; textLight: string; bgSoft: string; button: string; hex: string } } = {
  emerald: { border: 'border-emerald-500', bg: 'bg-emerald-600', text: 'text-emerald-700', textLight: 'text-emerald-500', bgSoft: 'bg-emerald-50/50', button: 'bg-emerald-600 hover:bg-emerald-700 text-white', hex: '#10b981' },
  rose: { border: 'border-rose-500', bg: 'bg-rose-600', text: 'text-rose-700', textLight: 'text-rose-500', bgSoft: 'bg-rose-50/40', button: 'bg-rose-600 hover:bg-rose-700 text-white', hex: '#f43f5e' },
  indigo: { border: 'border-indigo-500', bg: 'bg-indigo-600', text: 'text-indigo-700', textLight: 'text-indigo-500', bgSoft: 'bg-indigo-50/30', button: 'bg-indigo-600 hover:bg-indigo-700 text-white', hex: '#6366f1' },
  violet: { border: 'border-violet-500', bg: 'bg-violet-600', text: 'text-violet-700', textLight: 'text-violet-500', bgSoft: 'bg-violet-50/50', button: 'bg-violet-600 hover:bg-violet-700 text-white', hex: '#8b5cf6' },
  amber: { border: 'border-amber-500', bg: 'bg-amber-600', text: 'text-amber-700', textLight: 'text-amber-500', bgSoft: 'bg-amber-50/50', button: 'bg-amber-600 hover:bg-amber-700 text-white', hex: '#f59e0b' },
  slate: { border: 'border-slate-500', bg: 'bg-slate-700', text: 'text-slate-800', textLight: 'text-slate-500', bgSoft: 'bg-slate-100/50', button: 'bg-slate-700 hover:bg-slate-800 text-white', hex: '#64748b' },
  fuchsia: { border: 'border-fuchsia-500', bg: 'bg-fuchsia-600', text: 'text-fuchsia-700', textLight: 'text-fuchsia-500', bgSoft: 'bg-fuchsia-50/40', button: 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white', hex: '#d946ef' },
  blue: { border: 'border-indigo-500', bg: 'bg-indigo-500', text: 'text-indigo-700', textLight: 'text-indigo-500', bgSoft: 'bg-indigo-50/40', button: 'bg-indigo-500 hover:bg-indigo-600 text-white', hex: '#6366f1' },
  orange: { border: 'border-orange-500', bg: 'bg-orange-600', text: 'text-orange-700', textLight: 'text-orange-500', bgSoft: 'bg-orange-50/40', button: 'bg-orange-600 hover:bg-orange-700 text-white', hex: '#f97316' },
};

const fontClassMap: Record<string, string> = {
  sans: 'font-sans', display: 'font-display', serif: 'font-serif', mono: 'font-mono',
  grotesk: 'font-mono', dm: 'font-sans', jakarta: 'font-jakarta', poppins: 'font-display',
  montserrat: 'font-jakarta', nunito: 'font-display'
};

const cardStylesMap: { [key in CardStyle]: string } = {
  glass: 'bg-white/80 backdrop-blur-md border border-white/40 shadow-sm rounded-3xl',
  flat: 'bg-white border border-slate-100 rounded-2xl shadow-none',
  warm: 'bg-amber-50/20 border border-amber-100/40 rounded-3xl shadow-md',
  neo: 'bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl',
  cyberpunk: 'bg-slate-800 border border-slate-600 text-white rounded-xl shadow-sm',
  clinico: 'bg-white border border-sky-100 rounded-xl shadow-sm',
  deportes: 'bg-slate-600 border border-slate-500 text-white rounded-xl shadow-sm',
  industrial: 'bg-amber-50/90 border-2 border-amber-800 rounded-lg shadow-[3px_3px_0px_0px_rgba(146,64,14,0.3)]',
  lujo: 'bg-white/95 border border-yellow-200/60 rounded-2xl shadow-lg shadow-yellow-900/5',
  natural: 'bg-emerald-50/60 border border-emerald-200/40 rounded-2xl shadow-sm'
};

export default function BiographyDashboard() {
  const { brand } = useModuleBrand();
  const [chipHovered, setChipHovered] = useState(false);
  const [biographies, setBiographies] = useState<Biography[]>(() => getStoredBiographies());
  const [activeBioId, setActiveBioId] = useState<string>('bio-max-pet');
  const [currentRole, setCurrentRole] = useState<DemoUserRole>('creador');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice | null>(null);
  const [canvasDevice, setCanvasDevice] = useState<PreviewDevice>('web');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [bioDetailsId, setBioDetailsId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<TemplateType | 'todas'>('todas');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authTags, setAuthTags] = useState<string[]>([]);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [editDescValue, setEditDescValue] = useState('');
  const [bioSectionCollapsed, setBioSectionCollapsed] = useState(false);
  const [bioCustomSectionCollapsed, setBioCustomSectionCollapsed] = useState(true);
  const [bioReviewsCollapsed, setBioReviewsCollapsed] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newType, setNewType] = useState<TemplateType>('generico');
  const carouselRef = useRef<HTMLDivElement>(null);

  const currentBio = biographies.find((b) => b.id === activeBioId) || biographies[0];

  useEffect(() => {
    if (currentBio) {
      setEditTitleValue(currentBio.title);
      setEditDescValue(currentBio.description);
      setIsEditingDesc(false);
      window.history.replaceState(null, '', `/${currentBio.slug}`);
    }
  }, [currentBio?.id, currentBio?.slug]);

  function getAccentHex(): string {
    const tc = currentBio.style.themeColor;
    if (tc.startsWith('#')) return tc;
    return PRESET_HEX[tc] || '#6366f1';
  }

  const handleDiscoverService = (type: TemplateType) => {
    let title = '';
    let description = '';
    let themeColor = 'indigo';
    let cardStyle: CardStyle = 'glass';
    let bgGradient = true;

    if (type === 'mascota') { title = 'Fito - Mascota Guardián'; description = 'Bitácora de vacunas, alergias y contactos veterinarios oficiales de Fito.'; themeColor = 'emerald'; }
    else if (type === 'boda') { title = 'Invitación de Clara y Juan'; description = 'Nuestra confirmación RSVP interactiva con ubicación y álbum compartido de recuerdos.'; themeColor = 'rose'; cardStyle = 'warm'; }
    else if (type === 'vehiculo') { title = 'Bitácora Moto 500r'; description = 'Récord de mantenimiento, aceite, afinación de motor y vencimiento de SOAT.'; themeColor = 'slate'; cardStyle = 'neo'; bgGradient = false; }
    else if (type === 'salon') { title = 'Glow Spa & Estética'; description = 'Programa tu turno interactivo de keratina o limpieza facial de Stella.'; themeColor = 'violet'; cardStyle = 'flat'; bgGradient = false; }
    else if (type === 'farmacia') { title = 'Farmacia Salud Total'; description = 'Medicamentos, servicios farmacéuticos y horarios de atención.'; themeColor = 'emerald'; cardStyle = 'clinico'; }
    else if (type === 'deportes') { title = 'FitZone Training'; description = 'Rutinas personalizadas, entrenamiento funcional y logros deportivos.'; themeColor = 'indigo'; cardStyle = 'deportes'; bgGradient = false; }
    else if (type === 'mecanico') { title = 'Taller El Rush'; description = 'Servicio técnico especializado, cotizaciones y certificaciones.'; themeColor = 'amber'; cardStyle = 'industrial'; }
    else if (type === 'inmobiliaria') { title = 'Inmobiliaria Horizonte'; description = 'Propiedades en venta y arriendo con tours virtuales.'; themeColor = 'violet'; cardStyle = 'lujo'; }
    else if (type === 'artesanias') { title = 'Artesanías de la Abuela'; description = 'Artesanías hechas a mano, productos únicos y personalizados.'; themeColor = 'fuchsia'; cardStyle = 'warm'; }
    else if (type === 'tecnologia') { title = 'DevAndres Tech'; description = 'Desarrollo web, apps y soluciones tecnológicas personalizadas.'; themeColor = 'blue'; cardStyle = 'neo'; }
    else if (type === 'diseno') { title = 'StudioCreativo'; description = 'Diseño gráfico, branding y publicidad para tu marca.'; themeColor = 'rose'; cardStyle = 'flat'; }
    else if (type === 'vendedor') { title = 'Carlos Vélez Ventas'; description = 'Asesoría comercial, ventas directas y atención personalizada.'; themeColor = 'emerald'; cardStyle = 'glass'; }
    else if (type === 'acarreos') { title = 'Mudanzas y Acarreos Don Juan'; description = 'Servicio de acarreos, mudanzas y fletes en toda la ciudad.'; themeColor = 'orange'; cardStyle = 'industrial'; }
    else if (type === 'taxis') { title = 'Taxi Express Seguro'; description = 'Servicio de taxi particular, viajes seguros y tarifas justas.'; themeColor = 'amber'; cardStyle = 'flat'; }
    else { title = 'Portafolio de Carlos Silva'; description = 'Landing page modular con links de redes sociales y feedback de clientes.'; themeColor = 'indigo'; cardStyle = 'cyberpunk'; }

    const cleanSlug = `${type}-discovered-${Math.floor(100 + Math.random() * 900)}`;
    const newBio: Biography = {
      id: `bio-${Date.now()}`, slug: cleanSlug, title, description, templateType: type,
      style: { themeColor, backgroundColor: type === 'vehiculo' ? 'bg-slate-100' : 'bg-indigo-50/50', bgGradient, fontStyle: type === 'boda' ? 'serif' : type === 'vehiculo' ? 'mono' : type === 'deportes' ? 'grotesk' : 'sans', cardStyle, customWallpaper: 'linear-gradient(135deg, #e0f2fe 0%, #ede9fe 100%)' },
      reviews: [], googleReviews: [], customSections: [{ id: `sec-disc-${Date.now()}`, title: 'Galería de Bienvenida', description: 'Documentos o enlaces precargados de este nuevo servicio.', resources: [{ id: `res-disc-${Date.now()}-1`, title: `Guía práctica de ${type === 'mascota' ? 'Alimentación' : type === 'boda' ? 'RSVP' : 'Mantenimiento'}`, type: 'enlace', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400', description: 'Preset inicial autogenerado al descubrir este servicio.', dateAdded: new Date().toISOString().split('T')[0] }] }]
    };

    if (type === 'mascota') newBio.pet = { name: 'Fito', species: 'Perro', breed: 'Border Collie', age: '2 años', birthDate: '2024-03-12', ownerName: 'Mónica Silva', ownerContact: '+311 990-2182', avatarUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400', medicalHistory: [{ id: `med-${Date.now()}`, date: new Date().toISOString().split('T')[0], title: 'Refuerzo de Parvovirus', veterinarian: 'Dra. Amelia Ortiz', description: 'Refuerzo inyectable exitosamente registrado por el veterinario.', status: 'completado', type: 'vacuna' }], certificates: [], externalServices: {} };
    else if (type === 'boda') newBio.wedding = { groomName: 'Juan', brideName: 'Clara', date: '2026-12-15', locationName: 'Jardín Las Margaritas, Bogotá', story: 'Nos enamoramos viajando y hoy decidimos dar el paso definitivo de nuestras vidas en este hermoso campo.', coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200', rsvps: [], photoAlbum: [] };
    else if (type === 'vehiculo') newBio.vehicle = { brand: 'Honda', model: 'CB500X', year: 2023, plate: 'ZZX-88G', color: 'Negro Mate', soatPolicyNumber: 'POL-SOAT-HONDA-123', soatExpiryDate: '2027-02-18', technomechanicalDate: '2027-06-20', avatarUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=400', maintenanceHistory: [], documentsPreview: [] };
    else if (type === 'salon') newBio.salon = { name: 'Glow Spa & Estética', address: 'Carrera 14 #15-22, Envigado', phone: '+57 325-1110', schedule: 'Lunes a Sábado: 8:00 AM - 7:00 PM', services: [{ id: `srv-${Date.now()}`, name: 'Limpieza Facial Profunda', price: 60000, duration: 45, category: 'Facial', description: 'Retiro de células muertas con espátula ultrasónica y mascarilla.', iconName: 'Sparkles' }], appointments: [] };
    else if (type === 'farmacia') newBio.farmacia = { name: 'Farmacia Salud Total', address: 'Calle 10 #24-50, Medellín', phone: '+57 604 555-0199', schedule: 'Lun-Sáb 7:00 AM - 10:00 PM, Dom 8:00 AM - 8:00 PM', pharmacistName: 'María García', services: [{ name: 'Toma de presión arterial', description: 'Control gratuito', duration: '5 min' }], products: [{ name: 'Acetaminofén 500mg', price: 3200, category: 'Analgésico', requiresPrescription: false, description: '30 tabletas' }] };
    else if (type === 'deportes') newBio.deportes = { name: 'FitZone Training', specialty: 'Entrenamiento Funcional y HIIT', location: 'Cra 43 #15-22, El Poblado', schedule: 'Lun-Vie 5:00 AM - 10:00 PM, Sáb 6:00 AM - 4:00 PM', avatarUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400', routines: [{ id: 'r1', name: 'Full Body Explosivo', day: 'Lunes', exercises: 'Sentadillas, burpees, dominadas, plancha', duration: 45, level: 'intermedio' }], achievements: ['Certificación NASM'] };
    else if (type === 'mecanico') newBio.mecanico = { name: 'Taller El Rush', address: 'Av. Las Vegas #35-12, Itagüí', phone: '+57 604 555-8877', specialty: 'Motores Diesel y Gasolina', schedule: 'Lun-Vie 7:00 AM - 6:00 PM, Sáb 7:00 AM - 2:00 PM', services: [{ name: 'Cambio de aceite y filtros', description: 'Aceite sintético 5W-30', estimatedPrice: 180000, duration: '45 min' }], certifications: ['Certificado por AUDI'] };
    else if (type === 'inmobiliaria') newBio.inmobiliaria = { name: 'Inmobiliaria Horizonte', agent: 'Carolina Mejía', phone: '+57 604 555-2211', email: 'carolina@horizonte.co', properties: [{ id: 'prop-1', title: 'Apartamento en El Poblado', type: 'venta', price: 520000000, area: 120, bedrooms: 3, bathrooms: 2, location: 'El Poblado, Medellín', description: 'Torre con piscina, gimnasio y vigilancia 24h.', imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600' }] };
    else if (type === 'artesanias') newBio.artesanias = { name: 'Artesanías de la Abuela', specialty: 'Tejidos, cerámica y bisutería artesanal', location: 'Medellín, Colombia', contact: '+57 300 123 4567', avatarUrl: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&q=80&w=400', products: ['Tejidos a mano', 'Cerámica decorativa'], achievements: ['Premio Nacional de Artesanías 2025'] };
    else if (type === 'tecnologia') newBio.tecnologia = { name: 'Andrés Tech', role: 'Desarrollador Full Stack', company: 'Freelance', contact: '+57 300 987 6543', avatarUrl: 'https://images.unsplash.com/photo-1537511446984-935f663eb1f4?auto=format&fit=crop&q=80&w=400', skills: ['React', 'Node.js', 'Tailwind CSS', 'TypeScript', 'PostgreSQL'], projects: ['App Financiera', 'E-commerce Dashboard'] };
    else if (type === 'diseno') newBio.diseno = { name: 'StudioCreativo', specialty: 'Branding, Diseño Gráfico y Publicidad', portfolio: 'https://behance.net/studio-creativo', contact: '+57 300 456 7890', avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400', services: ['Identidad Visual', 'Diseño de Empaques', 'Publicidad Digital'], clients: ['Marca Local Co.', 'Agencia Nova'] };
    else if (type === 'vendedor') newBio.vendedor = { name: 'Carlos Vélez', company: 'Ventas Independientes', specialty: 'Asesoría comercial y ventas directas', contact: '+57 300 222 3344', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', products: ['Seguros de Vida', 'Planes de Salud', 'Créditos Hipotecarios'], achievements: ['Top Vendedor 2025'] };
    else if (type === 'acarreos') newBio.acarreos = { name: 'Don Juan', vehicleType: 'Camión de 5 toneladas', coverage: 'Medellín y Área Metropolitana', contact: '+57 300 555 6677', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', services: ['Mudanzas residenciales', 'Fletes comerciales', 'Acarreo de escombros'], rates: 'Desde $80.000 por viaje' };
    else if (type === 'taxis') newBio.taxis = { name: 'Taxi Express Seguro', company: 'Independiente', coverage: 'Medellín, Envigado, Itagüí, Sabaneta', contact: '+57 300 888 9900', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', services: ['Viajes urbanos', 'Traslados al aeropuerto', 'Viajes intermunicipales'], rates: 'Tarifa justa con taxímetro o precio fijo acordado' };
    else newBio.generic = { title: 'Carlos Silva', subtitle: 'Consultor UI/UX', description: 'Ayudando a startups a crear productos elegantes con React y Tailwind.', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', links: [{ id: `link-${Date.now()}`, title: 'Mi Portfolio', url: 'https://behance.net', icon: 'ExternalLink' }], socialLinks: {} };

    const updated = [...biographies, newBio];
    setBiographies(updated);
    saveBiographies(updated);
    setActiveBioId(newBio.id);
    setCurrentRole('creador');
  };

  const handleUpdateBiography = (updatedBio: Biography) => {
    const updatedList = biographies.map((b) => b.id === updatedBio.id ? updatedBio : b);
    setBiographies(updatedList);
    saveBiographies(updatedList);
  };

  const handleCreateBiography = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSlug.trim()) { alert('Por favor ingresa un título y ruta válidos.'); return; }
    const cleanSlug = newSlug.trim().toLowerCase().replace(/\s+/g, '-');
    if (biographies.find((b) => b.slug === cleanSlug)) { alert('Esta ruta/slug ya existe. Elige otra.'); return; }

    const newBio: Biography = {
      id: `bio-${Date.now()}`, slug: cleanSlug, title: newTitle, description: 'Esta es tu nueva biografía modular personalizable.',
      templateType: newType, style: { themeColor: 'indigo', backgroundColor: 'bg-indigo-50/50', bgGradient: true, fontStyle: 'sans', cardStyle: 'glass', customWallpaper: 'linear-gradient(135deg, #e0f2fe 0%, #ede9fe 100%)' },
      reviews: [], googleReviews: [],
    };

    if (newType === 'mascota') newBio.pet = { name: newTitle, species: 'Perro', breed: 'Mestizo de Oro', age: '1 año', birthDate: '2025-05-01', ownerName: 'Mónica Silva', ownerContact: '+311 990-2182', avatarUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400', medicalHistory: [{ id: `med-${Date.now()}-1`, date: '2026-05-15', title: 'Control de Vacunas Cachorro', veterinarian: 'Dra. Luz Morales', description: 'Fórmula básica y desparasitación inicial al día.', status: 'completado', type: 'vacuna' }], certificates: [{ id: `cert-${Date.now()}-1`, title: 'Permiso Sanitario de Viaje Nacional', date: '2026-05-20', author: 'Clínica Mascotas Felices', description: 'Apto para traslados cortos.', code: 'ICA-NEW-92' }], externalServices: {} };
    else if (newType === 'boda') newBio.wedding = { groomName: 'Juan Carlos', brideName: 'Estefanía', date: '2026-10-10', locationName: 'Santuario de la Loma, Buenos Aires', googleMapsUrl: 'https://maps.google.com', story: 'Nos enamoramos compartiendo apuntes en clase de literatura.', coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200', rsvps: [{ id: `rsvp-${Date.now()}-1`, name: 'Mónica Silva', status: 'pendiente', companions: 0, email: 'monica@gmail.com' }], photoAlbum: [{ id: `pic-${Date.now()}-1`, url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600', caption: 'Nuestra primera escapada juntos', uploadedBy: 'Juan Carlos', date: '2026-05-10' }] };
    else if (newType === 'vehiculo') newBio.vehicle = { brand: 'Ford', model: 'Mustang Shelby', year: 2021, plate: 'SBY-829', color: 'Rojo Carmesí', soatPolicyNumber: 'SOAT-AXA-NEW-A', soatExpiryDate: '2026-12-25', soatUrl: '', technomechanicalDate: '2026-11-20', technomechanicalUrl: '', avatarUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400', maintenanceHistory: [{ id: `maint-${Date.now()}-1`, date: '2026-05-18', mileage: 12400, type: 'Rotación de Llantas Pirelli', price: 150000, workshop: 'Llantas del Norte', notes: 'Alineación completa y balanceo preventivo.', imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400' }], documentsPreview: [{ title: 'SOAT Cobertura AXA', expiryDate: '2026-12-25', fileUrl: 'soat-ford.pdf' }] };
    else if (newType === 'salon') newBio.salon = { name: newTitle, address: 'Carrera 45 #12-54, Cali', phone: '+4 551-8290', schedule: 'Lunes a Sábados: 8AM - 8PM', services: [{ id: `srv-${Date.now()}-1`, name: 'Cepillado Keratina', price: 75000, duration: 90, category: 'Corte & Peinado', description: 'Procedimiento de suavizado térmico con aceites acondicionadores.', iconName: 'Scissors' }], appointments: [{ id: `apt-${Date.now()}-1`, serviceId: `srv-${Date.now()}-1`, serviceName: 'Cepillado Keratina', clientName: 'María Clara', clientPhone: '315 220-4100', date: '2026-05-25', time: '11:30 AM', status: 'confirmada' }] };
    else newBio.generic = { title: newTitle, subtitle: 'Consultor Digital y Asesor', description: 'Construyendo landing pages modulares de alto impacto visual.', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', links: [{ id: `link-${Date.now()}-1`, title: 'Agendar una reunión de asesoría', url: 'https://calendly.com', description: 'Consulta de 30 minutos sin costo', icon: 'Globe', isHighlighted: true }], socialLinks: { whatsapp: 'https://wa.me/3115550000', instagram: 'https://instagram.com' } };

    const updated = [...biographies, newBio];
    setBiographies(updated);
    saveBiographies(updated);
    setActiveBioId(newBio.id);
    setNewTitle('');
    setNewSlug('');
    setShowCreateModal(false);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('¿Deseas restaurar todas las biografías a los valores de demostración iniciales?')) {
      setBiographies(INITIAL_BIOGRAPHIES);
      saveBiographies(INITIAL_BIOGRAPHIES);
      setActiveBioId('bio-max-pet');
      setCurrentRole('creador');
    }
  };

  const handleBioSelect = (id: string, _type: TemplateType) => {
    setActiveBioId(id);
    setCurrentRole('creador');
  };

  if (biographies.length === 0) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="space-y-2 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto" style={{ color: brand.colorHex }} />
          <p className="text-sm font-semibold tracking-wide">Cargando Ecosistema de Biografías...</p>
        </div>
      </div>
    );
  }

  const activePresetId = currentBio.style.themeColor.startsWith('#') ? 'indigo' : currentBio.style.themeColor;
  const activeColor = ACCENT_COLORS[activePresetId] || ACCENT_COLORS.indigo;
  const activeFontFamily = fontClassMap[currentBio.style.fontStyle] || 'font-sans';
  const activeCardStyle = cardStylesMap[currentBio.style.cardStyle] || cardStylesMap.glass;

  const renderBioBody = (opts: { compact?: boolean; editable?: boolean } = {}) => {
    const editable = opts.editable ?? (currentRole === 'creador');
    const pad = opts.compact ? 'p-3 pt-7' : 'p-4 sm:p-6 lg:p-8';
    const accentHex = getAccentHex();
    return (
      <div className={`w-full h-full overflow-y-auto rounded-[inherit] ${pad} text-left transition-all relative ${activeFontFamily}`}
        style={{ background: currentBio.style.customWallpaper || '#f8fafc', color: currentBio.style.customWallpaper?.includes('#09090b') ? '#ffffff' : '#0f172a', '--accent': accentHex } as React.CSSProperties}
      >
        <div className={`${activeCardStyle} p-3 sm:p-4 transition-all mb-3 relative overflow-hidden`} style={{ borderColor: `${accentHex}30` }}>
          {editable ? (
            <div className="group cursor-text" onClick={() => setIsEditingDesc(true)}>
              <div className="flex items-center justify-between pb-1" style={{ borderBottom: `1px solid ${accentHex}20` }}>
                <span className={`text-[8px] sm:text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1 select-none`} style={{ color: accentHex }}>
                  <Crown className="w-3 h-3" style={{ color: accentHex }} /> Título & Bio Editables
                </span>
                {isEditingDesc ? (
                  <button onClick={(e) => { e.stopPropagation(); setIsEditingDesc(false); }} className="text-[10px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1">
                    <X className="w-3 h-3" /> Cerrar
                  </button>
                ) : (
                  <span className={`text-[8px] sm:text-[10px] font-extrabold transition-colors flex items-center gap-1`} style={{ color: accentHex }}>
                    <Pencil className="w-3 h-3" /> Editar
                  </span>
                )}
              </div>
              {isEditingDesc ? (
                <div className="space-y-2 mt-2" onClick={(e) => e.stopPropagation()}>
                  <div>
                    <label className="block text-[8px] sm:text-[10px] text-slate-400 uppercase font-black mb-0.5">Título del Servicio</label>
                    <input type="text" value={editTitleValue} onChange={(e) => setEditTitleValue(e.target.value)}
                      className="w-full text-xs font-bold p-1.5 sm:p-2 bg-white rounded text-slate-800 placeholder:text-slate-400" style={{ border: `1px solid ${accentHex}40` }} placeholder="Título" />
                  </div>
                  <div>
                    <label className="block text-[8px] sm:text-[10px] text-slate-400 uppercase font-black mb-0.5">Descripción de la Bio</label>
                    <textarea value={editDescValue} onChange={(e) => setEditDescValue(e.target.value)}
                      className="w-full text-xs p-1.5 sm:p-2 bg-white rounded text-slate-800 placeholder:text-slate-400 h-16 sm:h-20 resize-none" style={{ border: `1px solid ${accentHex}40` }} placeholder="Introduce la biografía o detalles..." />
                  </div>
                  <div className="flex justify-end gap-1.5 pb-1">
                    <button type="button" onClick={() => setIsEditingDesc(false)} className="px-2 py-0.5 text-[8px] sm:text-xs bg-slate-100 text-slate-500 rounded font-bold">Conservar</button>
                    <button type="button" onClick={() => { handleUpdateBiography({ ...currentBio, title: editTitleValue, description: editDescValue }); setIsEditingDesc(false); }}
                      className="px-2.5 py-0.5 text-[8px] sm:text-xs rounded font-bold inline-flex items-center gap-1 text-white" style={{ backgroundColor: accentHex }}>
                      <Check className="w-3 h-3" /> Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 space-y-1">
                  <h2 className="text-xs sm:text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight font-display">{currentBio.title}</h2>
                  <p className="text-[10px] sm:text-sm text-slate-500 font-normal leading-relaxed">{currentBio.description}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <h2 className="text-xs sm:text-lg lg:text-xl font-black text-slate-900 tracking-tight font-display">{currentBio.title}</h2>
              <p className="text-[10px] sm:text-sm text-slate-500 font-normal leading-relaxed">{currentBio.description}</p>
            </div>
          )}
        </div>

        <div className={`${activeCardStyle} p-3 sm:p-4 transition-all mb-3 bio-accent-border`} style={{ borderColor: `color-mix(in srgb, var(--accent, #6366f1) 15%, transparent)` }}>
          <button type="button" onClick={() => setBioSectionCollapsed(!bioSectionCollapsed)}
            className="w-full flex items-center justify-between text-[9px] font-extrabold uppercase tracking-widest mb-2" style={{ color: accentHex }}>
            <span>{TEMPLATE_META[currentBio.templateType]?.label || 'Servicio'}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${bioSectionCollapsed ? '' : 'rotate-180'}`} />
          </button>
          {!bioSectionCollapsed && (
            <div className="space-y-3">
              {currentBio.templateType === 'mascota' && <PetModule currentBio={currentBio} role={currentRole} onUpdateBio={handleUpdateBiography} />}
              {currentBio.templateType === 'boda' && <WeddingModule currentBio={currentBio} role={currentRole} onUpdateBio={handleUpdateBiography} />}
              {currentBio.templateType === 'vehiculo' && <VehicleModule currentBio={currentBio} role={currentRole} onUpdateBio={handleUpdateBiography} />}
              {currentBio.templateType === 'salon' && <SalonModule currentBio={currentBio} role={currentRole} onUpdateBio={handleUpdateBiography} />}
              {currentBio.templateType === 'generico' && <GenericModule currentBio={currentBio} role={currentRole} onUpdateBio={handleUpdateBiography} />}
              {currentBio.templateType === 'farmacia' && <FarmaciaModule currentBio={currentBio} role={currentRole} onUpdateBio={handleUpdateBiography} />}
              {currentBio.templateType === 'deportes' && <DeportesModule currentBio={currentBio} role={currentRole} onUpdateBio={handleUpdateBiography} />}
              {currentBio.templateType === 'mecanico' && <MecanicoModule currentBio={currentBio} role={currentRole} onUpdateBio={handleUpdateBiography} />}
              {currentBio.templateType === 'inmobiliaria' && <InmobiliariaModule currentBio={currentBio} role={currentRole} onUpdateBio={handleUpdateBiography} />}
              {currentBio.templateType === 'artesanias' && <ArtesaniasModule currentBio={currentBio} role={currentRole} onUpdateBio={handleUpdateBiography} />}
              {currentBio.templateType === 'tecnologia' && <TecnologiaModule currentBio={currentBio} role={currentRole} onUpdateBio={handleUpdateBiography} />}
              {currentBio.templateType === 'diseno' && <DisenoModule currentBio={currentBio} role={currentRole} onUpdateBio={handleUpdateBiography} />}
              {currentBio.templateType === 'vendedor' && <VendedorModule currentBio={currentBio} role={currentRole} onUpdateBio={handleUpdateBiography} />}
              {currentBio.templateType === 'acarreos' && <AcarreosModule currentBio={currentBio} role={currentRole} onUpdateBio={handleUpdateBiography} />}
              {currentBio.templateType === 'taxis' && <TaxisModule currentBio={currentBio} role={currentRole} onUpdateBio={handleUpdateBiography} />}
            </div>
          )}
        </div>

        <div className={`${activeCardStyle} p-3 sm:p-4 transition-all mb-3 bio-accent-border`}>
          <button type="button" onClick={() => setBioCustomSectionCollapsed(!bioCustomSectionCollapsed)}
            className="w-full flex items-center justify-between text-[9px] font-extrabold uppercase tracking-widest" style={{ color: accentHex }}>
            <span>Secciones Personalizadas</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${bioCustomSectionCollapsed ? '' : 'rotate-180'}`} />
          </button>
          {!bioCustomSectionCollapsed && (
            <div className="mt-2 space-y-3">
              <CustomSectionsModule currentBio={currentBio} role={currentRole} onUpdateBio={handleUpdateBiography} />
            </div>
          )}
        </div>

        <div className={`${activeCardStyle} p-3 sm:p-4 transition-all bio-accent-border`}>
          <button type="button" onClick={() => setBioReviewsCollapsed(!bioReviewsCollapsed)}
            className="w-full flex items-center justify-between text-[9px] font-extrabold uppercase tracking-widest mb-2" style={{ color: accentHex }}>
            <span>Reseñas</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${bioReviewsCollapsed ? '' : 'rotate-180'}`} />
          </button>
          {!bioReviewsCollapsed && (
            <ReviewsModule currentBio={currentBio} role={currentRole} onUpdateBio={handleUpdateBiography} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden text-slate-800">
      {/* Secondary bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 h-12 flex flex-row items-center justify-between gap-2 select-none overflow-hidden flex-shrink-0">
        {/* LEFT — chip */}
        <div className="flex items-center gap-3">
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
            <Globe
              className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300"
              style={{ transform: chipHovered ? 'rotate(-15deg) scale(1.2)' : 'none' }}
            />
            <span className="text-[12px] font-bold font-sans whitespace-nowrap flex-shrink-0">Ecosistema Activo</span>
            <span
              className="text-[12px] font-light font-sans whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out"
              style={{
                maxWidth: chipHovered ? '600px' : '0px',
                opacity: chipHovered ? 1 : 0,
                paddingLeft: chipHovered ? '6px' : '0px',
                color: `${brand.colorHex}99`,
              }}
            >
              · Crea y administra biografías interactivas
            </span>
          </div>
          <button onClick={() => setShowCreateModal(true)}
            className="inline-flex px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-xs transition-all active:scale-95 items-center gap-1.5"
            title="Crear nueva biografía">
            <Plus className="w-3.5 h-3.5" /> Nueva Bio
          </button>
        </div>

        {/* RIGHT — role toggle */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mr-1 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" style={{ color: brand.colorHex }} /> Vista:
          </span>
          <button onClick={() => setCurrentRole('creador')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 text-xs border ${currentRole === 'creador' ? 'text-white shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`} style={currentRole === 'creador' ? { backgroundColor: brand.colorHex, borderColor: brand.colorHex } : undefined}>
            <Crown className="w-3 h-3" /> Propietario
          </button>
          <button onClick={() => setCurrentRole('publico')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 text-xs border ${currentRole === 'publico' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
            <Eye className="w-3 h-3" /> Público / Cliente
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 overflow-y-auto items-start">
        {/* Left Panel — Selection & Controls */}
        <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 space-y-3 flex flex-col">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: brand.colorHex }}>Biografías Con Propósito</span>
              <span className="text-[9px] text-slate-300">/</span>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight font-display">BioBuilder modular</h1>
            </div>
            <p className="text-2xs text-slate-500 leading-normal mt-0.5">Páginas dinámicas interactivas para tu negocio o evento todo en un solo lugar.</p>
          </div>

          {currentRole === 'creador' && (
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-950 text-white rounded-2xl p-3.5 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2">
                  <Compass className="w-3 h-3 animate-pulse" style={{ color: brand.colorHex }} />
                  <span className="text-[8px] font-extrabold uppercase tracking-widest" style={{ color: brand.colorHex }}>Catálogo de Servicios</span>
                  <span className="ml-auto text-[8px]" style={{ color: `${brand.colorHex}99` }}>Pasa el cursor para vista previa</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {([
                  { type: 'mascota', label: 'Mascota', desc: 'Vacunas, salud y certificados de viaje.' },
                  { type: 'boda', label: 'Boda', desc: 'Invitaciones, RSVP y álbum compartido.' },
                  { type: 'vehiculo', label: 'Vehículo', desc: 'SOAT, mantenimiento y guías mecánicas.' },
                  { type: 'salon', label: 'Estética', desc: 'Reserva citas y catálogo de servicios.' },
                  { type: 'generico', label: 'BioLink', desc: 'Landing de marca con enlaces y reseñas.' },
                  { type: 'farmacia', label: 'Farmacia', desc: 'Medicamentos, horarios y servicios.' },
                  { type: 'deportes', label: 'Entrenador', desc: 'Rutinas, clases y logros deportivos.' },
                  { type: 'mecanico', label: 'Mecánico', desc: 'Taller, cotizaciones y certificaciones.' },
                  { type: 'inmobiliaria', label: 'Agente Inmob.', desc: 'Propiedades en venta y arriendo.' },
                  { type: 'artesanias', label: 'Artesanías', desc: 'Productos hechos a mano y personalizados.' },
                  { type: 'tecnologia', label: 'Tecnología', desc: 'Desarrollo web, apps y soluciones tech.' },
                  { type: 'diseno', label: 'Diseño & Pub.', desc: 'Branding, diseño gráfico y publicidad.' },
                  { type: 'vendedor', label: 'Vendedor', desc: 'Asesoría comercial y ventas directas.' },
                  { type: 'acarreos', label: 'Acarreos', desc: 'Mudanzas, fletes y transporte de carga.' },
                  { type: 'taxis', label: 'Taxi', desc: 'Viajes urbanos, aeropuerto y rutas.' },
                ] as { type: TemplateType; label: string; desc: string }[]).map((serv) => (
                  <button key={serv.type} onClick={() => handleDiscoverService(serv.type)}
                    className="group relative px-2.5 py-1.5 bg-white/8 hover:bg-white/15 rounded-lg border border-white/5 transition-all text-[10px] font-bold flex items-center gap-1.5"
                    title={serv.desc}
                    style={{ '--brand-color': brand.colorHex } as React.CSSProperties}>
                    {React.createElement(TEMPLATE_META[serv.type].icon, { className: 'w-3 h-3', style: { color: brand.colorHex } })}
                    <span>{serv.label}</span>
                    <span className="ml-0.5 text-[8px]" style={{ color: `${brand.colorHex}80` }}>+</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-900 text-white text-[9px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">{serv.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Mis Biografías Activas</span>
              <span className="text-[9px] font-mono font-bold px-1.5 rounded-sm" style={{ color: brand.colorHex, backgroundColor: `${brand.colorHex}12` }}>{biographies.length} activas</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {([{ id: 'todas', label: 'Todas' } as const, ...Object.entries(TEMPLATE_META).map(([id]) => ({ id: id as TemplateType, label: TEMPLATE_META[id as TemplateType].label }))]).map((cat) => (
                <button key={cat.id} onClick={() => setCategoryFilter(cat.id)}
                  className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border transition-colors ${categoryFilter === cat.id ? 'text-white' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`} style={categoryFilter === cat.id ? { backgroundColor: brand.colorHex, borderColor: brand.colorHex } : undefined}>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="relative group">
              <button type="button" onClick={() => carouselRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/90 border border-slate-200 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -ml-3" style={{ color: brand.colorHex }}>‹</button>
              <button type="button" onClick={() => carouselRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/90 border border-slate-200 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -mr-3" style={{ color: brand.colorHex }}>›</button>
              <div ref={carouselRef} className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none scroll-smooth">
                {biographies.filter((bio) => categoryFilter === 'todas' || bio.templateType === categoryFilter).map((bio) => {
                  const isActive = bio.id === activeBioId;
                  const meta = TEMPLATE_META[bio.templateType];
                  const Icon = meta.icon;
                  return (
                    <div key={bio.id} className={`snap-start shrink-0 w-[180px] p-3 rounded-xl border transition-all text-left flex flex-col justify-between min-h-[120px] ${isActive ? 'shadow-xs' : 'border-slate-200 bg-white/80 hover:border-slate-300'}`} style={isActive ? { borderColor: brand.colorHex, backgroundColor: `${brand.colorHex}0D`, boxShadow: `0 0 0 1px ${brand.colorHex}1A` } : undefined}>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md ${isActive ? 'text-white' : 'bg-slate-100 text-slate-500'}`} style={isActive ? { backgroundColor: brand.colorHex } : undefined}>
                            <Icon className="w-3 h-3" />
                          </span>
                          <span className={`text-[7px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${isActive ? 'text-white' : 'bg-slate-50 border-slate-200 text-slate-400'}`} style={isActive ? { backgroundColor: brand.colorHex, borderColor: brand.colorHex } : undefined}>{meta.label}</span>
                        </div>
                        <h4 className={`text-[11px] font-bold truncate ${isActive ? '' : 'text-slate-800'}`} style={isActive ? { color: brand.colorHex } : undefined}>{bio.title}</h4>
                        <p className="text-[9px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">{bio.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-slate-100">
                        <button onClick={() => handleBioSelect(bio.id, bio.templateType)}
                          className={`text-[8px] font-bold px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${isActive ? '' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`} style={isActive ? { backgroundColor: `${brand.colorHex}20`, color: brand.colorHex } : undefined}>
                          <Eye className="w-2.5 h-2.5" /> {isActive ? 'Viendo' : 'Ver'}
                        </button>
                        <button onClick={() => setBioDetailsId(bio.id)}
                          className="text-[8px] font-bold px-2 py-1 rounded-md text-slate-400 border border-slate-200 transition-colors" style={{ color: brand.colorHex }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${brand.colorHex}12` }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}>
                          <Pencil className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {currentRole === 'creador' && (
              <div className="flex gap-2 pt-1 border-t border-slate-100">
                <button onClick={() => setShowCreateModal(true)}
                  className="flex-1 py-2 text-center font-bold text-white rounded-lg hover:opacity-90 transition active:scale-95 flex items-center justify-center gap-1 text-[10px]" style={{ backgroundColor: brand.colorHex }}>
                  <Plus className="w-3 h-3" /> Nueva
                </button>
                <button onClick={handleResetToDefaults}
                  className="flex-1 py-2 text-center font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition text-[10px]">
                  Resetear
                </button>
              </div>
            )}
          </div>

          <DesignerPanel currentBio={currentBio} onUpdateBio={handleUpdateBiography}
            onPublish={() => setPreviewDevice('web')}
            onJsonImport={(parsed) => { const updated = [...biographies, { ...parsed, id: `bio-import-${Date.now()}` }]; setBiographies(updated); saveBiographies(updated); setActiveBioId(updated[updated.length - 1].id); alert(`Plantilla "${parsed.title || 'sin título'}" importada correctamente.`); }}
            buttonLabel={currentRole === 'creador' ? 'Guardar Bio' : 'Publicar Bio'} />
        </div>

        {/* Center — Canvas */}
        <div className="flex-1 w-full flex flex-col items-stretch lg:sticky lg:top-0">
          <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              {currentRole === 'creador' && <><Crown className="w-3.5 h-3.5" style={{ color: brand.colorHex }} /> MODO DISEÑO — Edita el estilo en el panel superior.</>}
              {currentRole === 'publico' && <><Eye className="w-3.5 h-3.5" style={{ color: brand.colorHex }} /> MODO PÚBLICO — Califica o programa servicios.</>}
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
                {(['web', 'tablet', 'phone'] as PreviewDevice[]).map((dev) => {
                  const Icon = dev === 'web' ? Monitor : dev === 'tablet' ? Tablet : Smartphone;
                  const active = canvasDevice === dev;
                  return (
                    <button key={dev} onClick={() => setCanvasDevice(dev)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold capitalize transition-colors ${active ? 'text-white' : 'text-slate-500 hover:bg-slate-100'}`} style={active ? { backgroundColor: brand.colorHex } : undefined}
                      title={`Vista ${dev}`}>
                      <Icon className="w-3 h-3" /> {dev}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setPreviewDevice(canvasDevice)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border transition text-[10px] font-bold" style={{ borderColor: `${brand.colorHex}40`, backgroundColor: `${brand.colorHex}12`, color: brand.colorHex }}>
                <Rocket className="w-3 h-3" /> Pantalla completa
              </button>
            </div>
          </div>

          <div className="w-full bg-slate-100 border border-slate-200 rounded-2xl p-4 sm:p-6 flex items-start justify-center overflow-auto">
            {canvasDevice === 'web' && (
              <div className="w-full max-w-[1100px] bg-white rounded-xl border border-slate-300 shadow-lg overflow-hidden">
                <div className="h-8 bg-slate-100 border-b border-slate-200 flex items-center px-3 gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 mx-3 h-5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-500 px-2 flex items-center truncate">biolink.pro/{currentBio.slug}</div>
                </div>
                <div className="w-full min-h-[640px]">{renderBioBody({ compact: false })}</div>
              </div>
            )}
            {canvasDevice === 'tablet' && (
              <div className="w-full max-w-[760px] bg-slate-100 rounded-[1.5rem] p-2 border-[3px] border-slate-300/60 shadow-lg">
                <div className="w-full min-h-[700px] bg-white rounded-[1.25rem] overflow-hidden">{renderBioBody({ compact: false })}</div>
              </div>
            )}
            {canvasDevice === 'phone' && (
              <div className="w-full max-w-[340px] bg-slate-100 rounded-[2.5rem] p-2 shadow-xl border-[3px] border-slate-300/60 relative overflow-hidden">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-200/80 rounded-full z-40 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-slate-300/60" />
                </div>
                <div className="w-full min-h-[640px] max-h-[640px] overflow-hidden rounded-[30px]">{renderBioBody({ compact: true })}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Preview */}
      {previewDevice && (() => {
        const deviceSizes: Record<PreviewDevice, { w: number; h: number; label: string; icon: React.ReactNode }> = {
          phone: { w: 390, h: 780, label: 'Phone — 390 × 780', icon: <Smartphone className="w-3.5 h-3.5" /> },
          tablet: { w: 820, h: 1100, label: 'Tablet — 820 × 1100', icon: <Tablet className="w-3.5 h-3.5" /> },
          web: { w: 1280, h: 800, label: 'Web — 1280 × 800', icon: <Monitor className="w-3.5 h-3.5" /> },
        };
        const current = deviceSizes[previewDevice];
        return (
          <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
            <div className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 text-white shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Rocket className="w-4 h-4 shrink-0" style={{ color: brand.colorHex }} />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest font-bold leading-none" style={{ color: brand.colorHex }}>Preview Publicación</p>
                  <p className="text-xs font-semibold truncate text-white/90">{currentBio.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-slate-800/70 border border-slate-700 rounded-xl p-1">
                {(Object.keys(deviceSizes) as PreviewDevice[]).map((dev) => {
                  const active = previewDevice === dev;
                  const meta = deviceSizes[dev];
                  return (
                    <button key={dev} onClick={() => setPreviewDevice(dev)}
                      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${active ? 'text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`} style={active ? { backgroundColor: brand.colorHex } : undefined}>
                      {meta.icon} <span className="capitalize hidden sm:inline">{dev}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden md:inline text-[10px] font-mono text-slate-400 tracking-wider">{current.label}</span>
                <button onClick={() => setPreviewDevice(null)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-red-600 text-white transition-colors" title="Cerrar previsualización">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto flex items-start sm:items-center justify-center p-4 sm:p-8">
              <div className={`relative bg-white shadow-2xl overflow-hidden transition-all duration-300 ${previewDevice === 'phone' ? 'rounded-[2rem] border-[3px] border-slate-300/60' : previewDevice === 'tablet' ? 'rounded-[1.5rem] border-[3px] border-slate-300/60' : 'rounded-xl border border-slate-300/60'}`}
                style={{ width: `min(${current.w}px, 100%)`, height: `min(${current.h}px, calc(100vh - 8rem))`, maxWidth: '100%' }}>
                {previewDevice === 'web' && (
                  <div className="h-8 bg-slate-100 border-b border-slate-200 flex items-center px-3 gap-2">
                    <div className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /></div>
                    <div className="flex-1 mx-3 h-5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-500 px-2 flex items-center truncate">biolink.pro/{currentBio.slug}</div>
                  </div>
                )}
                <div className={`w-full ${previewDevice === 'web' ? 'h-[calc(100%-2rem)]' : 'h-full'}`}>{renderBioBody({ compact: false })}</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Create Bio Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm border border-slate-200 overflow-hidden">
            <div className="p-4 text-white flex items-center justify-between" style={{ backgroundColor: brand.colorHex }}>
              <h3 className="text-xs font-bold uppercase tracking-wider">Crear Nueva Biografía Modular</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-white" style={{ color: `${brand.colorHex}CC` }}>✕</button>
            </div>
            <form onSubmit={handleCreateBiography} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Título de la Biografía</label>
                <input type="text" placeholder="Ej. Mi Consultorio Dental" value={newTitle}
                  onChange={(e) => { setNewTitle(e.target.value); setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-')); }}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400" required />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Enlace / Slug personalizado</label>
                <input type="text" placeholder="ej. consultorio-oral" value={newSlug} onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 font-sans" required />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Módulo / Tipo de Servicio</label>
                <select value={newType} onChange={(e: any) => setNewType(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-800 bg-white">
                  <option value="generico">Enlace General (Link-in-Bio)</option>
                  <option value="mascota">Mascota (Salud, Vacunas y Viajes)</option>
                  <option value="boda">Matrimonios (RSVPs, Agenda y Álbum)</option>
                  <option value="vehiculo">Automotores (Mantenimiento, SOAT y CDA)</option>
                  <option value="salon">Salones de Belleza (Citas y Catálogo)</option>
                  <option value="farmacia">Farmacia (Medicamentos y Servicios)</option>
                  <option value="deportes">Entrenador (Rutinas y Logros)</option>
                  <option value="mecanico">Mecánico (Taller y Servicios)</option>
                  <option value="inmobiliaria">Agente Inmobiliario (Propiedades)</option>
                  <option value="artesanias">Artesanías (Productos Handmade)</option>
                  <option value="tecnologia">Tecnología (Dev & Soluciones)</option>
                  <option value="diseno">Diseño & Publicidad</option>
                  <option value="vendedor">Vendedor (Asesoría Comercial)</option>
                  <option value="acarreos">Acarreos (Mudanzas y Fletes)</option>
                  <option value="taxis">Taxi (Viajes y Traslados)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold">Cancelar</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold text-white rounded-lg hover:opacity-90" style={{ backgroundColor: brand.colorHex }}>Generar Biografía</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bio Details Modal */}
      {bioDetailsId && (() => {
        const bio = biographies.find((b) => b.id === bioDetailsId);
        if (!bio) return null;
        const meta = TEMPLATE_META[bio.templateType];
        const Icon = meta.icon;
        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-4 text-white flex items-center justify-between" style={{ backgroundColor: brand.colorHex }}>
                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"><Icon className="w-4 h-4" /> Detalles de la biografía</h3>
                <button onClick={() => setBioDetailsId(null)} className="p-1 rounded hover:bg-white/10"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Título</label>
                  <input type="text" value={bio.title} onChange={(e) => handleUpdateBiography({ ...bio, title: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 font-semibold" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Descripción</label>
                  <textarea value={bio.description} onChange={(e) => handleUpdateBiography({ ...bio, description: e.target.value })}
                    rows={3} className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 resize-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Slug / URL</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">biolink.pro/</span>
                    <input type="text" value={bio.slug} onChange={(e) => handleUpdateBiography({ ...bio, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      className="flex-1 text-xs p-2.5 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 font-sans" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Tipo de plantilla</label>
                  <div className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg bg-slate-50">
                    <Icon className="w-4 h-4" style={{ color: brand.colorHex }} />
                    <span className="text-sm font-semibold text-slate-700">{meta.label}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center pt-2 border-t border-slate-100">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Reseñas</span>
                    <span className="text-base font-bold text-slate-800">{bio.reviews?.length || 0}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Secciones</span>
                    <span className="text-base font-bold text-slate-800">{bio.customSections?.length || 0}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Recursos</span>
                    <span className="text-base font-bold text-slate-800">{(bio.customSections || []).reduce((a, s) => a + s.resources.length, 0)}</span>
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <button onClick={() => { if (biographies.length <= 1) { alert('Debe quedar al menos una biografía.'); return; } if (window.confirm(`¿Eliminar la biografía "${bio.title}"?`)) { const refreshed = biographies.filter(b => b.id !== bio.id); setBiographies(refreshed); saveBiographies(refreshed); if (activeBioId === bio.id) setActiveBioId(refreshed[0].id); setBioDetailsId(null); } }}
                  className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setShowCreateModal(true); setBioDetailsId(null); }}
                    className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-white rounded-lg border border-slate-200 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Nueva
                  </button>
                  <button onClick={() => setBioDetailsId(null)}
                    className="px-4 py-2 text-xs font-bold text-white rounded-lg hover:opacity-90" style={{ backgroundColor: brand.colorHex }}>Guardar cambios</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
