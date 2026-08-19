import React, { useState } from 'react';
import { useTasty } from '../../context/TastyContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Tag, 
  ArrowRight, 
  Sparkles, 
  Truck, 
  Utensils, 
  Info,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
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
    selectedLocation, 
    config, 
    language,
    setIsCheckoutOpen
  } = useTasty();

  const [promoInput, setPromoInput] = useState('');

  if (!isCartOpen) return null;

  const freeDeliveryDiff = Math.max(0, config.freeDeliveryThreshold - subtotal);
  const freeDeliveryPercent = Math.min(100, Math.round((subtotal / config.freeDeliveryThreshold) * 100));

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoInput.trim()) {
      applyPromoCode(promoInput);
      setPromoInput('');
    }
  };

  return (
    <div 
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end animate-in fade-in"
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        id="cart-drawer-panel"
        className="w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-slate-200 dark:border-slate-800"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                {language === 'es' ? 'Tu Comanda' : 'Your Order'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {orderType === 'delivery' ? (language === 'es' ? '🛵 A Domicilio' : '🛵 Delivery') : orderType === 'pickup' ? (language === 'es' ? '🛍️ Para Recoger' : '🛍️ Pickup') : (language === 'es' ? '🍽️ Comer en Mesa' : '🍽️ Dine-in')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-500 hover:text-rose-600 px-2 py-1 rounded transition cursor-pointer font-semibold"
                title="Vaciar carrito"
              >
                {language === 'es' ? 'Vaciar' : 'Clear'}
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              id="close-cart-drawer-btn"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Delivery Bar for Delivery Orders */}
        {orderType === 'delivery' && (
          <div className="bg-amber-50/80 dark:bg-amber-950/30 px-4 py-2.5 border-b border-amber-200/60 dark:border-amber-900/40 shrink-0">
            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 mb-1 font-medium">
              <div className="flex items-center gap-1.5 text-amber-950 dark:text-amber-300">
                <Truck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                {freeDeliveryDiff === 0 ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                    {language === 'es' ? '🎉 ¡Envío GRATIS alcanzado!' : '🎉 Free delivery unlocked!'}
                  </span>
                ) : (
                  <span>
                    {language === 'es' ? `Añade €${freeDeliveryDiff.toFixed(2)} más para envío GRATIS` : `Add €${freeDeliveryDiff.toFixed(2)} for FREE delivery`}
                  </span>
                )}
              </div>
              <span className="font-bold text-amber-800 dark:text-amber-400 text-[11px]">{freeDeliveryPercent}%</span>
            </div>
            <div className="w-full bg-amber-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${freeDeliveryPercent}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                {language === 'es' ? 'Tu carrito está vacío' : 'Your cart is empty'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                {language === 'es'
                  ? 'Explora nuestra carta de alta cocina y añade tus platos favoritos para comenzar.'
                  : 'Explore our haute cuisine menu and add your favorite dishes to begin.'}
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 bg-amber-500 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-amber-600 transition cursor-pointer shadow-md"
              >
                {language === 'es' ? 'Ver la Carta' : 'Browse Menu'}
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const name = language === 'es' ? item.menuItem.name : (item.menuItem.nameEn || item.menuItem.name);
              return (
                <div key={item.cartId} className="pt-3 first:pt-0 flex gap-3">
                  {/* Thumbnail */}
                  <img
                    src={item.menuItem.image}
                    alt={name}
                    className="w-16 h-16 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug truncate">
                        {name}
                      </h4>
                      <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-amber-400 shrink-0">
                        €{item.totalPrice.toFixed(2)}
                      </span>
                    </div>

                    {/* Selected Options List */}
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 mt-0.5">
                        {item.selectedOptions.map((opt, i) => (
                          <div key={i} className="truncate">
                            • {opt.choiceName} {opt.price > 0 && `(+€${opt.price.toFixed(2)})`}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Special Instructions Note */}
                    {item.specialInstructions && (
                      <p className="text-[10px] text-amber-800 dark:text-amber-300 italic mt-0.5 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md inline-block">
                        "{item.specialInstructions}"
                      </p>
                    )}

                    {/* Quantity controls & Delete */}
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => updateCartItemQuantity(item.cartId, -1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartItemQuantity(item.cartId, 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition cursor-pointer"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout Actions */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-4 shrink-0">
            
            {/* Promo Code Form */}
            {promoCode ? (
              <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-2 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{promoCode}</span>
                </div>
                <button
                  onClick={removePromoCode}
                  className="text-emerald-700 dark:text-emerald-400 hover:underline text-[11px] cursor-pointer"
                >
                  {language === 'es' ? 'Quitar' : 'Remove'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder={language === 'es' ? 'Cupón (ej. MILENIA10)' : 'Promo (e.g. MILENIA10)'}
                  className="flex-1 text-xs px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl uppercase tracking-wider text-slate-800 dark:text-slate-200 placeholder:normal-case placeholder:tracking-normal focus:border-amber-500 outline-none"
                />
                <button
                  type="submit"
                  className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-amber-400 text-xs font-bold px-3.5 py-2 rounded-2xl transition cursor-pointer"
                >
                  {language === 'es' ? 'Aplicar' : 'Apply'}
                </button>
              </form>
            )}

            {/* Tip Selector */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                <span>{language === 'es' ? 'Propina para el equipo / repartidor' : 'Tip for staff & courier'}</span>
                <span className="font-bold text-slate-900 dark:text-white">€{tip.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {[0, 1.50, 2.50, 4.00].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setTip(amount)}
                    className={`py-1.5 rounded-xl font-bold border text-center transition cursor-pointer ${
                      tip === amount
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {amount === 0 ? '0' : `€${amount.toFixed(2)}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs border-t border-slate-200 dark:border-slate-800 pt-3 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>{language === 'es' ? 'Subtotal' : 'Subtotal'}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">€{subtotal.toFixed(2)}</span>
              </div>
              {orderType === 'delivery' && (
                <div className="flex justify-between">
                  <span>{language === 'es' ? 'Gastos de Envío' : 'Delivery Fee'}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 uppercase font-bold text-[10px]">{language === 'es' ? 'Gratis' : 'Free'}</span>
                    ) : (
                      `€${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{language === 'es' ? 'Tasa de Servicio (3%)' : 'Service Fee (3%)'}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">€{serviceFee.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>{language === 'es' ? 'Descuento Promoción' : 'Promo Discount'}</span>
                  <span>-€{discount.toFixed(2)}</span>
                </div>
              )}
              {tip > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{language === 'es' ? 'Propina' : 'Tip'}</span>
                  <span>+€{tip.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white border-t border-slate-300 dark:border-slate-700 pt-2">
                <span>{language === 'es' ? 'Total Final' : 'Total'}</span>
                <span className="text-amber-600 dark:text-amber-400 text-lg">€{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              id="proceed-to-checkout-btn"
              className="w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 py-3.5 px-4 rounded-2xl font-black text-sm shadow-md hover:shadow-lg shadow-amber-500/20 flex items-center justify-between transition-all cursor-pointer"
            >
              <span>{language === 'es' ? 'Tramitar Comanda' : 'Proceed to Checkout'}</span>
              <div className="flex items-center gap-1.5">
                <span>€{total.toFixed(2)}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
