import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getBusinessClients, type LoyaltyCard as LoyaltyCardType } from '@/services/loyaltyService';
import { CreditCard, ShieldCheck, DollarSign, Zap, CheckCircle, Smartphone, Banknote, Loader2 } from 'lucide-react';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';

const COLOMBIAN_BANKS = [
  { id: 'bancolombia', name: 'Bancolombia' },
  { id: 'nequi', name: 'Nequi' },
  { id: 'davivienda', name: 'Davivienda / Daviplata' },
  { id: 'bogota', name: 'Banco de Bogotá' },
  { id: 'bbva', name: 'BBVA Colombia' },
  { id: 'occidente', name: 'Banco de Occidente' },
];

export default function Payment() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { brand } = useModuleBrand();
  const businessId = user?.id;

  const [clients, setClients] = useState<LoyaltyCardType[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(50000);
  const [activeChannel, setActiveChannel] = useState<'CARD' | 'NEQUI' | 'BANCOLOMBIA' | 'PSE'>('CARD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);

  const [cardNumber, setCardNumber] = useState('4000 1234 5678 9010');
  const [cardName, setCardName] = useState('JUAN PÉREZ');
  const [cardExpiry, setCardExpiry] = useState('12/29');
  const [cardCvv, setCardCvv] = useState('123');
  const [nequiPhone, setNequiPhone] = useState('3001234567');
  const [bancolombiaUser, setBancolombiaUser] = useState('usuario.bancolombia');
  const [selectedBankId, setSelectedBankId] = useState('bancolombia');
  const [pseUserEmail, setPseUserEmail] = useState('cliente@correo.co');
  const [chipHovered, setChipHovered] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!businessId) { navigate('/'); return; }
    let cancelled = false;

    getBusinessClients(businessId).then(({ data, error }) => {
      if (cancelled || error || !data) { setDataLoading(false); return; }
      setClients(data);
      if (data.length > 0) setSelectedClientId(data[0].id);
      setDataLoading(false);
    });

    return () => { cancelled = true; };
  }, [authLoading, businessId, navigate]);

  const handleProcessPayment = (e: FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) return;
    setIsProcessing(true);
    setSuccessReceipt(null);

    if (activeChannel === 'NEQUI') {
      setStatusMessage(`Enviando cobro de $${paymentAmount.toLocaleString()} COP a Nequi ${nequiPhone}...`);
      setTimeout(() => {
        setStatusMessage('Esperando aprobación en App Nequi...');
        setTimeout(() => {
          setStatusMessage('Autorización recibida. Procesando...');
          setTimeout(() => completeTransaction('Nequi', `+57 ${nequiPhone.slice(0, 3)}***${nequiPhone.slice(-3)}`), 800);
        }, 1200);
      }, 900);
    } else if (activeChannel === 'BANCOLOMBIA') {
      setStatusMessage('Iniciando débito Bancolombia...');
      setTimeout(() => {
        setStatusMessage('Solicitando clave dinámica...');
        setTimeout(() => {
          setStatusMessage('Validando fondos...');
          setTimeout(() => completeTransaction('Bancolombia Débito', `Cuenta *${bancolombiaUser.slice(-4)}`), 900);
        }, 1000);
      }, 700);
    } else if (activeChannel === 'PSE') {
      const bankName = COLOMBIAN_BANKS.find(b => b.id === selectedBankId)?.name || 'PSE';
      setStatusMessage(`Redireccionando a ${bankName}...`);
      setTimeout(() => {
        setStatusMessage('Autenticando con el banco...');
        setTimeout(() => {
          setStatusMessage('Débito autorizado. Sincronizando...');
          setTimeout(() => completeTransaction(`PSE - ${bankName}`, `Ref *${pseUserEmail.slice(0, 3)}`), 1000);
        }, 1100);
      }, 800);
    } else {
      setStatusMessage('Iniciando pasarela segura SSL...');
      setTimeout(() => {
        setStatusMessage('Validando firma de tarjeta...');
        setTimeout(() => {
          setStatusMessage('Cifrando transacción...');
          setTimeout(() => completeTransaction('Visa/Mastercard', `*${cardNumber.slice(-4)}`), 800);
        }, 800);
      }, 700);
    }
  };

  function completeTransaction(methodName: string, methodMask: string) {
    setIsProcessing(false);
    setStatusMessage('');
    setSuccessReceipt({
      id: `tx-${Date.now()}`,
      amount: paymentAmount,
      method: `${methodName} (${methodMask})`,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      authCode: Math.floor(100000 + Math.random() * 900000).toString(),
    });
  }

  if (authLoading || dataLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="bg-[#f8fafc] border-b border-slate-200 px-4 sm:px-6 h-10 flex flex-row items-center justify-between gap-2 select-none overflow-hidden flex-shrink-0">

        {/* LEFT — chip expandible */}
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
          <div
            className="absolute inset-0 pointer-events-none rounded-full transition-opacity duration-500"
            style={{
              opacity: chipHovered ? 1 : 0,
              background: `linear-gradient(90deg, ${brand.colorHex}06 0%, ${brand.colorHex}14 50%, ${brand.colorHex}06 100%)`,
            }}
          />
          <ShieldCheck
            className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300"
            style={{ transform: chipHovered ? 'rotate(-15deg) scale(1.2)' : 'none' }}
          />
          <span className="text-[12px] font-bold font-sans whitespace-nowrap flex-shrink-0">Cobros & Recargas</span>
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
            · Procesa pagos y recargas para tus clientes
          </span>
        </div>

        {/* RIGHT — estado */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-full flex-shrink-0">
          <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: brand.colorHex }} />
          <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">{clients.length} clientes disponibles</span>
        </div>
      </div>
      <main className="flex-1 overflow-y-auto px-4 md:px-6 pt-3 pb-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full filter blur-xl pointer-events-none" />
            <div className="flex items-center gap-2.5 mb-5 border-b border-slate-100 pb-3">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h2 className="text-section-heading text-slate-800">Módulo Seguro de Cobros & Recargas</h2>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Cliente</label>
                  <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-slate-800 cursor-pointer">
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.client?.name || c.clientEmail} - {c.clientEmail}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Monto (COP)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                    <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(Number(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Canales de Pago</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['CARD', 'NEQUI', 'BANCOLOMBIA', 'PSE'] as const).map(ch => {
                    const isActive = activeChannel === ch;
                    return (
                    <button key={ch} type="button" onClick={() => setActiveChannel(ch)}
                      className="relative p-2.5 rounded-xl border text-center transition-all duration-300 ease-in-out flex flex-col items-center gap-1 cursor-pointer overflow-hidden"
                      style={{
                        borderColor: isActive ? brand.colorHex : 'rgb(226 232 240)',
                        backgroundColor: isActive ? `${brand.colorHex}10` : '#ffffff',
                        boxShadow: isActive
                          ? `0 0 0 3px ${brand.colorHex}18, 0 2px 8px ${brand.colorHex}20`
                          : 'none',
                        color: isActive ? brand.colorHex : '#64748b',
                      }}
                    >
                      {/* Glow sweep al estar activo */}
                      <div
                        className="absolute inset-0 pointer-events-none rounded-xl transition-opacity duration-500"
                        style={{
                          opacity: isActive ? 1 : 0,
                          background: `linear-gradient(135deg, ${brand.colorHex}04 0%, ${brand.colorHex}14 50%, ${brand.colorHex}04 100%)`,
                        }}
                      />
                      <CreditCard className="relative w-4 h-4" />
                      <span className="relative text-[10px] font-bold">{ch === 'CARD' ? 'Tarjeta' : ch}</span>
                    </button>
                    );
                  })}
                </div>
              </div>

              {activeChannel === 'CARD' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">Número de Tarjeta</label>
                    <input type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">Titular</label>
                    <input type="text" value={cardName} onChange={e => setCardName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 uppercase" />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-500 mb-1 block">Vencimiento</label>
                      <input type="text" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-500 mb-1 block">CVV</label>
                      <input type="text" value={cardCvv} onChange={e => setCardCvv(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono" />
                    </div>
                  </div>
                </div>
              )}

              {activeChannel === 'NEQUI' && (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">Celular Nequi</label>
                  <input type="text" value={nequiPhone} onChange={e => setNequiPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono" />
                </div>
              )}

              {activeChannel === 'BANCOLOMBIA' && (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">Usuario Bancolombia</label>
                  <input type="text" value={bancolombiaUser} onChange={e => setBancolombiaUser(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" />
                </div>
              )}

              {activeChannel === 'PSE' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">Banco</label>
                    <select value={selectedBankId} onChange={e => setSelectedBankId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer">
                      {COLOMBIAN_BANKS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">Email</label>
                    <input type="email" value={pseUserEmail} onChange={e => setPseUserEmail(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2.5 text-xs text-blue-700">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span className="font-semibold">{statusMessage}</span>
                </div>
              )}

              <button type="submit" disabled={isProcessing || paymentAmount <= 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 text-xs rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <><Zap className="w-4 h-4" /> Cobrar ${paymentAmount.toLocaleString()} COP</>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800">Pasarela Segura</h3>
              </div>
              <div className="space-y-2 text-[11px] text-slate-500">
                <p className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Conexión SSL/TLS activa</p>
                <p className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Cifrado AES-256</p>
                <p className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Tokenización de datos</p>
              </div>
            </div>

            {successReceipt && (
              <div className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-bold text-emerald-700">Transacción Exitosa</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Monto</span>
                    <span className="font-bold text-slate-800">${successReceipt.amount.toLocaleString()} COP</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Método</span>
                    <span className="font-bold text-slate-800 text-[10px]">{successReceipt.method}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Código Auth</span>
                    <span className="font-bold text-slate-800 font-mono">{successReceipt.authCode}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Fecha</span>
                    <span className="text-slate-800">{successReceipt.date} {successReceipt.time}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
