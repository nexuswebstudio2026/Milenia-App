import React, { useState, useEffect, useRef } from 'react';
import { RestaurantLocation } from '../../types';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  Star, 
  Truck, 
  Compass, 
  Layers, 
  Maximize2, 
  CheckCircle2,
  UtensilsCrossed,
  Info
} from 'lucide-react';

interface RestaurantGoogleMapProps {
  locations: RestaurantLocation[];
  selectedLocation: RestaurantLocation;
  onSelectLocation: (location: RestaurantLocation) => void;
  onBookTable?: (location: RestaurantLocation) => void;
  height?: string;
  showDeliveryZones?: boolean;
  interactiveDeliverySelector?: boolean;
  onAddressSelected?: (address: string, coords: { lat: number; lng: number }) => void;
}

// Colombian cities coordinates
const COLOMBIA_LOCATIONS: Record<string, { lat: number; lng: number; zoom: number }> = {
  'loc-1': { lat: 4.6542, lng: -74.0558, zoom: 15 }, // Bogotá Zona G
  'loc-2': { lat: 6.2088, lng: -75.5676, zoom: 15 }, // Medellín El Poblado
  'loc-3': { lat: 3.4516, lng: -76.5320, zoom: 15 }, // Cali Granada
  'loc-4': { lat: 10.9685, lng: -74.7813, zoom: 15 }, // Barranquilla
  'loc-5': { lat: 10.3910, lng: -75.4794, zoom: 15 }, // Cartagena
};

export const RestaurantGoogleMap: React.FC<RestaurantGoogleMapProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  onBookTable,
  height = '480px',
  showDeliveryZones = true,
  interactiveDeliverySelector = false,
  onAddressSelected
}) => {
  const [activePin, setActivePin] = useState<RestaurantLocation | null>(selectedLocation);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [filterCity, setFilterCity] = useState<string>('all');
  const [showRadius, setShowRadius] = useState(true);

  // Sync selected location when parent updates
  useEffect(() => {
    setActivePin(selectedLocation);
  }, [selectedLocation]);

  const currentCoords = COLOMBIA_LOCATIONS[activePin?.id || 'loc-1'] || { lat: 4.6542, lng: -74.0558, zoom: 15 };

  const handleLocateMe = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: 'Ubicación GPS Detectada (Bogotá, Colombia)'
          };
          setUserLocation(coords);
          if (onAddressSelected) {
            onAddressSelected(coords.address, coords);
          }
        },
        () => {
          setIsLocating(false);
          // Fallback realistic coordinate
          const defaultLoc = {
            lat: 4.6534,
            lng: -74.0581,
            address: 'Calle 70 # 6-40, Chapinero, Bogotá'
          };
          setUserLocation(defaultLoc);
          if (onAddressSelected) {
            onAddressSelected(defaultLoc.address, defaultLoc);
          }
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const filteredLocations = filterCity === 'all' 
    ? locations 
    : locations.filter(l => l.city.toLowerCase().includes(filterCity.toLowerCase()));

  // Google Maps Static & Interactive Canvas Preview
  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-xl" style={{ height }}>
      
      {/* Top Map Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        
        {/* City Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-lg">
          <button
            onClick={() => setFilterCity('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterCity === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Todas las Sedes
          </button>
          <button
            onClick={() => {
              setFilterCity('Bogotá');
              const bog = locations.find(l => l.city.includes('Bogot')) || locations[0];
              onSelectLocation(bog);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterCity === 'Bogotá'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Bogotá
          </button>
          <button
            onClick={() => {
              setFilterCity('Medellín');
              const med = locations.find(l => l.city.includes('Medell')) || locations[1] || locations[0];
              onSelectLocation(med);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterCity === 'Medellín'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Medellín
          </button>
          <button
            onClick={() => {
              setFilterCity('Cali');
              const cal = locations.find(l => l.city.includes('Cali')) || locations[2] || locations[0];
              onSelectLocation(cal);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterCity === 'Cali'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Cali
          </button>
        </div>

        {/* Map Layers & Geolocation */}
        <div className="flex items-center gap-2">
          {showDeliveryZones && (
            <button
              onClick={() => setShowRadius(!showRadius)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md border transition shadow-md ${
                showRadius 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-slate-950/80 text-slate-400 border-white/10'
              }`}
              title="Alternar radio de cobertura de domicilios"
            >
              <Truck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Radio Cobertura</span>
            </button>
          )}

          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs backdrop-blur-md shadow-md transition"
          >
            <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Ubicando...' : 'Mi Ubicación'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Map Visual Stage with Custom Styled Cartography */}
      <div className="w-full h-full relative overflow-hidden bg-[#1f2937] flex items-center justify-center">
        
        {/* Vector Cartography Background Graphic */}
        <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            </pattern>
            <radialGradient id="map-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          {/* Simulated Street Network */}
          <path d="M-100 200 Q 300 150 700 280 T 1500 220" fill="none" stroke="#374151" strokeWidth="6" />
          <path d="M200 -50 Q 250 400 320 900" fill="none" stroke="#374151" strokeWidth="4" />
          <path d="M600 -50 Q 550 350 680 900" fill="none" stroke="#374151" strokeWidth="5" />
          <path d="M-50 420 Q 500 380 1200 480" fill="none" stroke="#4b5563" strokeWidth="4" />
          <circle cx="50%" cy="50%" r="280" fill="url(#map-glow)" />
        </svg>

        {/* Coverage Circle Animation */}
        {showRadius && (
          <div className="absolute w-72 h-72 rounded-full border-2 border-dashed border-amber-400/40 bg-amber-500/10 pointer-events-none animate-pulse flex items-center justify-center">
            <span className="text-[10px] font-bold text-amber-300/80 bg-slate-950/80 px-2 py-0.5 rounded-full border border-amber-500/30">
              Zona de Cobertura Express ({activePin?.deliveryRadiusKm || 8} km)
            </span>
          </div>
        )}

        {/* Google Maps Attribution Badge */}
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] text-slate-300">
          <span className="font-bold text-white flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Google Maps Platform
          </span>
          <span className="text-slate-500">•</span>
          <span>Bogotá & Colombia Coverage</span>
        </div>

        {/* Branch Markers on the Map */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-full max-w-4xl h-full flex items-center justify-around px-8">
            
            {filteredLocations.map((loc, idx) => {
              const isSelected = activePin?.id === loc.id;
              
              // Coordinates offset simulation for layout
              const offsets = [
                { x: '0px', y: '0px' },
                { x: '-140px', y: '-60px' },
                { x: '160px', y: '70px' },
                { x: '-180px', y: '80px' },
                { x: '130px', y: '-90px' }
              ];
              const pos = offsets[idx % offsets.length];

              return (
                <div
                  key={loc.id}
                  style={{ transform: `translate(${pos.x}, ${pos.y})` }}
                  className="pointer-events-auto absolute flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-110 z-10"
                  onClick={() => {
                    setActivePin(loc);
                    onSelectLocation(loc);
                  }}
                >
                  {/* Pin Graphic */}
                  <div className={`relative flex items-center justify-center rounded-2xl p-2.5 shadow-2xl transition-all ${
                    isSelected 
                      ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-400/40 scale-110' 
                      : 'bg-slate-900 text-amber-400 border border-amber-500/40 hover:bg-slate-800'
                  }`}>
                    <UtensilsCrossed className="w-5 h-5" />
                    
                    {/* Badge */}
                    <span className="absolute -top-2 -right-2 bg-emerald-500 text-white font-bold text-[9px] px-1.5 py-0.2 rounded-full border border-slate-900">
                      ★ {loc.rating}
                    </span>
                  </div>

                  {/* Marker Label */}
                  <div className={`mt-1.5 px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap shadow-lg backdrop-blur-md border ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold'
                      : 'bg-slate-950/90 text-slate-200 border-white/10'
                  }`}>
                    {loc.name.replace('Milenia Atelier ', '').replace('Milenia ', '')}
                  </div>
                </div>
              );
            })}

            {/* User GPS Location Pin if detected */}
            {userLocation && (
              <div 
                style={{ transform: 'translate(40px, -40px)' }}
                className="pointer-events-auto absolute flex flex-col items-center z-15 animate-bounce"
              >
                <div className="p-2 rounded-full bg-blue-500 text-white shadow-xl ring-4 ring-blue-400/40">
                  <Navigation className="w-4 h-4" />
                </div>
                <span className="mt-1 bg-blue-900/90 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-400/30 whitespace-nowrap">
                  Tu Ubicación
                </span>
              </div>
            )}

          </div>
        </div>

        {/* Selected Branch Detail InfoWindow Card */}
        {activePin && (
          <div className="absolute bottom-12 right-4 max-w-sm w-full bg-slate-950/95 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-5 shadow-2xl text-white z-20 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    {activePin.city} • Atelier Activo
                  </span>
                </div>
                <h4 className="text-base font-serif font-bold text-white mt-0.5">{activePin.name}</h4>
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{activePin.address}</span>
                </p>
              </div>

              <div className="text-right">
                <div className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-xl text-xs font-bold">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{activePin.rating}</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3.5 border-t border-white/10 text-xs">
              <div className="bg-slate-900/80 p-2 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px]">Entrega Estimada</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <Truck className="w-3 h-3 text-amber-400" />
                  {activePin.deliveryTimeEstimate}
                </span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px]">Radio Cobertura</span>
                <span className="font-bold text-emerald-400">{activePin.deliveryRadiusKm} km express</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => onSelectLocation(activePin)}
                className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pedir en esta Sede</span>
              </button>

              {onBookTable && (
                <button
                  onClick={() => onBookTable(activePin)}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Reservar
                </button>
              )}

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activePin.address + ', ' + activePin.city + ', Colombia')}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-white/10 flex items-center justify-center"
                title="Abrir indicaciones en Google Maps"
              >
                <Navigation className="w-4 h-4 text-amber-400" />
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
