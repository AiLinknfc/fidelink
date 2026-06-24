import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getClientCards } from '@/services/loyaltyService';
import type { LoyaltyCard as LoyaltyCardType } from '@/services/loyaltyService';
import RealisticCard from '@/components/wallet/RealisticCard';
import { getCardComponent, hasCardComponent } from '@/modules/fidelizacion/components/card-models';
import { Smartphone, Compass, MapPin, Gift, Star, Share2, Sparkles, Navigation, QrCode, ArrowLeft, ShieldCheck } from 'lucide-react';

interface StoreLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  offers: string[];
}

const MOCK_LOCATIONS: StoreLocation[] = [
  { id: 'loc-1', name: 'Sucursal Centro', address: 'Calle 10 #20-30, Bogotá', phone: '+57 601 234 5678', latitude: 4.6010, longitude: -74.0720, offers: ['10% descuento', 'Café gratis'] },
  { id: 'loc-2', name: 'Sucursal Norte', address: 'Carrera 15 #100-50, Bogotá', phone: '+57 601 876 5432', latitude: 4.7100, longitude: -74.0300, offers: ['2x1 en bebidas', 'Puntos dobles'] },
  { id: 'loc-3', name: 'Sucursal Occidente', address: 'Av. 68 #80-10, Bogotá', phone: '+57 601 345 6789', latitude: 4.6500, longitude: -74.1200, offers: ['Descuento 15%', 'Sello extra'] },
];

const GPS_PRESETS = [
  { name: 'Simular: Centro', lat: 4.6010, lng: -74.0720 },
  { name: 'Simular: Norte', lat: 4.7100, lng: -74.0300 },
  { name: 'Simular: Occidente', lat: 4.6500, lng: -74.1200 },
];

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function Spinner({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

export default function Wallet() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const clientEmail = user?.email ?? '';

  const [cards, setCards] = useState<LoyaltyCardType[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [latitude, setLatitude] = useState(4.6010);
  const [longitude, setLongitude] = useState(-74.0720);
  const [useRealGPS, setUseRealGPS] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [referralMsg, setReferralMsg] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!clientEmail) { navigate('/'); return; }

    let cancelled = false;
    setDataLoading(true);

    getClientCards(clientEmail).then(({ data, error }) => {
      if (cancelled) return;
      if (data) setCards(data);
      setDataLoading(false);
    });

    return () => { cancelled = true; };
  }, [authLoading, clientEmail, navigate]);

  useEffect(() => {
    if (useRealGPS && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => { setLatitude(position.coords.latitude); setLongitude(position.coords.longitude); },
        () => { setUseRealGPS(false); }
      );
    }
  }, [useRealGPS]);

  const locationsWithDistance = MOCK_LOCATIONS.map(loc => ({
    ...loc,
    distance: calculateDistance(latitude, longitude, loc.latitude, loc.longitude),
  })).sort((a, b) => a.distance - b.distance);

  const handleReferralSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!referralCodeInput) return;
    setReferralMsg(`Código de recomendación "${referralCodeInput}" ingresado con éxito.`);
    setReferralCodeInput('');
    setTimeout(() => setReferralMsg(''), 5000);
  };

  const isBusinessUser = user?.user_metadata?.role === 'business';

  if (authLoading || dataLoading) return <Spinner label="Cargando wallet…" />;

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Vista Cliente banner for business users */}
      {isBusinessUser && (
        <div className="bg-blue-600 border-b border-blue-700">
          <div className="max-w-7xl mx-auto px-4 md:px-12 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold font-mono tracking-wide">MODO VISTA CLIENTE</span>
              <span className="text-[10px] text-blue-200">— Vista previa de la experiencia del cliente</span>
            </div>
            <button onClick={() => navigate('/business')}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all">
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al Panel
            </button>
          </div>
        </div>
      )}
      <main className="max-w-7xl mx-auto px-4 md:px-12 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full filter blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 z-10 relative">
              <Smartphone className="w-5 h-5 text-blue-600 animate-pulse" />
              <h2 className="text-sm font-semibold text-slate-800">Simulador de Dispositivo Cliente</h2>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 z-10 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold tracking-wider text-blue-600 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-blue-600" /> GEOLOCALIZACIÓN
                </span>
                <button onClick={() => setUseRealGPS(!useRealGPS)}
                  className={`text-[9px] font-bold px-2 py-0.5 rounded transition-all cursor-pointer ${
                    useRealGPS ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}>
                  {useRealGPS ? 'GPS Real: Activo' : 'Usar GPS Real'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="bg-white border border-slate-200 p-2 rounded-lg text-center">
                  <p className="text-[9px] font-mono text-slate-400 uppercase">Latitud</p>
                  <p className="text-xs font-bold font-mono text-slate-700 mt-0.5">{latitude.toFixed(5)}</p>
                </div>
                <div className="bg-white border border-slate-200 p-2 rounded-lg text-center">
                  <p className="text-[9px] font-mono text-slate-400 uppercase">Longitud</p>
                  <p className="text-xs font-bold font-mono text-slate-700 mt-0.5">{longitude.toFixed(5)}</p>
                </div>
              </div>
              <div className="space-y-1">
                {GPS_PRESETS.map((gps, idx) => (
                  <button key={idx} onClick={() => { setUseRealGPS(false); setLatitude(gps.lat); setLongitude(gps.lng); }}
                    className="w-full text-left text-[11px] text-slate-600 hover:text-blue-600 py-1 px-2 hover:bg-slate-100 rounded transition-colors flex justify-between items-center cursor-pointer">
                    <span>{gps.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">→</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 z-10 relative">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1.5 flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5 text-blue-600 animate-pulse" /> Tu Enlace de Referido
              </span>
              <div className="bg-blue-50/50 border border-blue-100 p-2.5 rounded-xl text-[11px]">
                <p className="font-bold text-blue-600 font-mono truncate">
                  {`https://fidelia.app/invitacion?codigo=${(user?.user_metadata?.name || 'cliente').toLowerCase().replace(/ /g, '-')}`}
                </p>
                <p className="text-slate-600 mt-1 leading-normal text-[11px]">
                  Comparte este enlace con tus amigos. Cuando consuman por primera vez, recibirás puntos extra.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="border-[10px] border-blue-600 rounded-[44px] px-4 py-6 bg-white shadow-2xl max-w-[325px] w-full mx-auto relative overflow-hidden flex flex-col aspect-[9/18]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-blue-600 rounded-b-2xl z-20 flex justify-center items-center">
                <div className="w-12 h-1 bg-white/40 rounded-full" />
              </div>

              <div className="flex-1 mt-4 overflow-y-auto no-scrollbar scroll-smooth">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mb-4 px-2">
                  <span>09:41</span>
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-3 h-3 text-blue-600 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>NFC LIVE</span>
                  </div>
                </div>

                <div className="px-2 mb-4">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-blue-600 font-bold">TARJETERO CLIENTE</span>
                  <h3 className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                    Hola, {user?.user_metadata?.name || 'Cliente'} <Sparkles className="w-4 h-4 text-blue-600" />
                  </h3>
                  <p className="text-[10px] text-slate-500">Visualiza y canjea tus beneficios.</p>
                </div>

                <div className="space-y-4 px-1 mb-5">
                  {cards.length === 0 ? (
                    <div className="text-center py-6 bg-white border border-slate-200 rounded-xl">
                      <p className="text-xs text-slate-400">No tienes tarjetas digitales en tu wallet.</p>
                    </div>
                  ) : (
                    cards.map(card => {
                      const isSelected = selectedCardId === card.id;
                      return (
                        <div key={card.id} onClick={() => setSelectedCardId(card.id)}>
                          {hasCardComponent(card.cardTag) ? (
                            (() => {
                              const CardComponent = getCardComponent(card.cardTag)!;
                              return <CardComponent
                                businessName={card.businessName}
                                cardTitle={card.cardTitle || 'Tarjeta de Fidelidad'}
                                cardTag={card.cardTag || 'Loyalty'}
                                colorHex={card.colorHex || '#3525cd'}
                                secondaryColorHex={(card as any).secondaryColorHex || undefined}
                                totalStamps={card.totalStamps}
                                rewardDescription={card.rewardDescription || 'Recompensa'}
                                category={card.category || ''}
                              />;
                            })()
                          ) : (
                            <RealisticCard
                              businessName={card.businessName}
                              cardTitle={card.cardTitle || 'Tarjeta de Fidelidad'}
                              cardTag={card.cardTag || 'Loyalty'}
                              colorHex={card.colorHex || '#3525cd'}
                              totalStamps={card.totalStamps}
                              rewardDescription={card.rewardDescription || 'Recompensa'}
                              category={card.category || ''}
                            />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {selectedCardId && (() => {
                  const card = cards.find(c => c.id === selectedCardId);
                  if (!card) return null;
                  return (
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs space-y-3 shadow-sm">
                      <div className="border-b border-slate-100 pb-2">
                        <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">TARJETA SELECCIONADA</span>
                        <p className="font-bold text-slate-800 mt-0.5">{card.businessName}</p>
                      </div>
                      <div className="flex flex-col items-center justify-center py-4 bg-slate-50 rounded-xl border border-slate-200/80">
                        <p className="text-[8px] text-slate-400 font-mono uppercase tracking-widest mb-1 font-bold">CÓDIGO DIGITAL</p>
                        <div className="p-3 bg-white rounded-lg">
                          <QrCode className="w-20 h-20 text-slate-800" />
                        </div>
                        <span className="text-[9px] text-slate-600 font-mono tracking-widest mt-2 bg-slate-100 px-2.5 py-0.5 rounded-full uppercase border border-slate-200">
                          ID-{card.id.slice(0, 8)}
                        </span>
                      </div>
                      <div className="flex gap-1.5 pt-1">
                        <button onClick={() => { setActionSuccessMsg(`¡Has ganado 1 punto en ${card.businessName}!`); setTimeout(() => setActionSuccessMsg(''), 3000); }}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 text-[10px] rounded-lg transition-all cursor-pointer border border-slate-200">
                          Escanear Sello
                        </button>
                        <button onClick={() => { setActionSuccessMsg(`¡Canje exitoso en ${card.businessName}!`); setTimeout(() => setActionSuccessMsg(''), 3000); }}
                          className="flex-1 bg-blue-600 text-white hover:bg-blue-700 font-bold py-1.5 text-[10px] rounded-lg transition-all cursor-pointer shadow-sm">
                          Validar Canje
                        </button>
                      </div>
                    </div>
                  );
                })()}

                <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 text-xs shadow-sm">
                  <span className="font-bold text-slate-700 text-[10px] uppercase font-mono block">Ingresar Cupón Referido</span>
                  <p className="text-slate-500 mt-0.5 text-[10px] leading-tight">¿Te invitó un amigo? Ingresa su código.</p>
                  <form onSubmit={handleReferralSubmit} className="mt-3 flex gap-2">
                    <input type="text" value={referralCodeInput} onChange={e => setReferralCodeInput(e.target.value)}
                      placeholder="Ej. nombre-amigo"
                      className="flex-1 px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-slate-800 placeholder:text-slate-400" />
                    <button type="submit" className="bg-blue-600 text-white px-3 py-1 text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-sm">
                      Sumar
                    </button>
                  </form>
                  {referralMsg && (
                    <p className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 p-1.5 rounded mt-2">{referralMsg}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-blue-600 animate-pulse" /> TIENDAS FÍSICAS CERCANAS
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  Ordenadas por distancia (Fórmula de Haversine). Canjea tu beneficio al estar a menos de 100m.
                </p>
              </div>

              {actionSuccessMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold">
                  {actionSuccessMsg}
                </div>
              )}

              <div className="space-y-3">
                {locationsWithDistance.map(loc => {
                  const insideRadius = loc.distance <= 0.1;
                  return (
                    <div key={loc.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2 hover:border-slate-300 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{loc.name}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {loc.address}
                          </p>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          insideRadius ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {loc.distance < 1
                            ? `${(loc.distance * 1000).toFixed(0)} metros`
                            : `${loc.distance.toFixed(1)} km`}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1 text-[9px]">
                        {loc.offers.map((offer, oIdx) => (
                          <span key={oIdx} className="bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono font-bold">
                            <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-400" /> {offer}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200 text-[10px]">
                        <span className="text-slate-400">Teléfono: {loc.phone}</span>
                        {insideRadius ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">● Listo para validación</span>
                        ) : (
                          <span className="text-slate-500 font-mono">Caminando: ~ {(loc.distance * 12).toFixed(0)} min</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
