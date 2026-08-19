import React from 'react';
import { MenuItem } from '../../types';
import { useTasty } from '../../context/TastyContext';
import { Plus, Flame, Sparkles, Leaf, WheatOff, Clock, Layers, Award } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { language, addToCart, setCustomizingItem } = useTasty();

  const handleAction = () => {
    if (!item.inStock) return;
    if (item.optionGroups && item.optionGroups.length > 0) {
      setCustomizingItem(item);
    } else {
      addToCart(item, 1, []);
    }
  };

  const name = language === 'es' ? item.name : (item.nameEn || item.name);
  const description = language === 'es' ? item.description : (item.descriptionEn || item.description);

  return (
    <div
      id={`menu-item-card-${item.id}`}
      className={`group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl dark:hover:shadow-amber-500/5 transition-all duration-300 flex flex-col overflow-hidden relative ${
        !item.inStock ? 'opacity-65 grayscale-50' : ''
      }`}
    >
      {/* Image Container */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={item.image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Gradient overlay on bottom */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent"></div>

        {/* Dietary and Status Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 max-w-[85%]">
          {item.dietary.includes('chef_special') && (
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <Award className="w-3 h-3" />
              {language === 'es' ? 'Chef' : "Chef's Pick"}
            </span>
          )}
          {item.dietary.includes('popular') && (
            <span className="bg-orange-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <Flame className="w-3 h-3 fill-white" />
              {language === 'es' ? 'Top Ventas' : 'Popular'}
            </span>
          )}
          {item.dietary.includes('spicy') && (
            <span className="bg-rose-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
              🌶️ {language === 'es' ? 'Picante' : 'Spicy'}
            </span>
          )}
          {item.dietary.includes('vegetarian') && (
            <span className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <Leaf className="w-3 h-3" />
              {language === 'es' ? 'Veggie' : 'Veggie'}
            </span>
          )}
          {item.dietary.includes('gluten_free') && (
            <span className="bg-sky-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <WheatOff className="w-3 h-3" />
              {language === 'es' ? 'Sin Gluten' : 'Gluten-Free'}
            </span>
          )}
        </div>

        {/* Prep Time & Calories in bottom corner */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-2 text-white text-[11px] font-semibold drop-shadow-sm">
          <span className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10">
            <Clock className="w-3 h-3 text-amber-400" />
            {item.prepTimeMinutes} min
          </span>
          {item.calories && (
            <span className="bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 text-slate-200">
              {item.calories} kcal
            </span>
          )}
        </div>

        {/* Sold out overlay */}
        {!item.inStock && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-rose-600 text-white font-black text-xs uppercase px-3.5 py-1 rounded-full tracking-wider shadow-lg">
              {language === 'es' ? 'Agotado Temporalmente' : 'Sold Out'}
            </span>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
            {name}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              €{item.price.toFixed(2)}
            </span>
            {item.originalPrice && (
              <span className="text-xs text-slate-400 dark:text-slate-500 line-through font-medium">
                €{item.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAction}
            disabled={!item.inStock}
            id={`btn-add-item-${item.id}`}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
              !item.inStock
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : item.optionGroups && item.optionGroups.length > 0
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 hover:bg-amber-500 hover:text-slate-950 border border-amber-200 dark:border-amber-800/60'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-md hover:shadow-lg shadow-amber-500/20 active:scale-95'
            }`}
          >
            {item.optionGroups && item.optionGroups.length > 0 ? (
              <>
                <Layers className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Opciones' : 'Options'}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>{language === 'es' ? 'Añadir' : 'Add'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
