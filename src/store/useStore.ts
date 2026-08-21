import { create } from 'zustand';
import { 
  TenantRestaurant, 
  TenantEmployee, 
  RestaurantTable, 
  MenuItem, 
  MenuCategory, 
  Order, 
  TableReservation, 
  InventoryItem,
  PayrollRecord,
  CartItem
} from '../types';
import { 
  INITIAL_TENANTS, 
  INITIAL_EMPLOYEES, 
  INITIAL_TABLES, 
  getTenantMenu, 
  getTenantCategories, 
  getTenantInventory,
  getTenantOrders,
  getTenantReservations
} from '../data/multiTenantData';

// Initial Colombian payroll mock data per restaurant
export const INITIAL_PAYROLL_RECORDS: PayrollRecord[] = [
  {
    id: 'pay-001',
    restaurantId: '1',
    employeeId: 'emp-101',
    employeeName: 'Juan Camilo Vélez',
    documentId: '1.020.456.789',
    position: 'Capitán de Meseros',
    periodMonth: 'Agosto 2026',
    baseSalaryCop: 1850000,
    workedDays: 30,
    overtimeHours: 8,
    overtimePayCop: 92500,
    transportAllowanceCop: 200000,
    healthDeductionCop: 74000,
    pensionDeductionCop: 74000,
    tipsShareCop: 450000,
    netPayableCop: 2354500,
    paymentStatus: 'paid',
    paidAt: '2026-08-15'
  },
  {
    id: 'pay-002',
    restaurantId: '1',
    employeeId: 'emp-102',
    employeeName: 'Chef Martha Restrepo',
    documentId: '43.890.123',
    position: 'Chef Ejecutiva de Parrilla',
    periodMonth: 'Agosto 2026',
    baseSalaryCop: 3200000,
    workedDays: 30,
    overtimeHours: 12,
    overtimePayCop: 240000,
    transportAllowanceCop: 0, // No aplica por superar 2 SMMLV
    healthDeductionCop: 128000,
    pensionDeductionCop: 128000,
    tipsShareCop: 380000,
    netPayableCop: 3564000,
    paymentStatus: 'paid',
    paidAt: '2026-08-15'
  },
  {
    id: 'pay-003',
    restaurantId: '1',
    employeeId: 'emp-103',
    employeeName: 'Carlos Montoya',
    documentId: '1.036.782.901',
    position: 'Cajero & Facturador DIAN',
    periodMonth: 'Agosto 2026',
    baseSalaryCop: 1650000,
    workedDays: 30,
    overtimeHours: 4,
    overtimePayCop: 41250,
    transportAllowanceCop: 200000,
    healthDeductionCop: 66000,
    pensionDeductionCop: 66000,
    tipsShareCop: 250000,
    netPayableCop: 2009250,
    paymentStatus: 'pending'
  },
  {
    id: 'pay-004',
    restaurantId: '2',
    employeeId: 'emp-201',
    employeeName: 'Alejandro Morales',
    documentId: '80.123.456',
    position: 'Sommelier & Maître',
    periodMonth: 'Agosto 2026',
    baseSalaryCop: 3800000,
    workedDays: 30,
    overtimeHours: 10,
    overtimePayCop: 237500,
    transportAllowanceCop: 0,
    healthDeductionCop: 152000,
    pensionDeductionCop: 152000,
    tipsShareCop: 750000,
    netPayableCop: 4483500,
    paymentStatus: 'paid',
    paidAt: '2026-08-15'
  }
];

export interface StoreState {
  // Multi-tenant Active Restaurant
  activeRestaurantId: string;
  activeRestaurant: TenantRestaurant;
  allTenants: TenantRestaurant[];
  
  // Dynamic Tenant Data loaded by activeRestaurantId
  menuItems: MenuItem[];
  categories: MenuCategory[];
  inventory: InventoryItem[];
  tables: RestaurantTable[];
  employees: TenantEmployee[];
  activeEmployee: TenantEmployee | null;
  orders: Order[];
  reservations: TableReservation[];
  payrollRecords: PayrollRecord[];
  
  // Customer Cart
  cart: CartItem[];
  orderType: 'delivery' | 'pickup' | 'dine_in';
  promoCode: string | null;
  discount: number;
  tip: number;
  
  // Dynamic Actions
  setRestaurantId: (restaurantId: string) => void;
  setActiveEmployeeId: (employeeId: string) => void;
  setOrderType: (type: 'delivery' | 'pickup' | 'dine_in') => void;
  
  // Cart Actions
  addToCart: (item: MenuItem, options?: any[], qty?: number) => void;
  removeFromCart: (cartId: string) => void;
  updateCartQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => boolean;
  setTip: (tipAmount: number) => void;
  
  // Order Actions
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  
  // Inventory Actions
  updateInventoryStock: (itemId: string, newStock: number) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'restaurantId'>) => void;
  
  // Payroll Actions
  processPayrollPayment: (recordId: string) => void;
  addPayrollRecord: (record: Omit<PayrollRecord, 'id' | 'restaurantId'>) => void;
  
  // Table Actions
  updateTableStatus: (tableId: string, status: RestaurantTable['status'], diners?: number) => void;
}

export const useStore = create<StoreState>((set, get) => {
  const initialTenantId = '1';
  const tenant = INITIAL_TENANTS.find(t => t.id === initialTenantId) || INITIAL_TENANTS[0];
  const tenantEmps = INITIAL_EMPLOYEES.filter(e => e.restaurantId === initialTenantId);
  const tenantTbls = INITIAL_TABLES.filter(t => t.restaurantId === initialTenantId);
  const tenantPayroll = INITIAL_PAYROLL_RECORDS.filter(p => p.restaurantId === initialTenantId);

  return {
    activeRestaurantId: initialTenantId,
    activeRestaurant: tenant,
    allTenants: INITIAL_TENANTS,
    
    menuItems: getTenantMenu(initialTenantId),
    categories: getTenantCategories(initialTenantId),
    inventory: getTenantInventory(initialTenantId),
    tables: tenantTbls,
    employees: tenantEmps,
    activeEmployee: tenantEmps[0] || null,
    orders: getTenantOrders(initialTenantId),
    reservations: getTenantReservations(initialTenantId),
    payrollRecords: tenantPayroll,
    
    cart: [],
    orderType: 'delivery',
    promoCode: null,
    discount: 0,
    tip: 0,

    // Switch active tenant dynamically
    setRestaurantId: (restaurantId: string) => {
      const selected = INITIAL_TENANTS.find(t => t.id === restaurantId || t.slug === restaurantId) || INITIAL_TENANTS[0];
      const validId = selected.id;
      const emps = INITIAL_EMPLOYEES.filter(e => e.restaurantId === validId);
      const tbls = INITIAL_TABLES.filter(t => t.restaurantId === validId);
      const pay = INITIAL_PAYROLL_RECORDS.filter(p => p.restaurantId === validId);

      // Apply CSS dynamic theme variables if present
      if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--tenant-primary', selected.branding.primaryColor);
        document.documentElement.style.setProperty('--tenant-accent', selected.branding.accentColor);
      }

      set({
        activeRestaurantId: validId,
        activeRestaurant: selected,
        menuItems: getTenantMenu(validId),
        categories: getTenantCategories(validId),
        inventory: getTenantInventory(validId),
        tables: tbls,
        employees: emps,
        activeEmployee: emps[0] || null,
        orders: getTenantOrders(validId),
        reservations: getTenantReservations(validId),
        payrollRecords: pay.length > 0 ? pay : [
          {
            id: `pay-${validId}-01`,
            restaurantId: validId,
            employeeId: emps[0]?.id || 'emp-default',
            employeeName: emps[0]?.name || 'Colaborador Principal',
            documentId: emps[0]?.documentId || '1.098.765.432',
            position: emps[0]?.position || 'Encargado de Operaciones',
            periodMonth: 'Agosto 2026',
            baseSalaryCop: emps[0]?.baseSalaryCop || 2200000,
            workedDays: 30,
            overtimeHours: 6,
            overtimePayCop: 68750,
            transportAllowanceCop: 200000,
            healthDeductionCop: 88000,
            pensionDeductionCop: 88000,
            tipsShareCop: 350000,
            netPayableCop: 2642750,
            paymentStatus: 'pending'
          }
        ],
        cart: [] // reset cart when changing restaurant
      });
    },

    setActiveEmployeeId: (employeeId: string) => {
      const emps = get().employees;
      const found = emps.find(e => e.id === employeeId);
      if (found) {
        set({ activeEmployee: found });
      }
    },

    setOrderType: (type) => set({ orderType: type }),

    addToCart: (item: MenuItem, options = [], qty = 1) => {
      set((state) => {
        const existing = state.cart.find(c => c.menuItem.id === item.id);
        if (existing) {
          const newQty = existing.quantity + qty;
          return {
            cart: state.cart.map(c => 
              c.menuItem.id === item.id 
                ? { ...c, quantity: newQty, totalPrice: newQty * item.price }
                : c
            )
          };
        }
        return {
          cart: [...state.cart, {
            cartId: `cart-${Date.now()}-${item.id}`,
            menuItem: item,
            quantity: qty,
            selectedOptions: options,
            totalPrice: item.price * qty
          }]
        };
      });
    },

    removeFromCart: (cartId: string) => {
      set(state => ({
        cart: state.cart.filter(c => c.cartId !== cartId)
      }));
    },

    updateCartQuantity: (cartId: string, quantity: number) => {
      set(state => {
        if (quantity <= 0) {
          return { cart: state.cart.filter(c => c.cartId !== cartId) };
        }
        return {
          cart: state.cart.map(c => 
            c.cartId === cartId 
              ? { ...c, quantity, totalPrice: c.menuItem.price * quantity }
              : c
          )
        };
      });
    },

    clearCart: () => set({ cart: [], promoCode: null, discount: 0 }),

    applyPromoCode: (code: string) => {
      const clean = code.trim().toUpperCase();
      if (clean === 'MILENIA20' || clean === 'COLOMBIA10') {
        const discRate = clean === 'MILENIA20' ? 0.20 : 0.10;
        set({ promoCode: clean, discount: discRate });
        return true;
      }
      return false;
    },

    setTip: (tipAmount: number) => set({ tip: tipAmount }),

    addOrder: (order: Order) => {
      set(state => ({
        orders: [order, ...state.orders]
      }));
    },

    updateOrderStatus: (orderId: string, status: Order['status']) => {
      set(state => ({
        orders: state.orders.map(o => o.id === orderId ? { ...o, status } : o)
      }));
    },

    updateInventoryStock: (itemId: string, newStock: number) => {
      set(state => ({
        inventory: state.inventory.map(item => 
          item.id === itemId 
            ? { ...item, currentStock: Math.max(0, newStock), lastRestockedAt: new Date().toISOString() }
            : item
        )
      }));
    },

    addInventoryItem: (item) => {
      set(state => {
        const newItem: InventoryItem = {
          ...item,
          id: `inv-${Date.now()}`,
          restaurantId: state.activeRestaurantId
        };
        return {
          inventory: [newItem, ...state.inventory]
        };
      });
    },

    processPayrollPayment: (recordId: string) => {
      set(state => ({
        payrollRecords: state.payrollRecords.map(p => 
          p.id === recordId 
            ? { ...p, paymentStatus: 'paid', paidAt: new Date().toISOString().split('T')[0] }
            : p
        )
      }));
    },

    addPayrollRecord: (record) => {
      set(state => {
        const newRecord: PayrollRecord = {
          ...record,
          id: `pay-${Date.now()}`,
          restaurantId: state.activeRestaurantId
        };
        return {
          payrollRecords: [newRecord, ...state.payrollRecords]
        };
      });
    },

    updateTableStatus: (tableId: string, status: RestaurantTable['status'], diners?: number) => {
      set(state => ({
        tables: state.tables.map(t => 
          t.id === tableId 
            ? { ...t, status, dinersCount: diners !== undefined ? diners : t.dinersCount }
            : t
        )
      }));
    }
  };
});
