import React, { useEffect } from 'react';
import { Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { Venue } from '../types';

interface GMapProps {
  venues: Venue[];
  userLocation: { lat: number; lng: number };
  radiusKm: number;
  onSelectVenue: (venue: Venue) => void;
  selectedVenueId?: string;
  onUpdateLocation: (lat: number, lng: number) => void;
}

function MapController({ userLocation, radiusKm }: { userLocation: { lat: number; lng: number }; radiusKm: number }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.panTo(userLocation);
    if (radiusKm <= 0.5) map.setZoom(16);
    else if (radiusKm <= 1.5) map.setZoom(15);
    else if (radiusKm <= 3.0) map.setZoom(14);
    else map.setZoom(13);
  }, [map, userLocation, radiusKm]);

  return null;
}

export default function GMap({
  venues,
  userLocation,
  radiusKm,
  onSelectVenue,
  selectedVenueId,
  onUpdateLocation,
}: GMapProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bar': return '#f59e0b';
      case 'cafeteria': return '#10b981';
      default: return '#f43f5e';
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      onUpdateLocation(e.latLng.lat(), e.latLng.lng());
    }
  };

  return (
    <div className="relative w-full h-[380px] bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-md">
      <Map
        defaultCenter={userLocation}
        defaultZoom={15}
        mapId="DEMO_MAP_ID"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        onClick={handleMapClick}
        style={{ width: '100%', height: '100%' }}
        disableDefaultUI={true}
        zoomControl={true}
      >
        <MapController userLocation={userLocation} radiusKm={radiusKm} />

        <AdvancedMarker position={userLocation} title="Tu ubicación simulada">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-500 opacity-70"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-600 border-2 border-white shadow-md"></span>
          </div>
        </AdvancedMarker>

        {venues.map((venue) => {
          const isSelected = selectedVenueId === venue.id;
          const pinColor = getCategoryColor(venue.category);
          return (
            <AdvancedMarker
              key={venue.id}
              position={{ lat: venue.lat, lng: venue.lng }}
              title={venue.name}
              onClick={() => onSelectVenue(venue)}
            >
              <Pin
                background={pinColor}
                borderColor={isSelected ? '#ffffff' : pinColor}
                glyphColor="#ffffff"
                scale={isSelected ? 1.3 : 1.0}
              />
            </AdvancedMarker>
          );
        })}
      </Map>

      <div className="absolute bottom-3 left-3 right-3 py-1.5 px-3 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl text-center text-[10px] text-rose-400 font-medium pointer-events-none shadow-xl">
        <span className="text-white">Haz clic en cualquier punto del mapa</span> para simular caminar y actualizar tu GPS
      </div>
    </div>
  );
}
