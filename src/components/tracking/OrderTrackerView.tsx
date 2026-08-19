import React, { useState } from 'react';
import { useTasty } from '../../context/TastyContext';
import { Order, OrderStatus } from '../../types';
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  Truck, 
  Home, 
  Phone, 
  MapPin, 
  Receipt, 
  PlayCircle, 
  RotateCcw, 
  ShoppingBag, 
  AlertCircle,
  ExternalLink,
  Store,
  UtensilsCrossed,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

export const OrderTrackerView: React.FC = () => {
  const { orders, activeOrder, setActiveOrder, updateOrderStatus, language, selectedLocation, config } = useTasty();
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const order: Order | null = activeOrder || (orders.length > 0 ? orders[0] : null);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {language === 'es' ? 'No tienes comandas recientes' : 'No recent orders found'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          {language === 'es' ? 'Realiza un pedido desde nuestra carta para rastrearlo en tiempo real.' : 'Place an order from our menu to track it in real time.'}
        </p>
      </div>
    );
  }

  const steps: { key: OrderStatus; labelEs: string; labelEn: string; icon: React.ReactNode; descEs: string; descEn: string }[] = [
    { 
      key: 'received', 
      labelEs: 'Comanda Recibida', 
      labelEn: 'Order Received', 
      icon: <Receipt className="w-4 h-4" />,
      descEs: 'Registrado en la nube de MILENIA',
      descEn: 'Registered in MILENIA Cloud'
    },
    { 
      key: 'confirmed', 
      labelEs: 'Confirmado por Chef', 
      labelEn: 'Kitchen Confirmed', 
      icon: <CheckCircle2 className="w-4 h-4" />,
      descEs: 'El jefe de cocina ha validado tu orden',
      descEn: 'The executive chef validated your ticket'
    },
    { 
      key: 'preparing', 
      labelEs: 'En Cocción & Emplatado', 
      labelEn: 'Artisan Preparation', 
      icon: <ChefHat className="w-4 h-4" />,
      descEs: 'Preparación de autor con ingredientes de temporada',
      descEn: 'Handcrafting with fine seasonal ingredients'
    },
    { 
      key: 'out_for_delivery', 
      labelEs: order.orderType === 'delivery' ? 'En Reparto Premium' : 'Listo para Recoger', 
      labelEn: order.orderType === 'delivery' ? 'Out for Delivery' : 'Ready for Pickup', 
      icon: order.orderType === 'delivery' ? <Truck className="w-4 h-4" /> : <Store className="w-4 h-4" />,
      descEs: order.orderType === 'delivery' ? 'El repartidor va de camino a tu ubicación' : 'Pasa por recepción con tu número de comanda',
      descEn: order.orderType === 'delivery' ? 'Courier is heading to your address' : 'Collect at the reception with order code'
    },
    { 
      key: 'delivered', 
      labelEs: order.orderType === 'delivery' ? 'Entregado' : 'Completado', 
      labelEn: order.orderType === 'delivery' ? 'Delivered' : 'Completed', 
      icon: <Home className="w-4 h-4" />,
      descEs: '¡Bon Appétit! Que disfrutes la experiencia',
      descEn: 'Bon Appétit! Enjoy the experience'
    }
  ];

  const statusOrder: OrderStatus[] = ['received', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
  const currentIndex = statusOrder.indexOf(order.status);

  // Simulation handler to advance next state
  const handleSimulateNextStep = () => {
    if (currentIndex < statusOrder.length - 1) {
      const nextStatus = statusOrder[currentIndex + 1];
      const notes: Record<OrderStatus, string> = {
        received: 'Comanda registrada en Firebase',
        confirmed: 'Validado por el Chef Ejecutivo',
        preparing: 'En cocinas de autor a fuego lento',
        ready: 'Emplatado y empacado térmicamente',
        out_for_delivery: 'Repartidor en ruta con el pedido',
        delivered: 'Entregado en mano con éxito',
        cancelled: 'Comanda cancelada'
      };
      updateOrderStatus(order.id, nextStatus, notes[nextStatus]);
    }
  };

  const handleResetSimulation = () => {
    updateOrderStatus(order.id, 'received', 'Reiniciada simulación');
  };

  return (
    <div id="order-tracker-view" className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      
      {/* Order Selector (if multiple orders exist) */}
      {orders.length > 1 && (
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">{language === 'es' ? 'Seleccionar Comanda Activa:' : 'Select Active Order:'}</span>
          <select
            value={order.id}
            onChange={(e) => {
              const selected = orders.find(o => o.id === e.target.value);
              if (selected) setActiveOrder(selected);
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-bold text-slate-900 dark:text-white focus:border-amber-500 outline-none"
          >
            {orders.map(o => (
              <option key={o.id} value={o.id}>
                #{o.orderNumber} - €{o.total.toFixed(2)} ({o.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main Status Hero Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div className="p-6 bg-slate-950 text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-800">
                {order.orderType === 'delivery' ? (language === 'es' ? '🛵 A Domicilio' : '🛵 Delivery') : (language === 'es' ? '🛍️ Recoger' : '🛍️ Pickup')}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1 text-white">
              {language === 'es' ? `Comanda #${order.orderNumber}` : `Order #${order.orderNumber}`}
            </h1>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">{language === 'es' ? 'Tiempo Estimado' : 'Estimated Time'}</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 flex items-center gap-1.5 justify-end">
              <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
              <span>{order.estimatedDeliveryTime}</span>
            </div>
          </div>
        </div>

        {/* Live Simulation Control Bar (Allows interactive testing) */}
        <div className="bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200/70 dark:border-amber-900/40 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-amber-950 dark:text-amber-200 font-medium">
            <PlayCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{language === 'es' ? 'Simulador de Cocina & Reparto en Vivo:' : 'Live Kitchen & Delivery Simulator:'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateNextStep}
              disabled={currentIndex >= statusOrder.length - 1}
              className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <span>{language === 'es' ? 'Avanzar Estado →' : 'Advance Status →'}</span>
            </button>
            <button
              onClick={handleResetSimulation}
              className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-medium px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
              title="Reiniciar a Recibido"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="p-6 sm:p-8">
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-5 left-8 right-8 h-1 bg-slate-100 dark:bg-slate-800 z-0">
              <div 
                className="bg-amber-500 h-full transition-all duration-500"
                style={{ width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
              {steps.map((step, idx) => {
                const isPassed = idx <= currentIndex;
                const isCurrent = idx === currentIndex;

                return (
                  <div key={step.key} className="flex md:flex-col items-start md:items-center text-left md:text-center gap-4 md:gap-2">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0 ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-200 dark:ring-amber-900/60 shadow-md scale-110 font-bold'
                        : isPassed
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}>
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : step.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className={`text-xs sm:text-sm font-bold ${isCurrent ? 'text-amber-600 dark:text-amber-400' : isPassed ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>
                        {language === 'es' ? step.labelEs : step.labelEn}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {language === 'es' ? step.descEs : step.descEn}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Interactive Simulated Map & Driver Card (for delivery) */}
        {order.orderType === 'delivery' && (
          <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Simulated Live Route Map */}
            <div className="relative h-56 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-800 flex items-center justify-center shadow-inner">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80"
                alt="Map route preview"
                className="w-full h-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
              
              {/* Simulated Pin Restaurant */}
              <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 bg-slate-950 text-amber-400 text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg flex items-center gap-1 border border-amber-500/30">
                <Store className="w-3 h-3 text-amber-400" />
                <span>{selectedLocation.name}</span>
              </div>

              {/* Simulated Pin Destination */}
              <div className="absolute bottom-1/4 right-1/4 -translate-x-1/2 -translate-y-1/2 bg-amber-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg flex items-center gap-1">
                <MapPin className="w-3 h-3 fill-white text-white" />
                <span>{order.customer.deliveryAddress?.street || 'Tu Domicilio'}</span>
              </div>

              {/* Simulated Animated Driver Marker */}
              {order.status === 'out_for_delivery' && (
                <motion.div
                  animate={{ 
                    x: [0, 40, 80, 40, 0],
                    y: [0, 20, 40, 20, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-xl flex items-center gap-1.5 border-2 border-white ring-4 ring-emerald-300/50"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{language === 'es' ? 'Repartidor en movimiento' : 'Courier en route'}</span>
                </motion.div>
              )}
            </div>

            {/* Driver Contact & Delivery Info */}
            <div className="space-y-4 flex flex-col justify-between">
              {order.driver ? (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm">
                        CM
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{order.driver.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{order.driver.vehicle}</div>
                      </div>
                    </div>

                    <a
                      href={`tel:${order.driver.phone}`}
                      className="p-2.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-600 dark:text-amber-400 rounded-xl transition"
                      title="Llamar al repartidor"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="text-xs bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">{language === 'es' ? 'Entrega en:' : 'Deliver to:'} </span>
                      {order.customer.deliveryAddress?.street}, {order.customer.deliveryAddress?.city}
                      {order.customer.deliveryAddress?.notes && (
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">Nota: "{order.customer.deliveryAddress.notes}"</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Receipt CTA Button */}
              <button
                onClick={() => setShowReceiptModal(true)}
                id="btn-view-receipt-modal"
                className="w-full bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
              >
                <Receipt className="w-4 h-4 text-amber-500" />
                <span>{language === 'es' ? 'Ver e Imprimir Recibo Oficial' : 'View & Print Receipt'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Items Breakdown List */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-amber-500" />
          <span>{language === 'es' ? 'Detalle de los Platos Solicitados' : 'Ordered Items Breakdown'}</span>
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
          {order.items.map((item, idx) => {
            const name = language === 'es' ? item.menuItem.name : (item.menuItem.nameEn || item.menuItem.name);
            return (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg text-xs">
                    {item.quantity}x
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{name}</div>
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.selectedOptions.map(o => o.choiceName).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  €{item.totalPrice.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Pricing totals */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex justify-between">
            <span>{language === 'es' ? 'Subtotal' : 'Subtotal'}</span>
            <span className="text-slate-900 dark:text-slate-200">€{order.subtotal.toFixed(2)}</span>
          </div>
          {order.deliveryFee > 0 && (
            <div className="flex justify-between">
              <span>{language === 'es' ? 'Envío' : 'Delivery'}</span>
              <span className="text-slate-900 dark:text-slate-200">€{order.deliveryFee.toFixed(2)}</span>
            </div>
          )}
          {order.serviceFee > 0 && (
            <div className="flex justify-between">
              <span>{language === 'es' ? 'Servicio' : 'Service Fee'}</span>
              <span className="text-slate-900 dark:text-slate-200">€{order.serviceFee.toFixed(2)}</span>
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>{language === 'es' ? 'Descuento' : 'Discount'} ({order.discountCode})</span>
              <span>-€{order.discount.toFixed(2)}</span>
            </div>
          )}
          {order.tip > 0 && (
            <div className="flex justify-between">
              <span>{language === 'es' ? 'Propina' : 'Tip'}</span>
              <span className="text-slate-900 dark:text-slate-200">+€{order.tip.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
            <span>Total</span>
            <span className="text-amber-600 dark:text-amber-400 font-black">€{order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <div className="text-center pb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
              <h4 className="font-black text-xl text-slate-900 dark:text-white">{config.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{selectedLocation.name} - {selectedLocation.phone}</p>
              <div className="mt-2 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 py-1 px-2.5 rounded-lg inline-block text-amber-600 dark:text-amber-400">
                RECIBO #{order.orderNumber}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Cliente:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{order.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Fecha:</span>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Pago:</span>
                <span className="capitalize font-semibold">{order.paymentMethod} ({order.paymentStatus})</span>
              </div>
            </div>

            <div className="py-2 border-t border-b border-dashed border-slate-300 dark:border-slate-700 space-y-1.5 text-xs">
              {order.items.map((it, i) => (
                <div key={i} className="flex justify-between">
                  <span>{it.quantity}x {language === 'es' ? it.menuItem.name : (it.menuItem.nameEn || it.menuItem.name)}</span>
                  <span>€{it.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white">
              <span>TOTAL PAGADO</span>
              <span className="text-amber-600 dark:text-amber-400">€{order.total.toFixed(2)}</span>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black py-2.5 rounded-xl transition cursor-pointer"
              >
                {language === 'es' ? 'Imprimir Recibo' : 'Print Receipt'}
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                {language === 'es' ? 'Cerrar' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
