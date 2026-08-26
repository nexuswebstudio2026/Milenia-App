import React, { useState, useMemo } from 'react';
import { useTasty } from '../../context/TastyContext';
import { TenantRestaurant, TenantEmployee, TableStatus, OrderStatus } from '../../types';
import { 
  Building2, 
  Users, 
  ChefHat, 
  ShieldCheck, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Calendar, 
  Utensils, 
  CheckCircle2, 
  AlertCircle, 
  Receipt, 
  Package, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  Share2, 
  Key, 
  Lock, 
  RefreshCw, 
  Sliders, 
  ArrowRight, 
  Search, 
  Plus, 
  Phone, 
  MapPin, 
  Mail, 
  FileText, 
  Sparkles, 
  Layers, 
  Eye, 
  LogOut,
  ChevronDown,
  Store,
  Boxes,
  Percent,
  CreditCard,
  Smartphone,
  CheckCircle,
  Timer,
  AlertTriangle,
  ArrowUpRight,
  Printer,
  ChevronRight,
  Flame,
  Award,
  CircleDot
} from 'lucide-react';
import { formatCop } from '../../utils/currency';
import { useCurrentDomain } from '../../utils/domainHelper';
import { motion, AnimatePresence } from 'motion/react';

export type AllyManagerRoleKey = 
  | 'gerente'
  | 'gerente_general'
  | 'administrador'
  | 'director_operaciones'
  | 'chef_ejecutivo'
  | 'capitan_salon'
  | 'cajero_principal'
  | 'supervisor';

interface RoleConfig {
  key: AllyManagerRoleKey;
  urlSlug: string;
  name: string;
  badge: string;
  icon: React.ElementType;
  gradient: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
  description: string;
  allowedTabs: ('resumen' | 'mesas' | 'cocina' | 'personal' | 'inventario' | 'dian_caja' | 'enlaces')[];
}

const ROLES_DIRECTORY: RoleConfig[] = [
  {
    key: 'gerente_general',
    urlSlug: 'gerente-general',
    name: 'Gerente General',
    badge: 'Dirección Ejecutiva',
    icon: ShieldCheck,
    gradient: 'from-amber-500 to-orange-500',
    textColor: 'text-amber-500 dark:text-amber-400',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-500/10',
    description: 'Control total de operaciones, ingresos, facturación DIAN, métricas del salón y suscripción SaaS.',
    allowedTabs: ['resumen', 'mesas', 'cocina', 'personal', 'inventario', 'dian_caja', 'enlaces']
  },
  {
    key: 'gerente',
    urlSlug: 'gerente',
    name: 'Gerente de Sede',
    badge: 'Gestión Integral',
    icon: Building2,
    gradient: 'from-amber-500 to-amber-600',
    textColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-500/10',
    description: 'Supervisión diaria del restaurante aliado, metas comerciales y sincronización de equipos.',
    allowedTabs: ['resumen', 'mesas', 'cocina', 'personal', 'inventario', 'dian_caja', 'enlaces']
  },
  {
    key: 'administrador',
    urlSlug: 'administrador',
    name: 'Administrador de Operaciones',
    badge: 'Operaciones & Control',
    icon: Sliders,
    gradient: 'from-blue-500 to-indigo-500',
    textColor: 'text-blue-500 dark:text-blue-400',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/10',
    description: 'Gestión de mesas en vivo, inventario, arqueos de caja y supervisión de turnos de personal.',
    allowedTabs: ['resumen', 'mesas', 'cocina', 'personal', 'inventario', 'dian_caja', 'enlaces']
  },
  {
    key: 'director_operaciones',
    urlSlug: 'director-operaciones',
    name: 'Director de Operaciones',
    badge: 'Eficiencia Operativa',
    icon: TrendingUp,
    gradient: 'from-purple-500 to-indigo-600',
    textColor: 'text-purple-500 dark:text-purple-400',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/10',
    description: 'Optimización de tiempos de despacho en cocina, rotación de mesas y desempeño de meseros.',
    allowedTabs: ['resumen', 'mesas', 'cocina', 'personal', 'inventario', 'enlaces']
  },
  {
    key: 'chef_ejecutivo',
    urlSlug: 'chef-ejecutivo',
    name: 'Chef Ejecutivo / Jefe de Cocina',
    badge: 'Líder KDS & Cocina',
    icon: ChefHat,
    gradient: 'from-rose-500 to-orange-500',
    textColor: 'text-rose-500 dark:text-rose-400',
    borderColor: 'border-rose-500/30',
    bgColor: 'bg-rose-500/10',
    description: 'Monitor KDS de comandas en tiempo real, tiempos de cocción, recetas y control de mermas.',
    allowedTabs: ['cocina', 'inventario', 'resumen', 'enlaces']
  },
  {
    key: 'capitan_salon',
    urlSlug: 'capitan-salon',
    name: 'Capitán de Salón / Mesero Líder',
    badge: 'Servicio & Salón',
    icon: Utensils,
    gradient: 'from-emerald-500 to-teal-500',
    textColor: 'text-emerald-500 dark:text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgColor: 'bg-emerald-500/10',
    description: 'Asignación de mesas, control de comandas en mesa, atención a clientes y división de cuentas.',
    allowedTabs: ['mesas', 'personal', 'resumen', 'enlaces']
  },
  {
    key: 'cajero_principal',
    urlSlug: 'cajero-principal',
    name: 'Cajero Principal / Facturación',
    badge: 'Caja & DIAN',
    icon: Receipt,
    gradient: 'from-cyan-500 to-blue-500',
    textColor: 'text-cyan-500 dark:text-cyan-400',
    borderColor: 'border-cyan-500/30',
    bgColor: 'bg-cyan-500/10',
    description: 'Cobro de cuentas, facturación electrónica DIAN, medios de pago (Nequi/Daviplata/PSE) y reporte Z.',
    allowedTabs: ['dian_caja', 'mesas', 'resumen', 'enlaces']
  },
  {
    key: 'supervisor',
    urlSlug: 'supervisor',
    name: 'Supervisor de Turno',
    badge: 'Supervisión de Turno',
    icon: Clock,
    gradient: 'from-amber-600 to-yellow-500',
    textColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-600/30',
    bgColor: 'bg-amber-600/10',
    description: 'Control de asistencia biométrica, reloj de turnos, apertura y cierre de jornada laboral.',
    allowedTabs: ['personal', 'mesas', 'resumen', 'enlaces']
  }
];

export const AllyManagerAccessPanel: React.FC = () => {
  const { 
    currentTenant, 
    tenants, 
    switchTenant,
    selectTenantById,
    tenantTables,
    updateTableStatus,
    orders,
    updateOrderStatus,
    tenantEmployees,
    clockInEmployee,
    clockOutEmployee,
    setEmployeeSalesGoal,
    tenantInventory,
    updateInventoryItem,
    restockInventoryItem,
    currentRoute,
    navigateTo,
    showToast,
    setMode,
    setMileniaView
  } = useTasty();

  const { origin } = useCurrentDomain();

  // Normalize cargo from URL route: /panel/:idaliado/:cargo
  const activeCargoSlug = useMemo(() => {
    const raw = (currentRoute.cargo || 'gerente').toLowerCase().replace(/-/g, '_');
    if (raw === 'gerente_general' || raw === 'director_general') return 'gerente_general';
    if (raw === 'administrador' || raw === 'admin') return 'administrador';
    if (raw === 'director_operaciones' || raw === 'operaciones') return 'director_operaciones';
    if (raw === 'chef_ejecutivo' || raw === 'chef' || raw === 'cocina') return 'chef_ejecutivo';
    if (raw === 'capitan_salon' || raw === 'mesero_lider' || raw === 'mesero') return 'capitan_salon';
    if (raw === 'cajero_principal' || raw === 'cajero' || raw === 'caja') return 'cajero_principal';
    if (raw === 'supervisor' || raw === 'turno') return 'supervisor';
    return 'gerente';
  }, [currentRoute.cargo]);

  const activeRoleConfig: RoleConfig = useMemo(() => {
    return ROLES_DIRECTORY.find(r => r.key === activeCargoSlug) || ROLES_DIRECTORY[1]; // fallback to gerente
  }, [activeCargoSlug]);

  // Active sub-tab within the manager panel
  const [activeTab, setActiveTab] = useState<'resumen' | 'mesas' | 'cocina' | 'personal' | 'inventario' | 'dian_caja' | 'enlaces'>(() => {
    return activeRoleConfig.allowedTabs[0] || 'resumen';
  });

  // Ensure active tab is allowed for current cargo
  React.useEffect(() => {
    if (!activeRoleConfig.allowedTabs.includes(activeTab)) {
      setActiveTab(activeRoleConfig.allowedTabs[0] || 'resumen');
    }
  }, [activeRoleConfig, activeTab]);

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrCargoSelected, setQrCargoSelected] = useState<RoleConfig>(activeRoleConfig);
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [employeeGoalModal, setEmployeeGoalModal] = useState<TenantEmployee | null>(null);
  const [newGoalInput, setNewGoalInput] = useState<string>('');
  const [restockItemModal, setRestockItemModal] = useState<any | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);

  // Direct panel URL
  const currentPanelUrl = `${origin}/panel/${currentTenant.id}/${activeRoleConfig.urlSlug}`;
  const currentPanelRelativePath = `/panel/${currentTenant.id}/${activeRoleConfig.urlSlug}`;

  const handleCopyUrl = (urlToCopy?: string) => {
    const target = urlToCopy || currentPanelUrl;
    navigator.clipboard.writeText(target);
    setCopiedUrl(true);
    showToast('Enlace Copiado', `Ruta de acceso: ${target.replace(origin, '')}`, 'success');
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleShareWhatsApp = (roleSlug?: string) => {
    const targetSlug = roleSlug || activeRoleConfig.urlSlug;
    const url = `${origin}/panel/${currentTenant.id}/${targetSlug}`;
    const text = `Hola! Aquí tienes el acceso directo al Panel de ${activeRoleConfig.name} para ${currentTenant.name}: ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSwitchCargo = (newCargo: AllyManagerRoleKey) => {
    const cfg = ROLES_DIRECTORY.find(r => r.key === newCargo) || ROLES_DIRECTORY[0];
    navigateTo({
      restaurantId: currentTenant.id,
      cargo: cfg.urlSlug,
      routeType: 'ally_panel'
    });
    showToast('Cargo Actualizado', `Sesión activa como: ${cfg.name}`, 'info');
  };

  const handleSwitchTenant = (newTenantId: string) => {
    navigateTo({
      restaurantId: newTenantId,
      cargo: activeRoleConfig.urlSlug,
      routeType: 'ally_panel'
    });
    showToast('Negocio Aliado Cambiado', `Ahora administrando: ${tenants.find(t => t.id === newTenantId)?.name || newTenantId}`, 'info');
  };

  // Orders for current tenant
  const tenantOrders = useMemo(() => {
    return orders.filter(o => !o.restaurantId || o.restaurantId === currentTenant.id);
  }, [orders, currentTenant.id]);

  const activeKitchenOrders = useMemo(() => {
    return tenantOrders.filter(o => o.status === 'received' || o.status === 'confirmed' || o.status === 'preparing');
  }, [tenantOrders]);

  // Financial & Operational Metrics
  const metrics = useMemo(() => {
    const todaySales = tenantOrders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);
    
    const monthlySales = currentTenant.totalMonthlySalesCop || (todaySales * 18);
    const monthlyGoal = 40000000; // 40M COP
    const progressPercent = Math.min(100, Math.round((monthlySales / monthlyGoal) * 100));

    const totalTables = tenantTables.length || 8;
    const occupiedTables = tenantTables.filter(t => t.status === 'occupied' || t.status === 'billing').length;
    const occupancyRate = Math.round((occupiedTables / totalTables) * 100);

    const activeStaff = tenantEmployees.filter(e => e.shiftStatus === 'active').length;

    const lowStockCount = tenantInventory.filter(i => i.currentStock <= i.minStockAlert).length;

    return {
      todaySales,
      monthlySales,
      monthlyGoal,
      progressPercent,
      totalTables,
      occupiedTables,
      occupancyRate,
      activeStaff,
      lowStockCount
    };
  }, [tenantOrders, currentTenant, tenantTables, tenantEmployees, tenantInventory]);

  // Zones for tables
  const zones = useMemo(() => {
    const list = Array.from(new Set(tenantTables.map(t => t.zone || 'Salón Principal')));
    return ['all', ...list];
  }, [tenantTables]);

  const filteredTables = useMemo(() => {
    if (selectedZone === 'all') return tenantTables;
    return tenantTables.filter(t => (t.zone || 'Salón Principal') === selectedZone);
  }, [tenantTables, selectedZone]);

  const RoleIcon = activeRoleConfig.icon;

  return (
    <div className="space-y-6 pb-12 antialiased">

      {/* ========================================================================= */}
      {/* 1. TOP HEADER & EXECUTIVE IDENTITY BAR                                   */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Glow effect */}
        <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl ${activeRoleConfig.gradient} opacity-15 blur-3xl pointer-events-none rounded-full`} />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Ally Restaurant & Role Identification */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative">
              <img 
                src={currentTenant.branding?.logoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80'} 
                alt={currentTenant.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500/40 shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-slate-950 border border-slate-700 shadow-md">
                <RoleIcon className={`w-4 h-4 ${activeRoleConfig.textColor}`} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-black uppercase tracking-wider rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Aliado #{currentTenant.id}
                </span>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${activeRoleConfig.bgColor} ${activeRoleConfig.textColor} border ${activeRoleConfig.borderColor} flex items-center gap-1`}>
                  <RoleIcon className="w-3 h-3" />
                  <span>{activeRoleConfig.badge}</span>
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CircleDot className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                  <span>SaaS {currentTenant.subscription?.plan?.toUpperCase() || 'PRO'}</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                <span>{currentTenant.name}</span>
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{currentTenant.city}</span>
                </span>
                <span>•</span>
                <span className="font-mono text-slate-300">NIT: {currentTenant.branding?.nit || '901.884.231-9'}</span>
                <span>•</span>
                <span className="text-amber-400/90 font-medium">Cargo: <strong className="text-white">{activeRoleConfig.name}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Selectors & Access Route */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            
            {/* Cargo Switcher Dropdown */}
            <div className="relative">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Cambiar Cargo Activo:
              </label>
              <select
                value={activeRoleConfig.key}
                onChange={(e) => handleSwitchCargo(e.target.value as AllyManagerRoleKey)}
                className="w-full sm:w-56 px-3 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                {ROLES_DIRECTORY.map(role => (
                  <option key={role.key} value={role.key}>
                    {role.name} ({role.badge})
                  </option>
                ))}
              </select>
            </div>

            {/* Ally Switcher Dropdown (for Multi-Branch Owners) */}
            <div className="relative">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Cambiar Negocio Aliado:
              </label>
              <select
                value={currentTenant.id}
                onChange={(e) => handleSwitchTenant(e.target.value)}
                className="w-full sm:w-56 px-3 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-amber-300 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>
                    Aliado #{t.id} - {t.name}
                  </option>
                ))}
              </select>
            </div>

          </div>

        </div>

        {/* ===================================================================== */}
        {/* URL DISPLAY & ONE-CLICK SHARING BAR                                   */}
        {/* ===================================================================== */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
          
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <Key className="w-4 h-4" />
            </span>
            <div className="truncate">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Ruta Directa de Acceso Gerencial:
              </div>
              <div className="font-mono text-xs sm:text-sm font-bold text-amber-300 truncate">
                {currentPanelRelativePath}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleCopyUrl()}
              title="Copiar URL completa"
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar URL</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleShareWhatsApp()}
              title="Compartir por WhatsApp"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={() => {
                setQrCargoSelected(activeRoleConfig);
                setIsQrModalOpen(true);
              }}
              title="Ver Código QR"
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Código QR</span>
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. NAVIGATION TABS (CUSTOMIZED PER ACTIVE CARGO)                          */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        
        {activeRoleConfig.allowedTabs.includes('resumen') && (
          <button
            onClick={() => setActiveTab('resumen')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'resumen'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Resumen Ejecutivo</span>
          </button>
        )}

        {activeRoleConfig.allowedTabs.includes('mesas') && (
          <button
            onClick={() => setActiveTab('mesas')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'mesas'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Salón & Mesas</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-900/20 dark:bg-slate-100/20 font-mono">
              {metrics.occupiedTables}/{metrics.totalTables}
            </span>
          </button>
        )}

        {activeRoleConfig.allowedTabs.includes('cocina') && (
          <button
            onClick={() => setActiveTab('cocina')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'cocina'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>KDS Cocina & Comandas</span>
            {activeKitchenOrders.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-rose-500 text-white font-mono font-bold animate-pulse">
                {activeKitchenOrders.length}
              </span>
            )}
          </button>
        )}

        {activeRoleConfig.allowedTabs.includes('personal') && (
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'personal'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Personal & Turnos</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono">
              {metrics.activeStaff} activos
            </span>
          </button>
        )}

        {activeRoleConfig.allowedTabs.includes('inventario') && (
          <button
            onClick={() => setActiveTab('inventario')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'inventario'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Inventario & Insumos</span>
            {metrics.lowStockCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500 text-slate-950 font-bold">
                {metrics.lowStockCount} alertas
              </span>
            )}
          </button>
        )}

        {activeRoleConfig.allowedTabs.includes('dian_caja') && (
          <button
            onClick={() => setActiveTab('dian_caja')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'dian_caja'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Facturación DIAN & Caja</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('enlaces')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'enlaces'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Enlaces por Cargo & QR</span>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* 3. TAB CONTENT MODULES                                                    */}
      {/* ========================================================================= */}

      {/* ------------------------------------------------------------------------- */}
      {/* TAB: 1. RESUMEN EJECUTIVO (Executive KPI Dashboard)                      */}
      {/* ------------------------------------------------------------------------- */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Ventas Hoy */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">
                <span>Ventas Jornada</span>
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {formatCop(metrics.todaySales || 1850000)}
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{tenantOrders.length} comandas generadas hoy</span>
              </div>
            </div>

            {/* Ocupación de Salón */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">
                <span>Ocupación de Salón</span>
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Utensils className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {metrics.occupancyRate}%
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {metrics.occupiedTables} de {metrics.totalTables} mesas ocupadas
              </div>
            </div>

            {/* KDS Cocina en Tiempo Real */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">
                <span>Comandas en Cocina</span>
                <span className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                  <ChefHat className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {activeKitchenOrders.length}
              </div>
              <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                Tiempo prom. despacho: 14 mins
              </div>
            </div>

            {/* Personal en Turno */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">
                <span>Equipo en Turno</span>
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {metrics.activeStaff} Colaboradores
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {tenantEmployees.length} registrados en la sede
              </div>
            </div>

          </div>

          {/* Monthly Sales Goal & Direct Access Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Meta Mensual de Ventas */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Meta de Ventas del Mes
                  </h3>
                  <p className="text-xs text-slate-500">
                    Acumulado de facturación de {currentTenant.name}
                  </p>
                </div>
                <div className="text-right font-mono">
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    {formatCop(metrics.monthlySales)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Meta: {formatCop(metrics.monthlyGoal)}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${metrics.progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                  <span>{metrics.progressPercent}% alcanzado</span>
                  <span>Faltan {formatCop(Math.max(0, metrics.monthlyGoal - metrics.monthlySales))}</span>
                </div>
              </div>

              {/* Quick Action Buttons per Role */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Acciones Rápidas para {activeRoleConfig.name}:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => setActiveTab('mesas')}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-500/10 border border-slate-200 dark:border-slate-700 text-left transition cursor-pointer"
                  >
                    <Utensils className="w-4 h-4 text-amber-500 mb-1" />
                    <div className="font-bold text-xs text-slate-900 dark:text-white">Plano de Mesas</div>
                    <div className="text-[10px] text-slate-500">Liberar / Ocupar</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('cocina')}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-500/10 border border-slate-200 dark:border-slate-700 text-left transition cursor-pointer"
                  >
                    <ChefHat className="w-4 h-4 text-rose-500 mb-1" />
                    <div className="font-bold text-xs text-slate-900 dark:text-white">KDS Pantalla</div>
                    <div className="text-[10px] text-slate-500">Despachar pedidos</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('dian_caja')}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-500/10 border border-slate-200 dark:border-slate-700 text-left transition cursor-pointer"
                  >
                    <Receipt className="w-4 h-4 text-cyan-500 mb-1" />
                    <div className="font-bold text-xs text-slate-900 dark:text-white">Arqueo de Caja</div>
                    <div className="text-[10px] text-slate-500">Reporte Z del día</div>
                  </button>
                </div>
              </div>

            </div>

            {/* Datos Fiscales & Suscripción SaaS */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <span>Perfil Fiscal & SaaS</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Razón Social</span>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {currentTenant.branding?.legalBusinessName || currentTenant.name}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">NIT DIAN</span>
                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                      {currentTenant.branding?.nit}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Impoconsumo</span>
                    <div className="font-bold text-amber-600 dark:text-amber-400">
                      8% Colombia
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">
                      Suscripción Milenia
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500 text-slate-950">
                      ACTIVA
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Plan {currentTenant.subscription?.plan?.toUpperCase()} • {formatCop(currentTenant.subscription?.mrrCop || 289000)}/mes
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Renovación: {currentTenant.subscription?.renewsAt || '2026-09-01'}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      selectTenantById(currentTenant.id);
                      setMode('restaurant');
                    }}
                    className="w-full py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>Ver Carta Digital del Aliado</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* TAB: 2. SALÓN & MESAS EN VIVO (Live Floor Management)                     */}
      {/* ------------------------------------------------------------------------- */}
      {activeTab === 'mesas' && (
        <div className="space-y-5">
          
          {/* Header & Filter by Zone */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-500" />
                <span>Control de Salón & Mesas en Tiempo Real</span>
              </h3>
              <p className="text-xs text-slate-500">
                Cambia el estado de ocupación, libera mesas o marca cuentas en facturación
              </p>
            </div>

            {/* Zone Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {zones.map(z => (
                <button
                  key={z}
                  onClick={() => setSelectedZone(z)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedZone === z
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {z === 'all' ? 'Todas las Zonas' : z}
                </button>
              ))}
            </div>
          </div>

          {/* Tables Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {filteredTables.map(tbl => {
              const isOccupied = tbl.status === 'occupied';
              const isBilling = tbl.status === 'billing';
              const isCleaning = tbl.status === 'cleaning';
              const isAvailable = tbl.status === 'available' || !tbl.status;

              return (
                <div
                  key={tbl.id}
                  className={`p-4 rounded-3xl border transition-all flex flex-col justify-between space-y-3 ${
                    isOccupied
                      ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/40'
                      : isBilling
                      ? 'bg-cyan-500/10 dark:bg-cyan-500/15 border-cyan-500/40'
                      : isCleaning
                      ? 'bg-purple-500/10 dark:bg-purple-500/15 border-purple-500/40'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                      {tbl.number || tbl.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{tbl.capacity}p</span>
                    </span>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                      {tbl.zone || 'Salón Principal'}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider mt-1">
                      {isOccupied && <span className="text-amber-600 dark:text-amber-400">● Ocupada</span>}
                      {isBilling && <span className="text-cyan-600 dark:text-cyan-400">● Facturando</span>}
                      {isCleaning && <span className="text-purple-600 dark:text-purple-400">● Limpieza</span>}
                      {isAvailable && <span className="text-emerald-600 dark:text-emerald-400">● Libre</span>}
                    </div>
                  </div>

                  {/* Actions to toggle status */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex flex-col gap-1">
                    {isAvailable ? (
                      <button
                        onClick={() => {
                          updateTableStatus(tbl.id, 'occupied');
                          showToast('Mesa Ocupada', `Mesa ${tbl.number} marcada en servicio activo.`, 'info');
                        }}
                        className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded-lg transition cursor-pointer"
                      >
                        Ocupar Mesa
                      </button>
                    ) : isOccupied ? (
                      <button
                        onClick={() => {
                          updateTableStatus(tbl.id, 'billing');
                          showToast('Mesa en Cobro', `Mesa ${tbl.number} pidiendo la cuenta.`, 'info');
                        }}
                        className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] rounded-lg transition cursor-pointer"
                      >
                        Pedir Cuenta
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          updateTableStatus(tbl.id, 'available');
                          showToast('Mesa Liberada', `Mesa ${tbl.number} disponible para nuevos clientes.`, 'success');
                        }}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg transition cursor-pointer"
                      >
                        Liberar Mesa
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* TAB: 3. KDS COCINA & COMANDAS (Kitchen Display)                           */}
      {/* ------------------------------------------------------------------------- */}
      {activeTab === 'cocina' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-rose-500" />
                <span>KDS Cocina & Monitor de Comandas Activas</span>
              </h3>
              <p className="text-xs text-slate-500">
                Control de preparación de platos en tiempo real y tiempos de despacho
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/20">
                {activeKitchenOrders.length} Comandas en Cola
              </span>
            </div>
          </div>

          {/* Orders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tenantOrders.slice(0, 6).map(order => {
              const isReceived = order.status === 'received';
              const isPreparing = order.status === 'preparing' || order.status === 'confirmed';
              const isReady = order.status === 'ready';

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <div className="font-mono font-black text-base text-slate-900 dark:text-white">
                        #{order.orderNumber || order.id.slice(-4)}
                      </div>
                      <div className="text-xs text-slate-400 font-semibold">
                        Mesa {order.tableNumber || '01'} • {order.customer?.name || 'Cliente Salón'}
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                      isReceived ? 'bg-blue-500/15 text-blue-500' :
                      isPreparing ? 'bg-amber-500/15 text-amber-500 animate-pulse' :
                      isReady ? 'bg-emerald-500/15 text-emerald-500' :
                      'bg-slate-500/15 text-slate-500'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2 text-xs">
                    {order.items?.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-amber-500">
                            {it.quantity}x
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {it.menuItem?.name || 'Plato Carta'}
                          </span>
                        </div>
                        <span className="font-mono text-slate-500">
                          {formatCop((it.totalPrice || it.menuItem?.price || 0) * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons to Advance Order */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    {isReceived && (
                      <button
                        onClick={() => {
                          updateOrderStatus(order.id, 'preparing');
                          showToast('En Preparación', `Comanda #${order.orderNumber} pasó a fogones.`, 'info');
                        }}
                        className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Iniciar Preparación
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => {
                          updateOrderStatus(order.id, 'ready');
                          showToast('Plato Listo', `Comanda #${order.orderNumber} lista para servir en mesa.`, 'success');
                        }}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Marcar Listo para Servir
                      </button>
                    )}

                    {isReady && (
                      <button
                        onClick={() => {
                          updateOrderStatus(order.id, 'delivered');
                          showToast('Comanda Entregada', `Servido en mesa con éxito.`, 'success');
                        }}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Completar & Entregar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* TAB: 4. PERSONAL & TURNOS (Staff & Shift Management)                      */}
      {/* ------------------------------------------------------------------------- */}
      {activeTab === 'personal' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span>Gestión de Personal & Control de Turnos</span>
              </h3>
              <p className="text-xs text-slate-500">
                Equipo de trabajo asignado a {currentTenant.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-500 text-xs font-bold">
                {tenantEmployees.length} Empleados en nómina
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tenantEmployees.map(emp => {
              const isActive = emp.shiftStatus === 'active';

              return (
                <div
                  key={emp.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                >
                  <div className="flex items-center gap-3.5">
                    <img 
                      src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} 
                      alt={emp.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div className="space-y-0.5">
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{emp.name}</span>
                        {isActive && <CircleDot className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />}
                      </div>
                      <div className="text-xs text-slate-400 capitalize">
                        {emp.position || emp.role} • ID: {emp.id}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium">Estado Turno</span>
                      <div className="font-bold capitalize">
                        {isActive ? (
                          <span className="text-emerald-500">En Turno Activo</span>
                        ) : (
                          <span className="text-slate-400">Fuera de Turno</span>
                        )}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium">Propinas Acum.</span>
                      <div className="font-mono font-bold text-amber-500">
                        {formatCop(emp.accumulatedTipsCop || 65000)}
                      </div>
                    </div>
                  </div>

                  {/* Clock in / Clock out buttons */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    {isActive ? (
                      <button
                        onClick={() => clockOutEmployee(emp.id)}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Registrar Salida (Clock-Out)
                      </button>
                    ) : (
                      <button
                        onClick={() => clockInEmployee(emp.id)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Registrar Entrada (Clock-In)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* TAB: 5. INVENTARIO & INSUMOS (Stock & Low Stock Alert)                    */}
      {/* ------------------------------------------------------------------------- */}
      {activeTab === 'inventario' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-500" />
                <span>Control de Inventario & Alertas de Stock</span>
              </h3>
              <p className="text-xs text-slate-500">
                Insumos clave y materias primas del restaurante aliado
              </p>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Total Insumos: <strong>{tenantInventory.length}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tenantInventory.map(item => {
              const isLow = item.currentStock <= item.minStockAlert;

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-3xl border shadow-xs space-y-3 ${
                    isLow 
                      ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/40' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {item.name}
                    </div>
                    {isLow && (
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-amber-500 text-slate-950 flex items-center gap-1 shrink-0">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>Bajo</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium">Stock Actual</span>
                      <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        {item.currentStock} {item.unit}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium">Alerta Mínima</span>
                      <div className="font-mono text-slate-500">
                        {item.minStockAlert} {item.unit}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        restockInventoryItem(item.id, 5);
                      }}
                      className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      +5 {item.unit}
                    </button>
                    <button
                      onClick={() => {
                        restockInventoryItem(item.id, 10);
                      }}
                      className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      +10 {item.unit}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* TAB: 6. FACTURACIÓN DIAN & CAJA (Fiscal POS & Arqueo)                     */}
      {/* ------------------------------------------------------------------------- */}
      {activeTab === 'dian_caja' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-cyan-500" />
                  <span>Facturación Electrónica DIAN & Arqueo de Caja</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Resolución legal vigente: {currentTenant.branding?.dianResolution || 'Resolución DIAN No. 18764032910 de 2025'}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                DIAN Habilitada
              </span>
            </div>

            {/* Tax breakdown summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Facturado Hoy</span>
                <div className="text-xl font-mono font-black text-slate-900 dark:text-white">
                  {formatCop(metrics.todaySales || 1850000)}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Impoconsumo (8%)</span>
                <div className="text-xl font-mono font-black text-amber-600 dark:text-amber-400">
                  {formatCop(Math.round((metrics.todaySales || 1850000) * 0.08))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Propina Voluntaria (10%)</span>
                <div className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                  {formatCop(Math.round((metrics.todaySales || 1850000) * 0.10))}
                </div>
              </div>
            </div>

            {/* Action to download Reporte Z */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  showToast('Reporte Z Generado', 'Descarga completada y archivada.', 'success');
                }}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer shadow-md shadow-amber-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>Generar & Imprimir Reporte Z Diario</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* TAB: 7. DIRECTORIO DE ENLACES POR CARGO & QR MATRIX                      */}
      {/* ------------------------------------------------------------------------- */}
      {activeTab === 'enlaces' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-500" />
              <span>Matriz de Enlaces de Acceso Directo por Cargo</span>
            </h3>
            <p className="text-xs text-slate-500">
              Comparte estos enlaces con el equipo de <strong>{currentTenant.name}</strong> para que cada colaborador ingrese a su vista gerencial personalizada bajo la ruta oficial <code>/panel/{currentTenant.id}/[cargo]</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ROLES_DIRECTORY.map(role => {
              const roleUrl = `${origin}/panel/${currentTenant.id}/${role.urlSlug}`;
              const rolePath = `/panel/${currentTenant.id}/${role.urlSlug}`;
              const isCurrent = role.key === activeRoleConfig.key;
              const IconComp = role.icon;

              return (
                <div
                  key={role.key}
                  className={`p-5 rounded-3xl border transition-all space-y-3.5 ${
                    isCurrent
                      ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/50 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`p-2 rounded-xl ${role.bgColor} ${role.textColor}`}>
                        <IconComp className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{role.name}</span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-500 text-slate-950">
                              ACTIVO AHORA
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {role.badge}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {role.description}
                  </p>

                  {/* URL Path Container */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-300 truncate">
                      {rolePath}
                    </span>
                    <button
                      onClick={() => handleCopyUrl(roleUrl)}
                      className="p-1.5 text-slate-400 hover:text-amber-500 transition cursor-pointer shrink-0"
                      title="Copiar URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    {!isCurrent && (
                      <button
                        onClick={() => handleSwitchCargo(role.key)}
                        className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>Entrar como {role.name.split('/')[0]}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setQrCargoSelected(role);
                        setIsQrModalOpen(true);
                      }}
                      className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition cursor-pointer"
                      title="Ver Código QR"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleShareWhatsApp(role.urlSlug)}
                      className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition cursor-pointer"
                      title="Compartir por WhatsApp"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: QR CODE GENERATOR                                               */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isQrModalOpen && qrCargoSelected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="text-left">
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    Acceso QR • {qrCargoSelected.name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {currentTenant.name}
                  </p>
                </div>
                <button
                  onClick={() => setIsQrModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* QR Image Simulation / Rendering */}
              <div className="p-5 bg-white rounded-2xl border-2 border-amber-500/40 inline-block shadow-md">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${origin}/panel/${currentTenant.id}/${qrCargoSelected.urlSlug}`)}&color=0f172a`} 
                  alt={`QR ${qrCargoSelected.name}`}
                  className="w-44 h-44 mx-auto rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <div className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 truncate">
                  /panel/{currentTenant.id}/{qrCargoSelected.urlSlug}
                </div>
                <p className="text-xs text-slate-500">
                  Escanea con la cámara de tu móvil para ingresar instantáneamente al panel gerencial.
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => handleCopyUrl(`${origin}/panel/${currentTenant.id}/${qrCargoSelected.urlSlug}`)}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Copiar Enlace
                </button>
                <button
                  onClick={() => setIsQrModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
