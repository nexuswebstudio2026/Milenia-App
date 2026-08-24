import React from 'react';
import { useTasty } from '../../context/TastyContext';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
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
  DollarSign,
  LogIn,
  KeyRound,
  Database,
  Lock,
  Zap,
  TrendingUp,
  Clock,
  Crown
} from 'lucide-react';
import { formatCop } from '../../utils/currency';

export const MileniaLandingView: React.FC = () => {
  const { setMileniaView, tenants, selectTenantById, navigateTo } = useTasty();
  const { loginAsDemo, userProfile } = useAuth();

  const handleQuickLoginMiguel = async () => {
    await loginAsDemo('miguel_owner');
    navigateTo({ routeType: 'tenant_admin', restaurantId: '5' });
  };

  const handleQuickLoginAlejandro = async () => {
    await loginAsDemo('alejandro_staff');
    navigateTo({ routeType: 'employee_dashboard', restaurantId: '3', employeeId: '12345' });
  };

  return (
    <div className="space-y-12 sm:space-y-20 py-4 sm:py-8">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white p-6 sm:p-12 lg:p-16 border border-amber-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Infraestructura Gastronómica SaaS Multi-Tenant • Firebase Backend</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Gestión inteligente con{' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              Firebase Auth & Enrutamiento Dinámico
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 font-normal leading-relaxed">
            Milenia centraliza la operación de restaurantes colombianos con autenticación segura en Firebase, resolución en Firestore de roles (<code className="text-amber-400 font-mono text-xs">/users/{'{uid}'}</code>) y aislamiento de datos por <code className="text-amber-400 font-mono text-xs">restaurantId</code>.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
            <button
              onClick={() => setMileniaView('propietario')}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/25 flex items-center gap-2 transition cursor-pointer hover:scale-[1.02]"
            >
              <Crown className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>Dashboard Propietario Milenia</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMileniaView('login')}
              className="px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-amber-400 font-bold text-sm rounded-2xl border border-amber-500/30 flex items-center gap-2 transition cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-amber-400 stroke-[2.5]" />
              <span>Ingreso Aliados</span>
            </button>

            <button
              onClick={() => setMileniaView('aliados')}
              className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl border border-slate-700 flex items-center gap-2 transition cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Ver Aliados</span>
            </button>
          </div>

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800 text-slate-300">
            <div>
              <div className="text-2xl font-black text-amber-400">{tenants.length}</div>
              <div className="text-xs text-slate-400">Restaurantes Aliados</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400">Firebase</div>
              <div className="text-xs text-slate-400">Auth + Firestore</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">DIAN</div>
              <div className="text-xs text-slate-400">8% Impoconsumo</div>
            </div>
            <div>
              <div className="text-2xl font-black text-orange-400">100%</div>
              <div className="text-xs text-slate-400">Aislamiento de Ventas</div>
            </div>
          </div>

        </div>
      </section>

      {/* Direct Interactive Test Cards: Miguel vs Alejandro Dynamic Routes */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black tracking-wider uppercase text-amber-600 dark:text-amber-400">
            Simulador de Roles & Redirección Dinámica
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Prueba en 1 Clic los Perfiles Solicitados
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Al autenticarse, Firebase consulta <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-amber-600 dark:text-amber-400 font-mono text-[11px]">/users/{'{uid}'}</code> y ejecuta la regla de redirección automática:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card Miguel (Owner) */}
          <div className="bg-white dark:bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl">
              Caso 1: Owner
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-black">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Miguel Ángel (Propietario)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Restaurante ID: <strong className="text-amber-500">5</strong> (Mar & Fuego Caribe)
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 font-mono">
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Firestore Doc:</span>
                  <span className="text-amber-500 font-bold">/users/uid_miguel</span>
                </div>
                <div className="text-slate-700 dark:text-slate-300">
                  {'{'} role: <strong className="text-emerald-500">"owner"</strong>, restaurantId: <strong className="text-amber-500">"5"</strong> {'}'}
                </div>
                <div className="text-slate-500 pt-1 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span>Ruta destino calculada:</span>
                  <span className="text-amber-400 font-black">/5/admin</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                <strong>Vista Propietario:</strong> Métricas globales de facturación, desglose DIAN Impoconsumo 8%, control de inventario crítico y gestión de personal.
              </p>
            </div>

            <button
              onClick={handleQuickLoginMiguel}
              className="mt-6 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <span>Acceder como Miguel (/5/admin)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card Alejandro (Staff / Cajero) */}
          <div className="bg-white dark:bg-slate-900 border-2 border-teal-500/40 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 bg-teal-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl">
              Caso 2: Staff / Cajero
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-500 flex items-center justify-center font-black">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Alejandro Restrepo (Cajero)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Restaurante ID: <strong className="text-teal-500">3</strong> • Cédula: <strong className="text-teal-500">12345</strong>
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 font-mono">
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Firestore Doc:</span>
                  <span className="text-teal-500 font-bold">/users/uid_alejandro</span>
                </div>
                <div className="text-slate-700 dark:text-slate-300">
                  {'{'} role: <strong className="text-teal-500">"staff"</strong>, restaurantId: <strong className="text-teal-500">"3"</strong>, documentId: <strong className="text-teal-500">"12345"</strong> {'}'}
                </div>
                <div className="text-slate-500 pt-1 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span>Ruta destino calculada:</span>
                  <span className="text-teal-400 font-black">/3/dashboard/12345</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                <strong>Vista Operativa:</strong> Interfaz simplificada para toma de pedidos express (POS), registro de asistencia (Clock-In / Clock-Out) y cobro en COP.
              </p>
            </div>

            <button
              onClick={handleQuickLoginAlejandro}
              className="mt-6 w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <span>Acceder como Alejandro (/3/dashboard/12345)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* Security & Firestore Architecture Highlights */}
      <section className="bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-800 text-slate-100 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              Seguridad & Reglas Firestore
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Aislamiento Estricto Multi-Tenant de Ventas
            </h3>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Reglas Desplegadas & Verificadas</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Regla de Aislamiento</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Los empleados del Restaurante 3 no pueden leer registros de ventas del Restaurante 5 gracias a la regla:
            </p>
            <pre className="text-[10px] bg-slate-900 p-2.5 rounded-xl text-amber-300 font-mono overflow-x-auto">
              allow read: if resource.data.restaurantId == request.auth.token.restaurantId
            </pre>
          </div>

          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Colección /users/{'{uid}'}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Documento maestro que almacena rol (<code className="text-blue-400">owner</code> / <code className="text-blue-400">staff</code>), <code className="text-blue-400">restaurantId</code> y <code className="text-blue-400">documentId</code> para enrutar de forma instantánea.
            </p>
          </div>

          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Next.js App Router Patrón</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Estructura organizada en carpetas dinámicas:
              <br /><code className="text-emerald-400 font-mono text-[11px]">app/[restaurantId]/admin</code>
              <br /><code className="text-emerald-400 font-mono text-[11px]">app/[restaurantId]/dashboard/[employeeId]</code>
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
