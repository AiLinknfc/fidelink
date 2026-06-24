import { type FormEvent } from 'react';
import { Settings } from 'lucide-react';
import type { AIAgilityConfig } from '../../types';

interface AIConfigTabProps {
  tempConfig: AIAgilityConfig;
  setTempConfig: (config: AIAgilityConfig) => void;
  handleSaveAIConfig: (e: FormEvent) => void;
}

export default function AIConfigTab({ tempConfig, setTempConfig, handleSaveAIConfig }: AIConfigTabProps) {
  return (
    <div className="bg-white p-6 border border-slate-200 rounded-2xl max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Directrices del Bot de Ventas de IA (WhatsApp Business Core)</h3>
          <p className="text-xs text-slate-500">Cambia las instrucciones operativas del chatbot. El modelo Gemini adaptará sus respuestas conversacionales al instante.</p>
        </div>
      </div>

      <form onSubmit={handleSaveAIConfig} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Nombre Comercial del Comercio</label>
          <input type="text" required value={tempConfig.merchantName}
            onChange={(e) => setTempConfig({ ...tempConfig, merchantName: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600 text-slate-800 placeholder:text-slate-400" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Tono Conversacional</label>
          <select value={tempConfig.agentTone}
            onChange={(e) => setTempConfig({ ...tempConfig, agentTone: e.target.value as any })}
            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600 text-slate-800 placeholder:text-slate-400">
            <option value="friendly">Amigable y Cooperador • Ideal Pymes de Hospitalidad</option>
            <option value="persuasive">Persuasivo de Cierre Rápido • Ideal para ventas directas</option>
            <option value="professional">Profesional y Técnico • Ideal Consultorías</option>
            <option value="direct">Directo e Informativo • Solo costos y especificaciones</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Mensaje Inicial Automático de WhatsApp (Bienvenida)</label>
          <input type="text" required value={tempConfig.welcomeMessage}
            onChange={(e) => setTempConfig({ ...tempConfig, welcomeMessage: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600 text-slate-800 placeholder:text-slate-400" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Instrucciones del Sistema para la IA (System Prompt)</label>
          <textarea rows={5} required value={tempConfig.systemInstructions}
            onChange={(e) => setTempConfig({ ...tempConfig, systemInstructions: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600 text-slate-800 placeholder:text-slate-400" />
        </div>
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
            <span className="uppercase">Sensibilidad para recomendar link de pago</span>
            <span className="font-mono text-indigo-600">{tempConfig.autoRecommendThreshold}/100</span>
          </div>
          <input type="range" min={40} max={95} value={tempConfig.autoRecommendThreshold}
            onChange={(e) => setTempConfig({ ...tempConfig, autoRecommendThreshold: Number(e.target.value) })}
            className="w-full accent-indigo-600 cursor-pointer" />
          <p className="text-[10px] text-slate-400 mt-1">Puntaje en Lead Scoring requerido por Gemini para que el chatbot inserte el link de la pasarela automáticamente en WhatsApp.</p>
        </div>
        <div className="pt-2">
          <button type="submit" className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all cursor-pointer">
            Guardar Directivas en Conversia AI Core
          </button>
        </div>
      </form>
    </div>
  );
}
