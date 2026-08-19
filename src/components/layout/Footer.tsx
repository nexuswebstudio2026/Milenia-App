import React from 'react';
import { useTasty, AppView } from '../../context/TastyContext';
import { MeniaLogo } from '../ui/MeniaLogo';
import { 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Heart, 
  ShieldCheck, 
  Award, 
  Truck, 
  UtensilsCrossed, 
  CalendarDays,
  Cloud,
  CheckCircle2
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView, selectedLocation, language, firebaseStatus } = useTasty();

  return (
    <footer id="laura-footer" className="bg-slate-950 dark:bg-black text-slate-300 border-t border-slate-800 mt-16 transition-colors duration-300">
      
      {/* Guarantees bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 border border-amber-500/20">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{language === 'es' ? 'Alta Gastronomía' : 'Haute Cuisine'}</h4>
                <p className="text-slate-400 mt-0.5">{language === 'es' ? 'Ingredientes DOP y técnicas de autor' : 'DOP ingredients & signature recipes'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 border border-amber-500/20">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{language === 'es' ? 'Entrega Térmica Express' : 'Thermal Delivery'}</h4>
                <p className="text-slate-400 mt-0.5">{language === 'es' ? 'Mantiene la temperatura de horno a mesa' : 'Hot & crispy straight from oven'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 border border-amber-500/20">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{language === 'es' ? 'Reservas Inmediatas' : 'Instant Booking'}</h4>
                <p className="text-slate-400 mt-0.5">{language === 'es' ? 'Mesa asegurada sin comisiones' : 'Guaranteed seating with 0 fees'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{language === 'es' ? 'Cloud Sync Activo' : 'Firebase Sync Active'}</h4>
                <p className="text-slate-400 mt-0.5">{language === 'es' ? 'Base de datos en tiempo real' : 'Real-time cloud database'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <button onClick={() => setCurrentView('menu')} className="cursor-pointer text-left">
              <MeniaLogo size="lg" />
            </button>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {language === 'es'
                ? "MILENIA - Plataforma y concepto gastronómico de alta cocina. Platos de autor, maridajes exclusivos, carnes maduradas y cava selecta para disfrutar en sala o a domicilio."
                : "MILENIA - Haute cuisine culinary platform and restaurant concept. Signature gastronomy, exclusive wine pairings, and premium cellar selections."}
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                <Cloud className="w-3.5 h-3.5 text-amber-400" />
                <span>Base de Datos: <strong className="text-emerald-400">Firebase Firestore</strong></span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1"></span>
              </div>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">{language === 'es' ? 'Explorar' : 'Explore'}</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentView('menu')} className="hover:text-amber-400 transition cursor-pointer">
                  {language === 'es' ? 'Carta MILENIA' : 'MILENIA Menu & Order'}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('reservations')} className="hover:text-amber-400 transition cursor-pointer">
                  {language === 'es' ? 'Reservar una Mesa' : 'Book a Table'}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('tracking')} className="hover:text-amber-400 transition cursor-pointer">
                  {language === 'es' ? 'Rastrear Mi Pedido' : 'Track Active Order'}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('locations')} className="hover:text-amber-400 transition cursor-pointer">
                  {language === 'es' ? 'Nuestras Sucursales' : 'Locations & Hours'}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('reviews')} className="hover:text-amber-400 transition cursor-pointer">
                  {language === 'es' ? 'Opiniones de Comensales' : 'Guest Reviews'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    const bannerBtn = document.getElementById('pwa-banner-install-btn') || document.getElementById('header-install-app-btn');
                    if (bannerBtn) bannerBtn.click();
                    else window.dispatchEvent(new CustomEvent('open-pwa-modal'));
                  }}
                  id="footer-install-pwa-btn"
                  className="text-amber-400 hover:text-amber-300 font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{language === 'es' ? 'Instalar App en este Dispositivo' : 'Install App on this Device'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">{language === 'es' ? 'Contacto' : 'Contact'}</h5>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{selectedLocation.address}, {selectedLocation.city}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <a href={`tel:${selectedLocation.phone}`} className="hover:text-amber-400 transition">{selectedLocation.phone}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <a href={`mailto:${selectedLocation.email}`} className="hover:text-amber-400 transition">{selectedLocation.email}</a>
              </li>
            </ul>
          </div>

          {/* Staff Access */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">{language === 'es' ? 'Gestión' : 'Management'}</h5>
            <p className="text-[11px] text-slate-400">
              {language === 'es' ? 'Acceso al Kitchen Display System (KDS) y control de carta para el equipo del restaurante.' : 'Kitchen Display System & menu stock manager for staff.'}
            </p>
            <button
              onClick={() => setCurrentView('admin')}
              id="footer-admin-link-btn"
              className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>{language === 'es' ? 'Acceso KDS Staff' : 'Staff KDS Portal'}</span>
            </button>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} MILENIA Restaurant Platform. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Privacidad</span>
            <span>Términos</span>
            <span>Alérgenos</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
