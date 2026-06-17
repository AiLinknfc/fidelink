export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  deliveryType: 'ebook' | 'course' | 'membership' | 'document';
  deliveryContent: string;
  stock: number;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  channel: 'Direct' | 'Facebook Ad' | 'Instagram Ad' | 'WhatsApp Direct';
  status: 'new' | 'contacted' | 'qualified' | 'nurturing' | 'converted' | 'lost';
  score: number;
  createdAt: string;
  notes: string;
  lastMessage: string;
}

export interface Campaign {
  id: string;
  name: string;
  platform: 'facebook' | 'instagram';
  status: 'active' | 'paused';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  leads: number;
  purchases: number;
  pixelId: string;
}

export interface PixelEvent {
  id: string;
  eventName: 'PageView' | 'Contact' | 'InitiateCheckout' | 'Purchase' | 'Lead';
  source: 'Pixel Browser' | 'Conversion API (CAPI)';
  timestamp: string;
  url: string;
  payload: Record<string, any>;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isPaymentLink?: boolean;
  paymentAmount?: number;
  paymentProductName?: string;
  paymentUrl?: string;
}

export interface AIAgilityConfig {
  merchantName: string;
  agentTone: 'professional' | 'friendly' | 'persuasive' | 'direct';
  systemInstructions: string;
  welcomeMessage: string;
  autoRecommendThreshold: number;
  telegramToken: string;
  openAiApiKey: string;
  pixelId: string;
}

export interface PaymentTransaction {
  id: string;
  leadName: string;
  productName: string;
  amount: number;
  gateway: 'Nequi' | 'Bancolombia' | 'PSE' | 'Daviplata' | 'Tarjeta' | 'PayPal';
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TrackingConfig {
  metaPixelCode: string;
}

export interface CollectedData {
  id: string;
  email: string;
  phone: string;
  eventName: string;
  timestamp: string;
  amount: number;
  currency: string;
  source: string;
  rawConversation: string;
}

export interface DataCollectionConfig {
  telegramToken: string;
  openAiApiKey: string;
  pixelId: string;
}
