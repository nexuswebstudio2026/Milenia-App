import React, { useState, useMemo } from 'react';
import { useTasty } from '../../context/TastyContext';
import { 
  UtensilsCrossed, 
  ChefHat, 
  CreditCard, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  QrCode, 
  Receipt, 
  DollarSign, 
  Layers, 
  Sparkles, 
  Check,
  Search,
  Printer,
  FileText,
  Timer,
  Play,
  Square,
  Award,
  Target,
  Coins,
  ShieldCheck,
  Building2,
  PhoneCall,
  LogOut
} from 'lucide-react';
import { RestaurantTable, MenuItem, Order, CartItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const EmployeeDashboard: React.FC = () => {
  const { 
    currentTenant, 
    currentEmployee, 
    tenantEmployees, 
    switchEmployee, 
    tenantTables, 
    updateTableStatus,
    menuItems, 
    categories, 
    orders, 
    addOrder,
    updateOrderStatus,
    clockInEmployee,
    clockOutEmployee,
    showToast,
    setMode,
    setMileniaView
  } = useTasty();

  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.warn('Logout error in EmployeeDashboard:', e);
    }
    setMode('milenia');
    setMileniaView('login');
    showToast('Sesión Cerrada', 'Has salido del sistema exitosamente.', 'info');
  };

  // POS Order Taking State (Waiter)
  const [selectedTable, setSelectedTable] = useState<RestaurantTable>(() => tenantTables[0] || null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [tableCart, setTableCart] = useState<CartItem[]>([]);
  const [tableSearch, setTableSearch] = useState('');
  const [tableNotes, setTableNotes] = useState('');

  // Cashier State
  const [selectedCashierOrderId, setSelectedCashierOrderId] = useState<string | null>(null);
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'card' | 'nequi' | 'daviplata' | 'pse'>('nequi');
  const [selectedPseBank, setSelectedPseBank] = useState<string>('Bancolombia');

  const role = currentEmployee?.role || 'mesero';

  const formatCOP = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Filter items by category
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCat = activeCategory === 'all' || item.categoryId === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(tableSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Table Cart helpers
  const addToTableCart = (item: MenuItem) => {
    setTableCart(prev => {
      const existing = prev.find(i => i.menuItem.id === item.id);
      if (existing) {
        return prev.map(i => i.menuItem.id === item.id 
          ? { ...i, quantity: i.quantity + 1, totalPrice: (i.quantity + 1) * item.price }
          : i
        );
      }
      return [...prev, {
        cartId: `pos-${Date.now()}-${item.id}`,
        menuItem: item,
        quantity: 1,
        selectedOptions: [],
        totalPrice: item.price
      }];
    });
    showToast('Plato añadido', `${item.name} agregado a la comanda.`, 'info');
  };

  const updateTableCartQty = (cartId: string, delta: number) => {
    setTableCart(prev => {
      return prev.map(item => {
        if (item.cartId === cartId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return {
            ...item,
            quantity: newQty,
            totalPrice: newQty * item.menuItem.price
          };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const tableSubtotal = tableCart.reduce((sum, i) => sum + i.totalPrice, 0);
  const tableTip = Math.round(tableSubtotal * 0.10); // 10% propina sugerida Colombia
  const tableTotal = tableSubtotal + tableTip;

  const handleSendToKitchen = () => {
    if (tableCart.length === 0) {
      showToast('Comanda Vacía', 'Agrega al menos un plato a la orden.', 'error');
      return;
    }

    const orderNum = Math.floor(1000 + Math.random() * 9000).toString();
    const orderId = `pos-ord-${Date.now()}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrder: Order = {
      id: orderId,
      restaurantId: currentTenant.id,
      tableNumber: selectedTable?.name || 'Mesa Barra',
      orderNumber: orderNum,
      createdAt: new Date().toISOString(),
      orderType: 'dinein',
      status: 'received',
      items: [...tableCart],
      customer: {
        name: `Comensal ${selectedTable?.name || 'Mesa'}`,
        email: 'atencion@milenia.com.co',
        phone: '+57 300 000 0000',
        tableNumber: selectedTable?.name || 'Mesa Barra'
      },
      subtotal: tableSubtotal,
      deliveryFee: 0,
      serviceFee: 0,
      tip: tableTip,
      discount: 0,
      total: tableTotal,
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      estimatedDeliveryTime: '15-20 min',
      notes: tableNotes || undefined,
      statusHistory: [
        {
          status: 'received',
          timestamp: nowTime,
          note: `Comanda tomada por ${currentEmployee?.name || 'Mesero'}`
        }
      ]
    };

    addOrder(newOrder);
    if (selectedTable) {
      updateTableStatus(selectedTable.id, 'occupied', orderId);
    }

    setTableCart([]);
    setTableNotes('');
    showToast('¡Comanda Enviada!', `Comanda #${orderNum} para ${selectedTable?.name} en cola de cocina.`, 'success');
  };

  // KDS Orders filtered for current restaurant
  const kdsOrders = orders.filter(o => 
    (!o.restaurantId || o.restaurantId === currentTenant.id) &&
    o.status !== 'delivered' && 
    o.status !== 'cancelled'
  );

  // Cashier Orders
  const cashierOrders = orders.filter(o => 
    (!o.restaurantId || o.restaurantId === currentTenant.id) &&
    o.status !== 'cancelled' &&
    o.status !== 'delivered'
  );

  const selectedCashierOrder = cashierOrders.find(o => o.id === selectedCashierOrderId) || cashierOrders[0] || null;

  // Helper to compute minutes elapsed from order time
  const getMinutesElapsed = (createdAtStr: string) => {
    const createdTime = new Date(createdAtStr).getTime();
    if (isNaN(createdTime)) return 10;
    const diffMs = Date.now() - createdTime;
    return Math.max(1, Math.floor(diffMs / 60000));
  };

  // Shift & Target Calculations
  const isShiftActive = currentEmployee?.shiftStatus === 'active';
  const monthlyGoalCop = currentEmployee?.monthlySalesGoalCop || 5000000;
  const currentSalesCop = currentEmployee?.currentMonthlySalesCop || 3450000;
  const goalPercentage = Math.min(100, Math.round((currentSalesCop / monthlyGoalCop) * 100));

  return (
    <div className="space-y-6 pb-16">
      
      {/* ========================================================================= */}
      {/* 1. TOP BAR: EMPLOYEE PROFILE, SHIFT CLOCK & SALES GOALS PROGRESS          */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left: Employee Info & Role */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl shrink-0">
              {currentEmployee?.name.charAt(0) || 'E'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {currentEmployee?.name || 'Empleado'}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isShiftActive 
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {isShiftActive ? '● En Turno Activo' : '○ Fuera de Turno'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Rol: <span className="font-bold text-amber-400 capitalize">{currentEmployee?.role || 'mesero'}</span> • 
                Sede: <span className="font-semibold text-slate-200">{currentTenant.name}</span> • 
                Ruta: <span className="font-mono text-slate-400 text-[11px]">/{currentTenant.id}/dashboard/{currentEmployee?.id}</span>
              </p>
            </div>
          </div>

          {/* Right: Shift Clock In/Out Buttons & Switcher */}
          <div className="flex items-center flex-wrap gap-2.5">
            {isShiftActive ? (
              <button
                onClick={() => currentEmployee && clockOutEmployee(currentEmployee.id)}
                className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 transition cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Cerrar Turno (Clock Out)</span>
              </button>
            ) : (
              <button
                onClick={() => currentEmployee && clockInEmployee(currentEmployee.id)}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Iniciar Turno (Clock In)</span>
              </button>
            )}

            {/* Quick Switch Employee Dropdown */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800">
              {tenantEmployees.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => switchEmployee(emp.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    currentEmployee?.id === emp.id
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {emp.name.split(' ')[0]} ({emp.role})
                </button>
              ))}
            </div>

            {/* Logout / Salir del Sistema button */}
            <button
              onClick={handleLogout}
              id="btn-logout-employee-dashboard"
              className="px-3.5 py-2 rounded-2xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Cerrar Sesión y Salir del Sistema"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>

        </div>

        {/* Sales Goals & Commission Performance Tracker */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          
          {/* Target 1: Monthly Sales Goal */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Meta Mensual de Ventas:</span>
              </div>
              <span className="font-bold text-amber-400">{goalPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500" 
                style={{ width: `${goalPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Actual: {formatCOP(currentSalesCop)}</span>
              <span>Meta: {formatCOP(monthlyGoalCop)}</span>
            </div>
          </div>

          {/* Target 2: Accumulated Tips */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                <Coins className="w-3.5 h-3.5 text-blue-400" />
                <span>Propinas Ganadas Hoy:</span>
              </div>
              <div className="text-lg font-black text-blue-400 mt-1">
                {formatCOP(currentEmployee?.accumulatedTipsCop || 95000)}
              </div>
            </div>
            <div className="text-[10px] text-slate-500 text-right">
              <div>Servicio 10%</div>
              <div className="text-emerald-400 font-bold">Liquidación diaria</div>
            </div>
          </div>

          {/* Target 3: Orders Served */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Comandas Atendidas:</span>
              </div>
              <div className="text-lg font-black text-emerald-400 mt-1">
                {currentEmployee?.totalOrdersTaken || 18} mesas
              </div>
            </div>
            <div className="text-[10px] text-slate-500 text-right">
              <div>Calificación: ⭐ 4.98</div>
              <div className="text-amber-400 font-bold">Nivel Oro</div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN ROLE-BASED INTERFACE (MESERO / COCINERO / CAJERO)                  */}
      {/* ========================================================================= */}

      {/* ------------------------------------------------------------- */}
      {/* A. ROL MESERO: TOMA DE PEDIDOS & COMANDAS POS                  */}
      {/* ------------------------------------------------------------- */}
      {role === 'mesero' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left 7 Columns: Table Selector & Menu Dish Catalog */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Table Selector Pills */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-white">Mesas & Salón</h3>
                </div>
                <span className="text-xs text-slate-400 font-semibold">
                  Mesa Seleccionada: <strong className="text-amber-400">{selectedTable?.name || 'Mesa 1'}</strong>
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {tenantTables.map(tbl => {
                  const isSelected = selectedTable?.id === tbl.id;
                  return (
                    <button
                      key={tbl.id}
                      onClick={() => setSelectedTable(tbl)}
                      className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                        isSelected 
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold shadow-md shadow-amber-500/10' 
                          : tbl.status === 'occupied'
                          ? 'border-rose-500/40 bg-rose-950/20 text-rose-300'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{tbl.name || `Mesa ${tbl.number}`}</div>
                      <div className="text-[10px] opacity-75">{tbl.capacity} pax</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Menu Items Catalog */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              
              {/* Category Pills & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                        activeCategory === cat.id
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar plato..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[440px] overflow-y-auto pr-1">
                {filteredMenuItems.map(dish => (
                  <div
                    key={dish.id}
                    onClick={() => addToTableCart(dish)}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/50 transition cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={dish.image} 
                        alt={dish.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-800"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-white truncate group-hover:text-amber-400 transition">
                          {dish.name}
                        </h4>
                        <div className="text-[11px] font-black text-amber-400 mt-0.5">
                          {formatCOP(dish.price)}
                        </div>
                      </div>
                    </div>

                    <button className="w-8 h-8 rounded-xl bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-300 flex items-center justify-center transition shrink-0">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Right 5 Columns: Current Table Order (Comanda) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 sticky top-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-white">
                    Comanda: {selectedTable?.name || (selectedTable ? `Mesa ${selectedTable.number}` : 'Mesa 1')}
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400 font-semibold">
                  {tableCart.length} ítems
                </span>
              </div>

              {/* Items in Cart */}
              {tableCart.length > 0 ? (
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {tableCart.map(it => (
                    <div key={it.cartId} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-white truncate">{it.menuItem.name}</div>
                        <div className="text-[11px] text-amber-400 font-semibold">{formatCOP(it.totalPrice)}</div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => updateTableCartQty(it.cartId, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-white">{it.quantity}</span>
                        <button
                          onClick={() => updateTableCartQty(it.cartId, 1)}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Toca los platos del catálogo para añadirlos a la comanda.
                </div>
              )}

              {/* Order Notes */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Instrucciones de Cocina (Término, Alergias):</label>
                <input
                  type="text"
                  placeholder="Ej: Término medio, sin cebolla..."
                  value={tableNotes}
                  onChange={(e) => setTableNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Subtotals */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Subtotal Comanda:</span>
                  <span className="font-bold text-white">{formatCOP(tableSubtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Propina Sugerida (10%):</span>
                  <span className="font-bold text-blue-400">{formatCOP(tableTip)}</span>
                </div>
                <div className="flex items-center justify-between text-white font-black text-sm pt-1 border-t border-slate-800">
                  <span>Total a Pagar:</span>
                  <span className="text-amber-400">{formatCOP(tableTotal)}</span>
                </div>
              </div>

              {/* Submit to Kitchen Button */}
              <button
                onClick={handleSendToKitchen}
                disabled={tableCart.length === 0}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Comanda a Cocina (KDS)</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* B. ROL COCINERO: KDS OPERATIVO CON TEMPORIZADORES DE URGENCIA  */}
      {/* ------------------------------------------------------------- */}
      {(role === 'cocina' || role === 'administrador') && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-base text-white">Comandas de Cocina Activas</h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">{kdsOrders.length} en preparación</span>
          </div>

          {kdsOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {kdsOrders.map(ord => {
                const elapsed = getMinutesElapsed(ord.createdAt);
                const isRed = elapsed > 25;
                const isAmber = elapsed >= 15 && elapsed <= 25;

                return (
                  <div
                    key={ord.id}
                    className={`bg-slate-900 rounded-3xl p-5 border shadow-xl flex flex-col justify-between space-y-4 ${
                      isRed 
                        ? 'border-rose-500/60 bg-gradient-to-b from-slate-900 to-rose-950/30' 
                        : isAmber 
                        ? 'border-amber-500/50 bg-gradient-to-b from-slate-900 to-amber-950/20' 
                        : 'border-emerald-500/40 bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                        <div>
                          <span className="font-black text-base text-white">{ord.tableNumber || 'Mesa'}</span>
                          <div className="text-xs font-mono text-slate-400">#{ord.orderNumber}</div>
                        </div>

                        <div className={`px-2.5 py-1 rounded-xl font-mono text-xs font-black flex items-center gap-1.5 ${
                          isRed ? 'bg-rose-500 text-white animate-pulse' : isAmber ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-white'
                        }`}>
                          <Timer className="w-3.5 h-3.5" />
                          <span>{elapsed} min</span>
                        </div>
                      </div>

                      <div className="py-3 space-y-2">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <span className="w-5 h-5 rounded bg-slate-800 text-amber-400 font-bold flex items-center justify-center">
                              {it.quantity}x
                            </span>
                            <span className="font-bold text-slate-200">{it.menuItem.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      {ord.status === 'received' ? (
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'preparing')}
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
                        >
                          Comenzar Cocción
                        </button>
                      ) : (
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'ready')}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Listo en Pase</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Cocina al Día</h3>
              <p className="text-xs text-slate-400">Sin comandas pendientes en cola.</p>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* C. ROL CAJERO: COBRO CON MEDIOS LOCALES (NEQUI, DAVIPLATA, PSE)*/}
      {/* ------------------------------------------------------------- */}
      {role === 'cajero' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Pending Tables to Settle */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-base text-white">Cuentas por Cobrar</h3>
                </div>
                <span className="text-xs text-slate-400 font-semibold">{cashierOrders.length} mesas abiertas</span>
              </div>

              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {cashierOrders.map(ord => {
                  const isSelected = selectedCashierOrder?.id === ord.id;
                  return (
                    <div
                      key={ord.id}
                      onClick={() => setSelectedCashierOrderId(ord.id)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected 
                          ? 'border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/10' 
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-white flex items-center gap-2">
                          <span>{ord.tableNumber || 'Mesa'}</span>
                          <span className="font-mono text-[11px] text-slate-400">#{ord.orderNumber}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {ord.items.length} platos • {ord.customer.name}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-sm text-white">{formatCOP(ord.total)}</div>
                        <span className="text-[10px] font-bold text-amber-400">Pendiente de Pago</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Colombian Payment Methods Simulator */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-base text-white">Terminal de Cobro & DIAN</h3>
                  <p className="text-xs text-slate-400">NIT: {currentTenant.branding.nit} • {currentTenant.branding.dianResolution}</p>
                </div>
                <Printer className="w-5 h-5 text-slate-400" />
              </div>

              {selectedCashierOrder && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Mesa Seleccionada:</span>
                    <span className="font-bold text-white">{selectedCashierOrder.tableNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Impoconsumo (8%):</span>
                    <span className="font-bold text-amber-400">{formatCOP(Math.round(selectedCashierOrder.subtotal * 0.08))}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-black text-white pt-1 border-t border-slate-800">
                    <span>Total a Facturar:</span>
                    <span className="text-emerald-400 text-base">{formatCOP(selectedCashierOrder.total)}</span>
                  </div>
                </div>
              )}

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Selecciona Medio de Pago Colombia:</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    onClick={() => setSelectedPaymentMethod('nequi')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      selectedPaymentMethod === 'nequi' 
                        ? 'border-purple-500 bg-purple-500/10 text-purple-300 font-bold' 
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <div className="font-black text-xs">NEQUI</div>
                    <div className="text-[9px] opacity-75">QR / Cel</div>
                  </button>

                  <button
                    onClick={() => setSelectedPaymentMethod('daviplata')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      selectedPaymentMethod === 'daviplata' 
                        ? 'border-red-500 bg-red-500/10 text-red-300 font-bold' 
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <div className="font-black text-xs">DAVIPLATA</div>
                    <div className="text-[9px] opacity-75">Billetera</div>
                  </button>

                  <button
                    onClick={() => setSelectedPaymentMethod('pse')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      selectedPaymentMethod === 'pse' 
                        ? 'border-blue-500 bg-blue-500/10 text-blue-300 font-bold' 
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <div className="font-black text-xs">PSE</div>
                    <div className="text-[9px] opacity-75">Bancos CO</div>
                  </button>

                  <button
                    onClick={() => setSelectedPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      selectedPaymentMethod === 'card' 
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold' 
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <div className="font-black text-xs">DATÁFONO</div>
                    <div className="text-[9px] opacity-75">Redeban</div>
                  </button>

                  <button
                    onClick={() => setSelectedPaymentMethod('cash')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      selectedPaymentMethod === 'cash' 
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold' 
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <div className="font-black text-xs">EFECTIVO</div>
                    <div className="text-[9px] opacity-75">Con cambio</div>
                  </button>
                </div>
              </div>

              {/* Specific Payment Method Detail */}
              {selectedPaymentMethod === 'pse' && (
                <div className="space-y-1.5 p-3 rounded-2xl bg-blue-950/20 border border-blue-500/30">
                  <label className="text-[11px] font-bold text-blue-300">Banco PSE Colombia:</label>
                  <select
                    value={selectedPseBank}
                    onChange={(e) => setSelectedPseBank(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-blue-500"
                  >
                    <option value="Bancolombia">Bancolombia</option>
                    <option value="Davivienda">Davivienda</option>
                    <option value="Nu Colombia">Nu Colombia</option>
                    <option value="Banco de Bogotá">Banco de Bogotá</option>
                    <option value="BBVA Colombia">BBVA Colombia</option>
                    <option value="Scotiabank Colpatria">Scotiabank Colpatria</option>
                  </select>
                </div>
              )}

              {/* Settlement Action Button */}
              <button
                onClick={() => {
                  if (selectedCashierOrder) {
                    updateOrderStatus(selectedCashierOrder.id, 'delivered');
                  }
                  showToast('Pago Registrado con Éxito', 'Factura electrónica generada y transmitida a la DIAN.', 'success');
                }}
                disabled={!selectedCashierOrder}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Registrar Pago & Emitir Factura Electrónica DIAN</span>
              </button>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};
