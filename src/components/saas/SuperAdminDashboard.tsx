import React, { useState } from 'react';
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
  Sliders, 
  Database, 
  Code, 
  Copy, 
  Check,
  Search
} from 'lucide-react';
import { TenantRestaurant, SubscriptionPlan } from '../../types';

export const SuperAdminDashboard: React.FC = () => {
  const { 
    tenants, 
    switchTenant, 
    navigateTo, 
    addTenant,
    showToast 
  } = useTasty();

  const [searchTerm, setSearchTerm] = useState('');
  const [isNewTenantModalOpen, setIsNewTenantModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tenants' | 'subscriptions' | 'architecture'>('tenants');
  const [copiedCode, setCopiedCode] = useState(false);

  // New Tenant Form State
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const [newTenantCity, setNewTenantCity] = useState('Bogotá D.C.');
  const [newTenantNit, setNewTenantNit] = useState('');
  const [newTenantPlan, setNewTenantPlan] = useState<SubscriptionPlan>('pro');
  const [newTenantColor, setNewTenantColor] = useState('#ea580c');

  // Calculate SaaS Global Metrics
  const totalTenants = tenants.length;
  const totalMrrCop = tenants.reduce((acc, t) => acc + (t.subscription?.mrrCop || 0), 0);
  const totalActiveTables = tenants.reduce((acc, t) => acc + (t.tablesCount || 0), 0);
  const totalVolumeCop = tenants.reduce((acc, t) => acc + (t.totalMonthlySalesCop || 0), 0);

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCOP = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName || !newTenantSlug) {
      showToast('Campos requeridos', 'Ingresa al menos el nombre y el slug del restaurante.', 'warning');
      return;
    }

    const nextId = (tenants.length + 1).toString();
    const planMrr = newTenantPlan === 'basic' ? 149000 : newTenantPlan === 'pro' ? 289000 : 499000;

    const createdTenant: TenantRestaurant = {
      id: nextId,
      slug: newTenantSlug.toLowerCase().replace(/\s+/g, '-'),
      name: newTenantName,
      city: newTenantCity,
      address: 'Calle Principal #10-20',
      phone: '+57 300 000 0000',
      email: `contacto@${newTenantSlug}.co`,
      createdAt: new Date().toISOString().split('T')[0],
      tablesCount: newTenantPlan === 'basic' ? 10 : newTenantPlan === 'pro' ? 20 : 50,
      activeOrdersCount: 0,
      totalMonthlySalesCop: 0,
      branding: {
        logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80',
        primaryColor: newTenantColor,
        accentColor: '#f59e0b',
        themeStyle: 'modern',
        bannerImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        tagline: 'Sabor auténtico y experiencia gastronómica de autor',
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
    showToast('Restaurante aprovisionado', `El tenant "${newTenantName}" ha sido creado exitosamente con ID: ${nextId}.`, 'success');
  };

  const copyArchitectureSnippet = () => {
    const snippet = `// middleware.ts (Next.js Multi-tenant Router)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Extraer [restaurantId] y [employeeId] del path: /[restaurantId]/dashboard/[employeeId]
  const match = pathname.match(/^\\/([a-zA-Z0-9_-]+)(?:\\/(dashboard|admin|menu)(?:\\/([a-zA-Z0-9_-]+))?)?/);
  
  if (match) {
    const [, restaurantId, routeType, employeeId] = match;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-id', restaurantId);
    if (employeeId) requestHeaders.set('x-employee-id', employeeId);
    
    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  }
  return NextResponse.next();
}`;
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    showToast('Copiado', 'Snippet de Middleware Next.js copiado al portapapeles.', 'info');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full font-mono text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              SaaS SuperAdmin Hub
            </span>
            <span className="text-xs text-slate-400 font-medium">Milenia Colombia Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Panel Maestro Multi-Tenant
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Administración centralizada de franquicias y restaurantes en Colombia, suscripciones activas, facturación MRR y aislamiento de datos por tenant.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsNewTenantModalOpen(true)}
            id="superadmin-new-tenant-btn"
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nuevo Restaurante</span>
          </button>
        </div>
      </div>

      {/* SaaS Global Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Restaurantes Activos</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-xl">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalTenants} <span className="text-xs font-semibold text-emerald-500 font-sans">Tenants en Colombia</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Medellín, Bogotá D.C. & Cali
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>MRR Suscripciones (COP)</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-500 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
            {formatCOP(totalMrrCop)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">+18.5%</span> este mes
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Mesas Conectadas POS</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalActiveTables} <span className="text-xs font-semibold text-slate-400">Mesas</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            En salones, terrazas y zonas VIP
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Volumen Transaccional</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {formatCOP(totalVolumeCop)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Ventas facturadas en el mes
          </div>
        </div>

      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'tenants'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Restaurantes Registrados ({tenants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'subscriptions'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Planes & Suscripciones</span>
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'architecture'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Arquitectura Multi-Tenant & Schema</span>
        </button>
      </div>

      {/* TAB 1: Tenants List */}
      {activeTab === 'tenants' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Buscar por nombre, slug o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Mostrando {filteredTenants.length} de {tenants.length} restaurantes
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTenants.map((tenant) => {
              const plan = tenant.subscription?.plan || 'pro';
              const isParrillaCamilo = tenant.id === '1';

              return (
                <div 
                  key={tenant.id}
                  className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                    isParrillaCamilo ? 'ring-2 ring-amber-500/40 border-amber-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-slate-950 text-amber-400 font-mono font-black text-xs flex items-center justify-center border border-slate-800">
                          #{tenant.id}
                        </span>
                        <div>
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                            {tenant.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            slug: /{tenant.slug}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        plan === 'enterprise' 
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : plan === 'pro'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}>
                        Plan {plan}
                      </span>
                    </div>

                    {/* Location & Details */}
                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{tenant.city} • {tenant.address}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span>NIT: {tenant.branding.nit}</span>
                        <span className="font-bold text-slate-900 dark:text-slate-200">{tenant.tablesCount} Mesas</span>
                      </div>
                    </div>

                    {/* Financials */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Cuota SaaS Mensual:</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {formatCOP(tenant.subscription.mrrCop)}/mes
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Ventas Registradas:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCOP(tenant.totalMonthlySalesCop)}
                      </span>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          switchTenant(tenant.id);
                          navigateTo({ restaurantId: tenant.id, routeType: 'tenant_admin' });
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl transition cursor-pointer shadow-xs"
                      >
                        <Store className="w-3.5 h-3.5 text-amber-400" />
                        <span>Admin Owner</span>
                      </button>

                      <button
                        onClick={() => {
                          switchTenant(tenant.id);
                          navigateTo({ restaurantId: tenant.id, routeType: 'employee_dashboard' });
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl transition cursor-pointer shadow-xs"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>POS Empleados</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        switchTenant(tenant.id);
                        navigateTo({ restaurantId: tenant.id, routeType: 'customer_menu' });
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold rounded-xl transition cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                      <span>Ver Menú Digital /{tenant.slug}</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Subscriptions */}
      {activeTab === 'subscriptions' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan Basic */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 flex flex-col justify-between shadow-sm">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                Plan Inicial
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Plan Básico</h3>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                $149.000 <span className="text-xs font-normal text-slate-500">COP / mes</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Para pequeños cafés y gastrobares independientes que inician su digitalización.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Hasta 12 mesas en salón</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Hasta 5 empleados / meseros</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Menú QR autogestionable</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Control de caja diario</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Plan Pro (Featured) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-500 p-6 space-y-5 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Más Popular
            </div>
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                Para Restaurantes en Crecimiento
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Plan Pro</h3>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                $289.000 <span className="text-xs font-normal text-slate-500">COP / mes</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ideal para asaderos, parrillas y pizzerías de alto flujo con comanda de cocina.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Hasta 25 mesas y múltiples zonas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Hasta 12 empleados con roles y PINs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>KDS Comandas Cocina en tiempo real</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Facturación Electrónica DIAN Colombia</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Pagos Nequi, Daviplata y Datáfono</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Plan Enterprise */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 flex flex-col justify-between shadow-sm">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400 tracking-wider">
                Franquicias & Alta Cocina
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Plan Enterprise</h3>
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
                $499.000 <span className="text-xs font-normal text-slate-500">COP / mes</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Para cadenas multi-sede, restaurantes haute cuisine y cavas privadas.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Mesas y zonas ilimitadas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Hasta 30 empleados + Multi-administrador</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Módulo de Fidelización VIP Rewards</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>API Dedicada de Integración Contable</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Architecture & Next.js Multi-Tenant Blueprint */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-slate-100 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Next.js Multi-Tenant Middleware & Route Pattern</h3>
              </div>
              <button
                onClick={copyArchitectureSnippet}
                className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 px-3 py-1.5 rounded-xl border border-slate-700 transition cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copiado' : 'Copiar Middleware'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-2xl text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800/80 leading-relaxed">
{`// Patrón de Rutas Dinámicas en Next.js (App Router / Pages Router):
// -----------------------------------------------------------------
// app/[restaurantId]/dashboard/[employeeId]/page.tsx -> POS / Cocina KDS Empleado
// app/[restaurantId]/admin/page.tsx                  -> Panel de Administración Owner
// app/[restaurantId]/menu/page.tsx                   -> Carta Digital QR Cliente
// app/superadmin/page.tsx                            -> Plataforma Maestra SaaS Milenia

// prisma/schema.prisma Multi-Tenant Foreign Keys:
// Todos los modelos (Dish, Order, Employee, Table, Customer) tienen 'restaurantId'
// con índices compuestos @@index([restaurantId, status]) para consultas optimizadas.`}
            </pre>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-500" />
                Aislamiento de Datos por Tenant (Row-Level Security)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                El restaurante <strong>"Camilo" (ID: 1)</strong> nunca comparte meseros, mesas, pedidos ni historial de clientes con otros restaurantes. Toda consulta en Prisma/Supabase/Firestore inyecta automáticamente el filtro:
              </p>
              <code className="block bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-xs font-mono text-purple-600 dark:text-purple-300">
                prisma.order.findMany(&#123; where: &#123; restaurantId: currentTenantId &#125; &#125;)
              </code>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Branding Dinámico & White-Label
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Cada restaurante define su propio color primario, logotipo, NIT DIAN, resolución de facturación y moneda. Al cambiar de URL, la interfaz inyecta las variables de estilo correspondientes al tenant activo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Tenant Onboarding */}
      {isNewTenantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Registrar Nuevo Restaurante</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Aprovisionamiento instantáneo de Tenant SaaS</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewTenantModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del Restaurante *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: La Fogata del Chef"
                  value={newTenantName}
                  onChange={(e) => {
                    setNewTenantName(e.target.value);
                    if (!newTenantSlug) {
                      setNewTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Slug / Subdominio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej: la-fogata"
                    value={newTenantSlug}
                    onChange={(e) => setNewTenantSlug(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ciudad (Colombia) *
                  </label>
                  <select
                    value={newTenantCity}
                    onChange={(e) => setNewTenantCity(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="Medellín, Antioquia">Medellín, Antioquia</option>
                    <option value="Bogotá D.C., Cundinamarca">Bogotá D.C.</option>
                    <option value="Cali, Valle del Cauca">Cali, Valle</option>
                    <option value="Barranquilla, Atlántico">Barranquilla</option>
                    <option value="Cartagena, Bolívar">Cartagena</option>
                    <option value="Bucaramanga, Santander">Bucaramanga</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    NIT / RUT DIAN
                  </label>
                  <input
                    type="text"
                    placeholder="901.445.890-1"
                    value={newTenantNit}
                    onChange={(e) => setNewTenantNit(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Plan Suscripción
                  </label>
                  <select
                    value={newTenantPlan}
                    onChange={(e) => setNewTenantPlan(e.target.value as SubscriptionPlan)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="basic">Plan Básico ($149k COP)</option>
                    <option value="pro">Plan Pro ($289k COP)</option>
                    <option value="enterprise">Plan Enterprise ($499k COP)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Color de Marca Principal
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newTenantColor}
                    onChange={(e) => setNewTenantColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-500">{newTenantColor}</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTenantModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Aprovisionar Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
