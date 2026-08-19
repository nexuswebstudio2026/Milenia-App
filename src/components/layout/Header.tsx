import React, { useState } from 'react';
import { useTasty, AppView } from '../../context/TastyContext';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { MeniaLogo } from '../ui/MeniaLogo';
import { 
  Sparkles, 
  ShoppingBag, 
  MapPin, 
  CalendarDays, 
  Clock, 
  UtensilsCrossed, 
  Star, 
  ChefHat, 
  Truck, 
  Store, 
  Menu as MenuIcon, 
  X, 
  Languages,
  Radio,
  Sun,
  Moon,
  Cloud,
  CheckCircle2,
  Wine,
  Download,
  Smartphone,
  Monitor
} from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  onOpenInstallModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenInstallModal }) => {
  const { 
    currentView, 
    setCurrentView, 
    language, 
    setLanguage, 
    selectedLocation, 
    setSelectedLocation,
    locations,
    orderType, 
    setOrderType, 
    cartCount, 
    subtotal, 
    setIsCartOpen,
    orders,
    theme,
    toggleTheme,
    firebaseStatus
  } = useTasty();

  const { deviceInfo, triggerInstall, hasNativePrompt, isInstalled } = usePwaInstall();

  const handleHeaderInstall = async () => {
    if (hasNativePrompt) {
      const res = await triggerInstall();
      if (res !== 'accepted' && onOpenInstallModal) {
        onOpenInstallModal();
      }
    } else if (onOpenInstallModal) {
      onOpenInstallModal();
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);

  const activeOrdersCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;

  const navItems: { view: AppView; labelEs: string; labelEn: string; icon: React.ReactNode; badge?: number }[] = [
    { view: 'menu', labelEs: 'Carta & Pedidos', labelEn: 'Menu & Order', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { view: 'reservations', labelEs: 'Reservar Mesa', labelEn: 'Book a Table', icon: <CalendarDays className="w-4 h-4" /> },
    { view: 'tracking', labelEs: 'Rastrear Pedido', labelEn: 'Track Order', icon: <Radio className="w-4 h-4 text-amber-500" />, badge: activeOrdersCount },
    { view: 'locations', labelEs: 'Sucursales', labelEn: 'Locations', icon: <MapPin className="w-4 h-4" /> },
    { view: 'reviews', labelEs: 'Opiniones', labelEn: 'Reviews', icon: <Star className="w-4 h-4" /> },
  ];

  return (
    <header id="laura-header" className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-300">
      
      {/* Top Banner: Location info & Fulfillment mode & Firebase Status */}
      <div className="bg-slate-900 dark:bg-black text-slate-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 dark:border-slate-900">
        <div className="flex items-center gap-4 flex-wrap">
          
          {/* Location Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLocDropdownOpen(!isLocDropdownOpen)}
              className="flex items-center gap-1.5 hover:text-amber-400 font-medium transition cursor-pointer"
              id="header-location-selector-btn"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>{selectedLocation.name}</span>
              <span className="text-emerald-400 text-[10px] font-semibold bg-emerald-950/80 px-1.5 py-0.5 rounded-full border border-emerald-800">
                {selectedLocation.isOpen ? (language === 'es' ? 'Abierto' : 'Open') : (language === 'es' ? 'Cerrado' : 'Closed')}
              </span>
            </button>

            {isLocDropdownOpen && (
              <div 
                id="location-dropdown-menu"
                className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95"
              >
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {language === 'es' ? 'Seleccionar Restaurante' : 'Select Branch'}
                </div>
                {locations.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      setSelectedLocation(loc);
                      setIsLocDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex flex-col gap-0.5 cursor-pointer ${
                      loc.id === selectedLocation.id ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 font-medium' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{loc.name}</span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {loc.rating}
                      </span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{loc.address}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Opening times note */}
          <div className="hidden sm:flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{selectedLocation.deliveryTimeEstimate} • {language === 'es' ? 'Entrega estimada' : 'Est. delivery'}</span>
          </div>

          {/* Firebase Cloud Live Badge */}
          <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/90 dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-700">
            <Cloud className="w-3 h-3 text-amber-400" />
            <span className="text-slate-300 font-medium">Firebase Firestore</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
          </div>
        </div>

        {/* Top Right: Theme Toggle, Language, and Staff/Admin Toggle */}
        <div className="flex items-center gap-3">
          
          {/* Day / Night Theme Button */}
          <button
            onClick={toggleTheme}
            id="theme-toggle-btn"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold transition cursor-pointer text-xs"
            title={theme === 'dark' ? 'Cambiar a Modo Día (Luz)' : 'Cambiar a Modo Noche (Oscuro)'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '12s' }} />
                <span className="hidden sm:inline text-[11px] text-slate-200">Día</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline text-[11px] text-slate-200">Noche</span>
              </>
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800 transition cursor-pointer"
            id="lang-toggle-btn"
            title="Cambiar idioma / Switch language"
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold uppercase">{language}</span>
          </button>

          <div className="h-3 w-px bg-slate-700"></div>

          {/* Staff / Kitchen Hub */}
          <button
            onClick={() => setCurrentView(currentView === 'admin' ? 'menu' : 'admin')}
            id="admin-mode-toggle-btn"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
              currentView === 'admin' 
                ? 'bg-amber-500 text-slate-950 shadow-xs font-bold' 
                : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>{currentView === 'admin' ? (language === 'es' ? '← Carta' : '← Menu') : (language === 'es' ? 'KDS Staff' : 'KDS Staff')}</span>
          </button>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo - MENIA */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentView('menu')}
              id="brand-logo-btn"
              className="group cursor-pointer focus:outline-none"
            >
              <MeniaLogo size="md" />
            </button>

            {/* Fulfillment Type Toggle (Desktop) */}
            <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setOrderType('delivery')}
                id="btn-fulfillment-delivery"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                  orderType === 'delivery' ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'A Domicilio' : 'Delivery'}</span>
              </button>
              <button
                onClick={() => setOrderType('pickup')}
                id="btn-fulfillment-pickup"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                  orderType === 'pickup' ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Para Recoger' : 'Takeout'}</span>
              </button>
              <button
                onClick={() => setOrderType('dinein')}
                id="btn-fulfillment-dinein"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                  orderType === 'dinein' ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'En Sala' : 'Dine-in'}</span>
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setCurrentView(item.view)}
                  id={`nav-link-${item.view}`}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition cursor-pointer relative ${
                    isActive 
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40 font-bold shadow-2xs' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{language === 'es' ? item.labelEs : item.labelEn}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="w-4 h-4 bg-amber-500 text-slate-950 rounded-full text-[10px] flex items-center justify-center font-black">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Cart Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            {!isInstalled && (
              <button
                onClick={handleHeaderInstall}
                id="header-install-app-btn"
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition cursor-pointer"
                title={deviceInfo.installHeadline}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{deviceInfo.isMobile ? (language === 'es' ? 'Instalar Móvil' : 'Install Mobile') : (language === 'es' ? 'Instalar PC' : 'Install PC')}</span>
              </button>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              id="header-cart-button"
              className="relative flex items-center gap-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 px-4 py-2.5 rounded-2xl font-black text-sm shadow-md hover:shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-slate-950" />
                {cartCount > 0 && (
                  <span 
                    id="cart-badge-count"
                    className="absolute -top-2 -right-2 bg-slate-950 text-amber-400 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-amber-400 animate-bounce"
                  >
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-none text-left">
                <span className="text-[10px] text-slate-900/80 uppercase tracking-wider font-bold">{language === 'es' ? 'Mi Cesta' : 'Cart'}</span>
                <span className="font-black text-slate-950">€{subtotal.toFixed(2)}</span>
              </div>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              id="mobile-menu-toggle-btn"
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div id="mobile-nav-drawer" className="md:hidden border-t border-slate-200 dark:border-slate-800 py-3 pb-5 animate-in slide-in-from-top-2">
            {/* Mobile Order Type */}
            <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl mb-3 text-xs">
              <button
                onClick={() => setOrderType('delivery')}
                className={`flex-1 py-2 text-center rounded-xl font-medium transition cursor-pointer ${
                  orderType === 'delivery' ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                🛵 {language === 'es' ? 'Domicilio' : 'Delivery'}
              </button>
              <button
                onClick={() => setOrderType('pickup')}
                className={`flex-1 py-2 text-center rounded-xl font-medium transition cursor-pointer ${
                  orderType === 'pickup' ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                🛍️ {language === 'es' ? 'Recoger' : 'Takeout'}
              </button>
              <button
                onClick={() => setOrderType('dinein')}
                className={`flex-1 py-2 text-center rounded-xl font-medium transition cursor-pointer ${
                  orderType === 'dinein' ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                🍽️ {language === 'es' ? 'En Mesa' : 'Dine-in'}
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => {
                    setCurrentView(item.view);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                    currentView === item.view 
                      ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 font-bold' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{language === 'es' ? item.labelEs : item.labelEn}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-amber-500 text-slate-950 text-xs px-2 py-0.5 rounded-full font-black">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}

              {!isInstalled && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleHeaderInstall();
                  }}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Download className="w-4 h-4 text-amber-500" />
                    <span>{deviceInfo.installHeadline}</span>
                  </div>
                  <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black">
                    PWA
                  </span>
                </button>
              )}

              <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                <button
                  onClick={() => {
                    setCurrentView('admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 dark:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs"
                >
                  <ChefHat className="w-4 h-4" />
                  <span>{language === 'es' ? 'Panel KDS Cocina' : 'Kitchen KDS'}</span>
                </button>

                <button
                  onClick={toggleTheme}
                  className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
