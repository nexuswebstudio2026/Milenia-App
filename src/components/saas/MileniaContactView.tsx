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
  const { setMileniaView } = useTasty();
  const [formSent, setFormSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    restaurantName: '',
    city: 'Pasto',
    phone: '',
    email: '',
    tablesCount: '10-20',
    systemType: 'Suite Integral Milenia (POS + KDS + Reservas + Domicilios)',
    planInterest: 'plan_maximo',
    message: ''
  });

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const planOptions = [
    { id: 'plan_maximo', name: 'Plan Máximo Integral Milenia ($600.000 COP/mes)', detail: 'Acceso Total: Mesas ilimitadas + KDS Cocina + POS Táctil + Facturación DIAN + Menú QR + Domicilios' },
    { id: 'plan_pro', name: 'Plan Pro Gastronómico ($389.000 COP/mes)', detail: 'Hasta 20 mesas + POS + KDS Cocina + Domicilios' },
    { id: 'plan_basico', name: 'Plan Básico ($199.000 COP/mes)', detail: 'Hasta 12 mesas + Terminal POS' }
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
    const planLabel = planObj ? planObj.name : 'Plan Máximo Integral Milenia ($600.000 COP/mes)';
    const restaurant = formData.restaurantName.trim() || 'Mi Restaurante';
    const contactName = formData.name.trim() || 'Aliado Gastronómico';
    const city = formData.city || 'Pasto';
    const system = formData.systemType || 'Suite Integral Milenia (POS + KDS + Reservas + Domicilios)';
    const userPhone = formData.phone.trim();
    const email = formData.email.trim();
    const userMessage = formData.message.trim();

    let messageText = `¡Hola Milenia! 👋\n\n` +
      `Solicito información y demostración para afiliar mi restaurante con el Plan Máximo ($600.000 COP):\n\n` +
      `👤 *Nombre:* ${contactName}\n` +
      `🏪 *Restaurante:* ${restaurant}\n` +
      `📍 *Ciudad:* ${city}\n` +
      (userPhone ? `📱 *WhatsApp/Celular:* ${userPhone}\n` : '') +
      (email ? `✉️ *Correo Electrónico:* ${email}\n` : '') +
      `\n⚙️ *SISTEMA REQUERIDO:*\n👉 ${system}\n\n` +
      `⭐ *PLAN SELECCIONADO:*\n👉 ${planLabel}\n\n` +
      (userMessage ? `📝 *Requerimientos / Mensaje:* ${userMessage}\n\n` : '') +
      `He sido redirigido al módulo de registro y activación de aliados para completar el formulario. ¡Muchas gracias!`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    // 1. Enviar automáticamente a WhatsApp de Milenia con todos los datos diligenciados
    const waUrl = generateWhatsAppUrl();
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // 2. Redirigir automáticamente a la opción de Ingreso de Aliados -> Registrar Aliado
    sessionStorage.setItem('milenia_auto_tab', 'register_ally');
    setTimeout(() => {
      setMileniaView('login');
    }, 400);
  };

  const faqs = [
    {
      q: '¿Qué incluye el Plan Máximo de $600.000 COP/mes?',
      a: 'El Plan Máximo es la solución integral más completa de Milenia: incluye terminal POS táctil ilimitado, pantallas KDS en cocina en tiempo real, menú interactivo con código QR, módulo de pedidos y domicilios en línea, sistema de reservas digitales, facturación electrónica con 8% de Impoconsumo DIAN, control de stock con deducción automática de ingredientes, multi-usuario para todo el equipo (gerente, cajeros, meseros y cocineros) y soporte prioritario 24/7.'
    },
    {
      q: '¿Cómo obtiene mi restaurante su propia URL e ID independiente?',
      a: `Al registrar y activar tu restaurante aliado, la plataforma le asigna automáticamente un ID único en la nube (ejemplo: ID #5) y su subdominio o enlace web ${domain}/5 para que tus comensales exploren la carta digital, pidan a domicilio o reserven mesas en línea.`
    },
    {
      q: '¿Milenia cumple con la Facturación Electrónica y el Impoconsumo de la DIAN?',
      a: 'Sí, Milenia está 100% adaptado a la legislación fiscal colombiana. Aplica automáticamente el 8% de Impoconsumo, la propina voluntaria sugerida del 10%, control de consecutivos de resolución DIAN, prefijos autorizados y discriminación de impuestos en tickets de 58mm y 80mm.'
    },
    {
      q: '¿Qué dispositivos o hardware necesito para que el restaurante funcione?',
      a: 'Milenia es una plataforma Cloud que funciona en cualquier dispositivo moderno con navegador web: celulares de meseros (Android / iOS), tablets en la barra o recepción, pantallas táctiles o monitores en cocina para el KDS e impresoras térmicas ESC/POS estándar de 58mm o 80mm.'
    },
    {
      q: '¿Hay cobro de comisiones por cada pedido, plato o reserva vendida?',
      a: 'No cobramos ninguna comisión porcentual por venta ni intermediación. Pagas una suscripción fija mensual en Pesos Colombianos (COP) para que mantengas el 100% de tu margen de ganancia operativa.'
    },
    {
      q: '¿Cómo funciona la activación de un nuevo restaurante aliado con comprobante?',
      a: 'El proceso es 100% digital: subes el RUT de tu empresa, realizas el pago a través de Daviplata, Nequi o Bancolombia, y adjuntas el comprobante. Nuestro motor de Inteligencia Artificial Gemini analiza el documento, transcribe la referencia y activa tu cuenta de forma instantánea.'
    },
    {
      q: '¿Puedo crear usuarios con diferentes permisos (Cajeros, Cocina, Meseros, Gerente)?',
      a: 'Sí. Milenia cuenta con control de accesos basado en roles (RBAC). Puedes registrar a tus meseros con acceso exclusivo a comandas, cajeros con arqueos y cobros DIAN, cocineros en la pantalla KDS y gerentes con acceso a métricas completas e inventario.'
    },
    {
      q: '¿El inventario se descuenta automáticamente con cada orden despachada?',
      a: 'Sí. Cada plato configurado descuenta automáticamente las porciones e ingredientes asociados del inventario del restaurante en tiempo real cuando se confirma o factura el pedido en cocina.'
    },
    {
      q: '¿Qué métodos de pago pueden usar mis comensales?',
      a: 'Milenia soporta múltiples métodos de pago integrados: efectivo, datáfono / tarjetas, transferencias Nequi, Daviplata, Bancolombia y pagos en línea mediante pasarela segura Wompi (Bancolombia).'
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

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-900/30 transition cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <span className="text-base">💬</span>
                  <span>Enviar por WhatsApp (+57 304-347-0984)</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Beneficios de Afiliación & Soporte Directo */}
        <div className="lg:col-span-5 space-y-6">

          {/* Tarjeta de Soporte Oficial */}
          <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shrink-0 shadow-md shadow-amber-500/20">
                ⭐
              </div>
              <div>
                <h3 className="font-black text-base text-white">
                  Afiliación Inmediata Milenia
                </h3>
                <p className="text-xs text-amber-400 font-medium">
                  Plan Máximo Integral &bull; $600.000 COP / mes
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Al enviar tu requerimiento por WhatsApp serás redirigido instantáneamente al formulario de registro y activación de aliados para configurar tu menú, salones y métodos de pago.
            </p>

            <div className="space-y-2.5 pt-2 text-xs border-t border-slate-800">
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sin contratos de permanencia obligatoria</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>0% de comisiones por pedidos o reservas</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Activación con IA Gemini y comprobante digital</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Atención técnica y comercial los 7 días de la semana</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem('milenia_auto_tab', 'register_ally');
                  setMileniaView('login');
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-2xl transition cursor-pointer shadow-lg shadow-amber-500/20 text-center flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ir Directo a Registrar Aliado</span>
              </button>
            </div>
          </div>

          {/* Resumen de Canales Digitales */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Garantía & Seguridad Milenia Cloud</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Toda la información operativa de tu restaurante, comandas, comensales e inventarios está protegida en tiempo real con alta disponibilidad y respaldos automatizados.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Soporte Digital Activo: Lun a Dom 7:00 AM - 11:00 PM</span>
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
