export * from './types/saas';

export type OrderType = 'delivery' | 'pickup' | 'dinein';

export type OrderStatus = 
  | 'received' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled';

export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled';

export interface OptionChoice {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
}

export interface OptionGroup {
  id: string;
  title: string;
  titleEn?: string;
  required: boolean;
  maxSelect?: number;
  choices: OptionChoice[];
}

export type DietaryPreference = 'vegetarian' | 'vegan' | 'gluten_free' | 'keto' | 'spicy' | 'chef_special' | 'popular' | 'halal' | 'organic';

export interface WinePairing {
  id: string;
  name: string;
  nameEn?: string;
  vintage?: string;
  grapeVariety?: string;
  region?: string;
  description: string;
  descriptionEn?: string;
  price: number;
  image: string;
  type: 'red' | 'white' | 'sparkling' | 'rose';
}

export interface SuggestedSide {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  price: number;
  image: string;
}

export interface MenuItem {
  id: string;
  restaurantId?: string; // Multi-tenant identifier
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  image: string;
  prepTimeMinutes: number;
  calories?: number;
  dietary: DietaryPreference[];
  inStock: boolean;
  isMainCourse?: boolean;
  winePairing?: WinePairing;
  suggestedSide?: SuggestedSide;
  optionGroups?: OptionGroup[];
}

export interface MenuCategory {
  id: string;
  restaurantId?: string; // Multi-tenant identifier
  name: string;
  nameEn: string;
  icon: string;
  description?: string;
}

export interface SelectedOption {
  groupId: string;
  groupTitle: string;
  choiceId: string;
  choiceName: string;
  price: number;
}

export interface CartItem {
  cartId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedOptions: SelectedOption[];
  specialInstructions?: string;
  totalPrice: number; // (base + options) * quantity
}

export interface OrderCustomerInfo {
  name: string;
  email: string;
  phone: string;
  deliveryAddress?: {
    street: string;
    city: string;
    zip: string;
    notes?: string;
  };
  tableNumber?: string;
}

export interface Order {
  id: string;
  restaurantId?: string; // Multi-tenant identifier
  employeeId?: string; // Staff member who took or handled the order
  tableNumber?: string;
  orderNumber: string;
  createdAt: string;
  orderType: OrderType;
  status: OrderStatus;
  items: CartItem[];
  customer: OrderCustomerInfo;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tip: number;
  discount: number;
  discountCode?: string;
  total: number;
  paymentMethod: 'card' | 'cash' | 'paypal' | 'applepay' | 'nequi' | 'daviplata';
  paymentStatus: 'paid' | 'pending' | 'cash_on_delivery';
  estimatedDeliveryTime: string;
  scheduledFor?: string;
  driver?: {
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
  };
  notes?: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
}

export type SeatingArea = 'terrace' | 'main_dining' | 'private_cava' | 'indoor' | 'patio' | 'bar' | 'vip_rooftop';

export interface TableReservation {
  id: string;
  restaurantId?: string; // Multi-tenant identifier
  reservationCode: string;
  createdAt: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestsCount: number;
  date: string;
  time: string;
  seatingArea: SeatingArea;
  occasion?: string;
  specialRequests?: string;
  status: ReservationStatus;
  tableAssigned?: string;
}

export type RewardsTier = 'Silver' | 'Gold' | 'Platinum' | 'Black Diamond';

export interface RewardsBenefit {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  tierRequired: RewardsTier;
  pointsRequired: number;
  icon: string;
  unlocked: boolean;
  code?: string;
  discountAmount?: number;
}

export interface RewardsActivity {
  id: string;
  title: string;
  titleEn: string;
  date: string;
  points: number;
  type: 'earned' | 'redeemed';
}

export interface MileniaRewardsProfile {
  userName: string;
  membershipNumber: string;
  currentPoints: number;
  lifetimePoints: number;
  tier: RewardsTier;
  nextTier: RewardsTier | null;
  pointsToNextTier: number;
  tierProgressPercentage: number;
  benefits: RewardsBenefit[];
  recentActivity: RewardsActivity[];
}

export interface RestaurantLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  openingHours: {
    days: string;
    daysEn: string;
    hours: string;
  }[];
  deliveryTimeEstimate: string;
  pickupTimeEstimate: string;
  minDeliveryOrder: number;
  deliveryFee: number;
  deliveryRadiusKm: number;
  image: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface RestaurantReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  foodRating: number;
  serviceRating: number;
  speedRating: number;
  verifiedOrder: boolean;
  avatar?: string;
}

export type ThemeMode = 'light' | 'dark';

export type FirebaseSyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

export interface RestaurantConfig {
  name: string;
  tagline: string;
  currency: string;
  currencySymbol: string;
  taxRate: number; // e.g. 0.08 for 8%
  serviceFeeRate: number;
  freeDeliveryThreshold: number;
  acceptingOrders: boolean;
  acceptingReservations: boolean;
}

