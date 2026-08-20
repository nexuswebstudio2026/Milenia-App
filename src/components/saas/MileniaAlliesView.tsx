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
  Filter
} from 'lucide-react';
import { formatCop } from '../../utils/currency';

export const MileniaAlliesView: React.FC = () => {
  const { 
    tenants, 
    selectTenantById, 
    setTenantView, 
    setCurrentView,
    navigateTo 
  } = useTasty();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract cities
  const cities = ['all', ...Array.from(new Set(tenants.map(t => t.city.split(',')[0].trim())))];

  // Filtered tenants
  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = 
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.id.includes(searchQuery) ||
      tenant.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.branding.tagline.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity = selectedCity === 'all' || tenant.city.toLowerCase().includes(selectedCity.toLowerCase());

    return matchesSearch && matchesCity;
  });

  const handleCopyUrl = (tenantId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/#/${tenantId}`;
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
    <div className="space-y-8 sm:space-y-12 py-4">
      
      {/* Header Title Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-amber-950 text-white rounded-3xl p-6 sm:p-10 border border-amber-500/20 shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
          <Building2 className="w-3.5 h-3.5" />
          <span>Directorio Oficial de Restaurantes Aliados</span>
        </div>

        <div className="max-w-3xl space-y-2">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Restaurantes Aliados Milenia
          </h1>
          <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
            Cada aliado opera de manera independiente con su propio enlace <span className="font-mono text-amber-300 font-bold">milenia.app/[ID]</span>, menú, gestión de reservas, domicilios y acceso seguro para sus empleados.
          </p>
        </div>

        {/* Quick ID Finder callout */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Tip de Navegación:</strong> Selecciona cualquier aliado (por ejemplo <strong>Aliado #5</strong>) para ingresar directamente a su portal completo.
            </span>
          </div>
          <button
            onClick={() => handleEnterRestaurant('5', 'home')}
            className="px-3 py-1.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl shrink-0 hover:bg-amber-400 transition cursor-pointer"
          >
            Probar Aliado 5 →
          </button>
        </div>
      </div>

      {/* Search & City Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ID (ej. 5), nombre o ciudad..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
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

      </div>

      {/* Allies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTenants.map((tenant) => (
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
                    <span>Aliado #{tenant.id}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-900/90 text-white text-[11px] font-medium backdrop-blur-xs">
                    Plan {tenant.subscription.plan.toUpperCase()}
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
                    <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">ID: {tenant.id}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-amber-300 truncate">
                      milenia.app/{tenant.id}
                    </span>
                    <button
                      onClick={(e) => handleCopyUrl(tenant.id, e)}
                      title="Copiar URL del Aliado"
                      className="p-1 text-slate-400 hover:text-amber-500 transition cursor-pointer"
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
              <button
                onClick={() => handleEnterRestaurant(tenant.id, 'home')}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition cursor-pointer"
              >
                <span>Ingresar al Restaurante (Aliado {tenant.id})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {filteredTenants.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">No encontramos ningún aliado con esa búsqueda</h3>
          <p className="text-xs text-slate-500">Intenta buscar por ID (ej. "5"), nombre de ciudad o restaurante.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCity('all'); }}
            className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl"
          >
            Limpiar filtros
          </button>
        </div>
      )}

    </div>
  );
};
