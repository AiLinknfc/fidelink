import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Check, 
  Globe, 
  Settings, 
  Plus, 
  Trash2, 
  Star, 
  X, 
  Copy, 
  Save, 
  ExternalLink, 
  Eye, 
  SlidersHorizontal, 
  MapPin, 
  Sparkles,
  PhoneCall,
  Link2,
  Lock,
  MessageSquare,
  Info,
  Clock,
  Briefcase
} from 'lucide-react';
import { SkillProfile, Service } from '../types/skillProfile';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';

interface TalentBioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: SkillProfile[];
  onSaveProfile: (id: string, updatedData: Partial<SkillProfile>) => Promise<void>;
}

const colorPresets: Record<string, {
  name: string;
  badgeBg: string;
  badgeText: string;
  accentText: string;
  buttonBg: string;
  bgGradient: string;
  taglineText: string;
}> = {
  'royal-blue': {
    name: 'Azul Real Inteligente',
    badgeBg: 'bg-blue-50/50 border border-blue-100',
    badgeText: 'text-blue-700',
    accentText: 'text-blue-600',
    buttonBg: 'bg-indigo-500 hover:bg-indigo-600',
    bgGradient: 'from-blue-50/20 to-white',
    taglineText: 'text-blue-600'
  },
  'modern-coral': {
    name: 'Coral Vanguardia',
    badgeBg: 'bg-rose-50/50 border border-rose-150',
    badgeText: 'text-rose-700',
    accentText: 'text-rose-600',
    buttonBg: 'bg-indigo-500 hover:bg-indigo-600',
    bgGradient: 'from-rose-50/10 to-white',
    taglineText: 'text-rose-600'
  },
  'neon-emerald': {
    name: 'Esmeralda Tecnológico',
    badgeBg: 'bg-emerald-50/50 border border-emerald-100',
    badgeText: 'text-emerald-700',
    accentText: 'text-emerald-600',
    buttonBg: 'bg-indigo-500 hover:bg-indigo-600',
    bgGradient: 'from-emerald-50/10 to-white',
    taglineText: 'text-emerald-600'
  },
  'warm-amber': {
    name: 'Ámbar Cálido',
    badgeBg: 'bg-amber-50/50 border border-amber-150',
    badgeText: 'text-amber-800',
    accentText: 'text-amber-700',
    buttonBg: 'bg-indigo-500 hover:bg-indigo-600',
    bgGradient: 'from-amber-50/10 to-white',
    taglineText: 'text-amber-600'
  },
  'minimal-slate': {
    name: 'Pizarra Minimalista',
    badgeBg: 'bg-slate-50 border border-slate-200',
    badgeText: 'text-slate-800',
    accentText: 'text-slate-800',
    buttonBg: 'bg-indigo-500 hover:bg-indigo-600',
    bgGradient: 'from-slate-50 to-white',
    taglineText: 'text-slate-700'
  }
};

export default function TalentBioDrawer({ isOpen, onClose, profiles, onSaveProfile }: TalentBioDrawerProps) {
  const { brand } = useModuleBrand();
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false);
  const [showUpgradePromo, setShowUpgradePromo] = useState(false);
  const [isPayingSim, setIsPayingSim] = useState(false);

  const talents = profiles;
  
  const [selectedId, setSelectedId] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'edit'>('preview');

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [locationStr, setLocationStr] = useState('');
  const [skillsCsv, setSkillsCsv] = useState('');
  const [colorPreset, setColorPreset] = useState('minimal-slate');
  const [whatsapp, setWhatsapp] = useState('');
  const [slug, setSlug] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const [ohEnabled, setOhEnabled] = useState(false);
  const [ohMonFri, setOhMonFri] = useState('09:00 - 18:00');
  const [ohSat, setOhSat] = useState('10:00 - 14:00');
  const [ohSun, setOhSun] = useState('Cerrado');
  const [ohType, setOhType] = useState<'hours' | 'appointment'>('hours');
  const [ohAppointmentLink, setOhAppointmentLink] = useState('');

  const [services, setServices] = useState<Service[]>([]);
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(50);

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (talents.length > 0) {
      const exists = talents.some(t => t.id === selectedId);
      if (!exists) {
        setSelectedId(talents[0].id);
      }
    } else {
      setSelectedId('');
    }
  }, [talents, selectedId]);

  useEffect(() => {
    const current = talents.find(t => t.id === selectedId);
    if (current) {
      setName(current.name || '');
      setTagline(current.tagline || '');
      setBio(current.bio || '');
      setLocationStr(current.location || '');
      setSkillsCsv(current.skills ? current.skills.join(', ') : '');
      setColorPreset(current.colorPreset || 'minimal-slate');
      setServices(current.services || []);
      setWhatsapp(current.whatsapp || '');
      setSlug(current.slug || current.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
      setIsPublic(current.isPublic ?? true);
      
      const oh = current.openingHours || {
        enabled: false,
        mondayToFriday: '09:00 - 18:00',
        saturday: '10:00 - 14:00',
        sunday: 'Cerrado',
        type: 'hours',
        appointmentLink: ''
      };
      setOhEnabled(oh.enabled);
      setOhMonFri(oh.mondayToFriday);
      setOhSat(oh.saturday);
      setOhSun(oh.sunday);
      setOhType(oh.type);
      setOhAppointmentLink(oh.appointmentLink || '');

      setStatusMsg('');
    }
  }, [selectedId, profiles]);

  if (!isOpen) return null;

  const currentTalent = talents.find(t => t.id === selectedId);
  const theme = colorPresets[colorPreset] || colorPresets['minimal-slate'];

  const handleAddService = () => {
    if (!newServiceTitle || !newServiceDesc) return;
    if (services.length >= 4) {
      alert("Para optimizar el alcance comercial, el catálogo de servicios está limitado a un máximo de 4 ítems.");
      return;
    }
    const added: Service = {
      id: `ser-added-${Date.now()}`,
      title: newServiceTitle,
      description: newServiceDesc,
      price: Number(newServicePrice),
      deliveryDays: 3,
      rating: 5.0,
      reviewsCount: 1
    };
    setServices([...services, added]);
    setNewServiceTitle('');
    setNewServiceDesc('');
    setNewServicePrice(50);
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    
    const otherPublicCount = profiles.filter(p => p.isPublic && p.id !== selectedId).length;
    if (isPublic && otherPublicCount >= 1 && !isPremiumUnlocked) {
      setShowUpgradePromo(true);
      return;
    }

    setIsSaving(true);
    setStatusMsg('');

    const formattedSkills = skillsCsv
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const updatedData: Partial<SkillProfile> = {
      name,
      tagline,
      bio,
      location: locationStr,
      skills: formattedSkills,
      colorPreset,
      services,
      whatsapp,
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''),
      isPublic,
      openingHours: {
        enabled: ohEnabled,
        mondayToFriday: ohMonFri,
        saturday: ohSat,
        sunday: ohSun,
        type: ohType,
        appointmentLink: ohAppointmentLink
      }
    };

    try {
      await onSaveProfile(selectedId, updatedData);
      setStatusMsg('¡Biografía de persona actualizada con éxito!');
      setTimeout(() => setStatusMsg(''), 4000);
      setActiveSubTab('preview');
    } catch (err) {
      console.error(err);
      setStatusMsg('Ocurrió un error al guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  const generatedWebUrl = `https://bioagent.net/bio/${slug || 'mi-perfil'}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedWebUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-xs transition-opacity"
      />

      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slideLeft">
        
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-slate-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Constructor de Bio-Web</h3>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Mobile Frame Simulation</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200/60 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
            title="Cerrar Constructor"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-slate-200 flex justify-end bg-white">
          <div className="flex bg-slate-105 p-0.5 rounded-lg border border-slate-200 shrink-0">
            <button
              onClick={() => setActiveSubTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                activeSubTab === 'preview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Celular Preview</span>
            </button>
            <button
              onClick={() => setActiveSubTab('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                activeSubTab === 'edit'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Editar & Publicar</span>
            </button>
          </div>
        </div>

        <div className="px-5 py-2 border-b flex items-center justify-between gap-3 shrink-0" style={{ backgroundColor: `${brand.colorHex}0D`, borderColor: `${brand.colorHex}25` }}>
          <span className="text-[10px] font-sans font-semibold flex items-center gap-1.5" style={{ color: brand.colorHex }}>
            <Info className="h-3.5 w-3.5 shrink-0" style={{ color: brand.colorHex }} />
            {isPremiumUnlocked ? (
              <span>✨ Plan Premium Activo - Publicaciones ilimitadas autorizadas</span>
            ) : (
              <span>⚠️ Plan Gratuito: 1 sola publicación pública sin pagar ({profiles.filter(p => p.isPublic && p.id !== selectedId).length > 0 ? "Otras publicaciones activas detectadas" : "Sin interferencias"})</span>
            )}
          </span>
          {!isPremiumUnlocked && (
            <button 
              type="button"
              onClick={() => setShowUpgradePromo(true)}
              className="text-[9px] font-extrabold uppercase tracking-widest text-white px-2.5 py-1 rounded-md transition-all cursor-pointer active:scale-95 shrink-0 hover:opacity-90" style={{ backgroundColor: brand.colorHex }}
            >
              Comprar
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-slate-50 text-slate-700">
          {statusMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-medium text-center animate-fadeIn">
              {statusMsg}
            </div>
          )}

          {activeSubTab === 'preview' ? (
            <div className="flex flex-col items-center justify-center py-2">
              <div 
                className="w-[340px] border-[10px] border-slate-900 rounded-[36px] bg-slate-50 shadow-2xl relative overflow-hidden flex flex-col"
                style={{ height: '560px' }}
              >
                <div className="absolute top-0 inset-x-0 h-4 flex justify-center z-25">
                  <div className="w-18 bg-slate-900 h-2 rounded-b-xl" />
                </div>

                <div className="h-7 bg-slate-950 font-mono text-[9px] text-zinc-400 flex justify-between items-center px-6 pt-1 shrink-0 select-none">
                  <span>12:00</span>
                  <div className="flex items-center gap-1.5">
                    <span>5G</span>
                    <div className="w-4 h-2 bg-zinc-600 rounded-sm p-0.2">
                      <div className="h-full bg-zinc-300 rounded-xs w-2.5" />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 flex items-center justify-between gap-1.5 shrink-0 select-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-slate-350" />
                    <div className="w-2 h-2 rounded-full bg-slate-350" />
                  </div>
                  <div className="flex-1 bg-white border border-slate-250 rounded-md px-2 py-0.5 text-center text-[8px] text-slate-400 font-mono flex items-center justify-center gap-1 select-all">
                    {!isPublic && <Lock className="h-2.5 w-2.5 text-slate-400 shrink-0" />}
                    <span>bioagent.net/bio/<strong>{slug || 'mi-perfil'}</strong></span>
                  </div>
                  <Globe className="h-3 w-3 text-slate-400 shrink-0" />
                </div>

                <div className="flex-1 overflow-y-auto bg-white text-slate-800 scrollbar-thin text-[12px] relative flex flex-col">
                  {currentTalent ? (
                    <>
                      <div className={`p-4 bg-gradient-to-b ${theme.bgGradient} border-b border-slate-100 flex flex-col items-center text-center space-y-2`}>
                        <img 
                          src={currentTalent.avatar} 
                          alt={currentTalent.name} 
                          className="w-14 h-14 rounded-full object-cover border border-slate-200/80 shadow-md bg-slate-100"
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-slate-900 text-xs flex items-center justify-center gap-1">
                            {currentTalent.name}
                            <Sparkles className="h-3 w-3 text-amber-500 fill-amber-500" />
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {currentTalent.id}</span>
                          <p className={`text-[10px] font-bold tracking-tight ${theme.taglineText}`}>{currentTalent.tagline}</p>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="space-y-1">
                          <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase block">Acerca de mí</span>
                          <p className="text-[10px] text-slate-600 leading-relaxed font-sans">{currentTalent.bio}</p>
                        </div>

                        {locationStr && (
                          <div className="flex items-center text-[9px] text-slate-500 gap-1 font-sans">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            <span>{locationStr}</span>
                          </div>
                        )}

                        {currentTalent.skills && currentTalent.skills.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase block">Aptitudes Clave</span>
                            <div className="flex flex-wrap gap-1">
                              {currentTalent.skills.map((s, idx) => (
                                <span key={idx} className="bg-slate-100 text-[9px] text-slate-700 px-1.5 py-0.5 rounded-md font-sans border border-slate-200/60 font-medium">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {whatsapp && (
                          <div className="pt-2">
                            <a 
                              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="w-full flex items-center justify-center gap-1.5 p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-205 text-emerald-800 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all"
                            >
                              <PhoneCall className="h-3 w-3 text-emerald-600 shrink-0" />
                              <span>Enviarme WhatsApp</span>
                            </a>
                            <span className="block text-[8px] text-slate-400 text-center mt-1 font-mono">Conectar al: +{whatsapp}</span>
                          </div>
                        )}

                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase block">Mini-Ecommerce de Servicios</span>
                          {services.length > 0 ? (
                            <div className="space-y-1.5">
                              {services.slice(0, 4).map((service) => (
                                <div key={service.id} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                                  <div className="flex justify-between items-start">
                                    <h5 className="font-bold text-slate-800 text-[10px] leading-tight flex-1">{service.title}</h5>
                                    <span className="text-[10px] font-bold text-slate-900 ml-1 font-mono text-right shrink-0">${service.price} USD</span>
                                  </div>
                                  <p className="text-[9px] text-slate-500 leading-relaxed font-sans truncate">{service.description}</p>
                                  <div className="flex items-center justify-between pt-1">
                                    <span className="text-[8px] text-slate-400 font-mono">Entrega: {service.deliveryDays} d</span>
                                    <button 
                                      onClick={() => alert(`Simulación: Has solicitado "${service.title}" del portafolio móvil`)}
                                      className={`px-2 py-0.5 text-white text-[8px] font-bold rounded-md uppercase tracking-wider ${theme.buttonBg} transition-all`}
                                    >
                                      Contratar
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[9px] text-slate-400 italic font-mono text-center py-2 bg-slate-50 border border-dashed rounded-lg">Ningún servicio activo cargado.</p>
                          )}
                        </div>

                      </div>

                      <div className="p-4 mt-auto border-t border-slate-150 bg-slate-50 text-center space-y-1">
                        <span className="text-[8px] font-mono text-slate-400 uppercase block">Powered by BioAgent</span>
                        <span className="text-[7px] text-slate-400 block font-mono">© 2026 Sandbox Network</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-8 text-xs text-slate-400">Cargando biografía...</div>
                  )}
                </div>

              </div>

              <div className="w-full max-w-sm mt-5 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4 text-sky-500" />
                    <span className="text-xs font-bold text-slate-700">Estado de Publicación</span>
                  </div>
                  {isPublic ? (
                    <span className="bg-emerald-105 text-emerald-800 text-[9px] font-extrabold uppercase font-mono px-2 py-0.5 border border-emerald-200 rounded-md">
                      Página Pública
                    </span>
                  ) : (
                    <span className="bg-slate-105 text-slate-600 text-[9px] font-extrabold uppercase font-mono px-2 py-0.5 border border-slate-200 rounded-md">
                      Borrador Privado
                    </span>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200/60">
                  <span className="text-[9px] text-slate-450 block uppercase tracking-wider font-mono">Su dirección web asignada:</span>
                  <div className="flex items-center justify-between gap-2 overflow-hidden bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-600 truncate font-mono select-all">
                      {generatedWebUrl}
                    </span>
                    <button
                      onClick={copyToClipboard}
                      className="text-slate-500 hover:text-slate-800 p-1 shrink-0 transition-colors"
                      title="Copiar URL"
                    >
                      {copiedUrl ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (!isPublic) {
                        alert("Debes marcar 'Hacer perfil público' en la sección 'Editar & Publicar' de este constructor antes de abrir la web.");
                        return;
                      }
                      alert(`¡Redirección Simulada! Abriendo página web personalizada publicada: ${generatedWebUrl}`);
                    }}
                    className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold font-sans flex items-center justify-center gap-1.5 shadow"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Abrir en Nueva Ventana</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-5 animate-fadeIn bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs">
              <div className="border-b border-slate-150 pb-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Ajustes de Publicación Web</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Define los atributos e integraciones para tu dominio sandbox.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Tu Nombre Profesional</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-slate-400 text-slate-800 placeholder:text-slate-400 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Eslogan / Tagline Corto</label>
                  <input
                    type="text"
                    required
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-slate-400 text-slate-800 placeholder:text-slate-400 font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Biografía / Acerca de Ti</label>
                <textarea
                  rows={3}
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-slate-400 text-slate-800 placeholder:text-slate-400 font-sans leading-relaxed"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 gap-4">
                <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block font-mono">Campos de Integración Profesional</span>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1">
                    <PhoneCall className="h-3 w-3 text-emerald-600" />
                    <span>WhatsApp de Contacto</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ej. +5218112345678 (Con código de país)"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-slate-400 text-slate-800 placeholder:text-slate-400 font-sans"
                    />
                  </div>
                  <p className="text-[9px] text-slate-400">Permite a los visitantes del celular enviarte un WhatsApp directo con un solo click.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1">
                    <Link2 className="h-3 w-3 text-sky-500" />
                    <span>Slug de Publicación (URL)</span>
                  </label>
                  <div className="flex">
                    <span className="bg-slate-200 border border-r-0 border-slate-200 px-2 rounded-l-lg text-[10px] text-slate-500 font-mono flex items-center">
                      bioagent.net/bio/
                    </span>
                    <input
                      type="text"
                      placeholder="sofia-mendoza-ia"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-r-lg px-2.5 py-1.5 text-xs font-sans outline-none focus:ring-1 focus:ring-slate-400 text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                  <p className="text-[9px] text-slate-400">El slug o nombre único con el cual tu página será publicada.</p>
                </div>

                <div className="pt-2 border-t border-slate-200/80">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const otherPublicCount = profiles.filter(p => p.isPublic && p.id !== selectedId).length;
                        if (checked && otherPublicCount >= 1 && !isPremiumUnlocked) {
                          setShowUpgradePromo(true);
                        } else {
                          setIsPublic(checked);
                        }
                      }}
                      className="h-4 w-4 rounded text-slate-900 border-slate-300 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block flex items-center gap-1">
                        ¿Hacer perfil público e indexado de forma visible?
                        {!isPremiumUnlocked && <Lock className="h-3 w-3" style={{ color: brand.colorHex }} />}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Si se desactiva, actuará como borrador bajo protección</span>
                    </div>
                  </label>
                  {!isPremiumUnlocked && profiles.filter(p => p.isPublic && p.id !== selectedId).length > 0 && (
                    <div className="mt-2 bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-lg text-[10px] leading-relaxed flex items-start gap-1.5 font-sans">
                      <Info className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Restricción de Cuenta Única Gratuita:</strong> Tienes otras biografías públicas activas. No podrás guardar o habilitar este perfil como público a menos que lo dejes en borrador o <button type="button" onClick={() => setShowUpgradePromo(true)} className="underline font-bold cursor-pointer" style={{ color: brand.colorHex }}>Adquieras el Acceso Completo Premium ($19 USD)</button>.
                      </span>
                    </div>
                  )}
                </div>

              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Elegir Plantilla de Color</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(colorPresets).map((presetKey) => {
                    const preset = colorPresets[presetKey];
                    const isActive = colorPreset === presetKey;
                    return (
                      <button
                        type="button"
                        key={presetKey}
                        onClick={() => setColorPreset(presetKey)}
                        className={`p-2 rounded-xl text-left border text-xs font-semibold transition-all ${
                          isActive 
                            ? 'bg-slate-50 border-slate-800 shadow-3xs ring-1 ring-slate-800' 
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <span className="block font-sans text-slate-800">{preset.name}</span>
                        <span className="text-[8px] font-mono text-slate-400 uppercase block mt-0.5">Preset: {presetKey}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Ubicación</label>
                  <input
                    type="text"
                    value={locationStr}
                    onChange={(e) => setLocationStr(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-slate-400 text-slate-800 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Habilidades (Tags CSV)</label>
                  <input
                    type="text"
                    placeholder="PyTorch, OpenCV"
                    value={skillsCsv}
                    onChange={(e) => setSkillsCsv(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-slate-400 text-slate-800 font-sans"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-slate-800 block">Horarios de Atención y Agenda</label>
                    <span className="text-[9.5px] text-slate-400 block font-light">Activa tu disponibilidad o botón de cita previa</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
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
                  <div className="space-y-3 pt-2.5 border-t border-slate-200/60 animate-fadeIn">
                    <div className="flex gap-4 text-xs font-medium text-slate-700">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="radio" 
                          name="ohType" 
                          checked={ohType === 'hours'} 
                          onChange={() => setOhType('hours')} 
                          className="accent-slate-900" 
                        />
                        <span>Horarios de Atención</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="radio" 
                          name="ohType" 
                          checked={ohType === 'appointment'} 
                          onChange={() => setOhType('appointment')} 
                          className="accent-slate-900" 
                        />
                        <span>Programar Cita Virtual</span>
                      </label>
                    </div>

                    {ohType === 'hours' ? (
                      <div className="space-y-2.5 bg-white p-2.5 rounded-xl border border-slate-150">
                        <div className="grid grid-cols-3 items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Lun a Vie</span>
                          <input 
                            type="text" 
                            value={ohMonFri} 
                            onChange={(e) => setOhMonFri(e.target.value)} 
                            className="col-span-2 text-xs border border-slate-200 rounded-md p-1 outline-none focus:border-slate-800 text-slate-800 placeholder:text-slate-400" 
                            placeholder="Ej: 09:00 - 18:00"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Sábado</span>
                          <input 
                            type="text" 
                            value={ohSat} 
                            onChange={(e) => setOhSat(e.target.value)} 
                            className="col-span-2 text-xs border border-slate-200 rounded-md p-1 outline-none focus:border-slate-800 text-slate-800 placeholder:text-slate-400" 
                            placeholder="Ej: 10:00 - 14:00 o Cerrado"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Domingo</span>
                          <input 
                            type="text" 
                            value={ohSun} 
                            onChange={(e) => setOhSun(e.target.value)} 
                            className="col-span-2 text-xs border border-slate-200 rounded-md p-1 outline-none focus:border-slate-800 text-slate-800 placeholder:text-slate-400" 
                            placeholder="Ej: Cerrado o 11:00 - 15:00"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-slate-150">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Enlace de Agenda (Calendly / TidyCal)</label>
                        <input 
                          type="url" 
                          placeholder="https://calendly.com/tu-usuario/cita" 
                          value={ohAppointmentLink} 
                          onChange={(e) => setOhAppointmentLink(e.target.value)} 
                          className="w-full text-xs border border-slate-200 rounded-md p-1.5 outline-none focus:border-slate-800 font-sans bg-slate-50/50 text-slate-800 placeholder:text-slate-400"
                        />
                        <span className="text-[9px] text-slate-400 block leading-tight font-light">
                          Habilita un botón destacado en tu biografía para que clientes agenden directamente.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block">
                    {currentTalent && ['propietario', 'mascota', 'evento', 'vehiculo', 'casa', 'boda'].includes(currentTalent.type)
                      ? "Catálogo de Servicios/Productos Sugeridos (Máximo 4)"
                      : "Editar Mini-Ecommerce de Servicios (Máximo 4)"}
                  </label>
                  <span className="text-[9px] font-mono text-slate-400">{services.length} de 4</span>
                </div>

                {currentTalent && ['propietario', 'mascota', 'evento', 'vehiculo', 'casa', 'boda'].includes(currentTalent.type) && (
                  <div className="space-y-2 p-3 rounded-xl border" style={{ backgroundColor: `${brand.colorHex}0D`, borderColor: `${brand.colorHex}25` }}>
                    <span className="text-[9px] font-bold uppercase tracking-wider block flex items-center gap-1" style={{ color: brand.colorHex }}>
                      <Briefcase className="h-3 w-3" /> Recomendar Servicios/Productos de la Red
                    </span>
                    <p className="text-[10.5px] text-slate-500 leading-snug">
                      Elige de los servicios y productos creados por profesionales independientes y empresas en la base de datos para sugerir en tu perfil:
                    </p>
                    
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 bg-white p-2 rounded-lg border border-slate-200">
                      {profiles && profiles
                        .filter(p => p.id !== selectedId && (p.type === 'individual' || p.type === 'company'))
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
                            <div key={p.id} className="space-y-1 border-b border-slate-100 last:border-0 pb-1.5 mb-1.5 last:pb-0 last:mb-0">
                              <span className="text-[8px] font-bold text-slate-400 font-mono uppercase">De: {p.name} ({p.type === 'individual' ? 'Persona' : 'Empresa'})</span>
                              <div className="space-y-1">
                                {items.map((item: any) => {
                                  const isRecommended = services.some(s => s.id === item.id || s.title === item.title);
                                  return (
                                    <div key={item.id} className="flex items-center justify-between gap-1.5 p-1 rounded bg-slate-50 border border-slate-100/60 text-xs">
                                      <div className="truncate flex-1">
                                        <span className="font-bold text-slate-700 block text-[9.5px] truncate">{item.title}</span>
                                        <span className="text-[8.5px] text-slate-450 font-mono">${item.price} USD • {item.itemType === 'service' ? 'Servicio' : 'Producto'}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (isRecommended) {
                                            setServices(services.filter(s => s.id !== item.id && s.title !== item.title));
                                          } else {
                                            if (services.length >= 4) {
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
                                            setServices([...services, newS]);
                                          }
                                        }}
                                        className={`px-1.5 py-0.5 rounded text-[7.5px] font-bold uppercase tracking-wider transition-all border ${
                                          isRecommended 
                                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                                            : 'hover:opacity-90'
                                        }`}
                                        style={!isRecommended ? { backgroundColor: `${brand.colorHex}12`, color: brand.colorHex, borderColor: `${brand.colorHex}40` } : undefined}
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
                      {(!profiles || profiles.filter(p => p.id !== selectedId && (p.type === 'individual' || p.type === 'company')).length === 0) && (
                        <p className="text-[9.5px] text-slate-450 italic text-center py-3">No hay otros profesionales o empresas registradas en el sistema para sugerir.</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {services.map((ser) => (
                    <div key={ser.id} className="bg-slate-50 p-2 rounded-lg border border-slate-150 flex justify-between items-center text-xs">
                      <div className="truncate pr-2">
                        <strong className="text-slate-800 block text-[11px] truncate">{ser.title}</strong>
                        <span className="text-[9px] text-[#10b981] font-mono font-bold">${ser.price} USD</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleRemoveService(ser.id)}
                        className="text-slate-400 hover:text-red-500 p-1 shrink-0 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {services.length === 0 && (
                    <p className="text-[10px] text-slate-400 italic font-mono text-center py-2 border border-dashed rounded-lg bg-slate-50">Cero servicios activos cargados.</p>
                  )}
                </div>

                {services.length < 4 && (
                  <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200 space-y-2.5">
                    <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Agregar Servicio</span>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Título del Servicio"
                        value={newServiceTitle}
                        onChange={(e) => setNewServiceTitle(e.target.value)}
                        className="col-span-2 text-xs bg-white border border-slate-250 rounded-lg p-1.5 text-slate-800 placeholder:text-slate-400 outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Precio USD"
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(Number(e.target.value))}
                        className="text-xs bg-white border border-slate-250 rounded-lg p-1.5 font-bold font-sans text-slate-800 placeholder:text-slate-400 outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Descripción corta del entregable profesional..."
                        value={newServiceDesc}
                        onChange={(e) => setNewServiceDesc(e.target.value)}
                        className="flex-1 text-xs bg-white border border-slate-250 rounded-lg p-1.5 text-slate-800 placeholder:text-slate-400 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddService}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold font-sans flex items-center gap-1 shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Añadir</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('preview')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all active:scale-95"
                >
                  {isSaving ? (
                    <span>Guardando...</span>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>Aplicar Ajustes Web</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200/80 text-center select-none text-[10px] font-mono text-slate-400">
          <span>Elige el preset estético deseado para simular tu branding.</span>
        </div>

      </div>

      {showUpgradePromo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-150 relative space-y-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center animate-pulse" style={{ backgroundColor: `${brand.colorHex}12`, borderColor: `${brand.colorHex}25`, color: brand.colorHex }}>
              <Sparkles className="h-6 w-6" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Pasarela de Acceso Premium</h3>
              <p className="text-xs text-slate-500 leading-normal">
                Tu Cuenta Única del ecosistema cuenta con un límite de 1 biografía pública en el plan gratuito. Tienes otros perfiles publicados actualmente.
              </p>
            </div>

            <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200 text-left space-y-1.5 text-xs text-slate-650">
              <div className="flex justify-between font-bold text-slate-800 border-b border-dashed border-slate-200 pb-1.5 mb-1.5 font-mono">
                <span>Pase Multi-Biografía</span>
                <span style={{ color: brand.colorHex }}>$19.00 USD</span>
              </div>
              <p className="text-[10px] text-slate-600">✔️ Publica personas, negocio/restaurante y activos de forma simultánea.</p>
              <p className="text-[10px] text-slate-600">✔️ URLs ilimitadas activas en la red descentralizada.</p>
              <p className="text-[10px] text-slate-600">✔️ Indexación prioritaria para agentes AI de autotrading.</p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                disabled={isPayingSim}
                onClick={async () => {
                  setIsPayingSim(true);
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  setIsPremiumUnlocked(true);
                  setIsPublic(true);
                  setIsPayingSim(false);
                  setShowUpgradePromo(false);
                  setStatusMsg("¡Pase Premium Multi-Biografía Desbloqueado!");
                  setTimeout(() => setStatusMsg(""), 3500);
                }}
                className="w-full py-2.5 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 font-sans hover:opacity-90" style={{ backgroundColor: brand.colorHex }}
              >
                {isPayingSim ? 'Firmando Transacción Segura...' : 'Comprar y Desbloquear ($19 USD)'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowUpgradePromo(false);
                  setIsPublic(false);
                }}
                className="w-full py-2 text-slate-500 hover:text-slate-800 font-bold text-xs font-sans"
              >
                Permanecer en Plan Gratuito (1 sola pública)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
