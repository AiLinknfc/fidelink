import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Check,
  SlidersHorizontal,
  UserPlus,
  Smartphone,
  Globe,
} from 'lucide-react';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';
import { SkillProfile, Service, Product } from '../types/skillProfile';
import EcosistemaProfileCard from '../components/EcosistemaProfileCard';
import EcosistemaProfileForm from '../components/EcosistemaProfileForm';
import TalentBioDrawer from '../components/TalentBioDrawer';
import { getStoredSkillProfiles, saveSkillProfiles } from '../data/skillProfileData';

export default function EcosistemaBios() {
  const { brand } = useModuleBrand();
  const [chipHovered, setChipHovered] = useState(false);
  const [profiles, setProfiles] = useState<SkillProfile[]>(() => getStoredSkillProfiles());
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'individual' | 'company' | 'propietario' | 'with_agent'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; text: string; details?: string } | null>(null);
  const [isTalentDrawerOpen, setIsTalentDrawerOpen] = useState(false);

  const triggerNotification = (text: string, details?: string, type: 'success' | 'info' = 'success') => {
    setNotification({ type, text, details });
    setTimeout(() => {
      setNotification(null);
    }, 5500);
  };

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.bio.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'individual') return p.type === 'individual';
    if (filterType === 'company') return p.type === 'company';
    if (filterType === 'propietario') return ['propietario', 'mascota', 'evento', 'vehiculo', 'casa', 'boda', 'restaurante'].includes(p.type);

    return true;
  });

  const handleAddProfile = (profileData: any) => {
    const updated = [...profiles, { ...profileData, id: `prof-${Date.now()}` }];
    setProfiles(updated);
    saveSkillProfiles(updated);
    setShowAddForm(false);
    triggerNotification(
      'Biografía Federada Correctamente',
      `El perfil de "${profileData.name}" ahora está disponible en vivo para compras directas y escaneos de agentes corporativos.`
    );
  };

  const handleRateProfile = (id: string, newRating: number) => {
    const profile = profiles.find(p => p.id === id);
    if (!profile) return;
    const newCount = profile.reviewsCount + 1;
    const computed = ((profile.rating * profile.reviewsCount) + newRating) / newCount;
    const updated = profiles.map(p =>
      p.id === id
        ? { ...p, rating: Number(computed.toFixed(1)), reviewsCount: newCount }
        : p
    );
    setProfiles(updated);
    saveSkillProfiles(updated);
    triggerNotification('¡Calificación Registrada!', `Gracias por dar feedback estrella para ${profile.name}. Calificación promediada.`);
  };

  const handleHireService = (service: Service, sellerName: string) => {
    const txn = {
      id: `txn-${Date.now()}`,
      timestamp: new Date().toISOString(),
      buyerName: 'Cliente Visitante (Tú)',
      buyerType: 'individual' as const,
      sellerName,
      itemName: service.title,
      itemType: 'service' as const,
      price: service.price,
      executionMode: 'manual' as const,
    };
    setTransactions(prev => [txn, ...prev]);
    triggerNotification(
      '¡Servicio Contratado Exitosamente!',
      `Has adquirido "${service.title}" de ${sellerName} por $${service.price} USD. El profesional iniciará el proyecto inmediatamente.`
    );
  };

  const handleBuyProduct = (product: Product, sellerName: string) => {
    const txn = {
      id: `txn-${Date.now()}`,
      timestamp: new Date().toISOString(),
      buyerName: 'Cliente Visitante (Tú)',
      buyerType: 'individual' as const,
      sellerName,
      itemName: product.title,
      itemType: 'product' as const,
      price: product.price,
      executionMode: 'manual' as const,
    };
    setTransactions(prev => [txn, ...prev]);
    triggerNotification(
      '¡Producto Adquirido Exitosamente!',
      `Licencia de software "${product.title}" despachada por ${sellerName} por $${product.price} USD.`
    );
  };

  const handleSaveCustomization = async (id: string, updatedData: Partial<SkillProfile>) => {
    const updated = profiles.map(p => (p.id === id ? { ...p, ...updatedData } : p));
    setProfiles(updated);
    saveSkillProfiles(updated);
    triggerNotification(
      'Biografía Virtual Guardada',
      'Los cambios de tu perfil web y mini-ecommerce se han guardado exitosamente.'
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#fafafa]">
      {/* Global animated alert notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-24 lg:top-8 right-4 lg:right-8 z-55 w-full max-w-sm px-4"
          >
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xl text-slate-800 flex gap-3">
              <div className="bg-emerald-50 border border-emerald-100 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                <Check className="h-4.5 w-4.5 text-emerald-600" />
              </div>
              <div className="flex-1 space-y-0.5">
                <h5 className="font-bold text-xs tracking-tight text-slate-950">{notification.text}</h5>
                {notification.details && (
                  <p className="text-slate-500 text-[11px] leading-relaxed font-light">{notification.details}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secondary bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 h-12 flex flex-row items-center justify-between gap-2 select-none overflow-hidden flex-shrink-0">
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
          <span className="text-[12px] font-bold font-sans whitespace-nowrap flex-shrink-0">Ecosistema BioLink</span>
          <span
            className="text-[12px] font-light font-sans whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out"
            style={{
              maxWidth: chipHovered ? '600px' : '0px',
              opacity: chipHovered ? 1 : 0,
              paddingLeft: chipHovered ? '6px' : '0px',
              color: `${brand.colorHex}99`,
            }}
          >
            · Gestión de biografías y mini-ecommerces en red
          </span>
        </div>

        {/* RIGHT — network status + bio web action */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: brand.colorHex }} />
            <span className="text-[11px] font-semibold font-sans text-slate-600 whitespace-nowrap">{profiles.length} perfiles en red</span>
          </div>
          <button
            type="button"
            onClick={() => setIsTalentDrawerOpen(true)}
            className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-650 shadow-3xs hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 active:scale-95 transition"
            title="Mi Bio-Web"
            aria-label="Abrir Mi Bio-Web"
            id="talent-profile-icon-btn"
          >
            <Smartphone className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <div className="space-y-4">

          {/* Title + description */}
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-light tracking-tight text-slate-900 leading-tight">
              Biografías & <span className="font-semibold text-slate-800">Mini-Ecommerces de Habilidades</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-550 max-w-2xl font-light leading-relaxed">
              Personaliza la estética y módulos de tu biografía, vende servicios directos (hasta 4 por perfil), publica productos top corporativos, y deja que agentes autónomos busquen y compren por ti.
            </p>
          </div>

          {/* Search + filter + create */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            {/* Search and Filters */}
            <div className="flex flex-1 flex-col sm:flex-row gap-3">

              {/* Search Field */}
              <div className="relative flex-1">
                <Search className="h-4.5 w-4.5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por tag o aptitud, biografía o marca (Ej. Figma, PyTorch, UX)..."
                  className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-100 transition-all font-sans"
                />
              </div>

              {/* Filter Selector */}
              <div className="flex bg-white border border-slate-200 rounded-xl p-1 gap-1">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'individual', label: 'Personas' },
                  { id: 'company', label: 'Empresas' },
                  { id: 'propietario', label: 'Propietario' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFilterType(t.id as any)}
                    className={`text-xs p-1.5 px-3 rounded-lg font-semibold transition-colors cursor-pointer ${
                      filterType === t.id
                        ? 'text-white shadow-3xs'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                    style={filterType === t.id ? { backgroundColor: brand.colorHex } : undefined}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

            </div>

            {/* Create Profile button */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-white rounded-xl px-4 py-2.5 text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0 cursor-pointer hover:opacity-90"
              style={{ backgroundColor: brand.colorHex }}
            >
              {showAddForm ? (
                'Volver al Directorio'
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Registrar Mi Biografía</span>
                </>
              )}
            </button>

          </div>

          {/* Sub-section list or add profile form */}
          {showAddForm ? (
            <div className="animate-fadeIn">
              <EcosistemaProfileForm
                onAddProfile={handleAddProfile}
                existingTypes={profiles.map((p) => p.type)}
                profiles={profiles}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {filteredProfiles.length === 0 ? (
                <div className="text-center py-20 bg-white border rounded-2xl p-12 shadow-3xs space-y-3">
                  <SlidersHorizontal className="h-10 w-10 text-slate-350 mx-auto" />
                  <h4 className="font-semibold text-slate-800 text-sm">No se encontraron biografías</h4>
                  <p className="text-xs text-slate-550 max-w-sm mx-auto leading-relaxed">
                    Modifica tus filtros de búsqueda o sé el primero en federarte pulsando el botón de registro arriba.
                  </p>
                </div>
              ) : (
                filteredProfiles.map((p) => (
                  <EcosistemaProfileCard
                    key={p.id}
                    profile={p}
                    profiles={profiles}
                    onHireService={handleHireService}
                    onBuyProduct={handleBuyProduct}
                    onRateProfile={handleRateProfile}
                    onOpenPublicBio={(slug) => {
                      triggerNotification('Bio Web', `Abriendo página pública de "${slug}"...`);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onSaveCustomization={handleSaveCustomization}
                  />
                ))
              )}
            </div>
          )}

        </div>
      </main>

      <TalentBioDrawer
        isOpen={isTalentDrawerOpen}
        onClose={() => setIsTalentDrawerOpen(false)}
        profiles={profiles}
        onSaveProfile={handleSaveCustomization}
      />
    </div>
  );
}
