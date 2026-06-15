import React, { useState } from'react';
import { Biography, GenericLink, DemoUserRole } from '../types/biography';
import { 
 Globe, Link as LinkIcon, Camera, Download, ExternalLink, 
 Trash, Plus, Check, Info, HelpCircle, FileText 
} from'lucide-react';

interface GenericModuleProps {
 currentBio: Biography;
 role: DemoUserRole;
 onUpdateBio: (updated: Biography) => void;
}

const ICON_PICKER_OPTIONS: { [key: string]: any } = {'Globe': Globe,'ExternalLink': ExternalLink,'Camera': Camera,'Download': Download,'Link': LinkIcon,'FileText': FileText
};

export function GenericModule({ currentBio, role, onUpdateBio }: GenericModuleProps) {
 const generic = currentBio.generic;

 // New Link states
 const [showAddLink, setShowAddLink] = useState(false);
 const [newTitle, setNewTitle] = useState('');
 const [newUrl, setNewUrl] = useState('');
 const [newDesc, setNewDesc] = useState('');
 const [newIcon, setNewIcon] = useState('ExternalLink');
 const [isHighlight, setIsHighlight] = useState(false);

 if (!generic) return <div className="text-slate-400 p-4">No se encontraron datos de la Biografía.</div>;

 const handleAddLink = (e: React.FormEvent) => {
 e.preventDefault();
 if (!newTitle.trim() || !newUrl.trim()) return;

 const newLink: GenericLink = {
 id: `link-${Date.now()}`,
 title: newTitle,
 url: newUrl,
 description: newDesc.trim() ? newDesc : undefined,
 icon: newIcon,
 isHighlighted: isHighlight
 };

 onUpdateBio({
 ...currentBio,
 generic: {
 ...generic,
 links: [...generic.links, newLink]
 }
 });

 setNewTitle('');
 setNewUrl('');
 setNewDesc('');
 setIsHighlight(false);
 setShowAddLink(false);
 };

 const handleDeleteLink = (id: string) => {
 onUpdateBio({
 ...currentBio,
 generic: {
 ...generic,
 links: generic.links.filter((l) => l.id !== id)
 }
 });
 };

 return (
 <div className="space-y-6">
 {/* Profile Bio Presentation */}
 <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center text-center space-y-3 relative overflow-hidden">
 
 {/* Profile Avatar with custom theme glow */}
 <div className="relative">
 <img
 src={generic.avatarUrl}
 alt={generic.title}
 className="w-20 h-20 rounded-full object-cover border-4 border-indigo-100 shadow"
 referrerPolicy="no-referrer"
 />
 <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center" title="Online">
 <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
 </div>
 </div>

 <div className="space-y-1">
 <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{generic.title}</h2>
 <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{generic.subtitle}</p>
 <p className="text-xs text-slate-500 leading-relaxed max-w-md pt-1.5">{generic.description}</p>
 </div>

 {/* Social connections toolbar */}
 <div className="pt-2 flex items-center justify-center gap-3">
 {generic.socialLinks.instagram && (
 <a
 href={generic.socialLinks.instagram}
 target="_blank"
 rel="noreferrer"
 className="p-2 rounded-full bg-slate-50 hover:bg-slate-100/80 text-slate-600 hover:text-pink-600 transition"
 title="Instagram"
 >
 <Camera className="w-4 h-4" />
 </a>
 )}
 {generic.socialLinks.linkedin && (
 <a
 href={generic.socialLinks.linkedin}
 target="_blank"
 rel="noreferrer"
 className="p-2 rounded-full bg-slate-50 hover:bg-slate-100/80 text-slate-600 hover:text-blue-600 transition"
 title="LinkedIn"
 >
 <Globe className="w-4 h-4" />
 </a>
 )}
 {generic.socialLinks.whatsapp && (
 <a
 href={generic.socialLinks.whatsapp}
 target="_blank"
 rel="noreferrer"
 className="p-2 rounded-full bg-slate-50 hover:bg-slate-100/80 text-slate-600 hover:text-emerald-600 transition"
 title="WhatsApp"
 >
 <Globe className="w-4 h-4" />
 </a>
 )}
 </div>
 </div>

 {/* Customizable links tree */}
 <div className="space-y-3">
 <div className="flex items-center justify-between border-b border-slate-100 pb-2">
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
 <LinkIcon className="w-3.5 h-3.5 text-indigo-500" /> Accesos y Enlaces de Interés
 </h3>
 {role ==='creador' && (
 <button
 onClick={() => setShowAddLink(!showAddLink)}
 className="py-1 px-2.5 bg-[#4f46e5] text-white text-xs font-bold rounded-lg hover:bg-[#4338ca] transition"
 >
 {showAddLink ?'Cancelar' :'Añadir Enlace'}
 </button>
 )}
 </div>

 {/* Adding inline links block for creators */}
 {showAddLink && (
 <form onSubmit={handleAddLink} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
 <h4 className="text-xs font-bold text-slate-705 uppercase tracking-wider"> Insertar Nuevo Enlace Inteligente</h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-[10px] text-slate-500">Título para Mostrar</label>
 <input
 type="text"
 placeholder="Ej. Mi Canal de Tutoriales"
 value={newTitle}
 onChange={(e) => setNewTitle(e.target.value)}
 className="w-full text-xs p-2 border border-slate-200 bg-white rounded-lg text-slate-700"
 required
 />
 </div>
 <div>
 <label className="block text-[10px] text-slate-500">URL del Destino</label>
 <input
 type="url"
 placeholder="https://youtube.com"
 value={newUrl}
 onChange={(e) => setNewUrl(e.target.value)}
 className="w-full text-xs p-2 border border-slate-200 bg-white rounded-lg text-slate-700"
 required
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-[10px] text-slate-500">Breve nota de acompañamiento</label>
 <input
 type="text"
 placeholder="Ej. Lanzamientos semanales y reviews de código"
 value={newDesc}
 onChange={(e) => setNewDesc(e.target.value)}
 className="w-full text-xs p-2 border border-slate-200 bg-white rounded-lg text-slate-700"
 />
 </div>
 <div>
 <label className="block text-[10px] text-slate-500">Icono Decorativo</label>
 <select
 value={newIcon}
 onChange={(e) => setNewIcon(e.target.value)}
 className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg text-slate-700"
 >
 <option value="ExternalLink">Flecha Externa</option>
 <option value="Globe">Mundo / Global</option>
 <option value="Camera">Cámara / Foto</option>
 <option value="Download">Flecha Descarga</option>
 <option value="Link">Cadena / Link</option>
 <option value="FileText">Hoja de Vida / Texto</option>
 </select>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <input
 type="checkbox"
 id="check-highlight"
 checked={isHighlight}
 onChange={(e) => setIsHighlight(e.target.checked)}
 className="rounded text-indigo-600 focus:ring-indigo-500"
 />
 <label htmlFor="check-highlight" className="text-xs text-slate-500 cursor-pointer selection:bg-indigo-100">
 Resaltar este enlace (Llamar la atención del visitante con diseño destacado)
 </label>
 </div>

 <div className="flex justify-end gap-2 pt-1">
 <button
 type="button"
 onClick={() => setShowAddLink(false)}
 className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-705 font-semibold"
 >
 Cerrar
 </button>
 <button
 type="submit"
 className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs"
 >
 Generar Enlace Directo
 </button>
 </div>
 </form>
 )}

 {/* Links stack rendering */}
 <div className="space-y-3">
 {generic.links.map((link) => {
 const IconComponent = ICON_PICKER_OPTIONS[link.icon] || ExternalLink;
 return (
 <div
 key={link.id}
 className={`p-1.5 rounded-2xl border transition-all flex items-center justify-between gap-4 group ${
 link.isHighlighted 
 ?'border-indigo-500 bg-gradient-to-r from-indigo-50/25 to-indigo-100/5 hover:-translate-y-0.5 shadow-xs' 
 :'border-slate-100 bg-white hover:border-slate-200 hover:-translate-y-0.5 shadow-2xs'
 }`}
 >
 <a
 href={link.url}
 target="_blank"
 rel="noreferrer"
 className="flex-1 p-2 flex items-center gap-3.5"
 >
 <div className={`p-2.5 rounded-xl ${
 link.isHighlighted ?'bg-indigo-600 text-white animate-pulse' :'bg-slate-50 text-slate-600'
 }`}>
 <IconComponent className="w-5 h-5" />
 </div>

 <div className="text-left space-y-0.5">
 <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
 {link.title} {link.isHighlighted && <span className="text-[8px] bg-indigo-100 text-indigo-700 font-extrabold rounded px-1 text-center animate-bounce">TOP</span>}
 </span>
 {link.description && <p className="text-[10px] text-slate-400 leading-tight">{link.description}</p>}
 </div>
 </a>

 <div className="flex items-center gap-2 pr-3">
 {role ==='creador' && (
 <button
 onClick={() => handleDeleteLink(link.id)}
 className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
 title="Eliminar enlace"
 >
 <Trash className="w-3.5 h-3.5" />
 </button>
 )}
 <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 );
}
