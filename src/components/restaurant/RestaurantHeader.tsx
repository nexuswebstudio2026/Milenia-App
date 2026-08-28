import React, { useState } from 'react';
import { useTasty } from '../../context/TastyContext';
import { useAuth } from '../../context/AuthContext';
import { GoogleWorkspaceModal } from '../google/GoogleWorkspaceModal';
import { 
  Building2, 
  UtensilsCrossed, 
  CalendarCheck, 
  Truck, 
  Users, 
  ShoppingBag, 
  Globe, 
  ArrowLeft, 
  Shield, 
  Sparkles,
  Layers,
  Menu as MenuIcon,
  X,
  Store,
  Phone,
  Cloud,
  Key,
  LogOut,
  UserCheck
} from 'lucide-react';
import { formatCop } from '../../utils/currency';
import { useCurrentDomain } from '../../utils/domainHelper';

interface RestaurantHeaderProps {
  onOpenCart?: () => void;
}

export const RestaurantHeader: React.FC<RestaurantHeaderProps> = ({ onOpenCart }) => {
  const { 
    currentTenant, 
    tenantView, 
    setTenantView, 
    setMode,
    setMileniaView,
    openAllyManagerPanel,
    cart, 
    language, 
    setLanguage,
    setIsRewardsOpen,
    showToast
  } = useTasty();

  const { userProfile, logout } = useAuth();
  const { getTenantDisplayUrl } = useCurrentDomain();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.warn('Logout error in RestaurantHeader:', e);
    }
    setMode('milenia');
    setMileniaView('login');
    showToast('Sesión Cerrada', 'Has salido del sistema exitosamente.', 'info');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      
      {/* Top Global Tenant Ribbon */}
      <div 
        style={{ backgroundColor: currentTenant.branding.primaryColor }}
        className="text-white text-[11px] font-bold py-1.5 px-4 transition-colors"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              setMode('milenia');
              setMileniaView('aliados');
            }}
            className="flex items-center gap-1.5 hover:underline font-black cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>← Volver a Milenia (Restaurantes Aliados)</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline bg-black/20 px-2 py-0.5 rounded font-mono text-[10px]">
              URL: {getTenantDisplayUrl(currentTenant.id)}
            </span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black uppercase">
              Aliado #{currentTenant.id}
            </span>
          </div>
        </div>
      </div>

      {/* Main Restaurant Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Restaurant Identity Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTenantView('restaurant-inicio')}
              className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none shrink-0"
            >
              {/* If restaurantId is '1', show Milenia official brand logo; if '2' or other, load partner data from Firestore */}
              {String(currentTenant.id) === '1' ? (
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-0.5 shadow-md shrink-0 flex items-center justify-center text-slate-950">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                    <Sparkles className="w-5 h-5 fill-amber-400" />
                  </div>
                </div>
              ) : (
                <div 
                  style={{ borderColor: currentTenant.branding.primaryColor }}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden border-2 shadow-md shrink-0 bg-slate-100 dark:bg-slate-800 relative"
                >
                  <img 
                    src={currentTenant.branding.logoUrl} 
                    alt={currentTenant.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" title="Sincronizado con Firestore /aliados" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white tracking-tight line-clamp-1">
                    {String(currentTenant.id) === '1' ? 'Milenia Suite • Parrilla & Fuego' : currentTenant.name}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    String(currentTenant.id) === '1' 
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300' 
                      : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {String(currentTenant.id) === '1' ? 'Milenia Core #1' : `Aliado #${currentTenant.id} (Firestore)`}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                  NIT: {currentTenant.branding.nit} • {currentTenant.city.split(',')[0]}
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            
            <button
              onClick={() => setTenantView('restaurant-inicio')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tenantView === 'restaurant-inicio'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Inicio
            </button>

            <button
              onClick={() => setTenantView('restaurant-servicios')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                tenantView === 'restaurant-servicios'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Servicios</span>
            </button>

            <button
              onClick={() => setTenantView('restaurant-platos')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                tenantView === 'restaurant-platos'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-orange-500" />
              <span>Platos & Carta</span>
            </button>

            <button
              onClick={() => setTenantView('restaurant-reservas')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                tenantView === 'restaurant-reservas'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Reservas</span>
            </button>

            <button
              onClick={() => setTenantView('restaurant-domicilios')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                tenantView === 'restaurant-domicilios'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-blue-500" />
              <span>Domicilios</span>
            </button>

            <button
              onClick={() => setTenantView('restaurant-empleados')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                tenantView === 'restaurant-empleados'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Ingreso Empleados</span>
            </button>

            <button
              onClick={() => openAllyManagerPanel(currentTenant.id, 'gerente')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                tenantView === 'restaurant-panel-gerente'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-800 text-amber-400 hover:bg-slate-750 border border-slate-700'
              }`}
              title={`Panel Gerencial (/panel/${currentTenant.id}/gerente)`}
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Panel Gerente</span>
            </button>

          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Google Workspace Cloud Hub Quick Button */}
            <button
              onClick={() => setIsWorkspaceOpen(true)}
              title="Google Workspace & Nube (Calendar, Drive, Maps)"
              className="px-2.5 py-2 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1.5 border border-blue-500/30 transition cursor-pointer"
            >
              <Cloud className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Google Cloud</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* Logged in User & Logout button */}
            {userProfile ? (
              <div className="flex items-center gap-1.5 bg-slate-900 border border-amber-500/30 p-1 rounded-2xl">
                <div className="flex items-center gap-1.5 px-2 py-1 text-left hidden sm:flex">
                  <div className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-black text-[10px]">
                    <UserCheck className="w-3 h-3" />
                  </div>
                  <div className="truncate max-w-[100px]">
                    <p className="text-[10px] font-bold text-white leading-tight truncate">{userProfile.name.split(' ')[0]}</p>
                    <p className="text-[8px] text-amber-400 font-mono uppercase">{userProfile.role}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  id="btn-restaurant-header-logout"
                  className="px-2.5 py-1.5 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Cerrar Sesión y Salir del Sistema"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Salir</span>
                </button>
              </div>
            ) : null}

            {/* Cart Drawer Trigger */}
            <button
              onClick={onOpenCart}
              aria-label="Abrir Carrito"
              className="relative px-3 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Pedido</span>
              {totalCartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-slate-950 text-white text-[10px] font-black flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-2 animate-fade-in">
          
          <button
            onClick={() => { setTenantView('restaurant-inicio'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              tenantView === 'restaurant-inicio' ? 'bg-amber-500 text-slate-950' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>Inicio del Restaurante</span>
          </button>

          <button
            onClick={() => { setTenantView('restaurant-servicios'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              tenantView === 'restaurant-servicios' ? 'bg-amber-500 text-slate-950' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>Servicios</span>
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={() => { setTenantView('restaurant-platos'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              tenantView === 'restaurant-platos' ? 'bg-amber-500 text-slate-950' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>Platos & Carta</span>
            <UtensilsCrossed className="w-4 h-4" />
          </button>

          <button
            onClick={() => { setTenantView('restaurant-reservas'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              tenantView === 'restaurant-reservas' ? 'bg-amber-500 text-slate-950' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>Reservas de Mesa</span>
            <CalendarCheck className="w-4 h-4" />
          </button>

          <button
            onClick={() => { setTenantView('restaurant-domicilios'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              tenantView === 'restaurant-domicilios' ? 'bg-amber-500 text-slate-950' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>Domicilios & Rastreo</span>
            <Truck className="w-4 h-4" />
          </button>

          <button
            onClick={() => { setTenantView('restaurant-empleados'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-black flex items-center justify-between bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20`}
          >
            <span>Ingreso Empleados (POS / KDS)</span>
            <Users className="w-4 h-4" />
          </button>

          <button
            onClick={() => { openAllyManagerPanel(currentTenant.id, 'gerente'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-black flex items-center justify-between bg-slate-900 text-amber-400 border border-slate-700`}
          >
            <span>Panel Gerencial (/panel/{currentTenant.id}/gerente)</span>
            <Key className="w-4 h-4 text-amber-400" />
          </button>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {userProfile && (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2.5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión Activa ({userProfile.name.split(' ')[0]})</span>
              </button>
            )}
            <button
              onClick={() => {
                setMode('milenia');
                setMileniaView('aliados');
                setMobileMenuOpen(false);
              }}
              className="w-full text-center py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
            >
              ← Volver a Milenia SaaS
            </button>
          </div>

        </div>
      )}

      {/* Google Workspace Modal */}
      <GoogleWorkspaceModal
        isOpen={isWorkspaceOpen}
        onClose={() => setIsWorkspaceOpen(false)}
      />

    </header>
  );
};
