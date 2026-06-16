export interface Product {
  name: string;
  priceOrig: number;
  pricePromo: number;
  description: string;
  imageUrl?: string;
}

export interface Promotion {
  id: string;
  venueId: string;
  title: string;
  description: string;
  discount: number;
  code: string;
  active: boolean;
  category: 'comida' | 'bebida' | 'combo' | 'evento';
  products: Product[];
  radiusKm: number;
  createdAt: string;
  startTime?: string;
  endTime?: string;
}

export type VenueCategory = 'restaurante' | 'bar' | 'gastrobar' | 'cafeteria';

export interface Venue {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: VenueCategory;
  info: string;
  rating: number;
  address: string;
  image: string;
  phone: string;
  currentPromoId?: string;
}

export interface Reservation {
  id: string;
  userEmail: string;
  userName: string;
  venueId: string;
  venueName: string;
  promoId?: string;
  promoTitle?: string;
  discount: number;
  guests: number;
  dateTime: string;
  status: 'confirmada' | 'cancelada';
  loyaltyPointsAwarded: number;
  notes?: string;
}

export type UserTier = 'Bronce' | 'Plata' | 'Oro' | 'Platino';

export interface UserStats {
  email: string;
  name: string;
  phone: string;
  loyaltyPoints: number;
  tier: UserTier;
  reservationsCount: number;
  pointsToNextTier: number;
}

export interface NotificationBroadcast {
  id: string;
  title: string;
  message: string;
  venueId: string;
  venueName: string;
  promoId: string;
  radiusKm: number;
  distance: number;
  timestamp: string;
  read: boolean;
  discount: number;
}

export interface DemoState {
  userLocation: { lat: number; lng: number };
  searchRadiusKm: number;
}

export interface ChatMessage {
  id: string;
  userName: string;
  userTier?: UserTier;
  message: string;
  timestamp: string;
  venueRelation?: string;
}
