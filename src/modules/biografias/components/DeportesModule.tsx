import React from 'react';
import { Biography, DemoUserRole } from '../types/biography';
import { Dumbbell, MapPin, Clock, Award } from 'lucide-react';

interface Props {
  currentBio: Biography;
  role: DemoUserRole;
  onUpdateBio: (updated: Biography) => void;
}

export function DeportesModule({ currentBio, role }: Props) {
  const data = currentBio.deportes;
  if (!data) return <p className="text-xs text-slate-400">Sin datos deportivos</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-cyan-900/30 flex items-center justify-center">
          <Dumbbell className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-white">{data.name}</h3>
          <p className="text-xs text-cyan-300">{data.specialty}</p>
        </div>
      </div>

      <div className="space-y-2 text-xs text-cyan-200">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          {data.location}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          {data.schedule}
        </div>
      </div>

      {data.routines.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1">
            <Dumbbell className="w-3 h-3" /> Rutinas
          </p>
          <div className="space-y-1.5">
            {data.routines.map((r, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-2 text-xs border border-white/10">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">{r.name}</p>
                  <span className="text-[9px] text-cyan-400 uppercase">{r.level}</span>
                </div>
                <p className="text-cyan-200/60 text-[10px]">{r.day} · {r.duration} min</p>
                <p className="text-cyan-200/80 text-[10px] mt-1">{r.exercises}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.achievements.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1">
            <Award className="w-3 h-3" /> Logros
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.achievements.map((a, i) => (
              <span key={i} className="text-[10px] bg-cyan-900/30 text-cyan-300 px-2 py-1 rounded-md border border-cyan-800/30">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
