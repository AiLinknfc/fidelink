import React, { useState } from'react';
import { Biography, VehicleData, MaintenanceRecord, DemoUserRole } from '../types/biography';
import { 
 Wrench, Gauge, Calendar, ShieldAlert, FileText, Check, 
 DollarSign, MapPin, Camera, Trash, Plus, Car, HelpCircle, AlertTriangle 
} from'lucide-react';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';

interface VehicleModuleProps {
 currentBio: Biography;
 role: DemoUserRole;
 onUpdateBio: (updated: Biography) => void;
}

const PRESET_WORKSHOP_PHOTOS = ['https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=600','https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=600','https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=600'
];

export function VehicleModule({ currentBio, role, onUpdateBio }: VehicleModuleProps) {
 const { brand } = useModuleBrand();
 const vehicle = currentBio.vehicle;

 // Form states
 const [showAddMaintenance, setShowAddMaintenance] = useState(false);
 const [maintType, setMaintType] = useState('');
 const [maintMileage, setMaintMileage] = useState<number>(50000);
 const [maintWorkshop, setMaintWorkshop] = useState('');
 const [maintPrice, setMaintPrice] = useState<number>(150000);
 const [maintNotes, setMaintNotes] = useState('');
 const [maintDate, setMaintDate] = useState(new Date().toISOString().split('T')[0]);
 const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

 if (!vehicle) return <div className="text-slate-400 p-4">No se encontraron datos del Vehículo.</div>;

 const handleAddMaintenance = (e: React.FormEvent) => {
 e.preventDefault();
 if (!maintType.trim() || !maintWorkshop.trim()) return;

 const newRecord: MaintenanceRecord = {
 id: `maint-${Date.now()}`,
 date: maintDate,
 mileage: maintMileage,
 type: maintType,
 price: maintPrice,
 workshop: maintWorkshop,
 notes: maintNotes,
 imageUrl: PRESET_WORKSHOP_PHOTOS[selectedPhotoIndex]
 };

 onUpdateBio({
 ...currentBio,
 vehicle: {
 ...vehicle,
 maintenanceHistory: [newRecord, ...vehicle.maintenanceHistory]
 }
 });

 setMaintType('');
 setMaintWorkshop('');
 setMaintNotes('');
 setMaintPrice(150000);
 setSelectedPhotoIndex((prev) => (prev + 1) % PRESET_WORKSHOP_PHOTOS.length);
 setShowAddMaintenance(false);
 };

 const handleDeleteMaintenance = (id: string) => {
 onUpdateBio({
 ...currentBio,
 vehicle: {
 ...vehicle,
 maintenanceHistory: vehicle.maintenanceHistory.filter((rec) => rec.id !== id)
 }
 });
 };

 // Check alert warnings
 const today = new Date();
 const soatExpiry = new Date(vehicle.soatExpiryDate);
 const techExpiry = new Date(vehicle.technomechanicalDate);
 
 const isSoatUrgent = (soatExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) < 30;
 const isTechUrgent = (techExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) < 30;

 return (
 <div className="space-y-6">
 {/* Expiration Warnings */}
 {(isSoatUrgent || isTechUrgent) && (
 <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
 <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
 <div>
 <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Alertas Vehiculares de Vencimiento</h4>
 <ul className="text-xs text-amber-700 mt-1 list-disc list-inside space-y-1">
 {isSoatUrgent && (
 <li>
 Tu póliza SOAT ({vehicle.soatPolicyNumber}) está próxima a expirar el <strong>{vehicle.soatExpiryDate}</strong>.
 </li>
 )}
 {isTechUrgent && (
 <li>
 Tu certificado de Revisión Técnico-Mecánica vence pronto el <strong>{vehicle.technomechanicalDate}</strong>.
 </li>
 )}
 </ul>
 </div>
 </div>
 )}

 {/* Vehicle Summary Header Card */}
 <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center gap-5">
 <div className="relative">
 <img
 src={vehicle.avatarUrl}
 alt={vehicle.model}
 className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-200 shadow-sm"
 referrerPolicy="no-referrer"
 />
 <div className="absolute -bottom-1 -right-1 bg-slate-800 text-white rounded-lg p-1.5 shadow font-mono text-[10px] font-bold tracking-tight">
 Plate: {vehicle.plate}
 </div>
 </div>

 <div className="flex-1 text-center md:text-left space-y-2">
 <div className="flex flex-col sm:flex-row items-center gap-2 md:justify-start justify-center">
 <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
 {vehicle.brand} {vehicle.model}
 </h2>
 <span className="px-2.5 py-0.5 font-mono text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 rounded">
 AÑO: {vehicle.year}
 </span>
 <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-extrabold`} style={{ backgroundColor: `${brand.colorHex}12`, borderColor: `${brand.colorHex}25`, color: brand.colorHex }}>
 {vehicle.color}
 </span>
 </div>

 <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
 Plataforma de seguimiento vehicular y hoja de vida. Aquí guardo los documentos regulatorios como el SOAT, registros de CDA y cada mantenimiento mecánico con fotos de evidencia de los repuestos cambiados.
 </p>

 <div className="pt-1 flex flex-wrap justify-center md:justify-start gap-4 text-xs font-mono text-slate-500">
 <span className="flex items-center gap-1">
 <Gauge className="w-3.5 h-3.5 text-slate-400" /> KM: {vehicle.maintenanceHistory[0]?.mileage || 48000} km
 </span>
 <span className="flex items-center gap-1">
 <Calendar className="w-3.5 h-3.5 text-slate-400" /> Próx. Aceite: {(vehicle.maintenanceHistory[0]?.mileage || 48000) + 5000} km
 </span>
 </div>
 </div>
 </div>

 {/* SOAT & Technomechanical Cards */}
 <div className="space-y-3">
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
 <FileText className="w-3.5 h-3.5 text-slate-500" /> Seguros Civiles y Revisiones Técnico-Mecánicas
 </h3>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {/* SOAT */}
 <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-2xs space-y-2 relative overflow-hidden">
 <div className="absolute top-1 right-2 font-mono text-[8px] bg-slate-100 border px-1.5 py-0.5 rounded text-slate-500">
 VÍNCULO VIGENTE
 </div>
 <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Póliza SOAT Regulatoria</p>
 <p className="text-xs font-bold text-slate-800">{vehicle.soatPolicyNumber}</p>
 
 <div className="pt-2 flex items-center justify-between text-xs text-slate-500 font-mono">
 <span>Vence el: <strong>{vehicle.soatExpiryDate}</strong></span>
 <a
 href="#download-soat"
 onClick={(e) => {
 e.preventDefault();
 alert(`Descargando SOAT digital de placa ${vehicle.plate}. Código AXA: ${vehicle.soatPolicyNumber}`);
 }}
 className="text-[10px] font-bold flex items-center gap-1 hover:underline" style={{ color: brand.colorHex }}
  >
  Descargar SOAT
 </a>
 </div>
 </div>

 {/* CDA Tech Mechanic */}
 <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-2xs space-y-2 relative overflow-hidden">
 <div className="absolute top-1 right-2 font-mono text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded font-bold">
 VERIFICADO CDA
 </div>
 <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Aprobación de gases y frenada CDA</p>
 <p className="text-xs font-bold text-slate-800">Certificado Homologación Nacional</p>
 
 <div className="pt-2 flex items-center justify-between text-xs text-slate-500 font-mono">
 <span>Vence el: <strong>{vehicle.technomechanicalDate}</strong></span>
 <a
 href="#download-tech"
 onClick={(e) => {
 e.preventDefault();
 alert(`Descargando Certificado Técnico-Mecánico de gases del CDA para placa ${vehicle.plate}`);
 }}
 className="text-[10px] font-bold flex items-center gap-1 hover:underline" style={{ color: brand.colorHex }}
  >
  Descargar Certificado
 </a>
 </div>
 </div>
 </div>
 </div>

 {/* Maintenance Chronology */}
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
 <Wrench className="w-3.5 h-3.5" style={{ color: brand.colorHex }} /> Historial Completo de Mantenimiento y Mejoras
 </h3>
 <p className="text-[10px] text-slate-400 font-mono">Controle el kilometraje, precios de talleres y facturas asociadas.</p>
 </div>
 {role ==='creador' && (
 <button
 onClick={() => setShowAddMaintenance(!showAddMaintenance)}
 className="py-1 px-3 text-xs bg-slate-800 text-white font-bold hover:bg-slate-900 rounded-lg shadow-2xs transition"
 >
 {showAddMaintenance ?'Cancelar' :'Agregar Hoja'}
 </button>
 )}
 </div>

 {/* Add Maintenance record form */}
 {showAddMaintenance && (
 <form onSubmit={handleAddMaintenance} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
 <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider"> Registrar Trabajo de Taller Mecánico</h4>
 
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="block text-[10px] text-slate-500 mb-0.5">Kilometraje (km)</label>
 <input
 type="number"
 value={maintMileage}
 onChange={(e) => setMaintMileage(parseInt(e.target.value) || 0)}
 className="w-full text-xs p-2 border border-slate-200 bg-white rounded-lg text-slate-800 placeholder:text-slate-400 font-sans"
 required
 />
 </div>

 <div>
 <label className="block text-[10px] text-slate-500 mb-0.5">Trabajo / Refacción Realizada</label>
 <input
 type="text"
 placeholder="Ej. Cambio de bujías e inyectores"
 value={maintType}
 onChange={(e) => setMaintType(e.target.value)}
 className="w-full text-xs p-2 border border-slate-200 bg-white rounded-lg text-slate-800 placeholder:text-slate-400"
 required
 />
 </div>

 <div>
 <label className="block text-[10px] text-slate-500 mb-0.5">Taller / Reparador</label>
 <input
 type="text"
 placeholder="Ej. Taller Autorizado Toyota"
 value={maintWorkshop}
 onChange={(e) => setMaintWorkshop(e.target.value)}
 className="w-full text-xs p-2 border border-slate-200 bg-white rounded-lg text-slate-800 placeholder:text-slate-400"
 required
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="block text-[10px] text-slate-500 mb-0.5">Costo Total ($ CO/USD)</label>
 <input
 type="number"
 value={maintPrice}
 onChange={(e) => setMaintPrice(parseInt(e.target.value) || 0)}
 className="w-full text-xs p-2 border border-slate-200 bg-white rounded-lg text-slate-800 placeholder:text-slate-400 font-sans"
 required
 />
 </div>

 <div>
 <label className="block text-[10px] text-slate-500 mb-0.5">Fecha del Servicio</label>
 <input
 type="date"
 value={maintDate}
 onChange={(e) => setMaintDate(e.target.value)}
 className="w-full text-xs p-2 border border-slate-200 bg-white rounded-lg text-slate-800 placeholder:text-slate-400"
 required
 />
 </div>

 <div>
 <label className="block text-[10px] text-slate-500 mb-1">Evidencia / Foto Recibo</label>
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => setSelectedPhotoIndex((prev) => (prev + 1) % PRESET_WORKSHOP_PHOTOS.length)}
 className="p-1 px-2.5 bg-white border rounded text-[10px] hover:border-slate-350 text-slate-600 font-medium"
 >
 Cambiar Foto
 </button>
 <div className="w-8 h-8 rounded border overflow-hidden">
 <img src={PRESET_WORKSHOP_PHOTOS[selectedPhotoIndex]} alt="Recibo Preview" className="w-full h-full object-cover" />
 </div>
 </div>
 </div>
 </div>

 <div>
 <label className="block text-[10px] text-slate-500 mb-0.5">Notas Mecánicas / Observaciones de Comportamiento</label>
 <textarea
 placeholder="Indique si hay ruidos pendientes, vida de llantas, marca de lubricantes utilizados..."
 value={maintNotes}
 onChange={(e) => setMaintNotes(e.target.value)}
 className="w-full text-xs p-2 border border-slate-200 bg-white rounded-lg text-slate-800 placeholder:text-slate-400"
 rows={2}
 />
 </div>

 <div className="flex justify-end gap-2">
 <button
 type="button"
 onClick={() => setShowAddMaintenance(false)}
 className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold"
 >
 Cerrar
 </button>
 <button
 type="submit"
 className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg"
 >
 Insertar Ficha de Mantenimiento 
 </button>
 </div>
 </form>
 )}

 {/* Chronological Vertical Cards */}
 <div className="space-y-4">
 {vehicle.maintenanceHistory.map((rec) => (
 <div
 key={rec.id}
 className="p-4 bg-white border border-slate-100 rounded-xl shadow-2xs flex flex-col sm:flex-row gap-4 items-start justify-between"
 >
 <div className="flex gap-3">
 <div className="p-2.5 bg-slate-50 rounded-xl text-slate-600 flex-shrink-0 flex flex-col items-center justify-center font-mono">
 <Gauge className="w-4 h-4 mb-0.5" style={{ color: brand.colorHex }} />
 <span className="text-[9px] font-bold">{rec.mileage} km</span>
 </div>

 <div className="space-y-1">
 <div className="flex items-center gap-2 flex-wrap">
 <h4 className="text-xs font-bold text-slate-800">{rec.type}</h4>
 <span className="text-[10px] px-2 text-slate-500 font-semibold bg-slate-100 rounded">
 ${rec.price.toLocaleString()}
 </span>
 </div>

 <p className="text-[10px] text-slate-400 flex items-center gap-2">
 <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {rec.workshop}</span>
 <span>• {rec.date}</span>
 </p>

 <p className="text-xs text-slate-500 leading-relaxed pt-1.5 font-sans">{rec.notes}</p>
 </div>
 </div>

 <div className="flex sm:flex-col items-end gap-2 justify-between w-full sm:w-auto flex-shrink-0">
 {rec.imageUrl && (
 <div className="w-16 h-12 rounded overflow-hidden border border-slate-100 shadow-2xs">
 <img src={rec.imageUrl} alt="Evidencia" className="w-full h-full object-cover" />
 </div>
 )}
 {role ==='creador' && (
 <button
 onClick={() => handleDeleteMaintenance(rec.id)}
 className="text-[10px] text-rose-500 hover:text-rose-700 font-bold"
 >
 Eliminar
 </button>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}
