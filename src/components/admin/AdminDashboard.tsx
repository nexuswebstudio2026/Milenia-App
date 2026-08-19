import React, { useState } from 'react';
import { useTasty } from '../../context/TastyContext';
import { MenuItem, Order, OrderStatus, TableReservation } from '../../types';
import { 
  ChefHat, 
  Utensils, 
  CalendarDays, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  Truck, 
  Store, 
  AlertCircle, 
  Printer, 
  Volume2, 
  Layers, 
  X,
  Sparkles,
  Search,
  Flame,
  Database
} from 'lucide-react';
import { motion } from 'motion/react';

export const AdminDashboard: React.FC = () => {
  const { 
    orders, 
    updateOrderStatus, 
    menuItems, 
    addMenuItem, 
    updateMenuItem, 
    deleteMenuItem, 
    toggleItemStock, 
    categories, 
    reservations, 
    updateReservationStatus, 
    config, 
    updateConfig,
    language 
  } = useTasty();

  const [adminTab, setAdminTab] = useState<'kds' | 'menu' | 'reservations' | 'settings'>('kds');
  const [filterOrderType, setFilterOrderType] = useState<string>('all');
  const [menuSearch, setMenuSearch] = useState('');

  // New/Edit Item modal state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('24.50');
  const [formCategory, setFormCategory] = useState('signature_mains');
  const [formImage, setFormImage] = useState('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80');
  const [formPrepTime, setFormPrepTime] = useState('20');
  const [formCalories, setFormCalories] = useState('650');
  const [formDietary, setFormDietary] = useState<string[]>(['chef_special']);

  // Summary KPIs
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const completedOrders = orders.filter(o => o.status === 'delivered');
  const avgOrderValue = orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00';

  // Handle open modal for create vs edit
  const handleOpenCreateItem = () => {
    setEditingItemId(null);
    setFormName('');
    setFormNameEn('');
    setFormDesc('');
    setFormPrice('28.00');
    setFormCategory(categories[1]?.id || 'signature_mains');
    setFormImage('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80');
    setFormPrepTime('20');
    setFormCalories('650');
    setFormDietary(['chef_special']);
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: MenuItem) => {
    setEditingItemId(item.id);
    setFormName(item.name);
    setFormNameEn(item.nameEn || '');
    setFormDesc(item.description);
    setFormPrice(item.price.toString());
    setFormCategory(item.categoryId);
    setFormImage(item.image);
    setFormPrepTime(item.prepTimeMinutes.toString());
    setFormCalories(item.calories?.toString() || '');
    setFormDietary(item.dietary);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    const itemData = {
      name: formName,
      nameEn: formNameEn || undefined,
      description: formDesc,
      price: parseFloat(formPrice) || 20,
      categoryId: formCategory,
      image: formImage,
      prepTimeMinutes: parseInt(formPrepTime, 10) || 15,
      calories: parseInt(formCalories, 10) || undefined,
      dietary: formDietary as any,
      inStock: true
    };

    if (editingItemId) {
      updateMenuItem(editingItemId, itemData);
    } else {
      addMenuItem(itemData);
    }
    setIsItemModalOpen(false);
  };

  const filteredOrders = orders.filter(o => {
    if (filterOrderType === 'all') return true;
    return o.orderType === filterOrderType;
  });

  return (
    <div id="admin-dashboard-view" className="space-y-6 sm:space-y-8">
      
      {/* Top Admin Header & KPI Cards */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <ChefHat className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                  MILENIA Staff & Kitchen Hub
                </h1>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" />
                  Firebase Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'es' 
                  ? 'Panel de control de comandas KDS, inventario de autor, reservas y sincronización en tiempo real.' 
                  : 'Live KDS tickets, chef inventory, reservations and real-time cloud synchronisation.'}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">{language === 'es' ? 'Ventas Totales' : 'Total Revenue'}</span>
              <div className="text-lg font-black text-amber-400">€{totalRevenue.toFixed(2)}</div>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">{language === 'es' ? 'En Cocina' : 'Active Orders'}</span>
              <div className="text-lg font-black text-amber-500">{activeOrders.length}</div>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">{language === 'es' ? 'Completados' : 'Delivered'}</span>
              <div className="text-lg font-black text-emerald-400">{completedOrders.length}</div>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">{language === 'es' ? 'Ticket Prom.' : 'Avg Ticket'}</span>
              <div className="text-lg font-black text-slate-200">€{avgOrderValue}</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-800 pt-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setAdminTab('kds')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
              adminTab === 'kds' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>{language === 'es' ? 'Cocina KDS (Comandas)' : 'Kitchen KDS (Tickets)'}</span>
            {activeOrders.length > 0 && (
              <span className="bg-slate-950 text-amber-400 text-xs px-2 py-0.5 rounded-full font-black">
                {activeOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('menu')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
              adminTab === 'menu' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>{language === 'es' ? 'Gestor de Menú & Stock' : 'Menu & Stock Manager'}</span>
          </button>

          <button
            onClick={() => setAdminTab('reservations')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
              adminTab === 'reservations' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>{language === 'es' ? 'Reservas de Mesas' : 'Table Bookings'}</span>
            <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full">
              {reservations.length}
            </span>
          </button>

          <button
            onClick={() => setAdminTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
              adminTab === 'settings' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{language === 'es' ? 'Configuración Restaurante' : 'Settings'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: KITCHEN DISPLAY SYSTEM (KDS) */}
      {adminTab === 'kds' && (
        <div className="space-y-4">
          {/* KDS Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 font-bold uppercase">{language === 'es' ? 'Filtrar tipo:' : 'Filter mode:'}</span>
              <button
                onClick={() => setFilterOrderType('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  filterOrderType === 'all' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {language === 'es' ? 'Todos' : 'All'}
              </button>
              <button
                onClick={() => setFilterOrderType('delivery')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  filterOrderType === 'delivery' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                🛵 {language === 'es' ? 'Domicilio' : 'Delivery'}
              </button>
              <button
                onClick={() => setFilterOrderType('pickup')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  filterOrderType === 'pickup' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                🛍️ {language === 'es' ? 'Recoger' : 'Takeout'}
              </button>
            </div>

            <div className="text-slate-400 dark:text-slate-500 text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'es' ? 'Avanza el estado de comanda en Firebase en tiempo real' : 'Update ticket status in Firebase in real-time'}</span>
            </div>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* COLUMN 1: NUEVOS & CONFIRMADOS */}
            <div className="bg-slate-100/90 dark:bg-slate-900/60 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{language === 'es' ? 'Nuevos / Por Preparar' : 'New / Incoming'}</h3>
                </div>
                <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-black text-xs px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                  {filteredOrders.filter(o => o.status === 'received' || o.status === 'confirmed').length}
                </span>
              </div>

              <div className="space-y-3">
                {filteredOrders
                  .filter(o => o.status === 'received' || o.status === 'confirmed')
                  .map(order => (
                    <div key={order.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-slate-900 dark:text-white text-sm">#{order.orderNumber}</span>
                        <span className="text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md">
                          {order.orderType}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold">{order.customer.name} - {order.customer.phone}</div>

                      {/* Items */}
                      <div className="bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-xl text-xs space-y-1 divide-y divide-slate-100 dark:divide-slate-700">
                        {order.items.map((it, i) => (
                          <div key={i} className="pt-1 first:pt-0 flex justify-between font-medium text-slate-800 dark:text-slate-200">
                            <span>{it.quantity}x {language === 'es' ? it.menuItem.name : (it.menuItem.nameEn || it.menuItem.name)}</span>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <div className="text-[11px] bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl text-amber-900 dark:text-amber-300 italic border border-amber-200 dark:border-amber-800/40">
                          "{order.notes}"
                        </div>
                      )}

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing', 'Comanda enviada a fogones')}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2 rounded-xl transition cursor-pointer shadow-xs"
                        >
                          {language === 'es' ? 'Cocinar 👨‍🍳' : 'Start Prep'}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* COLUMN 2: EN PREPARACIÓN */}
            <div className="bg-slate-100/90 dark:bg-slate-900/60 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-600 animate-pulse"></span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{language === 'es' ? 'En Cocina / Fogones' : 'In Kitchen'}</h3>
                </div>
                <span className="bg-amber-500 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full">
                  {filteredOrders.filter(o => o.status === 'preparing').length}
                </span>
              </div>

              <div className="space-y-3">
                {filteredOrders
                  .filter(o => o.status === 'preparing')
                  .map(order => (
                    <div key={order.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border-2 border-amber-500 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-slate-900 dark:text-white text-sm">#{order.orderNumber}</span>
                        <span className="text-[10px] font-bold uppercase bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md animate-pulse">
                          Cocina L’AURA
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-900 dark:text-white">{order.customer.name}</div>

                      <div className="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl text-xs space-y-1">
                        {order.items.map((it, i) => (
                          <div key={i} className="flex justify-between font-bold text-amber-950 dark:text-amber-200">
                            <span>{it.quantity}x {language === 'es' ? it.menuItem.name : (it.menuItem.nameEn || it.menuItem.name)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => updateOrderStatus(order.id, 'out_for_delivery', 'Listo para entrega')}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2 rounded-xl transition cursor-pointer shadow-xs"
                        >
                          {language === 'es' ? 'Listo / Emplatado ✓' : 'Ready / Out ✓'}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* COLUMN 3: EN REPARTO O ENTREGADOS */}
            <div className="bg-slate-100/90 dark:bg-slate-900/60 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{language === 'es' ? 'En Reparto / Listos' : 'Out / Completed'}</h3>
                </div>
                <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-black text-xs px-2 py-0.5 rounded-full">
                  {filteredOrders.filter(o => o.status === 'out_for_delivery' || o.status === 'delivered').length}
                </span>
              </div>

              <div className="space-y-3">
                {filteredOrders
                  .filter(o => o.status === 'out_for_delivery' || o.status === 'delivered')
                  .map(order => (
                    <div key={order.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 opacity-95">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-slate-900 dark:text-white text-sm">#{order.orderNumber}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          order.status === 'delivered' ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 dark:text-slate-300">{order.customer.name} • €{order.total.toFixed(2)}</div>

                      {order.status === 'out_for_delivery' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered', 'Entregado con éxito')}
                          className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer"
                        >
                          {language === 'es' ? 'Marcar Entregado ✓' : 'Mark Delivered ✓'}
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: MENU & DISH INVENTORY MANAGEMENT */}
      {adminTab === 'menu' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">{language === 'es' ? 'Gestor de Carta y Stock' : 'Menu & Inventory Management'}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{language === 'es' ? 'Añade nuevas creaciones gastronómicas, ajusta precios o cambia stock al instante.' : 'Add new gourmet dishes, adjust pricing, or toggle stock availability instantly.'}</p>
            </div>

            <button
              onClick={handleOpenCreateItem}
              className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer self-start shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'es' ? 'Añadir Nuevo Plato' : 'Add New Dish'}</span>
            </button>
          </div>

          {/* Search bar inside admin menu */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              placeholder={language === 'es' ? 'Buscar plato en inventario...' : 'Search items...'}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500"
            />
          </div>

          {/* Dish Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Plato</th>
                  <th className="p-3.5">Categoría</th>
                  <th className="p-3.5">Precio</th>
                  <th className="p-3.5">Prep</th>
                  <th className="p-3.5">Stock</th>
                  <th className="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {menuItems
                  .filter(i => !menuSearch || i.name.toLowerCase().includes(menuSearch.toLowerCase()))
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{item.description}</div>
                        </div>
                      </td>
                      <td className="p-3.5 capitalize text-slate-600 dark:text-slate-400">{item.categoryId.replace('_', ' ')}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">€{item.price.toFixed(2)}</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">{item.prepTimeMinutes} min</td>
                      <td className="p-3.5">
                        <button
                          onClick={() => toggleItemStock(item.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition cursor-pointer ${
                            item.inStock ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {item.inStock ? 'En Stock' : 'Agotado'}
                        </button>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditItem(item)}
                          className="p-1.5 text-slate-400 hover:text-amber-500 transition cursor-pointer"
                          title="Editar plato"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMenuItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                          title="Eliminar plato"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RESERVATIONS ADMIN */}
      {adminTab === 'reservations' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">{language === 'es' ? 'Gestión de Reservas de Mesas' : 'Table Reservations Admin'}</h2>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Código</th>
                  <th className="p-3.5">Cliente</th>
                  <th className="p-3.5">Comensales</th>
                  <th className="p-3.5">Fecha & Hora</th>
                  <th className="p-3.5">Zona / Mesa</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5 text-right">Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">{res.reservationCode}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{res.guestName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{res.guestPhone}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">{res.guestsCount} pers.</td>
                    <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">{res.date} ({res.time}h)</td>
                    <td className="p-3.5 capitalize text-slate-600 dark:text-slate-300">{res.seatingArea.replace('_', ' ')} - <span className="font-semibold text-slate-900 dark:text-white">{res.tableAssigned}</span></td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        res.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                        res.status === 'seated' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      {res.status === 'confirmed' && (
                        <button
                          onClick={() => updateReservationStatus(res.id, 'seated')}
                          className="bg-blue-600 text-white font-bold text-xs px-2.5 py-1 rounded-xl hover:bg-blue-700 transition cursor-pointer"
                        >
                          Sentar
                        </button>
                      )}
                      <button
                        onClick={() => updateReservationStatus(res.id, 'completed')}
                        className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 rounded-xl hover:bg-emerald-700 transition cursor-pointer"
                      >
                        Completar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: RESTAURANT SETTINGS */}
      {adminTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 max-w-2xl">
          <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">{language === 'es' ? 'Parámetros del Restaurante' : 'Restaurant Operational Settings'}</h2>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Nombre de la Marca</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => updateConfig({ name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-amber-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Umbral Envío Gratis (€)</label>
                <input
                  type="number"
                  value={config.freeDeliveryThreshold}
                  onChange={(e) => updateConfig({ freeDeliveryThreshold: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Tasa de Servicio (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.serviceFeeRate}
                  onChange={(e) => updateConfig({ serviceFeeRate: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Aceptar Pedidos en Línea</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Permite a los comensales tramitar pedidos de alta cocina en la web</div>
              </div>
              <button
                onClick={() => updateConfig({ acceptingOrders: !config.acceptingOrders })}
                className={`px-4 py-2 rounded-xl font-black text-xs transition cursor-pointer ${
                  config.acceptingOrders ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {config.acceptingOrders ? 'Activo ✓' : 'Pausado'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal (Create/Edit) */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-serif font-bold text-slate-900 dark:text-white text-base">
                {editingItemId ? (language === 'es' ? 'Editar Creación Gastronómica' : 'Edit Dish') : (language === 'es' ? 'Nuevo Plato para la Carta' : 'New Menu Dish')}
              </h3>
              <button onClick={() => setIsItemModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Nombre del Plato (Español) *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Nombre en Inglés (Opcional)</label>
                <input
                  type="text"
                  value={formNameEn}
                  onChange={(e) => setFormNameEn(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Categoría *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-amber-500 outline-none"
                  >
                    {categories.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Precio (€) *</label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">URL de la Fotografía</label>
                <input
                  type="url"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Descripción e Ingredientes de Autor</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-18 text-xs text-slate-900 dark:text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 rounded-xl transition cursor-pointer shadow-md"
                >
                  {language === 'es' ? 'Guardar en Firebase' : 'Save to Firebase'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer"
                >
                  {language === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
