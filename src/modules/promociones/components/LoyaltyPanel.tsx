import React, { useState } from 'react';
import { Award, Gift, Zap, CheckCircle2, Ticket, TrendingUp } from 'lucide-react';
import { UserStats } from '../types';

interface LoyaltyPanelProps {
  user: UserStats;
  onUpdateUser: (newUser: UserStats) => void;
  onRedeem: (points: number) => { code: string; value: string; updatedUser: UserStats };
}

export default function LoyaltyPanel({ user, onUpdateUser, onRedeem }: LoyaltyPanelProps) {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; value: string } | null>(null);
  const [redemptionError, setRedemptionError] = useState('');

  const tierColors: Record<string, string> = {
    Bronce: 'from-amber-700 to-amber-900 border-amber-600 text-amber-100',
    Plata: 'from-slate-400 to-slate-600 border-slate-300 text-slate-100',
    Oro: 'from-yellow-500 to-amber-600 border-yellow-300 text-yellow-50',
    Platino: 'from-purple-500 to-indigo-600 border-purple-300 text-purple-100',
  };

  const getTierNextThreshold = (tier: string) => {
    switch (tier) {
      case 'Bronce': return 500;
      case 'Plata': return 1500;
      case 'Oro': return 3000;
      default: return 3000;
    }
  };

  const getTierBaseValue = (tier: string) => {
    switch (tier) {
      case 'Bronce': return 0;
      case 'Plata': return 500;
      case 'Oro': return 1500;
      default: return 3000;
    }
  };

  const nextThreshold = getTierNextThreshold(user.tier);
  const baseThreshold = getTierBaseValue(user.tier);
  const progressPercent = user.tier === 'Platino'
    ? 100
    : Math.min(100, Math.max(0, ((user.loyaltyPoints - baseThreshold) / (nextThreshold - baseThreshold)) * 100));

  const rewardVouchers = [
    { points: 500, value: '$15,000 COP', title: 'Bono Básico Gastronómico', desc: 'Descuento neto en comidas en cualquiera de nuestros bares adheridos.' },
    { points: 1000, value: '$35,000 COP', title: 'Bono Intermedio Gastrobar', desc: 'Descuento sustancial aplicable en cócteles premium y platos.' },
    { points: 2000, value: '$80,000 COP', title: 'Bono VIP Elite Premium', desc: 'Descuento mayor de lujo en cenas rumberas y licores importados.' },
  ];

  const handleRedeem = (points: number) => {
    setIsRedeeming(true);
    setRedemptionError('');
    setActiveCoupon(null);

    try {
      const result = onRedeem(points);
      onUpdateUser(result.updatedUser);
      setActiveCoupon({ code: result.code, value: result.value });
    } catch (err: any) {
      setRedemptionError(err.message || 'Puntos insuficientes para este canje');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-3xl bg-gradient-to-br ${tierColors[user.tier]} border shadow-xl relative overflow-hidden flex flex-col justify-between h-48`}>
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-2xl transform translate-x-12 -translate-y-12"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/20 rounded-full blur-xl"></div>

        <div className="flex justify-between items-start z-10">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider opacity-85">Pasaporte Club de Lealtad</span>
            <h4 className="text-2xl font-serif font-extrabold tracking-wide mt-1 drop-shadow-md">Gremio {user.tier}</h4>
          </div>
          <Award className="w-10 h-10 stroke-1 drop-shadow" />
        </div>

        <div className="z-10 space-y-2">
          {user.tier !== 'Platino' ? (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono opacity-90">
                <span>Progreso a {user.tier === 'Bronce' ? 'Plata' : user.tier === 'Plata' ? 'Oro' : 'Platino'}</span>
                <span>{user.loyaltyPoints} / {nextThreshold} PTS</span>
              </div>
              <div className="w-full bg-black/30 h-2 rounded-full overflow-hidden border border-white/10">
                <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          ) : (
            <div className="text-[11px] font-semibold flex items-center gap-1.5 text-yellow-300">
              <Zap className="w-4 h-4 fill-current text-yellow-300 animate-bounce" />
              <span>¡Nivel Supremo Platino Alcanzado! Disfrutas de 15% OFF base y 200 PTS por sentado.</span>
            </div>
          )}

          <div className="flex justify-between items-center text-[10px] pt-1 border-t border-white/10 opacity-90 font-mono">
            <div>Beneficiario: <span className="font-bold">{user.name}</span></div>
            <div>Puntos disponibles: <span className="font-bold text-sm">{user.loyaltyPoints} PTS</span></div>
          </div>
        </div>
      </div>

      <div className="p-5 bg-white border border-stone-200 rounded-3xl space-y-4 shadow-sm">
        <h5 className="text-xs font-extrabold text-stone-900 font-serif uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-brand-primary animate-pulse" />
          Tabla de Beneficios del Club
        </h5>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="p-2 border border-stone-150 bg-stone-50/50 rounded-2xl space-y-1 shadow-inner">
            <span className="font-bold text-amber-700 block">Bronce (0-499 PTS)</span>
            <p className="text-stone-500">Sumas +100 puntos por mesa reservada.</p>
          </div>
          <div className="p-2 border border-stone-150 bg-stone-50/50 rounded-2xl space-y-1 shadow-inner">
            <span className="font-bold text-stone-600 block">Plata (500-1499 PTS)</span>
            <p className="text-stone-500">Sumas +120 puntos. Descuento exclusivo del +5% de mesa.</p>
          </div>
          <div className="p-2 border border-stone-150 bg-stone-50/50 rounded-2xl space-y-1 shadow-inner">
            <span className="font-bold text-brand-gold block">Oro (1500-2999)</span>
            <p className="text-stone-500">Sumas +150 puntos. Descuento automático directo del +10%.</p>
          </div>
          <div className="p-2 border border-stone-150 bg-stone-50/50 rounded-2xl space-y-1 shadow-inner">
            <span className="font-bold text-purple-700 block">Platino (3000+)</span>
            <p className="text-stone-500">Sumas +200 puntos. Descuento premium del +15%.</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h5 className="text-xs font-bold text-stone-850 font-serif flex items-center gap-1.5">
          <Gift className="w-4 h-4 text-brand-gold" />
          Canjes de Puntos por Cupones de Descuento
        </h5>

        {redemptionError && (
          <div className="text-xs font-semibold text-brand-primary bg-red-50 border border-brand-primary/10 p-2.5 rounded-xl">{redemptionError}</div>
        )}

        {activeCoupon && (
          <div className="p-4 bg-emerald-50 border border-dashed border-emerald-300 rounded-3xl text-center space-y-3 shadow-sm">
            <div className="mx-auto w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-stone-900">¡Canje Exitoso de Puntos!</div>
              <p className="text-xs text-stone-500">Usa este cupón en tu próxima reserva/cuenta física:</p>
            </div>
            <div className="p-3 bg-stone-50 border border-emerald-300 rounded-2xl flex items-center justify-center gap-2">
              <Ticket className="w-5 h-5 text-emerald-600" />
              <span className="font-mono text-lg font-black tracking-widest text-emerald-700 select-all">{activeCoupon.code}</span>
            </div>
            <div className="text-xs font-bold text-emerald-700">
              Valor del Descuento: {activeCoupon.value} OFF
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          {rewardVouchers.map((voucher) => {
            const canAfford = user.loyaltyPoints >= voucher.points;
            return (
              <div key={voucher.points} className="p-4 bg-white border border-stone-200 rounded-2xl flex items-center justify-between gap-4 transition-all hover:border-stone-300 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono bg-stone-100 text-brand-gold px-2 py-0.5 rounded-md border border-stone-150 font-bold whitespace-nowrap shadow-inner">
                      {voucher.points} PTS
                    </span>
                    <span className="text-xs font-bold text-stone-900 font-serif">{voucher.title}</span>
                  </div>
                  <p className="text-[10px] text-stone-500 leading-normal">{voucher.desc}</p>
                </div>
                <button
                  type="button"
                  disabled={!canAfford || isRedeeming}
                  onClick={() => handleRedeem(voucher.points)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-extrabold whitespace-nowrap select-none transition-all cursor-pointer ${
                    canAfford
                      ? 'bg-[#B91C1C] hover:bg-red-700 leading-tight text-white shadow shadow-red-500/10'
                      : 'bg-stone-100 border border-stone-200 text-stone-400 disabled:opacity-70'
                  }`}
                >
                  Canjear ({voucher.value})
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
