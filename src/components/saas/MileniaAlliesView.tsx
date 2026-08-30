import React, { useState } from 'react';
import { useTasty } from '../../context/TastyContext';
import { 
  Building2, 
  Search, 
  MapPin, 
  ExternalLink, 
  Copy, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  Utensils, 
  Sparkles,
  Store,
  Phone,
  ChefHat,
  Filter,
  Key,
  Plus,
  CheckCircle2,
  BadgePercent
} from 'lucide-react';
import { formatCop } from '../../utils/currency';
import { useCurrentDomain } from '../../utils/domainHelper';
import { formatAllyDisplay, calculateNextAllySequence } from '../../utils/allySequence';

export const MileniaAlliesView: React.FC = () => {
  const { 
    tenants, 
    selectTenantById, 
    setTenantView, 
    setCurrentView,
    setMileniaView,
    navigateTo 
  } = useTasty();

  const { domain, origin, getTenantDisplayUrl, getTenantFullUrl } = useCurrentDomain();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const nextSeq = calculateNextAllySequence(tenants);

  // Extract cities
  const cities = ['all', ...Array.from(new Set(tenants.map(t => (t.city || 'Colombia').split(',')[0].trim())))];

  // Filtered tenants
  const filteredTenants = tenants.filter(tenant => {
    const name = tenant.name || '';
    const id = tenant.id || '';
    const allyNum = tenant.allyNumber || '';
    const city = tenant.city || '';
    const tagline = tenant.branding?.tagline || '';
    const phone = tenant.phone || '';
    const nit = tenant.branding?.nit || '';

    const matchesSearch = 
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allyNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tagline.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity = selectedCity === 'all' || city.toLowerCase().includes(selectedCity.toLowerCase());

    return matchesSearch && matchesCity;
  });

  const handleCopyUrl = (tenantId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getTenantFullUrl(tenantId);
    navigator.clipboard.writeText(url);
    setCopiedId(tenantId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEnterRestaurant = (tenantId: string, initialSubView: 'home' | 'menu' | 'services' | 'reservations' | 'tracking' | 'dashboard' = 'home') => {
    selectTenantById(tenantId);
    if (initialSubView === 'home') {
      setTenantView('restaurant-inicio');
    } else if (initialSubView === 'services') {
      setTenantView('restaurant-servicios');
    } else if (initialSubView === 'menu') {
      setTenantView('restaurant-platos');
    } else if (initialSubView === 'reservations') {
      setTenantView('restaurant-reservas');
    } else if (initialSubView === 'dashboard') {
      setTenantView('restaurant-empleados');
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* Header Banner with Registration CTA */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Red Gastronómica Multi-Restaurante</span>
              <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {tenants.length} Activos
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Restaurantes Aliados Milenia
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Explora todos los restaurantes afiliados. Cada aliado cuenta con su subdominio exclusivo, menú digital interactivo, panel gerencial y facturación electrónica DIAN.
            </p>
          </div>

          <div className="shrink-0 w-full lg:w-auto">
            <button
              onClick={() => setMileniaView('registrar_aliado')}
              className="w-full lg:w-auto px-6 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/25 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-950/15 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                <Plus className="w-5 h-5 text-slate-950 stroke-[3]" />
              </div>
              <div className="text-left">
                <span className="block leading-none">Registrar Nuevo Aliado</span>
                <span className="text-[10px] font-bold text-slate-900/80 block mt-0.5">
                  Proceso guiado de 4 pasos &bull; Siguiente: {nextSeq.nextAllyNumber}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-950 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Search & City Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ID (ej. 1), nombre o ciudad..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* City Filter Pills & Quick Add */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0 hidden sm:inline" />
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCity === city
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {city === 'all' ? 'Todas las Ciudades' : city}
              </button>
            ))}
          </div>

          <button
            onClick={() => setMileniaView('registrar_aliado')}
            className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-slate-950 border border-amber-500/30 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Registrar Aliado</span>
          </button>
        </div>

      </div>

      {/* Allies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTenants.map((tenant) => {
          const displayNum = formatAllyDisplay(tenant.allyNumber || tenant.id);

          return (
          <div
            key={tenant.id}
            className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between group"
          >
            {/* Top Banner Image */}
            <div>
              <div className="relative h-48 sm:h-52 overflow-hidden">
                <img
                  src={tenant.branding.bannerImage}
                  alt={tenant.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                {/* ID Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <div className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5" />
                    <span>{displayNum}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-900/90 text-amber-400 text-[11px] font-bold backdrop-blur-xs border border-amber-500/30">
                    Plan Máximo Integral
                  </span>
                </div>

                {/* City */}
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 text-amber-300 text-[11px] font-bold flex items-center gap-1 backdrop-blur-xs border border-amber-500/30">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>{tenant.city.split(',')[0]}</span>
                  </span>
                </div>

                {/* Restaurant Name & Tagline */}
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="font-black text-lg sm:text-xl drop-shadow-sm leading-tight">
                    {tenant.name}
                  </h3>
                  <p className="text-xs text-amber-300/90 font-medium line-clamp-1 mt-0.5">
                    {tenant.branding.tagline}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                
                {/* Specific URL Box for this Ally */}
                <div className="p-3 bg-amber-50/70 dark:bg-slate-800/80 rounded-2xl border border-amber-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    <span>URL Oficial del Aliado:</span>
                    <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">{displayNum}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-amber-300 truncate">
                      {getTenantDisplayUrl(tenant.id)}
                    </span>
                    <button
                      onClick={(e) => handleCopyUrl(tenant.id, e)}
                      title="Copiar URL del Aliado"
                      className="p-1 text-slate-400 hover:text-amber-500 transition cursor-pointer shrink-0"
                    >
                      {copiedId === tenant.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Fiscal & Operational Info */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400 font-medium">NIT DIAN</div>
                    <div className="font-mono font-bold truncate">{tenant.branding.nit}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400 font-medium">Capacidad</div>
                    <div className="font-bold">{tenant.tablesCount} Mesas activas</div>
                  </div>
                  {tenant.phone && (
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 col-span-2 flex items-center justify-between">
                      <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-500" /> Contacto:
                      </div>
                      <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{tenant.phone}</div>
                    </div>
                  )}
                </div>

                {/* Sub-services Quick Navigation */}
                <div className="pt-1">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                    Secciones disponibles en este Aliado:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => handleEnterRestaurant(tenant.id, 'services')}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg transition cursor-pointer"
                    >
                      Servicios
                    </button>
                    <button
                      onClick={() => handleEnterRestaurant(tenant.id, 'menu')}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg transition cursor-pointer"
                    >
                      Platos & Carta
                    </button>
                    <button
                      onClick={() => handleEnterRestaurant(tenant.id, 'reservations')}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg transition cursor-pointer"
                    >
                      Reservas
                    </button>
                    <button
                      onClick={() => handleEnterRestaurant(tenant.id, 'dashboard')}
                      className="px-2 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded-lg border border-amber-500/20 hover:bg-amber-500 hover:text-slate-950 transition cursor-pointer flex items-center gap-1"
                    >
                      <Users className="w-2.5 h-2.5" />
                      <span>Empleados</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-5 pt-0 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleEnterRestaurant(tenant.id, 'home')}
                  className="py-2.5 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
                >
                  <span>Carta & {displayNum}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    selectTenantById(tenant.id);
                    navigateTo({
                      restaurantId: tenant.id,
                      cargo: 'gerente',
                      routeType: 'ally_panel'
                    });
                  }}
                  className="py-2.5 px-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Panel Gerencial</span>
                </button>
              </div>
            </div>

          </div>
          );
        })}

        {/* Card for adding a new ally directly in the grid */}
        <div
          onClick={() => setMileniaView('registrar_aliado')}
          className="border-2 border-dashed border-amber-500/40 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer transition group min-h-[380px]"
        >
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 group-hover:bg-amber-500 text-amber-500 group-hover:text-slate-950 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110">
            <Plus className="w-8 h-8 stroke-[3]" />
          </div>
          <div className="space-y-1">
            <div className="text-[11px] font-black uppercase tracking-wider text-amber-500">
              Nuevo Consecutivo: {nextSeq.nextAllyNumber}
            </div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              Afiliar Nuevo Restaurante
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Inicia el registro completo paso a paso con creación de cuenta, configuración DIAN y activación inmediata.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-md group-hover:scale-105 transition-transform">
            <span>Iniciar Registro Paso a Paso</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {filteredTenants.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">No encontramos ningún aliado con esa búsqueda</h3>
            <p className="text-xs text-slate-500">Intenta buscar por ID, nombre o registra un nuevo aliado directamente.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => { setSearchQuery(''); setSelectedCity('all'); }}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
            >
              Limpiar filtros
            </button>
            <button
              onClick={() => setMileniaView('registrar_aliado')}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Registrar Aliado {nextSeq.nextAllyNumber}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
