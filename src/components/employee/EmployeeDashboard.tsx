import React, { useState } from 'react';
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
  FileText
} from 'lucide-react';
import { RestaurantTable, MenuItem, Order, CartItem } from '../../types';

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
    showToast 
  } = useTasty();

  // POS Order Taking State (Waiter)
  const [selectedTable, setSelectedTable] = useState<RestaurantTable>(() => tenantTables[0] || null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [tableCart, setTableCart] = useState<CartItem[]>([]);
  const [tableSearch, setTableSearch] = useState('');
  const [tableNotes, setTableNotes] = useState('');

  // Cashier State
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'card' | 'nequi' | 'daviplata'>('nequi');

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

  const cartSubtotal = tableCart.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartTax = cartSubtotal * 0.08; // 8% Impoconsumo Colombia
  const cartTip = cartSubtotal * 0.10; // 10% Propina sugerida
  const cartTotal = cartSubtotal + cartTax + cartTip;

  // Send Order to Kitchen (Mesero Action)
  const handleSendToKitchen = () => {
    if (!selectedTable) {
      showToast('Selecciona una mesa', 'Debes asignar la comanda a una mesa del salón.', 'warning');
      return;
    }
    if (tableCart.length === 0) {
      showToast('Comanda vacía', 'Agrega al menos un plato a la orden.', 'warning');
      return;
    }

    const orderNumber = `${currentTenant.slug.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      restaurantId: currentTenant.id,
      employeeId: currentEmployee?.id,
      tableNumber: selectedTable.number,
      orderNumber,
      createdAt: new Date().toISOString(),
      orderType: 'dinein',
      status: 'received',
      subtotal: cartSubtotal,
      deliveryFee: 0,
      serviceFee: cartTax,
      tip: cartTip,
      discount: 0,
      total: cartTotal,
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      estimatedDeliveryTime: '15-20 min',
      customer: {
        name: `Comensales ${selectedTable.number}`,
        email: `mesa@${currentTenant.slug}.co`,
        phone: '+57 300 000 0000',
        tableNumber: selectedTable.number
      },
      items: tableCart,
      notes: tableNotes,
      statusHistory: [
        { status: 'received', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: `Comanda tomada por ${currentEmployee?.name}` }
      ]
    };

    addOrder(newOrder);
    updateTableStatus(selectedTable.id, 'occupied', newOrder.id);
    setTableCart([]);
    setTableNotes('');
    showToast('Comanda Enviada a Cocina', `Ticket ${orderNumber} transmitido al KDS de Cocina en tiempo real.`, 'success');
  };

  // Kitchen Display Orders (Received or Preparing)
  const kitchenOrders = orders.filter(o => 
    (o.restaurantId === currentTenant.id || !o.restaurantId) && 
    (o.status === 'received' || o.status === 'preparing')
  );

  // Cashier Active Orders
  const cashierOrders = orders.filter(o => 
    (o.restaurantId === currentTenant.id || !o.restaurantId) &&
    o.paymentStatus === 'pending'
  );

  const selectedCashierOrder = cashierOrders[0] || null;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Employee Context Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <img
            src={currentEmployee?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
            alt={currentEmployee?.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500 shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                ID: {currentEmployee?.id}
              </span>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                role === 'cocina'
                  ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30'
                  : role === 'cajero'
                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                  : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              }`}>
                {role.toUpperCase()}
              </span>
            </div>
            
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {currentEmployee?.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Terminal POS: <strong className="text-slate-700 dark:text-slate-300">{currentTenant.name}</strong> • {currentTenant.city.split(',')[0]}
            </p>
          </div>
        </div>

        {/* Quick Role / Employee Switcher */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2">Cambiar Empleado:</span>
          {tenantEmployees.map(emp => (
            <button
              key={emp.id}
              onClick={() => switchEmployee(emp.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                currentEmployee?.id === emp.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{emp.name.split(' ')[0]}</span>
              <span className="text-[9px] opacity-75 uppercase">({emp.role})</span>
            </button>
          ))}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 1. VISTA MESERO: POS Toma de Pedidos & Salón de Mesas                      */}
      {/* ========================================================================= */}
      {role === 'mesero' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Tables Map & Food Catalog (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Tables Grid */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Mapa de Mesas - {currentTenant.name}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-500">Libre</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-slate-500">Ocupada</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    <span className="text-slate-500">Cuenta</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {tenantTables.map((tbl) => {
                  const isSelected = selectedTable?.id === tbl.id;
                  const isOccupied = tbl.status === 'occupied';
                  const isBilling = tbl.status === 'billing';

                  return (
                    <button
                      key={tbl.id}
                      onClick={() => setSelectedTable(tbl)}
                      className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer relative ${
                        isSelected 
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 shadow-md ring-2 ring-amber-500/50' 
                          : isOccupied
                          ? 'border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20'
                          : isBilling
                          ? 'border-purple-200 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                          {tbl.number}
                        </span>
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          tbl.status === 'available' ? 'bg-emerald-500' :
                          tbl.status === 'occupied' ? 'bg-amber-500' :
                          tbl.status === 'billing' ? 'bg-purple-500' : 'bg-blue-500'
                        }`} />
                      </div>

                      <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                        <div>{tbl.zone}</div>
                        <div className="font-semibold">{tbl.capacity} puestos</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Catalog & Quick Touch POS */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Carta de Platos & Bebidas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Toca un plato para añadirlo a la comanda de la <strong className="text-amber-500">{selectedTable?.number || 'Mesa'}</strong>
                  </p>
                </div>

                <div className="relative max-w-xs w-full">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Buscar plato..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Category Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Menu Items Quick Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
                {filteredMenuItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => addToTableCart(item)}
                    className="group bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-slate-700/80 hover:border-amber-500 rounded-2xl p-3.5 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-2 shadow-2xs hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                        {formatCOP(item.price)}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-lg">
                        <Plus className="w-3 h-3" /> Añadir
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Right Column: Active Table Ticket (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm sticky top-6 space-y-5">
              
              {/* Ticket Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-amber-500" />
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      Comanda en Proceso
                    </h3>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                      {selectedTable?.number || 'Sin mesa asignada'} • {selectedTable?.zone}
                    </p>
                  </div>
                </div>

                {tableCart.length > 0 && (
                  <button
                    onClick={() => setTableCart([])}
                    className="text-xs text-red-500 hover:text-red-600 font-semibold cursor-pointer"
                  >
                    Vaciar
                  </button>
                )}
              </div>

              {/* Items List in Ticket */}
              {tableCart.length > 0 ? (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {tableCart.map((item) => (
                    <div 
                      key={item.cartId}
                      className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {item.menuItem.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {formatCOP(item.totalPrice)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => updateTableCartQty(item.cartId, -1)}
                          className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold hover:bg-slate-300 transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-black text-xs w-4 text-center text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateTableCartQty(item.cartId, 1)}
                          className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold hover:bg-amber-600 transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                  <UtensilsCrossed className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No hay platos en la comanda. Selecciona platos del catálogo para añadirlos.
                  </p>
                </div>
              )}

              {/* Special Instructions Note */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notas para la Cocina (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej: Carne término 3/4, salsa aparte..."
                  value={tableNotes}
                  onChange={(e) => setTableNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatCOP(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impoconsumo (8%):</span>
                  <span>{formatCOP(cartTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Propina sugerida (10%):</span>
                  <span>{formatCOP(cartTip)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Comanda:</span>
                  <span className="text-amber-500">{formatCOP(cartTotal)}</span>
                </div>
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendToKitchen}
                disabled={tableCart.length === 0}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Comanda a Cocina (KDS)</span>
              </button>

            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VISTA COCINA: KDS (Kitchen Display System en Tiempo Real)               */}
      {/* ========================================================================= */}
      {role === 'cocina' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900 text-white p-4 sm:p-5 rounded-2xl">
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-orange-400" />
              <div>
                <h3 className="font-bold text-sm sm:text-base">KDS Cocina & Parrilla en Tiempo Real</h3>
                <p className="text-xs text-slate-400">Comandas en marcha para {currentTenant.name}</p>
              </div>
            </div>
            <div className="text-xs bg-orange-500/20 text-orange-300 font-mono px-3 py-1 rounded-full border border-orange-500/30">
              {kitchenOrders.length} Tickets Activos
            </div>
          </div>

          {kitchenOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {kitchenOrders.map((order) => {
                const isReady = order.status === 'ready';

                return (
                  <div
                    key={order.id}
                    className={`rounded-3xl border p-5 flex flex-col justify-between space-y-4 shadow-md transition-all ${
                      order.status === 'received'
                        ? 'bg-amber-50/60 dark:bg-slate-900 border-amber-500 ring-2 ring-amber-500/30'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Ticket Head */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-2.5 py-1 rounded-xl">
                            {order.orderNumber}
                          </span>
                          <span className="font-black text-sm text-slate-900 dark:text-white">
                            {order.tableNumber || 'Mesa'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 font-mono font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Hace 4 min</span>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex items-start justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/60">
                            <div className="flex items-start gap-2">
                              <span className="w-5 h-5 rounded-lg bg-orange-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">
                                {it.quantity}x
                              </span>
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white">{it.menuItem.name}</span>
                                {it.selectedOptions.length > 0 && (
                                  <div className="text-[10px] text-amber-600 dark:text-amber-400">
                                    {it.selectedOptions.map(o => o.choiceName).join(', ')}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <div className="bg-amber-100 dark:bg-amber-950/50 p-2.5 rounded-xl text-xs text-amber-900 dark:text-amber-300 font-medium">
                          Nota: {order.notes}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      {order.status === 'received' ? (
                        <button
                          onClick={() => {
                            updateOrderStatus(order.id, 'preparing');
                            showToast('En preparación', `Comanda ${order.orderNumber} marcada en cocción.`, 'info');
                          }}
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          Comenzar Preparación
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            updateOrderStatus(order.id, 'ready');
                            showToast('Plato Listo', `Comanda ${order.orderNumber} lista para entrega en mesa.`, 'success');
                          }}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                        >
                          <Check className="w-4 h-4" />
                          <span>Marcar Listo / Pase de Cocina</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Cocina al día</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No hay comandas pendientes en cola. Los nuevos pedidos de los meseros aparecerán aquí automáticamente.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VISTA CAJERO: Facturación & Medios de Pago Colombia                     */}
      {/* ========================================================================= */}
      {role === 'cajero' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Pending Bills (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Cuentas Pendientes por Cobrar
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-semibold">{cashierOrders.length} Mesas</span>
              </div>

              <div className="space-y-3">
                {cashierOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-800/60 transition flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{ord.tableNumber || 'Mesa'}</span>
                        <span className="font-mono text-[11px] text-slate-400">({ord.orderNumber})</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {ord.items.length} platos • {ord.customer.name}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-sm text-slate-900 dark:text-white">
                        {formatCOP(ord.total)}
                      </div>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        Pendiente de Pago
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Payment Gateway Terminal Colombia (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Cobro & Factura DIAN
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    NIT: {currentTenant.branding.nit} • {currentTenant.branding.dianResolution}
                  </p>
                </div>
                <Printer className="w-5 h-5 text-slate-400" />
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Seleccionar Medio de Pago:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setSelectedPaymentMethod('nequi')}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      selectedPaymentMethod === 'nequi'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-black text-xs">NEQUI QR</div>
                    <div className="text-[10px] opacity-75">Transferencia</div>
                  </button>

                  <button
                    onClick={() => setSelectedPaymentMethod('daviplata')}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      selectedPaymentMethod === 'daviplata'
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-black text-xs">DAVIPLATA</div>
                    <div className="text-[10px] opacity-75">Billetera</div>
                  </button>

                  <button
                    onClick={() => setSelectedPaymentMethod('card')}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      selectedPaymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-black text-xs">DATÁFONO</div>
                    <div className="text-[10px] opacity-75">Redeban / Visa</div>
                  </button>

                  <button
                    onClick={() => setSelectedPaymentMethod('cash')}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      selectedPaymentMethod === 'cash'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-black text-xs">EFECTIVO</div>
                    <div className="text-[10px] opacity-75">Con cambio</div>
                  </button>
                </div>
              </div>

              {/* Settlement Button */}
              <button
                onClick={() => {
                  if (selectedCashierOrder) {
                    updateOrderStatus(selectedCashierOrder.id, 'delivered');
                  }
                  showToast('Pago Registrado con Éxito', 'Factura electrónica generada y transmitida.', 'success');
                }}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Registrar Pago & Emitir Factura DIAN</span>
              </button>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};
