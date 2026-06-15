import React from 'react';
import { Biography, DemoUserRole } from '../types/biography';
import { Car, MapPin, Phone, DollarSign } from 'lucide-react';

interface Props {
  currentBio: Biography;
  role: DemoUserRole;
  onUpdateBio: (updated: Biography) => void;
}

export function TaxisModule({ currentBio }: Props) {
  const data = currentBio.taxis;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 shrink-0">
          <img src={data.avatarUrl} alt={data.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">{data.name}</h3>
          <p className="text-xs text-slate-500">{data.company}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {data.coverage}</span>
        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {data.contact}</span>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-2"><Car className="w-3 h-3" /> Servicios</h4>
        <ul className="space-y-1">
          {data.services.map((s, i) => (
            <li key={i} className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-yellow-400 shrink-0" /> {s}
            </li>
          ))}
        </ul>
      </div>

      {data.rates && (
        <div>
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-2"><DollarSign className="w-3 h-3" /> Tarifas</h4>
          <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2 border border-slate-100">{data.rates}</p>
        </div>
      )}
    </div>
  );
}
