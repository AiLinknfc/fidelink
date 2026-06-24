import { useState, useEffect } from 'react';
import { Users, Search, Filter, ShieldCheck, Mail, Phone, Calendar, ArrowRight, UserPlus, Gift, Loader2, X, Check, BarChart3, Target, TrendingUp, Award, Radio } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getBusinessClients, type LoyaltyCard as LoyaltyCardType } from '@/services/loyaltyService';
import { supabase } from '@/lib/supabaseClient';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';

interface CRMClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthday: string;
  joinedAt: string;
  referredBy?: string;
  pointsTotal: number;
  totalSpent: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  notes?: string;
}

interface ReferralRecord {
  id: string;
  referrerId: string;
  referredId: string;
  status: 'PENDING' | 'COMPLETED' | 'REWARDED';
  date: string;
  rewardClaimed: boolean;
  rewardValue: string;
}

const TIERS = ['ALL', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'] as const;

function tierColor(tier: string) {
  switch (tier) {
    case 'PLATINUM': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'GOLD': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'SILVER': return 'bg-slate-100 text-slate-600 border-slate-200';
    default: return 'bg-orange-100 text-orange-700 border-orange-200';
  }
}

function Spinner({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-600">{label}</p>
      </div>
    </div>
  );
}

export default function AudienciaCRM() {
  const { user, loading: authLoading } = useAuth();
  const { brand } = useModuleBrand();
  const businessId = user?.id ?? '';

  const [clients, setClients] = useState<CRMClient[]>([]);
  const [referrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [pointsDelta, setPointsDelta] = useState(1);
  const [pointsReason, setPointsReason] = useState('Ajuste manual por segmentación de audiencia');

  // Add client form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBirthday, setNewBirthday] = useState('1995-01-01');
  const [newReferredBy, setNewReferredBy] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [chipHovered, setChipHovered] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Segment stats (derived from clients)
  const [segStats, setSegStats] = useState({ total: 0, bronze: 0, silver: 0, gold: 0, platinum: 0 });

  useEffect(() => {
    if (authLoading) return;
    if (!businessId) return;

    setLoading(true);
    getBusinessClients(businessId).then(({ data, error }) => {
      if (!error && data) {
        const mapped: CRMClient[] = data.map((c: LoyaltyCardType) => ({
          id: c.clientId,
          name: c.client?.name ?? 'Sin nombre',
          email: c.client?.email ?? '—',
          phone: '—',
          birthday: '—',
          joinedAt: c.createdAt ?? '—',
          pointsTotal: c.currentStamps,
          totalSpent: 0,
          tier: 'BRONZE' as const,
          notes: c.rewardDescription ? `Recompensa: ${c.rewardDescription}` : undefined,
        }));
        setClients(mapped);
      }
      setLoading(false);
    });
  }, [authLoading, businessId]);

  // Recalculate segment stats when clients change
  useEffect(() => {
    const total = clients.length;
    const bronze = clients.filter(c => c.tier === 'BRONZE').length;
    const silver = clients.filter(c => c.tier === 'SILVER').length;
    const gold = clients.filter(c => c.tier === 'GOLD').length;
    const platinum = clients.filter(c => c.tier === 'PLATINUM').length;
    setSegStats({ total, bronze, silver, gold, platinum });
  }, [clients]);

  const filtered = clients.filter(c => {
    const matchSearch = !searchTerm || 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTier = selectedTier === 'ALL' || c.tier === selectedTier;
    return matchSearch && matchTier;
  });

  function matchesReferredBy(id?: string) {
    if (!id) return null;
    return clients.find(c => c.id === id)?.name ?? null;
  }

  async function handleAddClient() {
    if (!businessId || !newName.trim() || !newEmail.trim()) return;
    setSaving(true);
    setErrorMsg('');

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', newEmail.trim())
      .maybeSingle();

    if (existing) {
      setErrorMsg('Ya existe un cliente con ese correo electrónico.');
      setSaving(false);
      return;
    }

    const newId = `tmp-${Date.now()}`;
    const newClient: CRMClient = {
      id: newId,
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone || '+57 300 000 0000',
      birthday: newBirthday,
      joinedAt: new Date().toISOString().split('T')[0],
      referredBy: newReferredBy || undefined,
      pointsTotal: 0,
      totalSpent: 0,
      tier: 'BRONZE',
      notes: 'Registrado desde Audiencia CRM',
    };

    const { error: signUpErr } = await supabase.auth.signUp({
      email: newEmail.trim(),
      password: 'temporal123',
      options: { data: { name: newName.trim(), role: 'client' } },
    });

    if (signUpErr && !signUpErr.message.includes('already')) {
      setErrorMsg(`Error al crear usuario: ${signUpErr.message}`);
      setSaving(false);
      return;
    }

    let clientUserId = existing?.id;
    if (!clientUserId) {
      const { data: createdUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newEmail.trim())
        .maybeSingle();
      clientUserId = createdUser?.id ?? newId;
    }

    if (clientUserId && clientUserId !== newId) {
      const { error: cardErr } = await supabase.from('loyalty_cards').upsert({
        business_id: businessId,
        client_id: clientUserId,
        current_stamps: 0,
        total_stamps: 10,
        business_name: '',
        color_hex: '#3525cd',
        reward_description: 'Recompensa',
      }, { onConflict: 'business_id, client_id' });

      if (cardErr) {
        setErrorMsg(`Error al crear tarjeta: ${cardErr.message}`);
        setSaving(false);
        return;
      }
    }

    setClients(prev => [newClient, ...prev]);
    setNewName(''); setNewEmail(''); setNewPhone(''); setNewBirthday('1995-01-01'); setNewReferredBy('');
    setSuccessMsg('Cliente registrado correctamente.');
    setTimeout(() => setSuccessMsg(''), 3000);
    setSaving(false);
  }

  async function handleModifyPoints(clientId: string, delta: number, reason: string) {
    if (!businessId) return;
    setClients(prev => prev.map(c => 
      c.id === clientId ? { ...c, pointsTotal: Math.max(0, c.pointsTotal + delta) } : c
    ));
    setAdjustingId(null);
    setPointsDelta(1);
    setPointsReason('Ajuste manual por segmentación de audiencia');
  }

  if (!businessId) {
    return <Spinner label="Cargando..." />;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 h-12 flex flex-row items-center justify-between gap-2 select-none overflow-hidden flex-shrink-0">

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
          <Target
            className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300"
            style={{ transform: chipHovered ? 'rotate(-15deg) scale(1.2)' : 'none' }}
          />
          <span className="text-[12px] font-bold font-sans whitespace-nowrap flex-shrink-0">Segmentación & CRM</span>
          <span
            className="text-[12px] font-light font-sans whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out"
            style={{
              maxWidth: chipHovered ? '600px' : '0px',
              opacity: chipHovered ? 1 : 0,
              paddingLeft: chipHovered ? '6px' : '0px',
              color: `${brand.colorHex}99`,
            }}
          >
            · Gestión avanzada de públicos, segmentación y análisis de clientes
          </span>
        </div>

        {/* RIGHT — estado + búsqueda */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-full flex-shrink-0">
            <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: brand.colorHex }} />
            <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">{clients.length} clientes</span>
          </div>
          <div className="relative w-44 sm:w-56 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar…"
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-400 text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>
      <main className="flex-1 overflow-y-auto px-4 md:px-6 pt-3 pb-6 space-y-4">

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs flex items-center gap-2">
          <X className="w-3.5 h-3.5 shrink-0" />
          {errorMsg}
          <button onClick={() => setErrorMsg('')} className="ml-auto font-bold underline">Cerrar</button>
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-3.5 h-3.5 shrink-0" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left: Client Table ──────────────────────────────────────────── */}
        <section className="lg:col-span-8 space-y-4">

          {/* Segment stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-jakarta">Total</p>
              <p className="text-lg font-bold text-slate-800 font-headline">{segStats.total}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm text-center">
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider font-jakarta">Bronce</p>
              <p className="text-lg font-bold text-slate-800 font-headline">{segStats.bronze}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm text-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-jakarta">Plata</p>
              <p className="text-lg font-bold text-slate-800 font-headline">{segStats.silver}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm text-center">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider font-jakarta">Oro/Platino</p>
              <p className="text-lg font-bold text-slate-800 font-headline">{segStats.gold + segStats.platinum}</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, email o teléfono..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
            </div>
            <select value={selectedTier} onChange={e => setSelectedTier(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 transition-all">
              {TIERS.map(t => (
                <option key={t} value={t}>{t === 'ALL' ? 'Todos los segmentos' : t}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: brand.colorHex }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl">
              <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600">No se encontraron clientes que coincidan con los filtros.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[12px] font-bold uppercase tracking-wider font-jakarta">
                    <th className="text-left px-4 py-3">Cliente</th>
                    <th className="text-left px-4 py-3">Contacto</th>
                    <th className="text-left px-4 py-3">Segmento / Antigüedad</th>
                    <th className="text-center px-4 py-3">Puntos</th>
                    <th className="text-center px-4 py-3">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(c => {
                    const isHovered = hoveredRow === c.id;
                    return (
                    <tr
                      key={c.id}
                      className="transition-all duration-300 ease-in-out"
                      style={{
                        backgroundColor: isHovered ? `${brand.colorHex}06` : 'transparent',
                        boxShadow: isHovered ? `inset 3px 0 0 ${brand.colorHex}` : 'inset 3px 0 0 transparent',
                      }}
                      onMouseEnter={() => setHoveredRow(c.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors duration-300"
                            style={isHovered ? {
                              backgroundColor: `${brand.colorHex}18`,
                              color: brand.colorHex,
                            } : {
                              backgroundColor: `${brand.colorHex}18`,
                              color: brand.colorHex,
                            }}
                          >
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p
                              className="text-[12px] font-semibold transition-colors duration-300"
                              style={{ color: isHovered ? brand.colorHex : '#334155' }}
                            >
                              {c.name}
                            </p>
                            {c.notes && <p className="text-[11px] text-slate-400 mt-0.5">{c.notes}</p>}
                            {matchesReferredBy(c.referredBy) && (
                              <span className="inline-flex items-center gap-0.5 text-[8px] px-1 py-0.5 rounded-full mt-0.5" style={{ color: brand.colorHex, backgroundColor: `${brand.colorHex}14` }}>
                                <ArrowRight className="w-2.5 h-2.5" /> {matchesReferredBy(c.referredBy)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 text-[11px] text-slate-600">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {c.email}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {c.phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-block px-1.5 py-0.5 rounded-full text-[8px] font-bold border ${tierColor(c.tier)}`}>
                            {c.tier}
                          </span>
                          <span className="text-[9px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" /> {c.joinedAt}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className="text-sm font-bold transition-colors duration-300"
                          style={{ color: isHovered ? brand.colorHex : '#64748b' }}
                        >
                          {c.pointsTotal}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => { setAdjustingId(c.id); setPointsDelta(1); }}
                          className="px-2 py-1 rounded-lg text-[9px] font-bold transition-all duration-300"
                          style={isHovered ? {
                            backgroundColor: `${brand.colorHex}14`,
                            color: brand.colorHex,
                          } : {
                            backgroundColor: `${brand.colorHex}08`,
                            color: '#64748b',
                          }}
                        >
                          Ajustar Puntos
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Point Adjustment Drawer */}
          {adjustingId && (() => {
            const client = clients.find(c => c.id === adjustingId);
            if (!client) return null;
            return (
              <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: `${brand.colorHex}08`, borderColor: `${brand.colorHex}28` }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-700">Ajustar puntos: <span style={{ color: brand.colorHex }}>{client.name}</span></p>
                  <button onClick={() => { setAdjustingId(null); setPointsDelta(1); }}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-white transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-600 font-semibold">Puntos actuales: {client.pointsTotal}</span>
                </div>
                <div className="flex gap-3 items-end">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] text-slate-500 font-semibold">Cantidad (+/-)</label>
                    <input type="number" value={pointsDelta} onChange={e => setPointsDelta(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-400 transition-all text-slate-800 placeholder:text-slate-400" />
                  </div>
                  <div className="flex-[2] space-y-1">
                    <label className="text-[10px] text-slate-500 font-semibold">Motivo</label>
                    <input value={pointsReason} onChange={e => setPointsReason(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-400 transition-all text-slate-800 placeholder:text-slate-400" />
                  </div>
                  <button onClick={() => handleModifyPoints(client.id, pointsDelta, pointsReason)}
                    className="px-4 py-1.5 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm shrink-0" style={{ backgroundColor: brand.colorHex }}>
                    Asignar
                  </button>
                </div>
              </div>
            );
          })()}
        </section>

        {/* ── Right: Add Client + Referrals ───────────────────────────────── */}
        <aside className="lg:col-span-4 space-y-4">

          {/* Add Client */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2" style={{ color: brand.colorHex }}>
              <UserPlus className="w-4 h-4" />
              <span className="text-section-heading">Registrar Cliente</span>
            </div>
            <div className="space-y-2">
              <input value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Nombre *" 
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-400 transition-all text-slate-800 placeholder:text-slate-400" />
              <input value={newEmail} onChange={e => setNewEmail(e.target.value)}
                placeholder="Email *" type="email"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-400 transition-all text-slate-800 placeholder:text-slate-400" />
              <input value={newPhone} onChange={e => setNewPhone(e.target.value)}
                placeholder="Teléfono" type="tel"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-400 transition-all text-slate-800 placeholder:text-slate-400" />
              <div>
                <label className="text-[9px] text-slate-500 font-semibold block mb-1">Cumpleaños</label>
                <input value={newBirthday} onChange={e => setNewBirthday(e.target.value)} type="date"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-400 transition-all text-slate-800 placeholder:text-slate-400" />
              </div>
              <select value={newReferredBy} onChange={e => setNewReferredBy(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-400 transition-all text-slate-800 placeholder:text-slate-400">
                <option value="">Sin referidor</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button onClick={handleAddClient} disabled={saving || !newName.trim() || !newEmail.trim()}
                className="w-full py-2 text-white rounded-lg text-[11px] font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5" style={{ backgroundColor: brand.colorHex }}>
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                Agregar a la audiencia
              </button>
            </div>
          </div>

          {/* Referrals */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2" style={{ color: brand.colorHex }}>
              <Gift className="w-4 h-4" />
              <span className="text-section-heading">Red de Referidos</span>
            </div>
            {referrals.length === 0 ? (
              <div className="text-center py-6">
                <Gift className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-[11px] text-slate-500">Aún no hay referidos registrados.</p>
                <p className="text-[9px] text-slate-400 mt-1">Los clientes referidos aparecerán aquí automáticamente.</p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-0.5 no-scrollbar">
                {referrals.map(r => {
                  const referrer = clients.find(c => c.id === r.referrerId);
                  const referred = clients.find(c => c.id === r.referredId);
                  return (
                    <div key={r.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold"
                          style={{
                            backgroundColor: r.status === 'REWARDED' ? '#d1fae5' : r.status === 'COMPLETED' ? `${brand.colorHex}14` : '#fef3c7',
                            color: r.status === 'REWARDED' ? '#065f46' : r.status === 'COMPLETED' ? brand.colorHex : '#92400e',
                          }}>
                          {r.status}
                        </span>
                        {!r.rewardClaimed && (
                          <span className="text-[8px] font-bold" style={{ color: brand.colorHex }}>Disponible</span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-slate-700">
                        {referrer?.name ?? '—'}
                      </p>
                      <p className="text-[9px] text-slate-500 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" /> {referred?.name ?? '—'}
                      </p>
                      <p className="text-[9px] text-slate-400 mt-1">{r.rewardValue}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Insights */}
          <div className="rounded-2xl p-4" style={{ background: `linear-gradient(135deg, ${brand.colorHex}08 0%, ${brand.colorHex}14 100%)`, borderColor: `${brand.colorHex}28` }}>
            <div className="flex items-center gap-2 mb-2" style={{ color: brand.colorHex }}>
              <TrendingUp className="w-4 h-4" />
              <span className="text-section-heading">Segmentación Inteligente</span>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              {clients.length} clientes en tu audiencia. Segmenta por rango ({segStats.bronze} Bronce, {segStats.silver} Plata, {segStats.gold} Oro, {segStats.platinum} Platino) para campañas dirigidas.
            </p>
          </div>

        </aside>
      </div>
    </main>
    </div>
  );
}
