import React, { useState } from 'react';
import { UtensilsCrossed, PhoneCall, Sparkles, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';

interface LandingNavbarProps {
  onOpenDemoModal: () => void;
  onOpenWhatsApp: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  onOpenDemoModal,
  onOpenWhatsApp
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/25">
            <UtensilsCrossed className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight font-mono text-white">MILENIA</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                POS Gastro
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
              <span>Colombia</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                DIAN 8% Ready
              </span>
            </p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-300">
          <button onClick={() => scrollToSection('modulos')} className="hover:text-amber-400 transition cursor-pointer">
            Módulos
          </button>
          <button onClick={() => scrollToSection('simulador')} className="hover:text-amber-400 transition cursor-pointer flex items-center gap-1">
            <span>Simulador POS</span>
            <span className="px-1.5 py-0.5 text-[9px] bg-amber-500 text-slate-950 font-black rounded-md">VIVO</span>
          </button>
          <button onClick={() => scrollToSection('calculadora')} className="hover:text-amber-400 transition cursor-pointer">
            Calculadora Ahorro
          </button>
          <button onClick={() => scrollToSection('precios')} className="hover:text-amber-400 transition cursor-pointer">
            Planes & Precios
          </button>
          <button onClick={() => scrollToSection('testimonios')} className="hover:text-amber-400 transition cursor-pointer">
            Clientes
          </button>
          <button onClick={() => scrollToSection('faq')} className="hover:text-amber-400 transition cursor-pointer">
            Preguntas
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onOpenWhatsApp}
            className="py-2.5 px-3.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hablar con Asesor</span>
          </button>

          <button
            onClick={onOpenDemoModal}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Solicitar Demo Gratis</span>
          </button>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-5 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="grid gap-3 text-sm font-semibold text-slate-200">
            <button onClick={() => scrollToSection('modulos')} className="text-left py-2 hover:text-amber-400">
              Módulos del Sistema
            </button>
            <button onClick={() => scrollToSection('simulador')} className="text-left py-2 hover:text-amber-400 flex items-center justify-between">
              <span>Simulador POS Interactivo</span>
              <span className="px-2 py-0.5 text-[10px] bg-amber-500 text-slate-950 font-black rounded-md">VIVO</span>
            </button>
            <button onClick={() => scrollToSection('calculadora')} className="text-left py-2 hover:text-amber-400">
              Calculadora de Ahorro para Restaurantes
            </button>
            <button onClick={() => scrollToSection('precios')} className="text-left py-2 hover:text-amber-400">
              Planes & Precios (COP)
            </button>
            <button onClick={() => scrollToSection('testimonios')} className="text-left py-2 hover:text-amber-400">
              Casos de Éxito en Colombia
            </button>
            <button onClick={() => scrollToSection('faq')} className="text-left py-2 hover:text-amber-400">
              Preguntas Frecuentes
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDemoModal();
              }}
              className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Solicitar Demo Gratuita</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenWhatsApp();
              }}
              className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Contactar por WhatsApp (+57)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
