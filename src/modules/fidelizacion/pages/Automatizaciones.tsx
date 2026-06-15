import { useState, type FormEvent } from 'react';
import { Sparkles, Play, Pause, Trash2, Plus, Zap, Bell, Check, Gift, GitBranch } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import SectionRibbon from '@/platform/ui/SectionRibbon';

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

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        <SectionRibbon
          icon={GitBranch}
          title="Automatizaciones"
          description="Configura reglas inteligentes para campañas automatizadas de fidelización"
          badge="MOTOR COMPARTIDO GLOBAL"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/2 rounded-full filter blur-xl pointer-events-none" />

            <div className="space-y-3">
              {rules.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <p className="text-xs text-slate-400">No hay reglas de fidelización configuradas.</p>
                </div>
              ) : (
                rules.map(rule => (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      rule.isActive
                        ? 'bg-white border-slate-200 shadow-xs hover:border-blue-400'
                        : 'bg-slate-50/50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <h3 className="text-xs font-bold text-slate-800">{rule.name}</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pt-1 text-[11px]">
                        <p className="text-slate-500">
                          <strong className="text-slate-400 font-mono text-[9px] uppercase font-bold">Si ocurre:</strong> {rule.trigger}
                        </p>
                        <p className="text-slate-500">
                          <strong className="text-slate-400 font-mono text-[9px] uppercase font-bold">Acción:</strong> {rule.action}
                        </p>
                        <p className="sm:col-span-2 text-blue-600 font-semibold mt-0.5 flex items-center gap-1">
                          <Gift className="w-3.5 h-3.5 text-blue-500" />
                          Recompensa: {rule.reward}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center">
                      <div className="text-right mr-2 hidden sm:block">
                        <p className="text-[10px] text-slate-400 font-mono">Disparos total</p>
                        <p className="text-xs font-bold text-slate-700 font-mono">{rule.timesTriggered}</p>
                      </div>

                      <button type="button" title="Simular ejecución"
                        disabled={!rule.isActive || isRunningSim}
                        onClick={() => runSimulation(rule)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          rule.isActive
                            ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-500'
                            : 'bg-white border-slate-200 text-slate-400 !cursor-not-allowed'
                        }`}>
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
                ))
              )}
            </div>

            <form onSubmit={handleCreateRule} className="mt-6 pt-5 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-600" /> CREADOR VELOZ DE REGLAS DE CAMPAÑA
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
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800">
                  Auditor de Triggers en Vivo (Webhook Log)
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
              <span className="text-[9.5px] font-mono text-blue-700 font-bold block uppercase">Servidor de Automatización</span>
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
