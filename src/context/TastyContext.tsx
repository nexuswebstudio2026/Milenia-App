import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  MenuItem, 
  MenuCategory, 
  CartItem, 
  SelectedOption, 
  Order, 
  OrderType, 
  OrderStatus, 
  TableReservation, 
  RestaurantLocation, 
  RestaurantReview, 
  RestaurantConfig,
  OrderCustomerInfo,
  ThemeMode,
  FirebaseSyncStatus,
  DietaryPreference,
  WinePairing,
  SuggestedSide,
  MileniaRewardsProfile,
  TenantRestaurant,
  TenantEmployee,
  RestaurantTable,
  TableStatus
} from '../types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_MENU_ITEMS, 
  INITIAL_LOCATIONS, 
  INITIAL_REVIEWS, 
  INITIAL_ORDERS, 
  INITIAL_RESERVATIONS, 
  DEFAULT_CONFIG,
  INITIAL_REWARDS_PROFILE
} from '../data/mockData';
import { 
  INITIAL_TENANTS, 
  INITIAL_EMPLOYEES, 
  INITIAL_TABLES, 
  CAMILO_CATEGORIES, 
  CAMILO_MENU_ITEMS, 
  CAMILO_ORDERS,
  getTenantCategories,
  getTenantMenuItems
} from '../data/multiTenantData';
import { useTenantRoute, ParsedTenantRoute, AppRouteType } from '../hooks/useTenantRoute';
import { 
  db, 
  handleFirestoreError, 
  OperationType, 
  testConnection 
} from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs 
} from 'firebase/firestore';

export type AppView = 'menu' | 'reservations' | 'locations' | 'reviews' | 'tracking' | 'admin' | 'superadmin' | 'dashboard';
export type Language = 'es' | 'en';
export type MileniaNavView = 'inicio' | 'aliados' | 'login' | 'contactos';
export type RestaurantNavView = 'restaurant-inicio' | 'restaurant-servicios' | 'restaurant-platos' | 'restaurant-reservas' | 'restaurant-domicilios' | 'restaurant-empleados' | 'restaurant-admin';
export type AppMode = 'milenia' | 'restaurant';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface TastyContextType {
  // SaaS vs Restaurant Mode & Views
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  mileniaView: MileniaNavView;
  setMileniaView: (view: MileniaNavView) => void;
  tenantView: RestaurantNavView;
  setTenantView: (view: RestaurantNavView) => void;
  selectTenantById: (tenantId: string) => void;
  selectDishForCustomization: (dish: MenuItem) => void;
  isDarkMode: boolean;

  // Multi-Tenant SaaS State
  tenants: TenantRestaurant[];
  currentTenantId: string;
  currentTenant: TenantRestaurant;
  switchTenant: (tenantId: string) => void;
  addTenant: (tenant: TenantRestaurant) => void;
  
  // Staff & Employees (Tenant-isolated)
  employees: TenantEmployee[];
  currentEmployeeId: string;
  currentEmployee: TenantEmployee | null;
  setCurrentEmployee: (emp: TenantEmployee | null) => void;
  tenantEmployees: TenantEmployee[];
  switchEmployee: (empId: string) => void;

  // Tables & Salón (Tenant-isolated)
  tenantTables: RestaurantTable[];
  updateTableStatus: (tableId: string, status: TableStatus, currentOrderId?: string) => void;

  // Dynamic Routing
  currentRoute: ParsedTenantRoute;
  navigateTo: (options: {
    restaurantId?: string;
    employeeId?: string;
    routeType?: AppRouteType;
    subView?: string;
  }) => void;

  // Navigation & General
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  selectedLocation: RestaurantLocation;
  setSelectedLocation: (loc: RestaurantLocation) => void;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;

  // Theme (Day & Night - Automated by Time: 6am-5:59pm Day, 6pm-5:59am Night)
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  // Firebase Sync
  firebaseStatus: FirebaseSyncStatus;
  
  // Menu Data
  categories: MenuCategory[];
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleItemStock: (id: string) => void;

  // Cart
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: MenuItem, quantity: number, options: SelectedOption[], instructions?: string) => void;
  removeFromCart: (cartId: string) => void;
  updateCartItemQuantity: (cartId: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tip: number;
  setTip: (tip: number) => void;
  discount: number;
  promoCode: string;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  total: number;

  // Orders
  orders: Order[];
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  placeOrder: (customer: OrderCustomerInfo, paymentMethod: Order['paymentMethod'], notes?: string) => Order;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;

  // Reservations
  reservations: TableReservation[];
  createReservation: (data: Omit<TableReservation, 'id' | 'reservationCode' | 'createdAt' | 'status'>) => TableReservation;
  updateReservationStatus: (id: string, status: TableReservation['status']) => void;

  // Locations & Reviews & Config
  locations: RestaurantLocation[];
  reviews: RestaurantReview[];
  addReview: (review: Omit<RestaurantReview, 'id' | 'date'>) => void;
  config: RestaurantConfig;
  updateConfig: (newConfig: Partial<RestaurantConfig>) => void;

  // UI Toast & Celebrations
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  showToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  triggerConfetti: () => void;

  // Modals & UI Helpers
  customizingItem: MenuItem | null;
  setCustomizingItem: (item: MenuItem | null) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;

  // Upsell Modal
  isUpsellOpen: boolean;
  setIsUpsellOpen: (open: boolean) => void;
  upsellItem: MenuItem | null;
  setUpsellItem: (item: MenuItem | null) => void;
  addWinePairingToCart: (wine: WinePairing) => void;
  addSideToCart: (side: SuggestedSide) => void;

  // Milenia Rewards & Loyalty
  isRewardsOpen: boolean;
  setIsRewardsOpen: (open: boolean) => void;
  rewardsProfile: MileniaRewardsProfile;
  setRewardsProfile: React.Dispatch<React.SetStateAction<MileniaRewardsProfile>>;
  redeemRewardBenefit: (benefitId: string) => boolean;

  // Global Dietary Filter
  dietaryFilter: DietaryPreference | 'all';
  setDietaryFilter: (filter: DietaryPreference | 'all') => void;
}

// Automatic theme calculation:
// 6:00 AM (06:00) to 5:59 PM (17:59) -> 'light' (Modo Día)
// 6:00 PM (18:00) to 5:59 AM (05:59) -> 'dark' (Modo Noche)
function getAutomaticTheme(): ThemeMode {
  const currentHour = new Date().getHours();
  if (currentHour >= 6 && currentHour < 18) {
    return 'light';
  }
  return 'dark';
}

const TastyContext = createContext<TastyContextType | undefined>(undefined);

export const TastyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Dynamic Multi-Tenant Routing
  const { currentRoute, navigateTo } = useTenantRoute();

  // Multi-Tenant Data States
  const [tenants, setTenants] = useState<TenantRestaurant[]>(INITIAL_TENANTS);
  const [employees, setEmployees] = useState<TenantEmployee[]>(INITIAL_EMPLOYEES);
  const [tables, setTables] = useState<RestaurantTable[]>(INITIAL_TABLES);

  // App Mode & Views (Milenia SaaS vs Specific Restaurant Tenant)
  const [mode, setMode] = useState<AppMode>(() => {
    // If URL has specific restaurant/dashboard route, default to restaurant mode
    if (window.location.hash.length > 2 && !window.location.hash.includes('superadmin')) {
      return 'restaurant';
    }
    return 'milenia';
  });

  const [mileniaView, setMileniaView] = useState<MileniaNavView>('inicio');
  const [tenantView, setTenantView] = useState<RestaurantNavView>('restaurant-inicio');

  const currentTenantId = currentRoute.restaurantId || '1';
  const currentTenant = useMemo(() => {
    return tenants.find(t => t.id === currentTenantId || t.slug === currentTenantId) || tenants[0];
  }, [tenants, currentTenantId]);

  const tenantEmployees = useMemo(() => {
    return employees.filter(e => e.restaurantId === currentTenant.id);
  }, [employees, currentTenant.id]);

  const currentEmployeeId = currentRoute.employeeId || (tenantEmployees[0]?.id || 'emp-101');
  const [selectedEmployeeOverride, setSelectedEmployeeOverride] = useState<TenantEmployee | null>(null);

  const currentEmployee = useMemo(() => {
    if (selectedEmployeeOverride && selectedEmployeeOverride.restaurantId === currentTenant.id) {
      return selectedEmployeeOverride;
    }
    return tenantEmployees.find(e => e.id === currentEmployeeId) || tenantEmployees[0] || null;
  }, [tenantEmployees, currentEmployeeId, selectedEmployeeOverride, currentTenant.id]);

  const setCurrentEmployee = (emp: TenantEmployee | null) => {
    setSelectedEmployeeOverride(emp);
    if (emp) {
      navigateTo({
        restaurantId: emp.restaurantId,
        employeeId: emp.id,
        routeType: 'employee_dashboard'
      });
    }
  };

  const tenantTables = useMemo(() => {
    return tables.filter(t => t.restaurantId === currentTenant.id);
  }, [tables, currentTenant.id]);

  const updateTableStatus = (tableId: string, status: TableStatus, currentOrderId?: string) => {
    setTables(prev => prev.map(tbl => tbl.id === tableId ? { ...tbl, status, currentOrderId } : tbl));
  };

  const switchTenant = (tenantId: string) => {
    const validTenant = tenants.find(t => t.id === tenantId || t.slug === tenantId);
    if (!validTenant) return;
    const firstEmp = employees.find(e => e.restaurantId === validTenant.id);
    setMode('restaurant');
    navigateTo({
      restaurantId: validTenant.id,
      employeeId: firstEmp ? firstEmp.id : 'emp-101'
    });
  };

  const selectTenantById = (tenantId: string) => {
    const validTenant = tenants.find(t => t.id === tenantId || t.slug === tenantId);
    if (!validTenant) return;
    setMode('restaurant');
    setTenantView('restaurant-inicio');
    const firstEmp = employees.find(e => e.restaurantId === validTenant.id);
    navigateTo({
      restaurantId: validTenant.id,
      employeeId: firstEmp ? firstEmp.id : 'emp-101',
      routeType: 'customer_menu'
    });
  };

  const switchEmployee = (empId: string) => {
    navigateTo({
      employeeId: empId
    });
  };

  const addTenant = (newTenant: TenantRestaurant) => {
    setTenants(prev => [...prev, newTenant]);
  };

  // Dynamic Categories per Tenant
  const categories = useMemo(() => {
    return getTenantCategories(currentTenant.id);
  }, [currentTenant.id]);

  // Dynamic Menu Items per Tenant
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    return getTenantMenuItems(currentTenant.id);
  });

  useEffect(() => {
    setMenuItems(getTenantMenuItems(currentTenant.id));
  }, [currentTenant.id]);

  // Dynamic View synchronized with Route
  const currentView: AppView = useMemo(() => {
    if (currentRoute.routeType === 'superadmin') return 'superadmin';
    if (currentRoute.routeType === 'employee_dashboard') return 'dashboard';
    if (currentRoute.routeType === 'tenant_admin') return 'admin';
    if (currentRoute.routeType === 'customer_reservations') return 'reservations';
    if (currentRoute.routeType === 'customer_tracking') return 'tracking';
    return 'menu';
  }, [currentRoute.routeType]);

  const setCurrentView = (view: AppView) => {
    if (view === 'superadmin') navigateTo({ routeType: 'superadmin' });
    else if (view === 'admin') navigateTo({ routeType: 'tenant_admin' });
    else if (view === 'dashboard') navigateTo({ routeType: 'employee_dashboard' });
    else if (view === 'reservations') navigateTo({ routeType: 'customer_reservations' });
    else if (view === 'tracking') navigateTo({ routeType: 'customer_tracking' });
    else navigateTo({ routeType: 'customer_menu' });
  };

  const [language, setLanguage] = useState<Language>('es');
  const [orderType, setOrderType] = useState<OrderType>('delivery');

  // Automatic Theme State (6:00 AM to 5:59 PM Day, 6:00 PM to 5:59 AM Night)
  const [theme, setThemeState] = useState<ThemeMode>(() => getAutomaticTheme());

  const applyThemeToDOM = (mode: ThemeMode) => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    applyThemeToDOM(newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Periodic check to transition automatically as the hour changes
  useEffect(() => {
    const updateThemeBySchedule = () => {
      const scheduledTheme = getAutomaticTheme();
      setThemeState((prev) => {
        if (prev !== scheduledTheme) {
          applyThemeToDOM(scheduledTheme);
          return scheduledTheme;
        }
        return prev;
      });
      applyThemeToDOM(scheduledTheme);
    };

    updateThemeBySchedule();
    const interval = setInterval(updateThemeBySchedule, 30000); // check every 30s

    return () => clearInterval(interval);
  }, []);

  // Firebase status
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseSyncStatus>('syncing');

  // Locations
  const [locations] = useState<RestaurantLocation[]>(INITIAL_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<RestaurantLocation>(INITIAL_LOCATIONS[0]);

  const [orders, setOrders] = useState<Order[]>(() => {
    return CAMILO_ORDERS;
  });

  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    return CAMILO_ORDERS.length > 0 ? CAMILO_ORDERS[0] : null;
  });

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setActiveOrder(order);
  };

  const [reservations, setReservations] = useState<TableReservation[]>(() => {
    const saved = localStorage.getItem('milenia_reservations') || localStorage.getItem('laura_reservations');
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
  });

  const [reviews, setReviews] = useState<RestaurantReview[]>(() => {
    const saved = localStorage.getItem('milenia_reviews') || localStorage.getItem('laura_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [config, setConfig] = useState<RestaurantConfig>(() => {
    const saved = localStorage.getItem('milenia_config') || localStorage.getItem('laura_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('milenia_cart') || localStorage.getItem('laura_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tip, setTip] = useState(2.00);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Modals & UI
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Upsell & Pairings State
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const [upsellItem, setUpsellItem] = useState<MenuItem | null>(null);

  // Global Dietary Filter
  const [dietaryFilter, setDietaryFilter] = useState<DietaryPreference | 'all'>('all');

  // Milenia Rewards State
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [rewardsProfile, setRewardsProfile] = useState<MileniaRewardsProfile>(() => {
    const saved = localStorage.getItem('milenia_rewards');
    return saved ? JSON.parse(saved) : INITIAL_REWARDS_PROFILE;
  });

  // Synchronize rewards with localStorage
  useEffect(() => {
    localStorage.setItem('milenia_rewards', JSON.stringify(rewardsProfile));
  }, [rewardsProfile]);

  // Toast notifications helper
  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ea580c', '#10b981', '#6366f1']
    });
  };

  // Synchronize with localStorage
  useEffect(() => {
    localStorage.setItem('milenia_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('milenia_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('milenia_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('milenia_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('milenia_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('milenia_cart', JSON.stringify(cart));
  }, [cart]);

  // -------------------------------------------------------------
  // FIREBASE REAL-TIME SYNCHRONIZATION & SEEDING
  // -------------------------------------------------------------
  useEffect(() => {
    let unsubscribeMenu: (() => void) | undefined;
    let unsubscribeOrders: (() => void) | undefined;
    let unsubscribeReservations: (() => void) | undefined;
    let unsubscribeReviews: (() => void) | undefined;

    const setupFirebaseSync = async () => {
      try {
        setFirebaseStatus('syncing');
        const isOnline = await testConnection();

        // 1. Menu Items Listener & Initial Seed if empty
        const menuCol = collection(db, 'menu_items');
        unsubscribeMenu = onSnapshot(menuCol, async (snapshot) => {
          if (!snapshot.empty) {
            const items: MenuItem[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              if (data && (!data.restaurantId || data.restaurantId === currentTenant.id)) {
                items.push({ id: docSnap.id, ...data } as MenuItem);
              }
            });
            if (items.length > 0) {
              setMenuItems(items);
            }
          }
          setFirebaseStatus('synced');
        }, (err) => {
          handleFirestoreError(err, OperationType.LIST, 'menu_items');
          setFirebaseStatus('offline');
        });

        // 2. Orders Listener
        const ordersCol = collection(db, 'orders');
        unsubscribeOrders = onSnapshot(ordersCol, (snapshot) => {
          if (!snapshot.empty) {
            const orderList: Order[] = [];
            snapshot.forEach((docSnap) => {
              orderList.push({ id: docSnap.id, ...docSnap.data() } as Order);
            });
            orderList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(orderList);
          }
        }, (err) => {
          handleFirestoreError(err, OperationType.LIST, 'orders');
        });

        // 3. Reservations Listener
        const resCol = collection(db, 'reservations');
        unsubscribeReservations = onSnapshot(resCol, (snapshot) => {
          if (!snapshot.empty) {
            const resList: TableReservation[] = [];
            snapshot.forEach((docSnap) => {
              resList.push({ id: docSnap.id, ...docSnap.data() } as TableReservation);
            });
            resList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setReservations(resList);
          }
        }, (err) => {
          handleFirestoreError(err, OperationType.LIST, 'reservations');
        });

        // 4. Reviews Listener
        const reviewsCol = collection(db, 'reviews');
        unsubscribeReviews = onSnapshot(reviewsCol, (snapshot) => {
          if (!snapshot.empty) {
            const revList: RestaurantReview[] = [];
            snapshot.forEach((docSnap) => {
              revList.push({ id: docSnap.id, ...docSnap.data() } as RestaurantReview);
            });
            setReviews(revList);
          }
        }, (err) => {
          handleFirestoreError(err, OperationType.LIST, 'reviews');
        });

        if (!isOnline) {
          setFirebaseStatus('offline');
        }

      } catch (error) {
        console.warn('Firebase initial sync operating in offline mode:', error);
        setFirebaseStatus('offline');
      }
    };

    setupFirebaseSync();

    return () => {
      if (unsubscribeMenu) unsubscribeMenu();
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeReservations) unsubscribeReservations();
      if (unsubscribeReviews) unsubscribeReviews();
    };
  }, [currentTenant.id]);

  // -------------------------------------------------------------
  // CART CALCULATIONS & ACTIONS
  // -------------------------------------------------------------
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = Number(cart.reduce((acc, item) => acc + item.totalPrice, 0).toFixed(2));
  
  const deliveryFee = orderType === 'delivery' 
    ? (subtotal >= config.freeDeliveryThreshold || subtotal === 0 ? 0 : selectedLocation.deliveryFee) 
    : 0;
    
  const serviceFee = subtotal > 0 ? Number((subtotal * config.serviceFeeRate).toFixed(2)) : 0;
  const total = Number(Math.max(0, subtotal + deliveryFee + serviceFee + tip - discount).toFixed(2));

  const addToCart = (item: MenuItem, quantity: number, options: SelectedOption[], instructions?: string) => {
    const optionsPrice = options.reduce((sum, opt) => sum + opt.price, 0);
    const unitPrice = item.price + optionsPrice;
    const totalPrice = Number((unitPrice * quantity).toFixed(2));

    const cartId = `${item.id}-${options.map(o => o.choiceId).sort().join('_')}-${instructions || ''}`;

    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => i.cartId === cartId);
      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          totalPrice: Number((unitPrice * newQty).toFixed(2))
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            cartId,
            menuItem: item,
            quantity,
            selectedOptions: options,
            specialInstructions: instructions,
            totalPrice
          }
        ];
      }
    });

    addToast('success', language === 'es' ? 'Plato Añadido' : 'Added to Cart', `${quantity}x ${item.name}`);

    // Trigger Upsell modal if this is a main course or has wine pairing / side recommendation
    if (item.winePairing || item.suggestedSide || item.isMainCourse || item.categoryId === 'mains') {
      setUpsellItem(item);
      setIsUpsellOpen(true);
    }
  };

  const addWinePairingToCart = (wine: WinePairing) => {
    const wineMenuItem: MenuItem = {
      id: wine.id,
      name: wine.name,
      nameEn: wine.nameEn || wine.name,
      description: wine.description,
      descriptionEn: wine.descriptionEn,
      price: wine.price,
      categoryId: 'drinks',
      image: wine.image,
      prepTimeMinutes: 2,
      dietary: ['chef_special'],
      inStock: true
    };

    addToCart(wineMenuItem, 1, []);
    addToast('success', language === 'es' ? 'Maridaje Añadido' : 'Wine Pairing Added', wine.name);
  };

  const addSideToCart = (side: SuggestedSide) => {
    const sideMenuItem: MenuItem = {
      id: side.id,
      name: side.name,
      nameEn: side.nameEn || side.name,
      description: side.description,
      descriptionEn: side.descriptionEn,
      price: side.price,
      categoryId: 'starters',
      image: side.image,
      prepTimeMinutes: 5,
      dietary: ['chef_special'],
      inStock: true
    };

    addToCart(sideMenuItem, 1, []);
    addToast('success', language === 'es' ? 'Guarnición Añadida' : 'Side Dish Added', side.name);
  };

  const redeemRewardBenefit = (benefitId: string): boolean => {
    const benefit = rewardsProfile.benefits.find(b => b.id === benefitId);
    if (!benefit) return false;

    if (!benefit.unlocked && rewardsProfile.currentPoints < benefit.pointsRequired) {
      addToast('error', language === 'es' ? 'Puntos Insuficientes' : 'Not Enough Points', `Necesitas ${benefit.pointsRequired} pts para canjear este beneficio.`);
      return false;
    }

    // Deduct points if it was a point redemption
    const cost = benefit.unlocked ? 0 : benefit.pointsRequired;
    const newPoints = Math.max(0, rewardsProfile.currentPoints - cost);

    // If it has a discount amount, apply discount to cart
    if (benefit.discountAmount) {
      setDiscount(benefit.discountAmount);
      setPromoCode(benefit.code || 'REWARDS-VOUCHER');
    }

    setRewardsProfile(prev => ({
      ...prev,
      currentPoints: newPoints,
      recentActivity: [
        {
          id: `act-${Date.now()}`,
          title: `Canje: ${benefit.title}`,
          titleEn: `Redeemed: ${benefit.titleEn}`,
          date: 'Hoy',
          points: -cost,
          type: 'redeemed'
        },
        ...prev.recentActivity
      ]
    }));

    triggerConfetti();
    addToast('success', language === 'es' ? 'Beneficio Activado' : 'Reward Claimed', benefit.title);
    return true;
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  const updateCartItemQuantity = (cartId: string, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.cartId === cartId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          const optionsPrice = item.selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
          const unitPrice = item.menuItem.price + optionsPrice;
          return {
            ...item,
            quantity: newQty,
            totalPrice: Number((unitPrice * newQty).toFixed(2))
          };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setPromoCode('');
  };

  const applyPromoCode = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (clean === 'MILENIA10' || clean === 'MENIA10' || clean === 'ANAMILENA' || clean === 'LAURA10' || clean === 'TASTY10') {
      const disc = Number((subtotal * 0.10).toFixed(2));
      setDiscount(disc);
      setPromoCode(clean);
      addToast('success', language === 'es' ? 'Cupón Aplicado' : 'Promo Applied', '10% de descuento en tu comanda MILENIA');
      return true;
    } else if (clean === 'ENVIOGRATIS' || clean === 'FREEDELIVERY') {
      setDiscount(deliveryFee);
      setPromoCode(clean);
      addToast('success', language === 'es' ? 'Envío Gratis' : 'Free Delivery', 'Coste de entrega bonificado');
      return true;
    } else if (clean === 'GOURMET5') {
      setDiscount(5.00);
      setPromoCode(clean);
      addToast('success', language === 'es' ? 'Cupón €5' : '€5 Voucher', 'Descuento de €5 aplicado');
      return true;
    } else {
      addToast('error', language === 'es' ? 'Cupón No Válido' : 'Invalid Code', 'Prueba con MILENIA10 o ENVIOGRATIS');
      return false;
    }
  };

  const removePromoCode = () => {
    setDiscount(0);
    setPromoCode('');
  };

  // -------------------------------------------------------------
  // ORDERS MANAGEMENT & FIREBASE WRITES
  // -------------------------------------------------------------
  const placeOrder = (
    customer: OrderCustomerInfo, 
    paymentMethod: Order['paymentMethod'], 
    notes?: string
  ): Order => {
    const newOrderNumber = Math.floor(1000 + Math.random() * 9000).toString();
    const orderId = `ord-${Date.now()}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrder: Order = {
      id: orderId,
      orderNumber: newOrderNumber,
      createdAt: new Date().toISOString(),
      orderType,
      status: 'received',
      items: [...cart],
      customer,
      subtotal,
      deliveryFee,
      serviceFee,
      tip,
      discount,
      discountCode: promoCode || undefined,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'cash_on_delivery' : 'paid',
      estimatedDeliveryTime: orderType === 'delivery' ? selectedLocation.deliveryTimeEstimate : selectedLocation.pickupTimeEstimate,
      notes,
      statusHistory: [
        {
          status: 'received',
          timestamp: nowTime,
          note: 'Pedido recibido y registrado en el sistema MILENIA'
        }
      ],
      driver: orderType === 'delivery' ? {
        name: 'Carlos Mendoza',
        phone: '+34 699 112 334',
        vehicle: 'Moto Honda SH125 (Matrícula 4920-KLT)',
        rating: 4.95
      } : undefined
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrder(newOrder);
    clearCart();
    setIsCheckoutOpen(false);
    triggerConfetti();

    // Award loyalty rewards points (+10 pts per 1€)
    const pointsEarned = Math.max(10, Math.round(total * 10));
    setRewardsProfile((prev) => {
      const newPoints = prev.currentPoints + pointsEarned;
      const newLifetime = prev.lifetimePoints + pointsEarned;
      const newTier = newLifetime >= 3000 ? 'Black Diamond' : newLifetime >= 1500 ? 'Platinum' : newLifetime >= 500 ? 'Gold' : 'Silver';
      const ptsToNext = newTier === 'Black Diamond' ? 0 : (newTier === 'Platinum' ? 3000 - newLifetime : newTier === 'Gold' ? 1500 - newLifetime : 500 - newLifetime);
      const progress = newTier === 'Black Diamond' ? 100 : Math.min(100, Math.round((newLifetime / (newTier === 'Platinum' ? 3000 : newTier === 'Gold' ? 1500 : 500)) * 100));

      return {
        ...prev,
        currentPoints: newPoints,
        lifetimePoints: newLifetime,
        tier: newTier,
        pointsToNextTier: Math.max(0, ptsToNext),
        tierProgressPercentage: progress,
        recentActivity: [
          {
            id: `act-${Date.now()}`,
            title: `Comanda #${newOrderNumber} (+${pointsEarned} pts)`,
            titleEn: `Order #${newOrderNumber} (+${pointsEarned} pts)`,
            date: 'Hoy',
            points: pointsEarned,
            type: 'earned'
          },
          ...prev.recentActivity
        ]
      };
    });

    setDoc(doc(db, 'orders', orderId), newOrder).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `orders/${orderId}`);
    });

    addToast(
      'success', 
      language === 'es' ? '¡Pedido Confirmado!' : 'Order Placed!', 
      language === 'es' ? `Comanda #${newOrderNumber} enviada a cocina (+${pointsEarned} pts Milenia)` : `Ticket #${newOrderNumber} sent to kitchen (+${pointsEarned} pts)`
    );

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setOrders((prev) => {
      return prev.map((ord) => {
        if (ord.id === orderId) {
          const updatedHistory = [
            ...ord.statusHistory,
            { status, timestamp: nowTime, note: note || `Estado actualizado a ${status}` }
          ];
          const updated = { ...ord, status, statusHistory: updatedHistory };
          if (activeOrder?.id === orderId) {
            setActiveOrder(updated);
          }
          return updated;
        }
        return ord;
      });
    });

    updateDoc(doc(db, 'orders', orderId), {
      status,
      lastUpdated: new Date().toISOString()
    }).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    });

    addToast('info', language === 'es' ? 'Estado Actualizado' : 'Status Updated', `Pedido marcado como: ${status.toUpperCase()}`);
  };

  // -------------------------------------------------------------
  // TABLE RESERVATIONS & FIREBASE WRITES
  // -------------------------------------------------------------
  const createReservation = (data: Omit<TableReservation, 'id' | 'reservationCode' | 'createdAt' | 'status'>): TableReservation => {
    const code = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = `res-${Date.now()}`;
    const tableAssigned = data.seatingArea === 'terrace' || data.seatingArea === 'patio' ? 'Terraza Panorámica T-04' :
                          data.seatingArea === 'private_cava' ? 'Cava Privada Sommelier C-01' :
                          data.seatingArea === 'main_dining' || data.seatingArea === 'indoor' ? 'Salón Principal S-12' :
                          data.seatingArea === 'bar' ? 'Barra Gourmet B-02' :
                          data.seatingArea === 'vip_rooftop' ? 'Mesa Rooftop R-01' : 'Mesa Salón S-12';

    const newRes: TableReservation = {
      id,
      reservationCode: code,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      tableAssigned,
      ...data
    };

    setReservations((prev) => [newRes, ...prev]);
    triggerConfetti();

    setDoc(doc(db, 'reservations', id), newRes).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `reservations/${id}`);
    });

    addToast('success', language === 'es' ? 'Mesa Reservada' : 'Table Booked', `${code} para ${data.guestName}`);
    return newRes;
  };

  const updateReservationStatus = (id: string, status: TableReservation['status']) => {
    setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));

    updateDoc(doc(db, 'reservations', id), { status }).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, `reservations/${id}`);
    });
  };

  // -------------------------------------------------------------
  // MENU MANAGEMENT & FIREBASE WRITES
  // -------------------------------------------------------------
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const id = `item-${Date.now()}`;
    const newItem: MenuItem = { ...item, id };
    setMenuItems((prev) => [newItem, ...prev]);

    setDoc(doc(db, 'menu_items', id), newItem).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `menu_items/${id}`);
    });

    addToast('success', language === 'es' ? 'Plato Creado' : 'Dish Created', newItem.name);
  };

  const updateMenuItem = (id: string, partial: Partial<MenuItem>) => {
    setMenuItems((prev) => prev.map((it) => it.id === id ? { ...it, ...partial } : it));

    updateDoc(doc(db, 'menu_items', id), partial).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, `menu_items/${id}`);
    });

    addToast('info', language === 'es' ? 'Plato Actualizado' : 'Dish Updated', 'Cambios guardados en la carta');
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((it) => it.id !== id));

    deleteDoc(doc(db, 'menu_items', id)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `menu_items/${id}`);
    });

    addToast('warning', language === 'es' ? 'Plato Eliminado' : 'Dish Deleted', 'Retirado de la carta');
  };

  const toggleItemStock = (id: string) => {
    setMenuItems((prev) => prev.map((it) => {
      if (it.id === id) {
        const nextStock = !it.inStock;
        updateDoc(doc(db, 'menu_items', id), { inStock: nextStock }).catch((err) => {
          handleFirestoreError(err, OperationType.UPDATE, `menu_items/${id}`);
        });
        return { ...it, inStock: nextStock };
      }
      return it;
    }));
  };

  // -------------------------------------------------------------
  // REVIEWS & CONFIG
  // -------------------------------------------------------------
  const addReview = (rev: Omit<RestaurantReview, 'id' | 'date'>) => {
    const id = `rev-${Date.now()}`;
    const newRev: RestaurantReview = {
      id,
      date: 'Hoy',
      ...rev
    };

    setReviews((prev) => [newRev, ...prev]);

    setDoc(doc(db, 'reviews', id), newRev).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `reviews/${id}`);
    });

    addToast('success', language === 'es' ? 'Opinión Publicada' : 'Review Submitted', '¡Gracias por tu valoración!');
  };

  const updateConfig = (newConfig: Partial<RestaurantConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
    setDoc(doc(db, 'restaurant_config', 'settings'), { ...config, ...newConfig }, { merge: true }).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, 'restaurant_config/settings');
    });
  };

  const showToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    addToast(type, title, message);
  };

  return (
    <TastyContext.Provider
      value={{
        // SaaS vs Restaurant Mode & Views
        mode,
        setMode,
        mileniaView,
        setMileniaView,
        tenantView,
        setTenantView,
        selectTenantById,
        selectDishForCustomization: (dish: MenuItem) => setCustomizingItem(dish),
        isDarkMode: theme === 'dark',

        // Multi-Tenant SaaS
        tenants,
        employees,
        currentTenantId,
        currentTenant,
        switchTenant,
        addTenant,
        currentEmployeeId,
        currentEmployee,
        setCurrentEmployee,
        tenantEmployees,
        switchEmployee,
        tenantTables,
        updateTableStatus,
        currentRoute,
        navigateTo,

        // Navigation & State
        currentView,
        setCurrentView,
        language,
        setLanguage,
        selectedLocation,
        setSelectedLocation,
        orderType,
        setOrderType,
        theme,
        setTheme,
        toggleTheme,
        firebaseStatus,
        categories,
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemStock,
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        cartCount,
        subtotal,
        deliveryFee,
        serviceFee,
        tip,
        setTip,
        discount,
        promoCode,
        applyPromoCode,
        removePromoCode,
        total,
        orders,
        activeOrder,
        setActiveOrder,
        placeOrder,
        addOrder,
        updateOrderStatus,
        reservations,
        createReservation,
        updateReservationStatus,
        locations,
        reviews,
        addReview,
        config,
        updateConfig,
        toasts,
        addToast,
        showToast,
        removeToast,
        triggerConfetti,
        customizingItem,
        setCustomizingItem,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isUpsellOpen,
        setIsUpsellOpen,
        upsellItem,
        setUpsellItem,
        addWinePairingToCart,
        addSideToCart,
        isRewardsOpen,
        setIsRewardsOpen,
        rewardsProfile,
        setRewardsProfile,
        redeemRewardBenefit,
        dietaryFilter,
        setDietaryFilter
      }}
    >
      {children}
    </TastyContext.Provider>
  );
};

export const useTasty = (): TastyContextType => {
  const context = useContext(TastyContext);
  if (!context) {
    throw new Error('useTasty must be used within a TastyProvider');
  }
  return context;
};
