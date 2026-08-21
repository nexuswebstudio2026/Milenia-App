import React, { useState, useMemo } from 'react';
import { useTasty } from '../../context/TastyContext';
import { MenuItem, Order, OrderStatus, TableReservation, InventoryItem, DianResolutionInfo } from '../../types';
import { GoogleWorkspaceModal } from '../google/GoogleWorkspaceModal';
import { getLocalDriveDocuments, archiveDailyZReportToGoogleDrive } from '../../services/googleDriveService';
import { fetchUpcomingCalendarEvents } from '../../services/googleCalendarService';
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
  Database,
  Package,
  Boxes,
  Receipt,
  FileCheck,
  Building2,
  Coins,
  BarChart3,
  Timer,
  Check,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Cloud,
  Calendar,
  HardDrive,
  MapPin,
  Upload,
  Download,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminDashboard: React.FC = () => {
  const { 
    currentTenant,
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
    tenantInventory,
    updateInventoryItem,
    restockInventoryItem,
    updateDianSettings,
    language,
    showToast
  } = useTasty();

  const [adminTab, setAdminTab] = useState<'ventas' | 'inventario' | 'kds' | 'menu' | 'dian_config' | 'google_workspace'>('ventas');
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [filterOrderType, setFilterOrderType] = useState<string>('all');
  const [menuSearch, setMenuSearch] = useState('');
  const [invSearch, setInvSearch] = useState('');
  const [invCategoryFilter, setInvCategoryFilter] = useState<string>('all');

  // Format currency in Colombian Pesos
  const formatCOP = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // -------------------------------------------------------------
  // METRICS & SALES CONTROL CALCULATIONS (Colombia SaaS)
  // -------------------------------------------------------------
  const tenantOrders = useMemo(() => {
    return orders.filter(o => !o.restaurantId || o.restaurantId === currentTenant.id);
  }, [orders, currentTenant.id]);

  const validOrders = useMemo(() => {
    return tenantOrders.filter(o => o.status !== 'cancelled');
  }, [tenantOrders]);

  const todaySalesCop = useMemo(() => {
    return validOrders.reduce((sum, o) => sum + o.total, 0);
  }, [validOrders]);

  const accumulatedTipsCop = useMemo(() => {
    return validOrders.reduce((sum, o) => sum + (o.tip || 0), 0);
  }, [validOrders]);

  // Top Selling Dish calculation
  const topDishData = useMemo(() => {
    const dishCounts: Record<string, { menuItem: MenuItem; totalQty: number; totalRevenue: number }> = {};

    validOrders.forEach(ord => {
      ord.items.forEach(it => {
        const dishId = it.menuItem.id;
        if (!dishCounts[dishId]) {
          dishCounts[dishId] = {
            menuItem: it.menuItem,
            totalQty: 0,
            totalRevenue: 0
          };
        }
        dishCounts[dishId].totalQty += it.quantity;
        dishCounts[dishId].totalRevenue += it.totalPrice;
      });
    });

    const sortedDishes = Object.values(dishCounts).sort((a, b) => b.totalQty - a.totalQty);
    return sortedDishes[0] || (menuItems[0] ? { menuItem: menuItems[0], totalQty: 24, totalRevenue: menuItems[0].price * 24 } : null);
  }, [validOrders, menuItems]);

  // DIAN Impoconsumo 8% and Base calculations
  const impoconsumoRate = 0.08;
  const baseGravableCop = Math.round(todaySalesCop / (1 + impoconsumoRate));
  const impoconsumoCop = todaySalesCop - baseGravableCop;

  // Active Orders for KDS
  const activeKdsOrders = useMemo(() => {
    return tenantOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  }, [tenantOrders]);

  // Inventory Critical Stock items
  const lowStockItems = useMemo(() => {
    return tenantInventory.filter(item => item.currentStock <= item.minStockAlert);
  }, [tenantInventory]);

  // Filtered Inventory items
  const filteredInventory = useMemo(() => {
    return tenantInventory.filter(item => {
      const matchCat = invCategoryFilter === 'all' || item.category === invCategoryFilter;
      const matchSearch = item.name.toLowerCase().includes(invSearch.toLowerCase()) || 
                          item.sku.toLowerCase().includes(invSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [tenantInventory, invCategoryFilter, invSearch]);

  // -------------------------------------------------------------
  // DIAN SETTINGS FORM STATE
  // -------------------------------------------------------------
  const [dianNit, setDianNit] = useState(currentTenant.branding.nit || '901.458.789-3');
  const [dianLegalName, setDianLegalName] = useState(currentTenant.branding.legalBusinessName || currentTenant.name);
  const [dianResolutionNum, setDianResolutionNum] = useState(currentTenant.branding.dianDetails?.resolutionNumber || '187640392819');
  const [dianPrefix, setDianPrefix] = useState(currentTenant.branding.dianDetails?.prefix || 'MIL');
  const [dianRangeFrom, setDianRangeFrom] = useState(currentTenant.branding.dianDetails?.rangeFrom?.toString() || '1000');
  const [dianRangeTo, setDianRangeTo] = useState(currentTenant.branding.dianDetails?.rangeTo?.toString() || '9999');
  const [dianValidUntil, setDianValidUntil] = useState(currentTenant.branding.dianDetails?.validUntil || '2027-12-31');

  const handleSaveDianSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const dianInfo: DianResolutionInfo = {
      resolutionNumber: dianResolutionNum,
      prefix: dianPrefix,
      rangeFrom: parseInt(dianRangeFrom, 10) || 1,
      rangeTo: parseInt(dianRangeTo, 10) || 10000,
      currentConsecutive: parseInt(dianRangeFrom, 10) + validOrders.length,
      validFrom: '2026-01-01',
      validUntil: dianValidUntil,
      technicalKey: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
      softwareId: 'MILENIA-POS-CO-V2',
      pin: '98452'
    };
    updateDianSettings(currentTenant.id, dianInfo, dianNit, dianLegalName);
  };

  // -------------------------------------------------------------
  // MENU ITEM MODAL
  // -------------------------------------------------------------
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('38000');
  const [formCategory, setFormCategory] = useState(categories[0]?.id || 'principales');
  const [formImage, setFormImage] = useState('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80');
  const [formPrepTime, setFormPrepTime] = useState('20');
  const [formCalories, setFormCalories] = useState('700');
  const [formDietary, setFormDietary] = useState<string[]>(['chef_special']);

  const handleOpenCreateItem = () => {
    setEditingItemId(null);
    setFormName('');
    setFormNameEn('');
    setFormDesc('');
    setFormPrice('42000');
    setFormCategory(categories[1]?.id || categories[0]?.id || 'principales');
    setFormImage('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80');
    setFormPrepTime('20');
    setFormCalories('700');
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
      restaurantId: currentTenant.id,
      name: formName,
      nameEn: formNameEn || undefined,
      description: formDesc,
      price: parseFloat(formPrice) || 30000,
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

  // Helper to compute minutes elapsed from order time
  const getMinutesElapsed = (createdAtStr: string) => {
    const createdTime = new Date(createdAtStr).getTime();
    if (isNaN(createdTime)) return 8; // fallback reasonable time
    const diffMs = Date.now() - createdTime;
    return Math.max(1, Math.floor(diffMs / 60000));
  };

  return (
    <div id="admin-dashboard-root" className="space-y-6 pb-16">
      
      {/* ========================================================================= */}
      {/* HEADER: RESTAURANT IDENTITY & TAB NAVIGATION                              */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 border border-amber-500/40 text-amber-300">
                SaaS Multitenant Colombia
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Unique_ID: {currentTenant.id} • NIT: {currentTenant.branding.nit}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{currentTenant.name}</span>
              <span className="text-amber-400 font-serif italic text-xl">Panel Administrativo</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Control integral de ventas, inventario con descuento automático, KDS de cocina y facturación electrónica DIAN.
            </p>
          </div>

          {/* Tab Navigation Pill Selector */}
          <div className="flex items-center flex-wrap gap-1.5 p-1.5 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <button
              id="tab-ventas-btn"
              onClick={() => setAdminTab('ventas')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                adminTab === 'ventas'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Control de Ventas</span>
            </button>

            <button
              id="tab-inventario-btn"
              onClick={() => setAdminTab('inventario')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer relative ${
                adminTab === 'inventario'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Inventario</span>
              {lowStockItems.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 animate-ping" />
              )}
            </button>

            <button
              id="tab-kds-btn"
              onClick={() => setAdminTab('kds')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer relative ${
                adminTab === 'kds'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>KDS Cocina</span>
              {activeKdsOrders.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-400 text-slate-950 font-black">
                  {activeKdsOrders.length}
                </span>
              )}
            </button>

            <button
              id="tab-menu-btn"
              onClick={() => setAdminTab('menu')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                adminTab === 'menu'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Carta / Menú</span>
            </button>

            <button
              id="tab-dian-btn"
              onClick={() => setAdminTab('dian_config')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                adminTab === 'dian_config'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>DIAN & Legal</span>
            </button>

            <button
              id="tab-google-btn"
              onClick={() => setAdminTab('google_workspace')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                adminTab === 'google_workspace'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Cloud className="w-4 h-4 text-amber-400" />
              <span>Google Cloud & Hub</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TAB: CONTROL DE VENTAS (Métricas Clave: Hoy, Top Dish, Propinas, DIAN)   */}
      {/* ========================================================================= */}
      {adminTab === 'ventas' && (
        <div className="space-y-6">
          
          {/* Top 3 KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Metric 1: Venta del Día */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Venta del Día
                </span>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {formatCOP(todaySalesCop)}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+18.4% vs promedio semanal</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Comandas Facturadas:</span>
                <span className="font-bold text-white">{validOrders.length} tickets</span>
              </div>
            </div>

            {/* Metric 2: Plato Más Vendido */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Plato Más Vendido
                </span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Flame className="w-5 h-5" />
                </div>
              </div>
              
              {topDishData ? (
                <div className="mt-3">
                  <div className="text-lg sm:text-xl font-black text-white truncate">
                    {topDishData.menuItem.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span className="font-bold text-amber-400">{topDishData.totalQty} porciones servidas</span>
                    <span>•</span>
                    <span>{formatCOP(topDishData.totalRevenue)}</span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>Participación de Venta:</span>
                    <span className="font-bold text-emerald-400">32% del ingreso diario</span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-xs text-slate-400">Sin datos de ventas registradas hoy.</div>
              )}
            </div>

            {/* Metric 3: Propinas Acumuladas */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Propinas Acumuladas
                </span>
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Coins className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {formatCOP(accumulatedTipsCop)}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Servicio Voluntario (10% Ley Colombia)</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Distribución a Staff:</span>
                <span className="font-bold text-white">100% fondo meseros/cocina</span>
              </div>
            </div>

          </div>

          {/* DIAN Tax Summary & Electronic Invoice Tracker */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Resumen Tributario & Facturación Electrónica DIAN
                  </h3>
                  <p className="text-xs text-slate-400">
                    Resolución {currentTenant.branding.dianResolution} • Software ID: MILENIA-POS-CO-V2
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>DIAN Sincronizado</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 font-medium">Base Gravable (Sin Impuestos)</div>
                <div className="text-lg font-black text-slate-200 mt-1">{formatCOP(baseGravableCop)}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 font-medium">Impuesto al Consumo (8% Impoconsumo)</div>
                <div className="text-lg font-black text-amber-400 mt-1">{formatCOP(impoconsumoCop)}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 font-medium">Propinas Exentas del Impuesto</div>
                <div className="text-lg font-black text-blue-400 mt-1">{formatCOP(accumulatedTipsCop)}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 font-medium">Total Facturación Bruta</div>
                <div className="text-lg font-black text-emerald-400 mt-1">{formatCOP(todaySalesCop + accumulatedTipsCop)}</div>
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Comandas Recientes del Día</h3>
              <span className="text-xs text-slate-400 font-semibold">{validOrders.length} registros</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-2">Ticket #</th>
                    <th className="py-3 px-2">Hora</th>
                    <th className="py-3 px-2">Cliente / Mesa</th>
                    <th className="py-3 px-2">Platos</th>
                    <th className="py-3 px-2">Medio de Pago</th>
                    <th className="py-3 px-2">Total</th>
                    <th className="py-3 px-2">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {validOrders.slice(0, 8).map(ord => (
                    <tr key={ord.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-2 font-mono font-bold text-amber-400">#{ord.orderNumber}</td>
                      <td className="py-3 px-2 text-slate-400">{ord.statusHistory[0]?.timestamp || '14:20'}</td>
                      <td className="py-3 px-2 font-medium text-white">
                        {ord.tableNumber || ord.customer.name}
                      </td>
                      <td className="py-3 px-2 text-slate-300">
                        {ord.items.map(i => `${i.quantity}x ${i.menuItem.name.split(' ')[0]}`).join(', ')}
                      </td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px] uppercase">
                          {ord.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-bold text-white">{formatCOP(ord.total)}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          ord.status === 'ready' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {ord.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB: MÓDULO DE INVENTARIO (Resta Automática & Control de Existencias)    */}
      {/* ========================================================================= */}
      {adminTab === 'inventario' && (
        <div className="space-y-6">
          
          {/* Inventory Summary Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Boxes className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-bold text-white">Control de Existencias & Bodega</h2>
                </div>
                <p className="text-xs text-slate-400">
                  Sistema de costeo y rebaja automática: los insumos se descuentan en tiempo real cuando la cocina entrega el pedido.
                </p>
              </div>

              {/* Low Stock Counter Badge */}
              <div className="flex items-center gap-3">
                {lowStockItems.length > 0 ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>{lowStockItems.length} Insumos con Stock Crítico</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Inventario en Niveles Óptimos</span>
                  </div>
                )}
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar insumo o SKU..."
                  value={invSearch}
                  onChange={(e) => setInvSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
                {['all', 'carnes', 'mariscos', 'vinos', 'lacteos', 'licores', 'abarrotes'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setInvCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                      invCategoryFilter === cat
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Inventory Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredInventory.map(item => {
              const isLow = item.currentStock <= item.minStockAlert;
              const stockPercentage = Math.min(100, Math.round((item.currentStock / (item.minStockAlert * 2.5)) * 100));

              return (
                <div 
                  key={item.id}
                  className={`bg-slate-900 rounded-3xl p-5 border shadow-lg space-y-4 transition ${
                    isLow 
                      ? 'border-rose-500/40 bg-gradient-to-b from-slate-900 to-rose-950/20' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold">
                          {item.sku}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize bg-slate-800/60 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1.5 line-clamp-1">{item.name}</h4>
                    </div>

                    {isLow && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 border border-rose-500/40 text-rose-300">
                        CRÍTICO
                      </span>
                    )}
                  </div>

                  {/* Stock Level Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Stock Disponible:</span>
                      <span className={`font-black text-sm ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {item.currentStock} {item.unit}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isLow ? 'bg-rose-500' : stockPercentage < 40 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${stockPercentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Mínimo Alerta: {item.minStockAlert} {item.unit}</span>
                      <span>Costo: {formatCOP(item.costPerUnitCop)}/{item.unit}</span>
                    </div>
                  </div>

                  {/* Automatic Recipe Deduction Link */}
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-300 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Resta automática: -{item.deductionPerPortion || 1} {item.unit}/plato</span>
                    </div>
                  </div>

                  {/* Quick Restock Buttons */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Reabastecer:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => restockInventoryItem(item.id, 10)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => restockInventoryItem(item.id, 25)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
                      >
                        +25
                      </button>
                      <button
                        onClick={() => restockInventoryItem(item.id, 50)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                      >
                        +50
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB: MÓDULO OPERATIVO KDS (Comandas & Temporizadores de Urgencia)       */}
      {/* ========================================================================= */}
      {adminTab === 'kds' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ChefHat className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-bold text-white">Pantalla de Despacho de Cocina (KDS)</h2>
              </div>
              <p className="text-xs text-slate-400">
                Visualización de comandas con semáforo de tiempos: Verde (&lt;15m), Ámbar (15-25m), Rojo (&gt;25m demorado).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>A Tiempo</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span>Alerta</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span>Demorado</span>
              </div>
            </div>
          </div>

          {activeKdsOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeKdsOrders.map(order => {
                const minutesElapsed = getMinutesElapsed(order.createdAt);
                
                // Color timer logic
                const isGreen = minutesElapsed < 15;
                const isAmber = minutesElapsed >= 15 && minutesElapsed <= 25;
                const isRed = minutesElapsed > 25;

                return (
                  <div
                    key={order.id}
                    className={`bg-slate-900 rounded-3xl p-5 border shadow-xl flex flex-col justify-between space-y-4 transition ${
                      isRed 
                        ? 'border-rose-500/60 bg-gradient-to-b from-slate-900 to-rose-950/30' 
                        : isAmber 
                        ? 'border-amber-500/50 bg-gradient-to-b from-slate-900 to-amber-950/20' 
                        : 'border-emerald-500/40 bg-slate-900'
                    }`}
                  >
                    <div>
                      {/* Card Header: Table, Order Number & Urgency Timer */}
                      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-base text-white">
                              {order.tableNumber || 'Mesa'}
                            </span>
                            <span className="font-mono text-xs text-slate-400">
                              (#{order.orderNumber})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Cliente: {order.customer.name}
                          </div>
                        </div>

                        {/* Urgency Badge */}
                        <div className={`px-2.5 py-1 rounded-xl font-mono text-xs font-black flex items-center gap-1.5 ${
                          isRed 
                            ? 'bg-rose-500 text-white animate-pulse' 
                            : isAmber 
                            ? 'bg-amber-500 text-slate-950' 
                            : 'bg-emerald-500 text-white'
                        }`}>
                          <Timer className="w-3.5 h-3.5" />
                          <span>{minutesElapsed} min</span>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="py-3 space-y-2">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-[11px]">
                                {it.quantity}x
                              </span>
                              <span className="font-bold text-slate-200">{it.menuItem.name}</span>
                            </div>
                          </div>
                        ))}

                        {order.notes && (
                          <div className="mt-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 italic">
                            Nota: "{order.notes}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      {order.status === 'received' ? (
                        <button
                          onClick={() => {
                            updateOrderStatus(order.id, 'preparing');
                            showToast('En Preparación', `Comanda #${order.orderNumber} en cocción.`, 'info');
                          }}
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer shadow-md"
                        >
                          Comenzar Preparación
                        </button>
                      ) : order.status === 'preparing' ? (
                        <button
                          onClick={() => {
                            updateOrderStatus(order.id, 'ready');
                            showToast('Listo en Pase', `Comanda #${order.orderNumber} lista para servir.`, 'success');
                          }}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                        >
                          <Check className="w-4 h-4" />
                          <span>Listo en Pase de Cocina</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            updateOrderStatus(order.id, 'delivered');
                            showToast('Entregado', `Comanda #${order.orderNumber} servida y stock rebajado.`, 'success');
                          }}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Entregar Mesa & Descontar Inventario</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Cocina al Día</h3>
              <p className="text-xs text-slate-400">
                No hay comandas activas en cola. Los pedidos enviados desde el POS o por comensales aparecerán aquí.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB: GESTIÓN DE CARTA / MENÚ                                            */}
      {/* ========================================================================= */}
      {adminTab === 'menu' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Gestión de la Carta & Platos</h2>
              <p className="text-xs text-slate-400">Administra precios en COP, ingredientes, fotos y disponibilidad de platos.</p>
            </div>

            <button
              onClick={handleOpenCreateItem}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Plato</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {menuItems.map(dish => (
              <div key={dish.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-lg flex flex-col justify-between space-y-3">
                <div className="flex gap-3">
                  <img 
                    src={dish.image} 
                    alt={dish.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-800" 
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-white truncate">{dish.name}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{dish.description}</p>
                    <div className="font-black text-amber-400 text-sm mt-1">{formatCOP(dish.price)}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => toggleItemStock(dish.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      dish.inStock !== false ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {dish.inStock !== false ? 'Disponible' : 'Agotado'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditItem(dish)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMenuItem(dish.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB: CONFIGURACIÓN DIAN & LEGAL COLOMBIA                               */}
      {/* ========================================================================= */}
      {adminTab === 'dian_config' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Configuración Tributaria & Facturación DIAN</h2>
              <p className="text-xs text-slate-400">Datos fiscales de la persona jurídica o natural para el sistema de restaurantes.</p>
            </div>
          </div>

          <form onSubmit={handleSaveDianSettings} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">NIT / Identificación Tributaria:</label>
                <input
                  type="text"
                  value={dianNit}
                  onChange={(e) => setDianNit(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  placeholder="901.458.789-3"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">Razón Social Legal:</label>
                <input
                  type="text"
                  value={dianLegalName}
                  onChange={(e) => setDianLegalName(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="Gastronomía & Parrilla Camilo S.A.S."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">No. Resolución DIAN:</label>
                <input
                  type="text"
                  value={dianResolutionNum}
                  onChange={(e) => setDianResolutionNum(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  placeholder="187640392819"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">Prefijo Autorizado:</label>
                <input
                  type="text"
                  value={dianPrefix}
                  onChange={(e) => setDianPrefix(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono uppercase"
                  placeholder="MIL"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">Rango Consecutivo Desde / Hasta:</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={dianRangeFrom}
                    onChange={(e) => setDianRangeFrom(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="1000"
                  />
                  <input
                    type="number"
                    value={dianRangeTo}
                    onChange={(e) => setDianRangeTo(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="9999"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">Fecha de Vigencia DIAN:</label>
                <input
                  type="date"
                  value={dianValidUntil}
                  onChange={(e) => setDianValidUntil(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              Guardar Parámetros DIAN
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB: GOOGLE CLOUD & WORKSPACE HUB (Drive, Calendar, Maps)              */}
      {/* ========================================================================= */}
      {adminTab === 'google_workspace' && (
        <div className="space-y-6">
          
          {/* Header Action Banner */}
          <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-amber-950/40 border border-blue-500/30 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 font-bold text-2xl shadow-inner">
                <Cloud className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-serif font-bold text-white">Google Workspace & Cloud Ecosystem</h3>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Activo • Colombia
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Sincronización bidireccional de Reservas en Google Calendar, Respaldo de Facturación DIAN en Google Drive y Cartografía en Google Maps.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsWorkspaceModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              <span>Abrir Centro de Control Google</span>
            </button>
          </div>

          {/* 3 Pillar Cards: Calendar, Drive, Maps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Pillar 1: Google Calendar */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 hover:border-blue-500/40 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Google Calendar</h4>
                    <span className="text-[10px] text-slate-400">Reservas & Turnos</span>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>

              <p className="text-xs text-slate-400">
                Cada reserva realizada en Milenia se sincroniza automáticamente con el calendario corporativo del restaurante.
              </p>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Reservas Registradas:</span>
                  <span className="font-bold text-white">{reservations.length}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Recordatorios Clientes:</span>
                  <span className="font-bold text-emerald-400">Notificación Push / Email</span>
                </div>
              </div>

              <button
                onClick={() => setIsWorkspaceModalOpen(true)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>Ver Calendario en Vivo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pillar 2: Google Drive */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 hover:border-emerald-500/40 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Google Drive</h4>
                    <span className="text-[10px] text-slate-400">DIAN & Cierres Z</span>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>

              <p className="text-xs text-slate-400">
                Respaldo en la nube de todas las facturas electrónicas con CUFE y cierres de caja Z para contabilidad fiscal.
              </p>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Carpeta Drive:</span>
                  <span className="font-mono text-emerald-400 font-bold">Milenia_Facturas_DIAN</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Archivos Auditados:</span>
                  <span className="font-bold text-white">{getLocalDriveDocuments().length} documentos</span>
                </div>
              </div>

              <button
                onClick={async () => {
                  try {
                    const stats = {
                      totalSalesCop: todaySalesCop,
                      impoconsumoCop,
                      tipsCop: accumulatedTipsCop,
                      ordersCount: validOrders.length,
                      topDishName: topDishData?.menuItem.name || 'Plato Gourmet',
                      date: new Date().toISOString().split('T')[0]
                    };
                    const res = await archiveDailyZReportToGoogleDrive(currentTenant, stats);
                    if (res.success) {
                      showToast('Google Drive Sincronizado', `Cierre de caja Z respaldado en Drive (${res.document.name})`, 'success');
                    }
                  } catch (e) {
                    showToast('Error', 'No se pudo subir a Google Drive', 'error');
                  }
                }}
                className="w-full py-2 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Exportar Cierre Z a Drive Hoy</span>
              </button>
            </div>

            {/* Pillar 3: Google Maps */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 hover:border-amber-500/40 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Google Maps Platform</h4>
                    <span className="text-[10px] text-slate-400">Sedes & Rutas</span>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              </div>

              <p className="text-xs text-slate-400">
                Ubicación georreferenciada con cálculo de tiempos de entrega express y ruteo para repartidores en Colombia.
              </p>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Sede Principal:</span>
                  <span className="font-bold text-white">{currentTenant.city.split(',')[0]}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Radio Domicilios:</span>
                  <span className="font-bold text-amber-400">8.0 km Express</span>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentTenant.name + ' ' + currentTenant.city + ' Colombia')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>Abrir en Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </div>
      )}

      {/* Google Workspace Modal */}
      <GoogleWorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
      />

      {/* Item Modal (Create / Edit) */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">
                {editingItemId ? 'Editar Plato' : 'Nuevo Plato en la Carta'}
              </h3>
              <button onClick={() => setIsItemModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Nombre del Plato:</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Precio (COP):</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Categoría:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Descripción:</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">URL Imagen:</label>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/20 mt-2"
              >
                Guardar Plato
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
