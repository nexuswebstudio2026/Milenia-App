import React from 'react';
import { Sparkles, ShieldCheck, CheckCircle, ArrowRight, Zap, Play, Store, Flame, TrendingUp } from 'lucide-react';
import { InteractivePosSimulator } from './InteractivePosSimulator';

interface HeroSectionProps {
  onOpenDemoModal: () => void;
  onOpenWhatsApp: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenDemoModal,
  onOpenWhatsApp
}) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Subtle radial glow background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Value Proposition & CTAs (7 cols) */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Tag badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-inner">
              <span className="text-base">🇨🇴</span>
              <span>El Software Gastronómico #1 para Restaurantes y Asaderos</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
              Controla tus mesas, cocina y facturación DIAN <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">sin fugas de dinero</span>.
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              Toma pedidos en segundos desde celulares o tablets, despacha comandas a pantallas KDS sin papel, calcula el <strong>Impoconsumo del 8%</strong> al centavo y vigila cada gramo de tu inventario en tiempo real.
            </p>

            {/* Key benefits checkmarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs sm:text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Facturación electrónica DIAN lista</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>KDS Cocina con semáforo de tiempos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Funciona en cualquier celular o tablet</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Recetas estándar y control de mermas</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onOpenDemoModal}
                className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm transition flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Comenzar Prueba Gratis (14 Días)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('simulador');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-3.5 px-5 rounded-2xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 text-amber-400" />
                <span>Probar Simulador en Vivo</span>
              </button>
            </div>

            {/* Social Proof metrics */}
            <div className="pt-6 border-t border-slate-800/90 grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">+150</p>
                <p className="text-[11px] text-slate-400 font-medium">Restaurantes aliados en Colombia</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-tight">-35%</p>
                <p className="text-[11px] text-slate-400 font-medium">Menos mermas y comida desperdiciada</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black font-mono text-amber-400 tracking-tight">18 min</p>
                <p className="text-[11px] text-slate-400 font-medium">Más rápida la rotación de mesas</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Live App Mockup (6 cols) */}
          <div id="simulador" className="lg:col-span-6 relative">
            <InteractivePosSimulator />
          </div>

        </div>
      </div>
    </section>
  );
};
