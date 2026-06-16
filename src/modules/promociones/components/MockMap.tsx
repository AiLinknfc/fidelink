import React from 'react';
import { MapPin, Navigation, Coffee, Utensils, GlassWater } from 'lucide-react';
import { Venue } from '../types';

interface MockMapProps {
  venues: Venue[];
  userLocation: { lat: number; lng: number };
  radiusKm: number;
  onSelectVenue: (venue: Venue) => void;
  selectedVenueId?: string;
  onUpdateLocation: (lat: number, lng: number) => void;
}

export default function MockMap({
  venues,
  userLocation,
  radiusKm,
  onSelectVenue,
  selectedVenueId,
  onUpdateLocation,
}: MockMapProps) {
  const center = { lat: 4.6664, lng: -74.0530 };
  const latScale = 12000;
  const lngScale = 12000;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bar':
        return <GlassWater className="w-4 h-4 text-brand-gold" />;
      case 'cafeteria':
        return <Coffee className="w-4 h-4 text-brand-secondary" />;
      default:
        return <Utensils className="w-4 h-4 text-brand-primary" />;
    }
  };

  const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div className="relative w-full h-[380px] bg-stone-100 border border-stone-200 rounded-3xl overflow-hidden shadow-inner flex flex-col justify-between">
      <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-center bg-white/95 backdrop-blur-md px-3.5 py-2 border border-stone-200 shadow-sm rounded-full">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-mono text-emerald-700 font-semibold tracking-wider uppercase">Escáner de Perímetro Activo</span>
        </div>
        <div className="text-[10px] font-mono text-stone-500">
          Radio: <span className="text-brand-primary font-bold">{radiusKm} km</span>
        </div>
      </div>

      <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-45 pointer-events-none">
        {Array.from({ length: 36 }).map((_, i) => (
          <div key={i} className="border-t border-l border-stone-200 font-mono text-[7px] text-stone-400 p-1">
            {(4.661 + (i % 6) * 0.002).toFixed(4)}N
          </div>
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="border-2 border-dashed border-brand-primary/20 rounded-full transition-all duration-300 bg-brand-primary/5 flex items-center justify-center"
          style={{
            width: `${60 + radiusKm * 100}px`,
            height: `${60 + radiusKm * 100}px`,
          }}
        >
          <div className="w-full h-full border border-brand-primary/10 rounded-full animate-radar-pulse"></div>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative flex items-center justify-center pointer-events-auto">
          <div className="absolute -inset-4 bg-brand-primary/10 rounded-full blur-sm"></div>
          <div className="relative z-10 w-9 h-9 bg-brand-primary border-2 border-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform cursor-pointer" title="Tu Ubicación Actual">
            <Navigation className="w-4 h-4 text-white fill-white transform rotate-45" />
          </div>
        </div>
      </div>

      <div className="absolute inset-0">
        {venues.map((venue) => {
          const latDiff = venue.lat - center.lat;
          const lngDiff = venue.lng - center.lng;
          const distance = getDistanceKm(venue.lat, venue.lng, userLocation.lat, userLocation.lng);
          const isInside = distance <= radiusKm;
          const isSelected = selectedVenueId === venue.id;
          const posX = 50 + lngDiff * lngScale;
          const posY = 50 - latDiff * latScale;

          return (
            <div
              key={venue.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-300"
              style={{ left: `${posX}%`, top: `${posY}%` }}
            >
              <button
                type="button"
                onClick={() => onSelectVenue(venue)}
                className={`relative flex items-center justify-center p-2 rounded-full shadow border transition-all duration-300 focus:outline-none ${
                  isSelected
                    ? 'scale-125 bg-brand-primary border-white fill-white z-30 ring-4 ring-brand-primary/25'
                    : isInside
                      ? 'bg-white border-brand-primary hover:bg-stone-50 z-20'
                      : 'bg-white/80 border-stone-200 hover:bg-stone-50 opacity-60 z-10'
                }`}
              >
                {getCategoryIcon(venue.category)}
                {venue.currentPromoId && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-primary border border-white"></span>
                  </span>
                )}
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 border border-stone-850 px-2 py-1 rounded text-[10px] text-white font-medium whitespace-nowrap pointer-events-none shadow-xl z-50">
                <div className="font-semibold text-[9px] text-stone-200">{venue.name}</div>
                <div className="text-[8px] text-brand-gold font-mono">{distance.toFixed(2)} km</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-3 left-3 right-3 p-2 bg-white/95 backdrop-blur border border-stone-200 rounded-2xl flex items-center justify-between text-[10px] text-stone-500 font-mono z-10 pointer-events-auto shadow-sm">
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-brand-primary" />
          <span>COORD:</span>
          <span className="text-stone-900 font-bold text-[9px]">{userLocation.lat.toFixed(5)}N, {userLocation.lng.toFixed(5)}W</span>
        </div>
        <button
          onClick={() => {
            const randomLat = 4.6664 + (Math.random() - 0.5) * 0.01;
            const randomLng = -74.0530 + (Math.random() - 0.5) * 0.01;
            onUpdateLocation(randomLat, randomLng);
          }}
          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-brand-primary border border-stone-200 rounded-md text-[9px] font-bold transition-colors cursor-pointer"
        >
          Mover Ubicación (Caminar)
        </button>
      </div>
    </div>
  );
}
