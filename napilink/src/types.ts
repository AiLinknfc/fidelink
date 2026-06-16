export interface Business {
  id: string;
  name: string;
  category: string;
  address: string;
  logo: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  businessId: string;
  rating: number;
  ratingsCount: number;
  aliasKey: string;
  bio: string;
  photo: string;
}

export interface Tip {
  id: string;
  businessId: string;
  employeeId: string;
  employeeName: string;
  businessName: string;
  amountCOP: number;
  source: "wallet" | "points";
  pointsUsed?: number;
  pointsPartner?: "Puntos Colombia";
  status: "pending" | "confirmed" | "retracted";
  holdHours: number;
  ratingGiven?: number;
  review?: string;
  createdAt: string;
  unlockAt: string;
  transactionKeySignature: string; // crypto security key simulation details
}

export interface LinkedKey {
  id: string;
  type: string; // "Celular" | "Cédula" | "Email"
  alias: string;
  provider: string; // "Bre-B"
  active: boolean;
}

export interface UserWallet {
  balanceCOP: number;
  pinSet: boolean;
  publicKey: string;
  linkedKeys: LinkedKey[];
}

export interface PuntosColombia {
  linked: boolean;
  accountNumber: string;
  balance: number;
  conversionRate: number; // 7 COP per point
}

export interface ApplicationState {
  userWallet: UserWallet;
  puntosColombia: PuntosColombia;
  businesses: Business[];
  employees: Employee[];
  tips: Tip[];
}

export interface ScannedReceiptData {
  businessName: string;
  totalAmount: number;
  currency: string;
  date: string;
  suggestedTips: {
    "8": number;
    "10": number;
    "15": number;
  };
}
