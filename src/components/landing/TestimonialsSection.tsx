import React from 'react';
import { Star, Quote, Building2, Utensils, MapPin } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'Gustavo Adolfo Pinzón',
      role: 'Propietario General',
      restaurant: 'Asadero & Carnes El Roble',
      city: 'Bogotá, D.C.',
      quote: 'Los fines de semana se nos perdían comandas de punta de anca y los clientes se quejaban. Con las pantallas KDS de Milenia en parrilla, el tiempo de entrega bajó de 35 a 16 minutos y el cierre de caja cuadra hasta el último peso.',
      rating: 5,
      impact: 'Rotación +40% los domingos'
    },
    {
      name: 'Marcela Henao',
      role: 'Gerente Administrativa',
      restaurant: 'Bistro & Café La 70',
      city: 'Medellín, Antioquia',
      quote: 'El tema de la facturación electrónica DIAN y el 8% de Impoconsumo nos quitaba horas con el contador. Milenia genera el reporte Z y los documentos electrónicos con código CUFE automáticamente. Es paz mental pura.',
      rating: 5,
      impact: '100% al día con la DIAN'
    },
    {
      name: 'Chef Julián Morales',
      role: 'Chef Ejecutivo & Socio',
      restaurant: 'Fuego & Mar Pescadería',
      city: 'Cartagena / Cali',
      quote: 'En pescados y mariscos, un gramo de más que sirvas es plata botada a la basura. Configurar los escandallos en Milenia nos permitió saber exactamente el costo de cada cazuela y langostino en tiempo real.',
      rating: 5,
      impact: 'Ahorro de $3.2M COP/mes en mermas'
    },
    {
      name: 'Carlos Arturo Barajas',
      role: 'Fundador',
      restaurant: 'Pizzería & Trattoria 1984',
      city: 'Bucaramanga, Santander',
      quote: 'No tuvimos que comprar computadores de $4 millones. Pusimos tablets Android sencillas en cocina y los meseros toman las órdenes desde sus teléfonos. El sistema es rápido, no se cuelga y el soporte por WhatsApp responde en minutos.',
      rating: 5,
      impact: 'Cero inversión en hardware costoso'
    }
  ];

  const categories = [
    'Asaderos & Carnes',
    'Pizzerías & Pastas',
    'Bares & Gastrobares',
    'Comidas Rápidas Gourmet',
    'Cafés & Panaderías',
    'Marisquerías & Típicos'
  ];

  return (
    <section id="testimonios" className="py-20 lg:py-28 bg-slate-900 border-t border-slate-800 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <span>Casos de Éxito en Colombia</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Más de 150 restaurantes confían su servicio diario a Milenia
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Historias reales de propietarios, administradores y chefs que recuperaron el control de su cocina y sus números.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-slate-950/80 border border-slate-800 p-6 sm:p-8 flex flex-col justify-between hover:border-slate-700 transition shadow-xl relative"
            >
              <div className="space-y-4">
                {/* Rating & Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {item.impact}
                  </span>
                </div>

                {/* Quote Text */}
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "{item.quote}"
                </p>
              </div>

              {/* Author & Restaurant info */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{item.name}</h4>
                  <p className="text-xs text-amber-400 font-medium">{item.restaurant}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{item.city}</span>
                  </p>
                </div>
                <Quote className="w-8 h-8 text-slate-800 shrink-0" />
              </div>
            </div>
          ))}
        </div>

        {/* Sectors ribbon */}
        <div className="mt-16 pt-10 border-t border-slate-800/80 text-center space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Adaptable a todos los formatos gastronómicos en Colombia
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto">
            {categories.map((cat, i) => (
              <span
                key={i}
                className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-850 text-xs font-semibold text-slate-300 shadow-sm"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
