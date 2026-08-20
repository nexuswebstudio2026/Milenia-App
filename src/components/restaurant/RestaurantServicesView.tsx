import React from 'react';
import { useTasty } from '../../context/TastyContext';
import { 
  UtensilsCrossed, 
  CalendarCheck, 
  Truck, 
  Wine, 
  Sparkles, 
  Users, 
  PartyPopper, 
  ArrowRight, 
  Clock, 
  ShieldCheck,
  CheckCircle2,
  Store
} from 'lucide-react';

export const RestaurantServicesView: React.FC = () => {
  const { currentTenant, setTenantView } = useTasty();

  const services = [
    {
      id: 'dinein',
      title: 'Comedor & Experiencia en Salón',
      icon: UtensilsCrossed,
      color: 'from-amber-500 to-orange-600',
      badge: 'Atención en Mesa',
      desc: 'Disfruta de nuestros espacios diseñados para una experiencia gastronómica inmersiva con atención personalizada de nuestros meseros, toma de comanda digital y ambiente climatizado.',
      bullets: [
        `${currentTenant.tablesCount} mesas distribuidas en zonas principal, terraza y VIP`,
        'Carta digital QR interactiva con opciones de término y guarniciones',
        'División de cuentas y múltiples medios de pago (Nequi, Daviplata, Tarjetas, Efectivo)'
      ],
      actionText: 'Ver Carta de Platos',
      actionView: 'restaurant-platos' as const
    },
    {
      id: 'reservas',
      title: 'Reservas de Mesas & Ocasiones Especiales',
      icon: CalendarCheck,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Confirmación Inmediata',
      desc: 'Asegura tu mesa con antelación para almuerzos familiares, cenas románticas, aniversarios o reuniones de negocios con personalización de mesa.',
      bullets: [
        'Reserva desde 1 hasta 12 comensales sin costo adicional',
        'Atención especial a solicitudes dietarias y notas del cliente',
        'Recordatorio y seguimiento en tiempo real'
      ],
      actionText: 'Hacer una Reserva',
      actionView: 'restaurant-reservas' as const
    },
    {
      id: 'domicilios',
      title: 'Domicilios Express & Rastreo en Vivo',
      icon: Truck,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Entrega en 30-45 min',
      desc: 'Llevamos la calidad de nuestra cocina directamente a tu hogar u oficina con empaques térmicos biodegradables que conservan la temperatura y textura ideal.',
      bullets: [
        'Seguimiento GPS paso a paso desde el pase de cocina',
        'Factura electrónica DIAN adjunta a cada pedido',
        'Canal de comunicación directo con el repartidor asignado'
      ],
      actionText: 'Pedir a Domicilio',
      actionView: 'restaurant-platos' as const
    },
    {
      id: 'eventos',
      title: 'Eventos Privados & Cava Exclusiva',
      icon: Wine,
      color: 'from-purple-500 to-pink-600',
      badge: 'Experiencia VIP',
      desc: 'Ponemos a tu disposición nuestros salones privados, maridaje con sommelier y menús degustación personalizados para celebraciones y eventos corporativos.',
      bullets: [
        'Menús cerrados de 3 a 5 tiempos diseñados por el Chef',
        'Cava con etiquetas seleccionadas de vinos y coctelería de autor',
        'Montaje y sonido para presentaciones ejecutivas'
      ],
      actionText: 'Contactar para Evento',
      actionView: 'restaurant-reservas' as const
    }
  ];

  return (
    <div className="space-y-10 sm:space-y-14 py-2 sm:py-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-amber-950 text-white rounded-3xl p-6 sm:p-10 border border-amber-500/20 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
          <Store className="w-3.5 h-3.5" />
          <span>Servicios de {currentTenant.name}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          Nuestros Servicios Gastronómicos
        </h1>
        <p className="text-slate-300 text-xs sm:text-base max-w-2xl leading-relaxed">
          Descubre todas las formas en las que puedes disfrutar de nuestra carta, desde la atención en mesa hasta pedidos a domicilio y eventos privados.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {services.map((srv) => {
          const Icon = srv.icon;
          return (
            <div
              key={srv.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${srv.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700">
                    {srv.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                    {srv.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {srv.desc}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {srv.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setTenantView(srv.actionView)}
                  className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-800 dark:text-white font-black text-xs sm:text-sm rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>{srv.actionText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
