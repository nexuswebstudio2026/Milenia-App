import React, { useState, useMemo } from 'react';
import { useTasty } from '../../context/TastyContext';
import { useStore } from '../../store/useStore';
import { 
  Building2, 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign, 
  Receipt, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Download, 
  CreditCard, 
  Smartphone, 
  QrCode, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Percent, 
  Coffee, 
  Check, 
  X,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCop } from '../../utils/currency';
import { InventoryItem, PayrollRecord } from '../../types';

export const AdminLayout: React.FC = () => {
  const { 
    currentTenant, 
    tenants, 
    switchTenant, 
    orders, 
    tenantEmployees, 
    currentEmployee, 
    switchEmployee, 
    inventory, 
    updateInventoryItem,
    showToast,
    navigateTo 
  } = useTasty();

  const {
    payrollRecords,
    processPayrollPayment,
    addPayrollRecord,
    updateInventoryStock,
    addInventoryItem
  } = useStore();

  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'payroll' | 'dian'>('sales');
  
  // Inventory state
  const [invSearch, setInvSearch] = useState('');
  const [invCategoryFilter, setInvCategoryFilter] = useState<string>('all');
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [newItemData, setNewItemData] = useState({
    name: '',
    category: 'carnes' as const,
    currentStock: 10,
    minStockAlert: 5,
    unit: 'kg' as const,
    costPerUnitCop: 35000,
    sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`
  });

  // Payroll state
  const [selectedPayrollEmployeeId, setSelectedPayrollEmployeeId] = useState<string>(tenantEmployees[0]?.id || 'emp-101');
  const [isVolanteModalOpen, setIsVolanteModalOpen] = useState(false);
  const [activeVolanteRecord, setActiveVolanteRecord] = useState<PayrollRecord | null>(null);

  // Sales metrics calculation
  const validOrders = useMemo(() => orders.filter(o => o.status !== 'cancelled'), [orders]);
  
  const todaySalesCop = useMemo(() => {
    return validOrders.reduce((sum, o) => sum + (o.total * 4300), 0);
  }, [validOrders]);

  const monthlySalesCop = useMemo(() => {
    return currentTenant.totalMonthlySalesCop || (todaySalesCop * 24);
  }, [currentTenant, todaySalesCop]);

  const impoconsumoTotalCop = useMemo(() => {
    return Math.round(todaySalesCop * 0.08); // 8% Impoconsumo en Colombia
  }, [todaySalesCop]);

  const tipsTotalCop = useMemo(() => {
    return Math.round(todaySalesCop * 0.10); // 10% Propina sugerida
  }, [todaySalesCop]);

  const averageTicketCop = useMemo(() => {
    return validOrders.length > 0 ? Math.round(todaySalesCop / validOrders.length) : 0;
  }, [todaySalesCop, validOrders]);

  // Payment Breakdown
  const paymentBreakdown = useMemo(() => {
    const counts = { nequi: 0, daviplata: 0, pse: 0, card: 0, cash: 0 };
    validOrders.forEach(o => {
      const pm = (o.paymentMethod || 'nequi').toLowerCase();
      if (pm.includes('nequi')) counts.nequi += o.total * 4300;
      else if (pm.includes('daviplata')) counts.daviplata += o.total * 4300;
      else if (pm.includes('pse')) counts.pse += o.total * 4300;
      else if (pm.includes('card')) counts.card += o.total * 4300;
      else counts.cash += o.total * 4300;
    });
    return counts;
  }, [validOrders]);

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(invSearch.toLowerCase()) || item.sku.toLowerCase().includes(invSearch.toLowerCase());
      const matchesCat = invCategoryFilter === 'all' || item.category === invCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [inventory, invSearch, invCategoryFilter]);

  // Low stock alerts
  const lowStockItems = useMemo(() => {
    return inventory.filter(i => i.currentStock <= i.minStockAlert);
  }, [inventory]);

  // Total inventory valuation
  const totalInventoryValuationCop = useMemo(() => {
    return inventory.reduce((sum, item) => sum + (item.currentStock * item.costPerUnitCop), 0);
  }, [inventory]);

  // Current tenant payroll records
  const tenantPayroll = useMemo(() => {
    return payrollRecords.filter(p => p.restaurantId === currentTenant.id);
  }, [payrollRecords, currentTenant.id]);

  const handleCreateInventoryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemData.name.trim()) return;

    addInventoryItem({
      name: newItemData.name,
      sku: newItemData.sku,
      category: newItemData.category,
      currentStock: Number(newItemData.currentStock),
      minStockAlert: Number(newItemData.minStockAlert),
      unit: newItemData.unit,
      costPerUnitCop: Number(newItemData.costPerUnitCop),
      lastRestockedAt: new Date().toISOString()
    });

    setIsNewItemModalOpen(false);
    showToast('Insumo Registrado', `${newItemData.name} añadido al inventario.`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP RESTAURANT & MULTI-TENANT CONTEXT BAR                  */}
      {/* ------------------------------------------------------------- */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand & Active Tenant Switcher */}
          <div className="flex items-center gap-3.5">
            <div 
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg border border-amber-500/30"
              style={{ backgroundColor: currentTenant.branding?.primaryColor || '#ea580c' }}
            >
              <Building2 className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  MILENIA SAAS COLOMBIA
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Plan {currentTenant.subscription?.plan?.toUpperCase() || 'PRO'}
                </span>
              </div>

              {/* Selector de Restaurante Activo */}
              <div className="flex items-center gap-2 mt-1">
                <select
                  value={currentTenant.id}
                  onChange={(e) => switchTenant(e.target.value)}
                  className="bg-slate-800/90 text-white font-bold text-sm sm:text-base rounded-xl px-3 py-1 border border-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.city.split(',')[0]})
                    </option>
                  ))}
                </select>
                <span className="text-xs text-slate-400 hidden sm:inline">NIT: {currentTenant.branding?.nit}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'sales' 
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-extrabold' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Ventas & DIAN</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 relative ${
                activeTab === 'inventory' 
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-extrabold' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Inventario Stock</span>
              {lowStockItems.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('payroll')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'payroll' 
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-extrabold' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Nómina Colombia</span>
            </button>

            <button
              onClick={() => navigateTo({ routeType: 'employee_dashboard', restaurantId: currentTenant.id })}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 transition flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Abrir Pantalla de POS / KDS Cocina"
            >
              <Coffee className="w-4 h-4" />
              <span>POS / Empleados</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN ADMIN CONTENT CONTAINER                               */}
      {/* ------------------------------------------------------------- */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 flex-1 w-full space-y-6">
        
        {/* =========================================================== */}
        {/* TAB 1: RESUMEN DE VENTAS (DIARIO & MENSUAL / DIAN)          */}
        {/* =========================================================== */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            
            {/* High-Level Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Ventas Hoy */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Ventas de Hoy</span>
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  {formatCop(todaySalesCop)}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium">
                  <span className="bg-emerald-500/20 px-1.5 py-0.5 rounded">+{validOrders.length} pedidos</span>
                  <span className="text-slate-400">Hoy en salón & domicilio</span>
                </div>
              </div>

              {/* Card 2: Ventas Mensuales Acumuladas */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Ventas Mes (Agosto)</span>
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  {formatCop(monthlySalesCop)}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-blue-400 font-medium">
                  <span>Meta: {formatCop(monthlySalesCop * 1.15)}</span>
                </div>
              </div>

              {/* Card 3: Impoconsumo 8% DIAN */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Impoconsumo (8% DIAN)</span>
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                    <Receipt className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-400">
                  {formatCop(impoconsumoTotalCop)}
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  Fiscal: {currentTenant.branding?.dianResolution?.split('No.')[1]?.substring(0, 15) || 'Res. DIAN 2026'}
                </div>
              </div>

              {/* Card 4: Propinas Voluntarias (10%) */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Propinas Equipo (10%)</span>
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-purple-400">
                  {formatCop(tipsTotalCop)}
                </div>
                <div className="mt-2 text-xs text-purple-300">
                  Para distribuir entre {tenantEmployees.length} colaboradores
                </div>
              </div>
            </div>

            {/* Payment Method Breakdown & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Payment Methods (Nequi, Daviplata, PSE, Tarjeta, Efectivo) */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-serif font-bold text-lg text-white">Canales de Pago (Colombia)</h3>
                  <span className="text-xs text-slate-400">Distribución</span>
                </div>

                <div className="space-y-3.5">
                  {/* Nequi */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-purple-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Nequi Colombia</p>
                        <p className="text-[10px] text-slate-400">Push Notificación / QR</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-purple-300 text-sm">{formatCop(paymentBreakdown.nequi || todaySalesCop * 0.45)}</span>
                  </div>

                  {/* Daviplata */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-rose-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold text-xs">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Daviplata</p>
                        <p className="text-[10px] text-slate-400">Código OTP / Clave Dinámica</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-rose-300 text-sm">{formatCop(paymentBreakdown.daviplata || todaySalesCop * 0.25)}</span>
                  </div>

                  {/* PSE */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-blue-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">PSE (Bancos ACH)</p>
                        <p className="text-[10px] text-slate-400">Bancolombia, Davivienda, etc.</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-blue-300 text-sm">{formatCop(paymentBreakdown.pse || todaySalesCop * 0.20)}</span>
                  </div>

                  {/* Datafono / Tarjetas */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Tarjetas & Datáfono</p>
                        <p className="text-[10px] text-slate-400">Visa / Mastercard / Amex</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-300 text-sm">{formatCop(paymentBreakdown.card || todaySalesCop * 0.10)}</span>
                  </div>
                </div>
              </div>

              {/* Orders List / Historial */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-white">Comandas & Facturas del Turno</h3>
                    <p className="text-xs text-slate-400">Últimas transacciones registradas</p>
                  </div>
                  <span className="text-xs font-bold bg-slate-800 text-amber-400 px-3 py-1 rounded-xl">
                    Ticket Promedio: {formatCop(averageTicketCop)}
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                  {validOrders.slice(0, 6).map((order) => (
                    <div key={order.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between hover:border-amber-500/40 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                          #{order.orderNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{order.customer?.name || 'Cliente'}</span>
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full capitalize">
                              {order.orderType === 'dine_in' ? '🍽️ Mesa' : order.orderType === 'delivery' ? '🛵 Domicilio' : '🛍️ Recoger'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Pago: <span className="uppercase font-semibold text-slate-300">{order.paymentMethod}</span> • CUFE: {order.dianCufe ? order.dianCufe.substring(0, 16) + '...' : 'SETP-AUTO'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-sm text-emerald-400 font-mono">
                          {formatCop(order.total * 4300)}
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          order.status === 'delivered' || order.status === 'ready' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================== */}
        {/* TAB 2: GESTIÓN DE INVENTARIO (STOCK DE INGREDIENTES)         */}
        {/* =========================================================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            
            {/* Inventory Overview Header Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-xl text-white">Stock de Ingredientes & Cava</h3>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                    Valor Total: {formatCop(totalInventoryValuationCop)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Control de materias primas con auto-descuento en comandas y alertas de punto de reorden.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => setIsNewItemModalOpen(true)}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Insumo</span>
                </button>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar insumo por nombre o SKU..."
                  value={invSearch}
                  onChange={(e) => setInvSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {['all', 'carnes', 'vinos', 'lacteos', 'vegetales', 'licores', 'abarrotes'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setInvCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer shrink-0 ${
                      invCategoryFilter === cat 
                        ? 'bg-amber-500 text-slate-950' 
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat === 'all' ? 'Todos' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory Table Grid */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-4">Insumo / Materia Prima</th>
                      <th className="p-4">Categoría</th>
                      <th className="p-4">Stock Actual</th>
                      <th className="p-4">Punto Reorden (Mín)</th>
                      <th className="p-4">Costo Unitario (COP)</th>
                      <th className="p-4">Valoración</th>
                      <th className="p-4 text-right">Ajuste Rápido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredInventory.map((item) => {
                      const isLow = item.currentStock <= item.minStockAlert;
                      const stockPercentage = Math.min(100, Math.round((item.currentStock / (item.minStockAlert * 3)) * 100));

                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-4">
                            <div className="font-bold text-white text-sm">{item.name}</div>
                            <span className="text-[10px] font-mono text-slate-500">SKU: {item.sku}</span>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 capitalize">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={`font-mono font-bold text-sm ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {item.currentStock} {item.unit}
                              </span>
                              {isLow && (
                                <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-rose-500/30 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  ¡Bajo!
                                </span>
                              )}
                            </div>
                            {/* Stock Bar */}
                            <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                              <div 
                                className={`h-full rounded-full ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.max(10, stockPercentage)}%` }}
                              />
                            </div>
                          </td>
                          <td className="p-4 text-slate-400 font-mono">
                            {item.minStockAlert} {item.unit}
                          </td>
                          <td className="p-4 font-mono font-semibold text-slate-300">
                            {formatCop(item.costPerUnitCop)}
                          </td>
                          <td className="p-4 font-mono font-bold text-amber-400">
                            {formatCop(item.currentStock * item.costPerUnitCop)}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => updateInventoryStock(item.id, item.currentStock - 1)}
                                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition cursor-pointer"
                                title="Descontar 1 unidad"
                              >
                                -
                              </button>
                              <button
                                onClick={() => updateInventoryStock(item.id, item.currentStock + 5)}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] border border-amber-500/30 transition cursor-pointer"
                                title="Añadir 5 unidades de reabastecimiento"
                              >
                                +5 {item.unit}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================== */}
        {/* TAB 3: MÓDULO DE NÓMINA BÁSICA COLOMBIA (POR EMPLOYEE_ID)   */}
        {/* =========================================================== */}
        {activeTab === 'payroll' && (
          <div className="space-y-6">
            
            {/* Payroll Banner & Colombian Labor Law Overview */}
            <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-amber-950/30 border border-blue-500/30 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-xl text-white">Nómina y Liquidación de Personal</h3>
                  <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-bold">
                    Normativa Laboral Colombia 2026
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Cálculo automático de Salario Base, Auxilio de Transporte de Ley ($200.000 COP), Deducción Salud (4%), Pensión (4%) y dispersión de Propinas.
                </p>
              </div>

              <div className="text-right bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Nómina Total a Dispersar:</span>
                <div className="text-xl font-bold font-serif text-emerald-400">
                  {formatCop(tenantPayroll.reduce((s, p) => s + p.netPayableCop, 0))}
                </div>
              </div>
            </div>

            {/* Employee Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {tenantEmployees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => setSelectedPayrollEmployeeId(emp.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer shrink-0 border ${
                    selectedPayrollEmployeeId === emp.id
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <img src={emp.avatar} alt={emp.name} className="w-6 h-6 rounded-full object-cover" />
                  <div className="text-left">
                    <p className="leading-tight">{emp.name}</p>
                    <p className="text-[9px] opacity-80 uppercase">{emp.role}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Payroll Details Card for Selected Employee */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Detailed Payroll Slip & Calculations */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
                {(() => {
                  const currentEmp = tenantEmployees.find(e => e.id === selectedPayrollEmployeeId) || tenantEmployees[0];
                  const payrollRecord = tenantPayroll.find(p => p.employeeId === selectedPayrollEmployeeId) || {
                    id: `pay-${currentEmp?.id}`,
                    restaurantId: currentTenant.id,
                    employeeId: currentEmp?.id || 'emp-101',
                    employeeName: currentEmp?.name || 'Empleado',
                    documentId: currentEmp?.documentId || '1.020.456.789',
                    position: currentEmp?.position || (currentEmp?.role === 'cocina' ? 'Chef de Partida' : 'Mesero Profesional'),
                    periodMonth: 'Agosto 2026',
                    baseSalaryCop: currentEmp?.baseSalaryCop || 1850000,
                    workedDays: 30,
                    overtimeHours: 8,
                    overtimePayCop: 92500,
                    transportAllowanceCop: 200000,
                    healthDeductionCop: 74000,
                    pensionDeductionCop: 74000,
                    tipsShareCop: 450000,
                    netPayableCop: 2354500,
                    paymentStatus: 'pending' as const
                  };

                  return (
                    <>
                      {/* Employee Info Header */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
                        <div className="flex items-center gap-3">
                          <img src={currentEmp?.avatar} alt={currentEmp?.name} className="w-12 h-12 rounded-2xl object-cover border border-amber-500/40" />
                          <div>
                            <h4 className="font-serif font-bold text-lg text-white">{currentEmp?.name}</h4>
                            <p className="text-xs text-slate-400">
                              CC: <span className="font-mono text-slate-300 font-bold">{payrollRecord.documentId}</span> • Cargo: <span className="text-amber-400 font-semibold">{payrollRecord.position}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            payrollRecord.paymentStatus === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {payrollRecord.paymentStatus === 'paid' ? '✅ Liquidación Pagada' : '⏳ Pendiente de Pago'}
                          </span>
                        </div>
                      </div>

                      {/* Itemized Calculation Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        
                        {/* Devengados (Ingresos) */}
                        <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/20 space-y-2.5">
                          <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-1.5">
                            <span>(+) Total Devengado</span>
                            <span className="font-mono font-bold">{formatCop(payrollRecord.baseSalaryCop + payrollRecord.overtimePayCop + payrollRecord.transportAllowanceCop + payrollRecord.tipsShareCop)}</span>
                          </div>

                          <div className="flex justify-between text-slate-300">
                            <span>Salario Básico ({payrollRecord.workedDays} días):</span>
                            <span className="font-mono">{formatCop(payrollRecord.baseSalaryCop)}</span>
                          </div>

                          <div className="flex justify-between text-slate-300">
                            <span>Auxilio de Transporte (Ley):</span>
                            <span className="font-mono">{formatCop(payrollRecord.transportAllowanceCop)}</span>
                          </div>

                          <div className="flex justify-between text-slate-300">
                            <span>Horas Extras ({payrollRecord.overtimeHours} hrs):</span>
                            <span className="font-mono">{formatCop(payrollRecord.overtimePayCop)}</span>
                          </div>

                          <div className="flex justify-between text-purple-400 font-semibold">
                            <span>Participación de Propinas:</span>
                            <span className="font-mono">{formatCop(payrollRecord.tipsShareCop)}</span>
                          </div>
                        </div>

                        {/* Deducciones (Salud, Pensión) */}
                        <div className="bg-slate-950 p-4 rounded-2xl border border-rose-500/20 space-y-2.5">
                          <div className="flex items-center justify-between text-rose-400 font-bold border-b border-slate-800 pb-1.5">
                            <span>(-) Total Deducciones</span>
                            <span className="font-mono font-bold">-{formatCop(payrollRecord.healthDeductionCop + payrollRecord.pensionDeductionCop)}</span>
                          </div>

                          <div className="flex justify-between text-slate-300">
                            <span>Aporte Salud (4% EPS):</span>
                            <span className="font-mono">-{formatCop(payrollRecord.healthDeductionCop)}</span>
                          </div>

                          <div className="flex justify-between text-slate-300">
                            <span>Aporte Pensión (4% AFP):</span>
                            <span className="font-mono">-{formatCop(payrollRecord.pensionDeductionCop)}</span>
                          </div>

                          <div className="flex justify-between text-slate-500 pt-3">
                            <span>Retención en la Fuente:</span>
                            <span className="font-mono">$0 COP</span>
                          </div>
                        </div>

                      </div>

                      {/* Net Payable Banner & Actions */}
                      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-950 to-slate-900 p-4 rounded-2xl border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <span className="text-xs text-slate-400 uppercase font-bold">Neto a Pagar en Cuenta:</span>
                          <div className="text-2xl font-serif font-bold text-emerald-400">
                            {formatCop(payrollRecord.netPayableCop)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setActiveVolanteRecord(payrollRecord);
                              setIsVolanteModalOpen(true);
                            }}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Ver Volante</span>
                          </button>

                          {payrollRecord.paymentStatus === 'pending' && (
                            <button
                              onClick={() => {
                                processPayrollPayment(payrollRecord.id);
                                showToast('Pago Dispersado', `Nómina de ${payrollRecord.employeeName} pagada exitosamente.`, 'success');
                              }}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Pagar Nómina Hoy</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Right Col: Team Payroll List */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-serif font-bold text-base text-white">Nómina del Restaurante</h4>
                  <span className="text-xs text-slate-400">Periodo: Agosto</span>
                </div>

                <div className="space-y-3">
                  {tenantEmployees.map(emp => {
                    const rec = tenantPayroll.find(p => p.employeeId === emp.id);
                    const net = rec ? rec.netPayableCop : 2100000;
                    const isPaid = rec?.paymentStatus === 'paid';

                    return (
                      <div 
                        key={emp.id} 
                        onClick={() => setSelectedPayrollEmployeeId(emp.id)}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                          selectedPayrollEmployeeId === emp.id 
                            ? 'bg-slate-950 border-amber-500/60' 
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <p className="text-xs font-bold text-white">{emp.name}</p>
                            <p className="text-[10px] text-slate-400 capitalize">{emp.role}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-mono font-bold text-emerald-400">{formatCop(net)}</p>
                          <span className={`text-[9px] font-bold ${isPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {isPaid ? 'Pagado' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* ------------------------------------------------------------- */}
      {/* 4. MODAL: NUEVO INSUMO DE INVENTARIO                          */}
      {/* ------------------------------------------------------------- */}
      {isNewItemModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-serif font-bold text-lg text-white">Añadir Insumo a {currentTenant.name}</h3>
              <button onClick={() => setIsNewItemModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInventoryItem} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre del Ingrediente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Lomo Angus Choice, Queso Paipa, etc."
                  value={newItemData.name}
                  onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoría</label>
                  <select
                    value={newItemData.category}
                    onChange={(e) => setNewItemData({ ...newItemData, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="carnes">Carnes & Cortes</option>
                    <option value="vinos">Vinos & Licores</option>
                    <option value="lacteos">Lácteos & Quesos</option>
                    <option value="vegetales">Vegetales & Frutas</option>
                    <option value="abarrotes">Abarrotes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unidad de Medida</label>
                  <select
                    value={newItemData.unit}
                    onChange={(e) => setNewItemData({ ...newItemData, unit: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="g">Gramos (g)</option>
                    <option value="litro">Litros</option>
                    <option value="botella">Botellas</option>
                    <option value="unidad">Unidades</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemData.currentStock}
                    onChange={(e) => setNewItemData({ ...newItemData, currentStock: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Punto Reorden (Mínimo)</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemData.minStockAlert}
                    onChange={(e) => setNewItemData({ ...newItemData, minStockAlert: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Costo Unitario en Pesos (COP)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={newItemData.costPerUnitCop}
                  onChange={(e) => setNewItemData({ ...newItemData, costPerUnitCop: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewItemModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-md cursor-pointer"
                >
                  Guardar Insumo
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. MODAL: VOLANTE DE PAGO DE NÓMINA (IMPRIMIBLE)              */}
      {/* ------------------------------------------------------------- */}
      {isVolanteModalOpen && activeVolanteRecord && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6"
          >
            {/* Header Volante */}
            <div className="border-b border-slate-200 pb-4 flex items-start justify-between">
              <div>
                <h3 className="font-serif font-bold text-xl text-slate-900">{currentTenant.branding?.legalBusinessName || currentTenant.name}</h3>
                <p className="text-xs text-slate-500">NIT: {currentTenant.branding?.nit} • {currentTenant.city}</p>
                <p className="text-xs font-bold text-amber-700 mt-1">VOLANTE DE PAGO DE NÓMINA ELECTRÓNICA</p>
              </div>
              <button onClick={() => setIsVolanteModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Employee info */}
            <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-1 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Colaborador:</span>
                <span className="font-bold text-slate-900">{activeVolanteRecord.employeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cédula de Ciudadanía:</span>
                <span className="font-mono font-bold text-slate-900">{activeVolanteRecord.documentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cargo:</span>
                <span className="font-semibold text-slate-800">{activeVolanteRecord.position}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Periodo Liquidado:</span>
                <span className="font-semibold text-slate-800">{activeVolanteRecord.periodMonth}</span>
              </div>
            </div>

            {/* Concepts Table */}
            <div className="text-xs space-y-2">
              <div className="flex justify-between text-slate-700">
                <span>(+) Salario Básico ({activeVolanteRecord.workedDays} días):</span>
                <span className="font-mono font-semibold">{formatCop(activeVolanteRecord.baseSalaryCop)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>(+) Auxilio de Transporte:</span>
                <span className="font-mono font-semibold">{formatCop(activeVolanteRecord.transportAllowanceCop)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>(+) Horas Extras & Recargos:</span>
                <span className="font-mono font-semibold">{formatCop(activeVolanteRecord.overtimePayCop)}</span>
              </div>
              <div className="flex justify-between text-purple-700 font-semibold">
                <span>(+) Propinas Distribuidas:</span>
                <span className="font-mono">{formatCop(activeVolanteRecord.tipsShareCop)}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>(-) Salud 4%:</span>
                <span className="font-mono">-{formatCop(activeVolanteRecord.healthDeductionCop)}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>(-) Pensión 4%:</span>
                <span className="font-mono">-{formatCop(activeVolanteRecord.pensionDeductionCop)}</span>
              </div>
            </div>

            {/* Total Net */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider">NETO PAGADO EN CUENTA:</span>
              <span className="font-serif font-bold text-lg text-emerald-400">{formatCop(activeVolanteRecord.netPayableCop)}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
              <span>Certificado conforme a normativa UGPP</span>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Recibo</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
