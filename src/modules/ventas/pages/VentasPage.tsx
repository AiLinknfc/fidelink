import { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Smartphone, X, Sparkles } from 'lucide-react';
import MobileSimulator from '../components/MobileSimulator';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';
import { useCart } from '@/context/CartContext';
import type { Product, Lead, Campaign, PixelEvent, PaymentTransaction, AIAgilityConfig, CartItem, TrackingConfig } from '../types';
import {
  INITIAL_PRODUCTS, INITIAL_LEADS, INITIAL_CAMPAIGNS,
  INITIAL_PIXEL_EVENTS, INITIAL_TRANSACTIONS, INITIAL_AGENT_CONFIG
} from '../data/ventasData';

export interface VentasContextType {
  products: Product[];
  leads: Lead[];
  campaigns: Campaign[];
  pixelEvents: PixelEvent[];
  transactions: PaymentTransaction[];
  agentConfig: AIAgilityConfig;
  cart: CartItem[];
  trackingConfig: TrackingConfig;
  activeCampaignId: string;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  handleAddProduct: (product: Omit<Product, 'id'>) => void;
  handleAddCampaign: (campaign: Omit<Campaign, 'id' | 'spent' | 'impressions' | 'clicks' | 'leads' | 'purchases'>) => void;
  handleUpdateAgentConfig: (config: AIAgilityConfig) => void;
  handleAddPixelEvent: (eventName: 'PageView' | 'Contact' | 'InitiateCheckout' | 'Purchase' | 'Lead', source: 'Pixel Browser' | 'Conversion API (CAPI)', payload: any) => void;
  handlePaymentSuccess: (data: { leadName: string; phone: string; productId: string; amount: number; gateway: string }) => void;
  handleSaveTrackingConfig: (config: TrackingConfig) => void;
  setActiveCampaignId: (id: string) => void;
  onRefreshData: () => void;
  openSimulator: () => void;
}

export default function VentasPage() {
  useModuleBrand();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [pixelEvents, setPixelEvents] = useState<PixelEvent[]>(INITIAL_PIXEL_EVENTS);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(INITIAL_TRANSACTIONS);
  const [agentConfig, setAgentConfig] = useState<AIAgilityConfig>(INITIAL_AGENT_CONFIG);

  const [activeCampaignId, setActiveCampaignId] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [trackingConfig, setTrackingConfig] = useState<TrackingConfig>({ metaPixelCode: '' });
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();

  useEffect(() => {
    if (campaigns.length > 0 && !activeCampaignId) {
      setActiveCampaignId(campaigns[0].id);
    }
  }, [campaigns, activeCampaignId]);

  const triggerToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddToCart = useCallback((product: Product) => {
    addToCart(product);
    triggerToast(`${product.name} agregado al carrito`);
  }, [addToCart]);

  const handleAddProduct = (newProd: Omit<Product, 'id'>) => {
    const product: Product = { id: "prod-" + Date.now().toString(36), ...newProd };
    setProducts(prev => [product, ...prev]);
    triggerToast('Producto añadido al catálogo de IA con éxito.');
  };

  const handleAddCampaign = (newCamp: Omit<Campaign, 'id' | 'spent' | 'impressions' | 'clicks' | 'leads' | 'purchases'>) => {
    const campaign: Campaign = {
      id: "camp-" + Date.now().toString(36),
      spent: 0, impressions: 0, clicks: 0, leads: 0, purchases: 0,
      ...newCamp
    };
    setCampaigns(prev => [campaign, ...prev]);
    setActiveCampaignId(campaign.id);
    triggerToast(`¡Campaña publicitaria lanzada en Meta (${newCamp.platform}) con éxito!`);
  };

  const handleUpdateAgentConfig = (updated: AIAgilityConfig) => {
    setAgentConfig(updated);
    triggerToast('Directivas de la IA actualizadas.');
  };

  const handleAddPixelEvent = (eventName: 'PageView' | 'Contact' | 'InitiateCheckout' | 'Purchase' | 'Lead', source: 'Pixel Browser' | 'Conversion API (CAPI)', payload: any) => {
    const newEvent: PixelEvent = {
      id: "evt-" + Date.now().toString(),
      eventName, source,
      timestamp: new Date().toISOString(),
      url: window.location.pathname,
      payload: { ...payload, campaignId: activeCampaignId }
    };
    setPixelEvents(prev => [newEvent, ...prev]);

    setCampaigns(prev => prev.map(c => {
      if (c.id === activeCampaignId) {
        return {
          ...c,
          clicks: eventName === 'PageView' ? c.clicks + 1 : c.clicks,
          leads: (eventName === 'Lead' || eventName === 'Contact') ? c.leads + 1 : c.leads,
          purchases: eventName === 'Purchase' ? c.purchases + 1 : c.purchases
        };
      }
      return c;
    }));

    triggerToast(`Meta Evento registrado en vivo: ${eventName}`, 'info');
  };

  const handlePaymentSuccess = (paymentData: { leadName: string; phone: string; productId: string; amount: number; gateway: string }) => {
    const product = products.find(p => p.id === paymentData.productId);
    if (!product) return;

    const newTx: PaymentTransaction = {
      id: "tx-" + Math.floor(Math.random() * 1000 + 100).toString(),
      leadName: paymentData.leadName,
      productName: product.name,
      amount: paymentData.amount,
      gateway: paymentData.gateway as PaymentTransaction['gateway'],
      status: 'completed',
      timestamp: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);

    const updatedLead = leads.find(l => l.phone === paymentData.phone);
    if (updatedLead) {
      setLeads(prev => prev.map(l =>
        l.phone === paymentData.phone
          ? { ...l, status: 'converted', score: 100, notes: l.notes + ` | Compró ${product.name} vía ${paymentData.gateway}.`, lastMessage: `Pago realizado con éxito por ${paymentData.gateway}.` }
          : l
      ));
    } else {
      const newLead: Lead = {
        id: "lead-" + Date.now().toString(36),
        name: paymentData.leadName,
        phone: paymentData.phone,
        email: `${paymentData.leadName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        channel: 'Direct',
        status: 'converted',
        score: 100,
        createdAt: new Date().toISOString(),
        notes: `Compra directa: ${product.name}`,
        lastMessage: `Pago realizado con éxito por ${paymentData.gateway}.`
      };
      setLeads(prev => [newLead, ...prev]);
    }

    const capiEvent: PixelEvent = {
      id: "evt-capi-" + Date.now(),
      eventName: "Purchase",
      source: "Conversion API (CAPI)",
      timestamp: new Date().toISOString(),
      url: "/api/payments/process",
      payload: { phone: paymentData.phone, product_id: paymentData.productId, value: product.price, currency: "COP", gateway: paymentData.gateway, transaction_id: newTx.id }
    };
    setPixelEvents(prev => [capiEvent, ...prev]);

    triggerToast(`¡Pago recibido vía ${paymentData.gateway}! Envío digital despachado de inmediato e inscrito en CAPI.`);
  };

  const handleSaveTrackingConfig = (config: TrackingConfig) => {
    setTrackingConfig(config);
    triggerToast('Tracking codes guardados e inyectados en la página.');
  };

  const contextValue: VentasContextType = {
    products, leads, campaigns, pixelEvents, transactions, agentConfig,
    cart, trackingConfig, activeCampaignId,
    addToCart: handleAddToCart, removeFromCart, updateQuantity, clearCart,
    handleAddProduct, handleAddCampaign, handleUpdateAgentConfig,
    handleAddPixelEvent, handlePaymentSuccess, handleSaveTrackingConfig,
    setActiveCampaignId, onRefreshData: () => {},
    openSimulator: () => setShowPhoneModal(true),
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-slate-900 font-sans relative">
      {notification && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border text-xs font-bold transition-all animate-bounce ${
          notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-indigo-50 border-indigo-200 text-indigo-800'
        }`}>
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{notification.message}</span>
        </div>
      )}

      <div className="flex-1 overflow-hidden relative">
        <Outlet context={contextValue} />
      </div>

      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm" onClick={() => setShowPhoneModal(false)}>
          <div className="relative flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowPhoneModal(false)}
              className="absolute -top-12 right-0 z-10 p-2 bg-white/90 hover:bg-slate-100 text-slate-700 rounded-full transition-all cursor-pointer shadow-md border border-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <MobileSimulator
              products={products}
              campaigns={campaigns}
              agentConfig={agentConfig}
              activeCampaignId={activeCampaignId}
              onSelectCampaign={setActiveCampaignId}
              onAddPixelEvent={handleAddPixelEvent}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}
