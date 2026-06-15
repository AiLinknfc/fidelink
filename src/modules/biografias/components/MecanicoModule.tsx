import React from 'react';
import { Biography, DemoUserRole } from '../types/biography';
import { Wrench, MapPin, Phone, Clock, Award } from 'lucide-react';

interface Props {
  currentBio: Biography;
  role: DemoUserRole;
  onUpdateBio: (updated: Biography) => void;
}

export function MecanicoModule({ currentBio, role }: Props) {
  const data = currentBio.mecanico;
  if (!data) return <p className="text-xs text-slate-400">Sin datos del taller</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
          <Wrench className="w-6 h-6 text-amber-700" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-amber-900">{data.name}</h3>
          <p className="text-xs text-amber-700">{data.specialty}</p>
        </div>
      </div>

      <div className="space-y-2 text-xs text-amber-800">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-amber-600" />
          {data.address}
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-amber-600" />
          {data.phone}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          {data.schedule}
        </div>
      </div>

      {data.services.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-1">
            <Wrench className="w-3 h-3" /> Servicios
          </p>
          <div className="space-y-1.5">
            {data.services.map((svc, i) => (
              <div key={i} className="bg-amber-50/80 border border-amber-200/60 rounded-lg p-2 text-xs">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-amber-900">{svc.name}</p>
                  <span className="font-bold text-amber-700">${svc.estimatedPrice.toLocaleString()}</span>
                </div>
                <p className="text-amber-700/70 text-[10px]">{svc.description} · {svc.duration}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.certifications.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-1">
            <Award className="w-3 h-3" /> Certificaciones
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.certifications.map((c, i) => (
              <span key={i} className="text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded-md border border-amber-200">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
