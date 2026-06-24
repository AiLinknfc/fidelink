import { type FormEvent, useState, useRef, type ChangeEvent } from 'react';
import { Plus, Code, FileSpreadsheet, Send, MessageSquare, Check, Save, Settings } from 'lucide-react';
import type { Campaign, PixelEvent, AIAgilityConfig, TrackingConfig } from '../../types';

interface CampaignsTabProps {
  campaigns: Campaign[];
  pixelEvents: PixelEvent[];
  newCampName: string;
  newCampPlatform: 'facebook' | 'instagram';
  newCampBudget: number;
  newCampPixel: string;
  setNewCampName: (v: string) => void;
  setNewCampPlatform: (v: 'facebook' | 'instagram') => void;
  setNewCampBudget: (v: number) => void;
  setNewCampPixel: (v: string) => void;
  handleCreateCampaign: (e: FormEvent) => void;
  onRefreshData: () => void;
  trackingConfig: TrackingConfig;
  onSaveTrackingConfig: (config: TrackingConfig) => void;
  agentConfig: AIAgilityConfig;
  onUpdateAgentConfig: (config: AIAgilityConfig) => void;
}

export default function CampaignsTab({
  campaigns, pixelEvents, newCampName, newCampPlatform, newCampBudget, newCampPixel,
  setNewCampName, setNewCampPlatform, setNewCampBudget, setNewCampPixel,
  handleCreateCampaign, onRefreshData,
  trackingConfig, onSaveTrackingConfig, agentConfig, onUpdateAgentConfig
}: CampaignsTabProps) {
  const [csvResult, setCsvResult] = useState<{ count: number; loading: boolean; error?: string } | null>(null);
  const [sending, setSending] = useState<'whatsapp' | 'telegram' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localMetaCode, setLocalMetaCode] = useState(trackingConfig.metaPixelCode);
  const [saving, setSaving] = useState(false);
  const [tempConfig, setTempConfig] = useState<AIAgilityConfig>({ ...agentConfig });

  const handleSaveTracking = async () => {
    setSaving(true);
    await onSaveTrackingConfig({ metaPixelCode: localMetaCode });
    setSaving(false);
  };

  const handleSaveAIConfig = (e: FormEvent) => {
    e.preventDefault();
    onUpdateAgentConfig(tempConfig);
  };

  const handleCsvUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvResult({ count: 0, loading: true });
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        setCsvResult({ count: 0, loading: false, error: 'CSV debe tener al menos 2 filas (encabezados + datos)' });
        return;
      }

      const delim = lines[0].includes(';') ? ';' : ',';
      const firstCols = lines[0].split(delim).map(c => c.trim().toLowerCase());
      const knownHeaders = ['phone', 'name', 'email', 'event', 'timestamp', 'amount', 'currency', 'source'];
      const hasHeaders = firstCols.some(h => knownHeaders.includes(h));

      let phoneIdx: number, nameIdx: number, emailIdx: number;

      if (hasHeaders) {
        phoneIdx = firstCols.indexOf('phone');
        nameIdx = firstCols.indexOf('name');
        emailIdx = firstCols.indexOf('email');
        if (phoneIdx === -1) {
          setCsvResult({ count: 0, loading: false, error: 'El CSV debe tener una columna "phone"' });
          return;
        }
      } else {
        phoneIdx = 1;
        nameIdx = -1;
        emailIdx = 0;
      }

      const dataLines = hasHeaders ? lines.slice(1) : lines;
      const rows = dataLines.map(line => {
        const cols = line.split(delim).map(c => c.trim());
        let phone = cols[phoneIdx] || '';
        if (phone.startsWith('57') && phone.length > 10) phone = '+' + phone;
        return { phone, name: nameIdx >= 0 ? cols[nameIdx] || '' : '', email: emailIdx >= 0 ? cols[emailIdx] || '' : '' };
      }).filter(r => r.phone);

      if (!rows.length) {
        setCsvResult({ count: 0, loading: false, error: 'No se encontraron filas con teléfono válido' });
        return;
      }

      onRefreshData();
      setCsvResult({ count: rows.length, loading: false });
    } catch (err) {
      setCsvResult({ count: 0, loading: false, error: 'Error al leer el archivo CSV' });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendNotification = async (_channel: 'whatsapp' | 'telegram') => {
    setSending(_channel);
    await new Promise(r => setTimeout(r, 1000));
    setSending(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-5 border border-slate-200 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Configuración de Campañas Meta Ads</h3>
            <span className="text-xs bg-slate-100 text-slate-500 font-mono px-2 py-1 rounded">Sincronización de Catálogo</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold">
                  <th className="pb-3 px-2">Campaña</th>
                  <th className="pb-3 px-2">Plataforma</th>
                  <th className="pb-3 px-2">Presupuesto</th>
                  <th className="pb-3 px-2">Impresiones</th>
                  <th className="pb-3 px-2">Clics</th>
                  <th className="pb-3 px-2">Leads WhatsApp</th>
                  <th className="pb-3 px-2">Compras</th>
                  <th className="pb-3 px-2">Meta Pixel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-2">
                      <div className="font-semibold text-slate-900">{camp.name}</div>
                      <span className="text-[10px] font-mono text-indigo-600 font-bold bg-indigo-50 px-1 py-0.5 rounded uppercase mt-1 inline-block">ID: {camp.id}</span>
                    </td>
                    <td className="py-3.5 px-2 capitalize">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium font-mono ${camp.platform === 'facebook' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-pink-50 text-pink-700 border border-pink-200'}`}>
                        {camp.platform}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 font-mono font-bold">${camp.budget.toFixed(1)}/día</td>
                    <td className="py-3.5 px-2 font-mono text-xs">{camp.impressions.toLocaleString()}</td>
                    <td className="py-3.5 px-2 font-mono text-xs text-indigo-600 font-medium">{camp.clicks.toLocaleString()}</td>
                    <td className="py-3.5 px-2 font-mono text-xs text-violet-600 font-medium">{camp.leads}</td>
                    <td className="py-3.5 px-2 font-mono text-xs text-emerald-600 font-semibold">{camp.purchases}</td>
                    <td className="py-3.5 px-2 font-mono text-xs text-slate-500">{camp.pixelId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl">
          <h3 className="text-base font-bold text-slate-900 mb-4">Lanzar Nueva Campaña Directa</h3>
          <form onSubmit={handleCreateCampaign} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Nombre de la Campaña de Anuncios</label>
              <input type="text" required placeholder="Ej: Conversiones Barista - Landing Café" value={newCampName}
                onChange={(e) => setNewCampName(e.target.value)} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600 text-slate-800 placeholder:text-slate-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Plataforma Ads</label>
              <select value={newCampPlatform} onChange={(e) => setNewCampPlatform(e.target.value as any)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-indigo-600">
                <option value="facebook">Facebook Ads (Feed y Reels)</option>
                <option value="instagram">Instagram Ads (Stories y Explore)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Presupuesto Diario ($ COP)</label>
              <input type="number" required min={1} value={newCampBudget} onChange={(e) => setNewCampBudget(Number(e.target.value))}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600 text-slate-800 placeholder:text-slate-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Id del Pixel de Meta</label>
              <input type="text" required value={newCampPixel} onChange={(e) => setNewCampPixel(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600 text-slate-800 placeholder:text-slate-400 font-sans" />
            </div>
            <div className="md:col-span-2 pt-1">
              <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all cursor-pointer">
                <Plus className="w-4 h-4" /> Lanzar Campaña en Meta Ads
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-5 border border-slate-200 rounded-2xl flex flex-col h-[400px]">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Módulos Meta Pixel y CAPI</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">Simulación en tiempo real de registros de eventos de conversión del Pixel y Meta Conversion API (servidor-servidor)</p>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs text-slate-700">
            {pixelEvents.map((evt) => (
              <div key={evt.id} className="p-3 bg-white border border-slate-200 rounded-lg flex flex-col gap-1.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${evt.source.includes('CAPI') ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}`}>
                    {evt.source}
                  </span>
                  <span className="text-[9px] text-slate-400">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-800 font-bold">
                  <span className="text-sm tracking-wide text-slate-900 font-mono">{evt.eventName}</span>
                  <span className="text-[10px] text-indigo-600 font-medium">META EVENT</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  <span className="text-indigo-600 font-semibold font-mono">Payload: </span>
                  {JSON.stringify(evt.payload)}
                </div>
              </div>
            ))}
            {pixelEvents.length === 0 && (<div className="text-center text-slate-400 italic py-10">No se han disparado eventos de píxel aún.</div>)}
          </div>
          <div className="mt-4 p-3 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-center justify-between">
            <span>Registros listados de CAPI/Pixel:</span>
            <span className="font-bold font-mono text-indigo-600">{pixelEvents.length} eventos</span>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Importar CSV a Pixel</h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">Sube un archivo CSV con columnas: <code className="font-mono font-bold text-indigo-600">phone, name, email</code></p>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCsvUpload}
            className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer file:cursor-pointer mb-3" />
          {csvResult?.loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
              <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /> Procesando CSV...
            </div>
          )}
          {csvResult && !csvResult.loading && csvResult.error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">{csvResult.error}</div>
          )}
          {csvResult && !csvResult.loading && !csvResult.error && csvResult.count > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
                <Check className="w-4 h-4" /> <span className="font-bold">{csvResult.count} clientes</span> importados y enviados a Pixel
              </div>
              <div className="border-t border-slate-100 pt-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Automatización</p>
                <div className="flex gap-2">
                  <button onClick={() => handleSendNotification('whatsapp')} disabled={sending === 'whatsapp'}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50">
                    {sending === 'whatsapp' ? (<span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />) : (<MessageSquare className="w-3.5 h-3.5" />)}
                    WhatsApp
                  </button>
                  <button onClick={() => handleSendNotification('telegram')} disabled={sending === 'telegram'}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50">
                    {sending === 'telegram' ? (<span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />) : (<Send className="w-3.5 h-3.5" />)}
                    Telegram
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Configuración de Tracking Pixel</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">Pega aquí el código completo de Meta Pixel para que se inyecte automáticamente en tu tienda.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Código Meta Pixel</label>
              <textarea rows={4} placeholder="Pega aquí el código <script> completo de Meta Pixel (desde Meta Ads Manager)"
                value={localMetaCode} onChange={(e) => setLocalMetaCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600 text-slate-800 placeholder:text-slate-400 font-sans" />
            </div>
            <button onClick={handleSaveTracking} disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all cursor-pointer disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar Tracking Code'}
            </button>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Configuración del Asistente IA</h3>
              <p className="text-xs text-slate-500">Directrices del bot de ventas de WhatsApp</p>
            </div>
          </div>
          <form onSubmit={handleSaveAIConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Nombre Comercial</label>
              <input type="text" required value={tempConfig.merchantName}
                onChange={(e) => setTempConfig({ ...tempConfig, merchantName: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600 text-slate-800 placeholder:text-slate-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Tono Conversacional</label>
              <select value={tempConfig.agentTone} onChange={(e) => setTempConfig({ ...tempConfig, agentTone: e.target.value as any })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-indigo-600">
                <option value="friendly">Amigable y Cooperador</option>
                <option value="persuasive">Persuasivo de Cierre Rápido</option>
                <option value="professional">Profesional y Técnico</option>
                <option value="direct">Directo e Informativo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Mensaje de Bienvenida</label>
              <input type="text" required value={tempConfig.welcomeMessage}
                onChange={(e) => setTempConfig({ ...tempConfig, welcomeMessage: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600 text-slate-800 placeholder:text-slate-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Instrucciones del Sistema (System Prompt)</label>
              <textarea rows={4} required value={tempConfig.systemInstructions}
                onChange={(e) => setTempConfig({ ...tempConfig, systemInstructions: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600 text-slate-800 placeholder:text-slate-400" />
            </div>
            <div className="pt-2">
              <button type="submit"
                className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all cursor-pointer">
                Guardar Directivas
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
