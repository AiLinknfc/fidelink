import { useState, useRef, useEffect } from 'react';
import type { Product, Campaign, Message, AIAgilityConfig } from '../types';
import { AdView, LandingView, WhatsAppView, CheckoutView, DeliveryView } from './simulator';
import { generateFallbackResponse } from '../data/ventasData';

interface MobileSimulatorProps {
  products: Product[];
  campaigns: Campaign[];
  agentConfig: AIAgilityConfig;
  activeCampaignId: string;
  onSelectCampaign: (id: string) => void;
  onAddPixelEvent: (eventName: 'PageView' | 'Contact' | 'InitiateCheckout' | 'Purchase' | 'Lead', source: 'Pixel Browser' | 'Conversion API (CAPI)', payload: any) => void;
  onPaymentSuccess: (paymentData: { leadName: string; phone: string; productId: string; amount: number; gateway: string }) => void;
}

export default function MobileSimulator({
  products, campaigns, agentConfig, activeCampaignId, onAddPixelEvent, onPaymentSuccess
}: MobileSimulatorProps) {
  const [mobileTab, setMobileTab] = useState<'ad' | 'landing' | 'whatsapp' | 'checkout' | 'delivery'>('ad');
  const [userName] = useState('Alejandro Silva');
  const [userPhone] = useState('+57 315 888 4422');
  const [inputValue, setInputValue] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [selectedGateway, setSelectedGateway] = useState('Nequi');
  const [isPaying, setIsPaying] = useState(false);
  const [deliveredProduct, setDeliveredProduct] = useState<Product | null>(null);
  const [deliveryContent, setDeliveryContent] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const activeCamp = campaigns.find(c => c.id === activeCampaignId) || campaigns[0];

  const flagshipProduct = products[0] || {
    id: "prod-colombia-pack",
    name: "Café Premium de Finca - Pack Trilogía",
    price: 35,
    description: "Tres orígenes gourmet de fincas colombianas.",
    imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600"
  } as Product;

  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([{
        id: 'welcome',
        sender: 'assistant',
        text: agentConfig.welcomeMessage || '¡Hola! ¿Cómo te puedo ayudar hoy?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  }, [agentConfig]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isAiTyping]);

  const handleAdClick = () => {
    onAddPixelEvent("PageView", "Pixel Browser", { campaignId: activeCampaignId, platform: activeCamp?.platform, userAgent: "mobile_ios" });
    setMobileTab('landing');
  };

  const handleLandingWhaChat = () => {
    onAddPixelEvent("Contact", "Pixel Browser", { campaignId: activeCampaignId, action: "landing_whatsapp_btn_click", phone: userPhone });
    setMobileTab('whatsapp');
  };

  const handleLandingDirectBuy = (prod: Product) => {
    onAddPixelEvent("InitiateCheckout", "Pixel Browser", { campaignId: activeCampaignId, productId: prod.id, value: prod.price });
    setCheckoutProduct(prod);
    setMobileTab('checkout');
  };

  const handleSendMessage = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!inputValue.trim() || isAiTyping) return;

    const userMsgText = inputValue;
    setInputValue('');

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...chatMessages, newMsg];
    setChatMessages(updatedMessages);
    setIsAiTyping(true);

    await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));

    const data = generateFallbackResponse(userMsgText, userName);
    setIsAiTyping(false);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'assistant',
      text: data.reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isPaymentLink: data.shouldRecommendProduct,
      paymentProductName: data.shouldRecommendProduct ? (products.find(p => p.id === data.productIdToRecommend)?.name || flagshipProduct.name) : undefined,
      paymentAmount: data.shouldRecommendProduct ? (products.find(p => p.id === data.productIdToRecommend)?.price || flagshipProduct.price) : undefined,
      paymentUrl: data.shouldRecommendProduct ? data.productIdToRecommend : undefined
    };

    setChatMessages(prev => [...prev, aiMsg]);
  };

  const triggerCheckoutFromChat = (prodId: string) => {
    const prod = products.find(p => p.id === prodId) || flagshipProduct;
    onAddPixelEvent("InitiateCheckout", "Pixel Browser", { source: "whatsapp_payment_link", productId: prod.id, value: prod.price });
    setCheckoutProduct(prod);
    setMobileTab('checkout');
  };

  const handlePayCheckout = () => {
    if (!checkoutProduct) return;
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      onPaymentSuccess({
        leadName: userName,
        phone: userPhone,
        productId: checkoutProduct.id,
        amount: checkoutProduct.price,
        gateway: selectedGateway
      });
      setDeliveredProduct(checkoutProduct);
      setDeliveryContent(checkoutProduct.deliveryContent);
      setMobileTab('delivery');
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-h-screen py-3 bg-transparent" id="smartphone-wrapper">
      <div className="relative w-[310px] h-[610px] bg-slate-100 rounded-[38px] shadow-2xl border border-slate-300 flex flex-col overflow-hidden">
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-28 h-4.5 bg-slate-200 rounded-full z-10 flex items-center justify-center border border-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-12" />
          <span className="w-1 h-1 rounded-full bg-blue-400" />
        </div>
        <div className="h-6 bg-transparent px-4 pt-1 flex justify-between items-center text-[10px] font-bold text-slate-500 select-none z-5">
          <span>09:41</span>
          <div className="flex items-center gap-1">
            <span>5G</span>
            <span className="w-4.5 h-2.5 border border-slate-400 rounded bg-emerald-500 block relative" />
          </div>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {mobileTab === 'ad' && (
            <AdView activeCamp={activeCamp} agentConfig={agentConfig} flagshipProduct={flagshipProduct} handleAdClick={handleAdClick} />
          )}
          {mobileTab === 'landing' && (
            <LandingView products={products} agentConfig={agentConfig}
              handleLandingWhaChat={handleLandingWhaChat} handleLandingDirectBuy={handleLandingDirectBuy} setMobileTab={setMobileTab} />
          )}
          {mobileTab === 'whatsapp' && (
            <WhatsAppView agentConfig={agentConfig} chatMessages={chatMessages} isAiTyping={isAiTyping}
              inputValue={inputValue} setInputValue={setInputValue} handleSendMessage={handleSendMessage}
              triggerCheckoutFromChat={triggerCheckoutFromChat} setMobileTab={setMobileTab}
              chatContainerRef={chatContainerRef} />
          )}
          {mobileTab === 'checkout' && checkoutProduct && (
            <CheckoutView checkoutProduct={checkoutProduct} selectedGateway={selectedGateway}
              setSelectedGateway={setSelectedGateway} isPaying={isPaying}
              handlePayCheckout={handlePayCheckout} setMobileTab={setMobileTab} />
          )}
          {mobileTab === 'delivery' && deliveredProduct && (
            <DeliveryView deliveredProduct={deliveredProduct} deliveryContent={deliveryContent}
              setChatMessages={setChatMessages} setMobileTab={setMobileTab} />
          )}
        </div>
        <div className="h-4 flex items-center justify-center">
          <span className="w-1/3 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}
