import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Search, 
  Filter, 
  Check, 
  X, 
  ChevronDown,
  Building
} from 'lucide-react';
import { 
  DEPARTAMENTOS_COLOMBIA, 
  CIUDADES_COLOMBIA, 
  searchCitiesAndDepartments, 
  getCitiesByDepartment,
  ColombiaCity 
} from '../../data/colombiaData';

interface CityDepartmentPickerProps {
  ciudad: string;
  departamento?: string;
  pais?: string;
  onChange: (ciudad: string, departamento: string, pais: string) => void;
}

export const CityDepartmentPicker: React.FC<CityDepartmentPickerProps> = ({
  ciudad,
  departamento,
  pais = 'Colombia',
  onChange
}) => {
  const [mode, setMode] = useState<'search' | 'filter'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState(departamento || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Inicializar departamento si no viene definido pero la ciudad sí
  useEffect(() => {
    if (ciudad && !departamento) {
      const match = CIUDADES_COLOMBIA.find(c => c.ciudad.toLowerCase() === ciudad.toLowerCase());
      if (match) {
        setSelectedDept(match.departamento);
      }
    } else if (departamento) {
      setSelectedDept(departamento);
    }
  }, [ciudad, departamento]);

  // Cerrar dropdown al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchCitiesAndDepartments(searchQuery);
  const departmentCities = selectedDept ? getCitiesByDepartment(selectedDept) : [];

  const handleSelectCity = (item: ColombiaCity) => {
    setSelectedDept(item.departamento);
    setSearchQuery('');
    setIsDropdownOpen(false);
    onChange(item.ciudad, item.departamento, 'Colombia');
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Ubicación Geográfica (Ciudad, Departamento y País) *
        </label>
        
        {/* Alternador de modo: Búsqueda Rápida vs Filtro por Departamento */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
          <button
            type="button"
            onClick={() => {
              setMode('search');
              setIsDropdownOpen(true);
            }}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              mode === 'search' 
                ? 'bg-amber-500 text-slate-950 shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-3 h-3" />
            Buscador
          </button>
          <button
            type="button"
            onClick={() => setMode('filter')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              mode === 'filter' 
                ? 'bg-amber-500 text-slate-950 shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="w-3 h-3" />
            Por Departamento
          </button>
        </div>
      </div>

      {/* Selector Activo / Badge actual */}
      {ciudad && (
        <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-2xl px-3.5 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-white flex items-center gap-2">
                <span>{ciudad}</span>
                <span className="text-amber-400 font-normal">({selectedDept || departamento || 'Colombia'})</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                Colombia • Sede Oficial
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
            <Check className="w-3 h-3" />
            Seleccionado
          </span>
        </div>
      )}

      {/* MODO 1: BÚSQUEDA RÁPIDA CON AUTOCOMPLETADO */}
      {mode === 'search' && (
        <div className="relative">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Digita una ciudad o departamento (Ej: Medellín, Bogotá, Bucaramanga, Cali...)"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Menú desplegable flotante de resultados */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50 divide-y divide-slate-800">
              <div className="px-3.5 py-2 bg-slate-950/80 text-[10px] font-mono uppercase text-slate-400 font-bold sticky top-0 flex items-center justify-between">
                <span>Ciudades y Departamentos de Colombia</span>
                <span>{searchResults.length} coincidencias</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No se encontraron municipios con ese nombre.
                </div>
              ) : (
                searchResults.map((item) => {
                  const isSelected = item.ciudad.toLowerCase() === ciudad.toLowerCase();
                  return (
                    <button
                      key={`${item.ciudad}-${item.departamento}`}
                      type="button"
                      onClick={() => handleSelectCity(item)}
                      className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between hover:bg-slate-800/80 transition cursor-pointer ${
                        isSelected ? 'bg-amber-500/10 text-amber-400 font-bold' : 'text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <div>
                          <span className="font-bold">{item.ciudad}</span>
                          <span className="text-slate-400 text-[11px] ml-1.5">
                            ({item.departamento})
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Colombia</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* MODO 2: FILTRO SELECT POR DEPARTAMENTO Y LUEGO CIUDAD */}
      {mode === 'filter' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Select de Departamento */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              1. Selecciona el Departamento
            </label>
            <div className="relative">
              <select
                value={selectedDept}
                onChange={(e) => {
                  const dept = e.target.value;
                  setSelectedDept(dept);
                  const cities = getCitiesByDepartment(dept);
                  if (cities.length > 0) {
                    handleSelectCity(cities[0]);
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition appearance-none cursor-pointer"
              >
                <option value="">-- Elige Departamento --</option>
                {DEPARTAMENTOS_COLOMBIA.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Select de Ciudad dependiente */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              2. Selecciona la Ciudad / Municipio
            </label>
            <div className="relative">
              <select
                disabled={!selectedDept}
                value={ciudad}
                onChange={(e) => {
                  const cityName = e.target.value;
                  const item = departmentCities.find(c => c.ciudad === cityName);
                  if (item) {
                    handleSelectCity(item);
                  } else if (cityName) {
                    handleSelectCity({ ciudad: cityName, departamento: selectedDept });
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="">-- Elige Ciudad --</option>
                {departmentCities.map(c => (
                  <option key={c.ciudad} value={c.ciudad}>{c.ciudad}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
