import React, { useState, useMemo } from 'react';
import { useTasty } from '../../context/TastyContext';
import { MenuItemCard } from './MenuItemCard';
import { 
  Search, 
  Sparkles, 
  Flame, 
  Leaf, 
  WheatOff, 
  ArrowUpDown, 
  X, 
  Pizza, 
  Beef, 
  Soup, 
  Salad, 
  Cake, 
  GlassWater, 
  Utensils, 
  Percent,
  Award
} from 'lucide-react';

export const MenuExplorer: React.FC = () => {
  const { categories, menuItems, language, orderType, selectedLocation, config } = useTasty();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'price_desc' | 'prep_time'>('recommended');

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Pizza': return <Pizza className="w-4 h-4" />;
      case 'Beef': return <Beef className="w-4 h-4" />;
      case 'Soup': return <Soup className="w-4 h-4" />;
      case 'Salad': return <Salad className="w-4 h-4" />;
      case 'Cake': return <Cake className="w-4 h-4" />;
      case 'GlassWater': return <GlassWater className="w-4 h-4" />;
      default: return <Utensils className="w-4 h-4" />;
    }
  };

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
        return false;
      }

      // Dietary filter
      if (dietaryFilter && !item.dietary.includes(dietaryFilter as any)) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q) || (item.nameEn && item.nameEn.toLowerCase().includes(q));
        const matchesDesc = item.description.toLowerCase().includes(q) || (item.descriptionEn && item.descriptionEn.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'prep_time') return a.prepTimeMinutes - b.prepTimeMinutes;
      // 'recommended': Chef specials and popular first
      const aScore = (a.dietary.includes('chef_special') ? 2 : 0) + (a.dietary.includes('popular') ? 1 : 0);
      const bScore = (b.dietary.includes('chef_special') ? 2 : 0) + (b.dietary.includes('popular') ? 1 : 0);
      return bScore - aScore;
    });
  }, [menuItems, selectedCategory, dietaryFilter, searchQuery, sortBy]);

  return (
    <div id="menu-explorer-view" className="space-y-6 sm:space-y-8">
      
      {/* Top Banner / Announcement */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-950 via-slate-900 to-amber-950/80 text-white p-6 sm:p-10 shadow-2xl border border-amber-500/20 dark:border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'es' ? 'Cupón Activo: MILENIA10 (10% de Descuento)' : 'Active Promo: MILENIA10 (10% OFF)'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
            {language === 'es' ? 'Alta Cocina & Experiencia Gastronómica' : 'Haute Cuisine & Culinary Experience'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
            {language === 'es'
              ? `Platos de autor elaborados con producto fresco en ${selectedLocation.name}. Tiempo estimado: ${selectedLocation.deliveryTimeEstimate} • Envío bonificado a partir de €${config.freeDeliveryThreshold.toFixed(2)}.`
              : `Signature gastronomy crafted fresh at ${selectedLocation.name}. Estimated time: ${selectedLocation.deliveryTimeEstimate} • Complimentary delivery on orders over €${config.freeDeliveryThreshold.toFixed(2)}.`}
          </p>
        </div>

        {/* Decorative ambient glow */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors duration-300">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="menu-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'es' ? 'Buscar platos de autor, trufas, wagyu, pizzas, pastas...' : 'Search signature dishes, truffle, wagyu, pizzas, pasta...'}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              id="menu-sort-select"
              className="text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-slate-700 dark:text-slate-200 font-semibold focus:border-amber-500 outline-none cursor-pointer"
            >
              <option value="recommended">{language === 'es' ? 'Recomendados Chef' : "Chef's Recommendation"}</option>
              <option value="price_asc">{language === 'es' ? 'Menor Precio' : 'Price: Low to High'}</option>
              <option value="price_desc">{language === 'es' ? 'Mayor Precio' : 'Price: High to Low'}</option>
              <option value="prep_time">{language === 'es' ? 'Menor Tiempo Prep' : 'Fastest Prep'}</option>
            </select>
          </div>
        </div>

        {/* Dietary and Tag Quick Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-slate-400 dark:text-slate-500 font-bold text-[11px] uppercase tracking-wider shrink-0 mr-1">
            {language === 'es' ? 'Filtros:' : 'Tags:'}
          </span>
          <button
            onClick={() => setDietaryFilter(null)}
            className={`px-3.5 py-1.5 rounded-full font-bold transition cursor-pointer shrink-0 ${
              dietaryFilter === null ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {language === 'es' ? 'Todos los Platos' : 'All Dishes'}
          </button>
          <button
            onClick={() => setDietaryFilter(dietaryFilter === 'chef_special' ? null : 'chef_special')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full font-bold transition cursor-pointer shrink-0 ${
              dietaryFilter === 'chef_special' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Especial Chef' : "Chef's Special"}</span>
          </button>
          <button
            onClick={() => setDietaryFilter(dietaryFilter === 'popular' ? null : 'popular')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full font-bold transition cursor-pointer shrink-0 ${
              dietaryFilter === 'popular' ? 'bg-orange-600 text-white shadow-xs' : 'bg-orange-50 dark:bg-orange-950/30 text-orange-900 dark:text-orange-300 hover:bg-orange-100 border border-orange-200 dark:border-orange-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Más Aclamados' : 'Best Sellers'}</span>
          </button>
          <button
            onClick={() => setDietaryFilter(dietaryFilter === 'vegetarian' ? null : 'vegetarian')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full font-bold transition cursor-pointer shrink-0 ${
              dietaryFilter === 'vegetarian' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/60'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Vegetariano' : 'Vegetarian'}</span>
          </button>
          <button
            onClick={() => setDietaryFilter(dietaryFilter === 'gluten_free' ? null : 'gluten_free')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full font-bold transition cursor-pointer shrink-0 ${
              dietaryFilter === 'gluten_free' ? 'bg-sky-600 text-white shadow-xs' : 'bg-sky-50 dark:bg-sky-950/30 text-sky-900 dark:text-sky-300 hover:bg-sky-100 border border-sky-200 dark:border-sky-800/60'
            }`}
          >
            <WheatOff className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Sin Gluten' : 'Gluten Free'}</span>
          </button>
        </div>
      </div>

      {/* Category Navigation Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const label = language === 'es' ? cat.name : cat.nameEn;
          const count = cat.id === 'all' 
            ? menuItems.length 
            : menuItems.filter(i => i.categoryId === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              id={`category-tab-${cat.id}`}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 cursor-pointer border ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20 scale-[1.02]'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-slate-950/10 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                {getCategoryIcon(cat.icon)}
              </div>
              <span>{label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Menu Dishes Grid */}
      {filteredItems.length > 0 ? (
        <div id="menu-items-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
            <Utensils className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {language === 'es' ? 'No encontramos platos con esos filtros' : 'No dishes found with these filters'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {language === 'es' ? 'Intenta buscar con otros términos o limpia los filtros para ver la carta completa.' : 'Try different keywords or clear filters to view full menu.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setDietaryFilter(null);
            }}
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-md"
          >
            {language === 'es' ? 'Ver toda la carta' : 'Reset all filters'}
          </button>
        </div>
      )}
    </div>
  );
};
