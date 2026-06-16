import { Venue, Promotion, UserStats, Reservation, ChatMessage, NotificationBroadcast } from '../types';

export const SEED_VENUES: Venue[] = [
  {
    id: 'v1',
    name: 'El Irish Pub - Zona T',
    lat: 4.6668, lng: -74.0534,
    category: 'bar',
    info: 'Pub irlandés rústico conocido por sus cervezas tiradas, alitas picantes crocantes y música rock clásica en vivo.',
    rating: 4.6,
    address: 'Calle 82 No. 12-21, Bogotá',
    phone: '+57 1 616 1221',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=600',
    currentPromoId: 'p1',
  },
  {
    id: 'v2',
    name: 'Gamberro Gastrobar',
    lat: 4.6655, lng: -74.0526,
    category: 'gastrobar',
    info: 'Dúo perfecto entre alta cocina y mixología premium. Ambiente ideal para parejas o cenas de negocios de alta gama.',
    rating: 4.8,
    address: 'Carrera 13 No. 82-45, Bogotá',
    phone: '+57 1 312 9043',
    image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=600',
    currentPromoId: 'p2',
  },
  {
    id: 'v3',
    name: 'Wok & Rolls Oriental',
    lat: 4.6678, lng: -74.0512,
    category: 'restaurante',
    info: 'Comida callejera asiática, sushi fresco por piezas, sabrosos poke bowls y fideos salteados al fuego de wok.',
    rating: 4.5,
    address: 'Calle 83 No. 12-09, Bogotá',
    phone: '+57 1 546 8921',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600',
    currentPromoId: undefined,
  },
  {
    id: 'v4',
    name: 'Andrés Carne de Res (D.C.)',
    lat: 4.6642, lng: -74.0545,
    category: 'restaurante',
    info: 'Platos tradicionales colombianos de carne de res al carbón, rumba teatral animada y un decorado mágico inigualable.',
    rating: 4.7,
    address: 'Calle 81 No. 12-18, Bogotá',
    phone: '+57 1 861 2233',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600',
    currentPromoId: undefined,
  },
  {
    id: 'v5',
    name: 'La Cafebrería & Terraza Studio',
    lat: 4.6710, lng: -74.0505,
    category: 'cafeteria',
    info: 'La parada perfecta para barismo de alta escuela, postres artesanales horneados cada mañana y lecturas agradables sobre una terraza verde.',
    rating: 4.4,
    address: 'Carrera 11 No. 84-24, Bogotá',
    phone: '+57 1 721 8901',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=600',
    currentPromoId: undefined,
  },
  {
    id: 'v6',
    name: 'La Chopería de la 85',
    lat: 4.6698, lng: -74.0478,
    category: 'bar',
    info: 'Bar de cerveza súper helada tipo Chop, alitas BBQ ahumadas enormes de 10 niveles de picor e ideales transmisiones deportivas.',
    rating: 4.3,
    address: 'Calle 85 No. 11-53, Bogotá',
    phone: '+57 301 223 8811',
    image: 'https://images.unsplash.com/photo-1485686531765-ba63b07845a7?auto=format&fit=crop&q=80&w=600',
    currentPromoId: undefined,
  },
];

export const SEED_PROMOTIONS: Promotion[] = [
  {
    id: 'p1',
    venueId: 'v1',
    title: 'Happy Hour de Alitas y Cerveza',
    description: 'Descuento del 30% reservando en la próxima hora. Las mejores alitas picantes con auténtica cerveza roja irlandesa.',
    discount: 30,
    code: 'IRISH30',
    active: true,
    category: 'combo',
    radiusKm: 1.5,
    createdAt: new Date().toISOString(),
    products: [
      { name: 'Alitas de Pollo Picantes (X12)', priceOrig: 32000, pricePromo: 22400, description: 'Alitas de pollo marinadas fritas, bañadas en salsa búfalo picante artesanal de la casa.' },
      { name: 'Pinta de Irish Red Ale Artesanal', priceOrig: 18000, pricePromo: 12600, description: 'Cerveza roja especial con notas de caramelo tostado y malta premium del viejo continente.' },
    ],
  },
  {
    id: 'p2',
    venueId: 'v2',
    title: 'Noche de Autor: Tapas & Gin Rosé',
    description: 'Ven a deleitarte de un 25% de rebaja exclusiva al instante en nuestra carta selecta de tapas y ginebras aromatizadas.',
    discount: 25,
    code: 'GAMBERRO25',
    active: true,
    category: 'comida',
    radiusKm: 1.0,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    products: [
      { name: 'Gin Tonic de Romero Flameado', priceOrig: 42000, pricePromo: 31500, description: 'Ginebra artesanal nacional, agua tónica premium, infusión de romero y cardamomo.' },
      { name: 'Tabla de Tapas Especiales del Chef', priceOrig: 58000, pricePromo: 43500, description: 'Jamón serrano español curado, variedad de quesos maduros nacionales, aceitunas sevillanas y pan con tomate.' },
    ],
  },
];

export const SEED_CHAT: ChatMessage[] = [
  {
    id: 'c_1',
    userName: 'SofiFoodie89',
    userTier: 'Oro',
    message: '¡Hola a todos! ¿Alguien ha probado el Irish Pub hoy? Veo que tienen el Happy Hour con 30% OFF activo.',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    venueRelation: 'El Irish Pub - Zona T',
  },
  {
    id: 'c_2',
    userName: 'JuanBebidas',
    userTier: 'Platino',
    message: 'Acabo de reservar en Gamberro Gastrobar con el Cupón GAMBERRO25. ¡Súper restaurante!',
    timestamp: new Date(Date.now() - 150000).toISOString(),
    venueRelation: 'Gamberro Gastrobar',
  },
  {
    id: 'c_3',
    userName: 'Mateo_Eat',
    userTier: 'Bronce',
    message: 'Recomiendo mucho el Ramen y Sushi de Wok & Rolls, es de locos y el ambiente es genial.',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    venueRelation: 'Wok & Rolls Oriental',
  },
];

export const SEED_NOTIFICATIONS: NotificationBroadcast[] = [
  {
    id: 'nt_seed_1',
    title: '¡Promoción cercana activa! El Irish Pub',
    message: "Promo 'Happy Hour de Alitas y Cerveza' está en marcha a 1.5 km a la redonda de ti. ¡Reserva con 30% OFF!",
    venueId: 'v1',
    venueName: 'El Irish Pub - Zona T',
    promoId: 'p1',
    radiusKm: 1.5,
    distance: 0.05,
    timestamp: new Date().toISOString(),
    read: false,
    discount: 30,
  },
];

export const SIMULATED_CHAT_USERS = [
  { name: 'Cata_Eventos', tier: 'Plata' as const },
  { name: 'SantiCo', tier: 'Bronce' as const },
  { name: 'Luisa_Valle', tier: 'Oro' as const },
  { name: 'FelipeBarman', tier: 'Platino' as const },
  { name: 'BurgerHunter', tier: 'Plata' as const },
  { name: 'CamiloCo', tier: 'Bronce' as const },
];

export const SIMULATED_CHAT_MESSAGES = [
  '¡Increíbles las promociones relámpago! Me encanta PromoLink.',
  '¿Saben si Andrés Carne de Res tiene cupones hoy?',
  'Acabo de caminar cerca de la Zona T y el perímetro GPS me alertó de un 30% en cervezas. ¡Buenísimo!',
  '¡La Cafebrería es espectacular para leer y tomar un espresso doble!',
  'Recomiendo las alitas en El Irish Pub. Crujientes y picantes.',
  '¿Alguien con nivel Platino que me confirme cuánto descuento acumulado da?',
  '¡La Chopería de la 85 es perfecta para ver el partido con amigos!',
  'Reservé mesa para 4 en Gamberro y me dieron el código de inmediato.',
  'Las especialidades en Wok & Rolls están de maravilla.',
  '¡Qué gran idea un mapa interactivo con radar promocional!',
];

export function computeTier(user: UserStats): void {
  const pts = user.loyaltyPoints;
  if (pts >= 3000) { user.tier = 'Platino'; user.pointsToNextTier = 0; }
  else if (pts >= 1500) { user.tier = 'Oro'; user.pointsToNextTier = 3000 - pts; }
  else if (pts >= 500) { user.tier = 'Plata'; user.pointsToNextTier = 1500 - pts; }
  else { user.tier = 'Bronce'; user.pointsToNextTier = 500 - pts; }
}
