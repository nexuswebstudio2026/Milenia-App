import React, { useState, useEffect } from 'react';
import { useTasty } from '../../context/TastyContext';
import { MenuItem, SelectedOption } from '../../types';
import { X, Plus, Minus, Check, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ItemCustomizeModal: React.FC = () => {
  const { customizingItem, setCustomizingItem, addToCart, language } = useTasty();
  const item: MenuItem | null = customizingItem;

  const [quantity, setQuantity] = useState(1);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, SelectedOption[]>>({});
  const [instructions, setInstructions] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize default options when modal opens
  useEffect(() => {
    if (item && item.optionGroups) {
      setQuantity(1);
      setInstructions('');
      setErrorMsg(null);

      const initialSelected: Record<string, SelectedOption[]> = {};
      item.optionGroups.forEach(group => {
        if (group.required && group.choices.length > 0) {
          const firstChoice = group.choices[0];
          initialSelected[group.id] = [{
            groupId: group.id,
            groupTitle: language === 'es' ? group.title : (group.titleEn || group.title),
            choiceId: firstChoice.id,
            choiceName: language === 'es' ? firstChoice.name : (firstChoice.nameEn || firstChoice.name),
            price: firstChoice.price
          }];
        } else {
          initialSelected[group.id] = [];
        }
      });
      setSelectedChoices(initialSelected);
    }
  }, [item, language]);

  if (!item) return null;

  const handleSingleSelect = (groupId: string, groupTitle: string, choiceId: string, choiceName: string, price: number) => {
    setSelectedChoices(prev => ({
      ...prev,
      [groupId]: [{
        groupId,
        groupTitle,
        choiceId,
        choiceName,
        price
      }]
    }));
  };

  const handleMultiToggle = (groupId: string, groupTitle: string, choiceId: string, choiceName: string, price: number, maxSelect?: number) => {
    setSelectedChoices(prev => {
      const currentList = prev[groupId] || [];
      const exists = currentList.some(c => c.choiceId === choiceId);

      if (exists) {
        return {
          ...prev,
          [groupId]: currentList.filter(c => c.choiceId !== choiceId)
        };
      } else {
        if (maxSelect && currentList.length >= maxSelect) {
          return prev; // limit reached
        }
        return {
          ...prev,
          [groupId]: [
            ...currentList,
            { groupId, groupTitle, choiceId, choiceName, price }
          ]
        };
      }
    });
  };

  // Calculate dynamic item price
  const allSelectedOptions: SelectedOption[] = (Object.values(selectedChoices) as SelectedOption[][]).reduce(
    (acc, list) => acc.concat(list),
    [] as SelectedOption[]
  );
  const optionsPrice = allSelectedOptions.reduce((sum, opt) => sum + opt.price, 0);
  const unitPrice = item.price + optionsPrice;
  const totalPrice = Number((unitPrice * quantity).toFixed(2));

  const handleConfirm = () => {
    // Validate required options
    if (item.optionGroups) {
      for (const group of item.optionGroups) {
        if (group.required && (!selectedChoices[group.id] || selectedChoices[group.id].length === 0)) {
          setErrorMsg(language === 'es' 
            ? `Por favor, selecciona una opción en: ${group.title}` 
            : `Please select an option for: ${group.titleEn || group.title}`);
          return;
        }
      }
    }

    addToCart(item, quantity, allSelectedOptions, instructions);
    setCustomizingItem(null);
  };

  const name = language === 'es' ? item.name : (item.nameEn || item.name);
  const description = language === 'es' ? item.description : (item.descriptionEn || item.description);

  return (
    <AnimatePresence>
      <div 
        id="item-customize-modal-backdrop"
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          id="item-customize-modal-content"
          className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header with Food Image */}
          <div className="relative h-48 sm:h-56 bg-slate-950 shrink-0">
            <img
              src={item.image}
              alt={name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent"></div>

            <button
              onClick={() => setCustomizingItem(null)}
              id="close-customize-modal-btn"
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h2 className="text-xl sm:text-2xl font-black leading-tight drop-shadow-sm">{name}</h2>
              <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 mt-1 drop-shadow-sm">{description}</p>
            </div>
          </div>

          {/* Body Scrollable Options */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm">
            {errorMsg && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Option Groups */}
            {item.optionGroups && item.optionGroups.map((group) => {
              const groupTitle = language === 'es' ? group.title : (group.titleEn || group.title);
              const isRequired = group.required;
              const isMulti = !isRequired || (group.maxSelect && group.maxSelect > 1);
              const currentGroupSelections = selectedChoices[group.id] || [];

              return (
                <div key={group.id} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{groupTitle}</span>
                      {isRequired ? (
                        <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                          {language === 'es' ? 'Obligatorio' : 'Required'}
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {language === 'es' ? 'Opcional' : 'Optional'}
                        </span>
                      )}
                    </div>
                    {group.maxSelect && (
                      <span className="text-xs text-slate-400">
                        {language === 'es' ? `Máx. ${group.maxSelect}` : `Max ${group.maxSelect}`}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {group.choices.map((choice) => {
                      const choiceName = language === 'es' ? choice.name : (choice.nameEn || choice.name);
                      const isSelected = currentGroupSelections.some(c => c.choiceId === choice.id);

                      return (
                        <button
                          key={choice.id}
                          type="button"
                          onClick={() => {
                            setErrorMsg(null);
                            if (isRequired && !isMulti) {
                              handleSingleSelect(group.id, groupTitle, choice.id, choiceName, choice.price);
                            } else {
                              handleMultiToggle(group.id, groupTitle, choice.id, choiceName, choice.price, group.maxSelect);
                            }
                          }}
                          className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition cursor-pointer ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 text-slate-900 dark:text-white shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                              isSelected ? 'bg-amber-500 border-amber-500 text-slate-950 font-bold' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="font-medium text-xs sm:text-sm">{choiceName}</span>
                          </div>
                          {choice.price > 0 ? (
                            <span className="font-bold text-xs text-slate-900 dark:text-amber-400">+€{choice.price.toFixed(2)}</span>
                          ) : (
                            <span className="text-xs text-slate-400">{language === 'es' ? 'Incluido' : 'Included'}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Special Instructions */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
                {language === 'es' ? 'Instrucciones Especiales para Cocina' : 'Special Kitchen Instructions'}
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={language === 'es' ? 'Ej: Sin cebolla, salsa aparte, extra crujiente...' : 'e.g. No onions, sauce on the side, extra crispy...'}
                className="w-full text-xs p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none resize-none h-18"
                maxLength={150}
              />
              <div className="text-[10px] text-slate-400 text-right">{instructions.length}/150</div>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
            {/* Quantity Selector */}
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-1 shadow-2xs">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                aria-label="Restar unidad"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-sm text-slate-900 dark:text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                aria-label="Sumar unidad"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleConfirm}
              id="confirm-add-to-cart-btn"
              className="flex-1 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 py-3.5 px-5 rounded-2xl font-black text-sm shadow-md hover:shadow-lg shadow-amber-500/20 flex items-center justify-between transition-all cursor-pointer"
            >
              <span>{language === 'es' ? 'Añadir al Pedido' : 'Add to Order'}</span>
              <span className="bg-slate-950/15 px-2.5 py-0.5 rounded-lg text-xs font-black">
                €{totalPrice.toFixed(2)}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
