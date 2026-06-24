import { SkillProfile } from '../types/skillProfile';

const COLOR_PRESETS = ['royal-blue', 'modern-coral', 'neon-emerald', 'warm-amber', 'minimal-slate'];

export const SKILL_SEED_PROFILES: SkillProfile[] = [
  {
    id: 'prof-1',
    type: 'individual',
    name: 'Dra. Sofía Mendoza',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200',
    tagline: 'Experta en Inteligencia Artificial y Visión por Computador',
    bio: 'Doctora en Ciencias de la Computación con más de 8 años integrando modelos de Deep Learning para automatización industrial y diagnóstico inteligente.',
    skills: ['PyTorch', 'OpenCV', 'Visión Artificial', 'Gemini API', 'FastAPI', 'IA Generativa'],
    rating: 4.9,
    reviewsCount: 25,
    location: 'Monterrey, México',
    colorPreset: 'neon-emerald',
    activeModules: ['services', 'skills', 'stats', 'testimonials', 'location'],
    testimonials: [
      { author: 'Ing. Carlos Ortiz (Socio)', text: 'Sofía estructuró nuestra arquitectura de detección de fallas con PyTorch en tiempo récord.', rating: 5 }
    ],
    services: [
      { id: 'ser-1-1', title: 'Diseño y viabilidad de arquitectura de IA', description: 'Análisis detallado de tu caso de uso de IA, selección de modelos óptimos y costos estimados de inferencia.', price: 120, deliveryDays: 2, rating: 4.9, reviewsCount: 12 },
      { id: 'ser-1-2', title: 'Optimización de pipeline de Computer Vision', description: 'Mejora en los tiempos de inferencia y la precisión de algoritmos de detección de objetos.', price: 250, deliveryDays: 4, rating: 4.8, reviewsCount: 8 },
      { id: 'ser-1-3', title: 'Consultoría técnica 1-a-1 de 1 hora', description: 'Sesión estratégica online para resolver cuellos de botella técnicos en ML o APIs.', price: 75, deliveryDays: 1, rating: 5, reviewsCount: 4 }
    ],
    coordinates: { lat: -33.4246, lng: -70.6186 },
    whatsapp: '+521811234567',
    slug: 'sofia-mendoza-ai'
  },
  {
    id: 'prof-2',
    type: 'individual',
    name: 'Ignacio Rossi',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200',
    tagline: 'Diseñador de Producto UX/UI & Prototipador Creativo',
    bio: 'Especialista en interfaces interactivas de alto impacto y conversión para productos SaaS, Web3 y Fintech.',
    skills: ['Figma', 'Sistemas de Diseño', 'Framer Motion', 'Tailwind CSS', 'React UI', 'Fintech'],
    rating: 4.8,
    reviewsCount: 37,
    location: 'Buenos Aires, Argentina',
    colorPreset: 'modern-coral',
    activeModules: ['services', 'skills', 'stats', 'testimonials'],
    testimonials: [
      { author: 'Mariana Costa (CTO Fintech)', text: 'Ignacio rediseñó nuestra plataforma de pagos y las conversiones subieron un 34%.', rating: 5 }
    ],
    services: [
      { id: 'ser-2-1', title: 'Diseño UX de Landing Page de Conversión', description: 'Diseño visual pulido de alta conversión en Figma con jerarquías persuasivas.', price: 150, deliveryDays: 3, rating: 4.8, reviewsCount: 19 },
      { id: 'ser-2-2', title: 'Configuración de Sistema de Diseño Base', description: 'Componentes atómicos, variables semánticas de color y biblioteca tipográfica.', price: 300, deliveryDays: 5, rating: 4.9, reviewsCount: 11 }
    ],
    coordinates: { lat: -33.4280, lng: -70.6250 },
    whatsapp: '+5491112345678',
    slug: 'ignacio-rossi-ux'
  },
  {
    id: 'prof-3',
    type: 'company',
    name: 'NeoMétrica AI',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200&h=200',
    tagline: 'SaaS de Automatización Industrial Cognitiva',
    bio: 'Plataforma B2B que integra visión artificial, mantenimiento predictivo y orquestación robótica para plantas de manufactura en Latinoamérica.',
    skills: ['Deep Learning', 'Visión Artificial', 'Gemini API', 'Kubernetes', 'AWS', 'Edge AI'],
    rating: 4.7,
    reviewsCount: 54,
    location: 'Santiago, Chile',
    colorPreset: 'royal-blue',
    activeModules: ['products', 'skills', 'stats'],
    products: [
      { id: 'prod-1', title: 'NeoVision Inspector', description: 'Módulo de inspección visual por IA para líneas de ensamblaje.', price: 1200, stockStatus: 'available', rating: 4.8, reviewsCount: 32 },
      { id: 'prod-2', title: 'Predictive Maintenance Engine', description: 'Algoritmo de predicción de fallos en maquinaria rotativa.', price: 2400, stockStatus: 'available', rating: 4.6, reviewsCount: 18 },
      { id: 'prod-3', title: 'Gemini Orchestrator Add-on', description: 'Conector avanzado con Gemini API para reportes automáticos.', price: 600, stockStatus: 'limited', rating: 4.9, reviewsCount: 7 }
    ],
    coordinates: { lat: -33.4180, lng: -70.5980 },
    whatsapp: '+56912345678',
    slug: 'neometrica-ai'
  },
  {
    id: 'prof-4',
    type: 'propietario',
    name: 'Valle Escondido Lodge',
    avatar: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=200&h=200',
    tagline: 'Cabañas de lujo con vista al volcán',
    bio: 'Complejo turístico con 5 cabañas privadas, piscina termal y acceso directo a senderos del Parque Nacional. Ideal para desconectarse y vivir una experiencia natural única.',
    skills: ['Hospedaje', 'Turismo Aventura', 'Gastronomía Local', 'Eventos Corporativos', 'Spa'],
    rating: 4.9,
    reviewsCount: 83,
    location: 'Puerto Varas, Chile',
    colorPreset: 'warm-amber',
    activeModules: ['services', 'skills', 'stats', 'testimonials', 'location'],
    testimonials: [
      { author: 'Familía González (Húespedes)', text: 'Pasamos una semana increíble. Las cabañas son hermosas y la atención es de primer nivel.', rating: 5 }
    ],
    services: [
      { id: 'ser-4-1', title: 'Cabaña Premium 2 noches', description: 'Cabaña para 4 personas con jacuzzi privado y desayuno incluido.', price: 350, deliveryDays: 1, rating: 4.9, reviewsCount: 45 },
      { id: 'ser-4-2', title: 'Tour Volcán Osorno Guiado', description: 'Excursión de día completo con guía especializado y equipo de trekking.', price: 85, deliveryDays: 1, rating: 4.8, reviewsCount: 32 }
    ],
    coordinates: { lat: -33.4312, lng: -70.6115 },
    slug: 'valle-escondido'
  },
  {
    id: 'prof-5',
    type: 'individual',
    name: 'Camila Rojas',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200',
    tagline: 'Fotógrafa Documental y Creadora Audiovisual',
    bio: 'Narrando historias visuales a través del lente. Especializada en fotografía de naturaleza, retrato documental y producción de video corporativo.',
    skills: ['Fotografía', 'Video Corporativo', 'Edición DaVinci', 'Lightroom', 'Drone', 'Storytelling'],
    rating: 4.7,
    reviewsCount: 41,
    location: 'Bogotá, Colombia',
    colorPreset: 'minimal-slate',
    activeModules: ['services', 'skills', 'testimonials'],
    testimonials: [
      { author: 'Agencia Pulso', text: 'Camila capturó la esencia de nuestra marca como nadie más había logrado.', rating: 5 }
    ],
    services: [
      { id: 'ser-5-1', title: 'Sesión Fotográfica Corporativa', description: 'Fotos profesionales para perfiles de equipo, branding y redes sociales.', price: 200, deliveryDays: 3, rating: 4.7, reviewsCount: 22 },
      { id: 'ser-5-2', title: 'Video Documental 2-3 min', description: 'Producción completa desde la idea hasta la post-producción.', price: 500, deliveryDays: 7, rating: 4.8, reviewsCount: 15 }
    ],
    coordinates: { lat: -33.4110, lng: -70.5880 },
    slug: 'camila-rojas-foto'
  }
];

export function getStoredSkillProfiles(): SkillProfile[] {
  const data = localStorage.getItem('skill_profiles_payload');
  if (data) {
    try {
      return JSON.parse(data);
    } catch { }
  }
  localStorage.setItem('skill_profiles_payload', JSON.stringify(SKILL_SEED_PROFILES));
  return SKILL_SEED_PROFILES;
}

export function saveSkillProfiles(profiles: SkillProfile[]): void {
  localStorage.setItem('skill_profiles_payload', JSON.stringify(profiles));
}

export function getColorPresetStyle(presetId: string = 'royal-blue') {
  const presets: Record<string, {
    name: string;
    borderClass: string;
    accentText: string;
    buttonBg: string;
    bgGradient: string;
    taglineText: string;
  }> = {
    'royal-blue': {
      name: 'Azul Real',
      borderClass: 'border-blue-200 hover:border-blue-400',
      accentText: 'text-blue-600',
      buttonBg: 'bg-indigo-500 hover:bg-indigo-600',
      bgGradient: 'from-blue-50/20 to-white',
      taglineText: 'text-blue-600'
    },
    'modern-coral': {
      name: 'Coral',
      borderClass: 'border-rose-200 hover:border-rose-400',
      accentText: 'text-rose-600',
      buttonBg: 'bg-indigo-500 hover:bg-indigo-600',
      bgGradient: 'from-rose-50/10 to-white',
      taglineText: 'text-rose-600'
    },
    'neon-emerald': {
      name: 'Esmeralda',
      borderClass: 'border-emerald-200 hover:border-emerald-400',
      accentText: 'text-emerald-600',
      buttonBg: 'bg-indigo-500 hover:bg-indigo-600',
      bgGradient: 'from-emerald-50/10 to-white',
      taglineText: 'text-emerald-600'
    },
    'warm-amber': {
      name: 'Ámbar',
      borderClass: 'border-amber-200 hover:border-amber-400',
      accentText: 'text-amber-700',
      buttonBg: 'bg-indigo-500 hover:bg-indigo-600',
      bgGradient: 'from-amber-50/10 to-white',
      taglineText: 'text-amber-700'
    },
    'minimal-slate': {
      name: 'Pizarra',
      borderClass: 'border-slate-200 hover:border-slate-400',
      accentText: 'text-slate-700',
      buttonBg: 'bg-indigo-500 hover:bg-indigo-600',
      bgGradient: 'from-slate-50/20 to-white',
      taglineText: 'text-slate-600'
    }
  };
  return presets[presetId] || presets['royal-blue'];
}
