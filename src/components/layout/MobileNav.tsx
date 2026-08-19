import React from 'react';
import { useTasty } from '../../context/TastyContext';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { 
  Utensils, 
  CalendarDays, 
  ShoppingBag, 
  MapPin, 
  Download, 
  ChefHat,
  Star
} from 'lucide-react';

interface MobileNavProps {
  onOpenInstallModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenInstallModal }) => {
  const { currentView, setCurrentView, orders, language } = useTasty();
  const { triggerInstall, hasNativePrompt, isInstalled } = usePwaInstall();

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  ).length;

  const handleInstallClick = async () => {
    if (hasNativePrompt) {
      const res = await triggerInstall();
      if (res !== 'accepted') {
        onOpenInstallModal();
      }
    } else {
      onOpenInstallModal();
    }
  };

  const navItems = [
    {
      id: 'menu',
      label: language === 'es' ? 'Carta' : 'Menu',
      icon: Utensils,
      onClick: () => setCurrentView('menu'),
      active: currentView === 'menu'
    },
    {
      id: 'reservations',
      label: language === 'es' ? 'Reservas' : 'Book Table',
      icon: CalendarDays,
      onClick: () => setCurrentView('reservations'),
      active: currentView === 'reservations'
    },
    {
      id: 'tracking',
      label: language === 'es' ? 'Pedidos' : 'Orders',
      icon: ShoppingBag,
      onClick: () => setCurrentView('tracking'),
      active: currentView === 'tracking',
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined
    },
    {
      id: 'locations',
      label: language === 'es' ? 'Atelier' : 'Atelier',
      icon: MapPin,
      onClick: () => setCurrentView('locations'),
      active: currentView === 'locations'
    },
    ...(!isInstalled ? [{
      id: 'install',
      label: language === 'es' ? 'Instalar' : 'Install',
      icon: Download,
      onClick: handleInstallClick,
      active: false,
      isAction: true
    }] : [])
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300 shadow-2xl">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`flex-1 min-h-[48px] py-1 px-1.5 flex flex-col items-center justify-center rounded-2xl relative transition-all cursor-pointer ${
                item.active
                  ? 'text-amber-600 dark:text-amber-400 font-bold'
                  : item.isAction
                  ? 'text-amber-500 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {/* Active Indicator dot */}
              {item.active && (
                <span className="absolute top-1 w-1 h-1 rounded-full bg-amber-500"></span>
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${item.active ? 'scale-110' : ''}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] mt-0.5 tracking-tight whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
