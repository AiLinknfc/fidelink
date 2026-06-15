import React, { useState } from'react';
import { Biography, WeddingData, GuestRSVP, GuestPhoto, DemoUserRole } from '../types/biography';
import { 
 Heart, Calendar, MapPin, Users, Image as ImageIcon, Upload, 
 Trash, Check, Plus, AlertCircle, Share2, HelpCircle 
} from'lucide-react';

interface WeddingModuleProps {
 currentBio: Biography;
 role: DemoUserRole;
 onUpdateBio: (updated: Biography) => void;
}

const PRESET_ALBUM_PHOTOS = ['https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=600','https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600','https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=600','https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=600','https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600'
];

export function WeddingModule({ currentBio, role, onUpdateBio }: WeddingModuleProps) {
 const wedding = currentBio.wedding;

 // New RSVP form states
 const [rsvpName, setRsvpName] = useState('');
 const [rsvpEmail, setRsvpEmail] = useState('');
 const [rsvpStatus, setRsvpStatus] = useState<'confirmado' |'rechazado'>('confirmado');
 const [rsvpCompanions, setRsvpCompanions] = useState(0);
 const [rsvpDietary, setRsvpDietary] = useState('');
 const [rsvpMessage, setRsvpMessage] = useState('');

 // Upload photo state
 const [photoCaption, setPhotoCaption] = useState('');
 const [photoUploader, setPhotoUploader] = useState(role ==='invitado' ?'Invitado Feliz' :'');
 const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
 const [isUploading, setIsUploading] = useState(false);

 // General state
 const [copyStatus, setCopyStatus] = useState(false);

 if (!wedding) return <div className="text-slate-400 p-4">No se encontraron datos del Matrimonio.</div>;

 const handleAddRSVP = (e: React.FormEvent) => {
 e.preventDefault();
 if (!rsvpName.trim() || !rsvpEmail.trim()) {
 alert('Por favor completa al menos nombre y correo electrónico.');
 return;
 }

 const newRSVP: GuestRSVP = {
 id: `rsvp-${Date.now()}`,
 name: rsvpName,
 status: rsvpStatus,
 companions: rsvpStatus ==='confirmado' ? rsvpCompanions : 0,
 dietaryNotes: rsvpDietary.trim() ? rsvpDietary : undefined,
 email: rsvpEmail
 };

 onUpdateBio({
 ...currentBio,
 wedding: {
 ...wedding,
 rsvps: [...wedding.rsvps, newRSVP]
 }
 });

 setRsvpName('');
 setRsvpEmail('');
 setRsvpCompanions(0);
 setRsvpDietary('');
 setRsvpMessage('¡Gracias! Tu confirmación ha sido registrada en tiempo real en la base de datos de la boda.');
 setTimeout(() => setRsvpMessage(''), 5000);
 };

 const handleDeleteRSVP = (id: string) => {
 onUpdateBio({
 ...currentBio,
 wedding: {
 ...wedding,
 rsvps: wedding.rsvps.filter((r) => r.id !== id)
 }
 });
 };

 const handleUploadPhoto = (e: React.FormEvent) => {
 e.preventDefault();
 if (!photoCaption.trim()) return;

 setIsUploading(true);

 setTimeout(() => {
 const newPic: GuestPhoto = {
 id: `pic-${Date.now()}`,
 url: PRESET_ALBUM_PHOTOS[selectedPresetIndex],
 caption: photoCaption,
 uploadedBy: photoUploader.trim() ||'Invitado Anónimo',
 date: new Date().toISOString().split('T')[0]
 };

 onUpdateBio({
 ...currentBio,
 wedding: {
 ...wedding,
 photoAlbum: [newPic, ...wedding.photoAlbum]
 }
 });

 setPhotoCaption('');
 setSelectedPresetIndex((prev) => (prev + 1) % PRESET_ALBUM_PHOTOS.length);
 setIsUploading(false);
 }, 800);
 };

 const handleDeletePhoto = (id: string) => {
 onUpdateBio({
 ...currentBio,
 wedding: {
 ...wedding,
 photoAlbum: wedding.photoAlbum.filter((p) => p.id !== id)
 }
 });
 };

 const handleCopyLink = () => {
 navigator.clipboard.writeText(window.location.href);
 setCopyStatus(true);
 setTimeout(() => setCopyStatus(false), 2000);
 };

 const confirmedGuestsCount = wedding.rsvps
 .filter((r) => r.status ==='confirmado')
 .reduce((acc, r) => acc + 1 + r.companions, 0);

 return (
 <div className="space-y-6">
 {/* Wedding Banner Cover Image */}
 <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden shadow-xs border border-slate-100">
 <img
 src={wedding.coverImage}
 alt="Boda Cover"
 className="w-full h-full object-cover"
 referrerPolicy="no-referrer"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/10 to-transparent flex items-end p-5 md:p-6">
 <div className="text-white space-y-1">
 <span className="text-[10px] tracking-widest uppercase font-extrabold bg-rose-500/90 text-white px-2.5 py-1 rounded-sm">
 Anuncio de Boda Oficial
 </span>
 <h2 className="text-xl md:text-2xl font-bold tracking-tight">
 {wedding.brideName} & {wedding.groomName}
 </h2>
 <p className="text-xs text-rose-100 font-serif italic">
 "Y el amor cobró vida en una tarde de otoño..."
 </p>
 </div>
 </div>
 </div>

 {/* Wedding Story and Coordinates */}
 <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-4">
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-rose-50">
 <div className="flex items-center gap-2.5 text-slate-800">
 <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
 <div>
 <span className="text-xs text-slate-400 block uppercase tracking-wider font-bold">Fecha del Evento</span>
 <span className="text-xs font-bold text-slate-700 font-serif">
 {new Date(wedding.date).toLocaleDateString('es-ES', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
 </span>
 </div>
 </div>

 <div className="flex items-center gap-2.5 text-slate-800">
 <MapPin className="w-5 h-5 text-rose-500" />
 <div>
 <span className="text-xs text-slate-400 block uppercase tracking-wider font-bold">Ubicación de Ceremonia</span>
 <a
 href={wedding.googleMapsUrl}
 target="_blank"
 rel="noreferrer"
 className="text-xs font-bold font-serif text-rose-650 hover:underline flex items-center gap-0.5"
 >
 {wedding.locationName} 
 </a>
 </div>
 </div>
 </div>

 <div className="space-y-1">
 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nuestra Historia</h4>
 <p className="text-xs text-slate-600 leading-relaxed font-serif italic">
 "{wedding.story}"
 </p>
 </div>

 <div className="flex justify-end pt-2">
 <button
 onClick={handleCopyLink}
 className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 bg-rose-50 hover:bg-rose-100/70 px-3 py-1.5 rounded-lg border border-rose-100 transition"
 >
 <Share2 className="w-3.5 h-3.5" />
 {copyStatus ?'¡Enlace de Invitación Copiado!' :'Generar & Copiar Enlace Compartible'}
 </button>
 </div>
 </div>

 {/* RSVP Manager / Guest confirmations */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
 {/* RSVP Form widget */}
 <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-4">
 <div className="space-y-1">
 <h3 className="text-xs font-bold text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
 <Users className="w-4 h-4" /> RSVP - Confirmar Asistencia
 </h3>
 <p className="text-[11px] text-slate-400">Por favor llene este formulario oficial para registrarse en la lista.</p>
 </div>

 {rsvpMessage && (
 <div className="p-3 bg-emerald-50 rounded-lg text-emerald-800 text-[11px] font-bold border border-emerald-100 flex items-center gap-1.5">
 <Check className="w-4 h-4 text-emerald-600" /> {rsvpMessage}
 </div>
 )}

 <form onSubmit={handleAddRSVP} className="space-y-3">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Nombre Completo</label>
 <input
 type="text"
 placeholder="Ej. Paula Restrepo"
 value={rsvpName}
 onChange={(e) => setRsvpName(e.target.value)}
 className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-700 bg-slate-50/50 focus:bg-white focus:outline"
 required
 />
 </div>

 <div>
 <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Correo Electrónico</label>
 <input
 type="email"
 placeholder="paula@gmail.com"
 value={rsvpEmail}
 onChange={(e) => setRsvpEmail(e.target.value)}
 className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-700 bg-slate-50/50 focus:bg-white focus:outline"
 required
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">¿Asistirás al Evento?</label>
 <select
 value={rsvpStatus}
 onChange={(e: any) => setRsvpStatus(e.target.value)}
 className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-700 bg-white"
 >
 <option value="confirmado">Confirmado (Sí asisto )</option>
 <option value="rechazado">Rechazo (No puedo asistir )</option>
 </select>
 </div>

 <div>
 <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Acompañantes Adicionales</label>
 <input
 type="number"
 min={0}
 max={5}
 value={rsvpCompanions}
 onChange={(e) => setRsvpCompanions(parseInt(e.target.value) || 0)}
 className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-700 bg-slate-50/50 focus:bg-white"
 disabled={rsvpStatus ==='rechazado'}
 />
 </div>
 </div>

 <div>
 <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Restricciones Alimenticias</label>
 <input
 type="text"
 placeholder="Ej. Sin mariscos, vegetariano, celíaco..."
 value={rsvpDietary}
 onChange={(e) => setRsvpDietary(e.target.value)}
 className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-700 bg-slate-50/50 focus:bg-white"
 />
 </div>

 <div className="flex justify-end pt-2">
 <button
 type="submit"
 className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition"
 >
 Registrar Asistencia 
 </button>
 </div>
 </form>
 </div>

 {/* Live analytics and confirmations display */}
 <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-4">
 <div className="flex items-center justify-between border-b border-slate-100 pb-2">
 <div>
 <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
 Lista de Registros ({wedding.rsvps.length})
 </h3>
 <p className="text-[10px] text-slate-400">Total confirmados real: <strong className="text-slate-600">{confirmedGuestsCount} personas</strong>.</p>
 </div>

 <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-100">
 {role ==='creador' ?'Administrador' :'Vista de Invitado'}
 </span>
 </div>

 <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
 {wedding.rsvps.map((guest) => {
 const isConfirm = guest.status ==='confirmado';
 return (
 <div
 key={guest.id}
 className="p-2.5 rounded-xl border border-slate-50 bg-slate-50/40 flex items-center justify-between gap-3"
 >
 <div>
 <span className="text-xs font-bold text-slate-800 block">
 {guest.name} {guest.companions > 0 && `(+${guest.companions})`}
 </span>
 <span className="text-[10px] text-slate-400 block">{guest.email}</span>
 {guest.dietaryNotes && (
 <span className="mt-0.5 inline-block text-[8px] bg-rose-50 border border-rose-100 text-rose-700 font-extrabold rounded-sm px-1">
 {guest.dietaryNotes}
 </span>
 )}
 </div>

 <div className="flex items-center gap-2">
 <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
 isConfirm ?'bg-emerald-150 text-emerald-800' :'bg-slate-100 text-slate-500'
 }`}>
 {guest.status}
 </span>
 {role ==='creador' && (
 <button
 onClick={() => handleDeleteRSVP(guest.id)}
 className="p-1 hover:text-rose-600 text-slate-400"
 title="Eliminar de lista"
 >
 <Trash className="w-3.5 h-3.5" />
 </button>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>

 {/* Guest public album (Álbum público de fotos) */}
 <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-4">
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
 <div>
 <h3 className="text-xs font-bold text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
 <ImageIcon className="w-4 h-4" /> Álbum Público de los Invitados 
 </h3>
 <p className="text-[10px] text-slate-400">Todos los asistentes a la boda oficiales pueden subir fotos para el recuerdo compartido.</p>
 </div>
 <span className="text-[8px] tracking-widest text-[#2e3135] uppercase font-bold bg-[#edf0f2] rounded px-2 py-1">
 Muro de Vivencias
 </span>
 </div>

 {/* Upload Form (Simulated drag drop or image selection button) */}
 <form onSubmit={handleUploadPhoto} className="p-3 bg-rose-50/30 border border-dashed border-rose-200 rounded-xl space-y-3">
 <p className="text-[9px] font-bold text-rose-800 uppercase tracking-widest">Sube una foto al Álbum Público de la Boda</p>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 <div>
 <label className="block text-[10px] text-slate-500 mb-0.5">Tu Nombre</label>
 <input
 type="text"
 placeholder="Ej. Paula Restrepo"
 value={photoUploader}
 onChange={(e) => setPhotoUploader(e.target.value)}
 className="w-full text-xs p-2 border border-slate-200 bg-white rounded-lg text-slate-700"
 required
 />
 </div>
 <div>
 <label className="block text-[10px] text-slate-500 mb-0.5">Pie de Foto / Dedicatoria</label>
 <input
 type="text"
 placeholder="Ej. ¡Qué noche tan hermosa!"
 value={photoCaption}
 onChange={(e) => setPhotoCaption(e.target.value)}
 className="w-full text-xs p-2 border border-slate-200 bg-white rounded-lg text-slate-700"
 required
 />
 </div>
 <div>
 <label className="block text-[10px] text-slate-500 mb-1">Elige una Foto de Boda</label>
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => setSelectedPresetIndex((prev) => (prev + 1) % PRESET_ALBUM_PHOTOS.length)}
 className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs hover:border-indigo-400 font-semibold"
 >
 Cambiar Imagen Demo
 </button>
 <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0">
 <img src={PRESET_ALBUM_PHOTOS[selectedPresetIndex]} alt="Preset Preview" className="w-full h-full object-cover" />
 </div>
 </div>
 </div>
 </div>

 <div className="flex justify-end pt-2">
 <button
 type="submit"
 disabled={isUploading}
 className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-400 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow-2xs"
 >
 <Upload className="w-3.5 h-3.5" /> {isUploading ?'Procesando Memoria...' :'Publicar en Álbum Público'}
 </button>
 </div>
 </form>

 {/* Photo Gallery Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
 {wedding.photoAlbum.length === 0 ? (
 <div className="col-span-full py-6 text-center text-slate-400 text-xs italic">
 Aún no hay fotos en este álbum. ¡Sube la primera!
 </div>
 ) : (
 wedding.photoAlbum.map((pic) => (
 <div
 key={pic.id}
 className="group relative rounded-xl border border-slate-100 bg-white p-2 shadow-2xs hover:shadow-xs transition-shadow overflow-hidden"
 >
 <div className="h-32 rounded-lg overflow-hidden relative">
 <img
 src={pic.url}
 alt={pic.caption}
 className="w-full h-full object-cover group-hover:scale-105 transition-transform"
 referrerPolicy="no-referrer"
 />
 <div className="absolute top-1 left-1 bg-black/50 text-white px-2 py-0.5 rounded text-[8px] font-bold">
 Por {pic.uploadedBy}
 </div>
 </div>

 <div className="p-1 space-y-0.5">
 <p className="text-xs font-bold text-slate-700 truncate">{pic.caption}</p>
 <p className="text-[10px] text-slate-400">{pic.date}</p>
 </div>

 {(role ==='creador' || pic.uploadedBy === photoUploader) && (
 <button
 onClick={() => handleDeletePhoto(pic.id)}
 className="absolute top-2 right-2 p-1 rounded-sm bg-rose-600 text-white hover:bg-rose-700"
 title="Eliminar foto"
 >
 <Trash className="w-3 h-3" />
 </button>
 )}
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 );
}
