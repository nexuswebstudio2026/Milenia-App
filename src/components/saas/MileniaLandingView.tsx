import React from 'react';
import { useTasty } from '../../context/TastyContext';
import { 
  Hammer, 
  Clock, 
  Sparkles, 
  Building2, 
  LogIn, 
  MessageSquare, 
  ShieldCheck, 
  Crown,
  ArrowRight
} from 'lucide-react';

export const MileniaLandingView: React.FC = () => {
  const { setMileniaView } = useTasty();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-8 sm:py-16 px-4">
      
      {/* Tarjeta Principal de Sitio en Construcción */}
      <div className="max-w-2xl w-full text-center space-y-8 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden">
        
        {/* Glow de fondo */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-16 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Badge de Estado */}
        <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold font-mono uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Sitio en Construcción</span>
        </div>

        {/* Ícono de Construcción */}
        <div className="relative z-10 w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
          <Hammer className="w-10 h-10 text-amber-400 animate-bounce" />
        </div>

        {/* Título y Mensaje Principal */}
        <div className="relative z-10 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Sitio en <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">Construcción</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
            Estamos optimizando la plataforma web principal de <strong className="text-amber-400">Milenia Gastronomía</strong>. Muy pronto tendrás acceso a nuevas experiencias y herramientas digitales.
          </p>
        </div>

        {/* Accesos Rápidos */}
        <div className="relative z-10 pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setMileniaView('login')}
            className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>Ingreso de Aliados</span>
          </button>

          <button
            onClick={() => setMileniaView('contactos')}
            className="px-5 py-3 bg-slate-800/90 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl border border-slate-700 flex items-center gap-2 transition cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>Contáctanos</span>
          </button>
        </div>

        {/* Pie de la tarjeta */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-center gap-2 text-slate-500 text-xs font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Milenia Cloud Platform &bull; Colombia</span>
        </div>

      </div>

    </div>
  );
};
