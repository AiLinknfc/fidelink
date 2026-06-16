import React, { useState } from 'react';
import { Wallet, Key, Link as LinkIcon, Plus, Trash2, Coins, ArrowUpRight, HelpCircle, Shield } from 'lucide-react';
import { UserWallet, PuntosColombia, LinkedKey } from '../types';

interface WalletWidgetProps {
  wallet: UserWallet;
  puntosCol: PuntosColombia;
  onUpdateWallet: (updated: Partial<UserWallet>) => Promise<void>;
  onUpdatePuntos: (updated: Partial<PuntosColombia>) => Promise<void>;
  onTopUp: (amount: number, alias: string) => Promise<void>;
}

const formatCOP = (val: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

export default function WalletWidget({ wallet, puntosCol, onUpdateWallet, onUpdatePuntos, onTopUp }: WalletWidgetProps) {
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('20000');
  const [selectedAlias, setSelectedAlias] = useState(wallet.linkedKeys[0]?.alias || '');
  const [loading, setLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyType, setNewKeyType] = useState('Celular');
  const [newKeyAlias, setNewKeyAlias] = useState('');
  const [isLinkingPuntos, setIsLinkingPuntos] = useState(false);
  const [puntosAccount, setPuntosAccount] = useState(puntosCol.accountNumber);
  const [puntosFormBalance, setPuntosFormBalance] = useState('8000');

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyAlias.trim()) return;
    const newKey: LinkedKey = {
      id: 'k_' + Date.now().toString(36), type: newKeyType,
      alias: newKeyAlias.trim(), provider: 'Bre-B', active: true,
    };
    setLoading(true);
    await onUpdateWallet({ linkedKeys: [...wallet.linkedKeys, newKey] });
    setLoading(false);
    setNewKeyAlias('');
    setShowKeyModal(false);
  };

  const handleDeleteKey = async (keyId: string) => {
    await onUpdateWallet({ linkedKeys: wallet.linkedKeys.filter(k => k.id !== keyId) });
  };

  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(topupAmount);
    if (isNaN(amt) || amt <= 0) return;
    setLoading(true);
    await onTopUp(amt, selectedAlias);
    setLoading(false);
    setShowTopupModal(false);
  };

  const handleLinkPuntosSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onUpdatePuntos({ linked: true, accountNumber: puntosAccount, balance: parseInt(puntosFormBalance) || 0 });
    setLoading(false);
    setIsLinkingPuntos(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* BILLETERA DIGITAL */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 relative overflow-hidden flex flex-col justify-between shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-yellow-400/10 text-amber-600 rounded-xl"><Wallet className="h-6 w-6" /></div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Tu Balance Digital</span>
                <span className="text-2xl font-bold font-sans tracking-tight text-slate-900">{formatCOP(wallet.balanceCOP)}</span>
              </div>
            </div>
            <button
              onClick={() => { if (wallet.linkedKeys.length > 0) setSelectedAlias(wallet.linkedKeys[0].alias); setShowTopupModal(true); }}
              className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-1 shadow-sm"
            >
              <ArrowUpRight className="h-3.5 w-3.5" /> Recargar COP
            </button>
          </div>
          <div className="border-t border-slate-100 pt-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-amber-600" /> Mis Llaves Bre-B
              </span>
              <button onClick={() => setShowKeyModal(true)} className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 transition">
                <Plus className="h-3.5 w-3.5" /> Registrar Llave
              </button>
            </div>
            {wallet.linkedKeys.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No has registrado llaves. Agrega una para recargar rápido.</p>
            ) : (
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {wallet.linkedKeys.map(k => (
                  <div key={k.id} className="flex justify-between items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-yellow-400/10 text-amber-700 font-bold rounded text-[9px] uppercase">{k.type}</span>
                      <span className="font-mono text-slate-700 text-xs font-medium">{k.alias}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">Encriptado</span>
                      <button onClick={() => handleDeleteKey(k.id)} className="text-slate-400 hover:text-red-500 transition p-1" title="Eliminar llave">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-amber-500" />
            <span>Firma Criptográfica Bre-B Activa</span>
          </div>
          <span className="font-mono text-slate-400 truncate max-w-[130px]">{wallet.publicKey}</span>
        </div>
      </div>

      {/* PUNTOS COLOMBIA */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 relative overflow-hidden flex flex-col justify-between shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-pink-500/10 text-pink-500 rounded-xl"><Coins className="h-6 w-6" /></div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Aliado: Puntos Colombia</span>
                {puntosCol.linked ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-sans tracking-tight text-slate-900">{puntosCol.balance.toLocaleString()}</span>
                    <span className="text-xs text-pink-500 font-semibold">pts</span>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-slate-400 block">No Vinculado</span>
                )}
              </div>
            </div>
            {puntosCol.linked ? (
              <button onClick={() => onUpdatePuntos({ linked: false })} className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 font-bold text-xs text-pink-600 rounded-lg transition">
                Desvincular
              </button>
            ) : (
              <button onClick={() => { setPuntosAccount(puntosCol.accountNumber); setIsLinkingPuntos(true); }}
                className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 shadow-sm animate-pulse">
                <LinkIcon className="h-3.5 w-3.5" /> Vincular Ahora
              </button>
            )}
          </div>
          <div className="border-t border-slate-100 pt-4 mt-4">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs space-y-2">
              <div className="flex justify-between text-slate-500">
                <span>Cuenta Asociada:</span>
                <span className="font-mono text-slate-700">{puntosCol.linked ? puntosCol.accountNumber : 'Ninguna'}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Valor de Canje:</span>
                <span className="font-semibold text-amber-600">1 Punto = $7 COP</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Equivalencia:</span>
                <span className="font-bold text-slate-800">{puntosCol.linked ? formatCOP(puntosCol.balance * puntosCol.conversionRate) : '$0 COP'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-[10px] text-slate-400 flex items-center gap-1">
          <HelpCircle className="h-3.5 w-3.5 text-pink-400" />
          <span>Puedes pagar propinas con tus puntos de comercios aliados.</span>
        </div>
      </div>

      {/* MODAL REGISTRAR LLAVE */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold font-sans text-slate-800 mb-4 flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-500" /> Registrar Llave Bre-B
            </h3>
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1 font-semibold">Tipo de Llave</label>
                <select value={newKeyType} onChange={e => setNewKeyType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-yellow-400">
                  <option value="Celular">Celular (+57)</option>
                  <option value="Cédula">Cédula de Ciudadanía</option>
                  <option value="E-Mail">Correo Electrónico</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1 font-semibold">Alías / Valor</label>
                <input type="text" required placeholder={newKeyType === 'Celular' ? '3154567890' : newKeyType === 'Cédula' ? '1020304050' : 'tu@correo.com'}
                  value={newKeyAlias} onChange={e => setNewKeyAlias(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-yellow-400 font-mono" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowKeyModal(false)} className="flex-1 py-2 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 py-2 rounded-xl text-xs bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold transition">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RECARGAR */}
      {showTopupModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold font-sans text-slate-800 mb-3 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-amber-500" /> Recargar Billetera Digital
            </h3>
            {wallet.linkedKeys.length === 0 ? (
              <div className="text-center p-4">
                <p className="text-sm text-amber-600 mb-3 font-semibold">Primero debes registrar una llave Bre-B</p>
                <button onClick={() => { setShowTopupModal(false); setShowKeyModal(true); }}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold text-xs rounded-xl">
                  Registrar Llave
                </button>
              </div>
            ) : (
              <form onSubmit={handleTopupSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-1 font-semibold">Llave Bre-B para Cobro</label>
                  <select value={selectedAlias} onChange={e => setSelectedAlias(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-yellow-400 font-mono">
                    {wallet.linkedKeys.map(k => <option key={k.id} value={k.alias}>{k.type}: {k.alias}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1 font-semibold">Monto (COP)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-semibold">$</span>
                    <input type="number" required min="5000" step="1000" value={topupAmount} onChange={e => setTopupAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-yellow-400 font-bold" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {['10000', '20000', '50000', '100000'].map(p => (
                      <button key={p} type="button" onClick={() => setTopupAmount(p)}
                        className="px-2 py-1 bg-slate-100 border border-slate-200 hover:border-yellow-400 rounded text-[11px] text-slate-600 font-mono">
                        +{p.slice(0, -3)}k
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowTopupModal(false)} className="flex-1 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition">Cancelar</button>
                  <button type="submit" disabled={loading} className="flex-1 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold text-xs transition">Confirmar Recarga</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL VINCULAR PUNTOS */}
      {isLinkingPuntos && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold font-sans text-slate-800 mb-3 flex items-center gap-2">
              <Coins className="h-5 w-5 text-pink-500" /> Vincular Puntos Colombia
            </h3>
            <form onSubmit={handleLinkPuntosSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1 font-semibold">Número de Cuenta Puntos Colombia</label>
                <input type="text" required placeholder="9876-1234-5678" value={puntosAccount} onChange={e => setPuntosAccount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-pink-500 font-mono" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1 font-semibold">Puntos Disponibles (Demo)</label>
                <input type="number" required min="0" placeholder="5000" value={puntosFormBalance} onChange={e => setPuntosFormBalance(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-pink-500" />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Equivale a {formatCOP(parseInt(puntosFormBalance || '0') * puntosCol.conversionRate)} COP en propinas.
                </span>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsLinkingPuntos(false)} className="flex-1 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs transition">Conectar Cuenta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
