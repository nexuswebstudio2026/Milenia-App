import React, { useState } from 'react';
import { useTasty } from '../../context/TastyContext';
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
  X
} from 'lucide-react';

export const MileniaHeader: React.FC = () => {
  const { 
    mileniaView, 
    setMileniaView, 
    language, 
    setLanguage,
    tenants 
  } = useTasty();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              Plataforma Multi-Restaurante con POS, KDS y Facturación Electrónica DIAN
            </span>
            <span className="sm:hidden">
              Plataforma para Restaurantes en Colombia
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono opacity-90">
              {tenants.length} Aliados Activos
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

          {/* Center Navigation Tabs (Desktop) */}
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
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Restaurantes Aliados</span>
              <span className="bg-slate-900/10 dark:bg-white/20 text-[10px] px-1.5 py-0.2 rounded-full">
                {tenants.length}
              </span>
            </button>

            <button
              onClick={() => setMileniaView('login')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mileniaView === 'login'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-amber-500" />
              <span>Login & Panel</span>
            </button>

            <button
              onClick={() => setMileniaView('contactos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mileniaView === 'contactos'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Contactos</span>
            </button>

          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{language.toUpperCase()}</span>
            </button>

            {/* CTA Button */}
            <button
              onClick={() => setMileniaView('contactos')}
              className="hidden lg:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-sm transition cursor-pointer"
            >
              <span>Afiliar Restaurante</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

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
            <span>Restaurantes Aliados</span>
            <span className="text-xs bg-slate-900/10 dark:bg-white/20 px-2 py-0.5 rounded-full">
              {tenants.length}
            </span>
          </button>

          <button
            onClick={() => { setMileniaView('login'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              mileniaView === 'login' ? 'bg-amber-500 text-slate-950' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>Login & Panel de Aliados</span>
            <LogIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => { setMileniaView('contactos'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              mileniaView === 'contactos' ? 'bg-amber-500 text-slate-950' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>Contactos & Afiliaciones</span>
            <Phone className="w-4 h-4" />
          </button>
        </div>
      )}

    </header>
  );
};
