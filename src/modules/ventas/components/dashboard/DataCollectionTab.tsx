import { useState, useRef, type FormEvent, type KeyboardEvent, type ChangeEvent } from 'react';
import { Send, Download, Upload, Database, MessageCircle, Settings, Trash2, FileSpreadsheet } from 'lucide-react';
import type { CollectedData, DataCollectionConfig } from '../../types';

interface DataCollectionTabProps {
  collectedData: CollectedData[];
  dataCollectionConfig: DataCollectionConfig;
  onAddCollectedData: (record: CollectedData) => void;
  onSaveDataCollectionConfig: (config: DataCollectionConfig) => void;
  onDeleteCollectedData: (id: string) => void;
}

export default function DataCollectionTab({
  collectedData,
  dataCollectionConfig,
  onAddCollectedData,
  onSaveDataCollectionConfig,
  onDeleteCollectedData,
}: DataCollectionTabProps) {
  const [chatMessages, setChatMessages] = useState<{ role: 'assistant' | 'customer'; text: string }[]>([
    { role: 'assistant', text: '¡Hola! Soy el simulador de cliente. Escribe un mensaje como si fueras el cliente o haz clic en "Procesar con IA" para simular una conversación completa.' },
  ]);
  const [inputText, setInputText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [pixelSending, setPixelSending] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [localConfig, setLocalConfig] = useState<DataCollectionConfig>(dataCollectionConfig);
  const [showConfig, setShowConfig] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (msg: string) => setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    setChatMessages(prev => [...prev, { role: 'customer', text: inputText.trim() }]);
    setInputText('');
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const simulateAiExtraction = async () => {
    setExtracting(true);
    addLog('Iniciando extracción con IA...');
    await new Promise(r => setTimeout(r, 1500));

    const conversationText = chatMessages.map(m => `${m.role === 'customer' ? 'Cliente' : 'Asistente'}: ${m.text}`).join('\n');
    const hasAmount = /\d{4,}/.test(conversationText);
    const hasEmail = /\S+@\S+\.\S+/.test(conversationText);
    const hasPhone = /\+?57\d{7,}/.test(conversationText);

    if (!hasAmount || !hasEmail || !hasPhone) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: '⚠️ No pude extraer datos completos. Asegúrate de que la conversación incluya: email, teléfono y un monto.' }]);
      setExtracting(false);
      addLog('Extracción fallida — datos incompletos');
      return;
    }

    const emailMatch = conversationText.match(/(\S+@\S+\.\S+)/);
    const phoneMatch = conversationText.match(/(\+?57\d{7,})/);
    const amountMatch = conversationText.match(/(\d{4,})/);

    const newRecord: CollectedData = {
      id: 'dc-' + Date.now().toString(36),
      email: emailMatch?.[1] || '',
      phone: phoneMatch?.[1] || '',
      eventName: 'Purchase',
      timestamp: new Date().toISOString(),
      amount: Number(amountMatch?.[1]) || 0,
      currency: 'COP',
      source: 'Telegram',
      rawConversation: conversationText,
    };

    onAddCollectedData(newRecord);
    addLog(`Dato recolectado: ${newRecord.email} / ${newRecord.phone} / $${newRecord.amount}`);
    setChatMessages(prev => [...prev, { role: 'assistant', text: `✅ Datos extraídos correctamente:\nEmail: ${newRecord.email}\nTeléfono: ${newRecord.phone}\nMonto: $${newRecord.amount} COP` }]);
    setExtracting(false);
  };

  const handleCsvDownload = () => {
    const header = 'email;phone;event;timestamp;amount;currency;source';
    const rows = collectedData.map(d =>
      `${d.email};${d.phone};${d.eventName};${d.timestamp};${d.amount};${d.currency};${d.source}`
    );
    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixel-export-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addLog(`CSV exportado — ${rows.length} registros`);
  };

  const handleCsvImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) { addLog('CSV inválido — menos de 2 líneas'); return; }
      const delim = lines[0].includes(';') ? ';' : ',';
      const dataLines = lines[0].toLowerCase().includes('phone') ? lines.slice(1) : lines;
      let count = 0;
      for (const line of dataLines) {
        const cols = line.split(delim).map(c => c.trim());
        if (!cols[1] && !cols[0]) continue;
        const record: CollectedData = {
          id: 'dc-' + Date.now().toString(36) + '-' + count,
          email: cols[0] || '',
          phone: cols[1]?.replace(/^57/, '+57') || '',
          eventName: cols[2] || 'Purchase',
          timestamp: cols[3] || new Date().toISOString(),
          amount: Number(cols[4]) || 0,
          currency: cols[5] || 'COP',
          source: cols[6] || 'CSV Import',
          rawConversation: '',
        };
        onAddCollectedData(record);
        count++;
      }
      addLog(`${count} registros importados desde CSV`);
    } catch {
      addLog('Error al leer CSV');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendToPixel = async () => {
    if (!localConfig.pixelId) { addLog('⚠️ Configura un Pixel ID primero'); return; }
    setPixelSending(true);
    addLog(`Enviando ${collectedData.length} eventos a Pixel ${localConfig.pixelId}...`);
    await new Promise(r => setTimeout(r, 2000));
    addLog(`✅ ${collectedData.length} eventos enviados a Meta CAPI (simulado)`);
    setPixelSending(false);
  };

  const handleSaveConfig = (e: FormEvent) => {
    e.preventDefault();
    onSaveDataCollectionConfig(localConfig);
    addLog('Configuración guardada');
    setShowConfig(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Chat Panel */}
        <div className="bg-white p-5 border border-slate-200 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="text-blue-600 w-4 h-4" />
              <h3 className="text-sm font-bold text-slate-800">Simulador de Conversación Telegram</h3>
            </div>
            <button type="button" onClick={simulateAiExtraction} disabled={extracting || chatMessages.length < 2}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold disabled:opacity-40 hover:bg-blue-700 transition-all">
              <Database className="w-3 h-3" /> {extracting ? 'Extrayendo...' : 'Procesar con IA'}
            </button>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 h-52 overflow-y-auto space-y-2 mb-3">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'customer' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'customer'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-white text-slate-700 border border-slate-200 rounded-bl-md'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="flex gap-2">
            <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Escribe como si fueras el cliente..."
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition-all text-slate-800 placeholder:text-slate-400" />
            <button type="button" onClick={handleSendMessage} disabled={!inputText.trim()}
              className="px-3 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-40 hover:bg-blue-700 transition-all">
              <Send className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={() => { setChatMessages([{ role: 'assistant', text: 'Conversación reiniciada. Escribe un mensaje para comenzar.' }]); addLog('Chat reiniciado'); }}
              className="px-2 py-2 border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Collected Data Table */}
        <div className="bg-white p-5 border border-slate-200 rounded-2xl">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Database className="text-emerald-600 w-4 h-4" />
              <h3 className="text-sm font-bold text-slate-800">Datos Recolectados</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg text-emerald-700 font-semibold font-mono">
                {collectedData.length} registros
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold">
                  <th className="pb-3 px-2">Email</th>
                  <th className="pb-3 px-2">Teléfono</th>
                  <th className="pb-3 px-2">Monto</th>
                  <th className="pb-3 px-2">Moneda</th>
                  <th className="pb-3 px-2">Fuente</th>
                  <th className="pb-3 px-2">Fecha</th>
                  <th className="pb-3 px-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {collectedData.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-2">
                      <div className="font-semibold text-slate-900 text-xs">{d.email || '—'}</div>
                    </td>
                    <td className="py-3 px-2 text-xs font-mono text-slate-600">{d.phone}</td>
                    <td className="py-3 px-2 text-xs font-semibold text-slate-900">${d.amount.toLocaleString()}</td>
                    <td className="py-3 px-2 text-xs text-slate-500">{d.currency}</td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-semibold">{d.source}</span>
                    </td>
                    <td className="py-3 px-2 text-xs text-slate-400 font-mono">
                      {new Date(d.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-2">
                      <button type="button" onClick={() => onDeleteCollectedData(d.id)}
                        className="text-slate-400 hover:text-red-500 transition-all p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {collectedData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-slate-400 italic text-xs">
                      No hay datos recolectados. Usa el simulador o importa un CSV.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column — Config + Actions */}
      <div className="space-y-6">
        {/* Config */}
        <div className="bg-white p-5 border border-slate-200 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Settings className="text-slate-600 w-4 h-4" />
              <h3 className="text-sm font-bold text-slate-800">Configuración</h3>
            </div>
            <button type="button" onClick={() => setShowConfig(!showConfig)}
              className="text-[10px] text-blue-600 font-bold hover:underline">
              {showConfig ? 'Ocultar' : 'Editar'}
            </button>
          </div>

          {showConfig ? (
            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Bot Token de Telegram</label>
                <input type="password" value={localConfig.telegramToken}
                  onChange={e => setLocalConfig(prev => ({ ...prev, telegramToken: e.target.value }))}
                  placeholder="123456:ABC-DEF..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-2.5 py-1.5 text-xs font-sans outline-none transition-all text-slate-800 placeholder:text-slate-400" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">API Key de OpenAI</label>
                <input type="password" value={localConfig.openAiApiKey}
                  onChange={e => setLocalConfig(prev => ({ ...prev, openAiApiKey: e.target.value }))}
                  placeholder="sk-..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-2.5 py-1.5 text-xs font-sans outline-none transition-all text-slate-800 placeholder:text-slate-400" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Pixel ID (Meta)</label>
                <input type="text" value={localConfig.pixelId}
                  onChange={e => setLocalConfig(prev => ({ ...prev, pixelId: e.target.value }))}
                  placeholder="px-meta-..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-2.5 py-1.5 text-xs font-sans outline-none transition-all text-slate-800 placeholder:text-slate-400" />
              </div>
              <button type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all">
                Guardar Configuración
              </button>
            </form>
          ) : (
            <div className="space-y-1.5 text-[11px] text-slate-500">
              <p>Telegram: {dataCollectionConfig.telegramToken ? '✓ Configurado' : '— No configurado'}</p>
              <p>OpenAI: {dataCollectionConfig.openAiApiKey ? '✓ Configurado' : '— No configurado'}</p>
              <p>Pixel ID: {dataCollectionConfig.pixelId || '— No configurado'}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white p-5 border border-slate-200 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Upload className="text-blue-600 w-4 h-4" />
            <h3 className="text-sm font-bold text-slate-800">Acciones</h3>
          </div>

          <button type="button" onClick={handleCsvDownload} disabled={!collectedData.length}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all disabled:opacity-40">
            <Download className="w-3.5 h-3.5" /> Descargar CSV para Pixel
          </button>

          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Importar CSV
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCsvImport} />

          <button type="button" onClick={handleSendToPixel} disabled={pixelSending || !collectedData.length || !dataCollectionConfig.pixelId}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all disabled:opacity-40">
            <Upload className="w-3.5 h-3.5" /> {pixelSending ? 'Enviando...' : 'Enviar a Pixel (CAPI)'}
          </button>

          <div className="pt-2">
            <p className="text-[10px] font-bold text-slate-500 mb-1.5">Últimos logs</p>
            <div className="bg-slate-50 rounded-lg p-2 h-28 overflow-y-auto space-y-0.5">
              {log.length === 0 ? (
                <p className="text-[9px] text-slate-400 italic">Sin actividad aún</p>
              ) : (
                log.map((entry, i) => (
                  <p key={i} className="text-[9px] font-mono text-slate-500 leading-relaxed">{entry}</p>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
