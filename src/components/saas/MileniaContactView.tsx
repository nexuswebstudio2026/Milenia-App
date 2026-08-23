import React, { useState } from 'react';
import { useTasty } from '../../context/TastyContext';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Building2, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const MileniaContactView: React.FC = () => {
  const [formSent, setFormSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    restaurantName: '',
    city: 'Bogotá D.C.',
    phone: '',
    email: '',
    tablesCount: '10-20',
    planInterest: 'pro',
    message: ''
  });

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
  };

  const faqs = [
    {
      q: '¿Cómo obtiene mi restaurante su propia URL e ID?',
      a: 'Al afiliarte, se te asigna inmediatamente un identificador único (ej. ID #5) y tu enlace milenia.app/5 con carta digital, módulo de domicilios, reservas y terminal de meseros.'
    },
    {
      q: '¿Milenia cumple con la Facturación Electrónica y el Impoconsumo de la DIAN?',
      a: 'Sí, Milenia está 100% adaptado a la normativa colombiana con cálculo automático del 8% de Impoconsumo, 10% de propina sugerida voluntaria y generación de comprobantes fiscales.'
    },
    {
      q: '¿Qué hardware necesito para el POS y KDS?',
      a: 'Milenia funciona en cualquier dispositivo con navegador web: celulares de meseros (Android / iOS), tablets en barra, pantallas táctiles en cocina para KDS e impresoras térmicas de 58mm y 80mm.'
    },
    {
      q: '¿Hay cobro de comisiones por cada pedido o reserva?',
      a: 'No cobramos comisión porcentual por venta. Operamos bajo suscripción fija mensual en Pesos Colombianos (COP) para que mantengas el 100% de tu margen.'
    }
  ];

  return (
    <div className="space-y-12 sm:space-y-16 py-4">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-amber-950 text-white rounded-3xl p-6 sm:p-10 border border-amber-500/20 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
          <Phone className="w-3.5 h-3.5" />
          <span>Atención Comercial & Soporte Colombia</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          Contáctanos & Afilia tu Restaurante
        </h1>
        <p className="text-slate-300 text-xs sm:text-base max-w-2xl leading-relaxed">
          Estamos listos para transformar la experiencia gastronómica y operativa de tu negocio en cualquier ciudad de Colombia.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Solicitar Demostración o Afiliación
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Completa los datos de tu restaurante y un asesor gastronómico te contactará en menos de 15 minutos.
            </p>
          </div>

          {formSent ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-emerald-800 dark:text-emerald-300">
                ¡Solicitud Recibida con Éxito!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Hemos asignado tu solicitud a nuestro equipo en {formData.city}. Te enviaremos las credenciales de prueba y la propuesta a tu WhatsApp o correo.
              </p>
              <button
                onClick={() => setFormSent(false)}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tu Nombre y Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Restrepo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre del Restaurante *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Fuego & Carbón Bistro"
                    value={formData.restaurantName}
                    onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ciudad *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                  >
                    <option value="Pasto">Pasto (Nariño)</option>
                    <option value="Bogotá D.C.">Bogotá D.C.</option>
                    <option value="Medellín">Medellín</option>
                    <option value="Cali">Cali</option>
                    <option value="Cartagena">Cartagena</option>
                    <option value="Barranquilla">Barranquilla</option>
                    <option value="Bucaramanga">Bucaramanga</option>
                    <option value="Otra ciudad">Otra ciudad de Colombia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp o Celular *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+57 304-347-0984"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="nexuswebstudio2026@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Plan de Interés
                  </label>
                  <select
                    value={formData.planInterest}
                    onChange={(e) => setFormData({ ...formData, planInterest: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                  >
                    <option value="basic">Básico ($149.000 COP) - Hasta 12 mesas</option>
                    <option value="pro">Pro ($289.000 COP) - Mesas + KDS Cocina</option>
                    <option value="enterprise">Enterprise ($499.000 COP) - Múltiples salones</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mensaje o Requerimientos Particulares
                </label>
                <textarea
                  rows={3}
                  placeholder="Cuéntanos sobre tu menú, cantidad de sedes o necesidades de facturación..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Solicitud de Afiliación</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Physical Offices & Direct Channels */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Direct WhatsApp Box */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black">
                💬
              </div>
              <div>
                <h3 className="font-black text-sm text-emerald-900 dark:text-emerald-300">
                  Línea WhatsApp de Ventas
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Respuesta inmediata de lunes a domingo de 7:00 AM a 11:00 PM
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/573043470984"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition cursor-pointer shadow-xs"
            >
              Contactar por WhatsApp (+57 304-347-0984)
            </a>
          </div>

          {/* Contacto Directo Telefónico y Email */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  Línea Directa de Llamadas
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Atención comercial y soporte telefónico
                </p>
              </div>
            </div>
            <div className="space-y-2 pt-1">
              <a
                href="tel:+573043470984"
                className="block text-center py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
              >
                Llamar a Línea Comercial: 304-347-0984
              </a>
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <a href="mailto:nexuswebstudio2026@gmail.com" className="hover:text-amber-500 transition font-medium">
                  nexuswebstudio2026@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Sedes Colombia */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              <span>Sedes & Oficinas en Colombia</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              
              {/* Sede Pasto - Nariño */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Pasto - Nariño</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-black uppercase font-mono">
                    Sede Comercial
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300">
                  Pasto, Nariño - Colombia
                </div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">
                  Tel: +57 304-347-0984 &bull; nexuswebstudio2026@gmail.com
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Bogotá D.C. (Sede Principal)</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">Zona Financiera</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Cra. 7 # 71-21, Torre B, Piso 14
                </div>
                <div className="text-[10px] text-slate-400">PBX: +57 304-347-0984</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Medellín</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">El Poblado</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Cl. 10 # 43E-12, Hub Gastronómico
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Cali</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">Granada</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Av. 9N # 14-30, Piso 3
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* FAQs Section */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-500" />
            <span>Preguntas Frecuentes sobre la Afiliación</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Todo lo que necesitas saber para operar tu restaurante bajo la plataforma Milenia SaaS.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-4 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {openFaq === idx && (
                <div className="p-4 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
