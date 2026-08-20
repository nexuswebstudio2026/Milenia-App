import React from 'react';
import { useTasty } from '../../context/TastyContext';
import { 
  Building2, 
  Flame, 
  UtensilsCrossed, 
  Smartphone, 
  ChefHat, 
  Receipt, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink, 
  Users, 
  MapPin, 
  CheckCircle2, 
  Sparkles,
  QrCode,
  Store,
  DollarSign
} from 'lucide-react';
import { formatCop } from '../../utils/currency';

export const MileniaLandingView: React.FC = () => {
  const { setMileniaView, tenants, selectTenantById } = useTasty();

  return (
    <div className="space-y-12 sm:space-y-20 py-4 sm:py-8">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white p-6 sm:p-12 lg:p-16 border border-amber-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Infraestructura Gastronómica Multi-Tenant para Colombia</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Cada restaurante con su{' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              propia URL, carta y sistema
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 font-normal leading-relaxed">
            Milenia centraliza la operación de los mejores restaurantes de Colombia. Cada aliado cuenta con su URL personalizada, KDS de cocina en tiempo real, terminal POS para meseros y facturación electrónica DIAN con Impoconsumo del 8%.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
            <button
              onClick={() => setMileniaView('aliados')}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/25 flex items-center gap-2 transition cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Explorar Restaurantes Aliados</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMileniaView('login')}
              className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl border border-slate-700 flex items-center gap-2 transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Panel de Acceso & Login</span>
            </button>
          </div>

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800 text-slate-300">
            <div>
              <div className="text-2xl font-black text-amber-400">{tenants.length}</div>
              <div className="text-xs text-slate-400">Aliados Registrados</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">100%</div>
              <div className="text-xs text-slate-400">Aislamiento de Datos</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400">DIAN</div>
              <div className="text-xs text-slate-400">8% Impoconsumo</div>
            </div>
            <div>
              <div className="text-2xl font-black text-orange-400">POS + KDS</div>
              <div className="text-xs text-slate-400">Comandas en Vivo</div>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Allies Quick Showcase */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-black tracking-wider uppercase text-amber-600 dark:text-amber-400">
              Red de Aliados
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Restaurantes destacados en Milenia
            </h2>
          </div>
          <button
            onClick={() => setMileniaView('aliados')}
            className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span>Ver todos los {tenants.length} aliados con sus URLs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tenants.slice(0, 3).map((tenant) => (
            <div
              key={tenant.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-500/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="relative h-44 rounded-2xl overflow-hidden">
                  <img
                    src={tenant.branding.bannerImage}
                    alt={tenant.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-black shadow-md">
                      Aliado #{tenant.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-900/80 text-white text-[11px] font-medium backdrop-blur-xs">
                      {tenant.city.split(',')[0]}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-black text-base drop-shadow-sm">{tenant.name}</h3>
                    <p className="text-[11px] text-amber-300 line-clamp-1 font-medium">{tenant.branding.tagline}</p>
                  </div>
                </div>

                {/* URL Badge Box */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <Store className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="font-mono text-slate-600 dark:text-slate-300 font-bold truncate">
                      milenia.app/{tenant.id}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {tenant.id}</span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => selectTenantById(tenant.id)}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <span>Ingresar al Restaurante</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars / Solutions Grid */}
      <section className="space-y-8 bg-slate-100 dark:bg-slate-900/60 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Todo lo que incluye cada Aliado Milenia
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Un ecosistema integral para dueños, administradores, meseros, chefs y comensales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base text-slate-900 dark:text-white">URL & Menú Propio</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Cada restaurante tiene su dirección web única con carta digital interactiva, fotos, opciones y pedidos.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base text-slate-900 dark:text-white">POS para Meseros</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Toma de comandas en mesa, división de cuentas, asignación de zonas y envío instantáneo a cocina.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base text-slate-900 dark:text-white">KDS de Cocina</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Tickets digitales para parrilla y cocina con temporizador de preparación y pase de platos listos.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base text-slate-900 dark:text-white">Facturación DIAN</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Cumplimiento tributario en Colombia con 8% Impoconsumo, 10% propina voluntaria y medios electrónicos.
            </p>
          </div>

        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-slate-950 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            ¿Tienes un restaurante en Colombia?
          </h2>
          <p className="text-slate-900 font-medium text-xs sm:text-sm">
            Únete a la red de aliados Milenia y digitaliza tu operación en minutos con tu propia URL y sistema POS.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setMileniaView('contactos')}
            className="px-6 py-3.5 bg-slate-950 text-white font-black text-sm rounded-2xl hover:bg-slate-900 shadow-md transition cursor-pointer"
          >
            Solicitar Afiliación
          </button>
          <button
            onClick={() => setMileniaView('aliados')}
            className="px-5 py-3.5 bg-white/30 hover:bg-white/40 text-slate-950 font-bold text-sm rounded-2xl backdrop-blur-xs transition cursor-pointer"
          >
            Ver Aliados
          </button>
        </div>
      </section>

    </div>
  );
};
