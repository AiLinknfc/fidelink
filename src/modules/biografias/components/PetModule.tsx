import React, { useState } from 'react';
import { Biography, PetData, MedicalRecord, MedicalCertificate, DemoUserRole } from '../types/biography';
import {
  Heart, Calendar, Activity, ShieldAlert, Award, FileText, Download,
  Phone, User, Plus, Check, Plane, Scissors, Trash, Info, Sparkles
} from 'lucide-react';
import { PhotoInput } from './PhotoInput';

interface PetModuleProps {
 currentBio: Biography;
 role: DemoUserRole;
 onUpdateBio: (updated: Biography) => void;
}

export function PetModule({ currentBio, role, onUpdateBio }: PetModuleProps) {
 const pet = currentBio.pet;
 const [showCertificateModal, setShowCertificateModal] = useState<MedicalCertificate | null>(null);
 const [showServiceModal, setShowServiceModal] = useState<string | null>(null);

 // Forms states
 const [showAddRecord, setShowAddRecord] = useState(false);
 const [recTitle, setRecTitle] = useState('');
 const [recType, setRecType] = useState<'vacuna' |'consulta' |'cirugia' |'desparasitacion'>('consulta');
 const [recDr, setRecDr] = useState(role ==='veterinario' ?'Dr. de Turno Registrado' :'');
 const [recDesc, setRecDesc] = useState('');
 const [recDate, setRecDate] = useState(new Date().toISOString().split('T')[0]);

 const [showAddCert, setShowAddCert] = useState(false);
 const [certTitle, setCertTitle] = useState('');
 const [certAuthor, setCertAuthor] = useState('');
 const [certDesc, setCertDesc] = useState('');

 if (!pet) return <div className="text-slate-400 p-4">No se encontraron datos de la Mascota.</div>;

 const handleToggleRecordStatus = (id: string) => {
 const updatedHistory = pet.medicalHistory.map((rec) => {
 if (rec.id === id) {
 return {
 ...rec,
 status: rec.status ==='completado' ?'pendiente' :'completado',
 } as MedicalRecord;
 }
 return rec;
 });

 onUpdateBio({
 ...currentBio,
 pet: {
 ...pet,
 medicalHistory: updatedHistory,
 },
 });
 };

 const handleAddRecord = (e: React.FormEvent) => {
 e.preventDefault();
 if (!recTitle.trim() || !recDesc.trim()) return;

 const newRecord: MedicalRecord = {
 id: `med-${Date.now()}`,
 date: recDate,
 title: recTitle,
 veterinarian: recDr ||'Veterinario General',
 description: recDesc,
 status:'completado',
 type: recType,
 };

 onUpdateBio({
 ...currentBio,
 pet: {
 ...pet,
 medicalHistory: [newRecord, ...pet.medicalHistory],
 },
 });

 setRecTitle('');
 setRecDesc('');
 setRecDr('');
 setShowAddRecord(false);
 };

 const handleDeleteRecord = (id: string) => {
 const updatedHistory = pet.medicalHistory.filter((rec) => rec.id !== id);
 onUpdateBio({
 ...currentBio,
 pet: {
 ...pet,
 medicalHistory: updatedHistory,
 },
 });
 };

 const handleAddCert = (e: React.FormEvent) => {
 e.preventDefault();
 if (!certTitle.trim() || !certDesc.trim()) return;

 const newCert: MedicalCertificate = {
 id: `cert-${Date.now()}`,
 title: certTitle,
 date: new Date().toISOString().split('T')[0],
 author: certAuthor ||'Clínica Veterinaria Amigos',
 description: certDesc,
 code: `CERT-${Math.floor(1000 + Math.random() * 9000)}-PET-DR`,
 };

 onUpdateBio({
 ...currentBio,
 pet: {
 ...pet,
 certificates: [newCert, ...pet.certificates],
 },
 });

 setCertTitle('');
 setCertAuthor('');
 setCertDesc('');
 setShowAddCert(false);
 };

 const handleDeleteCert = (id: string) => {
 onUpdateBio({
 ...currentBio,
 pet: {
 ...pet,
 certificates: pet.certificates.filter((c) => c.id !== id),
 },
 });
 };

 // Extract pending vaccinations
 const pendingRecords = pet.medicalHistory.filter((rec) => rec.status ==='pendiente');

 return (
 <div className="space-y-6">
 {/* Pending Vaccination Banner / Notifications */}
 {pendingRecords.length > 0 && (
 <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs animate-pulse flex items-start gap-3">
 <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
 <div className="flex-1">
 <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Citas de Vacunación Pendientes</h4>
 <div className="mt-1 space-y-1">
 {pendingRecords.map((rec) => (
 <div key={rec.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-amber-700">
 <span>
 <strong>{rec.title}</strong> para dentro de unos días ({rec.date}) con <em>{rec.veterinarian}</em>.
 </span>
 {(role ==='creador' || role ==='veterinario') && (
 <button
 onClick={() => handleToggleRecordStatus(rec.id)}
 className="text-amber-900 border border-amber-300 hover:bg-amber-100 px-2 py-0.5 rounded text-[10px] font-bold transition-colors w-fit"
 >
 Marcar Completada
 </button>
 )}
 </div>
 ))}
 </div>
 </div>
 </div>
 )}

 {/* Pet Header Details */}
 <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center gap-5">
 <PhotoInput
   value={pet.avatarUrl}
   onChange={(url) => onUpdateBio({ ...currentBio, pet: { ...pet, avatarUrl: url } })}
   size={96}
   shape="circle"
   alt={pet.name}
   editable={role === 'creador'}
 />

 <div className="flex-1 text-center md:text-left space-y-2">
 <div className="flex flex-col sm:flex-row items-center gap-1.5 md:justify-start justify-center">
 <h2 className="text-xl font-bold text-slate-800">{pet.name}</h2>
 <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-wide font-extrabold bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full">
 {pet.breed}
 </span>
 </div>

 <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
 Hola, soy {pet.name}. Tengo {pet.age} de edad. Mi cuidador de confianza es{''}
 <strong className="text-slate-700">{pet.ownerName}</strong>. ¡Abajo puedes ver mi historial oficial de vacunas!
 </p>

 <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-4 text-xs text-slate-500">
 <span className="flex items-center gap-1">
 <User className="w-3.5 h-3.5 text-slate-400" /> Resp: {pet.ownerName}
 </span>
 <span className="flex items-center gap-1">
 <Phone className="w-3.5 h-3.5 text-slate-400" /> {pet.ownerContact}
 </span>
 <span className="flex items-center gap-1">
 <Calendar className="w-3.5 h-3.5 text-slate-400" /> Cumpleaños: {pet.birthDate}
 </span>
 </div>
 </div>
 </div>

 {/* Specialty Pet Services Block (Training, Travel Flight, Funeral, Grooming) */}
 <div className="space-y-3">
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
 <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Servicios Especiales Integrados
 </h3>
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
 {/* Training */}
 <button
 onClick={() => setShowServiceModal('adiestramiento')}
 className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs hover:shadow-xs hover:border-slate-200 hover:-translate-y-0.5 transition-all text-left space-y-2 group"
 >
 <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 transition-colors">
 <Activity className="w-4 h-4" />
 </div>
 <div>
 <p className="text-xs font-bold text-slate-700 leading-none">Adiestramiento</p>
 <p className="text-[10px] text-slate-400 mt-1 lines-clamp-1">Educación canina básica</p>
 </div>
 </button>

 {/* Travel */}
 <button
 onClick={() => setShowServiceModal('viajes')}
 className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs hover:shadow-xs hover:border-slate-200 hover:-translate-y-0.5 transition-all text-left space-y-2 group"
 >
 <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
 <Plane className="w-4 h-4" />
 </div>
 <div>
 <p className="text-xs font-bold text-slate-700 leading-none">Viajes en Avión</p>
 <p className="text-[10px] text-slate-400 mt-1 lines-clamp-1">Guías & Certificaciones ICA</p>
 </div>
 </button>

 {/* Grooming */}
 <button
 onClick={() => setShowServiceModal('peluqueria')}
 className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs hover:shadow-xs hover:border-slate-200 hover:-translate-y-0.5 transition-all text-left space-y-2 group"
 >
 <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600">
 <Scissors className="w-4 h-4" />
 </div>
 <div>
 <p className="text-xs font-bold text-slate-700 leading-none">Peluquería Canina</p>
 <p className="text-[10px] text-slate-400 mt-1 lines-clamp-1">Baño especializado y tijeras</p>
 </div>
 </button>

 {/* Funeral */}
 <button
 onClick={() => setShowServiceModal('funerario')}
 className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs hover:shadow-xs hover:border-slate-200 hover:-translate-y-0.5 transition-all text-left space-y-2 group"
 >
 <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
 <Heart className="w-4 h-4" />
 </div>
 <div>
 <p className="text-xs font-bold text-slate-700 leading-none">Servicios Funerarios</p>
 <p className="text-[10px] text-slate-400 mt-1 lines-clamp-1 text-ellipsis overflow-hidden">Cremación huellas sagradas</p>
 </div>
 </button>
 </div>
 </div>

 {/* Medical Certificates Suite (Downloads) */}
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
 <Award className="w-3.5 h-3.5 text-amber-500" /> Certificados y Permisos de Salud
 </h3>
 {(role ==='veterinario' || role ==='creador') && (
 <button
 onClick={() => setShowAddCert(!showAddCert)}
 className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
 >
 {showAddCert ?'Cancelar' :'Generar Certificado'}
 </button>
 )}
 </div>

 {/* Add Certificate Form */}
 {showAddCert && (
 <form onSubmit={handleAddCert} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Formulario Oficial de Firma de Licencia Veterinaria</p>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-[10px] text-slate-500 mb-0.5">Título del Certificado</label>
 <input
 type="text"
 placeholder="Ej. Licencia de Aptitud de Viaje Europeo"
 value={certTitle}
 onChange={(e) => setCertTitle(e.target.value)}
 className="w-full p-2 border border-slate-200 bg-white text-xs rounded-lg text-slate-700"
 required
 />
 </div>
 <div>
 <label className="block text-[10px] text-slate-500 mb-0.5">Autor / Médico Veterinario Firmante</label>
 <input
 type="text"
 placeholder="Ej. Dra. Amelia Ortiz (Mat. Prof 82923)"
 value={certAuthor}
 onChange={(e) => setCertAuthor(e.target.value)}
 className="w-full p-2 border border-slate-200 bg-white text-xs rounded-lg text-slate-700"
 />
 </div>
 </div>
 <div>
 <label className="block text-[10px] text-slate-500 mb-0.5">Detalles Médicos & Condiciones Médicas Aprobadas</label>
 <textarea
 placeholder="Declare el estado óptimo de salud, antiparasitarios activos y cumplimiento térmico de vacunas..."
 value={certDesc}
 onChange={(e) => setCertDesc(e.target.value)}
 className="w-full p-2 border border-slate-200 bg-white text-xs rounded-lg text-slate-700"
 rows={2}
 required
 />
 </div>
 <div className="flex justify-end gap-2">
 <button
 type="button"
 onClick={() => setShowAddCert(false)}
 className="px-3 py-1 text-slate-500 hover:text-slate-800 text-xs font-semibold"
 >
 Cerca
 </button>
 <button
 type="submit"
 className="px-4 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
 >
 Insertar Certificado Firmante
 </button>
 </div>
 </form>
 )}

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {pet.certificates.map((cert) => (
 <div
 key={cert.id}
 className="p-4 bg-white rounded-xl border border-slate-100 shadow-2xs flex items-start justify-between gap-3 relative overflow-hidden"
 >
 {/* Decorative side ribbon */}
 <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
 <div className="absolute top-1 right-[-15px] bg-amber-500 text-white text-[7px] font-bold py-0.5 px-4 rotate-45 text-center">
 LIC
 </div>
 </div>

 <div className="space-y-1">
 <p className="text-xs font-bold text-slate-800">{cert.title}</p>
 <p className="text-[10px] text-slate-400">{cert.author} • {cert.date}</p>
 <p className="text-[10px] text-slate-500 font-mono tracking-wider">Cód: {cert.code}</p>
 </div>

 <div className="flex flex-col items-end gap-1 flex-shrink-0 z-10">
 <button
 onClick={() => setShowCertificateModal(cert)}
 className="p-1.5 h-8 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-1 font-bold text-[9px]"
 title="Ver y Descargar Certificado"
 >
 <Download className="w-3.5 h-3.5" /> Descargar
 </button>
 {role ==='creador' && (
 <button
 onClick={() => handleDeleteCert(cert.id)}
 className="text-[9px] text-rose-500 hover:text-rose-700 font-medium"
 >
 Eliminar
 </button>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Medical History Section */}
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
 <FileText className="w-3.5 h-3.5 text-emerald-500" /> Historial de Salud y Vacunas de Max
 </h3>
 <span className="text-[10px] text-emerald-600 font-mono">
 Veterinarios registrados y doctores pueden agregar registros médicos oficiales en tiempo real.
 </span>
 </div>
 {(role ==='creador' || role ==='veterinario') && (
 <button
 onClick={() => setShowAddRecord(!showAddRecord)}
 className="py-1 px-2.5 rounded-lg text-xs bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition"
 >
 {showAddRecord ?'Cancelar' :'Nuevo Registro Dr.'}
 </button>
 )}
 </div>

 {/* Add Entry Form */}
 {showAddRecord && (
 <form onSubmit={handleAddRecord} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
 <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
 Añadir Ficha Clínica o Vacunación
 </h4>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="block text-[10px] text-slate-500">Título del Evento</label>
 <input
 type="text"
 placeholder="Ej. Vacuna Rabia Anual"
 value={recTitle}
 onChange={(e) => setRecTitle(e.target.value)}
 className="w-full text-xs p-2 border border-slate-200 bg-white rounded-lg text-slate-700"
 required
 />
 </div>
 <div>
 <label className="block text-[10px] text-slate-500">Médico Veterinario</label>
 <input
 type="text"
 placeholder="Dra. Amelia Ortiz"
 value={recDr}
 onChange={(e) => setRecDr(e.target.value)}
 className="w-full text-xs p-2 border border-slate-200 bg-white rounded-lg text-slate-700"
 />
 </div>
 <div>
 <label className="block text-[10px] text-slate-500">Categoría</label>
 <select
 value={recType}
 onChange={(e: any) => setRecType(e.target.value)}
 className="w-full text-xs p-2 border border-slate-200 bg-white rounded-lg text-slate-700"
 >
 <option value="vacuna">Vacunación</option>
 <option value="consulta">Control Médico</option>
 <option value="cirugia">Cirugía</option>
 <option value="desparasitacion">Desparasitación</option>
 </select>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-[10px] text-slate-500">Fecha de Aplicación / Cita</label>
 <input
 type="date"
 value={recDate}
 onChange={(e) => setRecDate(e.target.value)}
 className="w-full text-xs p-2 border border-slate-200 bg-white rounded-lg text-slate-700"
 required
 />
 </div>
 <div>
 <label className="block text-[10px] text-slate-500">Estado Inicial</label>
 <p className="text-xs text-slate-500 pt-2.5">
 Los registros de Veterinario se inicializan por defecto como <strong>Completados</strong> en tiempo real.
 </p>
 </div>
 </div>

 <div>
 <label className="block text-[10px] text-slate-500">Descripción Médica / Notas de Alergia</label>
 <textarea
 placeholder="Describa el diagnóstico, número de lote de vacunas, dosis, recomendaciones post-procedimiento..."
 value={recDesc}
 onChange={(e) => setRecDesc(e.target.value)}
 className="w-full text-xs p-2 border border-slate-200 bg-white rounded-lg text-slate-700 shadow-2xs"
 rows={2}
 required
 />
 </div>

 <div className="flex justify-end gap-2">
 <button
 type="button"
 onClick={() => setShowAddRecord(false)}
 className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
 >
 Cerrar
 </button>
 <button
 type="submit"
 className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
 >
 Registrar Ficha 
 </button>
 </div>
 </form>
 )}

 <div className="space-y-3">
 {pet.medicalHistory.map((rec) => {
 const isCompleted = rec.status ==='completado';
 return (
 <div
 key={rec.id}
 className={`p-4 rounded-xl border ${
 isCompleted ?'bg-white border-slate-100' :'bg-rose-50/50 border-rose-200'
 } flex flex-col sm:flex-row items-start justify-between gap-4`}
 >
 <div className="flex gap-3">
 <div className={`p-2 rounded-lg flex-shrink-0 ${
 rec.type ==='vacuna' ?'bg-emerald-50 text-emerald-600' :
 rec.type ==='cirugia' ?'bg-rose-50 text-rose-600' :
 rec.type ==='desparasitacion' ?'bg-indigo-50 text-indigo-600' :'bg-slate-50 text-slate-600'
 }`}>
 {rec.type ==='vacuna' ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : <Activity className="w-5 h-5" />}
 </div>

 <div>
 <div className="flex items-center gap-2">
 <h4 className="text-xs font-bold text-slate-800">{rec.title}</h4>
 <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold ${
 isCompleted ?'bg-emerald-50 text-emerald-700 border border-emerald-100' :'bg-rose-100 text-rose-700'
 }`}>
 {rec.status}
 </span>
 </div>

 <p className="text-[10px] text-slate-400 mt-0.5">
 Doctor: <strong className="text-slate-600">{rec.veterinarian}</strong> • {rec.date}
 </p>

 <p className="text-xs text-slate-500 mt-2 leading-relaxed font-sans">{rec.description}</p>
 </div>
 </div>

 <div className="flex items-center gap-1.5 self-end sm:self-start flex-shrink-0">
 {(role ==='creador' || role ==='veterinario') && (
 <>
 <button
 onClick={() => handleToggleRecordStatus(rec.id)}
 className={`text-[10px] font-bold px-2.5 py-1 border rounded-lg transition-colors ${
 isCompleted ?'border-slate-200 text-slate-600 hover:bg-slate-50' :'border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-emerald-100/50'
 }`}
 >
 {isCompleted ?'Desmarcar' :'Completar'}
 </button>
 <button
 onClick={() => handleDeleteRecord(rec.id)}
 className="text-[10px] font-medium text-rose-500 hover:text-rose-700 p-1"
 >
 Eliminar
 </button>
 </>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Download Interactive Certificate Modal */}
 {showCertificateModal && (
 <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
 <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-200 animate-slide-up">
 
 {/* Header style */}
 <div className="p-5 bg-gradient-to-r from-amber-550 to-amber-600 bg-amber-500 text-white text-center space-y-1 relative">
 <Award className="w-10 h-10 mx-auto fill-amber-400 text-white" />
 <h3 className="text-md font-extrabold tracking-tight uppercase">Certificación Sanitaria Canina Oficial</h3>
 <p className="text-[10px] tracking-widest text-amber-100">CÓDIGO ÚNICO DE REGISTRO: {showCertificateModal.code}</p>
 </div>

 {/* Content for Printing / Reading */}
 <div id="print-certificate" className="p-6 space-y-6">
 <div className="border-4 border-double border-slate-200 p-4 space-y-4 rounded-xl text-center">
 <p className="text-[10px] tracking-wider uppercase text-slate-400 font-extrabold">Por medio de la presente, se certifica legalmente que:</p>
 
 <div className="space-y-1">
 <span className="text-lg font-bold text-slate-800 tracking-tight block">
 {pet.name} ({pet.breed})
 </span>
 <span className="text-[11px] text-slate-500 block">
 Mascota de Especie {pet.species} con Edad de {pet.age}
 </span>
 </div>

 <hr className="border-slate-100 max-w-xs mx-auto" />

 <p className="text-xs text-slate-600 italic leading-relaxed">
 "{showCertificateModal.description}"
 </p>

 <div className="grid grid-cols-2 gap-4 text-left pt-3">
 <div>
 <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Cuidador Legal</span>
 <span className="text-xs font-bold text-slate-700 block">{pet.ownerName}</span>
 </div>
 <div>
 <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Fecha de Firma/Validación</span>
 <span className="text-xs font-bold text-slate-700 block">{showCertificateModal.date}</span>
 </div>
 </div>

 <div className="pt-4 flex flex-col items-center justify-center space-y-1">
 <div className="w-24 h-1 px-4 border-b border-dashed border-slate-400 mb-2" />
 <span className="text-[10px] font-bold text-slate-700">{showCertificateModal.author}</span>
 <span className="text-[8px] tracking-widest text-slate-400 uppercase">Firma Digital Registrada & Avalada</span>
 </div>
 </div>

 <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 text-[10px] text-emerald-800 leading-normal flex items-center gap-2">
 <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
 <span>Este certificado es <strong>VÁLIDO</strong> para ser presentado en aeropuertos, fronteras, hoteles y entidades de salud pública.</span>
 </div>
 </div>

 {/* Actions */}
 <div className="bg-slate-50 px-5 py-4 flex items-center justify-between border-t border-slate-100">
 <button
 onClick={() => {
 window.print();
 }}
 className="px-4 py-1.5 text-xs bg-slate-800 hover:bg-slate-950 font-bold rounded-lg text-white transition-all active:scale-95"
 >
 Imprimir Certificado
 </button>
 <button
 onClick={() => setShowCertificateModal(null)}
 className="px-4 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold"
 >
 Cerrar
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Special Service Informational Modal */}
 {showServiceModal && (
 <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
 <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-slide-up p-5 space-y-4">
 <div className="flex items-center gap-3">
 <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
 {showServiceModal ==='adiestramiento' && <Activity className="w-6 h-6" />}
 {showServiceModal ==='viajes' && <Plane className="w-6 h-6" />}
 {showServiceModal ==='peluqueria' && <Scissors className="w-6 h-6" />}
 {showServiceModal ==='funerario' && <Heart className="w-6 h-6" />}
 </div>
 <div>
 <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
 {showServiceModal ==='adiestramiento' &&'Servicios de Adiestramiento Integrados'}
 {showServiceModal ==='viajes' &&'Guías y Viajes Aéreos en Avión'}
 {showServiceModal ==='peluqueria' &&'Estética y Peluquería Canina Can-Care'}
 {showServiceModal ==='funerario' &&'Funeral Memorial y Despedida Digna'}
 </h3>
 <p className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider">Enlaces Aliados del Ecosistema de Max</p>
 </div>
 </div>

 <p className="text-xs text-slate-500 leading-relaxed">
 {showServiceModal ==='adiestramiento' &&'Educación profesional positiva adaptada al temperamento de tu mascota. Incluye paseos recreativos estructurados, control de ansiedad, socialización segura y habilidades básicas. Haz clic abajo para conectar con el adiestrador certificado asignado a Max.'}
 {showServiceModal ==='viajes' &&'Asesoría completa de regulaciones internacionales de transporte animal (IATA). Gestione las vacunas del certificado ICA de viaje de Max, trámites de aduana y de aerolíneas para viajar cómodo en cabina principal.'}
 {showServiceModal ==='peluqueria' &&'Servicio de corte de pelo, desenredado profundo, limpieza de glándulas sanitarias y garras con técnicas de bajo estrés. Suéter opcional protector post-baño y fragancias frutales especiales.'}
 {showServiceModal ==='funerario' &&'Servicio digno de cremación, huella en yeso recordatoria y acompañamiento espiritual. Entendemos el profundo amor familiar y la importancia de un homenaje sagrado para tu fiel compañero.'}
 </p>

 <div className="pt-2 flex justify-between gap-3">
 <a
 href="https://google.com"
 target="_blank"
 rel="noreferrer"
 className="flex-1 text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold active:scale-95 transition-all"
 >
 Contactar Servicio Aliado
 </a>
 <button
 onClick={() => setShowServiceModal(null)}
 className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold"
 >
 Volver
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
