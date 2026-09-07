import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  Utensils, 
  MessageSquare,
  Building2,
  Sparkles
} from 'lucide-react';
import { useTasty } from '../../context/TastyContext';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const { negocioInfo } = useTasty();
  const [name, setName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
        setName('');
        setRestaurantName('');
        setEmail('');
        setPhone('');
        setMessage('');
      }, 2500);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative transition-colors duration-300 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer z-10"
          aria-label="Cerrar modal de contacto"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            {negocioInfo?.logo ? (
              <img 
                src={negocioInfo.logo} 
                alt={negocioInfo.nombre}
                className="w-10 h-10 rounded-2xl object-cover border border-amber-500/30 shadow-md bg-slate-900 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 shrink-0">
                <Utensils className="w-5 h-5 stroke-[2.5]" />
              </div>
            )}
            <div>
              <div className="font-mono text-lg sm:text-xl font-black tracking-wider text-slate-900 dark:text-white uppercase leading-none truncate max-w-xs">
                {negocioInfo?.nombre || 'Tasty Restaurant'}
              </div>
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 truncate block mt-0.5">
                {negocioInfo?.eslogan || 'Atención & Reservas'}
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Contacto & Atención al Cliente
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Comunícate directamente con la administración de {negocioInfo?.nombre || 'nuestro restaurante'}.
            </p>
          </div>

          {/* Quick info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold">
                <Mail className="w-3.5 h-3.5" />
                <span>Correo Directo</span>
              </div>
              <p className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200 truncate">
                {negocioInfo?.email || 'contacto@tasty.com'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold">
                <Phone className="w-3.5 h-3.5" />
                <span>Línea / WhatsApp</span>
              </div>
              <p className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200 truncate">
                {negocioInfo?.telefono || '+57 300 123 4567'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>Horario de Atención</span>
              </div>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                {negocioInfo?.horarios || 'Lun - Dom: 12:00 PM - 11:00 PM'}
              </p>
            </div>
          </div>

          {/* Contact form */}
          {isSubmitted ? (
            <div className="py-12 px-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/30">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Mensaje recibido con éxito
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                Gracias por comunicarte con Milenia. Un especialista de nuestro equipo revisará tus requerimientos y te contactará a la brevedad.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Ej. Martín Velásquez"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Restaurante / Negocio *</span>
                  </label>
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    required
                    placeholder="Ej. Cava & Brasa Gourmet"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Correo Electrónico *</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="martin@mirestaurante.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Teléfono de Contacto</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 0192"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mensaje o Consulta</span>
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Cuéntanos brevemente sobre la operación de tu restaurante o tu consulta técnica..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Enviando mensaje...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar Mensaje a Milenia</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
