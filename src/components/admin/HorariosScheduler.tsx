import React, { useState } from 'react';
import { 
  Clock, 
  Check, 
  X, 
  RotateCcw, 
  Copy, 
  CalendarDays,
  Sparkles
} from 'lucide-react';
import { DiaAtencion } from '../../types';
import { DEFAULT_DIAS_ATENCION, formatHorariosFromDias } from '../../services/negocioInfoService';

interface HorariosSchedulerProps {
  horarios: string;
  diasAtencion?: DiaAtencion[];
  onChange: (formattedHorarios: string, dias: DiaAtencion[]) => void;
}

export const HorariosScheduler: React.FC<HorariosSchedulerProps> = ({
  horarios,
  diasAtencion = DEFAULT_DIAS_ATENCION,
  onChange
}) => {
  // Asegurarnos de tener los 7 días
  const [dias, setDias] = useState<DiaAtencion[]>(() => {
    if (diasAtencion && diasAtencion.length === 7) {
      return diasAtencion;
    }
    return DEFAULT_DIAS_ATENCION;
  });

  const [batchApertura, setBatchApertura] = useState('11:30');
  const [batchCierre, setBatchCierre] = useState('23:00');

  // Actualizar un día específico
  const updateDia = (index: number, partial: Partial<DiaAtencion>) => {
    const updated = dias.map((d, i) => (i === index ? { ...d, ...partial } : d));
    setDias(updated);
    const formatted = formatHorariosFromDias(updated);
    onChange(formatted, updated);
  };

  // Alternar abierto/cerrado de un día
  const toggleDia = (index: number) => {
    updateDia(index, { abierto: !dias[index].abierto });
  };

  // Preset: Todos los días (Lun - Dom)
  const applyPresetAll = () => {
    const updated = dias.map(d => ({ ...d, abierto: true, apertura: batchApertura, cierre: batchCierre }));
    setDias(updated);
    onChange(formatHorariosFromDias(updated), updated);
  };

  // Preset: Lunes a Sábado (Domingo cerrado)
  const applyPresetMonSat = () => {
    const updated = dias.map(d => ({
      ...d,
      abierto: d.dia !== 'Domingo',
      apertura: batchApertura,
      cierre: batchCierre
    }));
    setDias(updated);
    onChange(formatHorariosFromDias(updated), updated);
  };

  // Preset: Lunes a Viernes
  const applyPresetMonFri = () => {
    const updated = dias.map(d => ({
      ...d,
      abierto: d.dia !== 'Sábado' && d.dia !== 'Domingo',
      apertura: batchApertura,
      cierre: batchCierre
    }));
    setDias(updated);
    onChange(formatHorariosFromDias(updated), updated);
  };

  // Preset: Martes a Domingo (Lunes cerrado)
  const applyPresetTueSun = () => {
    const updated = dias.map(d => ({
      ...d,
      abierto: d.dia !== 'Lunes',
      apertura: batchApertura,
      cierre: batchCierre
    }));
    setDias(updated);
    onChange(formatHorariosFromDias(updated), updated);
  };

  // Copiar horas de batch a todos los días abiertos
  const applyBatchHoursToOpenDays = () => {
    const updated = dias.map(d => (d.abierto ? { ...d, apertura: batchApertura, cierre: batchCierre } : d));
    setDias(updated);
    onChange(formatHorariosFromDias(updated), updated);
  };

  return (
    <div className="space-y-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div>
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Configuración de Días y Horarios de Atención
          </label>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Elige qué días opera tu restaurante y el rango de apertura y cierre de cada jornada.
          </p>
        </div>

        {/* Resumen en vivo */}
        <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20 font-semibold self-start sm:self-auto">
          {dias.filter(d => d.abierto).length} de 7 días activos
        </span>
      </div>

      {/* Botones de configuración rápida / Presets */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Plantillas Rápidas:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={applyPresetAll}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            Lunes a Domingo (7 días)
          </button>
          <button
            type="button"
            onClick={applyPresetMonSat}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            Lun a Sáb (Descanso Dom)
          </button>
          <button
            type="button"
            onClick={applyPresetTueSun}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            Mar a Dom (Descanso Lun)
          </button>
          <button
            type="button"
            onClick={applyPresetMonFri}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            Lun a Vie (Entre semana)
          </button>
        </div>
      </div>

      {/* Ajuste masivo de horas */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <span className="text-slate-300 font-bold flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          Horario Base:
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400">Apertura:</span>
          <input
            type="time"
            value={batchApertura}
            onChange={(e) => setBatchApertura(e.target.value)}
            className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400">Cierre:</span>
          <input
            type="time"
            value={batchCierre}
            onChange={(e) => setBatchCierre(e.target.value)}
            className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-amber-500"
          />
        </div>
        <button
          type="button"
          onClick={applyBatchHoursToOpenDays}
          className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-[11px] font-bold transition flex items-center gap-1.5 ml-auto cursor-pointer"
        >
          <Copy className="w-3 h-3" />
          Aplicar a todos los días abiertos
        </button>
      </div>

      {/* Grid de 7 días seleccionables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5 pt-1">
        {dias.map((diaItem, idx) => {
          const isWeekend = diaItem.dia === 'Sábado' || diaItem.dia === 'Domingo';
          return (
            <div
              key={diaItem.dia}
              className={`p-3 rounded-2xl border transition-all ${
                diaItem.abierto
                  ? 'bg-slate-900 border-amber-500/30 shadow-md shadow-amber-500/5'
                  : 'bg-slate-950/80 border-slate-800 opacity-60'
              }`}
            >
              {/* Encabezado del día con toggle */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className={`text-xs font-black uppercase tracking-wider ${
                  isWeekend ? 'text-amber-400' : 'text-slate-200'
                }`}>
                  {diaItem.dia}
                </span>

                <button
                  type="button"
                  onClick={() => toggleDia(idx)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition cursor-pointer ${
                    diaItem.abierto
                      ? 'bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title={diaItem.abierto ? 'Día activo (clic para cerrar)' : 'Día cerrado (clic para abrir)'}
                >
                  {diaItem.abierto ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                </button>
              </div>

              {diaItem.abierto ? (
                <div className="space-y-1.5 text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Abre:</span>
                    <input
                      type="time"
                      value={diaItem.apertura}
                      onChange={(e) => updateDia(idx, { apertura: e.target.value })}
                      className="w-full px-1.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Cierra:</span>
                    <input
                      type="time"
                      value={diaItem.cierre}
                      onChange={(e) => updateDia(idx, { cierre: e.target.value })}
                      className="w-full px-1.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="py-3 text-center">
                  <span className="text-[11px] font-bold text-rose-400/80 block">
                    Cerrado
                  </span>
                  <span className="text-[9px] text-slate-500 block">Descanso</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cadena resultante formateada */}
      <div className="pt-2">
        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
          Texto formateado para la Carta, Facturación y Sitio Web:
        </label>
        <div className="relative">
          <CalendarDays className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={horarios}
            onChange={(e) => onChange(e.target.value, dias)}
            placeholder="Ej. Lunes a Domingo: 11:30 AM - 11:00 PM"
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>
    </div>
  );
};
