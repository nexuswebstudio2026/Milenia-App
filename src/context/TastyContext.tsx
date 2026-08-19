import React, { createContext, useContext, useState, useEffect } from 'react';
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
  FirebaseSyncStatus
} from '../types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_MENU_ITEMS, 
  INITIAL_LOCATIONS, 
  INITIAL_REVIEWS, 
  INITIAL_ORDERS, 
  INITIAL_RESERVATIONS, 
  DEFAULT_CONFIG 
} from '../data/mockData';
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

export type AppView = 'menu' | 'reservations' | 'locations' | 'reviews' | 'tracking' | 'admin';
export type Language = 'es' | 'en';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface TastyContextType {
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
  removeToast: (id: string) => void;
  triggerConfetti: () => void;

  // Modal helpers
  customizingItem: MenuItem | null;
  setCustomizingItem: (item: MenuItem | null) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
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
  // Navigation & Language
  const [currentView, setCurrentView] = useState<AppView>('menu');
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

  // Locations & Categories
  const [locations] = useState<RestaurantLocation[]>(INITIAL_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<RestaurantLocation>(INITIAL_LOCATIONS[0]);
  const [categories] = useState<MenuCategory[]>(INITIAL_CATEGORIES);

  // Dynamic Data with fallback to initial mock data
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('milenia_menu_items') || localStorage.getItem('laura_menu_items');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('milenia_orders') || localStorage.getItem('laura_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    const saved = localStorage.getItem('milenia_orders') || localStorage.getItem('laura_orders');
    const list = saved ? JSON.parse(saved) : INITIAL_ORDERS;
    return list.length > 0 ? list[0] : null;
  });

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
          if (snapshot.empty) {
            for (const item of INITIAL_MENU_ITEMS) {
              await setDoc(doc(db, 'menu_items', item.id), item).catch(err => 
                handleFirestoreError(err, OperationType.WRITE, 'menu_items')
              );
            }
          } else {
            const items: MenuItem[] = [];
            snapshot.forEach((docSnap) => {
              items.push({ id: docSnap.id, ...docSnap.data() } as MenuItem);
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
        unsubscribeReservations = onSnapshot(resCol, async (snapshot) => {
          if (snapshot.empty) {
            for (const res of INITIAL_RESERVATIONS) {
              await setDoc(doc(db, 'reservations', res.id), res).catch(err => 
                handleFirestoreError(err, OperationType.WRITE, 'reservations')
              );
            }
          } else {
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
        unsubscribeReviews = onSnapshot(reviewsCol, async (snapshot) => {
          if (snapshot.empty) {
            for (const rev of INITIAL_REVIEWS) {
              await setDoc(doc(db, 'reviews', rev.id), rev).catch(err => 
                handleFirestoreError(err, OperationType.WRITE, 'reviews')
              );
            }
          } else {
            const revList: RestaurantReview[] = [];
            snapshot.forEach((docSnap) => {
              revList.push({ id: docSnap.id, ...docSnap.data() } as RestaurantReview);
            });
            setReviews(revList);
          }
        }, (err) => {
          handleFirestoreError(err, OperationType.LIST, 'reviews');
        });

      } catch (error) {
        console.warn('Firebase initial sync warning:', error);
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
  }, []);

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

    setDoc(doc(db, 'orders', orderId), newOrder).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `orders/${orderId}`);
    });

    addToast(
      'success', 
      language === 'es' ? '¡Pedido Confirmado!' : 'Order Placed!', 
      language === 'es' ? `Comanda #${newOrderNumber} enviada a cocina` : `Ticket #${newOrderNumber} sent to kitchen`
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
    const tableAssigned = data.seatingArea === 'patio' ? 'Mesa Terraza T-04' :
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

  return (
    <TastyContext.Provider
      value={{
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
        removeToast,
        triggerConfetti,
        customizingItem,
        setCustomizingItem,
        isCheckoutOpen,
        setIsCheckoutOpen
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
