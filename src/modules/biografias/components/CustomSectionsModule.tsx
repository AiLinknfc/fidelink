import React, { useState } from'react';
import { Biography, CustomSection, CustomResource, DemoUserRole } from '../types/biography';
import { 
 FolderPlus, Plus, Archive, Image, FileText, Link2, Trash2, 
 Sparkles, Check, X, Eye, ExternalLink, Calendar, HelpCircle 
} from'lucide-react';

interface CustomSectionsModuleProps {
 currentBio: Biography;
 role: DemoUserRole;
 onUpdateBio: (updated: Biography) => void;
}

export function CustomSectionsModule({ currentBio, role, onUpdateBio }: CustomSectionsModuleProps) {
 const sections = currentBio.customSections || [];
 const isCreator = role ==='creador';

 // State to create a new section
 const [showAddSection, setShowAddSection] = useState(false);
 const [newSecTitle, setNewSecTitle] = useState('');
 const [newSecDesc, setNewSecDesc] = useState('');

 // State to add resource inside a specific section
 const [activeSectionIdForResource, setActiveSectionIdForResource] = useState<string | null>(null);
 const [resType, setResType] = useState<'foto' |'documento' |'enlace'>('foto');
 const [resTitle, setResTitle] = useState('');
 const [resDesc, setResDesc] = useState('');
 const [resUrl, setResUrl] = useState('');
 
 // High quality Unsplash presets for easier "uploading" without typing long URLs
 const UNSPLASH_PRESETS = [
 { label:'Mascota / Perro', url:'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400' },
 { label:'Mascota / Parque', url:'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=400' },
 { label:'Boda / Flores', url:'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200' },
 { label:'Boda / Brindis', url:'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=600' },
 { label:'Vehículo / Auto', url:'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400' },
 { label:'Vehículo / Taller', url:'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400' },
 { label:'Salón / Tijeras', url:'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600' },
 { label:'Nails & Spa', url:'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=400' },
 { label:'Consultoría / Tech', url:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' },
 ];

 const handleCreateSection = (e: React.FormEvent) => {
 e.preventDefault();
 if (!newSecTitle.trim()) return;

 const newSection: CustomSection = {
 id: `sec-${Date.now()}`,
 title: newSecTitle,
 description: newSecDesc || undefined,
 resources: []
 };

 onUpdateBio({
 ...currentBio,
 customSections: [...sections, newSection]
 });

 setNewSecTitle('');
 setNewSecDesc('');
 setShowAddSection(false);
 };

 const handleDeleteSection = (sectionId: string) => {
 onUpdateBio({
 ...currentBio,
 customSections: sections.filter(s => s.id !== sectionId)
 });
 };

 const handleAddResource = (e: React.FormEvent, sectionId: string) => {
 e.preventDefault();
 if (!resTitle.trim()) return;

 let finalUrl = resUrl.trim() ||'#';
 // If empty and photo is selected, assign first preset
 if (resType ==='foto' && !resUrl.trim()) {
 finalUrl = UNSPLASH_PRESETS[0].url;
 }

 const newResource: CustomResource = {
 id: `res-${Date.now()}`,
 title: resTitle,
 type: resType,
 url: finalUrl,
 description: resDesc || undefined,
 dateAdded: new Date().toISOString().split('T')[0]
 };

 const updatedSections = sections.map(sec => {
 if (sec.id === sectionId) {
 return {
 ...sec,
 resources: [...sec.resources, newResource]
 };
 }
 return sec;
 });

 onUpdateBio({
 ...currentBio,
 customSections: updatedSections
 });

 // Reset resource fields
 setResTitle('');
 setResDesc('');
 setResUrl('');
 setActiveSectionIdForResource(null);
 };

 const handleDeleteResource = (sectionId: string, resourceId: string) => {
 const updatedSections = sections.map(sec => {
 if (sec.id === sectionId) {
 return {
 ...sec,
 resources: sec.resources.filter(r => r.id !== resourceId)
 };
 }
 return sec;
 });

 onUpdateBio({
 ...currentBio,
 customSections: updatedSections
 });
 };

 return (
 <div className="space-y-4 mt-4 text-slate-800">
 
 {/* Dynamic Sections Header */}
 <div className="flex items-center justify-between border-t border-slate-100 pt-4">
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
 <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Galería & Secciones Custom
 </h3>
 
 {isCreator && (
 <button
 onClick={() => setShowAddSection(!showAddSection)}
 className="text-[10px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2 py-1 rounded-md font-bold flex items-center gap-0.5 transition-colors"
 >
 {showAddSection ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
 {showAddSection ?'Cancelar' :'Add Sección'}
 </button>
 )}
 </div>

 {/* Form to create a new customized section */}
 {showAddSection && isCreator && (
 <form onSubmit={handleCreateSection} className="p-3 bg-indigo-50/30 rounded-xl border border-indigo-100 space-y-2.5">
 <p className="text-[10px] font-bold text-indigo-805 uppercase tracking-wide">Nueva Sección Personalizada</p>
 <div>
 <label className="block text-[9px] text-slate-500 mb-0.5 uppercase font-medium">Título de la sección</label>
 <input
 type="text"
 placeholder="Ej. Fotos del recuerdo, Guías Útiles, etc."
 value={newSecTitle}
 onChange={(e) => setNewSecTitle(e.target.value)}
 className="w-full p-2 border border-slate-200 bg-white text-xs rounded-md text-slate-800"
 required
 />
 </div>
 <div>
 <label className="block text-[9px] text-slate-500 mb-0.5 uppercase font-medium">Descripción corta (Opcional)</label>
 <input
 type="text"
 placeholder="Describre brevemente este album..."
 value={newSecDesc}
 onChange={(e) => setNewSecDesc(e.target.value)}
 className="w-full p-2 border border-slate-200 bg-white text-xs rounded-md text-slate-800"
 />
 </div>
 <div className="flex justify-end gap-1.5 pt-1">
 <button
 type="button"
 onClick={() => setShowAddSection(false)}
 className="px-2.5 py-1 text-[10px] text-slate-500 hover:text-slate-700 font-semibold"
 >
 Cerrar
 </button>
 <button
 type="submit"
 className="px-3 py-1 bg-indigo-600 text-white rounded-md font-bold text-[10px] hover:bg-indigo-700"
 >
 Crear Sección
 </button>
 </div>
 </form>
 )}

 {/* Render current customizable sections */}
 {sections.length === 0 ? (
 <div className="text-center py-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-2xs text-slate-400">
 <Archive className="w-5 h-5 mx-auto text-slate-300 mb-1" />
 <span>Sin secciones personalizadas adicionales.</span>
 {isCreator && <span className="block text-indigo-600 font-bold mt-1">¡Sube fotos o guías arriba!</span>}
 </div>
 ) : (
 <div className="space-y-4">
 {sections.map(sec => (
 <div key={sec.id} className="p-3 bg-white hover:bg-slate-50/40 rounded-2xl border border-slate-100 transition-all space-y-2.5 relative">
 
 {/* Section Header */}
 <div className="flex items-start justify-between gap-1">
 <div>
 <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
 {sec.title}
 </h4>
 {sec.description && (
 <p className="text-[10px] text-slate-400 font-normal">{sec.description}</p>
 )}
 </div>
 
 {isCreator && (
 <button
 onClick={() => handleDeleteSection(sec.id)}
 className="text-red-400 hover:text-red-650 p-1 rounded hover:bg-red-50 transition"
 title="Eliminar esta sección completa"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 )}
 </div>

 {/* Section resources grid */}
 {sec.resources.length > 0 && (
 <div className="grid grid-cols-1 gap-2">
 {sec.resources.map(res => (
 <div key={res.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5 relative group">
 
 {/* Icon/Photo visual representation */}
 <div className="w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-100/50 overflow-hidden flex-shrink-0 flex items-center justify-center">
 {res.type ==='foto' ? (
 <img 
 src={res.url} 
 alt={res.title} 
 className="w-full h-full object-cover"
 referrerPolicy="no-referrer"
 />
 ) : res.type ==='documento' ? (
 <FileText className="w-5 h-5 text-indigo-500" />
 ) : (
 <Link2 className="w-5 h-5 text-emerald-500" />
 )}
 </div>

 {/* Content metadata */}
 <div className="flex-1 min-w-0 pr-6">
 <p className="text-2xs font-extrabold text-slate-700 truncate">{res.title}</p>
 {res.description && (
 <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight mt-0.5">{res.description}</p>
 )}
 <span className="text-[8px] text-slate-400 font-mono mt-1 block flex items-center gap-1 uppercase tracking-wider font-semibold">
 {res.type ==='foto' &&' Foto'}
 {res.type ==='documento' &&' Documento'}
 {res.type ==='enlace' &&' Enlace'}
 <span>• {res.dateAdded}</span>
 </span>
 </div>

 {/* Interactive click handlers */}
 <div className="absolute right-2 top-2 flex items-center gap-1">
 {res.type !=='foto' && res.url && res.url !=='#' && (
 <a 
 href={res.url} 
 target="_blank" 
 rel="noopener noreferrer"
 className="p-1 bg-white hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-md border border-slate-100 shadow-3xs transition"
 >
 <ExternalLink className="w-2.5 h-2.5" />
 </a>
 )}
 {isCreator && (
 <button
 onClick={() => handleDeleteResource(sec.id, res.id)}
 className="p-1 text-slate-300 hover:text-red-650 rounded hover:bg-red-50 transition"
 title="Eliminar recurso"
 >
 <Trash2 className="w-3 h-3" />
 </button>
 )}
 </div>

 </div>
 ))}
 </div>
 )}

 {/* Creator: Add resources inside this custom section */}
 {isCreator && (
 <div>
 {activeSectionIdForResource === sec.id ? (
 <form 
 onSubmit={(e) => handleAddResource(e, sec.id)}
 className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-2"
 >
 <div className="flex items-center justify-between border-b border-slate-200/50 pb-1">
 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Subir nuevo recurso</span>
 <button 
 type="button" 
 onClick={() => setActiveSectionIdForResource(null)}
 className="text-slate-400 hover:text-slate-650"
 >
 
 </button>
 </div>

 <div>
 <label className="block text-[8px] text-slate-400 uppercase font-bold">Tipo de Recurso</label>
 <div className="grid grid-cols-3 gap-1 mt-0.5">
 {(['foto','documento','enlace'] as const).map(t => (
 <button
 key={t}
 type="button"
 onClick={() => setResType(t)}
 className={`py-1 text-[8px] capitalize font-bold rounded-md border transition-all ${
 resType === t 
 ?'bg-indigo-600 text-white border-indigo-600' 
 :'bg-white text-slate-600 border-slate-200'
 }`}
 >
 {t ==='foto' &&' Foto'}
 {t ==='documento' &&' Doc'}
 {t ==='enlace' &&' Link'}
 </button>
 ))}
 </div>
 </div>

 <div>
 <label className="block text-[8px] text-slate-400 uppercase font-bold">Nombre o Título</label>
 <input
 type="text"
 placeholder="Ej. Foto con Carlos, Dieta, Sitio Web"
 value={resTitle}
 onChange={(e) => setResTitle(e.target.value)}
 className="w-full p-1.5 border border-slate-200 bg-white text-xs rounded text-slate-800"
 required
 />
 </div>

 <div>
 <label className="block text-[8px] text-slate-400 uppercase font-bold">Detalle / Leyenda</label>
 <input
 type="text"
 placeholder="Breve descripción..."
 value={resDesc}
 onChange={(e) => setResDesc(e.target.value)}
 className="w-full p-1.5 border border-slate-200 bg-white text-xs rounded text-slate-800"
 />
 </div>

 {resType ==='foto' ? (
 <div>
 <label className="block text-[8px] text-slate-400 uppercase font-bold mb-0.5">Elegir Foto o Link</label>
 <select
 value={resUrl}
 onChange={(e) => setResUrl(e.target.value)}
 className="w-full p-1.5 border border-slate-200 bg-white text-xs rounded text-slate-800"
 >
 <option value="">-- Elige un preset de foto demo --</option>
 {UNSPLASH_PRESETS.map((p, idx) => (
 <option key={idx} value={p.url}>
 {p.label}
 </option>
 ))}
 </select>
 </div>
 ) : (
 <div>
 <label className="block text-[8px] text-slate-400 uppercase font-bold">Enlace o URL</label>
 <input
 type="text"
 placeholder="https://ejemplo.com"
 value={resUrl}
 onChange={(e) => setResUrl(e.target.value)}
 className="w-full p-1.5 border border-slate-200 bg-white text-xs rounded text-slate-800"
 />
 </div>
 )}

 <div className="flex justify-end gap-1.5 pt-1">
 <button
 type="button"
 onClick={() => setActiveSectionIdForResource(null)}
 className="px-2 py-1 text-[9px] text-slate-500 font-bold"
 >
 Cancelar
 </button>
 <button
 type="submit"
 className="px-2.5 py-1 bg-indigo-600 text-white rounded font-bold text-[9px] hover:bg-indigo-700"
 >
 Publicar Recurso
 </button>
 </div>
 </form>
 ) : (
 <button
 onClick={() => {
 setResType('foto');
 setActiveSectionIdForResource(sec.id);
 }}
 className="w-full py-1.5 text-center text-[10px] font-bold border border-dashed border-slate-200 text-indigo-600 hover:bg-indigo-50/20 rounded-xl mt-1.5 transition-colors"
 >
 + Subir fotos o recursos a esta sección
 </button>
 )}
 </div>
 )}

 </div>
 ))}
 </div>
 )}

 </div>
 );
}
