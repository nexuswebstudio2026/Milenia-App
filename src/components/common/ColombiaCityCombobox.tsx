import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  MapPin, 
  Search, 
  X, 
  Check, 
  ChevronDown, 
  Sparkles, 
  Building2, 
  Compass,
  CheckCircle2
} from 'lucide-react';
import { 
  COLOMBIA_DEPARTMENTS, 
  ALL_COLOMBIA_LOCATIONS, 
  ColombiaLocation, 
  searchColombiaLocations 
} from '../../data/colombiaLocations';

interface ColombiaCityComboboxProps {
  value: string;
  onChange: (cityWithDepartment: string) => void;
  required?: boolean;
  className?: string;
  label?: string;
}

export const ColombiaCityCombobox: React.FC<ColombiaCityComboboxProps> = ({
  value,
  onChange,
  required = true,
  className = '',
  label = 'Ciudad o Municipio de Colombia *'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lista de resultados filtrados
  const filteredLocations = useMemo(() => {
    let list = ALL_COLOMBIA_LOCATIONS;
    if (selectedDeptFilter !== 'all') {
      list = list.filter((l) => l.department === selectedDeptFilter);
    }
    if (!searchQuery.trim()) {
      return list.slice(0, 40);
    }
    return searchColombiaLocations(searchQuery, 60).filter((l) =>
      selectedDeptFilter === 'all' ? true : l.department === selectedDeptFilter
    );
  }, [searchQuery, selectedDeptFilter]);

  // Principales ciudades para acceso rápido
  const popularCities = [
    'Bogotá D.C.',
    'Medellín, Antioquia',
    'Cali, Valle del Cauca',
    'Barranquilla, Atlántico',
    'Cartagena, Bolívar',
    'Bucaramanga, Santander',
    'Pereira, Risaralda',
    'Manizales, Caldas',
    'Santa Marta, Magdalena',
    'Cúcuta, Norte de Santander',
    'Chía, Cundinamarca',
    'Envigado, Antioquia',
    'Ibagué, Tolima',
    'Villavicencio, Meta',
    'Pasto (San Juan de Pasto), Nariño'
  ];

  const handleSelect = (loc: ColombiaLocation | string) => {
    const stringVal = typeof loc === 'string' ? loc : loc.displayName;
    onChange(stringVal);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative space-y-1 ${className}`} ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-300">
            {label}
          </label>
          <span className="text-[10px] text-amber-400 font-mono">
            32 Departamentos &bull; 1.100+ Municipios
          </span>
        </div>
      )}

      {/* Botón / Input de Apertura */}
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className={`w-full px-3.5 py-2.5 bg-slate-900 border rounded-xl text-xs sm:text-sm text-white cursor-pointer transition-all flex items-center justify-between gap-2 shadow-sm ${
          isOpen
            ? 'border-amber-500 ring-2 ring-amber-500/20 bg-slate-950'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <MapPin className={`w-4 h-4 shrink-0 transition-colors ${value ? 'text-amber-400' : 'text-slate-500'}`} />
          {value ? (
            <span className="font-semibold text-white truncate">{value}</span>
          ) : (
            <span className="text-slate-500 italic">Selecciona o busca un municipio...</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {value && (
            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-black uppercase">
              Colombia
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
        </div>
      </div>

      {/* Menú Desplegable con Barra de Búsqueda y Filtros */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header con Barra de Búsqueda */}
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar municipio, ciudad o departamento (ej: Chía, Envigado, Bucaramanga...)"
                className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtro por Departamento */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-400" /> Depto:
              </span>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500 cursor-pointer w-full"
              >
                <option value="all">Todos los Departamentos (32)</option>
                {COLOMBIA_DEPARTMENTS.map((dept) => (
                  <option key={dept.name} value={dept.name}>
                    {dept.name} ({dept.cities.length} mun.)
                  </option>
                ))}
              </select>
            </div>

            {/* Chips Rápidos Populares si no hay búsqueda */}
            {!searchQuery && selectedDeptFilter === 'all' && (
              <div className="space-y-1 pt-1">
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Ciudades Principales:
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                  {popularCities.map((popCity) => (
                    <button
                      key={popCity}
                      type="button"
                      onClick={() => handleSelect(popCity)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border transition font-medium cursor-pointer ${
                        value === popCity
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-amber-500/50'
                      }`}
                    >
                      {popCity.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Lista de Resultados Filtrados */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-900/60 p-1">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((loc) => {
                const isSelected = value === loc.displayName || value === loc.city;
                return (
                  <button
                    key={loc.displayName}
                    type="button"
                    onClick={() => handleSelect(loc)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition group cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 text-amber-400 font-bold'
                        : 'hover:bg-slate-900 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Building2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-400'}`} />
                      <div className="truncate">
                        <span className="font-semibold text-white">{loc.city}</span>
                        <span className="text-[11px] text-slate-500 ml-1.5 font-normal">
                          &bull; {loc.department}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {loc.isCapital && (
                        <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-black">
                          Capital
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-400">No encontramos municipios con &ldquo;{searchQuery}&rdquo;</p>
                <p className="text-[10px]">Verifica el nombre o prueba buscando por el nombre del departamento.</p>
              </div>
            )}
          </div>

          {/* Footer Informativo */}
          <div className="px-3 py-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Resultados: {filteredLocations.length} municipios</span>
            <span className="text-amber-400/90 font-mono">Cobertura Nacional Colombia 100%</span>
          </div>

        </div>
      )}
    </div>
  );
};
