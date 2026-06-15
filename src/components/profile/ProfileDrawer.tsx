import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { X, Camera, LogOut, Mail, Phone, BadgeCheck, Loader2, Check, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getProfile, updateProfile, uploadAvatar, type ProfileFull } from '@/services/profileService';
import { getCardConfig } from '@/services/loyaltyService';
import { useI18n } from '../../i18n/index';

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileFull | null>(null);
  // Public mini-bio fields
  const [publicBio, setPublicBio] = useState('');
  const [publicSlug, setPublicSlug] = useState('');
  const [isPublicBio, setIsPublicBio] = useState(false);
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
    const payload: any = { publicBio: publicBio || null, publicSlug: publicSlug || null, isPublicBio };
    const { data, error } = await updateProfile(user.id, payload);
    if (error) {
      setErrorMsg('No se pudo guardar la mini-bio pública.');
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
            className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col overflow-x-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
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
                  {/* SOCIO PARTNER / CLIENTE SMART WALLET badge */}
                  <div className="flex items-center justify-center mb-1">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                      {profile.role === 'business' ? 'SOCIO PARTNER' : 'CLIENTE SMART WALLET'}
                    </span>
                  </div>

                  {/* Avatar */}
                  <div className="flex flex-col items-center gap-2">
                    {avatarSaved && (
                      <div className="flex items-center gap-1 text-blue-600 text-[10px] font-bold">
                        <Check className="w-3 h-3" /> Foto actualizada
                      </div>
                    )}
                    <div className="relative">
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={profile.name}
                          className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-white" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold shadow-md border-4 border-white">
                          {initials}
                        </div>
                      )}
                      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingAvatar}
                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                        aria-label="Cambiar foto de perfil">
                        {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden"
                        aria-label="Seleccionar avatar" title="Seleccionar avatar" onChange={handleAvatarChange} />
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
                          className="text-[10px] text-blue-600 font-bold hover:underline mt-0.5 block">
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
                          className="min-w-0 flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        <button type="button" onClick={handleSavePhone}
                          disabled={savingPhone || phone === (profile.phone ?? '')}
                          className="shrink-0 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold disabled:opacity-40 flex items-center justify-center gap-1">
                          {savingPhone ? <Loader2 className="w-3 h-3 animate-spin" />
                            : phoneSaved ? <><Check className="w-3 h-3" /> OK</> : 'Guardar'}
                        </button>
                      </div>
                      {phoneSaved && (
                        <p className="text-[9px] text-blue-600 font-bold flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Número guardado correctamente.
                        </p>
                      )}
                      <p className="text-[9px] text-slate-600">Usado para notificaciones de compra. Formato internacional (E.164).</p>
                    </div>

                    {/* Mini-bio pública */}
                    <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Mini-bio pública</label>
                      <textarea placeholder="Presenta una breve biografía pública (máx 300 caracteres)"
                        aria-label="Mini-bio pública" value={publicBio} onChange={(e) => setPublicBio(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        maxLength={300} />
                      <div className="flex items-center gap-1.5">
                        <input id="public-bio-switch" type="checkbox" checked={isPublicBio}
                          onChange={(e) => setIsPublicBio(e.target.checked)} className="w-3.5 h-3.5" />
                        <label htmlFor="public-bio-switch" className="text-[10px] text-slate-600">Hacer mini-bio pública</label>
                      </div>
                      <div className="flex gap-1.5">
                        <input placeholder="slug único (ej: mi-cafe)" aria-label="Slug público"
                          value={publicSlug} onChange={(e) => setPublicSlug(e.target.value)}
                          className="min-w-0 flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        <button type="button" onClick={handleSavePublicBio} disabled={savingPhone}
                          className="shrink-0 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold disabled:opacity-40" title="Guardar mini-bio pública">
                          {savingPhone ? 'Guardando…' : 'Guardar'}
                        </button>
                      </div>
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
