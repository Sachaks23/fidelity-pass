export type UserRole = "PROFESSIONAL" | "CUSTOMER" | "ADMIN";

export interface BusinessWithStats {
  id: string;
  name: string;
  slug: string;
  category: string;
  address?: string | null;
  phone?: string | null;
  logoUrl?: string | null;
  cardBgColor: string;
  cardFgColor: string;
  cardAccentColor: string;
  stampsRequired: number;
  rewardLabel: string;
  description?: string | null;
  _count?: {
    loyaltyCards: number;
  };
}

export interface CustomerWithCard {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  createdAt: Date;
  user: {
    email: string;
  };
  loyaltyCards: Array<{
    id: string;
    stampCount: number;
    totalStamps: number;
    issuedAt: Date;
    serialNumber: string;
    business: {
      name: string;
      stampsRequired: number;
    };
    transactions: Array<{
      id: string;
      type: string;
      stampsDelta: number;
      note?: string | null;
      createdAt: Date;
    }>;
  }>;
}

export interface AnalyticsData {
  totalCustomers: number;
  activeCards: number;
  totalScansToday: number;
  newCustomers: Array<{ date: string; count: number }>;
  scansPerDay: Array<{ date: string; count: number }>;
}
