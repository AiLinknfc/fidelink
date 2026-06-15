// Types for Modular Customizable Bio Application

export type TemplateType = 'mascota' | 'boda' | 'vehiculo' | 'salon' | 'generico' | 'farmacia' | 'deportes' | 'mecanico' | 'inmobiliaria' | 'artesanias' | 'tecnologia' | 'diseno' | 'vendedor' | 'acarreos' | 'taxis';

export type FontStyle = 'sans' | 'display' | 'serif' | 'mono' | 'grotesk' | 'dm' | 'jakarta' | 'poppins' | 'montserrat' | 'nunito';

export type CardStyle = 'glass' | 'flat' | 'warm' | 'neo' | 'cyberpunk' | 'clinico' | 'deportes' | 'industrial' | 'lujo' | 'natural';

export interface BioStyle {
  themeColor: string; // 'indigo', 'rose', 'emerald', 'sky', 'amber' o '#hexvalue' para color personalizado
  backgroundColor: string; // Tailwind class (e.g. 'bg-slate-900', 'bg-rose-50', etc)
  bgGradient: boolean; // Use template gradient
  fontStyle: FontStyle;
  cardStyle: CardStyle;
  customWallpaper?: string; // Optional image URL
}

// User role for testing the app capabilities
export type DemoUserRole = 'creador' | 'veterinario' | 'invitado' | 'publico' | 'estilista';

// Review schema for community feedback
export interface Review {
  id: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  reply?: string;
  googleSynced?: boolean;
}

// Pet Template Interfaces
export interface MedicalRecord {
  id: string;
  date: string;
  title: string;
  veterinarian: string;
  description: string;
  status: 'completado' | 'pendiente';
  type: 'vacuna' | 'consulta' | 'cirugia' | 'desparasitacion';
}

export interface MedicalCertificate {
  id: string;
  title: string;
  date: string;
  author: string;
  description: string;
  code: string; // Code for validation
}

export interface PetData {
  name: string;
  species: string;
  breed: string;
  age: string;
  birthDate: string;
  ownerName: string;
  ownerContact: string;
  avatarUrl: string;
  medicalHistory: MedicalRecord[];
  certificates: MedicalCertificate[];
  externalServices: {
    trainingUrl?: string;
    travelAgencyUrl?: string;
    funeralServicesUrl?: string;
    groomingUrl?: string;
  };
}

// Wedding Template Interfaces
export interface GuestRSVP {
  id: string;
  name: string;
  status: 'confirmado' | 'rechazado' | 'pendiente';
  companions: number;
  dietaryNotes?: string;
  email: string;
}

export interface GuestPhoto {
  id: string;
  url: string;
  caption: string;
  uploadedBy: string;
  date: string;
}

export interface WeddingData {
  groomName: string;
  brideName: string;
  date: string;
  locationName: string;
  googleMapsUrl?: string;
  story: string;
  coverImage: string;
  rsvps: GuestRSVP[];
  photoAlbum: GuestPhoto[];
}

// Vehiculo Template Interfaces
export interface MaintenanceRecord {
  id: string;
  date: string;
  mileage: number;
  type: string; // e.g. "Cambio de aceite", "Frenos"
  price: number;
  workshop: string;
  notes: string;
  imageUrl?: string;
}

export interface VehicleData {
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  soatPolicyNumber: string;
  soatExpiryDate: string;
  soatUrl?: string;
  technomechanicalDate: string;
  technomechanicalUrl?: string;
  avatarUrl: string;
  maintenanceHistory: MaintenanceRecord[];
  documentsPreview: {
    title: string;
    expiryDate: string;
    fileUrl: string;
  }[];
}

// Salon Template Interfaces
export interface SalonService {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  category: string;
  description: string;
  iconName: string; // Lucide icon alias
}

export interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  clientName: string;
  clientPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'confirmada' | 'completada' | 'cancelada';
}

export interface SalonData {
  name: string;
  address: string;
  phone: string;
  schedule: string;
  services: SalonService[];
  appointments: Appointment[];
}

// Generic Template Interfaces
export interface GenericLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon: string; // Lucide icon alias
  isHighlighted?: boolean;
}

export interface GenericData {
  title: string;
  subtitle: string;
  description: string;
  avatarUrl: string;
  links: GenericLink[];
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
    whatsapp?: string;
  };
}

// Farmacia Template Interfaces
export interface PharmacyProduct {
  name: string;
  price: number;
  category: string;
  requiresPrescription: boolean;
  description: string;
}

export interface PharmacyService {
  name: string;
  description: string;
  duration: string;
}

export interface FarmaciaData {
  name: string;
  address: string;
  phone: string;
  schedule: string;
  pharmacistName: string;
  services: PharmacyService[];
  products: PharmacyProduct[];
}

// Deportes Template Interfaces
export interface WorkoutRoutine {
  id: string;
  name: string;
  day: string;
  exercises: string;
  duration: number;
  level: 'principiante' | 'intermedio' | 'avanzado';
}

export interface DeportesData {
  name: string;
  specialty: string;
  location: string;
  schedule: string;
  avatarUrl: string;
  routines: WorkoutRoutine[];
  achievements: string[];
}

// Mecanico Template Interfaces
export interface ServiceOffering {
  name: string;
  description: string;
  estimatedPrice: number;
  duration: string;
}

export interface MecanicoData {
  name: string;
  address: string;
  phone: string;
  specialty: string;
  schedule: string;
  services: ServiceOffering[];
  certifications: string[];
}

// Inmobiliaria Template Interfaces
export interface Property {
  id: string;
  title: string;
  type: 'venta' | 'arriendo';
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  description: string;
  imageUrl: string;
}

export interface InmobiliariaData {
  name: string;
  agent: string;
  phone: string;
  email: string;
  properties: Property[];
}

// Artesanias Template Interfaces (person-focused)
export interface ArtesaniasData {
  name: string;
  specialty: string;
  location: string;
  contact: string;
  avatarUrl: string;
  products: string[];
  achievements: string[];
}

// Tecnologia Template Interfaces (person-focused)
export interface TecnologiaData {
  name: string;
  role: string;
  company: string;
  contact: string;
  avatarUrl: string;
  skills: string[];
  projects: string[];
}

// Diseno & Publicidad Template Interfaces
export interface DisenoData {
  name: string;
  specialty: string;
  portfolio: string;
  contact: string;
  avatarUrl: string;
  services: string[];
  clients: string[];
}

// Vendedor Template Interfaces
export interface VendedorData {
  name: string;
  company: string;
  specialty: string;
  contact: string;
  avatarUrl: string;
  products: string[];
  achievements: string[];
}

// Acarreos Template Interfaces
export interface AcarreosData {
  name: string;
  vehicleType: string;
  coverage: string;
  contact: string;
  avatarUrl: string;
  services: string[];
  rates: string;
}

// Taxis Template Interfaces
export interface TaxisData {
  name: string;
  company: string;
  coverage: string;
  contact: string;
  avatarUrl: string;
  services: string[];
  rates: string;
}

// Custom sections for any bio (photos, links, documents)
export interface CustomResource {
  id: string;
  title: string;
  type: 'foto' | 'documento' | 'enlace';
  url: string; // url or dummy base64/placeholder
  description?: string;
  dateAdded: string;
}

export interface CustomSection {
  id: string;
  title: string;
  description?: string;
  resources: CustomResource[];
}

// Main Modular Biography Object
export interface Biography {
  id: string;
  slug: string; // e.g. "mi-mascota-max"
  title: string;
  description: string;
  templateType: TemplateType;
  style: BioStyle;
  reviews: Review[];
  googleReviews?: Review[];
  customSections?: CustomSection[];
  // One of these will be populated according to templateType
  pet?: PetData;
  wedding?: WeddingData;
  vehicle?: VehicleData;
  salon?: SalonData;
  generic?: GenericData;
  farmacia?: FarmaciaData;
  deportes?: DeportesData;
  mecanico?: MecanicoData;
  inmobiliaria?: InmobiliariaData;
  artesanias?: ArtesaniasData;
  tecnologia?: TecnologiaData;
  diseno?: DisenoData;
  vendedor?: VendedorData;
  acarreos?: AcarreosData;
  taxis?: TaxisData;
}
