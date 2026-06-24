import React, { useState } from 'react';
import { User, Building, Plus, Trash, HelpCircle, Save, Check, Award, LayoutGrid, Info, Settings, FileText, Image, Download, Sparkles } from 'lucide-react';
import { SkillProfile, Service, Product } from '../types/skillProfile';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';

interface ProfileFormProps {
  onAddProfile: (profile: any) => void;
  existingTypes?: string[];
  profiles?: SkillProfile[];
}

const BIOGRAPHY_TYPES = [
  { value: 'individual', label: 'Persona Profesional', desc: 'Para consultores, programadores, creadores y profesionales autónomos.' },
  { value: 'company', label: 'Empresa / SaaS / Corporativo', desc: 'Venta de licencias informáticas, productos y automatizaciones.' },
  { value: 'propietario', label: 'Propietario / Terceros', desc: 'Expone propiedades, vehículos o herencias intelectuales controladas por un titular.' },
  { value: 'mascota', label: 'Mascota / Compañero Canino y Felino', desc: 'Hoja de vida para mascotas, vacunas, pedigrí, historial y dueños.' },
  { value: 'evento', label: 'Evento / Celebración o Festival', desc: 'Páginas de conferencias, cumpleaños, festivales y agendas.' },
  { value: 'vehiculo', label: 'Vehículo / Historial Móvil', desc: 'Ficha técnica de autos, motos, barcos, historial mecánico y venta.' },
  { value: 'casa', label: 'Inmueble / Alquiler o Venta de Propiedad', desc: 'Arriendos, apartamentos, casas rurales y locales con su descripción.' },
  { value: 'boda', label: 'Boda / Matrimonio Conmemorativo', desc: 'Itinerarios, confirmación de invitados y mesa de regalos real.' },
  { value: 'restaurante', label: 'Restaurante / Negocio Gastronómico', desc: 'Ficha gastronómica: especialidades, menú digital, reservas y contacto directo.' }
];

export default function ProfileForm({ onAddProfile, existingTypes = [], profiles = [] }: ProfileFormProps) {
  const { brand } = useModuleBrand();
  const [type, setType] = useState<string>('individual');
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatar, setAvatar] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [slug, setSlug] = useState('');
  
  const isPropietario = ['propietario', 'mascota', 'evento', 'vehiculo', 'casa', 'boda'].includes(type);
  const ownerTypes = ['propietario', 'mascota', 'evento', 'vehiculo', 'casa', 'boda'];
  const ownerProfilesInSystemCount = existingTypes.filter(t => ownerTypes.includes(t)).length;
  const hasReachedOwnersLimit = ['propietario', 'mascota', 'evento', 'vehiculo', 'casa', 'boda'].includes(type) && ownerProfilesInSystemCount >= 3;
  
  // Custom Services or Products inputs (Max 3 items now)
  const [items, setItems] = useState<any[]>([
    { title: '', description: '', price: 50, optionalNum: 3, images: ['', '', ''] }
  ]);

  const handleTypeChange = (newType: string) => {
    setType(newType);
    if (['propietario', 'mascota', 'evento', 'vehiculo', 'casa', 'boda'].includes(newType)) {
      setItems([]);
    } else {
      setItems([{ title: '', description: '', price: 50, optionalNum: 3, images: ['', '', ''] }]);
    }
  };

  // Certificates states
  const [certs, setCerts] = useState<any[]>([]);
  const [newCertName, setNewCertName] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertDate, setNewCertDate] = useState('');
  const [newCertFile, setNewCertFile] = useState('');

  // Company Agent config
  const [agentEnabled, setAgentEnabled] = useState(false);
  const [agentName, setAgentName] = useState('Agente Comprador AI');
  const [requirements, setRequirements] = useState('');
  const [maxBudget, setMaxBudget] = useState(250);
  const [autoApprove, setAutoApprove] = useState(true);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddItem = () => {
    if (items.length >= 3) return; // Limit to 3 items as requested
    setItems([...items, { title: '', description: '', price: 50, optionalNum: 3, images: ['', '', ''] }]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: string, val: any) => {
    const updated = [...items];
    updated[idx][field] = val;
    setItems(updated);
  };

  const handleAddCert = () => {
    if (!newCertName || !newCertIssuer) return;
    setCerts([...certs, {
      id: `cert-${Date.now()}`,
      name: newCertName,
      issuer: newCertIssuer,
      date: newCertDate || new Date().toISOString().split('T')[0],
      fileUrl: newCertFile || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }]);
    setNewCertName('');
    setNewCertIssuer('');
    setNewCertDate('');
    setNewCertFile('');
  };

  const handleRemoveCert = (id: string) => {
    setCerts(certs.filter(c => c.id !== id));
  };

  const autoFillSampleCert = () => {
    setNewCertName('Certificación de Autenticidad Digital');
    setNewCertIssuer('RUNT & Organismo Verificador Internacional');
    setNewCertDate('2026-02-15');
    setNewCertFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !tagline || !bio) return;

    // Split skills
    const skills = skillsText
      ? skillsText.split(',').map((s) => s.trim().replace(/^#/, '')).filter(Boolean)
      : ['Innovación', 'Estrategia'];

    const baseAvatar = avatar || (
      type === 'company'
        ? 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=200&h=200'
        : type === 'mascota'
          ? 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200&h=200'
          : type === 'vehiculo'
            ? 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=200&h=200'
            : type === 'casa'
              ? 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=200&h=200'
              : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200'
    );

    const structuredProfile: any = {
      id: `${type === 'company' ? 'comp' : 'prof'}-${Date.now()}`,
      type,
      name,
      avatar: baseAvatar,
      tagline,
      bio,
      skills,
      location: location || 'Remoto',
      rating: 5.0,
      reviewsCount: 1,
      whatsapp: whatsapp.trim(),
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '') || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      isPublic: true,
      colorPreset: 'minimal-slate',
      certificates: certs,
      activeModules: ['services', 'products', 'skills', 'stats', 'testimonials', 'location']
    };

    // Filter non-empty items
    const validItems = items.filter(it => it.title.trim() !== '');

    if (type !== 'company') {
      structuredProfile.services = validItems.map((it, idx) => ({
        id: `ser-new-${idx}-${Date.now()}`,
        title: it.title,
        description: it.description || 'Consultoría o servicio profesional a detalle.',
        price: Number(it.price) || 50,
        deliveryDays: Number(it.optionalNum) || 3,
        rating: 5.0,
        reviewsCount: 1,
        images: it.images ? it.images.filter(Boolean) : []
      })) as Service[];
    } else {
      structuredProfile.products = validItems.map((it, idx) => ({
        id: `prod-new-${idx}-${Date.now()}`,
        title: it.title,
        description: it.description || 'Producto tecnológico listo para despliegue.',
        price: Number(it.price) || 50,
        stockStatus: 'available',
        rating: 5.0,
        reviewsCount: 1,
        images: it.images ? it.images.filter(Boolean) : []
      })) as Product[];

      // Fill in agent config
      structuredProfile.agentConfig = {
        enabled: agentEnabled,
        agentName: agentName || 'Agente Comprador AI',
        requirementsInstruction: requirements || 'Busca mejores ofertas tecnológicas y diseño.',
        maxBudget: Number(maxBudget) || 200,
        autoApproveTrades: autoApprove
      };
    }

    onAddProfile(structuredProfile);
    setSavedSuccess(true);
    
    // Clear form
    setName('');
    setTagline('');
    setBio('');
    setLocation('');
    setAvatar('');
    setSkillsText('');
    setWhatsapp('');
    setSlug('');
    setCerts([]);
    setItems([{ title: '', description: '', price: 50, optionalNum: 3, images: ['', '', ''] }]);
    
    setTimeout(() => {
      setSavedSuccess(false);
    }, 4000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
      
      {/* Dynamic Title Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-5 mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="h-5.5. w-5.5" style={{ color: brand.colorHex }} />
            Registro de Nueva Biografía & Ofertas
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl mt-1">
            Pon en órbita tus capacidades. El Broker BioBustler consumirá esta biografía para que agentes de otras empresas puedan encontrarte, comprar y vender de forma automatizada.
          </p>
        </div>

        <div className="text-xs font-mono font-medium px-3 py-1.5 rounded-lg border" style={{ color: brand.colorHex, backgroundColor: `${brand.colorHex}12`, borderColor: `${brand.colorHex}25` }}>
          Activa en Red
        </div>
      </div>

      {savedSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-3 animate-pulse">
          <div className="bg-emerald-600 text-white rounded-full p-1 shrink-0">
            <Check className="h-4 w-4" />
          </div>
          <div>
            <h5 className="font-bold text-sm">¡Registro con éxito!</h5>
            <p className="text-xs">Tu perfil de biografía y catálogo comercial (máximo 3 items) se han federado en el ecosistema SaaS.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Toggle between Biography Types (Standard selection) */}
        <div className="space-y-3 bg-slate-50/50 p-4.5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-slate-705 animate-pulse" />
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-widest font-mono">Tipo de Biografía Publicable</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-450 uppercase block tracking-wider">Selecciona la Categoría</label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full bg-white border border-slate-205 focus:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold font-sans text-slate-800 outline-none transition-all shadow-3xs cursor-pointer"
              >
                {BIOGRAPHY_TYPES.map((bt) => (
                  <option key={bt.value} value={bt.value}>
                    {bt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-150 flex flex-col justify-center">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Detalles y Enfoque Real</span>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-sans font-light">
                {BIOGRAPHY_TYPES.find(bt => bt.value === type)?.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Basic Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              {type === 'company' ? 'Nombre de la Empresa o Marca' : 'Nombre Completo / alias'} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'company' ? 'Ej. PixelCrafters Ltd' : 'Ej. Mateo Ríos'}
              className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-xl px-3 py-2 text-xs outline-none text-slate-800 placeholder:text-slate-400 transition-all font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Eslogan Profesional / Tagline *
            </label>
            <input
              type="text"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder={type === 'company' ? 'Ej. Suite ERP y Automatización' : 'Ej. Constructor Frontend React & UI Specialist'}
              className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-xl px-3 py-2 text-xs outline-none text-slate-800 placeholder:text-slate-400 transition-all font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ubicación física o modelo de trabajo</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej. Monterrey, México o Remoto"
              className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-xl px-3 py-2 text-xs outline-none text-slate-800 placeholder:text-slate-400 transition-all font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">URL de Foto de Perfil / Logo (Opcional)</label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="Ej. https://images.unsplash.com/... (Dejar en blanco para autogenerar)"
              className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-xl px-3 py-2 text-xs outline-none text-slate-800 placeholder:text-slate-400 transition-all font-sans opacity-90"
            />
          </div>

          <div className="space-y-1.5 font-sans">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">WhatsApp (Contacto Directo)</label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ej. +5218112345678"
              className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-xl px-3 py-2 text-xs outline-none text-slate-800 placeholder:text-slate-400 transition-all font-sans"
            />
          </div>

          <div className="space-y-1.5 font-sans">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Slug o Nombre de URL de Página</label>
            <div className="flex">
              <span className="bg-slate-100 border border-r-0 border-slate-200 px-3 rounded-l-xl text-xs text-slate-400 font-mono flex items-center">
                bioagent.net/bio/
              </span>
              <input
                type="text"
                placeholder="slug-unico"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-r-xl px-3 py-2 text-xs outline-none text-slate-800 placeholder:text-slate-400 transition-all font-sans"
              />
            </div>
          </div>
        </div>

        {/* Biography Block */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Biografía Intelectual y Tecnológica *</label>
          <textarea
            required
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Escribe brevemente tu historia, tus más de 5 años de trayectoria o metas de tu compañía en el sector, tus puntos clave diferenciadores."
            className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-xl px-3 py-2 text-xs outline-none text-slate-800 placeholder:text-slate-400 transition-all font-sans resize-none"
          />
        </div>

        {/* Aptitudes / Skills */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Aptitudes / Habilidades Clave (Separadas por comas)</label>
            <span className="text-[10px] text-slate-400">Separar por comas</span>
          </div>
          <input
            type="text"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="Ej. Figma, React, SEO, Make, Automatización, Python, UX"
            className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-xl px-3 py-2 text-xs outline-none text-slate-800 placeholder:text-slate-400 transition-all font-sans"
          />
        </div>
        <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <LayoutGrid className="h-4.5 w-4.5 text-slate-500" />
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">
                {isPropietario 
                  ? 'Recomendar Servicios o Productos de la Red (Máximo 3)' 
                  : `Catálogo Comercial de ${type === 'company' ? 'Productos' : 'Servicios'} (Máximo 3)`}
              </h4>
            </div>
            
            {!isPropietario && items.length < 3 && (
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all" style={{ color: brand.colorHex }}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Agregar Item</span>
              </button>
            )}
          </div>

          {isPropietario ? (
            <div className="space-y-4">
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                Como perfil de propietario o activo, no creas servicios o productos propios. Elige de la red de profesionales y empresas registradas para recomendar sus servicios en tu biografía:
              </p>
              
              {/* List of recommended items */}
              {items.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Tus Recomendaciones Seleccionadas ({items.length}/3)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {items.map((it, idx) => (
                      <div key={idx} className="border p-2.5 rounded-xl relative text-xs flex flex-col justify-between font-sans shadow-3xs" style={{ backgroundColor: `${brand.colorHex}12`, borderColor: `${brand.colorHex}40` }}>
                        <div>
                          <strong className="block text-[10.5px] truncate" style={{ color: brand.colorHex }}>{it.title}</strong>
                          <span className="text-[9px] font-mono block font-bold" style={{ color: brand.colorHex }}>${it.price} USD</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setItems(items.filter(item => item.title !== it.title))}
                          className="text-[9.5px] text-red-600 hover:text-red-700 hover:underline text-left mt-2 font-bold uppercase tracking-wider"
                        >
                          Quitar recomendación
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selector scrollable list */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 bg-white p-3 rounded-xl border border-slate-200">
                {profiles && profiles
                  .filter(p => p.type === 'individual' || p.type === 'company')
                  .map(p => {
                    const availableItems = [
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
                    
                    if (availableItems.length === 0) return null;
                    
                    return (
                      <div key={p.id} className="space-y-1.5 border-b border-slate-100 last:border-0 pb-3 mb-3 last:pb-0 last:mb-0">
                        <span className="text-[9px] font-bold text-slate-400 font-mono uppercase">De: {p.name} ({p.type === 'individual' ? 'Persona' : 'Empresa'})</span>
                        <div className="space-y-1 font-sans">
                          {availableItems.map(item => {
                            const isRecommended = items.some(it => it.title === item.title);
                            return (
                              <div key={item.id} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-slate-50 border border-slate-150/60 text-xs">
                                <div className="truncate flex-1">
                                  <span className="font-bold text-slate-700 block text-[10.5px] truncate">{item.title}</span>
                                  <span className="text-[9.5px] text-slate-400 font-mono">${item.price} USD • {item.itemType === 'service' ? 'Servicio' : 'Producto'}</span>
                                  {item.description && (
                                    <p className="text-[9.5px] text-slate-400 truncate mt-0.5">{item.description}</p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isRecommended) {
                                      setItems(items.filter(it => it.title !== item.title));
                                    } else {
                                      if (items.length >= 3) {
                                        alert("Puedes sugerir un máximo de 3 servicios o productos.");
                                        return;
                                      }
                                      setItems([...items, {
                                        id: item.id,
                                        title: item.title,
                                        description: item.description,
                                        price: item.price,
                                        optionalNum: item.deliveryDays || 1,
                                        images: item.images || []
                                      }]);
                                    }
                                  }}
                                  className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all border shrink-0 ${
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
                {(!profiles || profiles.filter(p => p.type === 'individual' || p.type === 'company').length === 0) && (
                  <p className="text-[10px] text-slate-400 italic text-center py-6">No hay otros profesionales o empresas registradas en el sistema para sugerir.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs space-y-3 relative">
                  <div className="absolute top-4 right-4 text-xs font-mono text-slate-300">
                    Item #{idx + 1}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    
                    {/* Item title */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        Nombre del item *
                      </label>
                      <input
                        type="text"
                        required
                        value={item.title}
                        onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                        placeholder={type === 'company' ? 'Ej. Paquete de Scripts Bash' : 'Ej. Auditoría exprés de 1 hora'}
                        className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800 transition-all font-sans"
                      />
                    </div>

                    {/* Price */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        Precio (USD) *
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={item.price}
                        onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                        className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800 placeholder:text-slate-400 transition-all font-sans"
                      />
                    </div>

                  </div>

                  {/* Optional description and dynamic context (delivery days of professionals) */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="space-y-1 md:col-span-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        Descripción corta
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="Redacta de qué trata el entregable"
                        className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800 transition-all font-sans"
                      />
                    </div>

                    {type !== 'company' ? (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                          Días de entrega / Plazo
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={item.optionalNum}
                          onChange={(e) => handleItemChange(idx, 'optionalNum', e.target.value)}
                          className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800 placeholder:text-slate-400 transition-all font-sans"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1 flex items-end justify-center">
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1.5 rounded-md border border-emerald-100 font-medium font-sans">
                          ✓ Licencia de Software
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Gallery Images URLs Block for Each Item (Max 3 thumbnail photos) */}
                  <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1">
                      <Image className="h-3 w-3 text-slate-400" />
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Fotos de Galería (Máximo 3 URLs - Para Miniaturas)</label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="URL de Foto 1 (ej. https://images.unsplash.com/...)"
                        value={item.images?.[0] || ''}
                        onChange={(e) => {
                          const imgs = [...(item.images || ['', '', ''])];
                          imgs[0] = e.target.value;
                          handleItemChange(idx, 'images', imgs);
                        }}
                        className="bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800 placeholder:text-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="URL de Foto 2 (Opcional)"
                        value={item.images?.[1] || ''}
                        onChange={(e) => {
                          const imgs = [...(item.images || ['', '', ''])];
                          imgs[1] = e.target.value;
                          handleItemChange(idx, 'images', imgs);
                        }}
                        className="bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800 placeholder:text-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="URL de Foto 3 (Opcional)"
                        value={item.images?.[2] || ''}
                        onChange={(e) => {
                          const imgs = [...(item.images || ['', '', ''])];
                          imgs[2] = e.target.value;
                          handleItemChange(idx, 'images', imgs);
                        }}
                        className="bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Remove button */}
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-0.5 pt-1 hover:underline"
                    >
                      <Trash className="h-3 w-3" />
                      <span>Eliminar item</span>
                    </button>
                  )}

                </div>
              ))}
            </div>
          )}

          <p className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
            <Info className="h-3.5 w-3.5" />
            <span>Los servicios/productos de tu catálogo comercial están estrictamente topados a un máximo de 3 items de oferta o recomendación.</span>
          </p>
        </div>

        {/* Certificates and Títulos Section */}
        <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-100 space-y-4">
          <div className="flex items-center gap-1.5">
            <Award className="h-4.5 w-4.5 text-slate-500" />
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">
              Certificados y Títulos Oficiales (Sección Cargable)
            </h4>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/65 space-y-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Registrar un Nuevo Certificado o Diploma</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre del Certificado / Título *</label>
                <input
                  type="text"
                  placeholder="Ej. Título de Médico Veterinario / Diploma AWS"
                  value={newCertName}
                  onChange={(e) => setNewCertName(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 lg:border-slate-150 rounded-lg px-3 py-2 text-xs focus:outline-none text-slate-800 placeholder:text-slate-400 transition-all font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Emisor / Institución Verificadora *</label>
                <input
                  type="text"
                  placeholder="Ej. Universidad San Francisco / Amazon Web Services"
                  value={newCertIssuer}
                  onChange={(e) => setNewCertIssuer(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 lg:border-slate-150 rounded-lg px-3 py-2 text-xs focus:outline-none text-slate-800 placeholder:text-slate-400 transition-all font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Fecha de Emisión</label>
                <input
                  type="date"
                  value={newCertDate}
                  onChange={(e) => setNewCertDate(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 lg:border-slate-150 rounded-lg px-3 py-2 text-xs focus:outline-none text-slate-800 placeholder:text-slate-400 transition-all font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">URL del Archivo / Documentación de Apoyo</label>
                <input
                  type="text"
                  placeholder="Ej. https://mi-certificado-ejemplo.pdf"
                  value={newCertFile}
                  onChange={(e) => setNewCertFile(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 lg:border-slate-150 rounded-lg px-3 py-2 text-xs focus:outline-none text-slate-800 placeholder:text-slate-400 transition-all font-sans"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={handleAddCert}
                className="text-xs bg-slate-900 hover:bg-slate-850 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar Certificado</span>
              </button>
              <button
                type="button"
                onClick={autoFillSampleCert}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-750 px-3 py-2 rounded-xl font-medium flex items-center gap-1 transition-all"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Simular Documento Oficial (Autocompletar)</span>
              </button>
            </div>
          </div>

          {certs.length > 0 && (
            <div className="space-y-2 pt-1 font-sans">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Certificados Añadidos listos para Publicar ({certs.length})</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {certs.map((c) => (
                  <div key={c.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-3xs">
                    <div className="min-w-0">
                      <h5 className="font-bold text-slate-800 text-xs truncate flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        {c.name}
                      </h5>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{c.issuer} • {c.date}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCert(c.id)}
                      className="text-rose-500 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                      title="Eliminar Certificado"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Company Auto-Buyer Agent setup configuration (SaaS special feature requested) */}
        {type === 'company' && (
          <div className="bg-emerald-50/40 rounded-2xl p-5 border-2 border-dashed border-emerald-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Settings className="h-4.5 w-4.5 text-emerald-600" />
                  Conexión de Agente Corporativo Autónomo de Compra
                </h4>
                <p className="text-[11px] text-slate-505 max-w-xl">
                  Configura las instrucciones de tu propio bot inteligente. Escanea automáticamente la red para comprar servicios idóneos que cumplan tus parámetros.
                </p>
              </div>

              {/* Toggle agent enabled */}
              <button
                type="button"
                onClick={() => setAgentEnabled(!agentEnabled)}
                className={`p-1.5 px-3 rounded-lg text-[10px] font-bold uppercase transition-all tracking-wider ${
                  agentEnabled 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {agentEnabled ? 'CONECTADO' : 'DESACTIVADO'}
              </button>
            </div>

            {agentEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2.5 animate-fadeIn">
                
                {/* Agent cognitive name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-50 tracking-wider">Nombre del Agente Operador</label>
                  <input
                    type="text"
                    required={agentEnabled}
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Ej. SaaSify Scout"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 transition-all font-sans"
                  />
                </div>

                {/* Maximum budget allowed */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-50 tracking-wider">Presupuesto Máximo por Servicio (USD)</label>
                  <input
                    type="number"
                    required={agentEnabled}
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 placeholder:text-slate-400 transition-all font-sans"
                  />
                </div>

                {/* Knowledge Base Input Instructions */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-50 tracking-wider">Base de Conocimiento o Requisitos de Búsqueda de Personas</label>
                  <textarea
                    required={agentEnabled}
                    rows={2}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="¿Qué servicio profesional o producto técnico necesita tu empresa automatizar? Ej: 'Buscar diseñadores expertos en UX/UI Figma para rediseño de nuestra SaaS por menos de $150.'"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 transition-all font-sans resize-none"
                  />
                </div>

                {/* Option for Auto Approve or Manual review */}
                <div className="md:col-span-2 pt-2.5 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoApprove"
                    checked={autoApprove}
                    onChange={(e) => setAutoApprove(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-slate-200 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="autoApprove" className="text-xs text-slate-600 select-none">
                    <strong>Auto-Compra Agéntica</strong>: Permitir que el Agente AI cierre el trato y pague automáticamente al detectar una coincidencia perfecta.
                  </label>
                </div>

              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          {existingTypes.includes(type) ? (
            <div className="w-full md:flex-1 bg-amber-50 border border-amber-250 p-3.5 rounded-xl flex items-start gap-2.5 text-amber-800 text-[11px] leading-relaxed">
              <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-extrabold block">Categoría Ya Federada</strong>
                Ya has publicado una biografía web bajo la categoría <span className="font-bold underline">"{BIOGRAPHY_TYPES.find(b => b.value === type)?.label}"</span>. Para mantener el orden y la calidad del ecosistema independiente, solo se admite una (1) publicación activa por categoría.
              </div>
            </div>
          ) : hasReachedOwnersLimit ? (
            <div className="w-full md:flex-1 bg-rose-50 border border-rose-250 p-3.5 rounded-xl flex items-start gap-2.5 text-rose-800 text-[11px] leading-relaxed">
              <Info className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">(Límite de Propietarios Máximo: 3)</strong>
                Has alcanzado el límite máximo permitido de 3 perfiles federados en categorías de propietario/activos (Llevas {ownerProfilesInSystemCount} de 3 perfiles). No puedes publicar otra categoría hasta remover o actualizar las existentes.
              </div>
            </div>
          ) : (
            <span className="text-[10.5px] text-slate-450 font-mono">
              ★ Máximo 3 {isPropietario ? 'registros de bitácora' : 'soluciones/servicios'} permitidos por ficha.
            </span>
          )}

          <button
            type="submit"
            disabled={existingTypes.includes(type) || hasReachedOwnersLimit}
            className={`px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shrink-0 w-full md:w-auto justify-center ${
              (existingTypes.includes(type) || hasReachedOwnersLimit)
                ? 'bg-slate-300 border border-slate-350 text-slate-500 shadow-none cursor-not-allowed active:scale-100'
                : type === 'company' 
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10' 
                  : 'hover:opacity-90'
            }`}
            style={!existingTypes.includes(type) && !hasReachedOwnersLimit && type !== 'company' ? { backgroundColor: brand.colorHex } : undefined}
          >
            <Save className="h-4.5 w-4.5" />
            <span>Guardar y Federar Biografía</span>
          </button>
        </div>

      </form>
    </div>
  );
}
