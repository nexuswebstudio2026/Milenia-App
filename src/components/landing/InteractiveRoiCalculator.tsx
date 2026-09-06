import React, { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Sparkles, Clock, ArrowRight } from 'lucide-react';

interface InteractiveRoiCalculatorProps {
  onOpenDemoModal: () => void;
}

export const InteractiveRoiCalculator: React.FC<InteractiveRoiCalculatorProps> = ({
  onOpenDemoModal
}) => {
  const [tablesCount, setTablesCount] = useState<number>(18);
  const [averageTicket, setAverageTicket] = useState<number>(55000); // 55.000 COP
  const [turnoverPerTable, setTurnoverPerTable] = useState<number>(3); // 3 rotaciones por día
  const [daysPerMonth, setDaysPerMonth] = useState<number>(26); // 26 días

  // Mathematical logic based on Colombian gastronomy benchmarks:
  // Monthly sales volume
  const monthlyTickets = tablesCount * turnoverPerTable * daysPerMonth;
  const monthlyRevenue = monthlyTickets * averageTicket;

  // Estimated savings in waste/losses: ~3.5% of food revenue saved through standard recipes & portioning
  const monthlyFoodWasteSavings = Math.round(monthlyRevenue * 0.035);

  // Faster table turnover (15-20 min saved per service allows ~8% extra capacity during rush hours)
  const monthlyExtraCapacityRevenue = Math.round(monthlyRevenue * 0.06);

  // Total monthly financial benefit
  const totalMonthlyBenefit = monthlyFoodWasteSavings + monthlyExtraCapacityRevenue;

  return (
    <section id="calculadora" className="py-20 lg:py-28 bg-slate-900 border-t border-b border-slate-800 text-white relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5" />
            <span>Calculadora de Retorno de Inversión</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Descubre cuánto dinero recupera tu restaurante con Milenia
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Ajusta los números de tu negocio y mira el impacto real de digitalizar comandas y recetas en tus ganancias mensuales.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          {/* Controls (Left 6 cols) */}
          <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            {/* Slider 1: Tables */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
                <span className="text-slate-300">Número de Mesas:</span>
                <span className="font-mono text-amber-400 text-base font-black px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  {tablesCount} mesas
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="60"
                step="1"
                value={tablesCount}
                onChange={e => setTablesCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>4 mesas</span>
                <span>30 mesas</span>
                <span>60 mesas</span>
              </div>
            </div>

            {/* Slider 2: Average Ticket */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
                <span className="text-slate-300">Consumo Promedio por Mesa:</span>
                <span className="font-mono text-amber-400 text-base font-black px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  ${averageTicket.toLocaleString('es-CO')} COP
                </span>
              </div>
              <input
                type="range"
                min="15000"
                max="120000"
                step="5000"
                value={averageTicket}
                onChange={e => setAverageTicket(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>$15.000</span>
                <span>$60.000</span>
                <span>$120.000</span>
              </div>
            </div>

            {/* Slider 3: Rotations per day */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
                <span className="text-slate-300">Rotaciones por Mesa al Día:</span>
                <span className="font-mono text-amber-400 text-base font-black px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  {turnoverPerTable} servicios
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={turnoverPerTable}
                onChange={e => setTurnoverPerTable(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1 rotación (tranquilo)</span>
                <span>3 rotaciones (estándar)</span>
                <span>6 rotaciones (asadero/concurrido)</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Cálculo proyectado a 26 días hábiles de servicio al mes.</span>
            </div>
          </div>

          {/* Results Display (Right 6 cols) */}
          <div className="lg:col-span-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Beneficio Estimado Mensual:</span>
            </div>

            {/* Big Headline Number */}
            <div>
              <div className="text-3xl sm:text-5xl font-black font-mono text-emerald-400 tracking-tight">
                +${totalMonthlyBenefit.toLocaleString('es-CO')}
                <span className="text-xs sm:text-sm font-sans font-bold text-slate-400 ml-2">COP / mes</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Dinero que recuperas reduciendo mermas de carne y acelerando la rotación de tus mesas.
              </p>
            </div>

            {/* Itemized breakdown */}
            <div className="space-y-3 pt-3 border-t border-slate-800 text-xs sm:text-sm">
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Control de mermas e inventario:
                </span>
                <span className="font-mono font-bold text-white">
                  +${monthlyFoodWasteSavings.toLocaleString('es-CO')}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Mayor rotación por rapidez KDS:
                </span>
                <span className="font-mono font-bold text-white">
                  +${monthlyExtraCapacityRevenue.toLocaleString('es-CO')}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-400 text-xs pt-2 border-t border-slate-850">
                <span>Ventas mensuales estimadas:</span>
                <span className="font-mono text-slate-300">
                  ${monthlyRevenue.toLocaleString('es-CO')} COP
                </span>
              </div>
            </div>

            {/* CTA inside calculator */}
            <button
              onClick={onOpenDemoModal}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
            >
              <span>Quiero estos resultados en mi restaurante</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
