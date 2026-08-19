import React, { useState } from 'react';
import { useTasty } from '../../context/TastyContext';
import { TableReservation } from '../../types';
import { 
  CalendarDays, 
  Users, 
  Clock, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  CalendarCheck, 
  X, 
  Phone, 
  Mail, 
  User, 
  HelpCircle,
  Sun,
  Moon,
  Wine,
  Trees,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';

export const ReservationView: React.FC = () => {
  const { 
    selectedLocation, 
    reservations, 
    createReservation, 
    updateReservationStatus,
    language,
    config
  } = useTasty();

  const [guestsCount, setGuestsCount] = useState(2);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('21:00');
  const [seatingArea, setSeatingArea] = useState<TableReservation['seatingArea']>('patio');
  const [occasion, setOccasion] = useState('Cena Romántica / Velada de Autor');
  const [guestName, setGuestName] = useState('María Rodríguez');
  const [guestEmail, setGuestEmail] = useState('maria.rodriguez@example.com');
  const [guestPhone, setGuestPhone] = useState('+34 655 889 900');
  const [specialRequests, setSpecialRequests] = useState('Mesa cerca del ventanal con vistas al patio si es posible.');

  const [confirmedBooking, setConfirmedBooking] = useState<TableReservation | null>(null);

  const timeSlotsLunch = ['13:00', '13:30', '14:00', '14:30', '15:00'];
  const timeSlotsDinner = ['20:00', '20:30', '21:00', '21:30', '22:00', '22:30'];

  const seatingAreasList = [
    {
      id: 'indoor' as const,
      titleEs: 'Salón Principal Haute Cuisine',
      titleEn: 'Haute Cuisine Main Room',
      descEs: 'Ambiente climatizado, mesas con mantelería de lino y jazz acústico',
      descEn: 'Air conditioned, pure linen tables & warm acoustic jazz',
      icon: <Wine className="w-5 h-5 text-amber-500" />
    },
    {
      id: 'patio' as const,
      titleEs: 'Terraza & Jardín Botánico',
      titleEn: 'Botanical Garden Patio',
      descEs: 'Espacio al aire libre con vegetación mediterránea, velas aromáticas y calefactores',
      descEn: 'Outdoor open-air terrace with lush garden greenery & candles',
      icon: <Trees className="w-5 h-5 text-emerald-500" />
    },
    {
      id: 'bar' as const,
      titleEs: 'Barra Sommelier & Mixología',
      titleEn: 'Sommelier Bar & Mixology Lounge',
      descEs: 'Ideal para parejas con degustación de maridajes y showcooking en directo',
      descEn: 'Ideal for pairs with fine wine pairings & front-row chef kitchen',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />
    },
    {
      id: 'vip_rooftop' as const,
      titleEs: 'Rooftop VIP & Bodega Privada',
      titleEn: 'Panoramic VIP Rooftop & Cellar',
      descEs: 'Vistas panorámicas a la ciudad, servicio de sommelier dedicado y carta privada',
      descEn: 'Panoramic skyline views, dedicated sommelier & private reserve menu',
      icon: <Award className="w-5 h-5 text-amber-300" />
    }
  ];

  const occasionsList = [
    { es: 'Cena Gourmet / Amigos', en: 'Artisan Gathering' },
    { es: 'Cena Romántica / Velada de Autor', en: 'Romantic Date' },
    { es: 'Celebración de Aniversario', en: 'Anniversary' },
    { es: 'Cumpleaños Especial', en: 'Birthday Celebration' },
    { es: 'Encuentro Ejecutivo / Negocios', en: 'Executive Meeting' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRes = createReservation({
      guestName,
      guestEmail,
      guestPhone,
      guestsCount,
      date,
      time: timeSlot,
      seatingArea,
      occasion,
      specialRequests
    });
    setConfirmedBooking(newRes);
  };

  return (
    <div id="reservation-booking-view" className="max-w-4xl mx-auto space-y-8">
      
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-amber-500/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-widest">
          <CalendarDays className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>{language === 'es' ? 'Reserva Instantánea de Mesa' : 'Instant Table Reservation'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
          {language === 'es' ? `Reserva tu Mesa en ${config.name}` : `Book Your Table at ${config.name}`}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          {language === 'es' 
            ? `Disfruta de una velada gastronómica inigualable en nuestro restaurante de ${selectedLocation.name}.`
            : `Enjoy an unforgettable haute cuisine dining experience at our ${selectedLocation.name} location.`}
        </p>
      </div>

      {/* Confirmation Card if newly booked */}
      {confirmedBooking ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-amber-500 shadow-2xl space-y-6 text-center"
        >
          <div className="w-16 h-16 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
              {language === 'es' ? '¡Tu Mesa está Reservada y Confirmada!' : 'Your Table is Booked & Confirmed!'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {language === 'es' 
                ? 'Hemos guardado tu reserva en la base de datos de Firebase y enviado la confirmación a tu correo.' 
                : 'Your booking is recorded in Firebase Cloud and confirmation sent to your email.'}
            </p>
          </div>

          {/* Booking Pass */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg mx-auto text-left space-y-4 shadow-inner">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Código de Reserva</span>
                <div className="text-xl font-mono font-black text-amber-600 dark:text-amber-400">{confirmedBooking.reservationCode}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Mesa Asignada</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{confirmedBooking.tableAssigned}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Titular:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{confirmedBooking.guestName}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Comensales:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{confirmedBooking.guestsCount} personas</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Fecha y Hora:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{confirmedBooking.date} a las {confirmedBooking.time}h</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Zona:</span>
                <span className="font-semibold text-slate-900 dark:text-white capitalize">{confirmedBooking.seatingArea.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setConfirmedBooking(null)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm px-6 py-3 rounded-2xl transition cursor-pointer shadow-md"
            >
              {language === 'es' ? 'Hacer Otra Reserva' : 'Book Another Table'}
            </button>
            <button
              onClick={() => window.print()}
              className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl transition cursor-pointer border border-slate-700"
            >
              {language === 'es' ? 'Guardar / Imprimir Pase' : 'Save / Print Pass'}
            </button>
          </div>
        </motion.div>
      ) : (
        /* Reservation Form */
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          
          {/* STEP 1: PARTY SIZE */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              <span>1. {language === 'es' ? 'Número de Comensales' : 'Number of Guests'}</span>
            </label>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setGuestsCount(num)}
                  className={`w-12 h-12 rounded-2xl font-black text-sm flex items-center justify-center shrink-0 border transition cursor-pointer ${
                    guestsCount === num
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20 scale-105'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: DATE & TIME SLOTS */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-amber-500" />
              <span>2. {language === 'es' ? 'Fecha y Franja Horaria' : 'Date & Time Slot'}</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <input
                type="date"
                required
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 outline-none"
              />

              {/* Lunch vs Dinner selection info */}
              <div className="sm:col-span-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{language === 'es' ? 'Experiencia gastronómica garantizada con servicio de sala de 2 horas.' : '2-hour guaranteed dining window with dedicated sommelier.'}</span>
              </div>
            </div>

            {/* Time Slot Chips */}
            <div className="space-y-3 pt-2">
              <div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>{language === 'es' ? 'Almuerzo / Menú de Mediodía' : 'Lunch & Tasting Menu'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {timeSlotsLunch.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        timeSlot === slot
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{language === 'es' ? 'Cena / Experiencia Nocturna' : 'Dinner & Haute Cuisine Night'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {timeSlotsDinner.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        timeSlot === slot
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: SEATING AREA PREFERENCE */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>3. {language === 'es' ? 'Ambiente y Mesa Preferida' : 'Seating Area Preference'}</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {seatingAreasList.map((area) => {
                const isSelected = seatingArea === area.id;
                return (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => setSeatingArea(area.id)}
                    className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-2xs border border-slate-200 dark:border-slate-700 shrink-0">
                      {area.icon}
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {language === 'es' ? area.titleEs : area.titleEn}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {language === 'es' ? area.descEs : area.descEn}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 4: OCCASION & CONTACT */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>4. {language === 'es' ? 'Motivo de la Visita y Contacto' : 'Occasion & Guest Details'}</span>
            </label>

            {/* Occasion Tags */}
            <div className="flex flex-wrap gap-2">
              {occasionsList.map((occ, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setOccasion(occ.es)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                    occasion === occ.es
                      ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {language === 'es' ? occ.es : occ.en}
                </button>
              ))}
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  {language === 'es' ? 'Nombre del Titular' : 'Lead Guest Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-amber-500" />
                  {language === 'es' ? 'Correo de Confirmación' : 'Confirmation Email'} *
                </label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-amber-500" />
                  {language === 'es' ? 'Teléfono Móvil' : 'Phone'} *
                </label>
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'es' ? 'Peticiones Especiales o Alergias Alimentarias' : 'Special Requests or Dietary Allergens'}
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder={language === 'es' ? 'Ej: Silla de bebé, intolerancia al marisco, mesa tranquila...' : 'e.g. High chair needed, seafood allergy, quiet corner...'}
                className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-amber-500 outline-none h-16 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{language === 'es' ? 'Confirmación 100% inmediata sin coste de reserva' : '100% Instant free booking in Firebase'}</span>
            </div>

            <button
              type="submit"
              id="btn-confirm-reservation-submit"
              className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs sm:text-sm px-8 py-3.5 rounded-2xl shadow-md hover:shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              {language === 'es' ? 'Confirmar Reserva de Mesa' : 'Confirm Table Booking'}
            </button>
          </div>
        </form>
      )}

      {/* Existing User Bookings Section */}
      {reservations.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-amber-500" />
            <span>{language === 'es' ? 'Tus Reservaciones en L’AURA' : 'Your Booked Tables at L’AURA'}</span>
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {reservations.map((res) => (
              <div key={res.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60">
                      {res.reservationCode}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{res.guestName}</span>
                    <span className="text-slate-400">({res.guestsCount} personas)</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-1">
                    📅 {res.date} a las {res.time}h • Zona: <span className="capitalize">{res.seatingArea}</span> • {res.tableAssigned || 'Mesa asignada'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                    res.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' :
                    res.status === 'seated' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {res.status}
                  </span>

                  {res.status === 'confirmed' && (
                    <button
                      onClick={() => updateReservationStatus(res.id, 'cancelled')}
                      className="text-rose-500 hover:text-rose-600 underline text-[11px] cursor-pointer"
                    >
                      {language === 'es' ? 'Cancelar' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
