import type { Product, Lead, Campaign, PixelEvent, PaymentTransaction, AIAgilityConfig, TrackingConfig, CollectedData } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-colombia-pack",
    name: "Café Premium de Finca - Pack Trilogía",
    price: 35.00,
    description: "Tres orígenes gourmet de fincas cafeteras colombianas seleccionadas (Sierra Nevada, Huila y Antioquia). Granos especiales tostados al origen.",
    category: "Físico",
    imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80",
    deliveryType: "document",
    deliveryContent: "¡Gracias por adquirir el Pack Trilogía! Se ha generado tu orden de despacho #COF-8492. Nuestro socio logístico enviará a tu WhatsApp el número de guía de envío terrestre en las próximas 12 horas.",
    stock: 50
  },
  {
    id: "prod-ebook-barista",
    name: "E-book: El Arte del Barismo en Casa",
    price: 12.00,
    description: "Manual digital exclusivo de preparación de cafés especiales. Aprende sobre moliendas, tiempos de extracción y recetas profesionales para Chemex, Prensa y Espresso.",
    category: "E-book",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    deliveryType: "ebook",
    deliveryContent: "¡Tu e-book está listo para descarga! Haz clic aquí para descargar tu manual completo en formato PDF interactivo de alta resolución: https://docsend.com/view/example-barista-pdf-download",
    stock: 9999
  },
  {
    id: "prod-club-mensual",
    name: "Suscripción VIP Club de Amantes del Café",
    price: 25.00,
    description: "Suscripción mensual recurrente. Recibe cada mes café premium exclusivo y accede a una sesión mensual en vivo de catas y barismo con expertos certificados por la SCA.",
    category: "Membresía",
    imageUrl: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=600&auto=format&fit=crop&q=80",
    deliveryType: "membership",
    deliveryContent: "¡Bienvenido al Club de Amantes del Café! Se ha activado tu membresía VIP recurrente. Aquí tienes tu enlace de acceso del canal de transmisión interactiva en vivo y el grupo VIP: https://discord.gg/example-vip-coffee-club",
    stock: 500
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: "lead-1",
    name: "Juan Carlos Gómez",
    phone: "+57 312 456 7890",
    email: "juancarlos@gmail.com",
    channel: "Facebook Ad",
    status: "qualified",
    score: 85,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    notes: "Preguntó por molienda gruesa para prensa francesa. Alto interés.",
    lastMessage: "¿Viene molido o en grano entero?"
  },
  {
    id: "lead-2",
    name: "Mariana Restrepo",
    phone: "+57 320 890 1234",
    email: "mariana.res@yahoo.com",
    channel: "Instagram Ad",
    status: "converted",
    score: 100,
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
    notes: "Compró el pack de café y el e-book en combo directo.",
    lastMessage: "Pago realizado con éxito por Daviplata."
  },
  {
    id: "lead-3",
    name: "Esteban Rojas",
    phone: "+57 301 234 5678",
    email: "esteban_rojas@hotmail.com",
    channel: "Direct",
    status: "new",
    score: 40,
    createdAt: new Date().toISOString(),
    notes: "Prospecto nuevo. Conversación inicial de bienvenida.",
    lastMessage: "Hola, vi sus anuncios sobre baristas."
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-1",
    name: "Tráfico Frío - Entusiastas del Espresso",
    platform: "facebook",
    status: "active",
    budget: 15.00,
    spent: 120.50,
    impressions: 12800,
    clicks: 810,
    leads: 45,
    purchases: 12,
    pixelId: "px-meta-9283-coffee"
  },
  {
    id: "camp-2",
    name: "Conversión Directa - Lanzamiento E-book",
    platform: "instagram",
    status: "active",
    budget: 20.00,
    spent: 165.00,
    impressions: 19400,
    clicks: 1140,
    leads: 72,
    purchases: 18,
    pixelId: "px-meta-9283-coffee"
  }
];

export const INITIAL_PIXEL_EVENTS: PixelEvent[] = [
  {
    id: "evt-121",
    eventName: "PageView",
    source: "Pixel Browser",
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    url: "/landing-page?prod=prod-colombia-pack",
    payload: { pixel_id: "px-meta-9283-coffee", referrer: "instagram_ad" }
  },
  {
    id: "evt-122",
    eventName: "Contact",
    source: "Pixel Browser",
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
    url: "/whatsapp-simulation",
    payload: { phone: "+573012345678", source: "landing_floating_button" }
  }
];

export const INITIAL_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: "tx-201",
    leadName: "Mariana Restrepo",
    productName: "Café Premium de Finca - Pack Trilogía",
    amount: 35.00,
    gateway: "Daviplata",
    status: "completed",
    timestamp: new Date(Date.now() - 36 * 3600000).toISOString()
  }
];

export const INITIAL_AGENT_CONFIG: AIAgilityConfig = {
  merchantName: "Orígenes Café Gourmet",
  agentTone: "friendly",
  systemInstructions: "Eres un vendedor experto en cafés especiales colombianos de la tienda 'Orígenes Café Gourmet'. Tu objetivo es aconsejar amigablemente sobre barismo, tipos de moliendas y variedades, calificar al lead y persuadirlo sutilmente de adquirir nuestros productos. Siempre sé servicial y educado.",
  welcomeMessage: "¡Hola! Bienvenido a Orígenes Café Gourmet. Escríbeme y estaré feliz de guiarte sobre cuál es el mejor café para tu mañana de acuerdo con tu cafetera favorita. ☕✨",
  autoRecommendThreshold: 75,
  telegramToken: '',
  openAiApiKey: '',
  pixelId: ''
};

export const INITIAL_COLLECTED_DATA: CollectedData[] = [
  {
    id: "collected-1",
    email: "carlos@example.com",
    phone: "+573001112233",
    eventName: "Purchase",
    timestamp: new Date(Date.now() - 600000).toISOString(),
    amount: 35000,
    currency: "COP",
    source: "Telegram",
    rawConversation: "Cliente: Quiero comprar el café\nAsistente: Claro, te paso el link de pago"
  },
  {
    id: "collected-2",
    email: "maria@example.com",
    phone: "+573004445566",
    eventName: "Purchase",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    amount: 12000,
    currency: "COP",
    source: "Telegram",
    rawConversation: "Cliente: Me interesa el ebook\nAsistente: Genial, aquí está tu enlace"
  }
];

export function generateFallbackResponse(message: string, userName: string) {
  const lowercase = message.toLowerCase();

  if (lowercase.includes("comprar") || lowercase.includes("precio") || lowercase.includes("vale") || lowercase.includes("costo") || lowercase.includes("quiero el de 35") || lowercase.includes("cotizar")) {
    return {
      reply: `¡Excelente elección, ${userName}! ☕ Nuestro "Café Premium de Finca - Pack Trilogía" ($35 COP) es fantástico ya que rinde un montón y disfrutas de tres sabores selectos de fincas cafeteras colombianas auténticas de Sierra Nevada, Antioquia y Huila. El "E-book Barista" ($12 COP) también te guiará para prepararlo a la perfección.\n\nHe generado tu link de pago seguro directo. Haz clic para proceder a la compra de inmediato. 👇`,
      buyerIntentScore: 90,
      shouldRecommendProduct: true,
      productIdToRecommend: "prod-colombia-pack",
      leadTags: "Precios, Compras, Alta Intención"
    };
  }

  if (lowercase.includes("envio") || lowercase.includes("envian") || lowercase.includes("domicilio") || lowercase.includes("despacho")) {
    return {
      reply: `Hola ${userName}, para cafés físicos como nuestro Pack de $35, realizamos despachos terrestres directos e incluimos guías de envío seguras por WhatsApp. El despacho se hace el mismo día. ¡El contenido digital, membresías y ebooks se entregan de forma 100% instantánea justo tras tu pago! ¿Listo para registrar tu pedido?`,
      buyerIntentScore: 78,
      shouldRecommendProduct: false,
      productIdToRecommend: "",
      leadTags: "Dudas de Envío, Caliente"
    };
  }

  return {
    reply: `¡Qué alegría saludarte, ${userName}! ☕ Te comento que en Orígenes Café Gourmet nos apasiona llevar la experiencia cafetera a otro nivel. Tenemos el *Pack Gourmet Trilogía* ($35 COP) para catar cafés excelsos, un *E-book sobre Barismo* ($12) y nuestra *Membresía del Club de Catas* ($25). Cuéntame, ¿qué método de preparación o cafetera sueles usar en tu casa para recomendarte algo de ensueño?`,
    buyerIntentScore: 55,
    shouldRecommendProduct: false,
    productIdToRecommend: "",
    leadTags: "Conversación Inicial, Warm"
  };
}
