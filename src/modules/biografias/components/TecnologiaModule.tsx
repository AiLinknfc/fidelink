import React from 'react';
import { Biography, DemoUserRole } from '../types/biography';
import { Code, Monitor, Phone, Award } from 'lucide-react';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';

interface Props {
  currentBio: Biography;
  role: DemoUserRole;
  onUpdateBio: (updated: Biography) => void;
}

export function TecnologiaModule({ currentBio }: Props) {
  const { brand } = useModuleBrand();
  const data = currentBio.tecnologia;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 shrink-0">
          <img src={data.avatarUrl} alt={data.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">{data.name}</h3>
          <p className="text-xs text-slate-500">{data.role}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="flex items-center gap-1"><Monitor className="w-3 h-3" /> {data.company}</span>
        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {data.contact}</span>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-2"><Code className="w-3 h-3" /> Habilidades</h4>
        <div className="flex flex-wrap gap-1.5">
          {data.skills.map((s, i) => (
            <span key={i} className="px-2 py-1 text-[10px] rounded-lg border" style={{ backgroundColor: `${brand.colorHex}12`, color: brand.colorHex, borderColor: `${brand.colorHex}25` }}>{s}</span>
          ))}
        </div>
      </div>

      {data.projects.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-2"><Award className="w-3 h-3" /> Proyectos</h4>
          <ul className="space-y-1">
            {data.projects.map((p, i) => (
              <li key={i} className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: brand.colorHex }} /> {p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
