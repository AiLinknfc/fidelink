import React, { useState } from 'react';
import {
  Wallet, Key, Coins, Shield, Clock, Sparkles, Camera, Star, Plus, Building,
  Users, Search, CheckCircle2, Clock3, FileText, TrendingUp, AlertCircle,
  Utensils, Flame, Coffee, Award,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { ApplicationState, Business, Employee, Tip, ScannedReceiptData, UserWallet, PuntosColombia } from '../types';
import { SEED_STATE, MOCK_RECEIPTS } from '../data/seed';
import WalletWidget from '../components/WalletWidget';

type NapiTab = 'dashboard' | 'wallet' | 'puntos' | 'comercios' | 'historial';
const VALID_TABS: NapiTab[] = ['dashboard', 'wallet', 'puntos', 'comercios', 'historial'];

const formatCOP = (val: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

function renderBusinessLogo(logo: string) {
  const c = (logo || '').trim();
  if (c === 'utensils') return <Utensils className="h-5 w-5 text-amber-600" />;
  if (c === 'sparkles') return <Sparkles className="h-5 w-5 text-amber-600" />;
  if (c === 'flame') return <Flame className="h-5 w-5 text-amber-600" />;
  if (c === 'coffee') return <Coffee className="h-5 w-5 text-amber-600" />;
  return <Award className="h-5 w-5 text-amber-600" />;
}

export default function NapilinkPage() {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const activeTab: NapiTab = (tab && VALID_TABS.includes(tab as NapiTab)) ? (tab as NapiTab) : 'dashboard';
  const setTab = (t: NapiTab) => navigate(`/napilink/${t}`);

  // ── STATE ──────────────────────────────────────────────────────────────────
  const [state, setState] = useState<ApplicationState>(() => {
    try {
      const s = localStorage.getItem('napilink_state');
      return s ? JSON.parse(s) : SEED_STATE;
    } catch { return SEED_STATE; }
  });

  const updateState = (next: ApplicationState) => {
    setState(next);
    localStorage.setItem('napilink_state', JSON.stringify(next));
  };

  // ── FORMS ──────────────────────────────────────────────────────────────────
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(state.employees[0]?.id || '');
  const [customTipAmount, setCustomTipAmount] = useState('');
  const [holdHours, setHoldHours] = useState(2);
  const [tipSource, setTipSource] = useState<'wallet' | 'points'>('wallet');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [searchText, setSearchText] = useState('');

  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [newBizName, setNewBizName] = useState('');
  const [newBizCategory, setNewBizCategory] = useState('Restaurante');
  const [newBizAddress, setNewBizAddress] = useState('');
  const [newBizLogo, setNewBizLogo] = useState('utensils');

  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('Mesero');
  const [newEmpBizId, setNewEmpBizId] = useState(state.businesses[0]?.id || '');
  const [newEmpBio, setNewEmpBio] = useState('');
  const [newEmpAlias, setNewEmpAlias] = useState('');

  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedReceiptData | null>(null);
  const [customReceiptText, setCustomReceiptText] = useState('');
  const [showScannerModal, setShowScannerModal] = useState(false);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // ── HELPERS ────────────────────────────────────────────────────────────────
  const showNotification = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // ── LOCAL HANDLERS ─────────────────────────────────────────────────────────
  const handleSendTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) { showNotification('Por favor selecciona un colaborador.', 'warning'); return; }
    const amt = parseFloat(customTipAmount);
    if (isNaN(amt) || amt <= 0) { showNotification('Por favor ingresa un monto válido.', 'warning'); return; }

    if (tipSource === 'wallet' && state.userWallet.balanceCOP < amt) {
      showNotification('Saldo insuficiente en tu billetera.', 'warning'); return;
    }
    const ptsCost = Math.ceil(amt / state.puntosColombia.conversionRate);
    if (tipSource === 'points' && (!state.puntosColombia.linked || state.puntosColombia.balance < ptsCost)) {
      showNotification('Puntos insuficientes para esta propina.', 'warning'); return;
    }

    const emp = state.employees.find(e => e.id === selectedEmployeeId)!;
    const biz = state.businesses.find(b => b.id === emp.businessId);
    const newTip: Tip = {
      id: `tip_${Date.now()}`,
      businessId: emp.businessId, employeeId: emp.id,
      employeeName: emp.name, businessName: biz?.name || 'Comercio',
      amountCOP: amt, source: tipSource,
      pointsUsed: tipSource === 'points' ? ptsCost : undefined,
      pointsPartner: tipSource === 'points' ? 'Puntos Colombia' : undefined,
      status: holdHours === 0 ? 'confirmed' : 'pending',
      holdHours, ratingGiven: rating, review: review || undefined,
      createdAt: new Date().toISOString(),
      unlockAt: new Date(Date.now() + holdHours * 3600 * 1000).toISOString(),
      transactionKeySignature: `sig_${Math.random().toString(36).slice(2, 22)}`,
    };

    const updatedEmployees = state.employees.map(e => {
      if (e.id !== emp.id || !rating) return e;
      const newCount = e.ratingsCount + 1;
      const newRating = Math.round(((e.rating * e.ratingsCount + rating) / newCount) * 100) / 100;
      return { ...e, rating: newRating, ratingsCount: newCount };
    });

    updateState({
      ...state,
      tips: [...state.tips, newTip],
      employees: updatedEmployees,
      userWallet: tipSource === 'wallet'
        ? { ...state.userWallet, balanceCOP: state.userWallet.balanceCOP - amt }
        : state.userWallet,
      puntosColombia: tipSource === 'points'
        ? { ...state.puntosColombia, balance: state.puntosColombia.balance - ptsCost }
        : state.puntosColombia,
    });

    setCustomTipAmount(''); setReview(''); setScannedData(null);
    showNotification(`Propina de ${formatCOP(amt)} enviada. Ventana de retractación: ${holdHours}h.`);
  };

  const handleRetractTip = (tipId: string) => {
    if (!confirm('¿Retractarse de esta propina? El dinero se devolverá inmediatamente.')) return;
    const tip = state.tips.find(t => t.id === tipId);
    if (!tip || tip.status !== 'pending') return;
    updateState({
      ...state,
      tips: state.tips.map(t => t.id === tipId ? { ...t, status: 'retracted' as const } : t),
      userWallet: tip.source === 'wallet'
        ? { ...state.userWallet, balanceCOP: state.userWallet.balanceCOP + tip.amountCOP }
        : state.userWallet,
      puntosColombia: tip.source === 'points' && tip.pointsUsed
        ? { ...state.puntosColombia, balance: state.puntosColombia.balance + tip.pointsUsed }
        : state.puntosColombia,
    });
    showNotification('Propina cancelada. Fondos devueltos.', 'info');
  };

  const handleConfirmTipEarly = (tipId: string) => {
    updateState({ ...state, tips: state.tips.map(t => t.id === tipId ? { ...t, status: 'confirmed' as const } : t) });
    showNotification('Propina confirmada y liberada al trabajador.', 'success');
  };

  const handleUpdateWallet = async (updated: Partial<UserWallet>) => {
    updateState({ ...state, userWallet: { ...state.userWallet, ...updated } });
  };

  const handleTopup = async (amount: number, _alias: string) => {
    updateState({ ...state, userWallet: { ...state.userWallet, balanceCOP: state.userWallet.balanceCOP + amount } });
    showNotification(`Recarga de ${formatCOP(amount)} procesada con tu firma Bre-B.`);
  };

  const handleUpdatePuntos = async (updated: Partial<PuntosColombia>) => {
    updateState({ ...state, puntosColombia: { ...state.puntosColombia, ...updated } });
    showNotification(updated.linked ? 'Puntos Colombia vinculados.' : 'Puntos Colombia desvinculados.');
  };

  const handleAddBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim()) return;
    const newBiz: Business = { id: `b_${Date.now()}`, name: newBizName, category: newBizCategory, address: newBizAddress, logo: newBizLogo };
    updateState({ ...state, businesses: [...state.businesses, newBiz] });
    setNewBizName(''); setNewBizAddress(''); setShowAddBusiness(false);
    showNotification(`Comercio ${newBizName} registrado.`);
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim() || !newEmpBizId) { showNotification('Especifica nombre y establecimiento.', 'warning'); return; }
    const aliasKey = newEmpAlias || `${newEmpName.toLowerCase().replace(/\s+/g, '.')}.@breb`;
    const newEmp: Employee = {
      id: `e_${Date.now()}`, name: newEmpName, role: newEmpRole, businessId: newEmpBizId,
      rating: 0, ratingsCount: 0, aliasKey, bio: newEmpBio,
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    };
    updateState({ ...state, employees: [...state.employees, newEmp] });
    setNewEmpName(''); setNewEmpBio(''); setNewEmpAlias(''); setShowAddEmployee(false);
    showNotification(`Colaborador ${newEmpName} registrado con alias ${aliasKey}.`);
  };

  // Receipt scanning — local mock (no Gemini backend needed)
  const handleScanPredefinedReceipt = (key: keyof typeof MOCK_RECEIPTS) => {
    setScanning(true);
    setTimeout(() => {
      const r = MOCK_RECEIPTS[key];
      const data: ScannedReceiptData = {
        businessName: r.businessName, totalAmount: r.totalAmount,
        currency: 'COP', date: new Date().toISOString().slice(0, 10),
        suggestedTips: { '8': Math.round(r.totalAmount * 0.08), '10': Math.round(r.totalAmount * 0.10), '15': Math.round(r.totalAmount * 0.15) },
      };
      setScannedData(data);
      setCustomTipAmount(data.suggestedTips['10'].toString());
      const matchBiz = state.businesses.find(b => b.name.toLowerCase().includes(r.businessName.toLowerCase().split(' ')[0].toLowerCase()));
      if (matchBiz) {
        const emp = state.employees.find(em => em.businessId === matchBiz.id);
        if (emp) setSelectedEmployeeId(emp.id);
      }
      setShowScannerModal(false);
      setScanning(false);
      showNotification(`Recibo: ${r.businessName} — Total: ${formatCOP(r.totalAmount)}`);
    }, 800);
  };

  const handleManualScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customReceiptText.trim()) return;
    setScanning(true);
    setTimeout(() => {
      const totalMatch = customReceiptText.match(/Total[^0-9]*([0-9][0-9.,]+)/i);
      const total = totalMatch ? parseFloat(totalMatch[1].replace(/\./g, '').replace(',', '.')) : 50000;
      const data: ScannedReceiptData = {
        businessName: 'Establecimiento Detectado', totalAmount: total,
        currency: 'COP', date: new Date().toISOString().slice(0, 10),
        suggestedTips: { '8': Math.round(total * 0.08), '10': Math.round(total * 0.10), '15': Math.round(total * 0.15) },
      };
      setScannedData(data);
      setCustomTipAmount(data.suggestedTips['10'].toString());
      setShowScannerModal(false);
      setScanning(false);
      showNotification('Recibo analizado. Sugerencias aplicadas al formulario.');
    }, 900);
  };

  // ── DERIVED ────────────────────────────────────────────────────────────────
  const filteredEmployees = state.employees.filter(e =>
    e.name.toLowerCase().includes(searchText.toLowerCase()) ||
    e.role.toLowerCase().includes(searchText.toLowerCase()) ||
    (state.businesses.find(b => b.id === e.businessId)?.name || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const totalLockedTips = state.tips.filter(t => t.status === 'pending').reduce((s, t) => s + t.amountCOP, 0);
  const totalConfirmedTips = state.tips.filter(t => t.status === 'confirmed').reduce((s, t) => s + t.amountCOP, 0);

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#f8fafc] text-slate-900 min-h-full font-sans">

      {/* Stats mini-bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 h-12 flex flex-row items-center justify-between gap-2 select-none overflow-hidden flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></div>
          <span className="font-mono font-semibold text-slate-800 placeholder:text-slate-400">{formatCOP(state.userWallet.balanceCOP)}</span>
          <span>Billetera</span>
        </div>
        {state.puntosColombia.linked && (
          <div className="flex items-center gap-1.5 text-pink-600 font-semibold">
            <Coins className="h-3.5 w-3.5" />
            <span>{state.puntosColombia.balance.toLocaleString()} pts</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-amber-600">
          <Shield className="h-3.5 w-3.5" />
          <span className="font-sans font-medium">Conexión Segura Bre-B Activa</span>
        </div>
      </div>

      {/* Notification toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-white border-l-4 border-yellow-400 text-slate-800 p-3 px-5 text-xs flex items-center justify-between shadow-xl rounded-r-xl max-w-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-ping flex-shrink-0"></div>
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-500 hover:text-slate-800 ml-4 font-bold">✕</button>
        </div>
      )}

      <div className="p-6">

        {/* ── DASHBOARD ──────────────────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-12 gap-6 items-start">

            {/* COL 1 — Escanear recibo + Formulario propina */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">

              {/* Widget escanear recibo */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-xs tracking-wider text-slate-500 uppercase">Escanear Recibo / POS</h2>
                  <span className="text-[9px] bg-yellow-100 text-amber-800 p-0.5 px-2 rounded-full uppercase font-bold">Auto-OCR IA</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">Toma una foto de la factura para calcular automáticamente la propina recomendada.</p>

                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-white shadow-sm border border-slate-200 rounded-full flex items-center justify-center mb-2.5 text-slate-400">
                    <Camera className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 placeholder:text-slate-400 block">Escanear Factura</span>
                  <div className="mt-3 w-full space-y-1.5">
                    <p className="text-[10px] text-slate-400">Simula escaneo rápido de restaurantes registrados:</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['crepes', 'andres', 'salberto'] as const).map(k => (
                        <button key={k} type="button" onClick={() => handleScanPredefinedReceipt(k)} disabled={scanning}
                          className="bg-white border border-slate-200 text-[10px] py-1 px-1 rounded-md hover:border-yellow-400 transition text-slate-600 truncate font-semibold">
                          {k === 'crepes' ? 'Crepes Usaquén' : k === 'andres' ? 'Andrés Chía' : 'Café S.Alberto'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="button" onClick={() => { setCustomReceiptText(''); setShowScannerModal(true); }}
                    className="mt-3.5 text-[10px] font-bold text-amber-600 hover:text-amber-700 bg-yellow-400/10 px-3 py-1.5 rounded-lg w-full">
                    Copiar ticket manualmente...
                  </button>
                </div>

                {scannedData && (
                  <div className="mt-4 p-3.5 bg-yellow-50/70 border border-yellow-200 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-yellow-200">
                      <span className="font-bold text-slate-800">{scannedData.businessName}</span>
                      <button onClick={() => setScannedData(null)} className="text-slate-400 hover:text-red-500">✕</button>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Valor Cuenta:</span>
                      <span className="font-bold text-slate-800">{formatCOP(scannedData.totalAmount)}</span>
                    </div>
                    <div className="pt-1.5 border-t border-yellow-200 space-y-1">
                      <span className="text-[10px] text-slate-500 font-semibold block">Sugerencias de Propinas:</span>
                      <div className="grid grid-cols-3 gap-1">
                        {(['8', '10', '15'] as const).map(pct => (
                          <button key={pct} onClick={() => setCustomTipAmount(scannedData.suggestedTips[pct].toString())}
                            className="bg-white hover:bg-yellow-400 hover:text-slate-900 p-1 text-center rounded border border-slate-200 text-[10px] font-bold text-slate-800 placeholder:text-slate-400">
                            <div>{pct}%</div>
                            <div className="font-mono">{formatCOP(scannedData.suggestedTips[pct])}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Formulario propina */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h2 className="font-bold text-xs tracking-wider text-slate-500 uppercase mb-3.5">Asignación Rápida de Propina</h2>
                <form onSubmit={handleSendTip} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-800 placeholder:text-slate-400 block mb-1">Buscar y Seleccionar Trabajador</label>
                    <div className="relative">
                      <input type="text" placeholder="Filtra por nombre o comercio..." value={searchText} onChange={e => setSearchText(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-yellow-400 mb-2" />
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <select value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)} required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-yellow-400">
                      {filteredEmployees.map(emp => {
                        const biz = state.businesses.find(b => b.id === emp.businessId);
                        return <option key={emp.id} value={emp.id}>{emp.name} ({emp.role}) • {biz?.name || 'Establecimiento'}</option>;
                      })}
                      {filteredEmployees.length === 0 && <option value="">No hay coincidencias...</option>}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-800 placeholder:text-slate-400 block mb-1">Monto (COP)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                        <input type="number" placeholder="Monto" value={customTipAmount} onChange={e => setCustomTipAmount(e.target.value)} required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-yellow-400 font-mono" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-800 placeholder:text-slate-400 block mb-1">Medio de Pago</label>
                      <select value={tipSource} onChange={e => setTipSource(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-yellow-400">
                        <option value="wallet">Billetera Bre-B</option>
                        {state.puntosColombia.linked && <option value="points">Puntos Colombia</option>}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-800 placeholder:text-slate-400 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" /> Confirmación en Espera
                      </label>
                      <span className="text-[10px] text-amber-600 font-bold">Evita Presión Social</span>
                    </div>
                    <select value={holdHours} onChange={e => setHoldHours(parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-yellow-400">
                      <option value={2}>Cola de Retención: 2 Horas</option>
                      <option value={6}>Cola de Retención: 6 Horas</option>
                      <option value={12}>Cola de Retención: 12 Horas</option>
                      <option value={24}>Cola de Retención: 24 Horas (Máxima seguridad)</option>
                      <option value={0}>Instantáneo Sin Retractarse</option>
                    </select>
                    <p className="text-[10px] text-slate-400 leading-tight mt-1.5">
                      El dinero quedará en escrow temporal. Podrás reclamarlo si cambias de opinión.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-xs font-semibold text-slate-800 placeholder:text-slate-400 block mb-1">Calificar Servicio</label>
                      <div className="flex items-center gap-1.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button type="button" key={s} onClick={() => setRating(s)} className="focus:outline-none hover:scale-110 transition">
                            <Star className={`h-4 w-4 ${rating >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 flex flex-col justify-center">
                      <span>PAGO ENCRIPTADO CON</span>
                      <span className="font-mono text-slate-600 font-semibold">{state.userWallet.publicKey.slice(0, 16)}...</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-800 placeholder:text-slate-400 block mb-1">Feedback de motivación</label>
                    <textarea rows={2} placeholder="Mensaje de apoyo para el colaborador..." value={review} onChange={e => setReview(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-yellow-400" />
                  </div>

                  <button type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 font-bold text-xs py-2.5 rounded-xl transition text-white flex items-center justify-center gap-2 shadow-sm">
                    <Shield className="h-4 w-4 text-yellow-400" /> Firmar & Enviar Propina Programada
                  </button>
                </form>
              </div>
            </div>

            {/* COL 2 — Propinas en espera + Plataformas */}
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[400px]">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50 rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></span>
                    <h2 className="font-bold text-slate-800 text-sm font-sans uppercase tracking-wide">Propinas en Espera (Garantía)</h2>
                  </div>
                  <span className="text-[9px] bg-amber-100 text-amber-800 font-bold uppercase tracking-wider px-2 py-0.5 rounded">Retracto Activo</span>
                </div>

                <div className="flex-1 p-5 flex flex-col">
                  <p className="text-xs text-slate-500 leading-normal mb-4">
                    Las siguientes transacciones están retenidas en nuestra pasarela. Tienes control de retractarte o validar el monto hasta que expire el plazo.
                  </p>

                  {state.tips.filter(t => t.status === 'pending').length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-100 rounded-2xl bg-slate-50/40">
                      <Clock className="h-10 w-10 text-slate-300 mb-2.5" />
                      <span className="text-xs font-bold text-slate-600 block">No tienes propinas retenidas</span>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-[240px]">Todas las transacciones han expirado positivamente.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {state.tips.filter(t => t.status === 'pending').map(tip => (
                        <div key={tip.id} className="p-4 border border-slate-200 rounded-xl relative overflow-hidden bg-white hover:shadow-sm transition">
                          <div className="absolute top-0 right-0 h-1 bg-amber-400 w-2/3" />
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="text-xs font-extrabold text-slate-800">{tip.businessName}</div>
                              <div className="text-[11px] text-slate-500">Colaborador: {tip.employeeName}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold font-mono text-slate-900">{formatCOP(tip.amountCOP)}</div>
                              <span className="px-1.5 py-0.5 bg-pink-500/10 text-pink-500 text-[9px] font-bold rounded uppercase block font-mono mt-1">
                                {tip.source === 'points' ? `${tip.pointsUsed} pts` : 'Caja Virtual'}
                              </span>
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-400 flex justify-between bg-slate-50 px-2 py-1 rounded-md mb-3 font-mono">
                            <span>Enviado: {new Date(tip.createdAt).toLocaleTimeString()}</span>
                            <span className="text-amber-600 font-bold">Desbloquea: {new Date(tip.unlockAt).toLocaleTimeString()}</span>
                          </div>
                          {tip.review && (
                            <p className="text-[10px] italic text-slate-500 bg-slate-50/50 p-2 rounded border border-slate-100 mb-3">&ldquo;{tip.review}&rdquo;</p>
                          )}
                          <div className="flex gap-2">
                            <button onClick={() => handleConfirmTipEarly(tip.id)}
                              className="flex-1 bg-slate-900 text-white text-[10px] font-semibold py-1.5 rounded-lg hover:bg-slate-800 transition">
                              Confirmar Ahora
                            </button>
                            <button onClick={() => handleRetractTip(tip.id)}
                              className="flex-1 bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold py-1.5 rounded-lg hover:bg-red-100 transition">
                              Retractarse (Anular)
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 bg-yellow-400/5 p-3 rounded-xl border border-yellow-200/20 text-[10px] text-slate-500 flex items-start gap-2">
                    <Shield className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800 placeholder:text-slate-400 block">¿Por qué usar retractación?</span>
                      Facilita un desahogo psicológico al dar propina. Si cambias de opinión, anula la transacción.
                    </div>
                  </div>
                </div>
              </div>

              {/* Plataformas asociadas */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h2 className="font-bold text-xs tracking-wider text-slate-500 uppercase mb-3.5">Plataformas Asociadas</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-blue-50/80 border border-blue-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">PC</div>
                      <div>
                        <div className="text-xs font-bold text-blue-900">Puntos Colombia</div>
                        <p className="text-[10px] text-blue-700">Éxito, Carulla u otros comercios.</p>
                      </div>
                    </div>
                    <button onClick={() => setTab('puntos')} className="text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg transition">Gestionar</button>
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-yellow-50/80 border border-yellow-200/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#f8f80b] border border-yellow-300 rounded-lg flex items-center justify-center text-slate-950 text-xs font-extrabold">B-B</div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">Llaves Bre-B Interbancarias</div>
                        <p className="text-[10px] text-slate-600">Procesamiento inmediato con tu banco favorito.</p>
                      </div>
                    </div>
                    <button onClick={() => setTab('wallet')} className="text-[10px] font-bold bg-yellow-400 hover:bg-yellow-500 text-slate-950 px-2.5 py-1.5 rounded-lg transition">Ver Llaves</button>
                  </div>
                </div>
              </div>
            </div>

            {/* COL 3 — Métricas + Personal */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none" />
                <h2 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-3.5">Impacto en Propinas</h2>
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-2xl font-black font-mono tracking-tight text-white">{formatCOP(totalConfirmedTips)}</span>
                  <span className="text-[10px] text-yellow-400 bg-yellow-400/10 p-0.5 px-2 rounded-full font-bold">Mes en Curso</span>
                </div>
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">En Escrow:</span>
                    <span className="font-bold text-amber-400 font-mono">{formatCOP(totalLockedTips)}</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-yellow-400 h-full rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400">Calificación:</span>
                    <span className="text-amber-600 font-bold flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                      {state.employees.length > 0
                        ? (state.employees.reduce((s, e) => s + e.rating, 0) / state.employees.length).toFixed(2)
                        : '—'} Prom.
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">Servicio Destacado</h2>
                  <span className="text-[9px] font-bold text-amber-600 uppercase">Personal Activo</span>
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {state.employees.map(emp => {
                    const biz = state.businesses.find(b => b.id === emp.businessId);
                    return (
                      <div key={emp.id} className="flex items-center gap-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                        <img src={emp.photo} alt={emp.name} className="w-10 h-10 object-cover rounded-full border border-slate-200" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-800 block truncate">{emp.name}</span>
                          <span className="text-[10px] text-slate-500 block truncate">{emp.role} • {biz?.name || 'Comercio'}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-[10px] text-slate-600 font-bold">{emp.rating || '—'}</span>
                            <span className="text-[9px] text-slate-400">({emp.ratingsCount} votos)</span>
                          </div>
                        </div>
                        <button onClick={() => { setSelectedEmployeeId(emp.id); setTab('dashboard'); }}
                          className="text-[10px] font-semibold text-amber-700 bg-yellow-50 hover:bg-yellow-100 p-1 px-2.5 rounded-lg transition">
                          Dar...
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button onClick={() => setTab('comercios')} className="w-full py-1.5 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition">
                    Ver Personal y Comercios
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── WALLET ─────────────────────────────────────────────────────────── */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-800 mb-2">Administrar tu Billetera Digital Encriptada</h2>
              <p className="text-xs text-slate-500 max-w-2xl mb-6">
                Registra llaves del estándar Bre-B bajo encriptación SHA-256 para recargar tu monedero instantáneamente de cualquier entidad bancaria de Colombia.
              </p>
              <WalletWidget wallet={state.userWallet} puntosCol={state.puntosColombia}
                onUpdateWallet={handleUpdateWallet} onUpdatePuntos={handleUpdatePuntos} onTopUp={handleTopup} />
            </div>

            <div className="bg-white text-slate-800 rounded-3xl p-6 border border-slate-200 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />
              <h3 className="text-sm font-bold font-sans uppercase tracking-wider mb-2 text-amber-600">Simulación del Ecosistema de Pago Bre-B</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-3xl mb-4">
                El protocolo Bre-B unifica cuentas bancarias en Colombia a partir de llaves lógicas. Firma de Llave Pública activa:{' '}
                <span className="font-mono text-slate-800 placeholder:text-slate-400 text-[11.5px] font-bold bg-slate-100 px-1.5 py-0.5 rounded">{state.userWallet.publicKey}</span>
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                  { icon: <Building className="mx-auto h-5 w-5 text-amber-500 mb-1" />, title: '1. Registra tu Alias', desc: 'Crea tu identificador rápido en segundos.' },
                  { icon: <Key className="mx-auto h-5 w-5 text-amber-500 mb-1" />, title: '2. Generación RSA', desc: 'Se encripta tu conexión interbancaria.' },
                  { icon: <Coins className="mx-auto h-5 w-5 text-amber-500 mb-1" />, title: '3. Carga Fondos', desc: 'Debita de tu banco de forma veloz.' },
                  { icon: <Clock className="mx-auto h-5 w-5 text-amber-500 mb-1" />, title: '4. Custodia Hold', desc: 'Retienes el desembolso por la ventana elegida.' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-sm">
                    {icon}
                    <span className="text-xs font-bold block text-slate-800 placeholder:text-slate-400">{title}</span>
                    <p className="text-[10px] text-slate-400 mt-1">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PUNTOS ─────────────────────────────────────────────────────────── */}
        {activeTab === 'puntos' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-pink-50 text-pink-500 rounded-2xl"><Coins className="h-6 w-6" /></div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Programa de Lealtad (Puntos Colombia)</h2>
                  <p className="text-xs text-slate-500">¿Tienes puntos en Éxito, Carulla o Bancolombia? ¡Conviértelos en propinas directas!</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="md:col-span-1 bg-pink-50 border border-pink-100 text-pink-950 rounded-2xl p-5 text-center flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-pink-700 block mb-1 font-semibold uppercase tracking-wider">Mi Cuenta Puntos Colombia</span>
                    {state.puntosColombia.linked ? (
                      <div className="space-y-3 py-4">
                        <span className="text-4xl font-extrabold font-sans text-pink-600 block">{state.puntosColombia.balance.toLocaleString()}</span>
                        <span className="text-xs text-pink-800 block font-medium">puntos disponibles para canjear</span>
                        <div className="bg-white font-mono text-[11px] p-2 rounded-xl text-pink-600 border border-pink-200">ID: {state.puntosColombia.accountNumber}</div>
                      </div>
                    ) : (
                      <div className="py-6 italic text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-white p-4">
                        Vincúlalos desde la Billetera o el botón de enlace.
                      </div>
                    )}
                  </div>
                  <div className="border-t border-pink-100 pt-3 mt-4 flex items-center justify-between text-[11px] text-pink-700">
                    <span>Conversión:</span>
                    <span className="font-bold text-pink-600">1 punto = $7 Pesos COP</span>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">¿Cómo funciona el canje para propinas?</h3>
                  <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                    <p><strong>1. Alianza Nacional:</strong> Napilink se asocia con las APIs del sistema multibanco. Tus puntos se debitan al instante en que se vence el tiempo de confirmación.</p>
                    <p><strong>2. Transparente para el Empleado:</strong> El mesero siempre recibirá el dinero en Pesos Colombianos directo a su alias Bre-B.</p>
                    <p><strong>3. Devolución Fina:</strong> Si aplicas el retracto, los puntos regresan automáticamente a tu monedero sin penalizaciones.</p>
                  </div>
                  <div className="pt-4 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-bounce"></span>
                    <span className="text-xs font-bold text-slate-800">¡Muy pronto: LifeMiles, RappiCréditos y Puntos Tu360!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── COMERCIOS ──────────────────────────────────────────────────────── */}
        {activeTab === 'comercios' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Administración de Nóminas, Comercios y Colaboradores</h3>
                <p className="text-xs text-slate-500">Registra empresas asociadas para gestionar propinas e incentivos directos.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAddBusiness(true)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Registrar Comercio
                </button>
                <button onClick={() => { if (state.businesses.length === 0) { showNotification('Primero registra un comercio.', 'warning'); return; } setNewEmpBizId(state.businesses[0].id); setShowAddEmployee(true); }}
                  className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Registrar Colaborador
                </button>
              </div>
            </div>

            {state.businesses.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <AlertCircle className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No hay comercios registrados</p>
                <button onClick={() => setShowAddBusiness(true)} className="text-xs text-amber-600 hover:underline font-bold">Registrar primer comercio →</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.businesses.map(biz => {
                  const bizEmps = state.employees.filter(e => e.businessId === biz.id);
                  return (
                    <div key={biz.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                      <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-xl">{renderBusinessLogo(biz.logo)}</div>
                          <div>
                            <span className="text-sm font-black text-slate-800 block truncate">{biz.name}</span>
                            <span className="text-[10.5px] text-slate-500 block">{biz.category}</span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-800 placeholder:text-slate-400 font-bold rounded px-2 py-0.5">ID: {biz.id}</span>
                      </div>
                      <div className="space-y-1 text-xs text-slate-500">
                        <div className="flex justify-between"><span>Ubicación:</span><span className="font-semibold text-slate-800 placeholder:text-slate-400 text-right max-w-[150px] truncate">{biz.address}</span></div>
                        <div className="flex justify-between"><span>Trabajadores:</span><span className="font-bold text-slate-800">{bizEmps.length} activos</span></div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Plantilla de Personal:</span>
                        {bizEmps.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic">No hay trabajadores aún.</p>
                        ) : (
                          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                            {bizEmps.map(emp => (
                              <div key={emp.id} className="flex justify-between items-center bg-slate-50 border border-slate-150 p-2 rounded-xl text-xs">
                                <div className="flex items-center gap-2">
                                  <img src={emp.photo} alt={emp.name} className="w-7 h-7 rounded-full object-cover" />
                                  <div>
                                    <span className="font-bold text-slate-800 block">{emp.name}</span>
                                    <span className="text-[9px] text-slate-500">{emp.role}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-amber-500 font-bold block">★ {emp.rating || '—'}</span>
                                  <button onClick={() => { setSelectedEmployeeId(emp.id); setTab('dashboard'); }}
                                    className="text-[9px] font-bold text-amber-600 hover:underline">Dar Propina</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── HISTORIAL ──────────────────────────────────────────────────────── */}
        {activeTab === 'historial' && (
          <div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Trazabilidad de Propinas Enviadas</h2>
                  <p className="text-xs text-slate-500">Listado de tus transacciones cifradas bajo el protocolo Bre-B.</p>
                </div>
                <span className="px-3 py-1.5 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl">Total: {state.tips.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold">
                      {['Establecimiento / Trabajador', 'Monto COP', 'Medio de Pago', 'Fecha', 'Firma Bre-B', 'Rating', 'Estado'].map(h => (
                        <th key={h} className="py-3 px-4 uppercase tracking-widest text-[10px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {state.tips.map(tip => (
                      <tr key={tip.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-slate-800 block">{tip.businessName}</span>
                          <span className="text-[11px] text-slate-500">Colaborador: {tip.employeeName}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold font-mono text-slate-900">{formatCOP(tip.amountCOP)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tip.source === 'wallet' ? 'bg-amber-100 text-amber-800' : 'bg-pink-100 text-pink-800'}`}>
                            {tip.source === 'wallet' ? 'Billetera Bre-B' : `Points (${tip.pointsUsed} pts)`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{new Date(tip.createdAt).toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-center font-mono text-[10.5px] text-slate-400">
                          <span title={tip.transactionKeySignature}>{tip.transactionKeySignature.slice(0, 14)}...</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {tip.ratingGiven ? (
                            <div className="flex items-center justify-center gap-0.5 text-amber-500 font-bold">
                              <span>{tip.ratingGiven}</span><Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            </div>
                          ) : <span className="text-slate-400">—</span>}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {tip.status === 'confirmed' && <span className="bg-yellow-100 text-amber-800 px-2 py-0.5 rounded font-extrabold text-[10px] uppercase">Confirmado</span>}
                          {tip.status === 'pending' && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-extrabold text-[10px] uppercase animate-pulse">En Espera</span>}
                          {tip.status === 'retracted' && <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-extrabold text-[10px] uppercase">Retractado</span>}
                        </td>
                      </tr>
                    ))}
                    {state.tips.length === 0 && (
                      <tr><td colSpan={7} className="py-8 text-center text-slate-400 italic">No has enviado ninguna propina aún.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Napilink */}
      <div className="h-10 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-between text-[10px] text-slate-400 mt-6 select-none">
        <div className="flex gap-6 items-center font-jakarta font-semibold tracking-wide">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
            CONSORCIO CO-BOG-01 ACTIVO
          </span>
          <span>ENCRYPT: AES-GCM-256</span>
          <span>VERIFIED BY BRE-B CO</span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="font-mono text-slate-500">sha256:{state.userWallet.publicKey.slice(12, 30)}</span>
          <span className="font-jakarta font-bold text-slate-600">NAPILINK STABLE v3.0</span>
        </div>
      </div>

      {/* ── MODAL REGISTRAR COMERCIO ──────────────────────────────────────── */}
      {showAddBusiness && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold font-sans text-slate-800 mb-3 flex items-center gap-2">
              <Building className="h-5 w-5 text-amber-500" /> Registrar Establecimiento Comercial
            </h3>
            <form onSubmit={handleAddBusiness} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-800 placeholder:text-slate-400 block mb-1">Nombre Comercial</label>
                <input type="text" required placeholder="Ej: Wok (Zona T)" value={newBizName} onChange={e => setNewBizName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-yellow-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-800 placeholder:text-slate-400 block mb-1">Categoría</label>
                  <select value={newBizCategory} onChange={e => setNewBizCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-yellow-400">
                    {['Restaurante', 'Gourmet', 'Bar', 'Cafetería', 'Almacén'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-800 placeholder:text-slate-400 block mb-1">Logo</label>
                  <select value={newBizLogo} onChange={e => setNewBizLogo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-yellow-400">
                    {[['utensils','Cubiertos'],['sparkles','Alta Cocina'],['flame','Parrilla'],['coffee','Cafetería'],['award','Premium']].map(([v,l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-800 placeholder:text-slate-400 block mb-1">Dirección / Sede</label>
                <input type="text" required placeholder="Ej: Cra 11 # 82-01, Bogotá" value={newBizAddress} onChange={e => setNewBizAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-yellow-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddBusiness(false)} className="flex-1 py-2 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition">Cancelar</button>
                <button type="submit" className="flex-1 py-2 rounded-xl text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold transition">Registrar Comercio</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL REGISTRAR COLABORADOR ───────────────────────────────────── */}
      {showAddEmployee && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold font-sans text-slate-800 mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" /> Registrar Colaborador en Nómina
            </h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-800 placeholder:text-slate-400 block mb-1">Nombre Completo</label>
                <input type="text" required placeholder="Ej: Felipe Alarcón" value={newEmpName} onChange={e => setNewEmpName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-yellow-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-800 placeholder:text-slate-400 block mb-1">Puesto / Rol</label>
                  <input type="text" required placeholder="Ej: Barista Maestro" value={newEmpRole} onChange={e => setNewEmpRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-800 placeholder:text-slate-400 block mb-1">Establecimiento</label>
                  <select value={newEmpBizId} onChange={e => setNewEmpBizId(e.target.value)} required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-yellow-400">
                    {state.businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-800 placeholder:text-slate-400 block mb-1">Alias Bre-B del Trabajador</label>
                <input type="text" placeholder="Ej: felipe.barista@breb" value={newEmpAlias} onChange={e => setNewEmpAlias(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-yellow-400 font-mono" />
                <span className="text-[10px] text-slate-400 mt-1 block">Dejar en blanco para alias automático.</span>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-800 placeholder:text-slate-400 block mb-1">Pequeña biografía</label>
                <textarea rows={2} placeholder="Ej: Amante del buen trato..." value={newEmpBio} onChange={e => setNewEmpBio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-yellow-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddEmployee(false)} className="flex-1 py-2 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition">Cancelar</button>
                <button type="submit" className="flex-1 py-2 rounded-xl text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold transition">Confirmar Contratación</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL ESCANEAR TEXTO OCR ──────────────────────────────────────── */}
      {showScannerModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-base font-bold font-sans text-slate-800 flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" /> Simulador OCR Manual
              </h3>
              <button onClick={() => setShowScannerModal(false)} className="text-slate-400 hover:text-slate-600 font-semibold text-lg">✕</button>
            </div>
            <p className="text-xs text-slate-500 mb-4">Inserta el contenido textual del recibo para calcular la propina.</p>
            <form onSubmit={handleManualScanSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-800 placeholder:text-slate-400 block mb-1">Contenido de la Factura</label>
                <textarea rows={6} required
                  placeholder={`Ejemplo:\nCREPES & WAFFLES BOGOTA\nMesa 12\n1 Crepe de Pollo: 24,000\nTotal Factura COP: 64,500`}
                  value={customReceiptText} onChange={e => setCustomReceiptText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-yellow-400 font-mono leading-relaxed" />
              </div>
              <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-3.5 text-[11px] text-slate-600 flex items-start gap-2 leading-relaxed">
                <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span><strong>OCR Local:</strong> Detecta el total en COP del texto y calcula sugerencias de 8%, 10% y 15% de propina.</span>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowScannerModal(false)} className="flex-grow py-2 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition">Cancelar</button>
                <button type="submit" disabled={scanning}
                  className="flex-grow py-2 rounded-xl text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold transition flex items-center justify-center gap-1.5">
                  {scanning ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    : <><CheckCircle2 className="h-4 w-4" /> Analizar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
