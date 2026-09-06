import React from 'react';
import { 
  UtensilsCrossed, 
  ChefHat, 
  Receipt, 
  PackageCheck, 
  QrCode, 
  BarChart3, 
  Smartphone, 
  ShieldCheck, 
  Zap,
  Clock,
  Coins
} from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const modules = [
    {
      id: 'pos',
      icon: UtensilsCrossed,
      tag: 'Punto de Venta Rápido',
      title: 'POS Móvil & Control de Mesas en Vivo',
      description: 'Permite a tus meseros comandar directamente al lado de la mesa desde cualquier teléfono o tablet. Divide cuentas por comensal, agrega observaciones de cocina (sin cebolla, término medio) y sugiere la propina del 10% voluntaria.',
      highlights: ['División de cuentas en segundos', 'Soporta celulares Android & iOS', 'Control de mesas ocupadas y tiempos'],
      accentColor: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400'
    },
    {
      id: 'kds',
      icon: ChefHat,
      tag: 'Cero Papel en Cocina',
      title: 'KDS Pantalla de Cocina & Parrilla',
      description: 'Se acabaron los papeles perdidos o manchados de grasa. Las órdenes llegan al instante a la pantalla de cocina organizadas por tiempos. Semáforo visual (Verde, Amarillo, Rojo Urgente) para que ningún plato salga frío o tarde.',
      highlights: ['Separación por estaciones (Parrilla, Fríos, Bar)', 'Alertas de comanda retrasada', 'Despacho táctil con 1 toque'],
      accentColor: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400'
    },
    {
      id: 'dian',
      icon: Receipt,
      tag: 'Cumplimiento Legal Total',
      title: 'Facturación Electrónica DIAN & Impoconsumo 8%',
      description: 'Genera facturas electrónicas válidas ante la DIAN o tickets POS en segundos. Desglose automático de base gravable, Impoconsumo del 8% (Ley 2277) e IVA si aplica. Emite cierres Z diarios con un clic para tu contador.',
      highlights: ['Resolución DIAN y código CUFE', 'Arqueo de caja Cierre Z automático', 'Compatibilidad con impresoras térmicas ESC/POS'],
      accentColor: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400'
    },
    {
      id: 'inventario',
      icon: PackageCheck,
      tag: 'Rentabilidad Blindada',
      title: 'Escandallos y Descuento de Insumos por Gramo',
      description: 'Configura tus recetas estándar. Cada vez que vendes una Bandeja Paisa o una Hamburguesa, Milenia descuenta automáticamente los gramos exactos de carne, tocino, aguacate y bebidas del inventario.',
      highlights: ['Cálculo de costo real por plato', 'Alertas de existencias críticas', 'Auditoría de mermas y desperdicios'],
      accentColor: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400'
    },
    {
      id: 'qr',
      icon: QrCode,
      tag: 'Ventas Directas',
      title: 'Menú Digital QR & Delivery por WhatsApp',
      description: 'No regales el 25% o 30% de tus ventas a aplicaciones de domicilios. Tus comensales escanean el código QR en la mesa o en redes sociales, arman su pedido y te llega listo para despachar a tu WhatsApp.',
      highlights: ['Catálogo con fotos de alta definición', 'Cero comisiones por comensal', 'Integración directa al WhatsApp del negocio'],
      accentColor: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-300'
    },
    {
      id: 'metricas',
      icon: BarChart3,
      tag: 'Toma de Decisiones',
      title: 'Reportes de Rentabilidad y Auditoría de Caja',
      description: 'Accede desde tu celular a las ventas en tiempo real estés donde estés. Descubre qué platos tienen mejor margen, el promedio de consumo por mesa, el rendimiento de cada mesero y el efectivo exacto en gaveta.',
      highlights: ['Dashboard accesible en tu teléfono', 'Platos más vendidos vs más rentables', 'Monitoreo de anulaciones y cortesías'],
      accentColor: 'from-orange-500/20 to-red-500/10 border-orange-500/30 text-orange-400'
    }
  ];

  return (
    <section id="modulos" className="py-20 lg:py-28 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <span>Módulos Todo-En-Uno</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Diseñado específicamente para el ritmo de la gastronomía en Colombia
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Elimina el caos de las comandas manuales, acelera el despacho de platos y ten control financiero absoluto de cada sede.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map(mod => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-slate-700 hover:bg-slate-900 transition-all duration-200 group shadow-lg"
              >
                <div className="space-y-4">
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${mod.accentColor} border flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                      {mod.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                </div>

                {/* Highlights List */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2">
                  {mod.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Banner: Funciona en tu hardware actual */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-orange-500/10 border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-lg">
              <Smartphone className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white">
                ¿No quieres gastar millones en computadores nuevos?
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Milenia es 100% web y ligero. Funciona en teléfonos inteligentes, tablets económicas, iPads o cualquier laptop que ya tengas en el restaurante.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Sin contratos de amarre
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
