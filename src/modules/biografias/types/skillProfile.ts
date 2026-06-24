export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  deliveryDays: number;
  rating: number;
  reviewsCount: number;
  images?: string[];
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stockStatus: 'available' | 'limited' | 'out_of_stock';
  rating: number;
  reviewsCount: number;
  images?: string[];
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  fileUrl?: string;
}

export interface SkillProfile {
  id: string;
  type: 'individual' | 'company' | 'propietario' | 'mascota' | 'evento' | 'vehiculo' | 'casa' | 'boda' | 'restaurante';
  name: string;
  avatar: string;
  tagline: string;
  bio: string;
  skills: string[];
  rating: number;
  reviewsCount: number;
  location: string;
  colorPreset?: string;
  activeModules?: string[];
  testimonials?: { author: string; text: string; rating: number }[];
  whatsapp?: string;
  slug?: string;
  isPublic?: boolean;
  certificates?: Certificate[];
  services?: Service[];
  products?: Product[];
  openingHours?: {
    enabled: boolean;
    mondayToFriday: string;
    saturday: string;
    sunday: string;
    type: 'hours' | 'appointment';
    appointmentLink?: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  referralTier?: 'oro' | 'plata' | 'bronce';
  agentConfig?: {
    enabled: boolean;
    agentName: string;
    requirementsInstruction: string;
    maxBudget: number;
    autoApproveTrades: boolean;
  };
}

export interface Transaction {
  id: string;
  timestamp: string;
  buyerName: string;
  buyerType: 'individual' | 'company' | 'automated_agent';
  sellerName: string;
  itemName: string;
  itemType: 'service' | 'product';
  price: number;
  status: 'pending' | 'completed' | 'delivered';
  executionMode: 'manual' | 'agentic';
  agentLog?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
  proposedAction?: {
    type: 'buy_service' | 'buy_product';
    itemId: string;
    sellerId: string;
    price: number;
    title: string;
  };
}
