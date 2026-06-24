import React, { useState } from 'react';
import { 
  Award, 
  Briefcase, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Star, 
  MapPin, 
  Sparkles, 
  ShoppingBag, 
  CheckCircle, 
  Settings, 
  Save, 
  Plus, 
  Trash2, 
  SlidersHorizontal,
  Bot,
  User,
  Heart,
  Target,
  Smartphone,
  Globe,
  Copy,
  ExternalLink,
  Lock,
  PhoneCall,
  Check,
  Download,
  FileText
} from 'lucide-react';
import { SkillProfile, Service, Product } from '../types/skillProfile';

const BIOGRAPHY_BUTTON_BLUE = '#6366f1';

interface ProfileCardProps {
  key?: string;
  profile: SkillProfile;
  profiles?: SkillProfile[];
  onHireService?: (service: Service, sellerName: string) => void;
  onBuyProduct?: (product: Product, sellerName: string) => void;
  onRateProfile?: (id: string, newRating: number) => void;
  onSaveSuccess?: () => void;
  onOpenPublicBio?: (slug: string) => void;
  onSaveCustomization?: (id: string, updatedData: any) => Promise<void>;
}

// Highly elegant light themes for customizable biographies
const colorPresets: Record<string, {
  name: string;
  borderClass: string;
  badgeBg: string;
  badgeText: string;
  accentText: string;
  buttonBg: string;
  buttonHoverBg: string;
  bgGradient: string;
  taglineText: string;
}> = {
  'royal-blue': {
    name: 'Azul Real Inteligente',
    borderClass: 'border-blue-150',
    badgeBg: 'bg-blue-50/50 border border-blue-100',
    badgeText: 'text-blue-700',
    accentText: 'text-blue-600',
    buttonBg: 'bg-indigo-500 hover:bg-indigo-600',
    buttonHoverBg: 'hover:bg-indigo-700',
    bgGradient: 'from-blue-50/20 to-white',
    taglineText: 'text-blue-600'
  },
  'modern-coral': {
    name: 'Coral Vanguardia',
    borderClass: 'border-rose-150',
    badgeBg: 'bg-rose-50/50 border border-rose-150',
    badgeText: 'text-rose-700',
    accentText: 'text-rose-600',
    buttonBg: 'bg-indigo-500 hover:bg-indigo-600',
    buttonHoverBg: 'hover:bg-indigo-700',
    bgGradient: 'from-rose-50/10 to-white',
    taglineText: 'text-rose-600'
  },
  'neon-emerald': {
    name: 'Esmeralda Tecnológico',
    borderClass: 'border-emerald-150',
    badgeBg: 'bg-emerald-50/50 border border-emerald-100',
    badgeText: 'text-emerald-700',
    accentText: 'text-emerald-600',
    buttonBg: 'bg-indigo-500 hover:bg-indigo-600',
    buttonHoverBg: 'hover:bg-indigo-700',
    bgGradient: 'from-emerald-50/10 to-white',
    taglineText: 'text-emerald-600'
  },
  'warm-amber': {
    name: 'Ámbar Cálido',
    borderClass: 'border-amber-150',
    badgeBg: 'bg-amber-50/50 border border-amber-150',
    badgeText: 'text-amber-800',
    accentText: 'text-amber-700',
    buttonBg: 'bg-indigo-500 hover:bg-indigo-600',
    buttonHoverBg: 'hover:bg-indigo-700',
    bgGradient: 'from-amber-50/10 to-white',
    taglineText: 'text-amber-600'
  },
  'minimal-slate': {
    name: 'Pizarra Minimalista',
    borderClass: 'border-slate-200',
    badgeBg: 'bg-slate-50 border border-slate-200',
    badgeText: 'text-slate-800',
    accentText: 'text-slate-800',
    buttonBg: 'bg-indigo-500 hover:bg-indigo-600',
    buttonHoverBg: 'hover:bg-indigo-700',
    bgGradient: 'from-slate-50 to-white',
    taglineText: 'text-slate-700'
  }
};

export default function ProfileCard({ 
  profile, 
  profiles = [],
  onHireService, 
  onBuyProduct, 
  onRateProfile, 
  onSaveSuccess,
  onOpenPublicBio,
  onSaveCustomization
}: ProfileCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const downloadCertificateFile = (certName: string, issuer: string, date: string) => {
    const fileContent = `CERTIFICADO OFICIAL BIOAGENT\n\nEste documento certifica que se ha otorgado con éxito:\n\nNombre del Certificado: ${certName}\nInstitución Emisora: ${issuer}\nFecha de Emisión: ${date || 'No especificada'}\n\nCódigo de Validación Digital: BIO-${Math.floor(100000 + Math.random() * 900000)}\n\nBioAgent Sandbox Ecosistema Integrado de Biografías 2026.`;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${certName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_certificado.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  // Customizer system state
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [localPreset, setLocalPreset] = useState(profile.colorPreset || 'minimal-slate');
  const [localModules, setLocalModules] = useState<string[]>(profile.activeModules || ['services', 'products', 'skills', 'stats', 'testimonials', 'location']);
  
  // Web publishing details
  const [localWhatsapp, setLocalWhatsapp] = useState(profile.whatsapp || '');
  const [localSlug, setLocalSlug] = useState(profile.slug || profile.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
  const [localIsPublic, setLocalIsPublic] = useState(profile.isPublic ?? true);
  const [showWebPreview, setShowWebPreview] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Custom new testimonials lists
  const [testimonials, setTestimonials] = useState<any[]>(profile.testimonials || []);
  const [newAuthor, setNewAuthor] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isSaving, setIsSaving] = useState(false);

  // Opening hours states
  const [ohEnabled, setOhEnabled] = useState(profile.openingHours?.enabled ?? false);
  const [ohType, setOhType] = useState<'hours' | 'appointment'>(profile.openingHours?.type ?? 'hours');
  const [ohMonFri, setOhMonFri] = useState(profile.openingHours?.mondayToFriday ?? '09:00 AM - 06:00 PM');
  const [ohSat, setOhSat] = useState(profile.openingHours?.saturday ?? '10:00 AM - 02:00 PM');
  const [ohSun, setOhSun] = useState(profile.openingHours?.sunday ?? 'Cerrado');
  const [ohAppointmentLink, setOhAppointmentLink] = useState(profile.openingHours?.appointmentLink ?? '');

  const [localServices, setLocalServices] = useState<Service[]>(profile.services || []);

  // New products or services interactive additions (Max 4 item constraints)
  const isCompany = profile.type === 'company';
  const isPropietario = ['propietario', 'mascota', 'evento', 'vehiculo', 'casa', 'boda'].includes(profile.type);
  const skillsList = profile.skills || [];
  
  // Select active preset styling definitions
  const theme = colorPresets[localPreset] || colorPresets['minimal-slate'];

  const toggleModule = (module: string) => {
    if (localModules.includes(module)) {
      setLocalModules(localModules.filter(m => m !== module));
    } else {
      setLocalModules([...localModules, module]);
    }
  };

  const handleAddTestimonial = () => {
    if (!newAuthor || !newReviewText) return;
    const added = {
      author: newAuthor,
      text: newReviewText,
      rating: newRating
    };
    setTestimonials([...testimonials, added]);
    setNewAuthor('');
    setNewReviewText('');
    setNewRating(5);
  };

  const handleRemoveTestimonial = (index: number) => {
    setTestimonials(testimonials.filter((_, i) => i !== index));
  };

  // Submit customization changes to back-end
  const handleSaveCustomization = async () => {
    setIsSaving(true);
    try {
      if (onSaveCustomization) {
        await onSaveCustomization(profile.id, {
          colorPreset: localPreset,
          activeModules: localModules,
          testimonials: testimonials,
          whatsapp: localWhatsapp,
          slug: localSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''),
          isPublic: localIsPublic,
          services: localServices,
          openingHours: {
            enabled: ohEnabled,
            type: ohType,
            mondayToFriday: ohMonFri,
            saturday: ohSat,
            sunday: ohSun,
            appointmentLink: ohAppointmentLink
          }
        });
        setIsCustomizing(false);
        if (onSaveSuccess) onSaveSuccess();
      }
    } catch (err) {
      console.error('Error saving customization:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className={`bg-white rounded-2xl border overflow-hidden ${theme.borderClass}`}
      style={{
        boxShadow: expanded
          ? '0 4px 12px rgba(0,0,0,0.08)'
          : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.25s ease',
      }}
    >
      {/* Decorative colored top line based on the selected custom bio theme */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${
        localPreset === 'royal-blue' ? 'from-blue-400 to-indigo-500' :
        localPreset === 'modern-coral' ? 'from-rose-400 to-pink-500' :
        localPreset === 'neon-emerald' ? 'from-emerald-400 to-teal-500' :
        localPreset === 'warm-amber' ? 'from-amber-400 to-orange-500' :
        'from-slate-300 to-slate-400'
      }`} />

      {/* Profile Main Header Layout */}
      <div className={`p-6 sm:p-8 bg-gradient-to-b ${theme.bgGradient} space-y-6`}>
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          
          {/* Left Block: Avatar + Name + Tagline Info */}
          <div className="flex flex-col sm:flex-row items-start gap-5">
            
            {/* Avatar block with badge indicator */}
            <div className="relative group shrink-0">
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className={`w-20 h-20 rounded-xl object-cover border-2 shadow-inner bg-slate-150 ${
                  profile.type === 'company' ? 'border-slate-200' :
                  profile.type === 'individual' ? 'border-emerald-100' :
                  profile.type === 'propietario' ? 'border-indigo-150' :
                  profile.type === 'mascota' ? 'border-amber-100' :
                  profile.type === 'evento' ? 'border-rose-100' :
                  profile.type === 'vehiculo' ? 'border-blue-105' :
                  profile.type === 'casa' ? 'border-violet-105' :
                  profile.type === 'boda' ? 'border-pink-105' :
                  profile.type === 'restaurante' ? 'border-orange-105' : 'border-slate-100'
                }`}
                referrerPolicy="no-referrer"
              />
              <span className={`absolute -bottom-1.5 -right-1.5 text-[8.5px] font-mono tracking-wider font-extrabold px-1.5 py-0.5 rounded-md uppercase border shadow-sm ${
                profile.type === 'company' ? 'bg-slate-900 border-slate-700 text-white' :
                profile.type === 'individual' ? 'bg-emerald-600 border-emerald-500 text-white' :
                profile.type === 'propietario' ? 'bg-indigo-600 border-indigo-500 text-white' :
                profile.type === 'mascota' ? 'bg-amber-500 border-amber-400 text-white' :
                profile.type === 'evento' ? 'bg-rose-500 border-rose-450 text-white' :
                profile.type === 'vehiculo' ? 'bg-indigo-500 border-indigo-500 text-white' :
                profile.type === 'casa' ? 'bg-violet-600 border-violet-500 text-white' :
                profile.type === 'boda' ? 'bg-pink-500 border-pink-400 text-white' :
                profile.type === 'restaurante' ? 'bg-orange-600 border-orange-550 text-white' : 'bg-slate-800 border-slate-700 text-white'
              }`}>
                {
                  profile.type === 'company' ? 'Empresa' :
                  profile.type === 'individual' ? 'Persona' :
                  profile.type === 'propietario' ? 'Propietario' :
                  profile.type === 'mascota' ? 'Mascota' :
                  profile.type === 'evento' ? 'Evento' :
                  profile.type === 'vehiculo' ? 'Vehículo' :
                  profile.type === 'casa' ? 'Inmueble' :
                  profile.type === 'boda' ? 'Boda' :
                  profile.type === 'restaurante' ? 'Restaurante' : 'Activo'
                }
              </span>
            </div>

            {/* Information Titles */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-medium tracking-tight text-slate-900 flex items-center gap-1.5 font-sans">
                  {profile.name}
                  {profile.rating >= 4.8 && (
                    <Sparkles className="h-4.5 w-4.5 text-amber-500" title="Perfil Destacado BioAgent" />
                  )}
                </h3>

                {localModules.includes('location') && (
                  <span className="inline-flex items-center text-xs text-slate-500 font-normal">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" />
                    {profile.location}
                  </span>
                )}
              </div>

              <p className={`text-sm font-semibold tracking-wide ${theme.taglineText}`}>
                {profile.tagline}
              </p>
              
              <p className="text-xs text-slate-500 max-w-3xl leading-relaxed font-sans">
                {profile.bio}
              </p>
            </div>
          </div>

          {/* Right Block: Ratings Summary */}
          {localModules.includes('stats') && (
            <div className="w-full sm:w-auto p-4 bg-white/70 backdrop-blur-xs rounded-xl border border-slate-200/60 shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 shadow-xs">
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider block">Calificación general</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-slate-800">{profile.rating.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400">({profile.reviewsCount} votos)</span>
                </div>
              </div>

              {/* Incremental Star Rater */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => onRateProfile && onRateProfile(profile.id, star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    className="p-0.5 transition-transform duration-100 hover:scale-125 focus:outline-none"
                    title={`Dar ${star} estrellas`}
                  >
                    <Star 
                      className={`h-3 w-3 ${
                        star <= (hoveredStar ?? 0) 
                          ? 'fill-amber-400 text-amber-400' 
                          : star <= Math.round(profile.rating)
                            ? 'fill-amber-100 text-amber-300'
                            : 'text-slate-200'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modules: Skills List */}
        {localModules.includes('skills') && skillsList.length > 0 && (
          <div className="pt-2">
            <div className="flex flex-wrap gap-1.5">
              {skillsList.map((skill, index) => (
                <span 
                  key={`${profile.id}-${skill}-${index}`}
                  className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium font-sans transition-all hover:bg-slate-50"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls & Module edit trigger */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <div>
              • ID: <span className="text-slate-600 font-bold">{profile.id}</span>
            </div>
            <div>
              {isCompany 
                ? `• Productos cargados: ${profile.products?.length || 0} de 4` 
                : `• Servicios ofrecidos: ${profile.services?.length || 0} de 4`
              }
            </div>
          </div>

          <div className="flex items-center gap-2">
            
            {/* Real Web Publication Simulation toggle */}
            <button
              onClick={() => setShowWebPreview(!showWebPreview)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                showWebPreview 
                  ? 'text-white shadow-sm' 
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 shadow-xs'
              }`}
              style={showWebPreview ? { backgroundColor: BIOGRAPHY_BUTTON_BLUE, borderColor: BIOGRAPHY_BUTTON_BLUE } : undefined}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Vista Web Móvil</span>
            </button>

            {/* Template personalization config button */}
            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                isCustomizing 
                  ? 'text-white' 
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 shadow-sm'
              }`}
              style={isCustomizing ? { backgroundColor: BIOGRAPHY_BUTTON_BLUE, borderColor: BIOGRAPHY_BUTTON_BLUE } : undefined}
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Personalizar Bio</span>
            </button>

            {/* Expand catalogo list */}
            <button
              onClick={() => setExpanded(!expanded)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                expanded
                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                  : 'text-white hover:opacity-90'
              }`}
              style={!expanded ? { backgroundColor: BIOGRAPHY_BUTTON_BLUE, borderColor: BIOGRAPHY_BUTTON_BLUE } : undefined}
            >
              <span>
                {['propietario', 'mascota', 'evento', 'vehiculo', 'casa', 'boda'].includes(profile.type) 
                  ? 'Servicio/producto sugerido' 
                  : (isCompany ? 'Ver Productos' : 'Ver Servicios')}
              </span>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

        </div>

      </div>

      {/* Interactive Biography Customizer (Only visible when toggled) */}
      {isCustomizing && (
        <div className="border-t border-b border-slate-200 bg-slate-50 p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <SlidersHorizontal className="h-4.5 w-4.5 text-slate-800" />
            <h4 className="text-sm font-bold text-slate-800">Panel de Personalización de Biografía</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Col: Choose Color Presets and fields */}
            <div className="space-y-4">
              
              {/* Preset selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">1. Plantilla de Color & Estética</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.keys(colorPresets).map((presetKey) => {
                    const preset = colorPresets[presetKey];
                    const isActive = localPreset === presetKey;
                    return (
                      <button
                        key={presetKey}
                        onClick={() => setLocalPreset(presetKey)}
                        className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition-all ${
                          isActive 
                            ? 'bg-white border-slate-800 shadow-xs ring-1 ring-slate-800' 
                            : 'bg-white/60 hover:bg-white border-slate-200'
                        }`}
                      >
                        <span className="block font-sans text-slate-800">{preset.name}</span>
                        <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block mt-0.5">Preset: {presetKey}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Adaptable fields to customize bios */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">2. Adaptar Bio (Módulos Activos)</label>
                <p className="text-[11px] text-slate-400">Activa o oculta secciones de tu biografía de manera dinámica para que se ajuste exactamente a tu marca:</p>
                
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {[
                    { id: 'skills', label: 'Habilidades (Tags)' },
                    { id: 'stats', label: 'Estadísticas & Votos' },
                    { id: 'services', label: 'Servicios (Mini-Ecommerce)' },
                    { id: 'products', label: 'Productos Top (SaaS)' },
                    { id: 'agent', label: 'Agente de Autotrading AI' },
                    { id: 'location', label: 'Ubicación Geográfica' },
                    { id: 'testimonials', label: 'Testimonios Satisfechos' }
                  ].map((mod) => {
                    const isSelected = localModules.includes(mod.id);
                    return (
                      <label 
                        key={mod.id}
                        className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs font-semibold cursor-pointer select-none transition-colors ${
                          isSelected ? 'bg-white border-slate-300 text-slate-800' : 'bg-transparent border-slate-200 text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleModule(mod.id)}
                          className="h-3.5 w-3.5 rounded text-slate-900 focus:ring-0 cursor-pointer"
                        />
                        <span>{mod.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Horarios & Citas */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> 3. Horarios o Agenda de Citas
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer scale-90">
                    <input 
                      type="checkbox" 
                      checked={ohEnabled} 
                      onChange={(e) => setOhEnabled(e.target.checked)} 
                      className="sr-only peer" 
                    />
                    <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-900" />
                  </label>
                </div>

                {ohEnabled && (
                  <div className="space-y-3 pt-2 border-t border-slate-200/60">
                    <div className="flex gap-4 text-xs font-medium text-slate-700">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="radio" 
                          name="ohTypeCard" 
                          checked={ohType === 'hours'} 
                          onChange={() => setOhType('hours')} 
                          className="accent-slate-900" 
                        />
                        <span>Horarios de Atención</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="radio" 
                          name="ohTypeCard" 
                          checked={ohType === 'appointment'} 
                          onChange={() => setOhType('appointment')} 
                          className="accent-slate-900" 
                        />
                        <span>Agenda Virtual</span>
                      </label>
                    </div>

                    {ohType === 'hours' ? (
                      <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200">
                        <div className="grid grid-cols-3 items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Lun a Vie</span>
                          <input 
                            type="text" 
                            value={ohMonFri} 
                            onChange={(e) => setOhMonFri(e.target.value)} 
                            className="col-span-2 text-xs border border-slate-200 rounded-md p-1 outline-none focus:border-slate-800 bg-slate-50/50 text-slate-800 placeholder:text-slate-400" 
                            placeholder="Ej: 09:00 AM - 06:00 PM"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Sábado</span>
                          <input 
                            type="text" 
                            value={ohSat} 
                            onChange={(e) => setOhSat(e.target.value)} 
                            className="col-span-2 text-xs border border-slate-200 rounded-md p-1 outline-none focus:border-slate-800 bg-slate-50/50 text-slate-800 placeholder:text-slate-400" 
                            placeholder="Ej: 10:00 AM - 02:00 PM o Cerrado"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Domingo</span>
                          <input 
                            type="text" 
                            value={ohSun} 
                            onChange={(e) => setOhSun(e.target.value)} 
                            className="col-span-2 text-xs border border-slate-200 rounded-md p-1 outline-none focus:border-slate-800 bg-slate-50/50 text-slate-800 placeholder:text-slate-400" 
                            placeholder="Ej: Cerrado"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Enlace de Reserva (Calendly/TidyCal)</label>
                        <input 
                          type="url" 
                          placeholder="https://calendly.com/tu-usuario/cita" 
                          value={ohAppointmentLink} 
                          onChange={(e) => setOhAppointmentLink(e.target.value)} 
                          className="w-full text-xs border border-slate-200 rounded-md p-1.5 outline-none focus:border-slate-800 font-sans bg-slate-50/50 text-slate-800 placeholder:text-slate-400"
                        />
                        <span className="text-[9px] text-slate-400 block leading-tight font-light">
                          Habilita un botón destacado de agendamiento en tu biografía.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Optional Section: Suggest and recommend other people's and companies' products & services */}
              {isPropietario && (
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-indigo-500" /> Sugerir Servicios/Productos de la Red
                  </label>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Como propietario/activo, puedes sugerir servicios de personas profesionales o productos de empresas en tu biografía:
                  </p>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 bg-white p-2.5 rounded-xl border border-slate-200">
                    {profiles && profiles
                      .filter(p => p.id !== profile.id && (p.type === 'individual' || p.type === 'company'))
                      .map(p => {
                        const items = [
                          ...(p.services || []).map(s => ({ ...s, itemType: 'service' as const, ownerName: p.name })),
                          ...(p.products || []).map(prod => ({ 
                            id: prod.id, 
                            title: prod.title, 
                            description: prod.description, 
                            price: prod.price, 
                            deliveryDays: 0, 
                            rating: prod.rating, 
                            reviewsCount: prod.reviewsCount, 
                            images: prod.images, 
                            itemType: 'product' as const, 
                            ownerName: p.name 
                          }))
                        ];
                        
                        if (items.length === 0) return null;
                        
                        return (
                          <div key={p.id} className="space-y-1.5 border-b border-slate-100 last:border-0 pb-2 mb-2 last:pb-0 last:mb-0">
                            <span className="text-[9px] font-bold text-slate-400 font-mono uppercase">De: {p.name} ({p.type === 'individual' ? 'Persona' : 'Empresa'})</span>
                            <div className="space-y-1 font-sans">
                              {items.map(item => {
                                const isRecommended = localServices.some(s => s.id === item.id || s.title === item.title);
                                return (
                                  <div key={item.id} className="flex items-center justify-between gap-2 p-1.5 rounded bg-slate-50 border border-slate-100/60 text-xs">
                                    <div className="truncate flex-1">
                                      <span className="font-bold text-slate-700 block text-[10px] truncate">{item.title}</span>
                                      <span className="text-[9px] text-slate-400 font-mono">${item.price} USD • {item.itemType === 'service' ? 'Servicio' : 'Producto'}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isRecommended) {
                                          setLocalServices(localServices.filter(s => s.id !== item.id && s.title !== item.title));
                                        } else {
                                          if (localServices.length >= 4) {
                                            alert("Puedes sugerir un máximo de 4 servicios o productos.");
                                            return;
                                          }
                                          const newS: Service = {
                                            id: item.id,
                                            title: item.title,
                                            description: item.description,
                                            price: item.price,
                                            deliveryDays: item.deliveryDays || 1,
                                            rating: item.rating,
                                            reviewsCount: item.reviewsCount,
                                            images: item.images
                                          };
                                          setLocalServices([...localServices, newS]);
                                        }
                                      }}
                                      className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider transition-all border ${
                                        isRecommended 
                                          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                                          : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
                                      }`}
                                    >
                                      {isRecommended ? 'Quitar' : 'Sugerir'}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    {(!profiles || profiles.filter(p => p.id !== profile.id && (p.type === 'individual' || p.type === 'company')).length === 0) && (
                      <p className="text-[10px] text-slate-400 italic text-center py-4">No hay otros profesionales o empresas registradas en el sistema para sugerir.</p>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Right Col: Custom testimonials builder */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">4. Testimonios Reales de Clientes</label>
              
              {/* Existing testimonials */}
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {testimonials.map((test, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 flex justify-between items-start text-xs gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <span>{test.author}</span>
                        <span className="text-[10px] bg-amber-50 text-amber-700 px-1 py-0.2 rounded font-mono">★ {test.rating}</span>
                      </div>
                      <p className="italic text-slate-500">"{test.text}"</p>
                    </div>
                    <button 
                      onClick={() => handleRemoveTestimonial(idx)}
                      className="text-slate-400 hover:text-red-500 p-1 shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {testimonials.length === 0 && (
                  <p className="text-[11px] text-slate-400 italic">No hay testimonios agregados para esta biografía.</p>
                )}
              </div>

              {/* Add testimonial inline form */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-450 block uppercase tracking-wider">Añadir Testimonio</span>
                
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="Nombre del Cliente"
                    className="col-span-2 text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 outline-none text-slate-800 placeholder:text-slate-400"
                  />
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 outline-none text-slate-800 font-bold"
                  >
                    <option value="5">★ 5 (Excelente)</option>
                    <option value="4">★ 4 (Muy Bueno)</option>
                    <option value="3">★ 3 (Bueno)</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Comentario o reseña del servicio/producto adquirido..."
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 outline-none text-slate-800 placeholder:text-slate-400"
                  />
                  <button
                    onClick={handleAddTestimonial}
                    className="p-1.5 text-white rounded-lg text-xs font-bold hover:opacity-90 font-sans"
                    style={{ backgroundColor: BIOGRAPHY_BUTTON_BLUE }}
                  >
                    Agregar
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Saver button footer */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              onClick={() => setIsCustomizing(false)}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveCustomization}
              disabled={isSaving}
              className="px-5 py-2 disabled:bg-slate-200 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow hover:opacity-90 disabled:opacity-60"
              style={!isSaving ? { backgroundColor: BIOGRAPHY_BUTTON_BLUE } : undefined}
            >
              {isSaving ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Guardar Módulos y Colores</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mobile Web Mockup Preview section inside the Profile Card */}
      {showWebPreview && (
        <div className="border-t border-slate-200 bg-slate-100/50 p-6 flex flex-col items-center">
          
          <div className="text-center mb-4 space-y-1">
            <h4 className="text-sm font-bold text-slate-800 flex items-center justify-center gap-1.5 font-sans">
              <Smartphone className="h-4.5 w-4.5 text-slate-700 animate-pulse" />
              Vista Previa Web Corporativa / Persona
            </h4>
            <p className="text-xs text-slate-500 max-w-sm">Este modelo a escala simula tu presencia web en un dispositivo móvil moderno.</p>
          </div>

          <div 
            className="w-[330px] border-[10px] border-slate-900 rounded-[32px] bg-white shadow-xl relative overflow-hidden flex flex-col"
            style={{ height: '540px' }}
          >
            {/* Topnotch bezel */}
            <div className="absolute top-0 inset-x-0 h-4 flex justify-center z-25">
              <div className="w-16 bg-slate-900 h-2 rounded-b-lg" />
            </div>

            {/* Sim OS Bar */}
            <div className="h-6 bg-slate-950 font-mono text-[8px] text-zinc-400 flex justify-between items-center px-6 pt-1 shrink-0 select-none">
              <span>12:00</span>
              <div className="flex items-center gap-1">
                <span>5G</span>
                <div className="w-3.5 h-1.5 bg-zinc-650 rounded-xs" />
              </div>
            </div>

            {/* Address Bar */}
            <div className="bg-slate-100 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between gap-1.5 shrink-0 select-none">
              <div className="flex-1 bg-white border border-slate-200 rounded-md px-2 py-0.5 text-center text-[8px] text-slate-400 font-mono flex items-center justify-center gap-1 truncate max-w-[245px]">
                {!localIsPublic && <Lock className="h-2.5 w-2.5 text-slate-450 shrink-0" />}
                <span>bioagent.net/bio/<strong>{localSlug}</strong></span>
              </div>
              <Globe className="h-3 w-3 text-slate-400 shrink-0" />
            </div>

            {/* Simulation App Body */}
            <div className="flex-1 overflow-y-auto bg-white text-slate-800 scrollbar-thin text-[12px] relative flex flex-col">
              
              {/* Header */}
              <div className={`p-4 bg-gradient-to-b ${theme.bgGradient} border-b border-slate-100 flex flex-col items-center text-center space-y-2`}>
                <img 
                  src={profile.avatar} 
                  alt={profile.name} 
                  className="w-12 h-12 rounded-full object-cover border border-slate-200/80 shadow-xs bg-slate-100"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs flex items-center justify-center gap-1">
                    {profile.name}
                    {profile.rating >= 4.8 && (
                      <Sparkles className="h-3 w-3 text-amber-500 fill-amber-500" />
                    )}
                  </h4>
                  <span className="text-[8px] font-mono py-0.2 px-1 bg-slate-100 border rounded-sm text-slate-400 uppercase tracking-wider mt-0.5">
                    {
                      profile.type === 'company' ? 'Marca / Corporativo' :
                      profile.type === 'individual' ? 'Persona Profesional' :
                      profile.type === 'propietario' ? 'Propietario / Activos' :
                      profile.type === 'mascota' ? 'Ficha de Mascota' :
                      profile.type === 'evento' ? 'Evento / Conferencia' :
                      profile.type === 'vehiculo' ? 'Vehículo / Ficha Móvil' :
                      profile.type === 'casa' ? 'Inmueble / Alquiler o Venta' :
                      profile.type === 'boda' ? 'Boda Conmemorativa' : 'Propietario / Activo'
                    }
                  </span>
                  <p className={`text-[9px] font-bold tracking-tight mt-1 ${theme.taglineText}`}>{profile.tagline}</p>
                </div>
              </div>

              {/* Bio & Location info */}
              <div className="p-4 space-y-3">
                <div className="space-y-0.5">
                  <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase block">
                    {
                      profile.type === 'company' ? 'Acerca de Nosotros' :
                      profile.type === 'mascota' ? 'Historia de la Mascota' :
                      profile.type === 'vehiculo' ? 'Datos del Vehículo' :
                      profile.type === 'casa' ? 'Ficha Técnica de la Propiedad' :
                      profile.type === 'boda' ? 'Historia del Enlace' :
                      profile.type === 'evento' ? 'Detalles del Evento' : 'Acerca de la Bio'
                    }
                  </span>
                  <p className="text-[10px] text-slate-600 leading-relaxed font-sans">{profile.bio}</p>
                </div>

                {profile.location && (
                  <div className="flex items-center text-[9px] text-slate-500 gap-1 font-sans pt-0.5">
                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[130px]">{profile.location}</span>
                  </div>
                )}

                {/* WhatsApp button inside phone mockup */}
                {localWhatsapp && (
                  <div className="pt-1">
                    <a 
                      href={`https://wa.me/${localWhatsapp.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-1 p-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-[9px] font-bold uppercase tracking-wide transition-all"
                    >
                      <PhoneCall className="h-3 w-3 text-emerald-600 shrink-0" />
                      <span>Contactar WhatsApp</span>
                    </a>
                  </div>
                )}

                {/* Horarios o Agenda de Citas inside mockup (live preview) */}
                {ohEnabled && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 animate-fadeIn">
                    <div className="flex items-center gap-1 border-b border-slate-150 pb-1">
                      <Clock className="h-3 w-3 text-slate-650" />
                      <span className="text-[8px] font-bold text-slate-700 uppercase tracking-wider">Disponibilidad & Citas</span>
                    </div>
                    {ohType === 'hours' ? (
                      <div className="space-y-0.5 text-[8.5px] text-slate-600">
                        <div className="flex justify-between">
                          <span>Lunes a Viernes:</span>
                          <span className="font-semibold text-slate-800">{ohMonFri}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sábados:</span>
                          <span className="font-semibold text-slate-800">{ohSat}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Domingos:</span>
                          <span className="font-semibold text-slate-800">{ohSun}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center py-1">
                        <p className="text-[7.5px] text-slate-500 italic mb-1.5">Reserva una videoconferencia o llamada de descubrimiento directamente.</p>
                        <a 
                          href={ohAppointmentLink || '#'} 
                          target="_blank" 
                          rel="noreferrer"
                          onClick={(e) => { if (!ohAppointmentLink) e.preventDefault(); }}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-white text-[8px] font-bold rounded-md uppercase tracking-wider ${theme.buttonBg}`}
                        >
                          <span>Agendar Cita Directa</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Main Catalogue List (Product or Services based on Type) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase block">
                    {isCompany ? 'Catálogo de Software Corporativo' : 'Catálogo de Servicios Habilitados'}
                  </span>

                  {isCompany ? (
                    // Render Products
                    profile.products && profile.products.length > 0 ? (
                      <div className="space-y-1.5 animate-fadeIn">
                        {profile.products.slice(0, 3).map((p) => (
                          <div key={p.id} className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                            <div className="flex justify-between items-start gap-1">
                              <h5 className="font-bold text-slate-800 text-[10px] leading-tight flex-1">{p.title}</h5>
                              <span className="text-[10px] font-mono font-bold text-slate-950 ml-1 shrink-0">${p.price} USD</span>
                            </div>
                            <p className="text-[8px] text-slate-500 leading-relaxed font-sans truncate">{p.description}</p>
                            
                            {/* Produc/Service Tiny gallery miniatures */}
                            {p.images && p.images.length > 0 && (
                              <div className="flex gap-1 mt-1 overflow-hidden">
                                {p.images.slice(0, 3).map((imgUrl, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLightboxImage(imgUrl);
                                    }}
                                    className="h-6 w-6 rounded border border-slate-205 overflow-hidden block shrink-0 cursor-zoom-in active:scale-95 hover:border-slate-400 transition-all bg-slate-100"
                                  >
                                    <img 
                                      src={imgUrl} 
                                      alt="Mini product" 
                                      className="h-full w-full object-cover" 
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=50&h=50';
                                      }}
                                    />
                                  </button>
                                ))}
                              </div>
                            )}

                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[7px] text-amber-600 font-mono">Rating: {p.rating} ★</span>
                              <button 
                                type="button"
                                onClick={() => {
                                  if (onBuyProduct) {
                                    onBuyProduct(p, profile.name);
                                  } else {
                                    alert(`Simulado: Pedido para "${p.title}"`);
                                  }
                                }}
                                className={`px-2 py-0.5 text-white text-[8px] font-bold rounded-md uppercase tracking-wider ${theme.buttonBg}`}
                              >
                                Obtener
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[9px] text-slate-400 italic text-center py-2 bg-slate-50 rounded-lg">Sin productos publicados.</p>
                    )
                  ) : (
                    // Render Services
                    profile.services && profile.services.length > 0 ? (
                      <div className="space-y-1.5 animate-fadeIn">
                        {profile.services.slice(0, 3).map((s) => (
                          <div key={s.id} className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                            <div className="flex justify-between items-start gap-1">
                              <h5 className="font-bold text-slate-800 text-[10px] leading-tight flex-1">{s.title}</h5>
                              <span className="text-[10px] font-mono font-bold text-slate-950 ml-1 shrink-0">${s.price} USD</span>
                            </div>
                            <p className="text-[8px] text-slate-500 leading-relaxed font-sans truncate">{s.description}</p>
                            
                            {/* Produc/Service Tiny gallery miniatures */}
                            {s.images && s.images.length > 0 && (
                              <div className="flex gap-1 mt-1 overflow-hidden">
                                {s.images.slice(0, 3).map((imgUrl, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLightboxImage(imgUrl);
                                    }}
                                    className="h-6 w-6 rounded border border-slate-205 overflow-hidden block shrink-0 cursor-zoom-in active:scale-95 hover:border-slate-400 transition-all bg-slate-100"
                                  >
                                    <img 
                                      src={imgUrl} 
                                      alt="Mini service" 
                                      className="h-full w-full object-cover" 
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=50&h=50';
                                      }}
                                    />
                                  </button>
                                ))}
                              </div>
                            )}

                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[7px] text-slate-400">Entrega: {s.deliveryDays} d</span>
                              <button 
                                type="button"
                                onClick={() => {
                                  if (onHireService) {
                                    onHireService(s, profile.name);
                                  } else {
                                    alert(`Simulado: Contratación para "${s.title}"`);
                                  }
                                }}
                                className={`px-2 py-0.5 text-white text-[8px] font-bold rounded-md uppercase tracking-wider ${theme.buttonBg}`}
                              >
                                Contratar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[9px] text-slate-400 italic text-center py-2 bg-slate-50 rounded-lg">Sin servicios publicados.</p>
                    )
                  )}

                </div>

              </div>

              {/* Web Footer */}
              <div className="p-3 mt-auto border-t border-slate-150 bg-slate-50 text-center text-[7px] font-mono text-slate-400">
                <span>© 2026 BioAgent Sandbox • Publicada</span>
              </div>

            </div>

          </div>

          {/* Quick info about the publishing status */}
          <div className="w-full max-w-sm mt-3 bg-white p-3 border border-slate-250 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Estado en Línea:</span>
              {localIsPublic ? (
                <span className="bg-emerald-100 text-emerald-800 text-[9.5px] font-bold px-1.5 py-0.2 rounded border border-emerald-200">Indexado Público</span>
              ) : (
                <span className="bg-slate-100 text-slate-600 text-[9.5px] font-bold px-1.5 py-0.2 rounded border border-slate-200">Solo Borrador</span>
              )}
            </div>
            
            <div className="bg-slate-50 p-2 rounded-lg border flex items-center justify-between gap-1 overflow-hidden">
              <span className="text-[10px] font-mono text-slate-500 truncate select-all">https://bioagent.net/bio/{localSlug}</span>
              <button 
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`https://bioagent.net/bio/${localSlug}`);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="text-slate-500 hover:text-slate-700 shrink-0 p-0.5 transition-colors"
                title="Copiar URL"
              >
                {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            
            <button
              type="button"
              onClick={() => {
                if (!localIsPublic) {
                  alert("Para abrir la página, primero entra en 'Personalizar Bio' y marca '¿Hacer perfil y mini-ecommerce visible en la web?'");
                  return;
                }
                if (onOpenPublicBio) {
                  onOpenPublicBio(localSlug);
                } else {
                  alert(`Abriendo: https://bioagent.net/bio/${localSlug}`);
                }
              }}
              className="w-full py-1.5 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Abrir Página Web Publicada</span>
            </button>
          </div>

        </div>
      )}

      {/* Expanded Catalog view block */}
      {expanded && (
        <div className="border-t border-slate-200 bg-slate-50/40 p-6 space-y-6">
          
          {/* Module: Services List - The Mini-ecommerce of skills (Max 3 items as requested) */}
          {!isCompany && localModules.includes('services') && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Award className="h-4.5 w-4.5 text-slate-500" />
                  <span className="text-xs font-extrabold font-mono tracking-wider text-slate-400 uppercase">
                    {['propietario', 'mascota', 'evento', 'vehiculo', 'casa', 'boda'].includes(profile.type)
                      ? `Servicio/producto sugerido por ${profile.name}`
                      : `Mini-Ecommerce de Habilidades: ${profile.name}`}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
                  {profile.services?.length || 0} de 3 Sugeridos
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {profile.services && profile.services.length > 0 ? (
                  profile.services.slice(0, 3).map((service) => (
                    <div 
                      key={service.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-300 transition-colors"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                            {service.title}
                          </h4>
                          <span className="text-[9px] font-mono tracking-wider uppercase font-bold px-2 py-0.5 rounded-md text-slate-400 bg-slate-100 font-bold">
                            Contrato Directo
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">{service.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            Plazo: ~{service.deliveryDays} {service.deliveryDays === 1 ? 'día' : 'días'}
                          </span>
                          <span className="flex items-center gap-1 text-amber-500 font-bold">
                            ★ {service.rating.toFixed(1)} ({service.reviewsCount})
                          </span>
                        </div>

                        {/* Gallery of up to 3 thumbnails list */}
                        {service.images && service.images.filter(Boolean).length > 0 && (
                          <div className="pt-2 space-y-1 max-w-md">
                            <span className="text-[8.5px] font-mono tracking-wider uppercase font-bold text-slate-400 block">Galería / Evidencias:</span>
                            <div className="flex gap-2">
                              {service.images.slice(0, 3).map((imgUrl, i) => {
                                if (!imgUrl) return null;
                                return (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLightboxImage(imgUrl);
                                    }}
                                    className="h-11 w-11 rounded-lg border border-slate-200 overflow-hidden bg-white hover:border-slate-500 transition-all shrink-0 active:scale-95 shadow-3xs cursor-zoom-in"
                                  >
                                    <img 
                                      src={imgUrl} 
                                      alt={`Miniatura ${i + 1}`} 
                                      className="h-full w-full object-cover animate-fadeIn" 
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=100&h=100';
                                      }}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                        <div className="text-right">
                          <span className="block text-[9px] uppercase font-mono tracking-wider text-slate-400">Precio</span>
                          <span className="text-sm font-extrabold text-slate-900">${service.price} USD</span>
                        </div>
                        <button
                          onClick={() => onHireService && onHireService(service, profile.name)}
                          className={`px-4 py-2 text-white rounded-xl text-xs font-semibold shadow transition-all active:scale-95 flex items-center gap-1.5 ${theme.buttonBg}`}
                        >
                          <Briefcase className="h-3.5 w-3.5" />
                          <span>
                            {['propietario', 'mascota', 'evento', 'vehiculo', 'casa', 'boda'].includes(profile.type) 
                              ? 'Adquirir Sugerido' 
                              : 'Adquirir Servicio'}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400 bg-white rounded-xl border border-dashed">
                    No se han cargado servicios para este perfil profesional.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Module: Products top list - Companies top items (Max 3 items as requested) */}
          {isCompany && localModules.includes('products') && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="h-4.5 w-4.5 text-slate-500" />
                  <span className="text-xs font-extrabold font-mono tracking-wider text-slate-400 uppercase">
                    Productos de Software y Soluciones Top (Max 3): {profile.name}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
                  {profile.products?.length || 0} de 3 Soluciones
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {profile.products && profile.products.length > 0 ? (
                  profile.products.slice(0, 3).map((product) => (
                    <div 
                      key={product.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-300 transition-colors"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 text-sm md:text-base">{product.title}</h4>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                            product.stockStatus === 'available'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : product.stockStatus === 'limited'
                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                : 'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {product.stockStatus === 'available' ? 'Disponible' : product.stockStatus === 'limited' ? 'Stock Limitado' : 'Agotado'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">{product.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 font-mono">
                          <span className="flex items-center gap-1 text-amber-500 font-bold">
                            ★ {product.rating.toFixed(1)} ({product.reviewsCount} reseñas)
                          </span>
                        </div>

                        {/* Gallery of up to 3 thumbnails list */}
                        {product.images && product.images.filter(Boolean).length > 0 && (
                          <div className="pt-2 space-y-1 max-w-md">
                            <span className="text-[8.5px] font-mono tracking-wider uppercase font-bold text-slate-400 block">Galería del Producto:</span>
                            <div className="flex gap-2">
                              {product.images.slice(0, 3).map((imgUrl, i) => {
                                if (!imgUrl) return null;
                                return (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLightboxImage(imgUrl);
                                    }}
                                    className="h-11 w-11 rounded-lg border border-slate-200 overflow-hidden bg-white hover:border-slate-500 transition-all shrink-0 active:scale-95 shadow-3xs cursor-zoom-in"
                                  >
                                    <img 
                                      src={imgUrl} 
                                      alt={`Miniatura ${i + 1}`} 
                                      className="h-full w-full object-cover animate-fadeIn" 
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=100&h=100';
                                      }}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                        <div className="text-right">
                          <span className="block text-[9px] uppercase font-mono tracking-wider text-slate-400">Licencia SaaS</span>
                          <span className="text-sm font-extrabold text-[#10b981]">${product.price} USD</span>
                        </div>
                        <button
                          onClick={() => onBuyProduct && onBuyProduct(product, profile.name)}
                          disabled={product.stockStatus === 'out_of_stock'}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold shadow flex items-center gap-1.5 transition-all active:scale-95 ${
                            product.stockStatus === 'out_of_stock'
                              ? 'bg-slate-150 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                              : `${theme.buttonBg} text-white`
                          }`}
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          <span>Adquirir Licencia</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400 bg-white rounded-xl border border-dashed">
                    No se han cargado productos del catálogo de software.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Module: Testimonials reviews */}
          {localModules.includes('testimonials') && testimonials.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-rose-500" />
                <span className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">
                  Testimonios Reales de Clientes Satisfechos
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {testimonials.map((test, index) => (
                  <div 
                    key={index} 
                    className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-3xs hover:border-slate-350 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{test.author}</span>
                      <span className="text-xs text-amber-500 font-bold">{'★'.repeat(test.rating)}</span>
                    </div>
                    <p className="text-xs italic text-slate-500 font-sans">
                      "{test.text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module: Certificates and verification documents */}
          {profile.certificates && profile.certificates.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-1.5 border-b border-slate-150 pb-1.5">
                <Award className="h-4 w-4 text-slate-500" />
                <span className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">
                  Certificados y Títulos de Respaldo Cargados
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {profile.certificates.map((c) => (
                  <div 
                    key={c.id} 
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-3xs flex flex-col justify-between hover:border-slate-150 transition-all space-y-2 hover:shadow-xs"
                  >
                    <div>
                      <span className="text-[8px] font-mono font-bold uppercase text-slate-400 block tracking-wider">Certificado Oficial</span>
                      <h5 className="font-bold text-xs text-slate-800 leading-snug flex items-center gap-1 mt-0.5">
                        <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {c.name}
                      </h5>
                      <p className="text-[10px] text-slate-500 mt-1">Sello de: {c.issuer}</p>
                      {c.date && <p className="text-[9px] text-slate-400 font-mono">Emisión: {c.date}</p>}
                    </div>

                    <button
                      type="button"
                      onClick={() => downloadCertificateFile(c.name, c.issuer, c.date || '')}
                      className="w-full text-center py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-950 rounded-lg text-[9.5px] font-bold flex items-center justify-center gap-1 transition-all"
                    >
                      <Download className="h-3 w-3" />
                      <span>Descargar Documento</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module: Integration automated agents profile */}
          {isCompany && localModules.includes('agent') && profile.agentConfig?.enabled && (
            <div className="pt-2">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-800">
                  <Bot className="h-4.5 w-4.5 text-emerald-600 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">Agente Autónomo Asociado</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed leading-normal">
                  Este partner SaaS tiene configurado el bot inteligente autónomo <strong className="text-slate-800">"{profile.agentConfig.agentName}"</strong>, capacitado para procesar transacciones directas en base a decisiones con presupuesto de <strong className="text-slate-800">${profile.agentConfig.maxBudget} USD</strong>.
                </p>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Luz ambiental / Lightbox Enlarged Image Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer animate-fadeIn"
          onClick={() => setLightboxImage(null)}
        >
          <div 
            className="relative max-w-3xl max-h-[85vh] bg-white p-2 rounded-2xl border border-white/10 shadow-2xl overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={lightboxImage} 
              alt="Enlarged gallery preview" 
              className="max-w-full max-h-[75vh] object-contain rounded-xl"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&h=400';
              }}
            />
            <div className="flex justify-between items-center mt-2.5 px-2">
              <span className="text-[10px] font-mono text-slate-400">Previsualizador de Galería</span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="text-xs font-bold text-slate-750 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg transition-colors border"
              >
                Cerrar (Esc)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
