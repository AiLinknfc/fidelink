import React, { useState } from 'react';
import { Calendar, Users, Percent, Gift, X, CheckSquare, Clock, Award } from 'lucide-react';
import { Venue, Promotion, UserStats } from '../types';

type BookingPayload = {
  userEmail: string; userName: string; venueId: string; venueName: string;
  promoId?: string; promoTitle?: string; discount: number; guests: number;
  dateTime: string; notes?: string;
};

interface BookingModalProps {
  venue: Venue;
  promo?: Promotion;
  user: UserStats;
  onClose: () => void;
  onSuccess: (updatedUser: UserStats) => void;
  onBook: (payload: BookingPayload) => UserStats;
}

export default function BookingModal({ venue, promo, user, onClose, onSuccess, onBook }: BookingModalProps) {
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('19:30');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  let basePoints = 100;
  if (user.tier === 'Plata') basePoints = 120;
  else if (user.tier === 'Oro') basePoints = 150;
  else if (user.tier === 'Platino') basePoints = 200;

  const promoBonus = promo ? 30 : 0;
  const totalAccruedPoints = basePoints + promoBonus;

  let tierDiscount = 0;
  if (user.tier === 'Plata') tierDiscount = 5;
  else if (user.tier === 'Oro') tierDiscount = 10;
  else if (user.tier === 'Platino') tierDiscount = 15;

  const totalDiscount = (promo?.discount || 0) + tierDiscount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const updatedUser = onBook({
        userEmail: user.email,
        userName: user.name,
        venueId: venue.id,
        venueName: venue.name,
        promoId: promo?.id,
        promoTitle: promo?.title,
        discount: totalDiscount,
        guests,
        dateTime: `${date}T${time}:00.000Z`,
        notes
      });
      onSuccess(updatedUser);
    } catch (err: any) {
      setError(err?.message || 'Error al guardar la reservación');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 p-2 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="h-2 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-gold"></div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-brand-primary bg-brand-primary/5 px-2.5 py-1 rounded-full border border-brand-primary/10">
              Reserva de Mesa Al Instante
            </span>
            <h3 className="text-2xl font-serif font-bold text-stone-900 mt-2 leading-tight">
              {venue.name}
            </h3>
            <p className="text-xs text-stone-500 mt-1">{venue.address}</p>
          </div>

          {promo ? (
            <div className="p-4 bg-amber-50/70 border border-brand-primary/10 rounded-2xl flex items-start gap-3">
              <div className="p-2 bg-brand-primary/5 rounded-xl text-brand-primary shrink-0">
                <Percent className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900 font-serif">
                  Descuento Exclusivo Aplicado: {promo.discount}% OFF
                </div>
                <div className="text-[11px] text-stone-600 font-mono mt-0.5">
                  Código asignado: <span className="font-bold underline text-brand-primary">{promo.code}</span>
                </div>
                {tierDiscount > 0 && (
                  <div className="text-[10px] text-emerald-700 mt-1 font-semibold flex items-center gap-1">
                    Beneficio {user.tier}: +{tierDiscount}% descuento adicional acumulado.
                  </div>
                )}
              </div>
            </div>
          ) : (
            tierDiscount > 0 && (
              <div className="p-3 bg-emerald-50 border border-emerald-200/50 rounded-2xl flex items-center gap-2 text-xs text-emerald-700 font-medium">
                <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>¡Tu membresía {user.tier} te otorga {tierDiscount}% OFF de descuento de mesa base!</span>
              </div>
            )
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs text-stone-700 font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-brand-primary" />
                Número de Personas (Mesa)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
                <span className="text-sm font-mono font-bold text-stone-900 bg-stone-100 px-3 py-1 rounded-lg shrink-0 border border-stone-200">
                  {guests} {guests === 1 ? 'Persona' : 'Personas'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-stone-750 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-primary" />
                Fecha
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white text-stone-900 font-mono text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-stone-750 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-primary" />
                Hora de Llegada
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-white text-stone-900 font-mono text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-stone-700 font-semibold">
              Notas Especiales / Alergias
            </label>
            <textarea
              placeholder="Ej. Mesa en terraza, alergia a los mariscos, sillita para bebé..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white text-stone-900 text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand-primary h-16 resize-none"
            ></textarea>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="text-stone-800 font-semibold font-serif">Recompensas de Lealtad</div>
                <div className="text-[10px] text-stone-500">Sumarás puntos por sentarte</div>
              </div>
            </div>
            <div className="text-emerald-700 font-mono font-bold text-right">
              +{totalAccruedPoints} PTS
              <div className="text-[8px] text-stone-400 font-normal">Base: {basePoints} | Promo bonus: {promoBonus}</div>
            </div>
          </div>

          {error && (
            <p className="text-xs font-semibold text-brand-primary text-center">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-2xl text-xs font-semibold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gradient-to-r from-brand-primary to-brand-gold hover:opacity-95 disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-primary/10 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              {isSubmitting ? 'Registrando...' : (
                <>
                  <CheckSquare className="w-4 h-4" />
                  Confirmar Reserva
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
