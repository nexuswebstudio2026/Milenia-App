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
  AlertCircle,
  FileCheck,
  Building2,
  QrCode,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CheckoutModal: React.FC = () => {
  const { 
    currentTenant,
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
  const [phone, setPhone] = useState('+57 312 458 9920');
  const [street, setStreet] = useState('Carrera 7 # 72 - 41, Apto 502');
  const [city, setCity] = useState(selectedLocation.city || 'Bogotá D.C.');
  const [zip, setZip] = useState('110221');
  const [addressNotes, setAddressNotes] = useState('Portería con citófono');
  const [tableNumber, setTableNumber] = useState('Mesa 4');

  // Electronic Invoicing DIAN Fields
  const [reqElectronicInvoice, setReqElectronicInvoice] = useState(false);
  const [taxId, setTaxId] = useState('900.123.456-7');
  const [legalName, setLegalName] = useState('Soluciones Gastronómicas S.A.S.');
  const [invoiceEmail, setInvoiceEmail] = useState('facturas@ejemplo.com');

  // Schedule & notes
  const [scheduleType, setScheduleType] = useState<'asap' | 'scheduled'>('asap');
  const [scheduledTime, setScheduledTime] = useState('20:30');
  const [orderNotes, setOrderNotes] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'nequi' | 'daviplata' | 'pse' | 'card' | 'cash'>('nequi');
  const [pseBank, setPseBank] = useState('Bancolombia');
  const [nequiPhone, setNequiPhone] = useState('312 458 9920');
  const [cashGiven, setCashGiven] = useState('100000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isCheckoutOpen) return null;

  const formatCOP = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount);
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-6 text-white"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 border border-amber-500/40 text-amber-300">
                {currentTenant.name}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                NIT: {currentTenant.branding.nit}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {language === 'es' ? 'Finalizar Pedido' : 'Complete Order'}
            </h3>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Breadcrumb */}
        <div className="grid grid-cols-3 text-center border-b border-slate-800 bg-slate-950/60 text-xs font-bold">
          <div className={`py-3 ${step === 1 ? 'text-amber-400 border-b-2 border-amber-500' : 'text-slate-500'}`}>
            1. Datos & Mesa
          </div>
          <div className={`py-3 ${step === 2 ? 'text-amber-400 border-b-2 border-amber-500' : 'text-slate-500'}`}>
            2. Horario & Notas
          </div>
          <div className={`py-3 ${step === 3 ? 'text-amber-400 border-b-2 border-amber-500' : 'text-slate-500'}`}>
            3. Pago Colombia
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto text-xs">
          
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-300 flex items-center gap-2 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: CUSTOMER INFO */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Nombre Completo *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Teléfono Móvil (Colombia) *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Correo Electrónico *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                  required
                />
              </div>

              {orderType === 'dinein' && (
                <div className="space-y-1 pt-2">
                  <label className="text-slate-300 font-bold">Mesa / Ubicación:</label>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                  />
                </div>
              )}

              {orderType === 'delivery' && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Dirección de Entrega *</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Carrera 7 # 72 - 41, Apto 502"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Indicaciones para el Domiciliario:</label>
                    <input
                      type="text"
                      value={addressNotes}
                      onChange={(e) => setAddressNotes(e.target.value)}
                      placeholder="Portería, citófono..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* DIAN Electronic Invoicing Checkbox */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reqElectronicInvoice}
                    onChange={(e) => setReqElectronicInvoice(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                  />
                  <span className="font-bold text-slate-200">Requiero Factura Electrónica con NIT (DIAN)</span>
                </label>

                {reqElectronicInvoice && (
                  <div className="space-y-2.5 pt-2 border-t border-slate-800">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[11px] font-bold">NIT / Cédula:</label>
                        <input
                          type="text"
                          value={taxId}
                          onChange={(e) => setTaxId(e.target.value)}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                          placeholder="900.123.456-7"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[11px] font-bold">Razón Social:</label>
                        <input
                          type="text"
                          value={legalName}
                          onChange={(e) => setLegalName(e.target.value)}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                          placeholder="Empresa S.A.S."
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[11px] font-bold">Correo de Recepción de Facturas:</label>
                      <input
                        type="email"
                        value={invoiceEmail}
                        onChange={(e) => setInvoiceEmail(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                        placeholder="facturas@miempresa.com"
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* STEP 2: SCHEDULE & NOTES */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-bold text-slate-300">Horario de Despacho:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setScheduleType('asap')}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center gap-3 ${
                      scheduleType === 'asap'
                        ? 'border-amber-500 bg-amber-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold text-xs">Lo antes posible (ASAP)</div>
                      <div className="text-[10px] text-slate-400">15 - 25 minutos</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScheduleType('scheduled')}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center gap-3 ${
                      scheduleType === 'scheduled'
                        ? 'border-amber-500 bg-amber-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold text-xs">Programar Hora</div>
                      <div className="text-[10px] text-slate-400">Seleccionar turno</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Notas de Cocina (Término, Alergias):</label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Ej: Carne término 3/4, sin salpicaduras de picante..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                />
              </div>

              {/* Order Recap */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.length} ítems):</span>
                  <span className="font-bold text-white">{formatCOP(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impoconsumo DIAN (8% Incluido):</span>
                  <span className="font-bold text-amber-400">{formatCOP(Math.round(subtotal * 0.08))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Servicio Voluntario (Propina 10%):</span>
                  <span className="font-bold text-blue-400">{formatCOP(tip)}</span>
                </div>
                <div className="flex justify-between text-white font-black text-sm pt-2 border-t border-slate-800">
                  <span>Total a Pagar:</span>
                  <span className="text-emerald-400">{formatCOP(total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD COLOMBIA */}
          {step === 3 && (
            <div className="space-y-4">
              <label className="font-bold text-slate-300 block">Medios de Pago Autorizados Colombia:</label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('nequi')}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                    paymentMethod === 'nequi' 
                      ? 'border-purple-500 bg-purple-500/10 text-purple-300 font-bold' 
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                  <div className="font-black text-xs">NEQUI</div>
                  <div className="text-[10px] opacity-75">Push / QR</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('daviplata')}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                    paymentMethod === 'daviplata' 
                      ? 'border-red-500 bg-red-500/10 text-red-300 font-bold' 
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-red-400 mx-auto mb-1" />
                  <div className="font-black text-xs">DAVIPLATA</div>
                  <div className="text-[10px] opacity-75">Billetera</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('pse')}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                    paymentMethod === 'pse' 
                      ? 'border-blue-500 bg-blue-500/10 text-blue-300 font-bold' 
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <div className="font-black text-xs">PSE</div>
                  <div className="text-[10px] opacity-75">Bancos CO</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                    paymentMethod === 'card' 
                      ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold' 
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <div className="font-black text-xs">DATÁFONO</div>
                  <div className="text-[10px] opacity-75">Visa / MC</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer col-span-2 sm:col-span-1 ${
                    paymentMethod === 'cash' 
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold' 
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <div className="font-black text-xs">EFECTIVO</div>
                  <div className="text-[10px] opacity-75">Al recibir</div>
                </button>
              </div>

              {/* Payment Details Container */}
              {paymentMethod === 'nequi' && (
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-purple-300 font-bold">
                    <QrCode className="w-4 h-4" />
                    <span>Transferencia Nequi</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Envía a la cuenta Nequi del restaurante: <strong className="text-white font-mono">310 998 7654</strong> o autoriza la notificación push en tu celular.
                  </p>
                </div>
              )}

              {paymentMethod === 'pse' && (
                <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-2">
                  <label className="font-bold text-blue-300 block">Selecciona tu Banco PSE:</label>
                  <select
                    value={pseBank}
                    onChange={(e) => setPseBank(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-blue-500"
                  >
                    <option value="Bancolombia">Bancolombia</option>
                    <option value="Davivienda">Davivienda</option>
                    <option value="Nu Colombia (Cuenta Nu)">Nu Colombia</option>
                    <option value="Banco de Bogotá">Banco de Bogotá</option>
                    <option value="BBVA Colombia">BBVA Colombia</option>
                    <option value="Scotiabank Colpatria">Scotiabank Colpatria</option>
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2 text-slate-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Transacción cifrada y reportada a resolución DIAN #{currentTenant.branding.dianResolution}</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              ← Atrás
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              onClick={handleNextStep}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Confirmar Comanda {formatCOP(total)}</span>
            </button>
          )}
        </div>

      </motion.div>
    </div>
  );
};
