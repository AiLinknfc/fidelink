import React from 'react';
import { Biography, DemoUserRole } from '../types/biography';
import { UserCheck, Phone, Package, Award } from 'lucide-react';

interface Props {
  currentBio: Biography;
  role: DemoUserRole;
  onUpdateBio: (updated: Biography) => void;
}

export function VendedorModule({ currentBio }: Props) {
  const data = currentBio.vendedor;
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
        <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" /> {data.company}</span>
        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {data.contact}</span>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-2"><Package className="w-3 h-3" /> Productos</h4>
        <ul className="space-y-1">
          {data.products.map((p, i) => (
            <li key={i} className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" /> {p}
            </li>
          ))}
        </ul>
      </div>

      {data.achievements.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-2"><Award className="w-3 h-3" /> Logros</h4>
          <ul className="space-y-1">
            {data.achievements.map((a, i) => (
              <li key={i} className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" /> {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
