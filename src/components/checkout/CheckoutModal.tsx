import React, { useState } from 'react';
import { useTasty } from '../../context/TastyContext';
import { 
  X, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Clock, 
  CreditCard, 
  Banknote, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CheckoutModal: React.FC = () => {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    total, 
    subtotal, 
    deliveryFee, 
    serviceFee, 
    tip, 
    discount, 
    orderType, 
    selectedLocation, 
    language,
    placeOrder 
  } = useTasty();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // Customer form fields
  const [name, setName] = useState('Alejandro Morales');
  const [email, setEmail] = useState('alejandro.m@example.com');
  const [phone, setPhone] = useState('+34 622 998 114');
  const [street, setStreet] = useState('Calle de Serrano 45, 4º Dcha');
  const [city, setCity] = useState(selectedLocation.city);
  const [zip, setZip] = useState('28001');
  const [addressNotes, setAddressNotes] = useState('Portería principal, timbre Morales');
  const [tableNumber, setTableNumber] = useState('Mesa 4');

  // Schedule & notes
  const [scheduleType, setScheduleType] = useState<'asap' | 'scheduled'>('asap');
  const [scheduledTime, setScheduledTime] = useState('21:30');
  const [orderNotes, setOrderNotes] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'paypal' | 'applepay'>('card');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4920');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('884');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isCheckoutOpen) return null;

  const handleNextStep = () => {
    setErrorMsg(null);
    if (step === 1) {
      if (!name.trim() || !phone.trim() || !email.trim()) {
        setErrorMsg(language === 'es' ? 'Por favor completa todos tus datos de contacto' : 'Please fill all required contact fields');
        return;
      }
      if (orderType === 'delivery' && !street.trim()) {
        setErrorMsg(language === 'es' ? 'La dirección de entrega es obligatoria' : 'Delivery street address is required');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    setTimeout(() => {
      placeOrder(
        {
          name,
          email,
          phone,
          deliveryAddress: orderType === 'delivery' ? { street, city, zip, notes: addressNotes } : undefined,
          tableNumber: orderType === 'dinein' ? tableNumber : undefined
        },
        paymentMethod,
        orderNotes
      );
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div 
      id="checkout-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        id="checkout-modal-card"
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              {language === 'es' ? `Paso ${step} de 3` : `Step ${step} of 3`}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
              {step === 1 && (language === 'es' ? 'Datos de Contacto y Entrega' : 'Contact & Delivery Address')}
              {step === 2 && (language === 'es' ? 'Horario e Instrucciones Especiales' : 'Delivery Slot & Special Notes')}
              {step === 3 && (language === 'es' ? 'Método de Pago Seguro' : 'Secure Payment Method')}
            </h2>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            id="close-checkout-modal-btn"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div className="grid grid-cols-3 gap-2 px-6 pt-3 bg-slate-50/50 dark:bg-slate-950/50">
          <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
          <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
          <div className={`h-1.5 rounded-full transition-all ${step >= 3 ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-sm">
          {errorMsg && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: CONTACT & ADDRESS */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-500" />
                    {language === 'es' ? 'Nombre Completo' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-500" />
                    {language === 'es' ? 'Teléfono Móvil' : 'Mobile Phone'} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-500" />
                  {language === 'es' ? 'Correo Electrónico (para el recibo)' : 'Email (for receipt)'} *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 outline-none"
                />
              </div>

              {/* Delivery Address if orderType is delivery */}
              {orderType === 'delivery' && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    {language === 'es' ? 'Dirección de Entrega' : 'Delivery Address'}
                  </h4>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {language === 'es' ? 'Calle, Número, Piso y Puerta' : 'Street Address, Floor, Door'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Ej: Calle Serrano 45, 4º Dcha"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{language === 'es' ? 'Ciudad' : 'City'}</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{language === 'es' ? 'Código Postal' : 'ZIP Code'}</label>
                      <input
                        type="text"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {language === 'es' ? 'Instrucciones para el repartidor (opcional)' : 'Driver delivery notes'}
                    </label>
                    <input
                      type="text"
                      value={addressNotes}
                      onChange={(e) => setAddressNotes(e.target.value)}
                      placeholder="Ej: Portería principal, llamar si no contesta"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}

              {/* Table number if dine-in */}
              {orderType === 'dinein' && (
                <div className="space-y-1 pt-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {language === 'es' ? 'Número o Nombre de tu Mesa' : 'Table Number'}
                  </label>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SCHEDULE & SPECIAL NOTES */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                  {language === 'es' ? '¿Cuándo deseas tu pedido?' : 'When would you like your order?'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setScheduleType('asap')}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                      scheduleType === 'asap'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-slate-900 dark:text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs sm:text-sm">{language === 'es' ? 'Lo antes posible (ASAP)' : 'As Soon As Possible (ASAP)'}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{selectedLocation.deliveryTimeEstimate}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScheduleType('scheduled')}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                      scheduleType === 'scheduled'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-slate-900 dark:text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs sm:text-sm">{language === 'es' ? 'Programar Horario' : 'Schedule Slot'}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{language === 'es' ? 'Elegir hora hoy' : 'Select today slot'}</div>
                    </div>
                  </button>
                </div>

                {scheduleType === 'scheduled' && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{language === 'es' ? 'Seleccionar franja horaria:' : 'Select time slot:'}</label>
                    <select
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
                    >
                      <option value="20:00">20:00 - 20:30</option>
                      <option value="20:30">20:30 - 21:00</option>
                      <option value="21:00">21:00 - 21:30</option>
                      <option value="21:30">21:30 - 22:00</option>
                      <option value="22:00">22:00 - 22:30</option>
                      <option value="22:30">22:30 - 23:00</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                  {language === 'es' ? 'Notas generales del pedido' : 'General Order Notes'}
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder={language === 'es' ? 'Añadir comentarios para el restaurante...' : 'Add comments for the kitchen or delivery...'}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-amber-500 outline-none h-20 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Quick Order Breakdown Recap */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="font-bold text-slate-900 dark:text-white text-xs mb-1 uppercase tracking-wider">{language === 'es' ? 'Resumen' : 'Summary'}</div>
                <div className="flex justify-between">
                  <span>{cart.length} {language === 'es' ? 'artículos' : 'items'}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">€{subtotal.toFixed(2)}</span>
                </div>
                {orderType === 'delivery' && (
                  <div className="flex justify-between">
                    <span>{language === 'es' ? 'Envío' : 'Delivery'}</span>
                    <span>{deliveryFee === 0 ? 'Gratis' : `€${deliveryFee.toFixed(2)}`}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>Total</span>
                  <span className="text-amber-600 dark:text-amber-400 font-black text-sm">€{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                {language === 'es' ? 'Seleccionar Forma de Pago' : 'Select Payment Method'}
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                    paymentMethod === 'card' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 font-bold text-slate-900 dark:text-white shadow-xs' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs">{language === 'es' ? 'Tarjeta Bancaria' : 'Credit Card'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                    paymentMethod === 'cash' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 font-bold text-slate-900 dark:text-white shadow-xs' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs">{language === 'es' ? 'Efectivo al Recibir' : 'Cash on Delivery'}</span>
                </button>
              </div>

              {paymentMethod === 'card' && (
                <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{language === 'es' ? 'Número de Tarjeta' : 'Card Number'}</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{language === 'es' ? 'Caducidad' : 'MM/YY'}</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">CVC</label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        maxLength={4}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300">
                  {language === 'es'
                    ? '💵 Pagarás en efectivo al momento de la entrega o recogida. Por favor ten el importe aproximado listo.'
                    : '💵 You will pay cash upon delivery or pickup. Please have approximate change ready.'}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{language === 'es' ? 'Transacción segura certificada SSL 256-bit y Firebase Cloud' : '256-bit SSL certified secure checkout & Firebase Cloud'}</span>
              </div>
            </form>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              {language === 'es' ? '← Atrás' : '← Back'}
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-black shadow-md hover:shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>{language === 'es' ? 'Continuar' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              id="confirm-place-order-final-btn"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl text-xs sm:text-sm font-black shadow-md hover:shadow-lg flex items-center gap-2 transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{language === 'es' ? `Confirmar Comanda €${total.toFixed(2)}` : `Confirm Order €${total.toFixed(2)}`}</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
