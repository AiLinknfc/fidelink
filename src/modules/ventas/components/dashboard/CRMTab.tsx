import { MessageSquare } from 'lucide-react';
import type { Lead } from '../../types';

interface CRMTabProps {
  leads: Lead[];
  selectedLeadPhone: string | null;
  setSelectedLeadPhone: (phone: string | null) => void;
}

export default function CRMTab({ leads, selectedLeadPhone, setSelectedLeadPhone }: CRMTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 border border-slate-200 rounded-2xl">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">CRM de Prospectos Calificados con Inteligencia Artificial</h3>
            <p className="text-xs text-slate-500">Automatización de puntuación de Leads (Lead Scoring) y detección de intenciones</p>
          </div>
          <div className="text-xs bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg text-indigo-700 font-semibold font-mono">
            Leads Activos: {leads.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold">
                <th className="pb-3 px-2">Prospecto</th>
                <th className="pb-3 px-2">Canal Meta</th>
                <th className="pb-3 px-2">Calificación IA (Score)</th>
                <th className="pb-3 px-2">Estado del Lead</th>
                <th className="pb-3 px-2">Último Mensaje de WhatsApp</th>
                <th className="pb-3 px-2">Fecha de Registro</th>
                <th className="pb-3 px-2">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-2">
                    <div className="font-semibold text-slate-900">{l.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{l.phone}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-sm">{l.email}</div>
                  </td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">
                      {l.channel}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold font-mono ${
                        l.score >= 80 ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        l.score >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {l.score}/100
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        {l.score >= 80 ? '🔥 Caliente' : l.score >= 50 ? '⚡ Tibio' : '❄️ Frío'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2 capitalize">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      l.status === 'converted' ? 'bg-emerald-100 text-emerald-800' :
                      l.status === 'qualified' ? 'bg-rose-100 text-rose-800' :
                      l.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {l.status === 'converted' ? 'Convertido (Compró)' : 
                       l.status === 'qualified' ? 'Calificado' : 
                       l.status === 'contacted' ? 'En Chat' : 'Nuevo'}
                    </span>
                  </td>
                  <td className="py-3 px-2 max-w-xs truncate text-xs font-medium text-slate-600">
                    &ldquo;{l.lastMessage}&rdquo;
                  </td>
                  <td className="py-3 px-2 text-xs text-slate-400 font-mono">
                    {new Date(l.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-2">
                    <button
                      onClick={() => setSelectedLeadPhone(l.phone)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-900 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Ver Chat
                    </button>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400 italic">No hay prospectos captados en el CRM todavía. Puedes interactuar en el celular de la derecha para generar nuevos prospectos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLeadPhone && (
        <div className="bg-white text-slate-900 p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <div>
              <h4 className="font-bold text-slate-900">Consola de Chat y Transcripción de IA</h4>
              <p className="text-xs text-slate-500">Lectura real del prospecto {leads.find(l => l.phone === selectedLeadPhone)?.name || selectedLeadPhone}</p>
            </div>
            <button
              onClick={() => setSelectedLeadPhone(null)}
              className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded text-slate-600 font-mono cursor-pointer"
            >
              Cerrar Logs
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl min-h-36 max-h-72 overflow-y-auto space-y-3 font-mono text-xs">
            <div className="text-slate-400 italic text-[11px] mb-2">// Registro de auditoría del webhook de WhatsApp de Meta</div>
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-indigo-700">
              <span className="font-bold text-slate-800">Notas Generadas por la IA: </span>
              {leads.find(l => l.phone === selectedLeadPhone)?.notes || "Cargando..."}
            </div>
            <div>
              <span className="text-slate-500">Canal de captura:</span> {leads.find(l => l.phone === selectedLeadPhone)?.channel || "N/A"}
            </div>
            <div>
              <span className="text-slate-500 font-mono font-bold text-rose-600">Inteligencia Artificial Score:</span> {leads.find(l => l.phone === selectedLeadPhone)?.score}/100
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
