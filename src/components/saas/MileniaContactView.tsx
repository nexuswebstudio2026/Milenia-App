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
  ChevronUp,
  Cpu,
  Layers,
  Check
} from 'lucide-react';
import { useCurrentDomain } from '../../utils/domainHelper';

export const MileniaContactView: React.FC = () => {
  const { domain, getTenantDisplayUrl } = useCurrentDomain();
  const [formSent, setFormSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    restaurantName: '',
    city: 'Pasto',
    phone: '',
    email: '',
    tablesCount: '10-20',
    systemType: 'Suite Integral Milenia (POS + KDS + Reservas + Domicilios)',
    planInterest: 'pro',
    message: ''
  });

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const planOptions = [
    { id: 'basic', name: 'Plan Básico ($149.000 COP/mes)', detail: 'Hasta 12 mesas + POS' },
    { id: 'pro', name: 'Plan Pro ($289.000 COP/mes)', detail: 'Mesas + KDS Cocina + Domicilios' },
    { id: 'enterprise', name: 'Plan Enterprise ($499.000 COP/mes)', detail: 'Múltiples salones + Facturación DIAN' },
    { id: 'custom', name: 'Plan Personalizado / Multi-Sede', detail: 'Cadena de restaurantes' }
  ];

  const systemOptions = [
    'Suite Integral Milenia (POS + KDS + Reservas + Domicilios)',
    'POS Táctil + Comandera Móvil para Meseros',
    'KDS Pantalla de Cocina en Tiempo Real',
    'Menú Digital QR + Domicilios Online',
    'Sistema de Reservas y Gestión de Salón',
    'Facturación Electrónica DIAN + Control de Caja e Inventario'
  ];

  const generateWhatsAppUrl = () => {
    const phone = '573043470984';
    const planObj = planOptions.find(p => p.id === formData.planInterest);
    const planLabel = planObj ? planObj.name : 'Plan Pro ($289.000 COP/mes)';
    const restaurant = formData.restaurantName.trim() || 'Mi Restaurante';
    const contactName = formData.name.trim() || 'un Aliado Gastronómico';
    const city = formData.city || 'Pasto';
    const system = formData.systemType || 'Suite Integral Milenia (POS + KDS + Reservas + Domicilios)';

    let messageText = `¡Hola Milenia! 👋\n\n` +
      `Mi nombre es *${contactName}* del restaurante *${restaurant}* en *${city}*.\n\n` +
      `📌 *SISTEMA QUE NECESITO:* \n👉 ${system}\n\n` +
      `⭐ *PLAN QUE NECESITO:* \n👉 ${planLabel}\n\n` +
      (formData.tablesCount ? `🪑 *Capacidad:* ${formData.tablesCount} mesas\n` : '') +
      (formData.phone ? `📱 *Teléfono:* ${formData.phone}\n` : '') +
      (formData.message.trim() ? `📝 *Requerimientos:* ${formData.message.trim()}\n\n` : '\n') +
      `Solicito asesoría comercial y demostración en vivo. ¡Muchas gracias!`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    // Enviar automáticamente a WhatsApp con todos los datos seleccionados
    const waUrl = generateWhatsAppUrl();
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const faqs = [
    {
      q: '¿Cómo obtiene mi restaurante su propia URL e ID?',
      a: `Al afiliarte, se te asigna inmediatamente un identificador único (ej. ID #5) y tu enlace ${domain}/5 con carta digital, módulo de domicilios, reservas y terminal de meseros.`
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
              Completa los datos de tu restaurante o envíalos al instante vía WhatsApp con el sistema y plan configurados.
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
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition flex items-center gap-2"
                >
                  <span>Abrir Conversación en WhatsApp</span>
                </a>
                <button
                  onClick={() => setFormSent(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-300"
                >
                  Enviar otro formulario
                </button>
              </div>
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

                {/* Selector de Sistema que Necesita */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-amber-500" />
                    <span>Sistema que Necesitas *</span>
                  </label>
                  <select
                    value={formData.systemType}
                    onChange={(e) => setFormData({ ...formData, systemType: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-amber-500/40 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-amber-500"
                  >
                    {systemOptions.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Selector de Plan que Necesita */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                    <span>Plan que Necesitas *</span>
                  </label>
                  <select
                    value={formData.planInterest}
                    onChange={(e) => setFormData({ ...formData, planInterest: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-amber-500/40 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-amber-500"
                  >
                    {planOptions.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
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
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mensaje o Requerimientos Particulares
                </label>
                <textarea
                  rows={2}
                  placeholder="Cuéntanos sobre tu menú, cantidad de sedes o necesidades de facturación..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Formulario</span>
                </button>

                <a
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>💬 Enviar por WhatsApp</span>
                </a>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Physical Offices & Direct Channels */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Direct WhatsApp Box with Automatic System & Plan message */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl font-black shrink-0">
                💬
              </div>
              <div>
                <h3 className="font-black text-sm text-emerald-950 dark:text-emerald-300">
                  Línea WhatsApp de Ventas
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Respuesta inmediata de lunes a domingo de 7:00 AM a 11:00 PM
                </p>
              </div>
            </div>

            {/* Quick config for instant WhatsApp click */}
            <div className="p-3.5 rounded-2xl bg-slate-950/40 dark:bg-slate-950/70 border border-emerald-500/20 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-emerald-400 font-bold text-[11px]">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Mensaje Automático Pre-Cargado
                </span>
                <span className="font-mono text-[10px] text-slate-400">Auto-Generado</span>
              </div>

              {/* Mini Selector Sistema */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Sistema Seleccionado:
                </span>
                <select
                  value={formData.systemType}
                  onChange={(e) => setFormData({ ...formData, systemType: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  {systemOptions.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Mini Selector Plan */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Plan Requerido:
                </span>
                <select
                  value={formData.planInterest}
                  onChange={(e) => setFormData({ ...formData, planInterest: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  {planOptions.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Vista previa del mensaje */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 font-mono space-y-1 leading-tight">
                <div className="text-[10px] text-emerald-400 font-bold">Vista previa de tu mensaje:</div>
                <div className="text-slate-400 truncate">
                  "¡Hola! Solicito: *{formData.systemType.split('(')[0].trim()}* + *{planOptions.find(p=>p.id===formData.planInterest)?.name.split('(')[0].trim()}* en Pasto..."
                </div>
              </div>
            </div>

            {/* Direct Send to WhatsApp Link Button */}
            <a
              href={generateWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm rounded-2xl transition cursor-pointer shadow-lg shadow-emerald-900/20 active:scale-[0.99]"
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
