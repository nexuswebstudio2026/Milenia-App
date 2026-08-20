import React from 'react';
import { useTasty } from '../../context/TastyContext';
import { 
  UtensilsCrossed, 
  Layers, 
  CalendarCheck, 
  Truck, 
  Users, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Star, 
  CheckCircle2,
  Store
} from 'lucide-react';
import { formatCop } from '../../utils/currency';

export const RestaurantHomeView: React.FC = () => {
  const { currentTenant, setTenantView, menuItems, selectDishForCustomization } = useTasty();

  const featuredItems = menuItems.slice(0, 3);

  return (
    <div className="space-y-10 sm:space-y-16 py-2 sm:py-6">
      
      {/* Restaurant Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white min-h-[380px] sm:min-h-[460px] flex flex-col justify-end p-6 sm:p-12 border border-slate-800 shadow-2xl">
        <img
          src={currentTenant.branding.bannerImage}
          alt={currentTenant.name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        <div className="relative z-10 max-w-3xl space-y-4">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" />
              <span>Aliado Milenia #{currentTenant.id}</span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/20 backdrop-blur-md text-white text-xs font-bold">
              {currentTenant.city}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
              milenia.app/{currentTenant.id}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
            {currentTenant.name}
          </h1>

          <p className="text-base sm:text-lg text-amber-200/90 font-medium max-w-2xl drop-shadow-sm">
            {currentTenant.branding.tagline}
          </p>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setTenantView('restaurant-platos')}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-amber-500/25 flex items-center gap-2 transition cursor-pointer"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Explorar Platos & Carta</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setTenantView('restaurant-reservas')}
              className="px-5 py-3 bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm rounded-2xl backdrop-blur-xs border border-white/30 flex items-center gap-2 transition cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-amber-300" />
              <span>Reservar Mesa</span>
            </button>

            <button
              onClick={() => setTenantView('restaurant-empleados')}
              className="px-4 py-3 bg-slate-900/80 hover:bg-slate-800 text-amber-300 font-bold text-xs sm:text-sm rounded-2xl border border-amber-500/30 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Ingreso Personal</span>
            </button>
          </div>

        </div>
      </div>

      {/* Quick Navigation Cards to Restaurant Modules */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <button
          onClick={() => setTenantView('restaurant-servicios')}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 text-left hover:border-amber-500/50 hover:shadow-lg transition-all group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white mb-1">
            Servicios
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            Comedor, domicilios express, reservas VIP y eventos especiales.
          </p>
        </button>

        <button
          onClick={() => setTenantView('restaurant-platos')}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 text-left hover:border-amber-500/50 hover:shadow-lg transition-all group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white mb-1">
            Platos & Carta
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            Catálogo gastronómico interactivo con opciones y pedidos en línea.
          </p>
        </button>

        <button
          onClick={() => setTenantView('restaurant-reservas')}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 text-left hover:border-amber-500/50 hover:shadow-lg transition-all group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white mb-1">
            Reservar Mesa
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            Selecciona fecha, hora y comensales con confirmación inmediata.
          </p>
        </button>

        <button
          onClick={() => setTenantView('restaurant-domicilios')}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 text-left hover:border-amber-500/50 hover:shadow-lg transition-all group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white mb-1">
            Domicilios & Rastreo
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            Sigue tu pedido en tiempo real desde la cocina hasta tu puerta.
          </p>
        </button>

      </div>

      {/* Featured Dishes Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-black tracking-wider uppercase text-amber-600 dark:text-amber-400">
              Especialidades del Chef
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Platos Insignia de {currentTenant.name}
            </h2>
          </div>
          <button
            onClick={() => setTenantView('restaurant-platos')}
            className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Ver toda la carta</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredItems.map((dish) => (
            <div
              key={dish.id}
              className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl text-amber-400 font-mono font-black text-xs">
                    {formatCop(dish.price)}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-black text-base text-slate-900 dark:text-white line-clamp-1">
                    {dish.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {dish.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => selectDishForCustomization(dish)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
                >
                  Ordenar este Plato
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location & Info Card */}
      <div className="bg-slate-100 dark:bg-slate-900/60 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 dark:text-slate-300">
        
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">Dirección & Ciudad</div>
            <div>{currentTenant.address}</div>
            <div className="text-slate-400">{currentTenant.city}</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">Horario de Atención</div>
            <div>Lunes a Domingo</div>
            <div className="text-slate-400">12:00 PM - 11:00 PM</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">Facturación & DIAN</div>
            <div>NIT: {currentTenant.branding.nit}</div>
            <div className="text-[10px] text-slate-400">{currentTenant.branding.dianResolution}</div>
          </div>
        </div>

      </div>

    </div>
  );
};
