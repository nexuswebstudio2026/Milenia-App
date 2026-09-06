import React, { useState } from 'react';
import { Check, Sparkles, HelpCircle, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

interface PricingSectionProps {
  onOpenDemoModal: () => void;
  onOpenWhatsApp: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onOpenDemoModal,
  onOpenWhatsApp
}) => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      id: 'emprendedor',
      name: 'Plan Emprendedor',
      subtitle: 'Ideal para Cafés, Bares y Food Trucks en crecimiento',
      monthlyPrice: 149000,
      annualMonthlyPrice: 124000,
      popular: false,
      features: [
        '1 Punto de venta POS táctil',
        'Hasta 15 mesas configuradas',
        'Toma de comandas y pedidos',
        'Facturación POS y Cierre Z diario',
        'Soporte por WhatsApp en horario laboral',
        'Backups automáticos en la nube'
      ],
      buttonText: 'Empezar con Emprendedor',
      badge: null
    },
    {
      id: 'pro',
      name: 'Plan Restaurante Pro',
      subtitle: 'El favorito de Asaderos, Pizzerías y Restaurantes de alto tráfico',
      monthlyPrice: 279000,
      annualMonthlyPrice: 229000,
      popular: true,
      features: [
        'Mesas y comanderas móviles ilimitadas (celulares)',
        'Pantalla KDS de Cocina en tiempo real con semáforo',
        'Facturación Electrónica DIAN & Impoconsumo 8%',
        'Escandallos y descuento de inventario por gramaje',
        'Menú Digital QR con pedidos a WhatsApp',
        'Reportes de rentabilidad y mesero estrella',
        'Soporte VIP 24/7 para turnos nocturnos',
        'Capacitación completa de tu equipo sin costo'
      ],
      buttonText: 'Elegir Plan Pro',
      badge: 'MÁS ELEGIDO EN COLOMBIA'
    },
    {
      id: 'multisede',
      name: 'Plan Franquicia & Multi-Sede',
      subtitle: 'Para grupos gastronómicos con 2 o más sucursales',
      monthlyPrice: 480000,
      annualMonthlyPrice: 399000,
      popular: false,
      features: [
        'Hasta 3 sedes incluidas con gestión centralizada',
        'Bodega central y traslado de insumos entre sedes',
        'Consolidado financiero y analítica comparativa',
        'Roles y permisos avanzados de administradores',
        'Capacitación presencial / personalizada',
        'Gerente de cuenta exclusivo y SLA prioritario',
        'Soporte DIAN multi-empresa o multi-RUT'
      ],
      buttonText: 'Contactar Especialista',
      badge: null
    }
  ];

  return (
    <section id="precios" className="py-20 lg:py-28 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <span>Precios Transparentes en COP</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Sin costos ocultos ni letras pequeñas
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Paga en pesos colombianos por lo que realmente usas. Incluye actualizaciones periódicas y respaldo en la nube.
          </p>

          {/* Billing Switcher */}
          <div className="inline-flex items-center gap-3 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold mt-4">
            <button
              onClick={() => setIsAnnual(false)}
              className={`py-2 px-4 rounded-xl transition cursor-pointer ${
                !isAnnual
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pago Mensual
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`py-2 px-4 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                isAnnual
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Pago Anual</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                2 MESES GRATIS
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map(plan => {
            const displayPrice = isAnnual ? plan.annualMonthlyPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative transition-all duration-200 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500 shadow-2xl shadow-amber-500/10 lg:-translate-y-2'
                    : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] uppercase tracking-wider py-1 px-3.5 rounded-full shadow-lg">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{plan.subtitle}</p>
                  </div>

                  {/* Price */}
                  <div className="pb-6 border-b border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-slate-400 font-mono">COP</span>
                      <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                        ${displayPrice.toLocaleString('es-CO')}
                      </span>
                      <span className="text-xs text-slate-400">/mes</span>
                    </div>
                    {isAnnual && (
                      <p className="text-[11px] text-emerald-400 font-medium mt-1">
                        Facturado anualmente (Ahorro de más de ${(plan.monthlyPrice * 2).toLocaleString('es-CO')} COP)
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Incluye todo esto:
                    </p>
                    <ul className="space-y-2.5">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA button */}
                <div className="pt-8">
                  <button
                    onClick={plan.id === 'multisede' ? onOpenWhatsApp : onOpenDemoModal}
                    className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      plan.popular
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    <span>{plan.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom guarantee trust banner */}
        <div className="mt-14 max-w-2xl mx-auto text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Garantía de Satisfacción de 30 Días</span>
          </div>
          <p className="text-xs text-slate-400">
            Prueba Milenia en tu restaurante sin ningún riesgo. Si no acelera tus tiempos de mesa o no te ahorra dinero, te devolvemos el 100% de tu dinero de inmediato.
          </p>
        </div>

      </div>
    </section>
  );
};
