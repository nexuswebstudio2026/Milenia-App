import React from 'react';
import { UtensilsCrossed, PhoneCall, ShieldCheck, Heart, MapPin, Mail } from 'lucide-react';

interface LandingFooterProps {
  onOpenDemoModal: () => void;
  onOpenWhatsApp: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  onOpenDemoModal,
  onOpenWhatsApp
}) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Top row: Brand & CTA banner */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-orange-500/10 border border-amber-500/20">
          <div className="text-center lg:text-left space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-white">
              ¿Listo para modernizar el servicio de tu restaurante?
            </h3>
            <p className="text-xs text-slate-400">
              Prueba Milenia durante 14 días sin costo y comprueba la diferencia en cocina y caja.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <button
              onClick={onOpenWhatsApp}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition border border-slate-700"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Directo (+57)</span>
            </button>

            <button
              onClick={onOpenDemoModal}
              className="py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer transition shadow-lg shadow-amber-500/20"
            >
              <span>Agendar Demo Gratis</span>
            </button>
          </div>
        </div>

        {/* Middle row: Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight font-mono text-white">MILENIA</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Software gastronómico inteligente y punto de venta POS desarrollado en Colombia para el sector restaurantero.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cumplimiento DIAN & Impoconsumo 8%</span>
            </div>
          </div>

          {/* Col 2: Módulos */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider font-mono">
              Módulos del Sistema
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li><a href="#modulos" className="hover:text-amber-400 transition">POS Móvil & Comanderas</a></li>
              <li><a href="#modulos" className="hover:text-amber-400 transition">Pantalla KDS de Cocina</a></li>
              <li><a href="#modulos" className="hover:text-amber-400 transition">Facturación Electrónica DIAN</a></li>
              <li><a href="#modulos" className="hover:text-amber-400 transition">Control de Insumos & Recetas</a></li>
              <li><a href="#modulos" className="hover:text-amber-400 transition">Menú Digital QR sin Comisiones</a></li>
            </ul>
          </div>

          {/* Col 3: Cobertura Nacional */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider font-mono">
              Cobertura en Colombia
            </h4>
            <div className="grid grid-cols-2 gap-1 text-xs text-slate-400">
              <span>Bogotá D.C.</span>
              <span>Medellín</span>
              <span>Cali</span>
              <span>Barranquilla</span>
              <span>Bucaramanga</span>
              <span>Cartagena</span>
              <span>Pereira</span>
              <span>Manizales</span>
            </div>
          </div>

          {/* Col 4: Contacto */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider font-mono">
              Atención & Soporte
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-mono text-white">+57 304 347 0984</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>contacto@milenia-pos.co</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Lunes a Domingo: 8:00 AM - 11:00 PM (Turnos de servicio activo)
              </p>
            </div>
          </div>
        </div>

        {/* Bottom row: Legal & Copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} MILENIA Gastro POS. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Términos de Servicio</span>
            <span className="hover:text-slate-400 cursor-pointer">Política de Privacidad</span>
            <span className="hover:text-slate-400 cursor-pointer">Habeas Data</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
