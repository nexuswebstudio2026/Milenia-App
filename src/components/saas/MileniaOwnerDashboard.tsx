import React, { useState, useEffect } from 'react';
import { useTasty } from '../../context/TastyContext';
import { 
  Building2, 
  TrendingUp, 
  Users, 
  DollarSign, 
  CreditCard, 
  ShieldCheck, 
  Plus, 
  Store, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  MapPin, 
  Layers, 
  Database, 
  Search,
  RefreshCw,
  Download,
  Server,
  Cloud,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Activity,
  Award,
  Crown,
  Flame,
  ArrowUpRight,
  Phone,
  Mail,
  Zap,
  Filter,
  Check,
  X,
  UserCheck,
  Cpu,
  Lock,
  ChevronRight,
  Globe,
  HardDrive
} from 'lucide-react';
import { TenantRestaurant, SubscriptionPlan } from '../../types';
import { getAllyUsers, AllyUser } from '../../services/tenantUsersService';
import { formatCop } from '../../utils/currency';

export const MileniaOwnerDashboard: React.FC = () => {
  const { 
    tenants, 
    switchTenant, 
    navigateTo, 
    addTenant,
    setMileniaView,
    showToast 
  } = useTasty();

  const [activeTab, setActiveTab] = useState<'resumen' | 'aliados' | 'facturacion' | 'usuarios' | 'infraestructura' | 'configuracion'>('resumen');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [isNewTenantModalOpen, setIsNewTenantModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<AllyUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // New Tenant Form State
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const [newTenantCity, setNewTenantCity] = useState('Bogotá D.C.');
  const [newTenantAddress, setNewTenantAddress] = useState('');
  const [newTenantNit, setNewTenantNit] = useState('');
  const [newTenantPhone, setNewTenantPhone] = useState('+57 300 000 0000');
  const [newTenantEmail, setNewTenantEmail] = useState('');
  const [newTenantPlan, setNewTenantPlan] = useState<SubscriptionPlan>('pro');
  const [newTenantColor, setNewTenantColor] = useState('#f59e0b');

  // Load all users from all allies
  const loadAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const usersAccumulator: AllyUser[] = [];
      for (const tenant of tenants) {
        const allyUsers = await getAllyUsers(tenant.id);
        usersAccumulator.push(...allyUsers);
      }
      setAllUsers(usersAccumulator);
    } catch (e) {
      console.warn('Error loading global users:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadAllUsers();
  }, [tenants.length]);

  // Platform Metrics
  const totalTenants = tenants.length;
  const totalMrrCop = tenants.reduce((acc, t) => acc + (t.subscription?.mrrCop || (t.subscription?.plan === 'basic' ? 149000 : t.subscription?.plan === 'pro' ? 289000 : 499000)), 0);
  const totalArrCop = totalMrrCop * 12;
  const totalTables = tenants.reduce((acc, t) => acc + (t.tablesCount || 15), 0);
  const totalMonthlySales = tenants.reduce((acc, t) => acc + (t.totalMonthlySalesCop || 48500000), 0);

  // Plan Distribution
  const basicCount = tenants.filter(t => t.subscription?.plan === 'basic').length;
  const proCount = tenants.filter(t => t.subscription?.plan === 'pro').length;
  const enterpriseCount = tenants.filter(t => t.subscription?.plan === 'enterprise').length;

  // Filtered Allies
  const filteredTenants = tenants.filter(t => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.branding?.nit && t.branding.nit.includes(searchTerm));
    
    const matchesCity = selectedCity === 'all' || t.city.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesPlan = selectedPlan === 'all' || t.subscription?.plan === selectedPlan;

    return matchesSearch && matchesCity && matchesPlan;
  });

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName || !newTenantSlug) {
      showToast('Campos requeridos', 'Ingresa el nombre y el slug del restaurante.', 'warning');
      return;
    }

    const nextId = (tenants.length + 1).toString();
    const planMrr = newTenantPlan === 'basic' ? 149000 : newTenantPlan === 'pro' ? 289000 : 499000;

    const createdTenant: TenantRestaurant = {
      id: nextId,
      slug: newTenantSlug.toLowerCase().replace(/\s+/g, '-'),
      name: newTenantName,
      city: newTenantCity,
      address: newTenantAddress || 'Calle Principal #10-20',
      phone: newTenantPhone || '+57 300 000 0000',
      email: newTenantEmail || `contacto@${newTenantSlug}.co`,
      createdAt: new Date().toISOString().split('T')[0],
      tablesCount: newTenantPlan === 'basic' ? 10 : newTenantPlan === 'pro' ? 20 : 50,
      activeOrdersCount: 0,
      totalMonthlySalesCop: 15000000,
      branding: {
        logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80',
        primaryColor: newTenantColor,
        accentColor: '#f59e0b',
        themeStyle: 'modern',
        bannerImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        tagline: 'Experiencia gastronómica de autor',
        currency: 'COP',
        currencySymbol: '$',
        dianResolution: 'Resolución DIAN No. 1876400000 de 2026',
        nit: newTenantNit || '901.999.888-0',
        tipSuggestedPercentage: 10
      },
      subscription: {
        plan: newTenantPlan,
        status: 'active',
        mrrCop: planMrr,
        renewsAt: '2026-09-30',
        maxTables: newTenantPlan === 'basic' ? 12 : newTenantPlan === 'pro' ? 25 : 60,
        maxEmployees: newTenantPlan === 'basic' ? 5 : newTenantPlan === 'pro' ? 12 : 30,
        features: ['POS Meseros', 'KDS Cocina', 'Facturación Electrónica DIAN', 'Menú QR']
      }
    };

    addTenant(createdTenant);
    setIsNewTenantModalOpen(false);
    showToast('Restaurante aprovisionado', `El tenant "${newTenantName}" ha sido creado con ID: ${nextId}.`, 'success');
    
    // Reset form
    setNewTenantName('');
    setNewTenantSlug('');
    setNewTenantAddress('');
    setNewTenantNit('');
    setNewTenantEmail('');
  };

  const exportAlliesToCsv = () => {
    const headers = ['ID', 'Nombre', 'Slug', 'Ciudad', 'NIT', 'Plan', 'MRR_COP', 'Mesas', 'Telefono', 'Email'];
    const rows = tenants.map(t => [
      t.id,
      `"${t.name}"`,
      t.slug,
      `"${t.city}"`,
      t.branding?.nit || 'N/A',
      t.subscription?.plan || 'pro',
      t.subscription?.mrrCop || 289000,
      t.tablesCount || 0,
      t.phone,
      t.email
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `milenia_aliados_reporte_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Reporte Descargado', 'Archivo CSV con todos los aliados generado.', 'info');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      
      {/* 1. Header Banner SuperAdmin Milenia */}
      <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-96 h-96 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 rounded-full font-mono text-xs font-black flex items-center gap-1.5 shadow-xs">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                DASHBOARD PROPIETARIO MILENIA
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-mono text-[11px] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Plataforma Activa &bull; Multi-Tenant Colombia
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Control Maestro de Plataforma SaaS</span>
              <Flame className="w-7 h-7 text-amber-500 shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Supervisión en tiempo real de todos los restaurantes aliados, ingresos recurrentes (MRR), facturación DIAN, base de datos Firestore y aprovisionamiento instantáneo de tenants.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={exportAlliesToCsv}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer"
              title="Exportar base de datos a Excel/CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={() => setIsNewTenantModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-amber-500/25 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>Aprovisionar Nuevo Aliado</span>
            </button>
          </div>
        </div>

        {/* Quick Platform Indicators */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[11px]">ADMINISTRADOR PLATAFORMA</span>
            <span className="text-white font-bold">Propietario / Fundador Milenia</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">SISTEMA DE BASE DE DATOS</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Database className="w-3 h-3" />
              Cloud Firestore Multi-Tenant
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">COBERTURA NACIONAL</span>
            <span className="text-amber-400 font-bold">7 Ciudades de Colombia</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">LÍNEA COMERCIAL WHATSAPP</span>
            <span className="text-teal-400 font-bold">+57 304-347-0984</span>
          </div>
        </div>
      </div>

      {/* 2. Top Executive Metrics (Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* MRR Card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              MRR Ingreso Recurrente
            </span>
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
              {formatCop(totalMrrCop)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 font-sans">
              <span className="text-emerald-400 font-bold flex items-center">
                <TrendingUp className="w-3.5 h-3.5 inline mr-0.5" /> +24.8%
              </span>
              <span>vs mes anterior</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex justify-between">
            <span>ARR Proyectado:</span>
            <span className="text-slate-300 font-bold">{formatCop(totalArrCop)}/año</span>
          </div>
        </div>

        {/* Active Allies Card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-lg relative overflow-hidden group hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Restaurantes Aliados
            </span>
            <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-2xl">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
              <span>{totalTenants}</span>
              <span className="text-xs font-bold text-purple-400 font-sans">Tenants Activos</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-sans">
              {basicCount} Básico &bull; {proCount} Pro &bull; {enterpriseCount} Enterprise
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex justify-between">
            <span>Tasa de Retención:</span>
            <span className="text-emerald-400 font-bold">100% (0% Churn)</span>
          </div>
        </div>

        {/* Mesas Conectadas */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Mesas & Puntos POS
            </span>
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
              <span>{totalTables}</span>
              <span className="text-xs font-bold text-emerald-400 font-sans">Mesas Salón</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-sans">
              Comandas en vivo con KDS Cocina
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex justify-between">
            <span>Dispositivos Móviles:</span>
            <span className="text-slate-300 font-bold">Sincronización PWA</span>
          </div>
        </div>

        {/* Total GMV (Gross Merchandise Value) */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Volumen Facturado Red
            </span>
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-2xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-400 tracking-tight">
              {formatCop(totalMonthlySales)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-sans">
              Procesado por todos los restaurantes
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex justify-between">
            <span>Facturación DIAN:</span>
            <span className="text-emerald-400 font-bold">Habilitada 100%</span>
          </div>
        </div>

      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 no-scrollbar">
        <button
          onClick={() => setActiveTab('resumen')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
            activeTab === 'resumen'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Resumen Ejecutivo</span>
        </button>

        <button
          onClick={() => setActiveTab('aliados')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
            activeTab === 'aliados'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Red de Aliados ({tenants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('facturacion')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
            activeTab === 'facturacion'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Planes & Facturación SaaS</span>
        </button>

        <button
          onClick={() => { setActiveTab('usuarios'); loadAllUsers(); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
            activeTab === 'usuarios'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Directorio Usuarios Firestore ({allUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('infraestructura')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
            activeTab === 'infraestructura'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Servicios Cloud & Salud</span>
        </button>

        <button
          onClick={() => setActiveTab('configuracion')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
            activeTab === 'configuracion'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Configuración Plataforma</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: RESUMEN EJECUTIVO & PANEL MAESTRO                            */}
      {/* =================================================================== */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          
          {/* Quick Actions Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Accesos Directos a Restaurantes de la Franquicia</span>
            </h3>
            <p className="text-xs text-slate-400">
              Como Propietario de Milenia, puedes ingresar directamente con 1 clic al panel de cualquier restaurante en modo Administrador o Empleado POS:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tenants.map((t) => (
                <div key={t.id} className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl space-y-3 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 font-mono font-black text-xs flex items-center justify-center">
                        #{t.id}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-white">{t.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{t.city}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300">
                      {t.subscription?.plan || 'pro'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        switchTenant(t.id);
                        navigateTo({ restaurantId: t.id, routeType: 'tenant_admin' });
                      }}
                      className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 border border-amber-500/20 cursor-pointer"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Admin Dueño</span>
                    </button>

                    <button
                      onClick={() => {
                        switchTenant(t.id);
                        navigateTo({ restaurantId: t.id, routeType: 'employee_dashboard' });
                      }}
                      className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 border border-emerald-500/20 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>POS Meseros</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Breakdown & Plan Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Plan Distribution Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                <span>Distribución de Planes Milenia SaaS</span>
              </h3>
              
              <div className="space-y-3">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div>
                      <h4 className="font-bold text-white text-xs">Plan Básico ($149.000 COP/mes)</h4>
                      <p className="text-[11px] text-slate-400">Cafés y locales independientes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-white font-mono">{basicCount} Aliados</span>
                    <p className="text-[10px] text-slate-500 font-mono">{formatCop(basicCount * 149000)}/mes</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div>
                      <h4 className="font-bold text-amber-300 text-xs">Plan Pro ($289.000 COP/mes) ⭐ Más Popular</h4>
                      <p className="text-[11px] text-slate-400">Parrillas, asaderos y pizzerías con KDS</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-amber-400 font-mono">{proCount} Aliados</span>
                    <p className="text-[10px] text-slate-500 font-mono">{formatCop(proCount * 289000)}/mes</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <div>
                      <h4 className="font-bold text-purple-300 text-xs">Plan Enterprise ($499.000 COP/mes)</h4>
                      <p className="text-[11px] text-slate-400">Franquicias multi-sede y alta cocina</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-purple-400 font-mono">{enterpriseCount} Aliados</span>
                    <p className="text-[10px] text-slate-500 font-mono">{formatCop(enterpriseCount * 499000)}/mes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Growth & Expansion Projections */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>Metas de Crecimiento y Escalabilidad 2026</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Meta Fase 1: 15 Restaurantes</span>
                    <span className="text-emerald-400 font-bold">{Math.round((tenants.length / 15) * 100)}% alcanzado</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (tenants.length / 15) * 100)}%` }}></div>
                  </div>
                  <p className="text-[11px] text-slate-400">MRR proyectado: $4.335.000 COP/mes</p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Meta Fase 2: 50 Restaurantes</span>
                    <span className="text-amber-400 font-bold">{Math.round((tenants.length / 50) * 100)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (tenants.length / 50) * 100)}%` }}></div>
                  </div>
                  <p className="text-[11px] text-slate-400">MRR proyectado: $14.450.000 COP/mes (ARR: $173.4M COP)</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: GESTIÓN DE LA RED DE ALIADOS & RESTAURANTES                 */}
      {/* =================================================================== */}
      {activeTab === 'aliados' && (
        <div className="space-y-5">
          
          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, slug, ciudad o NIT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
              >
                <option value="all">Todas las Ciudades</option>
                <option value="Bogotá">Bogotá D.C.</option>
                <option value="Medellín">Medellín</option>
                <option value="Cali">Cali</option>
                <option value="Pasto">Pasto</option>
                <option value="Barranquilla">Barranquilla</option>
                <option value="Cartagena">Cartagena</option>
                <option value="Bucaramanga">Bucaramanga</option>
              </select>

              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
              >
                <option value="all">Todos los Planes</option>
                <option value="basic">Plan Básico ($149k)</option>
                <option value="pro">Plan Pro ($289k)</option>
                <option value="enterprise">Plan Enterprise ($499k)</option>
              </select>

              <button
                onClick={() => setIsNewTenantModalOpen(true)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Aliado</span>
              </button>
            </div>
          </div>

          {/* Allies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTenants.map((tenant) => {
              const plan = tenant.subscription?.plan || 'pro';
              const mrr = tenant.subscription?.mrrCop || (plan === 'basic' ? 149000 : plan === 'pro' ? 289000 : 499000);

              return (
                <div 
                  key={tenant.id}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-5 space-y-4 shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-2xl bg-amber-500/20 text-amber-400 font-mono font-black text-xs flex items-center justify-center border border-amber-500/30">
                          #{tenant.id}
                        </span>
                        <div>
                          <h3 className="font-bold text-sm text-white leading-tight">{tenant.name}</h3>
                          <p className="text-[11px] text-slate-400 font-mono">/{tenant.slug}</p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                        plan === 'enterprise'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : plan === 'pro'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}>
                        {plan}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-300">{tenant.city} &bull; {tenant.address}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                        <span>NIT: {tenant.branding?.nit || '901.999.888-0'}</span>
                        <span className="font-bold text-slate-200">{tenant.tablesCount || 15} Mesas</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cuota SaaS:</span>
                        <span className="font-bold text-amber-400 font-mono">{formatCop(mrr)}/mes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ventas Facturadas:</span>
                        <span className="font-bold text-emerald-400 font-mono">{formatCop(tenant.totalMonthlySalesCop || 25000000)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-3 border-t border-slate-800">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          switchTenant(tenant.id);
                          navigateTo({ restaurantId: tenant.id, routeType: 'tenant_admin' });
                        }}
                        className="py-2 px-3 bg-slate-950 hover:bg-slate-800 text-amber-400 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 border border-amber-500/20 cursor-pointer"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>Admin Dueño</span>
                      </button>

                      <button
                        onClick={() => {
                          switchTenant(tenant.id);
                          navigateTo({ restaurantId: tenant.id, routeType: 'employee_dashboard' });
                        }}
                        className="py-2 px-3 bg-slate-950 hover:bg-slate-800 text-emerald-400 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 border border-emerald-500/20 cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>POS Meseros</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        switchTenant(tenant.id);
                        navigateTo({ restaurantId: tenant.id, routeType: 'customer_menu' });
                      }}
                      className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-800 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ver Carta Digital /{tenant.slug}</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: FACTURACIÓN SAAS & SUSCRIPCIONES                             */}
      {/* =================================================================== */}
      {activeTab === 'facturacion' && (
        <div className="space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <span>Cobranzas & Suscripciones Activas de la Red Milenia</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Monitoreo de recaudos mensuales por software gastronómico en Colombia.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Recaudo Mensual Estimado:</span>
                <p className="text-xl font-black text-amber-400 font-mono">{formatCop(totalMrrCop)} COP</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Aliado / Razón Social</th>
                    <th className="py-3 px-4">Ciudad</th>
                    <th className="py-3 px-4">Plan Actual</th>
                    <th className="py-3 px-4">Tarifa Mensual</th>
                    <th className="py-3 px-4">Próxima Renovación</th>
                    <th className="py-3 px-4">Estado Cobro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {tenants.map((t) => {
                    const plan = t.subscription?.plan || 'pro';
                    const mrr = t.subscription?.mrrCop || (plan === 'basic' ? 149000 : plan === 'pro' ? 289000 : 499000);
                    return (
                      <tr key={t.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-bold text-white font-sans">
                          #{t.id} - {t.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-sans">
                          {t.city}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-amber-400 border border-slate-700">
                            Plan {plan}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-amber-400">
                          {formatCop(mrr)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {t.subscription?.renewsAt || '2026-09-30'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                            <Check className="w-3 h-3" />
                            Al Día
                          </span>
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

      {/* =================================================================== */}
      {/* TAB 4: DIRECTORIO GLOBAL DE USUARIOS FIRESTORE                      */}
      {/* =================================================================== */}
      {activeTab === 'usuarios' && (
        <div className="space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>Usuarios y Roles Registrados en Firestore</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Tabla unificada de Propietarios y Colaboradores registrados en cada restaurante aliado.
                </p>
              </div>

              <button
                onClick={loadAllUsers}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                <span>Refrescar Usuarios</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Usuario</th>
                    <th className="py-3 px-4">Cédula / ID</th>
                    <th className="py-3 px-4">Restaurante Asignado</th>
                    <th className="py-3 px-4">Rol Asignado</th>
                    <th className="py-3 px-4">Cargo</th>
                    <th className="py-3 px-4">Teléfono</th>
                    <th className="py-3 px-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {allUsers.map((u, idx) => {
                    const isOwner = String(u.role).toUpperCase() === 'OWNER' || String(u.role).toUpperCase() === 'ADMIN';
                    const tenant = tenants.find(t => String(t.id) === String(u.restaurantId));

                    return (
                      <tr key={`${u.uid}-${idx}`} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{u.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                          {u.documentId || u.employeeId || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-amber-400">
                          {tenant ? `#${tenant.id} - ${tenant.name}` : `Restaurante #${u.restaurantId}`}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase border ${
                            isOwner 
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                              : 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                          }`}>
                            <ShieldCheck className="w-3 h-3" />
                            <span>{isOwner ? 'OWNER' : 'STAFF'}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {u.position || 'Colaborador'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {u.phone || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Activo
                          </span>
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

      {/* =================================================================== */}
      {/* TAB 5: SALUD DE INFRAESTRUCTURA & SERVICIOS CLOUD                   */}
      {/* =================================================================== */}
      {activeTab === 'infraestructura' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
                <Database className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Operacional
              </span>
            </div>
            <h4 className="font-bold text-white text-sm">Google Cloud Firestore</h4>
            <p className="text-xs text-slate-400">
              Colecciones multi-tenant `/aliados`, `/users` y `/orders` con caché persistente y latencia &lt; 20ms.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Operacional
              </span>
            </div>
            <h4 className="font-bold text-white text-sm">Firebase Authentication</h4>
            <p className="text-xs text-slate-400">
              Módulo de autenticación con Email, Cédula de Identidad y control de acceso basado en roles (RBAC).
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Operacional
              </span>
            </div>
            <h4 className="font-bold text-white text-sm">Facturación DIAN Colombia</h4>
            <p className="text-xs text-slate-400">
              Generador XML con CUFE y códigos QR para resoluciones de facturación electrónica 2026.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                <HardDrive className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Operacional
              </span>
            </div>
            <h4 className="font-bold text-white text-sm">Google Drive Vault Backup</h4>
            <p className="text-xs text-slate-400">
              Respaldo automático en la nube de todas las facturas y cierres de caja diarios en formato PDF/JSON.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-400">
                <Globe className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Operacional
              </span>
            </div>
            <h4 className="font-bold text-white text-sm">Google Calendar Reservas</h4>
            <p className="text-xs text-slate-400">
              Sincronización bidireccional de reservas de mesas para salones y zonas VIP.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400">
                <Cpu className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Operacional
              </span>
            </div>
            <h4 className="font-bold text-white text-sm">Gemini AI Sommelier & Analytics</h4>
            <p className="text-xs text-slate-400">
              Motor de inteligencia artificial para recomendación de maridajes y análisis predictivo de ventas.
            </p>
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 6: CONFIGURACIÓN DE PLATAFORMA                                  */}
      {/* =================================================================== */}
      {activeTab === 'configuracion' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Parámetros Globales de Milenia SaaS</span>
            </h3>
            <p className="text-xs text-slate-400">
              Ajustes de marca, soporte técnico y canales comerciales de Milenia en Colombia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800 text-xs">
            <div className="space-y-2">
              <label className="block text-slate-400 font-bold">Línea Oficial WhatsApp Comercial</label>
              <input
                type="text"
                readOnly
                value="+57 304 347 0984"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-amber-400 font-mono font-bold"
              />
              <p className="text-[11px] text-slate-500">Recibe las solicitudes de cotización de nuevos restaurantes.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-400 font-bold">Moneda del Sistema</label>
              <input
                type="text"
                readOnly
                value="COP (Peso Colombiano - $)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono font-bold"
              />
              <p className="text-[11px] text-slate-500">Tarifas y facturación configuradas para el mercado colombiano.</p>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: REGISTRAR NUEVO ALIADO RESTAURANTE                           */}
      {/* =================================================================== */}
      {isNewTenantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Aprovisionar Restaurante Aliado</h3>
                  <p className="text-xs text-slate-400">Creación instantánea de Tenant en Milenia SaaS</p>
                </div>
              </div>
              <button 
                onClick={() => setIsNewTenantModalOpen(false)}
                className="text-slate-500 hover:text-white cursor-pointer text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nombre del Restaurante *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Parrilla & Fuego San Antonio"
                  value={newTenantName}
                  onChange={(e) => {
                    setNewTenantName(e.target.value);
                    if (!newTenantSlug) {
                      setNewTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Slug / Subdominio *</label>
                  <input
                    type="text"
                    required
                    placeholder="parrilla-san-antonio"
                    value={newTenantSlug}
                    onChange={(e) => setNewTenantSlug(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Ciudad en Colombia *</label>
                  <select
                    value={newTenantCity}
                    onChange={(e) => setNewTenantCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Bogotá D.C.">Bogotá D.C.</option>
                    <option value="Medellín">Medellín</option>
                    <option value="Cali">Cali</option>
                    <option value="Pasto">Pasto</option>
                    <option value="Barranquilla">Barranquilla</option>
                    <option value="Cartagena">Cartagena</option>
                    <option value="Bucaramanga">Bucaramanga</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">NIT / RUT DIAN</label>
                  <input
                    type="text"
                    placeholder="901.884.234-1"
                    value={newTenantNit}
                    onChange={(e) => setNewTenantNit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Plan de Suscripción</label>
                  <select
                    value={newTenantPlan}
                    onChange={(e) => setNewTenantPlan(e.target.value as SubscriptionPlan)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500 font-bold text-amber-400"
                  >
                    <option value="basic">Plan Básico ($149k COP)</option>
                    <option value="pro">Plan Pro ($289k COP)</option>
                    <option value="enterprise">Plan Enterprise ($499k COP)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Color de Marca</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newTenantColor}
                    onChange={(e) => setNewTenantColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-700 cursor-pointer"
                  />
                  <span className="font-mono text-slate-400">{newTenantColor}</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTenantModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Aprovisionar Aliado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
