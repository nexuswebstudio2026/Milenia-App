import React, { useState } from 'react';
import { useTasty } from '../../context/TastyContext';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Smartphone, 
  CreditCard, 
  QrCode, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Receipt, 
  Info, 
  X, 
  Truck, 
  Utensils, 
  Store,
  ChevronRight,
  Sparkles,
  Building2,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCop } from '../../utils/currency';
import { Order, OrderCustomerInfo } from '../../types';
import confetti from 'canvas-confetti';

export const COLOMBIAN_PSE_BANKS = [
  'Bancolombia',
  'Davivienda',
  'Nequi',
  'Nu Colombia (Nu Bank)',
  'Lulo Bank',
  'Banco de Bogotá',
  'BBVA Colombia',
  'Scotiabank Colpatria',
  'Banco de Occidente',
  'Banco Popular',
  'Banco Agrario de Colombia',
  'Banco Itaú',
  'Dale! (Grupo Aval)',
  'RappiPay / Daviplata'
];

interface CartProps {
  onClose?: () => void;
}

export const Cart: React.FC<CartProps> = ({ onClose }) => {
  const { 
    cart, 
    removeFromCart, 
    updateCartItemQuantity, 
    clearCart,
    subtotal, 
    deliveryFee, 
    serviceFee, 
    tip, 
    setTip, 
    discount, 
    promoCode, 
    applyPromoCode, 
    removePromoCode, 
    total, 
    orderType, 
    setOrderType,
    currentTenant, 
    placeOrder, 
    showToast,
    setIsCartOpen 
  } = useTasty();

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment_details' | 'processing' | 'success'>('cart');
  const [selectedLocalMethod, setSelectedLocalMethod] = useState<'nequi' | 'daviplata' | 'pse' | 'card_wompi'>('nequi');
  
  // Customer info
  const [customerName, setCustomerName] = useState('Juan David Gómez');
  const [customerPhone, setCustomerPhone] = useState('3104589201');
  const [customerEmail, setCustomerEmail] = useState('juandavid@gmail.com');
  const [customerAddress, setCustomerAddress] = useState('Calle 85 # 14-22, Apto 402');
  const [customerDocumentType, setCustomerDocumentType] = useState('CC');
  const [customerDocumentId, setCustomerDocumentId] = useState('1020456789');
  
  // Method specific inputs
  const [nequiPhone, setNequiPhone] = useState('3104589201');
  const [daviplataPhone, setDaviplataPhone] = useState('3104589201');
  const [daviplataOtp, setDaviplataOtp] = useState('');
  const [selectedPseBank, setSelectedPseBank] = useState('Bancolombia');
  
  // Payment simulation state
  const [pushSent, setPushSent] = useState(false);
  const [wompiTxId, setWompiTxId] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Calculations
  const subtotalCop = subtotal * 4300;
  const deliveryCop = orderType === 'delivery' ? deliveryFee * 4300 : 0;
  const discountCop = discount * subtotalCop;
  const impoconsumoCop = Math.round((subtotalCop - discountCop) * 0.08); // 8% Impoconsumo Colombia
  const tipAmountCop = tip * 4300;
  const finalTotalCop = Math.round(subtotalCop - discountCop + deliveryCop + impoconsumoCop + tipAmountCop);

  const handleTriggerNequiPush = () => {
    setPushSent(true);
    showToast('Push Enviado a Nequi', 'Revisa tu celular y aprueba la solicitud de pago.', 'info');
  };

  const handleProcessWompiPayment = async () => {
    setCheckoutStep('processing');
    const generatedTx = `WOMPI-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setWompiTxId(generatedTx);

    // Simulate Wompi webhook / verification latency
    setTimeout(() => {
      try {
        const customerInfo: OrderCustomerInfo = {
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          deliveryAddress: orderType === 'delivery' ? {
            street: customerAddress,
            city: currentTenant.city || 'Colombia',
            zip: '110111'
          } : undefined
        };

        const result = placeOrder(
          customerInfo,
          'card',
          `Pago simulado con Wompi (${selectedLocalMethod.toUpperCase()}) - Ref: ${generatedTx}`
        );

        setConfirmedOrder(result);
        setCheckoutStep('success');
        
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }

      } catch (err) {
        showToast('Error en Pago', 'No se pudo procesar la transacción.', 'error');
        setCheckoutStep('payment_details');
      }
    }, 1800);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      
      {/* ------------------------------------------------------------- */}
      {/* HEADER                                                        */}
      {/* ------------------------------------------------------------- */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold shadow-md"
            style={{ backgroundColor: currentTenant.branding?.primaryColor || '#ea580c' }}
          >
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-slate-900 dark:text-white text-base">
              {checkoutStep === 'success' ? '¡Pago Exitoso!' : checkoutStep === 'payment_details' ? 'Pasarela de Pago Wompi' : 'Tu Pedido en Alta Cocina'}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {currentTenant.name} • NIT: {currentTenant.branding?.nit}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* BODY                                                          */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
        
        {/* STEP 1: CART ITEMS VIEW */}
        {checkoutStep === 'cart' && (
          <>
            {/* Delivery Type Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setOrderType('delivery')}
                className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  orderType === 'delivery'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Domicilio</span>
              </button>

              <button
                onClick={() => setOrderType('pickup')}
                className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  orderType === 'pickup'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Recoger</span>
              </button>

              <button
                onClick={() => setOrderType('dinein')}
                className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  orderType === 'dinein'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>En Mesa</span>
              </button>
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-serif font-bold text-slate-800 dark:text-slate-200">Tu bolsa está vacía</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">Explora el menú gourmet de {currentTenant.name} y agrega tus platos favoritos.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.cartId} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <img src={item.menuItem.image} alt={item.menuItem.name} className="w-14 h-14 rounded-xl object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{item.menuItem.name}</h4>
                        <p className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold">{formatCop(item.menuItem.price * 4300)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartItemQuantity(item.cartId, -1)}
                        className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateCartItemQuantity(item.cartId, 1)}
                        className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Impoconsumo & Tip Selector */}
            {cart.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Propina Voluntaria al Equipo (10% Ley Colombia)
                  </span>
                  <span>{formatCop(tipAmountCop)}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {[0, 0.05, 0.10, 0.15].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setTip((subtotalCop * rate) / 4300)}
                      className={`flex-1 py-1.5 rounded-xl font-bold text-[11px] transition cursor-pointer ${
                        Math.abs(tipAmountCop - Math.round(subtotalCop * rate)) < 500
                          ? 'bg-amber-500 text-slate-950 font-extrabold'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {rate === 0 ? 'Sin Propina' : `${rate * 100}%`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* STEP 2: LOCAL PAYMENT GATEWAY (WOMPI / NEQUI / DAVIPLATA / PSE) */}
        {checkoutStep === 'payment_details' && (
          <div className="space-y-4 text-xs">
            
            {/* Wompi Security Header Banner */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white text-[11px]">Pasarela Wompi Colombia (Bancolombia S.A.)</p>
                  <p className="text-[10px] text-slate-400">Encriptación SHA-256 • Facturación Electrónica DIAN</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Sandbox Activo
              </span>
            </div>

            {/* Payment Method Selector Pills (Nequi, Daviplata, PSE, Tarjeta) */}
            <div className="space-y-1.5">
              <label className="block text-slate-700 dark:text-slate-300 font-bold">Selecciona tu Medio de Pago:</label>
              
              <div className="grid grid-cols-2 gap-2.5">
                
                {/* 1. Nequi */}
                <button
                  type="button"
                  onClick={() => setSelectedLocalMethod('nequi')}
                  className={`p-3 rounded-2xl border transition flex items-center gap-2.5 text-left cursor-pointer ${
                    selectedLocalMethod === 'nequi'
                      ? 'bg-purple-950/40 border-purple-500 shadow-md ring-1 ring-purple-500/50 text-white'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs">Nequi</p>
                    <p className="text-[10px] opacity-70">Push / Notificación</p>
                  </div>
                </button>

                {/* 2. Daviplata */}
                <button
                  type="button"
                  onClick={() => setSelectedLocalMethod('daviplata')}
                  className={`p-3 rounded-2xl border transition flex items-center gap-2.5 text-left cursor-pointer ${
                    selectedLocalMethod === 'daviplata'
                      ? 'bg-rose-950/40 border-rose-500 shadow-md ring-1 ring-rose-500/50 text-white'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold shrink-0">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs">Daviplata</p>
                    <p className="text-[10px] opacity-70">Código OTP / Dinámica</p>
                  </div>
                </button>

                {/* 3. PSE */}
                <button
                  type="button"
                  onClick={() => setSelectedLocalMethod('pse')}
                  className={`p-3 rounded-2xl border transition flex items-center gap-2.5 text-left cursor-pointer ${
                    selectedLocalMethod === 'pse'
                      ? 'bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500/50 text-white'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs">PSE (ACH)</p>
                    <p className="text-[10px] opacity-70">Bancos de Colombia</p>
                  </div>
                </button>

                {/* 4. Tarjetas Wompi */}
                <button
                  type="button"
                  onClick={() => setSelectedLocalMethod('card_wompi')}
                  className={`p-3 rounded-2xl border transition flex items-center gap-2.5 text-left cursor-pointer ${
                    selectedLocalMethod === 'card_wompi'
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/50 text-white'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs">Tarjetas</p>
                    <p className="text-[10px] opacity-70">Crédito / Débito</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Dynamic Local Inputs based on Method */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              
              {/* NEQUI INPUTS */}
              {selectedLocalMethod === 'nequi' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4" /> Pago Directo Nequi
                    </span>
                    <span className="text-[10px] text-slate-500">Sin comisiones adicionales</span>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Número de Celular Nequi:</label>
                    <div className="flex gap-2">
                      <div className="bg-slate-200 dark:bg-slate-800 px-3 py-2 rounded-xl font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center">
                        🇨🇴 +57
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="310 123 4567"
                        value={nequiPhone}
                        onChange={(e) => setNequiPhone(e.target.value)}
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTriggerNequiPush}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>{pushSent ? '✓ Notificación Enviada al Celular' : 'Enviar Solicitud a App Nequi'}</span>
                  </button>

                  {pushSent && (
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[11px] text-purple-300 text-center animate-pulse">
                      📱 Abre tu aplicación Nequi y presiona "Aceptar" para completar {formatCop(finalTotalCop)}.
                    </div>
                  )}
                </div>
              )}

              {/* DAVIPLATA INPUTS */}
              {selectedLocalMethod === 'daviplata' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4" /> Pago con Daviplata
                    </span>
                    <span className="text-[10px] text-slate-500">Banco Davivienda</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Celular Daviplata:</label>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="315 889 0011"
                        value={daviplataPhone}
                        onChange={(e) => setDaviplataPhone(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Código OTP / Clave Dinámica:</label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="6 dígitos OTP"
                        value={daviplataOtp}
                        onChange={(e) => setDaviplataOtp(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 tracking-widest"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PSE INPUTS */}
              {selectedLocalMethod === 'pse' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" /> Pagos Seguros en Línea (PSE)
                    </span>
                    <span className="text-[10px] text-slate-500">Débito ACH</span>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Selecciona tu Entidad Financiera:</label>
                    <select
                      value={selectedPseBank}
                      onChange={(e) => setSelectedPseBank(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {COLOMBIAN_PSE_BANKS.map(bank => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Tipo Doc:</label>
                      <select
                        value={customerDocumentType}
                        onChange={(e) => setCustomerDocumentType(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="CC">CC</option>
                        <option value="NIT">NIT</option>
                        <option value="CE">CE</option>
                        <option value="PP">Pasaporte</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Número de Documento:</label>
                      <input
                        type="text"
                        placeholder="1.020.456.789"
                        value={customerDocumentId}
                        onChange={(e) => setCustomerDocumentId(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CARD INPUTS */}
              {selectedLocalMethod === 'card_wompi' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4" /> Tarjeta Crédito / Débito Wompi
                    </span>
                    <span className="text-[10px] text-slate-500">Tokenización Segura</span>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Número de Tarjeta:</label>
                    <input
                      type="text"
                      placeholder="4500 •••• •••• 1234"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Vencimiento:</label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-mono text-center font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">CVV / CVC:</label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="•••"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-mono text-center font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Contact Inputs */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 text-[10px] font-semibold">Nombre para Factura:</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] font-semibold">Email para Factura DIAN:</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {orderType === 'delivery' && (
                  <div>
                    <label className="block text-slate-500 text-[10px] font-semibold">Dirección de Entrega:</label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* STEP 3: PROCESSING OVERLAY */}
        {checkoutStep === 'processing' && (
          <div className="py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mx-auto" />
            <h4 className="font-serif font-bold text-lg text-slate-900 dark:text-white">Procesando con Wompi Colombia...</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Validando fondos, emitiendo factura electrónica con CUFE y enviando comanda a la cocina de {currentTenant.name}.
            </p>
          </div>
        )}

        {/* STEP 4: SUCCESS CONFIRMATION */}
        {checkoutStep === 'success' && confirmedOrder && (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-2xl">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white">¡Pago Confirmado & Pedido en Marcha!</h3>
              <p className="text-xs text-slate-500 mt-1">Comanda #{confirmedOrder.orderNumber} enviada a cocina</p>
            </div>

            {/* DIAN & Wompi Receipt Box */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
                <span>Restaurante:</span>
                <span>{currentTenant.name}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Ref. Wompi:</span>
                <span className="font-mono text-blue-500 font-bold">{wompiTxId}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Factura Electrónica:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{confirmedOrder.electronicInvoiceNumber || 'SETP-9012'}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Medio de Pago:</span>
                <span className="uppercase font-bold text-emerald-500">{selectedLocalMethod}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total Pagado:</span>
                <span className="font-mono font-bold text-amber-500 text-sm">{formatCop(finalTotalCop)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                clearCart();
                setCheckoutStep('cart');
                if (onClose) onClose();
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer"
            >
              Cerrar y Ver Estado en Tiempo Real
            </button>
          </div>
        )}

      </div>

      {/* ------------------------------------------------------------- */}
      {/* FOOTER: TOTAL & ACTION BUTTON                                 */}
      {/* ------------------------------------------------------------- */}
      {checkoutStep !== 'success' && checkoutStep !== 'processing' && (
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0 space-y-3">
          
          {/* Price Breakdown */}
          <div className="text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal Platos:</span>
              <span className="font-mono font-semibold">{formatCop(subtotalCop)}</span>
            </div>

            {orderType === 'delivery' && (
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Domicilio Express:</span>
                <span className="font-mono font-semibold">{formatCop(deliveryCop)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Impoconsumo (8% DIAN):</span>
              <span className="font-mono font-semibold">{formatCop(impoconsumoCop)}</span>
            </div>

            {tipAmountCop > 0 && (
              <div className="flex justify-between text-purple-600 dark:text-purple-400 font-semibold">
                <span>Propina Voluntaria (10%):</span>
                <span className="font-mono">{formatCop(tipAmountCop)}</span>
              </div>
            )}

            <div className="flex justify-between font-serif font-bold text-base text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>Total a Pagar:</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{formatCop(finalTotalCop)}</span>
            </div>
          </div>

          {/* Action Trigger */}
          {checkoutStep === 'cart' ? (
            <button
              disabled={cart.length === 0}
              onClick={() => setCheckoutStep('payment_details')}
              className={`w-full py-3 rounded-2xl font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2 ${
                cart.length === 0
                  ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-amber-500/20'
              }`}
            >
              <span>Continuar a Pagar con Wompi (Nequi / Daviplata / PSE)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCheckoutStep('cart')}
                className="px-4 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl transition cursor-pointer"
              >
                Atrás
              </button>
              <button
                onClick={handleProcessWompiPayment}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-emerald-600/20"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Pagar {formatCop(finalTotalCop)} Ahora</span>
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
