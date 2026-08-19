import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wine, Sparkles, Plus, Check, UtensilsCrossed, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTasty } from '../../context/TastyContext';
import { WinePairing, SuggestedSide } from '../../types';

export const UpsellModal: React.FC = () => {
  const { 
    isUpsellOpen, 
    setIsUpsellOpen, 
    upsellItem, 
    addWinePairingToCart, 
    addSideToCart, 
    setIsCartOpen,
    language 
  } = useTasty();

  const [addedWine, setAddedWine] = useState(false);
  const [addedSide, setAddedSide] = useState(false);

  if (!isUpsellOpen || !upsellItem) return null;

  // Fallback wine pairing if item didn't provide a custom one
  const wine: WinePairing = upsellItem.winePairing || {
    id: 'wine-sommelier-selection',
    name: 'Selección Sommelier: Marqués de Riscal Reserva',
    nameEn: 'Sommelier Selection: Marqués de Riscal Reserva',
    vintage: '2019',
    grapeVariety: 'Tempranillo & Graciano',
    region: 'DOCa Rioja, España',
    description: 'Armonía perfecta con carnes y pastas nobles. Notas balsámicas, fruta madura y tostados nobles.',
    descriptionEn: 'Perfect harmony with prime meats and rich pastas. Balsamic notes, ripe berry fruit, and fine oak.',
    price: 7.80,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
    type: 'red'
  };

  // Fallback side dish if item didn't provide a custom one
  const side: SuggestedSide = upsellItem.suggestedSide || {
    id: 'side-pure-trufado-signature',
    name: 'Puré Cremoso Robuchon con Trufa Negra',
    nameEn: 'Robuchon Velvety Truffle Potato Puree',
    description: 'Mantecado con mantequilla francesa de Normandía y láminas de trufa negra silvestre.',
    descriptionEn: 'Whipped with French Normandy butter and freshly shaved wild black truffle.',
    price: 5.50,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
  };

  const handleAddWine = () => {
    addWinePairingToCart(wine);
    setAddedWine(true);
  };

  const handleAddSide = () => {
    addSideToCart(side);
    setAddedSide(true);
  };

  const handleClose = () => {
    setIsUpsellOpen(false);
    setAddedWine(false);
    setAddedSide(false);
  };

  const handleGoToCart = () => {
    handleClose();
    setIsCartOpen(true);
  };

  return (
    <AnimatePresence>
      <div 
        id="milenia-upsell-modal-overlay" 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          id="milenia-upsell-modal-container"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-xl bg-stone-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden my-auto text-stone-100"
        >
          {/* Top Decorative Gold Banner */}
          <div className="bg-gradient-to-r from-amber-900/60 via-amber-700/40 to-stone-900 p-4 sm:p-5 border-b border-amber-500/20 relative">
            <button
              id="btn-close-upsell-modal"
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white bg-stone-800/80 hover:bg-stone-800 rounded-full transition-colors"
              aria-label="Cerrar sugerencias"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                {language === 'es' ? 'Experiencia Gastronómica' : 'Gourmet Experience'}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-100 pr-8">
              {language === 'es' ? 'Eleva tu Plato con un Maridaje de Autor' : 'Elevate Your Dish with a Curated Pairing'}
            </h3>
            
            <p className="text-xs sm:text-sm text-stone-300 mt-1 line-clamp-1">
              {language === 'es' ? 'Sugerencias seleccionadas por nuestro Sommelier para acompañar' : 'Curated sommelier selections to pair with'}:{' '}
              <span className="font-semibold text-amber-300">{upsellItem.name}</span>
            </p>
          </div>

          <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Sommelier Wine Pairing Card */}
            <div 
              id="upsell-card-wine" 
              className="p-4 rounded-xl bg-stone-950/70 border border-amber-500/20 hover:border-amber-500/40 transition-all group"
            >
              <div className="flex flex-col sm:flex-row gap-3.5 sm:items-center">
                <div className="relative w-full sm:w-24 h-28 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-stone-900">
                  <img
                    src={wine.image}
                    alt={wine.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-stone-950 flex items-center gap-1">
                    <Wine className="w-3 h-3" />
                    Sommelier
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-serif font-bold text-stone-100 text-sm sm:text-base leading-snug">
                        {language === 'es' ? wine.name : (wine.nameEn || wine.name)}
                      </h4>
                      {(wine.region || wine.vintage) && (
                        <p className="text-xs text-amber-400/90 font-mono mt-0.5">
                          {wine.region} {wine.vintage && `• ${wine.vintage}`}
                        </p>
                      )}
                    </div>
                    <span className="text-base font-bold text-amber-300 shrink-0">
                      +€{wine.price.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-xs text-stone-400 mt-1.5 line-clamp-2">
                    {language === 'es' ? wine.description : (wine.descriptionEn || wine.description)}
                  </p>

                  <div className="mt-3 flex items-center justify-end">
                    <button
                      id="btn-add-wine-upsell"
                      onClick={handleAddWine}
                      disabled={addedWine}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        addedWine
                          ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 cursor-default'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-md active:scale-95'
                      }`}
                    >
                      {addedWine ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          {language === 'es' ? 'Maridaje Añadido' : 'Pairing Added'}
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          {language === 'es' ? 'Añadir Maridaje (+€' + wine.price.toFixed(2) + ')' : 'Add Wine Pairing (+€' + wine.price.toFixed(2) + ')'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Chef's Suggested Side Dish Card */}
            <div 
              id="upsell-card-side" 
              className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 hover:border-amber-500/30 transition-all group"
            >
              <div className="flex flex-col sm:flex-row gap-3.5 sm:items-center">
                <div className="relative w-full sm:w-24 h-28 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-stone-900">
                  <img
                    src={side.image}
                    alt={side.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-stone-800 text-stone-300 flex items-center gap-1">
                    <UtensilsCrossed className="w-3 h-3 text-amber-400" />
                    Chef Side
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-serif font-bold text-stone-100 text-sm sm:text-base leading-snug">
                      {language === 'es' ? side.name : (side.nameEn || side.name)}
                    </h4>
                    <span className="text-base font-bold text-amber-300 shrink-0">
                      +€{side.price.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-xs text-stone-400 mt-1.5 line-clamp-2">
                    {language === 'es' ? side.description : (side.descriptionEn || side.description)}
                  </p>

                  <div className="mt-3 flex items-center justify-end">
                    <button
                      id="btn-add-side-upsell"
                      onClick={handleAddSide}
                      disabled={addedSide}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        addedSide
                          ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 cursor-default'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 hover:border-amber-500/50 shadow-sm active:scale-95'
                      }`}
                    >
                      {addedSide ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          {language === 'es' ? 'Guarnición Añadida' : 'Side Added'}
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          {language === 'es' ? 'Añadir Acompañamiento (+€' + side.price.toFixed(2) + ')' : 'Add Side (+€' + side.price.toFixed(2) + ')'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Haute Cuisine Guarantee Badge */}
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15 text-[11px] text-amber-300/80">
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                {language === 'es' 
                  ? 'Garantía MILENIA: Todos nuestros vinos se conservan en cava a temperatura controlada (14°C - 16°C).'
                  : 'MILENIA Guarantee: All wines are cellared under strict temperature control.'}
              </span>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="p-4 sm:p-5 bg-stone-950 border-t border-stone-800 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <button
              id="btn-continue-shopping-upsell"
              onClick={handleClose}
              className="w-full sm:w-auto text-xs sm:text-sm font-medium text-stone-400 hover:text-stone-200 transition-colors py-2 px-3 text-center"
            >
              {language === 'es' ? 'Continuar explorando carta' : 'Continue exploring menu'}
            </button>

            <button
              id="btn-confirm-and-view-cart"
              onClick={handleGoToCart}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 hover:opacity-95 active:scale-95 transition-all"
            >
              <span>{language === 'es' ? 'Continuar con mi pedido' : 'Proceed to Checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
