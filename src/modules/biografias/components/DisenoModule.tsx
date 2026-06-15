import React from 'react';
import { Biography, DemoUserRole } from '../types/biography';
import { Palette, Globe, Phone, Star } from 'lucide-react';

interface Props {
  currentBio: Biography;
  role: DemoUserRole;
  onUpdateBio: (updated: Biography) => void;
}

export function DisenoModule({ currentBio }: Props) {
  const data = currentBio.diseno;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 shrink-0">
          <img src={data.avatarUrl} alt={data.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">{data.name}</h3>
          <p className="text-xs text-slate-500">{data.specialty}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {data.portfolio}</span>
        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {data.contact}</span>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-2"><Palette className="w-3 h-3" /> Servicios</h4>
        <ul className="space-y-1">
          {data.services.map((s, i) => (
            <li key={i} className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Palette className="w-3 h-3 text-slate-400 shrink-0" /> {s}
            </li>
          ))}
        </ul>
      </div>

      {data.clients.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-2"><Star className="w-3 h-3" /> Clientes</h4>
          <div className="flex flex-wrap gap-1.5">
            {data.clients.map((c, i) => (
              <span key={i} className="px-2 py-1 text-[10px] bg-rose-50 text-rose-700 rounded-lg border border-rose-100">{c}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
