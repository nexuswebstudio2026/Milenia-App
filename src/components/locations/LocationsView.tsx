import React, { useState } from 'react';
import { useTasty } from '../../context/TastyContext';
import { RestaurantLocation } from '../../types';
import { RestaurantGoogleMap } from '../maps/RestaurantGoogleMap';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Star, 
  Truck, 
  Store, 
  Check, 
  Navigation, 
  ShieldCheck,
  UtensilsCrossed,
  Map as MapIcon,
  Compass
} from 'lucide-react';

export const LocationsView: React.FC = () => {
  const { locations, selectedLocation, setSelectedLocation, setCurrentView, language } = useTasty();
  const [viewMode, setViewMode] = useState<'both' | 'map_only' | 'cards_only'>('both');

  return (
    <div id="locations-view" className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 text-amber-500" />
          <span>{language === 'es' ? 'Google Maps & Sedes Colombia' : 'Google Maps & Locations'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
          {language === 'es' ? 'Sucursales & Espacios MILENIA' : 'MILENIA Restaurant Locations'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          {language === 'es'
            ? 'Georreferenciación en Google Maps en tiempo real, radios de cobertura express para domicilios y cavas privadas en Colombia.'
            : 'Real-time Google Maps georeferencing, express delivery coverage radius, and dining salons in Colombia.'}
        </p>
      </div>

      {/* Interactive Google Map Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {language === 'es' ? 'Mapa Interactivo de Sedes y Domicilios' : 'Interactive Map & Delivery Zones'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('both')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${viewMode === 'both' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Vista Completa
            </button>
            <button
              onClick={() => setViewMode('map_only')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${viewMode === 'map_only' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Solo Mapa
            </button>
            <button
              onClick={() => setViewMode('cards_only')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${viewMode === 'cards_only' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Solo Lista
            </button>
          </div>
        </div>

        {viewMode !== 'cards_only' && (
          <RestaurantGoogleMap
            locations={locations}
            selectedLocation={selectedLocation}
            onSelectLocation={(loc) => setSelectedLocation(loc)}
            onBookTable={(loc) => {
              setSelectedLocation(loc);
              setCurrentView('reservations');
            }}
            height="440px"
            showDeliveryZones={true}
          />
        )}
      </div>

      {/* Locations Cards Grid */}
      {viewMode !== 'map_only' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {locations.map((loc) => {
          const isSelected = loc.id === selectedLocation.id;

          return (
            <div
              key={loc.id}
              id={`location-card-${loc.id}`}
              className={`bg-white dark:bg-slate-900 rounded-3xl border overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
                isSelected ? 'border-amber-500 ring-2 ring-amber-400/30' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                {/* Image */}
                <div className="relative h-56 w-full bg-slate-100 dark:bg-slate-800">
                  <img
                    src={loc.image}
                    alt={loc.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent"></div>

                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                      {loc.isOpen ? (language === 'es' ? 'Abierto Ahora' : 'Open Now') : (language === 'es' ? 'Cerrado' : 'Closed')}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-xs text-amber-400 font-black text-xs px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{loc.rating}</span>
                    <span className="text-slate-300 font-normal text-[10px]">({loc.reviewCount})</span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-serif font-bold">{loc.name}</h3>
                    <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{loc.address}, {loc.city}</span>
                    </p>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-6 space-y-5">
                  {/* Delivery & Takeout stats */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="space-y-1">
                      <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-amber-500" />
                        <span>{language === 'es' ? 'Entrega a Domicilio' : 'Delivery'}</span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white">{loc.deliveryTimeEstimate}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {language === 'es' ? `Mín. €${loc.minDeliveryOrder.toFixed(2)} • Radio ${loc.deliveryRadiusKm}km` : `Min €${loc.minDeliveryOrder.toFixed(2)} • ${loc.deliveryRadiusKm}km radius`}
                      </div>
                    </div>

                    <div className="space-y-1 border-l border-slate-200 dark:border-slate-700 pl-3">
                      <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-amber-500" />
                        <span>{language === 'es' ? 'Recogida en Atelier' : 'Takeout'}</span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white">{loc.pickupTimeEstimate}</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        {language === 'es' ? 'Sin pedido mínimo' : 'No min order'}
                      </div>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{language === 'es' ? 'Horario de Atención' : 'Operating Hours'}</span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-3 divide-y divide-slate-100 dark:divide-slate-700">
                      {loc.openingHours.map((h, i) => (
                        <div key={i} className="flex justify-between py-1 first:pt-0 last:pb-0">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{language === 'es' ? h.days : h.daysEn}</span>
                          <span>{h.hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400 pt-1">
                    <a href={`tel:${loc.phone}`} className="flex items-center gap-1.5 hover:text-amber-500 transition">
                      <Phone className="w-3.5 h-3.5 text-amber-500" />
                      <span>{loc.phone}</span>
                    </a>
                    <a href={`mailto:${loc.email}`} className="flex items-center gap-1.5 hover:text-amber-500 transition">
                      <Mail className="w-3.5 h-3.5 text-amber-500" />
                      <span>{loc.email}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-6 pt-0 flex gap-3">
                <button
                  onClick={() => {
                    setSelectedLocation(loc);
                    setCurrentView('menu');
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-md'
                      : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white'
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>{isSelected ? (language === 'es' ? 'Pedir en este Atelier ✓' : 'Selected Branch ✓') : (language === 'es' ? 'Elegir para Pedir' : 'Select Branch')}</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedLocation(loc);
                    setCurrentView('reservations');
                  }}
                  className="py-3 px-4 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
                >
                  {language === 'es' ? 'Reservar Mesa' : 'Book Table'}
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};
