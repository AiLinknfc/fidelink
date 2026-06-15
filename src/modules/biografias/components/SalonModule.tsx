import React, { useState } from'react';
import { Biography, SalonData, SalonService, Appointment, DemoUserRole } from '../types/biography';
import { 
 Scissors, Paintbrush, Sparkles, Smile, Calendar, Clock, 
 MapPin, Phone, User, Check, Trash, Plus, ShieldCheck, AlertCircle 
} from'lucide-react';

interface SalonModuleProps {
 currentBio: Biography;
 role: DemoUserRole;
 onUpdateBio: (updated: Biography) => void;
}

const CATEGORY_ICONS: { [key: string]: any } = {'Scissors': Scissors,'Paintbrush': Paintbrush,'Sparkles': Sparkles,'Smile': Smile
};

const TIME_SLOTS = ['09:00 AM','10:15 AM','11:30 AM','01:00 PM','02:30 PM','04:00 PM','05:30 PM'
];

export function SalonModule({ currentBio, role, onUpdateBio }: SalonModuleProps) {
 const salon = currentBio.salon;

 // New Booking scheduler states
 const [selectedServiceId, setSelectedServiceId] = useState('');
 const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
 const [bookingTime, setBookingTime] = useState(TIME_SLOTS[0]);
 const [clientName, setClientName] = useState('');
 const [clientPhone, setClientPhone] = useState('');
 const [isSuccess, setIsSuccess] = useState('');

 if (!salon) return <div className="text-slate-400 p-4">No se encontraron datos de la Peluquería.</div>;

 const handleAddAppointment = (e: React.FormEvent) => {
 e.preventDefault();
 if (!selectedServiceId || !clientName.trim() || !clientPhone.trim()) {
 alert('Por favor complete todos los datos de agendamiento.');
 return;
 }

 const selectedService = salon.services.find((s) => s.id === selectedServiceId);
 if (!selectedService) return;

 const newAppointment: Appointment = {
 id: `apt-${Date.now()}`,
 serviceId: selectedServiceId,
 serviceName: selectedService.name,
 clientName,
 clientPhone,
 date: bookingDate,
 time: bookingTime,
 status:'confirmada'
 };

 onUpdateBio({
 ...currentBio,
 salon: {
 ...salon,
 appointments: [newAppointment, ...salon.appointments]
 }
 });

 setClientName('');
 setClientPhone('');
 setIsSuccess(`¡Cita agendada con éxito para el ${bookingDate} a las ${bookingTime}! Recibirás una alerta SMS.`);
 setTimeout(() => setIsSuccess(''), 5000);
 };

 const handleUpdateStatus = (id: string, newStatus:'confirmada' |'completada' |'cancelada') => {
 const updatedAppointments = salon.appointments.map((apt) => {
 if (apt.id === id) {
 return { ...apt, status: newStatus };
 }
 return apt;
 });

 onUpdateBio({
 ...currentBio,
 salon: {
 ...salon,
 appointments: updatedAppointments
 }
 });
 };

 const handleDeleteAppointment = (id: string) => {
 onUpdateBio({
 ...currentBio,
 salon: {
 ...salon,
 appointments: salon.appointments.filter((apt) => apt.id !== id)
 }
 });
 };

 return (
 <div className="space-y-6">
 {/* Salon Info Header */}
 <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center gap-5">
 <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 animate-pulse">
 <Scissors className="w-8 h-8" />
 </div>

 <div className="flex-grow text-center md:text-left space-y-2">
 <h2 className="text-xl font-bold tracking-tight text-slate-800">{salon.name}</h2>
 <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
 Combinamos técnicas de alta costura capilar y terapia de hidratación facial para resaltar tu brillo natural. Agenda tu servicio favorito abajo en un instante.
 </p>

 <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-4 text-xs text-slate-500">
 <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {salon.address}</span>
 <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400" /> {salon.phone}</span>
 <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {salon.schedule}</span>
 </div>
 </div>
 </div>

 {/* Services Menu Catalog */}
 <div className="space-y-3">
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
 <Scissors className="w-3.5 h-3.5 text-indigo-500" /> Catálogo de Servicios y Tratamientos Especiales
 </h3>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
 {salon.services.map((srv) => {
 const IconComponent = CATEGORY_ICONS[srv.iconName] || Scissors;
 return (
 <div
 key={srv.id}
 onClick={() => setSelectedServiceId(srv.id)}
 className={`p-4 bg-white rounded-xl border transition-all cursor-pointer text-left flex items-start gap-3.5 shadow-2xs hover:shadow-xs group ${
 selectedServiceId === srv.id ?'border-indigo-500 ring-1 ring-indigo-500/20 bg-indigo-50/10' :'border-slate-100'
 }`}
 >
 <div className={`p-2.5 rounded-lg flex-shrink-0 transition-all ${
 selectedServiceId === srv.id ?'bg-indigo-600 text-white' :'bg-slate-50 text-slate-600 group-hover:bg-slate-100'
 }`}>
 <IconComponent className="w-5 h-5" />
 </div>

 <div className="flex-1 space-y-1">
 <div className="flex items-center justify-between gap-2">
 <h4 className="text-xs font-extrabold text-slate-800">{srv.name}</h4>
 <span className="text-xs font-mono font-bold text-indigo-600">${srv.price.toLocaleString()}</span>
 </div>

 <p className="text-[10px] text-slate-400 font-semibold">{srv.category} • {srv.duration} mins de duración</p>
 <p className="text-[11px] text-slate-500 leading-tight pt-1">{srv.description}</p>
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Interactive Booking Reservation Module & Appointment Tracker */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
 
 {/* Reservation scheduler block */}
 <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-4">
 <div className="space-y-1">
 <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
 <Calendar className="w-4 h-4" /> Agendar Nueva Cita
 </h3>
 <p className="text-[11px] text-slate-400">Selecciona tu tratamiento en el catálogo arriba y escoge fecha/hora.</p>
 </div>

 {isSuccess && (
 <div className="p-3 bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-100 rounded-lg flex items-center gap-1.5">
 <Check className="w-4 h-4 text-emerald-600" /> {isSuccess}
 </div>
 )}

 <form onSubmit={handleAddAppointment} className="space-y-3">
 <div>
 <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Servicio Seleccionado</label>
 <select
 value={selectedServiceId}
 onChange={(e) => setSelectedServiceId(e.target.value)}
 className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-700 bg-white"
 required
 >
 <option value="">-- Elige del catálogo --</option>
 {salon.services.map((srv) => (
 <option key={srv.id} value={srv.id}>
 {srv.name} (${srv.price.toLocaleString()} - {srv.duration} mins)
 </option>
 ))}
 </select>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Día Deseado</label>
 <input
 type="date"
 value={bookingDate}
 onChange={(e) => setBookingDate(e.target.value)}
 className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-700 bg-white"
 required
 />
 </div>

 <div>
 <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Hora Deseada</label>
 <select
 value={bookingTime}
 onChange={(e) => setBookingTime(e.target.value)}
 className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-700 bg-white"
 >
 {TIME_SLOTS.map((slot) => (
 <option key={slot} value={slot}>{slot}</option>
 ))}
 </select>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Tu Nombre</label>
 <input
 type="text"
 placeholder="Ej. Alejandra Pérez"
 value={clientName}
 onChange={(e) => setClientName(e.target.value)}
 className="w-full text-xs p-2 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-lg text-slate-700"
 required
 />
 </div>

 <div>
 <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Teléfono Móvil</label>
 <input
 type="tel"
 placeholder="302 918-2913"
 value={clientPhone}
 onChange={(e) => setClientPhone(e.target.value)}
 className="w-full text-xs p-2 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-lg text-slate-700"
 required
 />
 </div>
 </div>

 <div className="flex justify-end pt-2">
 <button
 type="submit"
 className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-lg transition-all"
 >
 Confirmar Agendado 
 </button>
 </div>
 </form>
 </div>

 {/* Merchant appointments panel (Manage listings) */}
 <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-4">
 <div className="flex items-center justify-between border-b pb-2">
 <div>
 <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
 Gestión de Horarios y Reservados ({salon.appointments.length})
 </h3>
 <p className="text-[10px] text-slate-400">Administrador puede aprobar, cancelar o marcar como completado.</p>
 </div>

 <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded border ${
 role ==='estilista' || role ==='creador' ?'bg-indigo-50 border-indigo-100 text-indigo-700' :'bg-slate-100 text-slate-500'
 }`}>
 {role ==='estilista' ?'Estilista Profesional' : role ==='creador' ?'Dueña' :'Vista Cliente'}
 </span>
 </div>

 <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
 {salon.appointments.map((apt) => {
 const isComp = apt.status ==='completada';
 const isCanc = apt.status ==='cancelada';
 return (
 <div
 key={apt.id}
 className={`p-2.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/30 border-slate-50`}
 >
 <div>
 <span className="text-xs font-extrabold text-slate-800 block">{apt.serviceName}</span>
 <span className="text-[10px] text-slate-500 block">Cliente: {apt.clientName} ({apt.clientPhone})</span>
 <span className="text-[10px] text-slate-400 font-mono block"> {apt.date} • {apt.time}</span>
 </div>

 <div className="flex items-center gap-1.5 self-end sm:self-center">
 <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
 isComp ?'bg-emerald-100 text-emerald-800' :
 isCanc ?'bg-rose-100 text-rose-800' :'bg-amber-100 text-amber-800'
 }`}>
 {apt.status}
 </span>

 {(role ==='creador' || role ==='estilista') && (
 <div className="flex items-center gap-1">
 {!isComp && !isCanc && (
 <>
 <button
 onClick={() => handleUpdateStatus(apt.id,'completada')}
 className="bg-emerald-50 hover:bg-emerald-150 p-1 text-emerald-600 rounded"
 title="Completar cita"
 >
 <Check className="w-3.5 h-3.5" />
 </button>
 <button
 onClick={() => handleUpdateStatus(apt.id,'cancelada')}
 className="bg-rose-50 hover:bg-rose-150 p-1 text-rose-600 rounded"
 title="Cancelar cita"
 >
 <span className="text-[10px] font-bold">X</span>
 </button>
 </>
 )}
 <button
 onClick={() => handleDeleteAppointment(apt.id)}
 className="hover:text-rose-600 text-slate-400 p-1"
 title="Eliminar de lista"
 >
 <Trash className="w-3.5 h-3.5" />
 </button>
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>

 </div>
 </div>
 );
}
