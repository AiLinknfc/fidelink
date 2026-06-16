import React, { useEffect, useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import {
  MapPin,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Bell,
  Calendar,
  Users,
  Award,
  Store,
  Sliders,
  ListFilter,
  Send,
  Trash2,
  BookmarkCheck,
  ChevronRight,
  PlusCircle,
  MessageSquare,
  Ticket,
  ThumbsUp,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

import { Venue, Promotion, UserStats, NotificationBroadcast, Reservation, ChatMessage } from '../types';
import {
  SEED_VENUES, SEED_PROMOTIONS, SEED_CHAT, SEED_NOTIFICATIONS,
  SIMULATED_CHAT_USERS, SIMULATED_CHAT_MESSAGES, computeTier,
} from '../data/seed';
import MockMap from '../components/MockMap';
import GMap from '../components/GMap';
import BookingModal from '../components/BookingModal';
import LoyaltyPanel from '../components/LoyaltyPanel';

const EXPOSED_MAPS_KEY =
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(EXPOSED_MAPS_KEY) && EXPOSED_MAPS_KEY !== 'YOUR_API_KEY' && EXPOSED_MAPS_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY';

type Segment = 'explorar' | 'lealtad' | 'reservas' | 'chat';

export default function PromocionesPage() {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const activeSegment: Segment = (['explorar', 'lealtad', 'reservas', 'chat'].includes(tab ?? '') ? tab : 'explorar') as Segment;

  const [venues, setVenues] = useState<Venue[]>(SEED_VENUES);
  const [promotions, setPromotions] = useState<Promotion[]>(SEED_PROMOTIONS);
  const [user, setUser] = useState<UserStats | null>(() => {
    try { const s = localStorage.getItem('promolink_user'); return s ? JSON.parse(s) : null; }
    catch { return null; }
  });
  const [notifications, setNotifications] = useState<NotificationBroadcast[]>(SEED_NOTIFICATIONS);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [selectedVenueId, setSelectedVenueId] = useState<string>('v1');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<NotificationBroadcast | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(SEED_CHAT);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [isPostingChat, setIsPostingChat] = useState(false);

  const [userLocation, setUserLocation] = useState({ lat: 4.6664, lng: -74.0530 });
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(1.5);

  const [mapMode, setMapMode] = useState<'google' | 'mock'>('mock');
  const [isMapsKeyDenied, setIsMapsKeyDenied] = useState(false);

  const [mapFilter, setMapFilter] = useState<'all' | 'promos' | 'points_change'>('all');
  const [cedingReservationId, setCedingReservationId] = useState<string | null>(null);
  const [selectedTargetVenueId, setSelectedTargetVenueId] = useState<string>('');
  const [chatReactions, setChatReactions] = useState<Record<string, number>>({});
  const [validatingNearbyExchange, setValidatingNearbyExchange] = useState(false);
  const [validatedExchangeStatus, setValidatedExchangeStatus] = useState<string | null>(null);

  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const [isOwnerPanelOpen, setIsOwnerPanelOpen] = useState(false);
  const [ownerVenueId, setOwnerVenueId] = useState('v3');
  const [geminiPrompt, setGeminiPrompt] = useState('Noche oriental: 2 por 1 en sushis seleccionados y sake caliente gratis para acompañar.');
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [aiGeneratedPromo, setAiGeneratedPromo] = useState<{
    title: string; message: string; description: string; discount: number; products: any[];
  } | null>(null);

  const [creatorTitle, setCreatorTitle] = useState('');
  const [creatorMsg, setCreatorMsg] = useState('');
  const [creatorDesc, setCreatorDesc] = useState('');
  const [creatorDiscount, setCreatorDiscount] = useState(30);
  const [creatorRadius, setCreatorRadius] = useState(1.5);

  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      const isScriptError = event.message?.includes('Script error.');
      const isGmapsSource =
        event.filename?.includes('maps.googleapis.com') ||
        event.filename?.includes('maps.gstatic.com');
      if (isScriptError || isGmapsSource) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    (window as any).gm_authFailure = () => {
      setIsMapsKeyDenied(true);
      setMapMode('mock');
    };
    window.addEventListener('error', handleGlobalError);
    return () => {
      window.removeEventListener('error', handleGlobalError);
      delete (window as any).gm_authFailure;
    };
  }, []);

  // Simulated chat messages every 7 seconds (matches promolink server.ts setInterval)
  useEffect(() => {
    const chatInterval = setInterval(() => {
      const randomUser = SIMULATED_CHAT_USERS[Math.floor(Math.random() * SIMULATED_CHAT_USERS.length)];
      const randomMsg = SIMULATED_CHAT_MESSAGES[Math.floor(Math.random() * SIMULATED_CHAT_MESSAGES.length)];
      const randomVenueName = Math.random() > 0.45
        ? SEED_VENUES[Math.floor(Math.random() * SEED_VENUES.length)].name
        : undefined;

      setChatMessages(prev => {
        const newMsg: ChatMessage = {
          id: `c_${Date.now()}`,
          userName: randomUser.name,
          userTier: randomUser.tier,
          message: randomMsg,
          timestamp: new Date().toISOString(),
          venueRelation: randomVenueName,
        };
        const updated = [...prev, newMsg];
        return updated.length > 40 ? updated.slice(1) : updated;
      });
    }, 7000);
    return () => clearInterval(chatInterval);
  }, []);

  const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const venuesWithDistance = venues.map(v => {
    const dist = getDistanceKm(v.lat, v.lng, userLocation.lat, userLocation.lng);
    const promo = promotions.find(p => p.id === v.currentPromoId && p.active);
    return { ...v, distance: dist, promo };
  }).sort((a, b) => a.distance - b.distance);

  const filteredVenues = venuesWithDistance.filter(v => {
    if (mapFilter === 'promos') return v.promo !== undefined || v.currentPromoId !== null;
    if (mapFilter === 'points_change') return v.rating >= 4.5;
    return true;
  });

  const adjacentVenues = filteredVenues.filter(v => v.distance <= searchRadiusKm);
  const inspectedVenue = venuesWithDistance.find(v => v.id === selectedVenueId) || venuesWithDistance[0];

  const saveUser = (u: UserStats) => {
    setUser(u);
    localStorage.setItem('promolink_user', JSON.stringify(u));
  };

  const handleRegisterInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) return;
    const isNew = !user || user.loyaltyPoints === 0;
    const newUser: UserStats = {
      email: regEmail,
      name: regName,
      phone: regPhone,
      loyaltyPoints: isNew ? 150 : (user?.loyaltyPoints ?? 150),
      tier: 'Bronce',
      reservationsCount: user?.reservationsCount ?? 0,
      pointsToNextTier: 350,
    };
    computeTier(newUser);
    saveUser(newUser);
    setIsRegistering(false);
    setRegName(''); setRegEmail(''); setRegPhone('');
  };

  const handleLocalBook = (payload: {
    userEmail: string; userName: string; venueId: string; venueName: string;
    promoId?: string; promoTitle?: string; discount: number; guests: number;
    dateTime: string; notes?: string;
  }): UserStats => {
    if (!user) throw new Error('Usuario no registrado');
    let pts = 100;
    if (user.tier === 'Plata') pts = 120;
    else if (user.tier === 'Oro') pts = 150;
    else if (user.tier === 'Platino') pts = 200;
    if (payload.promoId) pts += 30;

    const res: Reservation = {
      id: `res_${Date.now()}`,
      ...payload,
      notes: payload.notes ?? '',
      status: 'confirmada',
      loyaltyPointsAwarded: pts,
    };
    setReservations(prev => [res, ...prev]);

    const updated: UserStats = {
      ...user,
      loyaltyPoints: user.loyaltyPoints + pts,
      reservationsCount: user.reservationsCount + 1,
    };
    computeTier(updated);
    saveUser(updated);
    return updated;
  };

  const handleLocalRedeem = (points: number): { code: string; value: string; updatedUser: UserStats } => {
    if (!user || user.loyaltyPoints < points) throw new Error('Puntos insuficientes para este canje');
    let value = '$15,000 COP'; let code = 'LOYAL500';
    if (points >= 2000) { value = '$80,000 COP'; code = 'LOYAL2000'; }
    else if (points >= 1000) { value = '$35,000 COP'; code = 'LOYAL1000'; }
    const updated: UserStats = { ...user, loyaltyPoints: user.loyaltyPoints - points };
    computeTier(updated);
    saveUser(updated);
    return { code, value, updatedUser: updated };
  };

  const cancelReservation = (resId: string) => {
    if (!confirm('¿Estás seguro de cancelar tu reserva? Habrá una penalización de pérdida de la mitad de los puntos acumulados.')) return;
    setReservations(prev => prev.map(r => {
      if (r.id !== resId) return r;
      if (user) {
        const penalty = Math.round(r.loyaltyPointsAwarded * 0.5);
        const updated: UserStats = {
          ...user,
          loyaltyPoints: Math.max(0, user.loyaltyPoints - penalty),
          reservationsCount: Math.max(0, user.reservationsCount - 1),
        };
        computeTier(updated);
        saveUser(updated);
      }
      return { ...r, status: 'cancelada' as const };
    }));
  };

  const handleValidateNearbyExchanges = () => {
    setValidatingNearbyExchange(true);
    setValidatedExchangeStatus(null);
    setTimeout(() => {
      const nearSwappers = venuesWithDistance.filter(v => v.distance <= searchRadiusKm);
      setValidatingNearbyExchange(false);
      if (nearSwappers.length > 0) {
        setValidatedExchangeStatus(`¡Validación Exitosa! Encontramos ${nearSwappers.length} establecimientos cercanos dentro de tus ${searchRadiusKm} km autorizando canjes inmediatos: ${nearSwappers.map(n => n.name).join(', ')}.`);
      } else {
        setValidatedExchangeStatus(`No se detectaron comercios con ofertas activas a un rango de ${searchRadiusKm} km. Intenta expandir el perímetro con el slider.`);
      }
    }, 1200);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;
    setIsPostingChat(true);
    const newMsg: ChatMessage = {
      id: `c_${Date.now()}`,
      userName: user?.name ?? 'Invitado',
      userTier: user?.tier ?? 'Bronce',
      message: newChatMessage,
      timestamp: new Date().toISOString(),
      venueRelation: inspectedVenue?.name,
    };
    setChatMessages(prev => {
      const updated = [...prev, newMsg];
      return updated.length > 40 ? updated.slice(1) : updated;
    });
    setNewChatMessage('');
    setIsPostingChat(false);
  };

  const handleAIGeneratePromo = async () => {
    const venueObj = venues.find(v => v.id === ownerVenueId);
    if (!venueObj || !geminiPrompt.trim()) return;
    setGeminiLoading(true);
    setAiGeneratedPromo(null);
    try {
      const res = await fetch('/api/promotions/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venueName: venueObj.name, category: venueObj.category, descriptionPrompt: geminiPrompt })
      });
      if (!res.ok) throw new Error('La llamada de Gemini backend falló o demoró mucho.');
      const parsed = await res.json();
      setAiGeneratedPromo(parsed);
      setCreatorTitle(parsed.title || '');
      setCreatorMsg(parsed.message || '');
      setCreatorDesc(parsed.description || '');
      setCreatorDiscount(parsed.discount || 30);
    } catch (err: any) {
      alert(err.message || 'Error generando contenido por IA.');
    } finally { setGeminiLoading(false); }
  };

  const handleOwnerCreatePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorTitle || !creatorDiscount) { alert('Debes definir un título y el descuento.'); return; }

    const venueName = venues.find(v => v.id === ownerVenueId)?.name ?? '';
    const promoId = `p_${Date.now()}`;
    const pData = aiGeneratedPromo?.products || [{
      name: 'Producto Premium de la Casa',
      priceOrig: 45000,
      pricePromo: Math.round(45000 * (1 - creatorDiscount / 100)),
      description: 'La especialidad elegida directamente por nuestro chef para el descuento.'
    }];

    const newPromo: Promotion = {
      id: promoId,
      venueId: ownerVenueId,
      title: creatorTitle,
      description: creatorDesc || 'Súper descuento para clientes de cercanía.',
      discount: creatorDiscount,
      code: `${venueName.split(' ')[0].substring(0, 4).toUpperCase()}${creatorDiscount}`,
      active: true,
      category: 'combo',
      radiusKm: creatorRadius,
      createdAt: new Date().toISOString(),
      products: pData,
    };
    setPromotions(prev => [...prev, newPromo]);
    setVenues(prev => prev.map(v => v.id === ownerVenueId ? { ...v, currentPromoId: promoId } : v));

    const notification: NotificationBroadcast = {
      id: `nt_${Date.now()}`,
      title: `¡Promoción Relámpago en ${venueName}!`,
      message: `${creatorTitle} — ${creatorDiscount}% de descuento exclusivo a ${creatorRadius} km`,
      venueId: ownerVenueId,
      venueName,
      promoId,
      radiusKm: creatorRadius,
      distance: 0.1,
      timestamp: new Date().toISOString(),
      read: false,
      discount: creatorDiscount,
    };
    setNotifications(prev => [notification, ...prev]);
    setActiveToast(notification);
    setTimeout(() => setActiveToast(null), 7000);

    alert('¡Promoción activada exitosamente y señal geofence broadcast emitida!');
    setAiGeneratedPromo(null);
    setGeminiPrompt('');
    setIsOwnerPanelOpen(false);
  };

  return (
    <div className="bg-[#FAF8F5] text-stone-800 font-sans min-h-full">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Floating Notification Toast */}
        {activeToast && (
          <div className="fixed bottom-6 right-6 z-50 p-4 bg-white border border-stone-200/80 rounded-3xl shadow-xl max-w-sm transition-transform duration-300 animate-fade-in flex gap-3">
            <div className="p-2.5 bg-brand-primary/5 rounded-2xl text-brand-primary shrink-0 self-start animate-ping">
              <Bell className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono font-bold bg-brand-primary/10 px-2 py-0.5 rounded text-brand-primary border border-brand-primary/15 uppercase tracking-wide">
                Oferta Geocercada Detectada
              </span>
              <h4 className="text-xs font-bold text-stone-900 mt-1 leading-tight">{activeToast.title}</h4>
              <p className="text-[11px] text-stone-600 leading-normal">{activeToast.message}</p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setSelectedVenueId(activeToast.venueId); navigate('/promociones/explorar'); setActiveToast(null); }}
                  className="px-3 py-1.5 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-all"
                >
                  Ver Oferta y Reservar!
                </button>
                <button
                  onClick={() => setActiveToast(null)}
                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200/60 text-stone-500 rounded-lg text-[10px] cursor-pointer"
                >
                  Omitir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: EXPLORAR */}
        {activeSegment === 'explorar' && (
          <div className="space-y-6">
            <section className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm p-4 md:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div>
                  <h2 className="text-base font-serif font-extrabold text-stone-900 flex items-center gap-2">
                    <Store className="w-5 h-5 text-brand-primary" />
                    Geopromo
                  </h2>
                  <p className="text-[11px] text-stone-500">
                    Visualiza locales, ofertas geocercadas en tiempo real y controla el perímetro de tu señal GPS
                  </p>
                </div>
                <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setMapMode('google')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${mapMode === 'google' ? 'bg-brand-primary text-white shadow-sm font-extrabold' : 'text-stone-600 hover:text-stone-900'}`}
                  >
                    <Sparkles className="w-3 h-3 text-current" />
                    Google Maps API
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapMode('mock')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${mapMode === 'mock' ? 'bg-brand-primary text-white shadow-sm font-extrabold' : 'text-stone-600 hover:text-stone-900'}`}
                  >
                    <MapPin className="w-3 h-3 text-current" />
                    Mapeo Radar Interactivo
                  </button>
                </div>
              </div>

              <div className="h-[460px] relative rounded-2xl overflow-hidden border border-stone-200">
                {(hasValidKey && mapMode === 'google') ? (
                  <APIProvider apiKey={EXPOSED_MAPS_KEY} version="weekly">
                    <GMap
                      venues={filteredVenues}
                      userLocation={userLocation}
                      radiusKm={searchRadiusKm}
                      onSelectVenue={(v) => setSelectedVenueId(v.id)}
                      selectedVenueId={selectedVenueId}
                      onUpdateLocation={(lat, lng) => setUserLocation({ lat, lng })}
                    />
                  </APIProvider>
                ) : (
                  <MockMap
                    venues={filteredVenues}
                    userLocation={userLocation}
                    radiusKm={searchRadiusKm}
                    onSelectVenue={(v) => setSelectedVenueId(v.id)}
                    selectedVenueId={selectedVenueId}
                    onUpdateLocation={(lat, lng) => setUserLocation({ lat, lng })}
                  />
                )}
              </div>

              <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-primary" />
                    <div className="text-xs font-mono">
                      <span className="text-stone-550 font-semibold uppercase tracking-wider text-[9px] mr-1.5 bg-stone-100 px-1.5 py-0.5 rounded">GPS actual</span>
                      <strong className="text-stone-900 font-bold text-[11px]">{userLocation.lat.toFixed(6)}N, {userLocation.lng.toFixed(6)}W</strong>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleValidateNearbyExchanges}
                      disabled={validatingNearbyExchange}
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 active:scale-95 text-[10px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-stone-300"
                    >
                      <Bell className="w-3.5 h-3.5 text-brand-gold fill-current" />
                      {validatingNearbyExchange ? 'Validando Canjes...' : 'Notificaciones: Validar Canjes Cercanos'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const randomLat = 4.6664 + (Math.random() - 0.5) * 0.008;
                        const randomLng = -74.0530 + (Math.random() - 0.5) * 0.008;
                        setUserLocation({ lat: randomLat, lng: randomLng });
                      }}
                      className="px-3.5 py-2 bg-brand-primary hover:bg-brand-primary/95 text-white active:scale-95 text-[10px] font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-white animate-bounce" />
                      Simular Caminata de Usuario
                    </button>
                  </div>
                </div>

                {validatedExchangeStatus && (
                  <div className="p-3 bg-brand-gold/10 border border-brand-gold/20 text-[10px] text-stone-800 rounded-xl leading-relaxed animate-fade-in font-sans">
                    <strong>Pasaporte Club Escáner:</strong> {validatedExchangeStatus}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-1">
                  <div className="space-y-1.5 bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-stone-600 font-bold flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-brand-primary" />
                        Perímetro de Cobertura
                      </span>
                      <span className="text-brand-primary font-bold text-xs">{searchRadiusKm.toFixed(1)} km</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="5.0"
                      step="0.1"
                      value={searchRadiusKm}
                      onChange={(e) => setSearchRadiusKm(Number(e.target.value))}
                      className="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                    />
                    <div className="flex justify-between text-[8px] font-mono text-stone-400">
                      <span>50m</span><span>1.5km</span><span>3.0km</span><span>5.0km</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
                    <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-widest block">
                      Filtros del Escáner Radar
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                      {([
                        { key: 'all', label: `Todos (${venuesWithDistance.length})` },
                        { key: 'promos', label: `Promociones (${promotions.length})` },
                        { key: 'points_change', label: 'Cambio Puntos' },
                      ] as { key: 'all' | 'promos' | 'points_change'; label: string }[]).map(f => (
                        <button
                          key={f.key}
                          type="button"
                          onClick={() => setMapFilter(f.key)}
                          className={`py-1.5 px-2 rounded-xl text-[9px] font-bold transition-all cursor-pointer border text-center ${
                            mapFilter === f.key
                              ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                              : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {isMapsKeyDenied && mapMode === 'google' && (
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-3xl text-[11px] text-stone-700 space-y-1 my-2 shadow-xs">
                <span className="text-stone-800 font-bold block">Autocorrección de Google Maps (Referencia Restringida)</span>
                <p className="text-[10px] text-stone-500 leading-normal">Te sugerimos pulsar "Mapeo Radar Interactivo" para una simulación totalmente interactiva de tu ubicación GPS.</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <section className="lg:col-span-5 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-extrabold uppercase font-mono tracking-wider text-stone-500 flex items-center gap-1.5">
                      <ListFilter className="w-3.5 h-3.5 text-brand-primary" />
                      Locales Encontrados ({adjacentVenues.length})
                    </h3>
                    <span className="text-[10px] text-stone-400 font-mono">Radio: {searchRadiusKm} km</span>
                  </div>

                  <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                    {adjacentVenues.length === 0 ? (
                      <div className="p-8 border border-dashed border-stone-200 bg-white/50 rounded-3xl text-center space-y-2 text-stone-400">
                        <AlertCircle className="w-8 h-8 text-brand-primary mx-auto" />
                        <p className="text-xs font-semibold text-stone-600">Fuera de Cobertura</p>
                        <p className="text-[10px] max-w-xs mx-auto">Prueba elevando el radio de cobertura a 3.0 km o 5.0 km para encontrar restaurantes cercanos.</p>
                      </div>
                    ) : (
                      adjacentVenues.map((v) => {
                        const isSelected = selectedVenueId === v.id;
                        return (
                          <div
                            key={v.id}
                            onClick={() => setSelectedVenueId(v.id)}
                            className={`p-4 rounded-3xl border transition-all cursor-pointer flex gap-3 ${
                              isSelected
                                ? 'bg-white border-2 border-brand-primary/80 shadow-md shadow-brand-primary/5'
                                : 'bg-white/70 border-stone-200/80 hover:bg-white hover:border-stone-300'
                            }`}
                          >
                            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-stone-100 border border-stone-150">
                              <img src={v.image} alt={v.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="space-y-1 w-full min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-stone-100 border border-stone-200/70 rounded text-stone-600 font-medium">{v.category}</span>
                                <span className="text-[10px] font-mono font-bold text-brand-secondary">{v.distance.toFixed(2)} km</span>
                              </div>
                              <h4 className="text-xs font-bold text-stone-900 truncate font-serif">{v.name}</h4>
                              <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-mono">
                                <span className="text-brand-gold font-bold">★ {v.rating}</span>
                                <span className="text-stone-350">|</span>
                                <span className="truncate">{v.address}</span>
                              </div>
                              {v.promo && (
                                <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[9px] text-brand-primary bg-brand-primary/5 px-2.5 py-0.5 rounded border border-brand-primary/10 w-fit font-bold shadow-sm">
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping"></span>
                                  <span>-{v.promo.discount}% en mesa - {v.promo.title}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </section>

              <section className="lg:col-span-7 space-y-6">
                {inspectedVenue && (
                  <div className="p-6 md:p-8 bg-white border border-stone-200 rounded-3xl space-y-6 relative overflow-hidden shadow-sm">
                    {inspectedVenue.promo && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-primary/5 to-transparent rounded-full blur-2xl"></div>
                    )}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase bg-stone-100 px-2.5 py-1 border border-stone-200 text-brand-primary font-bold rounded-md">{inspectedVenue.category}</span>
                          <span className="text-amber-500 text-xs font-bold font-mono">★ {inspectedVenue.rating}</span>
                        </div>
                        <h3 className="text-2xl font-serif font-extrabold text-stone-900">{inspectedVenue.name}</h3>
                        <p className="text-xs text-stone-500 leading-relaxed font-sans">{inspectedVenue.info}</p>
                      </div>
                      <div className="shrink-0 flex sm:flex-col items-end gap-1.5 font-mono text-xs text-right">
                        <div className="text-brand-secondary font-bold pr-2 sm:pr-0">A {inspectedVenue.distance.toFixed(2)} km de ti</div>
                        <div className="text-stone-400">{inspectedVenue.phone}</div>
                      </div>
                    </div>

                    {inspectedVenue.promo ? (
                      <div className="space-y-5 pt-4 border-t border-stone-100">
                        <div className="p-4 bg-gradient-to-r from-stone-50 to-amber-50/40 border border-brand-primary/10 rounded-2xl shadow-sm">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="text-[9px] font-bold text-brand-primary font-mono uppercase tracking-widest">PROMO RELÁMPAGO ACTIVA</span>
                              <h4 className="text-sm font-bold text-stone-900 font-serif mt-1">{inspectedVenue.promo.title}</h4>
                              <p className="text-xs text-stone-600 mt-1 leading-relaxed">{inspectedVenue.promo.description}</p>
                            </div>
                            <div className="bg-brand-primary text-white rounded-2xl px-3.5 py-2 shrink-0 text-center shadow shadow-brand-primary/15">
                              <div className="text-xl font-bold font-serif">{inspectedVenue.promo.discount}%</div>
                              <div className="text-[9px] font-mono font-bold uppercase tracking-wider">OFF MESA</div>
                            </div>
                          </div>
                          <div className="mt-3.5 flex items-center justify-between text-[11px] font-mono text-stone-500 pt-3 border-t border-stone-200/60">
                            <div>Código: <span className="font-extrabold text-stone-900 text-xs">{inspectedVenue.promo.code}</span></div>
                            <div>Radio: <span className="text-stone-900 font-bold">{inspectedVenue.promo.radiusKm} km</span></div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-stone-850 uppercase font-mono tracking-wider">Especialidades de la Oferta</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {inspectedVenue.promo.products?.map((prod, pIdx) => (
                              <div key={pIdx} className="p-3.5 bg-stone-50/70 border border-stone-200/80 rounded-2xl space-y-1.5 hover:border-stone-300 transition shadow-inner">
                                <div className="flex justify-between items-start gap-2">
                                  <span className="text-[11px] font-bold text-stone-900 leading-tight font-sans">{prod.name}</span>
                                  <div className="text-right font-mono shrink-0">
                                    <div className="text-[9px] text-stone-400 line-through">${prod.priceOrig.toLocaleString()}</div>
                                    <div className="text-[11px] text-brand-primary font-bold">${prod.pricePromo.toLocaleString()}</div>
                                  </div>
                                </div>
                                <p className="text-[10px] text-stone-500 leading-normal line-clamp-2">{prod.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => { if (!user) { setIsRegistering(true); return; } setIsBookingOpen(true); }}
                          className="w-full py-3.5 bg-gradient-to-r from-brand-primary to-brand-gold hover:opacity-95 text-white font-black text-xs rounded-2xl shadow-md shadow-brand-primary/10 select-none text-center transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <BookmarkCheck className="w-4 h-4 text-white" />
                          RESERVAR MESA AL INSTANTE CON DESCUENTO
                        </button>
                      </div>
                    ) : (
                      <div className="p-8 border border-dashed border-stone-200 bg-stone-50/40 rounded-3xl text-center space-y-4 shadow-sm">
                        <Store className="w-8 h-8 text-stone-400 mx-auto" />
                        <div>
                          <p className="text-xs font-bold text-stone-700">No hay ninguna oferta relámpago activa en este momento</p>
                          <p className="text-[10px] text-stone-500 max-w-sm mx-auto mt-1 leading-relaxed">
                            Este lugar no tiene cupones flotantes activos en el radar. Puedes reservar una mesa de forma normal para generar {user ? (user.tier === 'Plata' ? '120' : user.tier === 'Oro' ? '150' : user.tier === 'Platino' ? '200' : '100') : '100'} puntos del club de lealtad.
                          </p>
                        </div>
                        <button
                          onClick={() => { if (!user) { setIsRegistering(true); return; } setIsBookingOpen(true); }}
                          className="py-2.5 px-6 bg-white hover:bg-stone-50 text-stone-750 hover:text-stone-900 rounded-xl text-xs font-bold border border-stone-250 transition cursor-pointer shadow-sm"
                        >
                          Reservar Mesa Estándar (Generar Puntos)
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* TAB: LEALTAD */}
        {activeSegment === 'lealtad' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-7">
              {user ? (
                <LoyaltyPanel user={user} onUpdateUser={saveUser} onRedeem={handleLocalRedeem} />
              ) : (
                <div className="p-10 text-center bg-white border border-stone-200 rounded-3xl space-y-4 shadow-sm">
                  <Award className="w-12 h-12 text-brand-gold mx-auto opacity-80" />
                  <div>
                    <h3 className="text-lg font-serif font-extrabold text-stone-900">Únete al Programa de Lealtad</h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 leading-relaxed">
                      Regístrate gratis para acumular puntos por cada reserva. Redime puntos por descuentos de hasta $80,000 COP y desbloquea multiplicadores VIP de nivel.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsRegistering(true)}
                    className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer inline-block"
                  >
                    Registrarme Ahora
                  </button>
                </div>
              )}
            </div>

            <div className="md:col-span-5 space-y-4">
              <div className="p-5 bg-white border border-stone-200 rounded-3xl space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-bold text-stone-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-brand-primary" />
                    Historial de Emisiones Geocercadas
                  </div>
                  {notifications.length > 0 && (
                    <button onClick={handleClearNotifications} className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-1 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                      Limpiar todo
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center text-stone-400 space-y-1">
                      <p className="text-xs font-semibold text-stone-600">No hay notificaciones vigentes</p>
                      <p className="text-[10px] text-stone-500 max-w-xs mx-auto leading-relaxed">Vuelve al radar de exploración para recibir geocercas cercanas.</p>
                    </div>
                  ) : (
                    notifications.map((not) => (
                      <div key={not.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl relative space-y-1.5 shadow-sm">
                        <span className="text-[8px] font-mono font-bold text-stone-400 absolute top-3 right-3">
                          {new Date(not.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <h5 className="text-[11px] font-extrabold text-stone-900 pr-10">{not.title}</h5>
                        <p className="text-[10px] text-stone-600 leading-normal">{not.message}</p>
                        <div className="flex items-center justify-between text-[8px] text-stone-400 font-mono pt-1">
                          <span>Radio: {not.radiusKm} km</span>
                          <span className="text-brand-primary font-bold">Reserva al instante</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CHAT */}
        {activeSegment === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 bg-white border border-stone-200 rounded-3xl space-y-3.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-primary"></span>
                  </span>
                  <h3 className="text-sm font-serif font-black text-stone-900 uppercase tracking-wide">Mesa de Comentarios Activa</h3>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">
                  ¿Quieres saber qué establecimientos tienen ofertas relámpago o eventos especiales en la Zona T? Únete al chat en vivo de <strong>PromoLink</strong>.
                </p>
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-150 flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-stone-550">Usuarios Activos en Zona:</span>
                  <span className="text-brand-primary font-black animate-pulse">{34 + chatMessages.length * 2} Clientes</span>
                </div>
                <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-brand-gold/15 text-[11px] text-stone-750 space-y-1">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-brand-gold" />
                    Rangos de Club de Lealtad
                  </div>
                  <p>Tus comentarios heredarán la insignia de tu estado de membresía actual (Membresía Bronce, Plata, Oro o Platino).</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[550px]">
                <div className="bg-stone-50 border-b border-stone-200 p-4 px-6 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-brand-primary" />
                    <span className="text-xs font-bold text-stone-900 font-serif">PromoLink Streaming Chat Room</span>
                  </div>
                  <span className="text-[10px] bg-stone-200/60 text-stone-600 font-mono font-bold px-2.5 py-0.5 rounded-full">Sincronización en vivo 3s</span>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-stone-50/50 flex flex-col">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-2">
                      <MessageSquare className="w-8 h-8 text-stone-300 animate-bounce" />
                      <p className="text-xs font-semibold">Iniciando feed de comentarios en tiempo real...</p>
                    </div>
                  ) : (
                    chatMessages.map((msg, index) => {
                      const distanceFromEnd = chatMessages.length - 1 - index;
                      const opacityClass = distanceFromEnd === 0 ? 'opacity-100' : distanceFromEnd === 1 ? 'opacity-90' : distanceFromEnd === 2 ? 'opacity-75' : distanceFromEnd === 3 ? 'opacity-65' : 'opacity-50';
                      const badgeBg = msg.userTier === 'Platino' ? 'bg-rose-100 text-rose-800 border-rose-200' : msg.userTier === 'Oro' ? 'bg-amber-100 text-amber-800 border-amber-200' : msg.userTier === 'Plata' ? 'bg-sky-100 text-sky-800 border-sky-200' : 'bg-stone-100 text-stone-600 border-stone-150';
                      return (
                        <div key={msg.id} className={`flex flex-col space-y-1.5 max-w-[85%] bg-white border border-stone-200 p-4 rounded-2xl shadow-xs transition-all duration-300 hover:opacity-100 self-start relative group ${opacityClass}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-stone-900 font-serif">{msg.userName}</span>
                            <span className={`text-[8px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded border ${badgeBg}`}>{msg.userTier}</span>
                            {msg.venueRelation && (
                              <span className="text-[9px] text-brand-primary font-bold bg-brand-primary/5 px-1.5 py-0.5 rounded font-sans shrink-0 border border-brand-primary/10">@ {msg.venueRelation}</span>
                            )}
                          </div>
                          <p className="text-xs text-stone-700 leading-normal font-sans">{msg.message}</p>
                          <div className="flex items-center gap-2 pt-1 border-t border-stone-100/60 mt-1">
                            <button type="button" onClick={() => setChatReactions(r => ({ ...r, [msg.id]: (r[msg.id] || (index % 3) + 2) + 1 }))} className="p-1 px-2 hover:bg-stone-100 rounded-lg text-[10px] text-stone-500 font-mono font-bold flex items-center gap-1 transition-all duration-150 active:scale-95 cursor-pointer border border-transparent hover:border-stone-200">
                              <ThumbsUp className="w-3 h-3 text-stone-600" />
                              <span>{chatReactions[msg.id] || (index % 3) + 2}</span>
                            </button>
                            <button type="button" onClick={() => setChatReactions(r => ({ ...r, [`${msg.id}_star`]: (r[`${msg.id}_star`] || (index % 2) + 1) + 1 }))} className="p-1 px-2 hover:bg-stone-100 rounded-lg text-[10px] text-stone-500 font-mono font-bold flex items-center gap-1 transition-all duration-150 active:scale-95 cursor-pointer border border-transparent hover:border-stone-200">
                              <Sparkles className="w-3 h-3 text-brand-gold fill-current" />
                              <span>{chatReactions[`${msg.id}_star`] || (index % 2) + 1}</span>
                            </button>
                            <button type="button" onClick={() => setChatReactions(r => ({ ...r, [`${msg.id}_heart`]: (r[`${msg.id}_heart`] || (index % 4) + 3) + 1 }))} className="p-1 px-2 hover:bg-stone-100 rounded-lg text-[10px] text-stone-500 font-mono font-bold flex items-center gap-1 transition-all duration-150 active:scale-95 cursor-pointer border border-transparent hover:border-stone-200">
                              <Award className="w-3 h-3 text-brand-secondary fill-current" />
                              <span>{chatReactions[`${msg.id}_heart`] || (index % 4) + 3}</span>
                            </button>
                          </div>
                          <span className="text-[8px] text-stone-400 font-mono absolute top-2.5 right-3">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                <form onSubmit={handleSendChatMessage} className="p-4 border-t border-stone-200 bg-white flex gap-2">
                  <input
                    type="text"
                    value={newChatMessage}
                    onChange={(e) => setNewChatMessage(e.target.value)}
                    required
                    maxLength={100}
                    placeholder={user ? `Escribe un mensaje para el canal de la Zona T, ${user.name}...` : 'Regístrate en el Club para comentar con tu nombre en vivo...'}
                    className="flex-1 text-xs bg-stone-50 text-stone-900 p-3 px-4 rounded-xl border border-stone-200 focus:outline-none focus:border-brand-primary font-sans placeholder-stone-400"
                  />
                  <button
                    type="submit"
                    disabled={isPostingChat}
                    className="bg-brand-primary hover:bg-brand-primary/95 text-white p-3 rounded-xl transition duration-200 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 shrink-0 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB: RESERVAS */}
        {activeSegment === 'reservas' && (
          <div className="p-6 bg-white border border-stone-200 rounded-3xl space-y-5 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-serif font-black text-stone-900 uppercase tracking-wide flex items-center gap-2">
                <Ticket className="w-5 h-5 text-brand-primary animate-pulse" />
                Tus Tickets de Reserva y Descuento
              </h3>
              <span className="text-[10px] font-mono font-bold uppercase text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-full border border-brand-primary/10">
                PromoLink Instant Seating
              </span>
            </div>
            <p className="text-xs text-stone-500 max-w-2xl">
              Presenta estos boletos digitales de mesa en el establecimiento seleccionado para activar tu cupón de descuento de forma inmediata.
            </p>
            <div className="space-y-4">
              {reservations.length === 0 ? (
                <div className="text-center py-12 text-stone-400 space-y-2 border border-dashed border-stone-250 rounded-2xl bg-stone-50/50">
                  <Calendar className="w-10 h-10 text-stone-300 mx-auto" />
                  <p className="text-xs font-semibold text-stone-600">Aún no has programado ninguna reserva</p>
                  <button onClick={() => navigate('/promociones/explorar')} className="text-xs text-brand-primary hover:underline font-bold mt-1 inline-block cursor-pointer">
                    Explorar establecimientos ahora →
                  </button>
                </div>
              ) : (
                reservations.map((res) => {
                  const isCancelled = res.status === 'cancelada';
                  return (
                    <div key={res.id} className={`relative overflow-hidden rounded-2xl border transition-all ${isCancelled ? 'bg-stone-50/75 border-stone-200 opacity-60' : 'bg-gradient-to-br from-[#FCFBF9] to-white border-stone-250 hover:shadow-md'}`}>
                      <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#FAF8F5] border border-stone-200 rounded-full -translate-y-1/2 hidden md:block"></div>
                      <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#FAF8F5] border border-stone-200 rounded-full -translate-y-1/2 hidden md:block"></div>
                      <div className="p-5 md:px-8 md:py-6 flex flex-col md:flex-row gap-5 items-stretch justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isCancelled ? 'bg-stone-300' : 'bg-brand-primary animate-pulse'}`}></div>
                            <span className="text-[9px] font-mono font-bold uppercase text-brand-primary tracking-wider">
                              {isCancelled ? 'Boleta Reservación Anulada' : 'Boleta Reservación Activa'}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-lg font-serif font-extrabold text-stone-905 leading-tight">{res.venueName}</h4>
                            <p className="text-[10px] text-stone-500 font-mono">ID: #{res.id.toUpperCase()}</p>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-1 text-xs">
                            <div>
                              <span className="text-stone-400 block text-[9px] uppercase font-mono tracking-wider font-semibold">Cita agendada</span>
                              <span className="text-stone-800 font-bold">
                                {new Date(res.dateTime).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })} @ {new Date(res.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div>
                              <span className="text-stone-400 block text-[9px] uppercase font-mono tracking-wider font-semibold">Invitados asignados</span>
                              <span className="text-stone-800 font-black">{res.guests} Puestos</span>
                            </div>
                            <div>
                              <span className="text-stone-400 block text-[9px] uppercase font-mono tracking-wider font-semibold">Beneficio de mesa</span>
                              <span className={`font-black ${isCancelled ? 'text-stone-500' : 'text-brand-primary font-extrabold'}`}>
                                {res.discount > 0 ? `${res.discount}% Descuento` : 'Acceso Reservado Directo'}
                              </span>
                            </div>
                          </div>
                          {res.notes && (
                            <div className="text-[10px] text-stone-600 bg-stone-50 p-2 rounded-xl border border-stone-200/60 max-w-md italic">
                              <strong className="text-stone-805 font-bold not-italic font-mono pr-1">Notas:</strong> {res.notes}
                            </div>
                          )}
                          {res.promoTitle && (
                            <div className="text-[10px] bg-amber-50/70 p-2 rounded-xl border border-brand-gold/15 text-stone-700 leading-tight inline-block">
                              <strong className="text-stone-900 pr-1">Promoción aplicada:</strong> {res.promoTitle} <span className="text-brand-primary font-mono ml-1 font-extrabold">({res.discount}% OFF acumulado)</span>
                            </div>
                          )}
                        </div>
                        <div className="hidden md:block w-px border-l-2 border-dashed border-stone-200 relative self-stretch my-2"></div>
                        <div className="w-full md:w-44 shrink-0 flex flex-col justify-between items-center bg-white p-3.5 rounded-2xl border border-stone-200 text-center space-y-3">
                          <div className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest">Código de Mesa</div>
                          <div className="w-full h-11 flex items-center justify-center gap-[3px] bg-stone-50 border border-stone-100 p-2.5 rounded-lg">
                            {Array.from({ length: 22 }).map((_, i) => {
                              const heightPercent = 100 - (i % 3) * 15;
                              const widthVal = (i % 4 === 0) ? 'w-1' : (i % 3 === 0) ? 'w-[1.5px]' : 'w-[2px]';
                              const opacVal = (i % 6 === 0) ? 'opacity-20' : 'opacity-100';
                              return <div key={i} className={`bg-stone-800 ${widthVal} ${opacVal}`} style={{ height: `${heightPercent}%` }} />;
                            })}
                          </div>
                          <div className="text-[10px] font-black font-mono tracking-widest text-stone-600">
                            {res.id.split('_')[1] ? `PL-${res.id.split('_')[1].slice(-6).toUpperCase()}` : `PL-${Math.floor(100000 + Math.random() * 900000)}`}
                          </div>
                          {!isCancelled ? (
                            <button type="button" onClick={() => cancelReservation(res.id)} className="w-full py-2 text-[9px] bg-stone-50 hover:bg-brand-primary/11 text-brand-primary border border-stone-200 hover:border-brand-primary/30 rounded-xl font-bold transition duration-200 cursor-pointer">
                              Cancelar Boleto
                            </button>
                          ) : (
                            <span className="text-[9px] uppercase font-mono font-black text-stone-400 bg-stone-100 px-3 py-1 rounded-xl">Anulada</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Panel de propietarios */}
        <section className="mt-8 border border-stone-200 bg-white rounded-3xl overflow-hidden shadow-sm transition-all duration-300">
          <button
            type="button"
            onClick={() => setIsOwnerPanelOpen(!isOwnerPanelOpen)}
            className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none hover:bg-stone-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Store className="w-5 h-5 text-brand-primary" />
              <div>
                <h3 className="text-sm font-serif font-black text-stone-900">Fidelización de Comercios (Simulador de Negocios)</h3>
                <p className="text-[10px] text-stone-500 font-mono mt-0.5">Lanza ofertas geocercadas en tiempo real y redáctalas con Gemini AI</p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 text-stone-400 transform transition-transform ${isOwnerPanelOpen ? 'rotate-90' : ''}`} />
          </button>

          {isOwnerPanelOpen && (
            <div className="p-6 md:p-8 bg-stone-50/50 border-t border-stone-200 grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-fade-in">
              <div className="space-y-4">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-lg border border-brand-primary/10">
                  Establecer Promoción Relámpago
                </span>
                <form onSubmit={handleOwnerCreatePromoSubmit} className="space-y-4 text-xs">
                  <div className="space-y-1.5 block">
                    <label className="text-xs font-semibold text-stone-700">Selecciona tu Comercio</label>
                    <select value={ownerVenueId} onChange={(e) => { setOwnerVenueId(e.target.value); setAiGeneratedPromo(null); }} className="w-full bg-white px-3.5 py-3 rounded-xl border border-stone-200 text-stone-900 font-medium focus:border-brand-primary focus:outline-none">
                      {venues.map((ven) => <option key={ven.id} value={ven.id}>{ven.name} ({ven.category})</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700">Rebaja (%)</label>
                      <input type="number" min="10" max="85" value={creatorDiscount} onChange={(e) => setCreatorDiscount(Number(e.target.value))} className="w-full bg-white px-3 py-2.5 rounded-xl border border-stone-200 text-stone-905 font-mono focus:outline-none focus:border-brand-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700">Radio Señal (Km)</label>
                      <input type="number" min="0.5" max="5.0" step="0.5" value={creatorRadius} onChange={(e) => setCreatorRadius(Number(e.target.value))} className="w-full bg-white px-3 py-2.5 rounded-xl border border-stone-200 text-stone-905 font-mono focus:outline-none focus:border-brand-primary" />
                    </div>
                  </div>
                  <div className="space-y-3.5 pt-2 border-t border-stone-200">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700">Título Oferta</label>
                      <input type="text" required placeholder="Ej. Cerveza Gratis por Alitas" value={creatorTitle} onChange={(e) => setCreatorTitle(e.target.value)} className="w-full bg-white px-3.5 py-3 rounded-xl border border-stone-200 text-stone-900 focus:outline-none focus:border-brand-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700">Mensaje Broadcast Push</label>
                      <input type="text" required placeholder="Ej. ¡Happy hour activo! Ven ya por tus Mojitos 2x1." value={creatorMsg} onChange={(e) => setCreatorMsg(e.target.value)} className="w-full bg-white px-3.5 py-3 rounded-xl border border-stone-200 text-stone-900 text-xs focus:outline-none focus:border-brand-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700">Detalles Gastronómicos</label>
                      <textarea required placeholder="Redacción breve de productos de valor..." value={creatorDesc} onChange={(e) => setCreatorDesc(e.target.value)} className="w-full bg-white p-3 rounded-xl border border-stone-200 text-stone-900 text-xs h-16 resize-none focus:outline-none focus:border-brand-primary"></textarea>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-extrabold text-xs rounded-2xl shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-white" />
                    SIMULAR EMISIÓN GEOCERCADA Y NOTIFICAR
                  </button>
                </form>
              </div>

              <div className="space-y-5 p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex gap-1.5 items-center">
                  <Sparkles className="w-4 h-4 text-brand-secondary animate-pulse" />
                  <span className="text-[10px] font-mono font-bold uppercase text-stone-700">Copywriting Creativo con Gemini AI</span>
                </div>
                <div className="space-y-3 font-sans">
                  <p className="text-[11px] text-stone-550 leading-normal">
                    Escribe ingredientes, tu especialidad del día o la idea que desees proponer. La IA formulará un precio optimizado aplicando descuento, títulos estimulantes y alertará un Broadcast sumamente persuasivo.
                  </p>
                  <textarea placeholder="Ej. Ofrecemos tacos al pastor 2x1 y margaritas heladas de mango..." value={geminiPrompt} onChange={(e) => setGeminiPrompt(e.target.value)} className="w-full bg-stone-50 text-stone-800 text-xs p-3 rounded-xl border border-stone-200 h-24 focus:outline-none resize-none focus:border-brand-secondary"></textarea>
                  <button type="button" disabled={geminiLoading || !geminiPrompt.trim()} onClick={handleAIGeneratePromo} className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-brand-secondary border border-stone-300 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-colors">
                    {geminiLoading ? 'Gemini IA Redactando...' : (<><Sparkles className="w-3.5 h-3.5 text-brand-secondary" />Redactar Oferta Gastronómica Completa Súper Atractiva</>)}
                  </button>
                </div>
                {aiGeneratedPromo && (
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3.5 font-sans animate-fade-in shadow-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-stone-150">
                      <span className="text-[9px] font-mono text-brand-gold uppercase font-semibold">Borrador IA Recomendado</span>
                      <button type="button" onClick={() => { setCreatorTitle(aiGeneratedPromo.title); setCreatorMsg(aiGeneratedPromo.message); setCreatorDesc(aiGeneratedPromo.description); setCreatorDiscount(aiGeneratedPromo.discount); }} className="text-[9px] font-mono bg-brand-gold/10 text-brand-gold border border-brand-gold/15 font-bold px-2.5 py-0.5 rounded hover:bg-brand-gold/20 transition cursor-pointer">
                        Aplicar Borrador al Formulario
                      </button>
                    </div>
                    <div className="text-[11px] space-y-2">
                      <div><span className="text-stone-500 font-mono text-[9px] block">TÍTULO PROPUESTO:</span><div className="font-bold text-stone-900 text-xs">{aiGeneratedPromo.title}</div></div>
                      <div><span className="text-stone-500 font-mono text-[9px] block">MENSAJE PUSH:</span><div className="text-stone-700 leading-normal mb-1">{aiGeneratedPromo.message}</div></div>
                      <div>
                        <span className="text-stone-500 font-mono text-[9px] block">PRODUCTOS Y DESCUENTOS:</span>
                        <div className="text-stone-600 leading-normal italic text-[10px]">{aiGeneratedPromo.description}</div>
                        <div className="mt-1.5 space-y-1">
                          {aiGeneratedPromo.products?.map((p: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-[10px] font-mono">
                              <span className="text-stone-700">{p.name}</span>
                              <span className="text-brand-primary font-bold">${p.pricePromo.toLocaleString()} COP</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Booking Modal */}
      {isBookingOpen && inspectedVenue && user && (
        <BookingModal
          venue={inspectedVenue}
          promo={inspectedVenue.promo || undefined}
          user={user}
          onClose={() => setIsBookingOpen(false)}
          onBook={handleLocalBook}
          onSuccess={(u) => {
            saveUser(u);
            setIsBookingOpen(false);
            navigate('/promociones/reservas');
          }}
        />
      )}

      {/* Registration Modal */}
      {isRegistering && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6">
            <h3 className="text-lg font-serif font-black text-stone-900">Registro en el Programa de Lealtad</h3>
            <p className="text-xs text-stone-500 mt-1">Ingresa tus datos para registrarte, ganar un código de bienvenida de $15K y trackear tus puntos.</p>
            <form onSubmit={handleRegisterInput} className="mt-4 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-stone-600 font-semibold">Nombre de usuario</label>
                <input type="text" required placeholder="Alexander" value={regName} onChange={(e) => setRegName(e.target.value)} className="w-full bg-stone-50 text-stone-900 font-medium p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-stone-600 font-semibold">Correo electrónico</label>
                <input type="email" required placeholder="alexander@correo.co" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full bg-stone-50 text-stone-900 p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-stone-600 font-semibold">Teléfono móvil</label>
                <input type="text" placeholder="3103456789" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} className="w-full bg-stone-50 text-stone-900 p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand-primary" />
              </div>
              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={() => setIsRegistering(false)} className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold transition cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl font-bold transition cursor-pointer">Registrarse</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
