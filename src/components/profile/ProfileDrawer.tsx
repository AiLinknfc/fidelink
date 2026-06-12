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
            className="bg-surface-container-lowest w-full max-w-sm h-full shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
              <h2 className="text-headline-sm font-bold text-on-surface">Mi perfil</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : profile ? (
                <>
                  {/* Avatar */}
                  <div className="flex flex-col items-center gap-3">
                    {avatarSaved && (
                      <div className="flex items-center gap-1.5 text-secondary text-label-md font-bold">
                        <Check className="w-4 h-4" />
                        Foto actualizada
                      </div>
                    )}
                    <div className="relative">
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt={profile.name}
                          className="w-28 h-28 rounded-full object-cover shadow-md border-4 border-white"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-headline-md font-bold shadow-md border-4 border-white">
                          {initials}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="absolute bottom-0 right-0 bg-primary text-on-primary p-2 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                        aria-label="Cambiar foto de perfil"
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </button>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        aria-label="Seleccionar avatar"
                        title="Seleccionar avatar"
                        onChange={handleAvatarChange}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-headline-sm font-bold text-on-surface">{profile.name}</p>
                      <p className="text-body-sm text-on-surface-variant capitalize">
                        {profile.role === 'business' ? 'Empresa' : 'Cliente'}
                      </p>
                    </div>
                  </div>

                  {/* Tarjeta de marca (solo para empresas) */}
                  {profile.role === 'business' && (
                    <div className="bg-surface-container rounded-xl p-4 flex items-center gap-3">
                      {businessLogo ? (
                        <img
                          src={businessLogo}
                          alt={businessLabel ?? 'Logo'}
                          className="w-14 h-14 rounded-xl object-cover bg-white border border-outline-variant shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-surface-container-low border border-dashed border-outline-variant flex items-center justify-center text-on-surface-variant shrink-0">
                          <Building2 className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
                          Marca del negocio
                        </p>
                        <p className="text-body-md font-bold text-on-surface truncate">
                          {businessLabel ?? 'Sin configurar'}
                        </p>
                        <button
                          type="button"
                          onClick={() => { onClose(); navigate('/business/card-editor'); }}
                          className="text-label-md text-primary font-bold hover:underline"
                        >
                          {businessLogo ? 'Editar marca' : 'Agregar logo y datos'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Datos */}
                  <div className="space-y-3">
                    <Row icon={<Mail className="w-4 h-4" />} label="Correo" value={profile.email} />
                    <Row
                      icon={<BadgeCheck className="w-4 h-4" />}
                      label="ID"
                      value={profile.id.slice(0, 8) + '…'}
                      mono
                    />

                    <div className="bg-surface-container rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <Phone className="w-4 h-4" />
                        <span className="text-label-md font-bold uppercase tracking-wider">
                          WhatsApp
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="tel"
                          inputMode="tel"
                          placeholder="+57 300 000 0000"
                          value={phone}
                          onChange={(e) => { setPhone(e.target.value); setPhoneSaved(false); }}
                          className="flex-1 px-3 py-2 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={handleSavePhone}
                          disabled={savingPhone || phone === (profile.phone ?? '')}
                          className="px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md font-bold disabled:opacity-40 min-w-[88px] flex items-center justify-center gap-1"
                        >
                          {savingPhone ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : phoneSaved ? (
                            <><Check className="w-4 h-4" /> Guardado</>
                          ) : (
                            'Guardar'
                          )}
                        </button>
                      </div>
                      {phoneSaved && (
                        <p className="text-[11px] text-secondary font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Número guardado correctamente.
                        </p>
                      )}
                      <p className="text-[11px] text-on-surface-variant">
                        Usado para notificaciones de compra. Formato internacional (E.164).
                      </p>
                    </div>
                    
                    {/* Mini-bio pública */}
                    <div className="bg-surface-container rounded-xl p-4 space-y-2">
                      <label className="text-label-md font-bold uppercase tracking-wider text-on-surface-variant">Mini-bio pública</label>
                      <textarea
                        placeholder="Presenta una breve biografía pública (máx 300 caracteres)"
                        aria-label="Mini-bio pública"
                        value={publicBio}
                        onChange={(e) => setPublicBio(e.target.value)}
                        className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                        maxLength={300}
                      />

                      <div className="flex items-center gap-2">
                        <input
                          id="public-bio-switch"
                          type="checkbox"
                          checked={isPublicBio}
                          onChange={(e) => setIsPublicBio(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <label htmlFor="public-bio-switch" className="text-body-sm">Hacer mini-bio pública</label>
                      </div>

                      <div className="flex gap-2">
                        <input
                          placeholder="slug único (ej: mi-cafe)"
                          aria-label="Slug público"
                          value={publicSlug}
                          onChange={(e) => setPublicSlug(e.target.value)}
                          className="flex-1 px-3 py-2 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={handleSavePublicBio}
                          disabled={savingPhone}
                          className="px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md font-bold disabled:opacity-40"
                          title="Guardar mini-bio pública"
                        >
                          {savingPhone ? 'Guardando…' : 'Guardar'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-error-container text-on-error-container rounded-xl text-body-sm">
                      {errorMsg}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-on-surface-variant text-center py-12">
                  No se encontró tu perfil.
                </p>
              )}
            </div>

            <footer className="border-t border-outline-variant p-4">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-error hover:bg-error-container transition-all font-medium"
              >
                <LogOut className="w-5 h-5" />
                Cerrar sesión
              </button>
            </footer>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({
  icon,
  label,
  value,
  mono,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-surface-container rounded-xl">
      <div className="text-on-surface-variant">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-label-md text-on-surface-variant uppercase tracking-wider font-bold">
          {label}
        </p>
        <p
          className={`text-body-md text-on-surface truncate ${mono ? 'font-mono' : ''}`}
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
