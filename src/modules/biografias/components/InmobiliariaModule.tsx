import React from 'react';
import { Biography, DemoUserRole } from '../types/biography';
import { Building2, Phone, Mail, MapPin, Bed, Bath, Maximize2 } from 'lucide-react';

interface Props {
  currentBio: Biography;
  role: DemoUserRole;
  onUpdateBio: (updated: Biography) => void;
}

export function InmobiliariaModule({ currentBio, role }: Props) {
  const data = currentBio.inmobiliaria;
  if (!data) return <p className="text-xs text-slate-400">Sin datos inmobiliarios</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-violet-600" />
        </div>
        <div>
          <h3 className="font-bold text-sm">{data.name}</h3>
          <p className="text-xs text-slate-500">Agente: {data.agent}</p>
        </div>
      </div>

      <div className="space-y-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-violet-500" />
          {data.phone}
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-violet-500" />
          {data.email}
        </div>
      </div>

      {data.properties.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600 mb-2 flex items-center gap-1">
            <Building2 className="w-3 h-3" /> Propiedades
          </p>
          <div className="space-y-2">
            {data.properties.map((prop) => (
              <div key={prop.id} className="border border-violet-100 rounded-xl overflow-hidden">
                <div className="h-24 bg-slate-200 flex items-center justify-center text-slate-400 text-[10px]">
                  {prop.imageUrl ? (
                    <img src={prop.imageUrl} alt={prop.title} className="w-full h-full object-cover" />
                  ) : (
                    '📷'
                  )}
                </div>
                <div className="p-2 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold truncate">{prop.title}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${prop.type === 'venta' ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {prop.type}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[10px] truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {prop.location}
                  </p>
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="flex items-center gap-0.5"><Bed className="w-3 h-3" />{prop.bedrooms}</span>
                    <span className="flex items-center gap-0.5"><Bath className="w-3 h-3" />{prop.bathrooms}</span>
                    <span className="flex items-center gap-0.5"><Maximize2 className="w-3 h-3" />{prop.area}m²</span>
                  </div>
                  <p className="font-bold text-violet-700">${prop.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
