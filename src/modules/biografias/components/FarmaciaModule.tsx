import React from 'react';
import { Biography, DemoUserRole } from '../types/biography';
import { Pill, Clock, Phone, MapPin, ShieldCheck } from 'lucide-react';

interface Props {
  currentBio: Biography;
  role: DemoUserRole;
  onUpdateBio: (updated: Biography) => void;
}

export function FarmaciaModule({ currentBio, role }: Props) {
  const data = currentBio.farmacia;
  if (!data) return <p className="text-xs text-slate-400">Sin datos de farmacia</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-sky-600" />
        </div>
        <div>
          <h3 className="font-bold text-sm">{data.name}</h3>
          <p className="text-xs text-slate-500">Dr. {data.pharmacistName}</p>
        </div>
      </div>

      <div className="space-y-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-sky-500" />
          {data.address}
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-sky-500" />
          {data.phone}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-sky-500" />
          {data.schedule}
        </div>
      </div>

      {data.services.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600 mb-2 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Servicios
          </p>
          <div className="space-y-1.5">
            {data.services.map((svc, i) => (
              <div key={i} className="bg-sky-50/50 rounded-lg p-2 text-xs">
                <p className="font-semibold">{svc.name}</p>
                <p className="text-slate-500 text-[10px]">{svc.description} · {svc.duration}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.products.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600 mb-2 flex items-center gap-1">
            <Pill className="w-3 h-3" /> Productos
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {data.products.map((prod, i) => (
              <div key={i} className="border border-sky-100 rounded-lg p-2 text-xs">
                <p className="font-semibold">{prod.name}</p>
                <p className="text-sky-600 font-bold">${prod.price.toLocaleString()}</p>
                {prod.requiresPrescription && (
                  <span className="text-[8px] text-amber-600 font-bold uppercase">Receta</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
