import React, { useState } from 'react';
import { useTasty } from '../../context/TastyContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  Sparkles, 
  Globe, 
  LogIn, 
  Phone, 
  Layers, 
  Flame, 
  ArrowRight,
  Menu as MenuIcon,
  X,
  User,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Crown,
  Store
} from 'lucide-react';

export const MileniaHeader: React.FC = () => {
  const { 
    mileniaView, 
    setMileniaView, 
    language, 
    setLanguage,
    tenants,
    navigateTo
  } = useTasty();

  const { userProfile, user, logout, getRedirectPath } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGoToUserPortal = () => {
    if (!userProfile) {
      setMileniaView('login');
      return;
    }
    if (userProfile.role === 'owner') {
      navigateTo({ routeType: 'tenant_admin', restaurantId: userProfile.restaurantId || '5' });
    } else {
      navigateTo({ 
        routeType: 'employee_dashboard', 
        restaurantId: userProfile.restaurantId || '3',
        employeeId: userProfile.documentId || '12345'
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      
      {/* Top micro banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white text-[11px] font-semibold py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase">
              SaaS Colombia
            </span>
            <span className="hidden sm:inline">
              Plataforma Multi-Restaurante con Firebase Auth, Firestore y Facturación DIAN
            </span>
            <span className="sm:hidden">
              Plataforma SaaS para Restaurantes
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono opacity-90">
              {tenants.length} Aliados Registrados
            </span>
            <button
              onClick={() => setMileniaView('aliados')}
              className="text-[10px] font-bold underline hover:text-amber-200 cursor-pointer"
            >
              Ver Restaurantes
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo - MILENIA */}
          <button
            onClick={() => setMileniaView('inicio')}
            className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 text-slate-950 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                  MILENIA
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded">
                  SaaS
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Portal Matriz Gastronómico
              </p>
            </div>
          </button>

          {/* Center Navigation Links (Desktop): Inicio, Aliados, Registrar aliado, Propietario milenia */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            
            <button
              onClick={() => setMileniaView('inicio')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mileniaView === 'inicio'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Inicio
            </button>

            <button
              onClick={() => setMileniaView('aliados')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mileniaView === 'aliados'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Aliados</span>
              <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {tenants.length}
              </span>
            </button>

            <button
              onClick={() => setMileniaView('registrar_aliado')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mileniaView === 'registrar_aliado'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-amber-500" />
              <span>Registrar aliado</span>
            </button>

            <button
              onClick={() => setMileniaView('propietario')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mileniaView === 'propietario' || mileniaView === 'superadmin'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-amber-500 dark:text-amber-400 hover:bg-amber-500/10'
              }`}
              title="Panel Maestro de Control del Propietario de Milenia SaaS"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Propietario milenia</span>
            </button>

          </nav>

          {/* Right Action Controls: "Ingreso Aliados" Button + Profile Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              title="Cambiar idioma"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{language.toUpperCase()}</span>
            </button>

            {/* Active User Session or "Ingreso Aliados" Button */}
            {userProfile ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGoToUserPortal}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 border border-amber-500/40 rounded-xl text-xs transition cursor-pointer"
                  title={`Ir a ${getRedirectPath()}`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                    userProfile.role === 'owner' 
                      ? 'bg-amber-500 text-slate-950' 
                      : 'bg-teal-500 text-white'
                  }`}>
                    {userProfile.role === 'owner' ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="font-bold text-white text-[11px] leading-tight truncate max-w-[120px]">{userProfile.name.split(' ')[0]}</p>
                    <p className="text-[9px] text-amber-400 font-mono">
                      {userProfile.role === 'owner' ? `Rest. ${userProfile.restaurantId} (Admin)` : `Rest. ${userProfile.restaurantId} (POS)`}
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={logout}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-500/20 text-slate-600 dark:text-slate-400 hover:text-red-400 transition cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* REQUIRED "Ingreso Aliados" Button */
              <button
                onClick={() => setMileniaView('login')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>Ingreso Aliados</span>
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-2 animate-fade-in">
          <button
            onClick={() => { setMileniaView('inicio'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              mileniaView === 'inicio' ? 'bg-amber-500 text-slate-950' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>Inicio</span>
          </button>
          
          <button
            onClick={() => { setMileniaView('aliados'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              mileniaView === 'aliados' ? 'bg-amber-500 text-slate-950' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>Aliados</span>
            <span className="text-xs bg-slate-900/10 dark:bg-white/20 px-2 py-0.5 rounded-full font-bold">
              {tenants.length}
            </span>
          </button>

          <button
            onClick={() => { setMileniaView('registrar_aliado'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              mileniaView === 'registrar_aliado' ? 'bg-amber-500 text-slate-950' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>Registrar aliado</span>
            <Store className="w-4 h-4" />
          </button>

          <button
            onClick={() => { setMileniaView('propietario'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-black flex items-center justify-between border ${
              mileniaView === 'propietario' || mileniaView === 'superadmin' 
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            <span className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Propietario milenia</span>
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => { setMileniaView('login'); setMobileMenuOpen(false); }}
            className="w-full text-left px-4 py-3 rounded-xl text-sm font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 flex items-center justify-between shadow-md"
          >
            <span>Ingreso Aliados (Firebase Auth)</span>
            <LogIn className="w-4 h-4" />
          </button>
        </div>
      )}

    </header>
  );
};
