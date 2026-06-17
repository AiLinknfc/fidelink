export interface CardModelProps {
  businessName: string;
  cardTitle: string;
  cardTag: string;
  colorHex: string;
  secondaryColorHex?: string;
  totalStamps: number;
  rewardDescription: string;
  category: string;
  logoUrl?: string | null;
}
