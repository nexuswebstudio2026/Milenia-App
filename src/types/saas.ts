export type SubscriptionPlan = 'basic' | 'pro' | 'enterprise';
export type RestaurantStatus = 'active' | 'trial' | 'suspended';

export type UserRole = 'owner' | 'staff';

export interface UserProfile {
  uid: string;
  role: UserRole;
  restaurantId: string;
  documentId: string; // Cédula de ciudadanía o Document ID
  employeeId?: string; // ID Empleado alias
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  position?: string;
  createdAt?: string;
}

export interface DianResolutionInfo {
  resolutionNumber: string; // e.g. "18764000001234"
  prefix: string; // e.g. "MIL-"
  rangeFrom: number; // e.g. 1
  rangeTo: number; // e.g. 50000
  currentInvoiceNumber?: number; // e.g. 1042
  currentConsecutive?: number; // e.g. 1042
  startDate?: string; // "2026-01-01"
  endDate?: string; // "2027-01-01"
  validFrom?: string;
  validUntil?: string;
  technicalKey?: string;
  softwareId?: string;
  pin?: string;
}

export interface TenantBranding {
  logoUrl: string;
  primaryColor: string; // e.g. '#e11d48' or '#d4af37'
  accentColor: string;
  themeStyle: 'rustic' | 'luxury' | 'modern' | 'minimal';
  bannerImage: string;
  tagline: string;
  currency: 'COP' | 'USD';
  currencySymbol: string;
  nit: string; // e.g. "901.458.789-2"
  legalBusinessName?: string; // e.g. "Milenia Gastronomía Colombiana S.A.S."
  dianResolution: string; // e.g. "Resolución DIAN No. 18764000001234 de 2026"
  dianDetails?: DianResolutionInfo;
  tipSuggestedPercentage?: number; // e.g. 10 for 10%
  taxRateImpoconsumo?: number; // 8% en Colombia
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

export interface InventoryItem {
  id: string;
  restaurantId: string;
  name: string;
  sku: string;
  category: 'carnes' | 'vinos' | 'lacteos' | 'vegetales' | 'licores' | 'abarrotes';
  currentStock: number;
  minStockAlert: number;
  unit: 'kg' | 'g' | 'litro' | 'botella' | 'unidad' | 'porcion';
  costPerUnitCop: number;
  lastRestockedAt: string;
  linkedMenuItemId?: string; // Links recipe to auto-deduct on order completion
  deductionPerPortion?: number;
}

export interface TenantRestaurant {
  id: string; // Unique_ID e.g. 'rest-milenia-bogota'
  slug: string; // 'milenia-bogota', 'camilo-medellin', 'parrilla-valle'
  name: string;
  city: string; // e.g. "Bogotá, Colombia"
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

export interface EmployeeShiftLog {
  id: string;
  employeeId: string;
  clockIn: string; // ISO String
  clockOut?: string; // ISO String
  totalHours?: number;
  ordersServed: number;
  tipsEarnedCop: number;
  salesGeneratedCop: number;
}

export interface TenantEmployee {
  id: string; // Unique_ID e.g. 'emp-101'
  restaurantId: string; // Foreign Key: points to TenantRestaurant.id
  name: string;
  role: EmployeeRole;
  position?: string; // Cargo: Chef Ejecutivo, Mesero Capitán, etc.
  documentId?: string; // Cédula de Ciudadanía CC
  email: string;
  phone: string;
  avatar: string;
  pinCode: string;
  shiftStatus: 'active' | 'break' | 'off';
  currentClockInTime?: string;
  hourlyRateCop?: number;
  baseSalaryCop?: number; // Salario base mensual COP
  assignedTables?: string[];
  totalOrdersTaken?: number;
  monthlySalesGoalCop?: number;
  currentMonthlySalesCop?: number;
  accumulatedTipsCop?: number;
  shiftHistory?: EmployeeShiftLog[];
}

export interface PayrollRecord {
  id: string;
  restaurantId: string;
  employeeId: string;
  employeeName: string;
  documentId: string;
  position: string;
  periodMonth: string; // "Agosto 2026"
  baseSalaryCop: number;
  workedDays: number; // e.g. 30
  overtimeHours: number;
  overtimePayCop: number;
  transportAllowanceCop: number; // Auxilio de Transporte en Colombia
  healthDeductionCop: number; // 4% Salud
  pensionDeductionCop: number; // 4% Pensión
  tipsShareCop: number; // Propinas acumuladas
  netPayableCop: number;
  paymentStatus: 'paid' | 'pending';
  paidAt?: string;
}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'billing' | 'cleaning';

export interface RestaurantTable {
  id: string;
  restaurantId: string;
  number: string;
  name?: string; // Support for table name or number display
  zone: string; // e.g. 'Salón Principal', 'Terraza', 'VIP Cava', 'Barra'
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

