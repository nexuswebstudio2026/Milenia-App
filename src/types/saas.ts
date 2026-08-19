export type SubscriptionPlan = 'basic' | 'pro' | 'enterprise';
export type RestaurantStatus = 'active' | 'trial' | 'suspended';

export interface TenantBranding {
  logoUrl: string;
  primaryColor: string; // e.g. '#e11d48' or '#d97706'
  accentColor: string;
  themeStyle: 'rustic' | 'luxury' | 'modern' | 'minimal';
  bannerImage: string;
  tagline: string;
  currency: 'COP' | 'USD';
  currencySymbol: string;
  dianResolution: string;
  nit: string;
  tipSuggestedPercentage: number;
}

export interface TenantSubscription {
  plan: SubscriptionPlan;
  status: 'active' | 'past_due' | 'trial';
  mrrCop: number; // Monthly Recurring Revenue in COP
  renewsAt: string;
  maxTables: number;
  maxEmployees: number;
  features: string[];
}

export interface TenantRestaurant {
  id: string; // '1', '2', '3', etc.
  slug: string; // 'camilo', 'milenia-bogota', 'parrilla-del-valle'
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  branding: TenantBranding;
  subscription: TenantSubscription;
  createdAt: string;
  tablesCount: number;
  activeOrdersCount: number;
  totalMonthlySalesCop: number;
}

export type EmployeeRole = 'mesero' | 'cocina' | 'cajero' | 'administrador' | 'owner';

export interface TenantEmployee {
  id: string; // e.g. 'emp-101'
  restaurantId: string;
  name: string;
  role: EmployeeRole;
  email: string;
  phone: string;
  avatar: string;
  pinCode: string;
  shiftStatus: 'active' | 'break' | 'off';
  hourlyRateCop?: number;
  assignedTables?: string[];
  totalOrdersTaken?: number;
}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'billing' | 'cleaning';

export interface RestaurantTable {
  id: string;
  restaurantId: string;
  number: string;
  zone: string; // e.g. 'Salón Principal', 'Terraza', 'VIP', 'Barra'
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  assignedEmployeeId?: string;
  dinersCount?: number;
  occupiedSince?: string;
}

export interface SaaSPlatformMetrics {
  totalTenants: number;
  activeTenants: number;
  mrrTotalCop: number;
  totalOrdersToday: number;
  totalVolumeCopToday: number;
  activeEmployeesCount: number;
  growthPercentage: number;
}
