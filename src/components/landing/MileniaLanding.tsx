import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Clock, 
  Utensils, 
  ChefHat, 
  Layers, 
  TrendingUp, 
  SlidersHorizontal,
  Home, 
  LogIn, 
  Mail, 
  Menu, 
  X 
} from 'lucide-react';
import { LoginModal } from '../auth/LoginModal';
import { ContactModal } from '../contact/ContactModal';
import { Empleado } from '../../types/empleado';
import { WorkstationOption } from '../../services/empleadosService';

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
  // Navigation & Modals State
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavInicio = () => {
    setIsLoginOpen(false);
    setIsContactOpen(false);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavIngresar = () => {
    setIsContactOpen(false);
    setIsLoginOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleNavContactos = () => {
    setIsLoginOpen(false);
    setIsContactOpen(true);
    setIsMobileMenuOpen(false);
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
            {/* Time & Day/Night Mode Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              {/* Digital Clock Display */}
              <div 
                id="header-live-clock"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold text-slate-800 dark:text-slate-200"
                title="Hora local del sistema"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{deviceTimeStr}</span>
              </div>

              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />

              {/* Mode Toggle Button */}
              <button
                id="header-theme-toggle-btn"
                onClick={onToggleTheme}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                title={`Modo actual: ${isDarkMode ? 'Noche' : 'Día'}. Clic para alternar`}
                aria-label="Alternar Modo Día / Noche"
              >
                {isDarkMode ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30 shrink-0" />
                    <span className="text-xs font-semibold">Noche</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-600 fill-amber-500/30 shrink-0" />
                    <span className="text-xs font-semibold">Día</span>
                  </>
                )}
              </button>
            </div>

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

      {/* 3. FOUR ARCHITECTURAL PILLARS */}
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

      {/* 4. EDITORIAL PRINCIPLE */}
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
        onLoginSuccess={onLoginSuccess}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

    </div>
  );
};
