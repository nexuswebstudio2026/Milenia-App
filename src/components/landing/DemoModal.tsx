import React, { useState } from 'react';
import { X, Sparkles, PhoneCall, CheckCircle2, Building, User, MapPin, Hash, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [city, setCity] = useState('Bogotá, D.C.');
  const [whatsapp, setWhatsapp] = useState('');
  const [tablesCount, setTablesCount] = useState('12');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const handleOpenWhatsAppDirectly = () => {
    const text = encodeURIComponent(
      `¡Hola Milenia! Solicito una demo personalizada para mi restaurante:\n` +
      `👤 Nombre: ${name || 'Propietario'}\n` +
      `🍽️ Restaurante: ${restaurantName || 'Restaurante'}\n` +
      `📍 Ciudad: ${city}\n` +
      `🪑 Mesas: ${tablesCount}\n` +
      `📱 WhatsApp: ${whatsapp}`
    );
    window.open(`https://wa.me/573043470984?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-white shadow-2xl relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Demo Personalizada Gratis</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Comprueba Milenia en tu Restaurante
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Te mostramos el sistema en vivo adaptado a la carta y mesas de tu negocio.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tu Nombre y Apellido</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Andrés Morales"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none text-white text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nombre del Restaurante / Asadero</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Parrilla & Leña La 93"
                  value={restaurantName}
                  onChange={e => setRestaurantName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none text-white text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ciudad</span>
                  </label>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none text-white text-xs font-medium cursor-pointer"
                  >
                    <option value="Bogotá, D.C.">Bogotá, D.C.</option>
                    <option value="Medellín">Medellín</option>
                    <option value="Cali">Cali</option>
                    <option value="Barranquilla">Barranquilla</option>
                    <option value="Bucaramanga">Bucaramanga</option>
                    <option value="Cartagena">Cartagena</option>
                    <option value="Pereira">Pereira / Eje Cafetero</option>
                    <option value="Otra ciudad">Otra ciudad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-amber-400" />
                    <span>N° de Mesas</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="150"
                    value={tablesCount}
                    onChange={e => setTablesCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none text-white text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Número de WhatsApp (Colombia)</span>
                </label>
                <div className="flex gap-2">
                  <span className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-mono font-bold text-xs flex items-center">
                    +57
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="300 123 4567"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none text-white text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Agendar Mi Demostración Gratuita</span>
            </button>

            <p className="text-[11px] text-center text-slate-500">
              🔒 Cero spam. Solo un asesor gastronómico te contactará para coordinar el horario de la demo.
            </p>
          </form>
        ) : (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">
                ¡Solicitud Recibida con Éxito!
              </h3>
              <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto leading-relaxed">
                Gracias, <strong className="text-amber-400">{name}</strong>. Hemos registrado a <strong className="text-white">{restaurantName}</strong> para tu demo en vivo.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-3">
              <p className="font-semibold text-emerald-400">
                ¿Deseas atención inmediata en este momento?
              </p>
              <button
                type="button"
                onClick={handleOpenWhatsAppDirectly}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center justify-center gap-2 cursor-pointer transition shadow-md"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Abrir Chat de WhatsApp Directo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-300 font-bold"
            >
              Cerrar esta ventana
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
