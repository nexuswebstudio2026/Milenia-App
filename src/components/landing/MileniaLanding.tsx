import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Clock, 
  Utensils, 
  ChefHat, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  SlidersHorizontal,
  DollarSign,
  Receipt,
  Plus,
  Minus,
  Sparkles,
  ShieldCheck,
  Zap,
  Coffee,
  Flame,
  Wine,
  Home,
  LogIn,
  Mail,
  Menu,
  X
} from 'lucide-react';
import { LoginModal } from '../auth/LoginModal';
import { ContactModal } from '../contact/ContactModal';
import { EmpleadosModal } from '../empleados/EmpleadosModal';
import { Empleado } from '../../types/empleado';
import { WorkstationOption } from '../../services/empleadosService';

interface MockMenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

const SIMULATOR_MENU: MockMenuItem[] = [
  { id: '1', name: 'Punta de Anca Angus (400g)', price: 49000, category: 'Brasas' },
  { id: '2', name: 'Costillas Glaseadas al Romero', price: 42000, category: 'Brasas' },
  { id: '3', name: 'Risotto de Setas Silvestres', price: 38000, category: 'Cocina' },
  { id: '4', name: 'Carpaccio de Res con Parmesano', price: 28000, category: 'Entradas' },
  { id: '5', name: 'Copa de Vino Reserva', price: 18000, category: 'Cava' },
  { id: '6', name: 'Cerveza Artesanal Dorada', price: 12000, category: 'Bebidas' }
];

interface MileniaLandingProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  deviceTimeStr: string;
  isAutoTimeMode: boolean;
  onLoginSuccess?: (empleado: Empleado, station: WorkstationOption) => void;
}

export const MileniaLanding: React.FC<MileniaLandingProps> = ({
  isDarkMode,
  onToggleTheme,
  deviceTimeStr,
  isAutoTimeMode,
  onLoginSuccess,
}) => {
  // Console Tab State
  const [activeConsoleTab, setActiveConsoleTab] = useState<'salon' | 'kds' | 'carta' | 'metricas'>('salon');
  
  // Interactive Salon State
  const [selectedTable, setSelectedTable] = useState<number>(2);
  const [tableOrders, setTableOrders] = useState<{ [table: number]: { [itemId: string]: number } }>({
    1: { '3': 2, '5': 2 },
    2: { '1': 1, '2': 1, '6': 2 },
    3: { '4': 1, '5': 2 },
    4: {},
    5: { '1': 2, '3': 1 },
    6: {}
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Navigation & Modals State
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isEmpleadosOpen, setIsEmpleadosOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavInicio = () => {
    setIsLoginOpen(false);
    setIsContactOpen(false);
    setIsEmpleadosOpen(false);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavIngresar = () => {
    setIsContactOpen(false);
    setIsEmpleadosOpen(false);
    setIsLoginOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleNavContactos = () => {
    setIsLoginOpen(false);
    setIsEmpleadosOpen(false);
    setIsContactOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleNavEmpleados = () => {
    setIsLoginOpen(false);
    setIsContactOpen(false);
    setIsEmpleadosOpen(true);
    setIsMobileMenuOpen(false);
  };

  // Efficiency / Margin Estimator sliders
  const [estimatorTables, setEstimatorTables] = useState<number>(18);
  const [estimatorTicket, setEstimatorTicket] = useState<number>(55000);
  const [estimatorTurnover, setEstimatorTurnover] = useState<number>(3);

  const monthlyVolume = estimatorTables * estimatorTurnover * 26;
  const monthlyRevenue = monthlyVolume * estimatorTicket;
  const monthlyFoodWasteSavings = Math.round(monthlyRevenue * 0.038);
  const monthlyEfficiencyGain = Math.round(monthlyRevenue * 0.055);
  const totalBenefit = monthlyFoodWasteSavings + monthlyEfficiencyGain;

  // Simulator calculations
  const currentTableCart = tableOrders[selectedTable] || {};
  const currentCartEntries: [string, number][] = Object.entries(currentTableCart)
    .map(([id, qty]) => [id, Number(qty)] as [string, number])
    .filter(([_, qty]) => qty > 0);

  const rawSubtotal = currentCartEntries.reduce((acc, [id, qty]) => {
    const it = SIMULATOR_MENU.find(m => m.id === id);
    return acc + (it ? it.price * qty : 0);
  }, 0);

  const taxServiceAmount = Math.round(rawSubtotal * 0.08);
  const grandTotal = rawSubtotal + taxServiceAmount;

  const handleAddItem = (item: MockMenuItem) => {
    setTableOrders(prev => {
      const tableCart = { ...(prev[selectedTable] || {}) };
      tableCart[item.id] = (tableCart[item.id] || 0) + 1;
      return { ...prev, [selectedTable]: tableCart };
    });
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    setTableOrders(prev => {
      const tableCart = { ...(prev[selectedTable] || {}) };
      const currentQty = tableCart[itemId] || 0;
      const nextQty = Math.max(0, currentQty + delta);
      if (nextQty === 0) {
        delete tableCart[itemId];
      } else {
        tableCart[itemId] = nextQty;
      }
      return { ...prev, [selectedTable]: tableCart };
    });
  };

  const handleSendToKitchen = () => {
    if (grandTotal === 0) return;
    setNotification(`Comanda de Mesa ${selectedTable} transmitida a la brigada de cocina.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleClearTable = () => {
    if (grandTotal === 0) return;
    setTableOrders(prev => ({ ...prev, [selectedTable]: {} }));
    setNotification(`Cuenta de Mesa ${selectedTable} liquidada con éxito.`);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="w-full text-slate-900 dark:text-slate-100 transition-colors duration-500">
      
      {/* 1. TOP BRAND & NAVIGATION BAR */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          
          {/* Pure Wordmark */}
          <div 
            onClick={handleNavInicio}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 dark:from-amber-500 dark:to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/10 group-hover:scale-105 transition">
              <Utensils className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-mono text-2xl font-black tracking-widest text-slate-900 dark:text-white uppercase block leading-none">
                MILENIA
              </span>
              <span className="text-[10px] font-medium tracking-wider text-slate-600 dark:text-slate-300 uppercase">
                Software Gastronómico
              </span>
            </div>
          </div>

          {/* Center: Primary Navigation System (Inicio - Ingresar - Contactos) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-inner">
            <button
              onClick={handleNavInicio}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                !isLoginOpen && !isContactOpen
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Inicio</span>
            </button>

            <button
              onClick={handleNavIngresar}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                isLoginOpen
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Ingresar</span>
            </button>

            <button
              onClick={handleNavContactos}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                isContactOpen
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contactos</span>
            </button>
          </nav>

          {/* Time & Day/Night Mode Indicator with Switcher */}
          <div className="flex items-center gap-2.5">
            <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-inner">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {deviceTimeStr}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {isDarkMode ? 'Modo Noche' : 'Modo Día'}
              </span>
              {isAutoTimeMode && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                  Auto
                </span>
              )}
            </div>

            {/* Elegant Mode Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Alternar Modo Día / Noche"
              aria-label="Alternar Modo Día / Noche"
            >
              {isDarkMode ? (
                <>
                  <Moon className="w-4 h-4 text-amber-400 fill-amber-400/30" />
                  <span className="hidden sm:inline text-xs font-semibold">Noche</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-600 fill-amber-500/30" />
                  <span className="hidden sm:inline text-xs font-semibold">Día</span>
                </>
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition cursor-pointer"
              aria-label="Abrir menú de navegación"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-2 animate-fadeIn">
            <button
              onClick={handleNavInicio}
              className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
                !isLoginOpen && !isContactOpen
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200'
              }`}
            >
              <Home className="w-4 h-4 text-amber-500" />
              <span>Inicio</span>
            </button>
            <button
              onClick={handleNavIngresar}
              className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
                isLoginOpen
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4 text-amber-500" />
              <span>Ingresar</span>
            </button>
            <button
              onClick={handleNavContactos}
              className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
                isContactOpen
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200'
              }`}
            >
              <Mail className="w-4 h-4 text-amber-500" />
              <span>Contactos</span>
            </button>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 border-t border-slate-100 dark:border-slate-900">
              <span className="flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Hora: {deviceTimeStr}
              </span>
              <span className="font-semibold">
                {isDarkMode ? 'Modo Noche' : 'Modo Día'}
              </span>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO PRESENTATION */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-28 lg:pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[640px] bg-gradient-to-b from-amber-500/8 via-amber-500/3 to-transparent dark:from-amber-500/10 dark:via-amber-500/4 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-8 relative z-10 text-center space-y-8">
          
          {/* Refined Eyebrow */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-medium tracking-wider text-slate-600 dark:text-slate-400 uppercase font-mono">
              Arquitectura de Software para Alta Gastronomía
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight text-slate-900 dark:text-white max-w-5xl mx-auto leading-[1.08]">
            La armonía precisa entre <span className="font-medium italic font-serif text-amber-600 dark:text-amber-400">el salón</span>, <span className="font-medium italic font-serif text-slate-800 dark:text-slate-200">la cocina</span> y la gestión.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Milenia concibe el ritmo del restaurante como un flujo continuo: mesas sincronizadas en sala, comandas instantáneas en cocina y claridad matemática en cada servicio.
          </p>

          {/* Key Metric Tags */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Sincronización en Tiempo Real
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Control de Cocina por Estaciones
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Fichas Técnicas & Escandallos
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Márgenes Lúcidos
            </span>
          </div>

        </div>
      </section>

      {/* 3. SIMULADOR POS EN VIVO (HERO INTERACTIVE EXPERIENCE) */}
      <section className="py-16 bg-slate-100/70 dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <h2 className="text-2xl sm:text-3xl font-light text-slate-900 dark:text-white">
              Simulador Operativo en Tiempo Real
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Interactúa con el flujo de sala: selecciona una mesa, añade platos de la carta y envía a cocina.
            </p>
          </div>

          {/* Simulator Box */}
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-7 relative">
            
            {/* Notification Banner */}
            {notification && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{notification}</span>
              </div>
            )}

            {/* Table Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 border-b border-slate-100 dark:border-slate-900">
              {[1, 2, 3, 4, 5, 6].map(num => {
                const count = Object.keys(tableOrders[num] || {}).length;
                const isSelected = selectedTable === num;
                return (
                  <button
                    key={num}
                    onClick={() => setSelectedTable(num)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span>Mesa {num}</span>
                    <span className={`w-2 h-2 rounded-full ${count > 0 ? (isSelected ? 'bg-slate-950' : 'bg-amber-500') : 'bg-slate-300 dark:bg-slate-700'}`} />
                  </button>
                );
              })}
            </div>

            {/* Main Interactive Grid: Dishes (Left) + Ticket (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Dishes Grid (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="text-xs font-mono font-bold uppercase text-slate-400">
                  Carta / Selección Rápida para Mesa {selectedTable}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SIMULATOR_MENU.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleAddItem(item)}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/60 transition cursor-pointer flex items-center justify-between group"
                    >
                      <div className="space-y-1">
                        <div className="text-[11px] font-mono text-slate-600 dark:text-slate-300 uppercase">
                          {item.category}
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                          {item.name}
                        </div>
                        <div className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                          ${item.price.toLocaleString()}
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center transition">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Cart / Ticket (5 cols) */}
              <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      Comanda en Curso
                    </span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                    Mesa {selectedTable}
                  </span>
                </div>

                {currentCartEntries.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Mesa sin platos activos. Selecciona cualquier plato de la carta.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {currentCartEntries.map(([id, qty]) => {
                      const it = SIMULATOR_MENU.find(m => m.id === id);
                      if (!it) return null;
                      return (
                        <div key={id} className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">{it.name}</div>
                            <div className="text-[11px] font-mono text-slate-400">
                              ${it.price.toLocaleString()} c/u
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateQty(id, -1)}
                              className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono font-bold w-4 text-center text-slate-900 dark:text-white">
                              {qty}
                            </span>
                            <button
                              onClick={() => handleUpdateQty(id, 1)}
                              className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Subtotal & Totals */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500 font-mono">
                    <span>Base:</span>
                    <span>${rawSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-amber-600 dark:text-amber-400 font-mono">
                    <span>Servicio / Impuesto (8%):</span>
                    <span>${taxServiceAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span>Total Mesa:</span>
                    <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                      ${grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Operations Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    disabled={grandTotal === 0}
                    onClick={handleSendToKitchen}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-40 cursor-pointer"
                  >
                    <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                    <span>A Cocina</span>
                  </button>

                  <button
                    disabled={grandTotal === 0}
                    onClick={handleClearTable}
                    className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-40 cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Cobrar</span>
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 4. FOUR ARCHITECTURAL PILLARS */}
      <section className="py-20 lg:py-28 max-w-6xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <h2 className="text-3xl sm:text-4xl font-light text-slate-900 dark:text-white">
            Diseñado para la serenidad del servicio
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Cuatro pilares esenciales pensados para elevar los estándares culinarios y la rentabilidad del restaurante.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Control de Sala en Tiempo Real</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Visualización instantánea de cada rincón del comedor: tiempos de ocupación, mesas que solicitan la cuenta y rotación precisa para garantizar un servicio sin fricciones ni demoras.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <ChefHat className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pantallas de Cocina sin Papel</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Distribución de comandas por partidas (parrilla, fríos, repostería, bar). Semáforos visuales de cocción para que cada plato llegue a la mesa en su punto óptimo de temperatura.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Escandallos y Precisión de Insumos</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Fichas técnicas con descuento por porción exacta. Supervisión matemática de mermas y existencias críticas para blindar el margen de cada plato en la carta.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Análisis Financiero de Cada Servicio</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Métricas claras de consumo por mesa, platos estrella frente a platos de mayor margen, y arqueo exacto al cierre del turno para decisiones lúcidas y oportunas.
            </p>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE MARGIN & EFFICIENCY ESTIMATOR */}
      <section className="py-20 bg-slate-100/70 dark:bg-slate-900/50 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-light text-slate-900 dark:text-white">
              Simulador de Eficiencia Operativa
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Calcula cómo influyen el control milimétrico de mermas y la aceleración de comandas en el rendimiento mensual del restaurante.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white dark:bg-slate-950 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            
            {/* Sliders (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Slider 1: Mesas */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-400">Mesas en Salón:</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                    {estimatorTables} mesas
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="60"
                  step="1"
                  value={estimatorTables}
                  onChange={(e) => setEstimatorTables(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Slider 2: Ticket */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-400">Ticket Promedio:</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                    ${estimatorTicket.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="200000"
                  step="5000"
                  value={estimatorTicket}
                  onChange={(e) => setEstimatorTicket(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Slider 3: Rotación */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-400">Rotaciones Diarias por Mesa:</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                    {estimatorTurnover} turnos/día
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="0.5"
                  value={estimatorTurnover}
                  onChange={(e) => setEstimatorTurnover(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

            </div>

            {/* Calculations Result (6 cols) */}
            <div className="lg:col-span-6 bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <div className="text-[11px] font-mono uppercase text-slate-500 tracking-wider">
                  Beneficio Operativo Estimado
                </div>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-amber-600 dark:text-amber-400 mt-1">
                  +${totalBenefit.toLocaleString()}
                  <span className="text-xs font-sans text-slate-400 font-normal ml-2">/ mes</span>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-3 border-t border-slate-200 dark:border-slate-800 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Ahorro por escandallos y mermas:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    +${monthlyFoodWasteSavings.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Capacidad adicional por agilidad KDS:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    +${monthlyEfficiencyGain.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                  <span>Volumen mensual proyectado:</span>
                  <span className="font-mono text-slate-500">${monthlyRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. EDITORIAL PRINCIPLE */}
      <section className="py-20 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 space-y-6">
          <p className="text-xl sm:text-2xl font-light italic font-serif text-slate-800 dark:text-slate-200 leading-relaxed">
            "La tecnología en un gran restaurante debe ser invisible: imperceptible para el comensal, pero indispensable para la excelencia de la brigada."
          </p>
          <div className="text-xs font-mono tracking-widest text-amber-600 dark:text-amber-400 uppercase">
            MILENIA • Filosofía Gastronómica
          </div>
        </div>
      </section>

      {/* 7. MINIMALIST FOOTER */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono font-bold text-slate-800 dark:text-slate-200">
            <span className="tracking-widest">MILENIA</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-400 font-normal">Software Gastronómico</span>
          </div>

          {/* Navigation Links in Footer */}
          <div className="flex items-center gap-6 font-semibold text-slate-600 dark:text-slate-400">
            <button 
              onClick={handleNavInicio} 
              className="hover:text-amber-600 dark:hover:text-amber-400 transition cursor-pointer"
            >
              Inicio
            </button>
            <button 
              onClick={handleNavIngresar} 
              className="hover:text-amber-600 dark:hover:text-amber-400 transition cursor-pointer"
            >
              Ingresar
            </button>
            <button 
              onClick={handleNavContactos} 
              className="hover:text-amber-600 dark:hover:text-amber-400 transition cursor-pointer"
            >
              Contactos
            </button>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Hora local: {deviceTimeStr}</span>
            <span>•</span>
            <span>{isDarkMode ? 'Tema Nocturno' : 'Tema Diurno'}</span>
          </div>

          <div className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} MILENIA. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* Navigation Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenEmpleados={handleNavEmpleados}
        onLoginSuccess={onLoginSuccess}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      <EmpleadosModal
        isOpen={isEmpleadosOpen}
        onClose={() => setIsEmpleadosOpen(false)}
      />

    </div>
  );
};
