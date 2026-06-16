import { useState, type FormEvent } from 'react';
import { Sparkles, Play, Pause, Trash2, Plus, Zap, Bell, Check, Gift } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  reward: string;
  isActive: boolean;
  timesTriggered: number;
}

export default function Automatizaciones() {
  const { user } = useAuth();
  const { brand } = useModuleBrand();

  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: 'rule-1',
      name: 'Cupón de Cumpleaños Automático',
      trigger: 'DÍA DE CUMPLEAÑOS DEL CLIENTE',
      action: 'ENVIAR MENSAJE PUSH + CUPÓN DIGITAL',
      reward: 'Regalo Bebida de Especialidad Gratis',
      isActive: true,
      timesTriggered: 142
    },
    {
      id: 'rule-2',
      name: 'Bienvenida al Círculo Platinum',
      trigger: 'NIVEL SUBE A PLATINUM',
      action: 'OTORGAR CRÉDITO DE PUNTOS EXTRAS',
      reward: 'Añadir +50 Puntos al Wallet de inmediato',
      isActive: true,
      timesTriggered: 48
    },
    {
      id: 'rule-3',
      name: 'Atracción por Colaboración de Referidos',
      trigger: 'INVITACIÓN DE REFERIDO ES EXITOSA',
      action: 'NOTIFICAR CORREO CON OBSEQUIO DOBLE',
      reward: 'Bono Co-Branded 15% Descuento Mutuo',
      isActive: false,
      timesTriggered: 19
    },
    {
      id: 'rule-4',
      name: 'Gobernanza de Inactividad 30 días',
      trigger: 'CLIENTE SIN VISITAS POR UN MES',
      action: 'REACTIVAR CON DOBLE CASHBACK PRÓXIMA COMPRA',
      reward: 'Tasa Cashback Temporal del 10%',
      isActive: true,
      timesTriggered: 89
    }
  ]);

  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleTrigger, setNewRuleTrigger] = useState('DÍA DE CUMPLEAÑOS DEL CLIENTE');
  const [newRuleAction, setNewRuleAction] = useState('ENVIAR MENSAJE PUSH + CUPÓN DIGITAL');
  const [newRuleReward, setNewRuleReward] = useState('');
  const [simulationMsg, setSimulationMsg] = useState('');
  const [isRunningSim, setIsRunningSim] = useState(false);

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const handleCreateRule = (e: FormEvent) => {
    e.preventDefault();
    if (!newRuleName || !newRuleReward) return;

    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
      name: newRuleName,
      trigger: newRuleTrigger,
      action: newRuleAction,
      reward: newRuleReward,
      isActive: true,
      timesTriggered: 0
    };

    setRules(prev => [...prev, newRule]);
    setNewRuleName('');
    setNewRuleReward('');
  };

  const runSimulation = (rule: AutomationRule) => {
    setIsRunningSim(true);
    setSimulationMsg(`Ejecutando simulación de disparador para rule: "${rule.name}"...`);

    setTimeout(() => {
      setSimulationMsg(`Disparador detectado: ${rule.trigger}`);
      setTimeout(() => {
        setSimulationMsg(`Acción completada: Se ejecutó [${rule.action}] con éxito.`);
        setTimeout(() => {
          setSimulationMsg(`¡Simulado con Éxito! Entrega del cupón: "${rule.reward}".`);
          setIsRunningSim(false);
          setRules(prev => prev.map(r => r.id === rule.id ? { ...r, timesTriggered: r.timesTriggered + 1 } : r));
        }, 1200);
      }, 1000);
    }, 800);
  };

  const [chipHovered, setChipHovered] = useState(false);
  const [hoveredRule, setHoveredRule] = useState<string | null>(null);
  const activeRules = rules.filter(r => r.isActive).length;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="bg-[#f8fafc] border-b border-slate-200 px-4 sm:px-6 h-10 flex flex-row items-center justify-between gap-2 select-none overflow-hidden flex-shrink-0">

        {/* LEFT — chip interactivo con descripción en hover */}
        <div
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-white cursor-default transition-all duration-500 ease-in-out min-w-0"
          style={{
            color: brand.colorHex,
            borderColor: chipHovered ? `${brand.colorHex}55` : 'rgb(226 232 240 / 0.6)',
            boxShadow: chipHovered
              ? `0 0 0 3px ${brand.colorHex}18, 0 2px 12px ${brand.colorHex}22`
              : '0 0 0 0px transparent',
            flex: chipHovered ? '1 1 0%' : '0 0 auto',
          }}
          onMouseEnter={() => setChipHovered(true)}
          onMouseLeave={() => setChipHovered(false)}
        >
          {/* Glow sweep background */}
          <div
            className="absolute inset-0 pointer-events-none rounded-full transition-opacity duration-500"
            style={{
              opacity: chipHovered ? 1 : 0,
              background: `linear-gradient(90deg, ${brand.colorHex}06 0%, ${brand.colorHex}14 50%, ${brand.colorHex}06 100%)`,
            }}
          />
          <Zap
            className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300"
            style={{ transform: chipHovered ? 'rotate(-15deg) scale(1.2)' : 'none' }}
          />
          <span className="text-[12px] font-bold font-sans whitespace-nowrap flex-shrink-0">Motor de automatización</span>

          {/* Separador + descripción — se revelan con clip */}
          <span
            className="text-[12px] font-sans whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out"
            style={{
              maxWidth: chipHovered ? '600px' : '0px',
              opacity: chipHovered ? 1 : 0,
              paddingLeft: chipHovered ? '6px' : '0px',
              color: `${brand.colorHex}99`,
              fontWeight: 500,
            }}
          >
            · Configura reglas inteligentes para campañas automatizadas de fidelización
          </span>
        </div>

        {/* RIGHT — estado del sistema */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: brand.colorHex }} />
          <span className="text-[11px] font-semibold text-slate-600">{activeRules} activas / {rules.length} reglas</span>
        </div>
      </div>
      <main className="flex-1 overflow-y-auto px-4 md:px-6 pt-3 pb-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/2 rounded-full filter blur-xl pointer-events-none" />

            <div className="space-y-3">
              {rules.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <p className="text-xs text-slate-400">No hay reglas de fidelización configuradas.</p>
                </div>
              ) : (
                rules.map(rule => {
                  const isHovered = hoveredRule === rule.id;
                  return (
                  <div
                    key={rule.id}
                    className="relative p-4 rounded-xl border transition-all duration-300 ease-in-out flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden"
                    style={{
                      backgroundColor: rule.isActive
                        ? isHovered ? `${brand.colorHex}06` : '#ffffff'
                        : '#f8fafc',
                      borderColor: rule.isActive
                        ? isHovered ? `${brand.colorHex}55` : `${brand.colorHex}28`
                        : 'rgb(226 232 240)',
                      boxShadow: isHovered && rule.isActive
                        ? `0 0 0 3px ${brand.colorHex}14, 0 4px 16px ${brand.colorHex}18`
                        : rule.isActive
                          ? `0 0 0 1.5px ${brand.colorHex}18`
                          : 'none',
                      opacity: rule.isActive ? 1 : 0.55,
                    }}
                    onMouseEnter={() => setHoveredRule(rule.id)}
                    onMouseLeave={() => setHoveredRule(null)}
                  >
                    {/* Glow sweep en hover */}
                    <div
                      className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-xl"
                      style={{
                        opacity: isHovered && rule.isActive ? 1 : 0,
                        background: `linear-gradient(105deg, ${brand.colorHex}04 0%, ${brand.colorHex}10 50%, ${brand.colorHex}04 100%)`,
                      }}
                    />

                    <div className="relative space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${rule.isActive ? 'animate-pulse' : ''}`}
                          style={{ backgroundColor: rule.isActive ? brand.colorHex : '#94a3b8' }}
                        />
                        <h3
                          className="text-xs font-bold transition-colors duration-300"
                          style={{ color: isHovered && rule.isActive ? brand.colorHex : '#1e293b' }}
                        >
                          {rule.name}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pt-1 text-[11px]">
                        <p className="text-[11px] text-slate-500">
                          <strong className="text-slate-400 font-jakarta text-[10px] uppercase font-bold tracking-wider">Si ocurre:</strong> {rule.trigger}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          <strong className="text-slate-400 font-jakarta text-[10px] uppercase font-bold tracking-wider">Acción:</strong> {rule.action}
                        </p>
                        <p className="sm:col-span-2 font-semibold mt-0.5 flex items-center gap-1 transition-colors duration-300"
                           style={{ color: isHovered && rule.isActive ? brand.colorHex : '#2563eb' }}>
                          <Gift className="w-3.5 h-3.5" style={{ color: isHovered && rule.isActive ? brand.colorHex : '#3b82f6' }} />
                          Recompensa: {rule.reward}
                        </p>
                      </div>
                    </div>

                    <div className="relative flex items-center gap-2 sm:self-center">
                      <div className="text-right mr-2 hidden sm:block">
                        <p className="text-[10px] text-slate-400 font-jakarta uppercase tracking-wider font-bold">Disparos total</p>
                        <p className="text-[12px] font-bold font-sans transition-colors duration-300"
                           style={{ color: isHovered && rule.isActive ? brand.colorHex : '#334155' }}>
                          {rule.timesTriggered}
                        </p>
                      </div>

                      <button type="button" title="Simular ejecución"
                        disabled={!rule.isActive || isRunningSim}
                        onClick={() => runSimulation(rule)}
                        className="p-1.5 rounded-lg border transition-all duration-300"
                        style={rule.isActive ? {
                          backgroundColor: isHovered ? `${brand.colorHex}14` : '#eff6ff',
                          borderColor: isHovered ? `${brand.colorHex}66` : '#bfdbfe',
                          color: brand.colorHex,
                        } : {
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          color: '#94a3b8',
                          cursor: 'not-allowed',
                        }}>
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button type="button" title={rule.isActive ? 'Pausar' : 'Reanudar'}
                        onClick={() => toggleRule(rule.id)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
                        {rule.isActive ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Check className="w-3.5 h-3.5 text-emerald-500" />}
                      </button>

                      <button type="button" title="Eliminar"
                        onClick={() => deleteRule(rule.id)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-500 hover:bg-slate-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleCreateRule} className="mt-6 pt-5 border-t border-slate-100 space-y-3">
              <h3 className="text-section-heading text-slate-800 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-600" /> Creador de reglas de campaña
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-500 mb-1">Nombre Descriptivo</label>
                  <input type="text" value={newRuleName} onChange={e => setNewRuleName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800"
                    placeholder="Por ej: Fidelidad de Fin de Año Premium" required />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-500 mb-1">Otorga el Beneficio</label>
                  <input type="text" value={newRuleReward} onChange={e => setNewRuleReward(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800"
                    placeholder="Por ej: Otorga 1 Pase Café Latte extra" required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-500 mb-1">Si ocurre Evento (Trigger)</label>
                  <select value={newRuleTrigger} onChange={e => setNewRuleTrigger(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none text-slate-800 cursor-pointer font-bold">
                    <option value="DÍA DE CUMPLEAÑOS DEL CLIENTE">Día de cumpleaños del cliente</option>
                    <option value="NIVEL SUBE A PLATINUM">Su nivel de fidelidad sube a PLATINUM</option>
                    <option value="INVITACIÓN DE REFERIDO ES EXITOSA">Invitación de referido es completada</option>
                    <option value="CLIENTE COMPRA SUSCRIPCIÓN EN WEB">Cliente adquiere pase en pasarela Web</option>
                    <option value="ABANDONO DE TIENDA POR 15 DÍAS">Inactividad por más de 15 días</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-500 mb-1">Acción del Canal</label>
                  <select value={newRuleAction} onChange={e => setNewRuleAction(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none text-slate-800 cursor-pointer font-bold">
                    <option value="ENVIAR MENSAJE PUSH + CUPÓN DIGITAL">Enviar mensaje push + cupón</option>
                    <option value="OTORGAR CRÉDITO DE PUNTOS EXTRAS">Abonar puntos / Cashback directo</option>
                    <option value="NOTIFICAR CORREO CON OBSEQUIO DOBLE">Enviar correo co-branded</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 text-xs rounded-lg transition-all shadow-sm flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Agregar Nueva Automatización de Marca
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Bell className="w-4 h-4 text-blue-600 animate-pulse" />
                <h3 className="text-section-heading text-slate-800">
                  Auditor de triggers en vivo
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Este panel audita ejecuciones simuladas de webhooks de automatización. Haz clic en el botón de reproducción de cualquier regla activa para probar la respuesta.
              </p>
            </div>

            <div className="flex-1 my-4 p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col justify-center items-center text-center">
              {simulationMsg ? (
                <div className="space-y-3 font-sans text-xs text-slate-700 relative w-full text-left">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                    WEBHOOK PROCESADO
                  </div>
                  <div className="p-3 bg-white border border-slate-100 rounded-lg space-y-1.5 font-mono text-[10.5px]">
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Sincronización Cloud:</p>
                    <p className="text-slate-800 font-medium leading-relaxed">{simulationMsg}</p>
                    <div className="h-0.5 bg-slate-100 my-1" />
                    <p className="text-[9px] text-slate-400 leading-none">Estado de Envío: <span className="text-emerald-700">200 OK</span></p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400 font-bold">Sin logs de Webhooks en cola</p>
                  <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto leading-normal">
                    Haz clic en el botón Ejecutar de alguna regla a la izquierda para testear.
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
              <span className="text-[10px] font-jakarta text-blue-700 font-bold block uppercase tracking-wider">Servidor de Automatización</span>
              <p className="text-[10.5px] text-slate-600 leading-relaxed mt-0.5">
                Las reglas se conectan a un pipeline distribuido por medio del cual se envían notificaciones push interactivas a iPhones/Androids y correos a la base CRM corporativa.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
