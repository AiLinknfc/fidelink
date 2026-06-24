import { useEffect, useRef, useState, type CSSProperties, type ChangeEvent, type ReactNode } from 'react';
import { X, Camera, LogOut, Mail, Phone, BadgeCheck, Loader2, Check, Building2, Palette, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getProfile, updateProfile, uploadAvatar, type ProfileFull } from '@/services/profileService';
import { getCardConfig } from '@/services/loyaltyService';

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

const BIOGRAPHY_BLUE = '#6366f1';
const PROFILE_COLOR_PALETTE = [
  '#ffffff', '#f8fafc', '#f1f5f9', '#e0f2fe', '#dbeafe', '#e0e7ff',
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
];

function blendWithBlackWhite(hex: string, blend: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if ([r, g, b].some(Number.isNaN)) return '#ffffff';
  if (blend <= 50) {
    const t = blend / 50;
    return `#${Math.round(r * t).toString(16).padStart(2, '0')}${Math.round(g * t).toString(16).padStart(2, '0')}${Math.round(b * t).toString(16).padStart(2, '0')}`;
  }
  const t = (blend - 50) / 50;
  return `#${Math.round(r + (255 - r) * t).toString(16).padStart(2, '0')}${Math.round(g + (255 - g) * t).toString(16).padStart(2, '0')}${Math.round(b + (255 - b) * t).toString(16).padStart(2, '0')}`;
}

export default function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileFull | null>(null);
  // Public mini-bio fields
  const [publicBio, setPublicBio] = useState('');
  const [publicSlug, setPublicSlug] = useState('');
  const [isPublicBio, setIsPublicBio] = useState(false);
  const [publicLocation, setPublicLocation] = useState('');
  const [publicSkills, setPublicSkills] = useState('');
  const [publicTagline, setPublicTagline] = useState('');
  const [profileBackgroundColor, setProfileBackgroundColor] = useState('#ffffff');
  const [profileColorBase, setProfileColorBase] = useState('#ffffff');
  const [profileColorBlend, setProfileColorBlend] = useState(100);
  const [showProfileColorPicker, setShowProfileColorPicker] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [avatarSaved, setAvatarSaved] = useState(false);
  const [businessLogo, setBusinessLogo] = useState<string | null>(null);
  const [businessLabel, setBusinessLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    setErrorMsg('');
    setBusinessLogo(null);
    setBusinessLabel(null);

    getProfile(user.id).then(async ({ data, error }) => {
      if (error) {
        setErrorMsg('No se pudo cargar el perfil.');
      } else if (data) {
        setProfile(data);
        setPhone(data.phone ?? '');
        // optional public fields may not be defined in ProfileFull type
        setPublicBio(data.publicBio ?? '');
        setPublicSlug(data.publicSlug ?? '');
        setIsPublicBio(data.isPublicBio ?? false);
        setPublicLocation(data.publicLocation ?? '');
        setPublicSkills(data.publicSkills ?? '');
        setPublicTagline(data.publicTagline ?? '');
        setProfileBackgroundColor(data.profileBackgroundColor ?? '#ffffff');
        setProfileColorBase(data.profileBackgroundColor ?? '#ffffff');
        setProfileColorBlend(100);
        if (data.role === 'business') {
          const { data: cfg } = await getCardConfig(user.id);
          if (cfg) {
            setBusinessLogo(cfg.logoUrl ?? null);
            setBusinessLabel(cfg.businessName ?? null);
          }
        }
      }
      setLoading(false);
    });
  }, [open, user]);

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    setErrorMsg('');
    setAvatarSaved(false);
    const { data: url, error: upErr } = await uploadAvatar(user.id, file);
    if (upErr || !url) {
      setErrorMsg('No se pudo subir la imagen.');
      setUploadingAvatar(false);
      return;
    }
    const { data, error } = await updateProfile(user.id, { avatarUrl: url });
    if (error) {
      setErrorMsg('No se pudo guardar la foto.');
    } else if (data) {
      setProfile(data);
      setAvatarSaved(true);
      setTimeout(() => setAvatarSaved(false), 2500);
    }
    setUploadingAvatar(false);
  }

  async function handleSavePhone() {
    if (!user) return;
    setSavingPhone(true);
    setErrorMsg('');
    setPhoneSaved(false);
    const { data, error } = await updateProfile(user.id, { phone: phone.trim() || null });
    if (error) {
      setErrorMsg('No se pudo guardar el teléfono.');
    } else if (data) {
      setProfile(data);
      setPhoneSaved(true);
      setTimeout(() => setPhoneSaved(false), 2500);
    }
    setSavingPhone(false);
  }

  async function handleSavePublicBio() {
    if (!user) return;
    setSavingPhone(true);
    setErrorMsg('');
    const payload: any = {
      publicBio: publicBio || null,
      publicSlug: publicSlug || null,
      isPublicBio,
      publicLocation: publicLocation || null,
      publicSkills: publicSkills || null,
      publicTagline: publicTagline || null,
      profileBackgroundColor: profileBackgroundColor || '#ffffff',
    };
    const { data, error } = await updateProfile(user.id, payload);
    if (error) {
      setErrorMsg('No se pudo guardar la biografía.');
    } else if (data) {
      setProfile(data);
    }
    setSavingPhone(false);
  }

  async function handleSignOut() {
    onClose();
    await signOut();
    navigate('/');
  }

  const initials =
    profile?.name?.slice(0, 2).toUpperCase() ??
    user?.email?.slice(0, 2).toUpperCase() ??
    'U';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[60] bg-black/50 flex justify-end"
          onClick={onClose}
        >
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="w-full max-w-sm h-full shadow-2xl flex flex-col overflow-x-hidden"
            style={{ backgroundColor: profileBackgroundColor || '#ffffff' }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
              <h2 className="text-sm font-bold font-headline text-slate-800">Mi perfil</h2>
              <button onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                title="Cerrar">
                <X className="w-4 h-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : profile ? (
                <>
                  {/* Avatar */}
                  <div className="flex flex-col items-center gap-2">
                    {avatarSaved && (
                      <div className="flex items-center gap-1 text-[10px] font-bold" style={{ color: BIOGRAPHY_BLUE }}>
                        <Check className="w-3 h-3" /> Foto actualizada
                      </div>
                    )}
                    <div className="relative flex items-center justify-center gap-4 w-full">
                      <div className="w-10" />
                      <div className="relative">
                        {profile.avatarUrl ? (
                          <img src={profile.avatarUrl} alt={profile.name}
                            className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-white" />
                        ) : (
                          <div className="w-24 h-24 rounded-full text-white flex items-center justify-center text-lg font-bold shadow-md border-4 border-white" style={{ backgroundColor: BIOGRAPHY_BLUE }}>
                            {initials}
                          </div>
                        )}
                        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingAvatar}
                          className="absolute bottom-0 right-0 text-white p-1.5 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                          style={{ backgroundColor: BIOGRAPHY_BLUE }}
                          aria-label="Cambiar foto de perfil">
                          {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden"
                          aria-label="Seleccionar avatar" title="Seleccionar avatar" onChange={handleAvatarChange} />
                      </div>
                      <div className="relative w-10 flex justify-center">
                        <button type="button"
                          onClick={() => setShowProfileColorPicker(!showProfileColorPicker)}
                          className="w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform shrink-0 overflow-hidden"
                          title="Color de fondo"
                          aria-label="Seleccionar color de fondo"
                          style={{
                            background: `conic-gradient(#3525cd, #006c49, #FF6D00, #caa14b, #e63946, #8b5cf6, #ec4899, #3525cd)`,
                          }}>
                          <span className="block w-full h-full rounded-full"
                            style={{ background: `radial-gradient(circle at 40% 35%, transparent 30%, rgba(255,255,255,0.3) 40%, transparent 50%)` }} />
                        </button>
                        {showProfileColorPicker && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowProfileColorPicker(false)} />
                            <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-[24px] shadow-xl border border-slate-200 p-4 min-w-[256px]">
                              <div className="flex items-center gap-1.5 mb-3 text-[10px] font-semibold text-slate-600">
                                <Palette className="w-3.5 h-3.5" />
                                Color de fondo
                              </div>
                              <div className="grid grid-cols-7 gap-2 mb-3">
                                {PROFILE_COLOR_PALETTE.map(color => (
                                  <button key={color} type="button" style={{ backgroundColor: color }}
                                    onClick={() => {
                                      setProfileColorBase(color);
                                      setProfileColorBlend(100);
                                      setProfileBackgroundColor(color);
                                    }}
                                    className={`w-6 h-6 rounded-full border border-white/40 shadow-sm hover:scale-110 transition-transform ${
                                      profileBackgroundColor === color ? 'ring-2 ring-slate-400 ring-offset-2' : ''
                                    } ${color === '#ffffff' ? 'border-slate-300' : ''}`} />
                                ))}
                              </div>
                              <div className="mb-3">
                                <input type="range" min={0} max={100} value={profileColorBlend}
                                  onChange={e => {
                                    const v = Number(e.target.value);
                                    setProfileColorBlend(v);
                                    setProfileBackgroundColor(blendWithBlackWhite(profileColorBase, v));
                                  }}
                                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                                  style={{
                                    background: `linear-gradient(90deg, #000, ${profileColorBase} 50%, #fff)`,
                                    accentColor: profileColorBase,
                                  }} />
                                <div className="flex items-center justify-between text-[8px] text-slate-400 mt-1 px-0.5">
                                  <span>oscuro</span>
                                  <span className="text-[8px] text-slate-400 font-mono">
                                    RGB {parseInt(profileBackgroundColor.slice(1,3), 16)} {parseInt(profileBackgroundColor.slice(3,5), 16)} {parseInt(profileBackgroundColor.slice(5,7), 16)}
                                  </span>
                                  <span>claro</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                <span className="w-7 h-7 rounded-full shrink-0 ring-1 ring-black/10"
                                  style={{ backgroundColor: profileBackgroundColor }} />
                                <input type="text" value={profileBackgroundColor}
                                  onChange={e => {
                                    const v = e.target.value;
                                    if (/^#[0-9a-fA-F]{0,6}$/.test(v)) {
                                      setProfileBackgroundColor(v);
                                      setProfileColorBase(v);
                                      setProfileColorBlend(50);
                                    }
                                  }}
                                  onBlur={() => {
                                    if (!/^#[0-9a-fA-F]{6}$/.test(profileBackgroundColor)) setProfileBackgroundColor('#ffffff');
                                  }}
                                  className="min-w-0 flex-1 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-[11px] font-mono outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-center text-slate-500" />
                                <button type="button" onClick={() => {
                                  setProfileColorBase('#ffffff');
                                  setProfileColorBlend(100);
                                  setProfileBackgroundColor('#ffffff');
                                  setShowProfileColorPicker(false);
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
                    <div className="text-center">
                      <p className="text-sm font-bold font-headline text-slate-800">{profile.name}</p>
                      <p className="text-[10px] text-slate-600 capitalize">
                        {profile.role === 'business' ? 'Empresa' : 'Cliente'}
                      </p>
                    </div>
                  </div>

                  {/* Tarjeta de marca (solo para empresas) */}
                  {profile.role === 'business' && (
                    <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                      {businessLogo ? (
                        <img src={businessLogo} alt={businessLabel ?? 'Logo'}
                          className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200 shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-white border border-dashed border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Marca del negocio</p>
                        <p className="text-xs font-bold text-slate-700 truncate">{businessLabel ?? 'Sin configurar'}</p>
                        <button type="button" onClick={() => { onClose(); navigate('/business/card-editor'); }}
                          className="text-[10px] font-bold hover:underline mt-0.5 block"
                          style={{ color: BIOGRAPHY_BLUE }}>
                          {businessLogo ? 'Editar marca' : 'Agregar logo y datos'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Datos */}
                  <div className="space-y-2">
                    <Row icon={<Mail className="w-3.5 h-3.5" />} label="Correo" value={profile.email} />
                    <Row icon={<BadgeCheck className="w-3.5 h-3.5" />} label="ID" value={profile.id.slice(0, 8) + '…'} mono />

                    <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">WhatsApp</span>
                      </div>
                      <div className="flex gap-1.5">
                        <input type="tel" inputMode="tel" placeholder="+57 300 000 0000"
                          value={phone} onChange={(e) => { setPhone(e.target.value); setPhoneSaved(false); }}
                          className="min-w-0 flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                          style={{ '--tw-ring-color': BIOGRAPHY_BLUE } as CSSProperties} />
                        <button type="button" onClick={handleSavePhone}
                          disabled={savingPhone || phone === (profile.phone ?? '')}
                          className="shrink-0 px-3 py-1.5 text-white rounded-lg text-[10px] font-bold disabled:opacity-40 flex items-center justify-center gap-1"
                          style={{ backgroundColor: BIOGRAPHY_BLUE }}>
                          {savingPhone ? <Loader2 className="w-3 h-3 animate-spin" />
                            : phoneSaved ? <><Check className="w-3 h-3" /> OK</> : 'Guardar'}
                        </button>
                      </div>
                      {phoneSaved && (
                        <p className="text-[9px] font-bold flex items-center gap-1" style={{ color: BIOGRAPHY_BLUE }}>
                          <Check className="w-2.5 h-2.5" /> Número guardado correctamente.
                        </p>
                      )}
                      <p className="text-[9px] text-slate-600">Usado para notificaciones de compra. Formato internacional (E.164).</p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Biografía / Acerca de Ti</label>
                      <textarea placeholder="Presenta una breve biografía pública (máx 300 caracteres)"
                        aria-label="Biografía / Acerca de Ti" value={publicBio} onChange={(e) => setPublicBio(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                        style={{ '--tw-ring-color': BIOGRAPHY_BLUE } as CSSProperties}
                        maxLength={300} />
                      <input placeholder="Ubicación"
                        aria-label="Ubicación" value={publicLocation} onChange={(e) => setPublicLocation(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                        style={{ '--tw-ring-color': BIOGRAPHY_BLUE } as CSSProperties} />
                      <input placeholder="Habilidades"
                        aria-label="Habilidades" value={publicSkills} onChange={(e) => setPublicSkills(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                        style={{ '--tw-ring-color': BIOGRAPHY_BLUE } as CSSProperties} />
                      <input placeholder="Eslogan / Tagline Corto"
                        aria-label="Eslogan / Tagline Corto" value={publicTagline} onChange={(e) => setPublicTagline(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                        style={{ '--tw-ring-color': BIOGRAPHY_BLUE } as CSSProperties} />
                      <div className="flex items-center gap-1.5">
                        <input id="public-bio-switch" type="checkbox" checked={isPublicBio}
                          onChange={(e) => setIsPublicBio(e.target.checked)} className="w-3.5 h-3.5" />
                        <label htmlFor="public-bio-switch" className="text-[10px] text-slate-600">Hacer biografía pública</label>
                      </div>
                      <div className="flex gap-1.5">
                        <input placeholder="slug único (ej: mi-cafe)" aria-label="Slug público"
                          value={publicSlug} onChange={(e) => setPublicSlug(e.target.value)}
                          className="min-w-0 flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                          style={{ '--tw-ring-color': BIOGRAPHY_BLUE } as CSSProperties} />
                        <button type="button" onClick={handleSavePublicBio} disabled={savingPhone}
                          className="shrink-0 px-3 py-1.5 text-white rounded-lg text-[10px] font-bold disabled:opacity-40" title="Guardar biografía"
                          style={{ backgroundColor: BIOGRAPHY_BLUE }}>
                          {savingPhone ? 'Guardando…' : 'Guardar'}
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setServicesOpen(!servicesOpen)}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600"
                      >
                        <span>Editar Mini-Ecommerce de Servicios (Máximo 4)</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {servicesOpen && (
                        <div className="min-h-12 border-t border-slate-200 bg-white" />
                      )}
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-2.5 bg-red-50 text-red-600 rounded-xl text-[10px]">{errorMsg}</div>
                  )}
                </>
              ) : (
                <p className="text-slate-600 text-center py-8 text-xs">No se encontró tu perfil.</p>
              )}
            </div>

            <footer className="border-t border-slate-200 p-3">
              <button onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-all text-xs font-semibold">
                <LogOut className="w-3.5 h-3.5" /> Cerrar sesión
              </button>
            </footer>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({ icon, label, value, mono }: { icon: ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 rounded-xl">
      <div className="text-slate-500 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">{label}</p>
        <p className={`text-xs text-slate-700 truncate font-semibold ${mono ? 'font-mono' : ''}`} title={value}>{value}</p>
      </div>
    </div>
  );
}
