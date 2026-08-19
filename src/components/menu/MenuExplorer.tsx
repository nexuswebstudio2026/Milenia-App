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
  Award,
  Filter,
  HeartPulse,
  Crown,
  Wine
} from 'lucide-react';
import { DietaryPreference } from '../../types';

export const MenuExplorer: React.FC = () => {
  const { 
    categories, 
    menuItems, 
    language, 
    selectedLocation, 
    config, 
    dietaryFilter, 
    setDietaryFilter,
    setIsRewardsOpen
  } = useTasty();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
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

  // Dietary options for the Advanced Filter Dropdown
  const dietaryOptions: { value: DietaryPreference | 'all'; labelEs: string; labelEn: string; icon: any }[] = [
    { value: 'all', labelEs: 'Todas las Preferencias', labelEn: 'All Dietary Preferences', icon: Utensils },
    { value: 'gluten_free', labelEs: 'Sin Gluten (Gluten-Free)', labelEn: 'Gluten-Free', icon: WheatOff },
    { value: 'vegan', labelEs: 'Vegano (100% Plant-Based)', labelEn: 'Vegan', icon: Leaf },
    { value: 'vegetarian', labelEs: 'Vegetariano', labelEn: 'Vegetarian', icon: Leaf },
    { value: 'keto', labelEs: 'Keto / Low-Carb', labelEn: 'Keto Friendly', icon: HeartPulse },
    { value: 'halal', labelEs: 'Halal Certified', labelEn: 'Halal Certified', icon: Award },
    { value: 'chef_special', labelEs: 'Especial del Chef & Autor', labelEn: "Chef's Signature Dish", icon: Award },
    { value: 'popular', labelEs: 'Más Aclamados / Best Sellers', labelEn: 'Best Sellers', icon: Flame },
  ];

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
        return false;
      }

      // Dietary filter dropdown
      if (dietaryFilter !== 'all' && !item.dietary.includes(dietaryFilter as DietaryPreference)) {
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
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-stone-950 via-stone-900 to-amber-950 text-white p-6 sm:p-10 shadow-2xl border border-amber-500/30">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'es' ? 'Cupón Activo: MILENIA10 (10% OFF)' : 'Active Promo: MILENIA10 (10% OFF)'}</span>
            </div>

            <button
              id="btn-banner-milenia-rewards"
              onClick={() => setIsRewardsOpen(true)}
              className="inline-flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'es' ? 'Milenia Rewards Club (+10 pts/€)' : 'Milenia Rewards (+10 pts/€)'}</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight leading-tight text-white">
            {language === 'es' ? 'Alta Cocina & Experiencia Gastronómica' : 'Haute Cuisine & Culinary Experience'}
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-xl">
            {language === 'es'
              ? `Platos de autor elaborados con producto fresco en ${selectedLocation.name}. Maridaje de sommelier disponible en platos principales.`
              : `Signature gastronomy crafted fresh at ${selectedLocation.name}. Sommelier wine pairings available with all mains.`}
          </p>
        </div>

        {/* Decorative ambient glow */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 transition-colors duration-300">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="menu-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'es' ? 'Buscar platos de autor, trufas, wagyu, salmón, caviar...' : 'Search signature dishes, truffle, wagyu, salmon, caviar...'}
              className="w-full pl-10 pr-9 py-2.5 bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 rounded-2xl text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:bg-white dark:focus:bg-stone-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {/* 1. ADVANCED DIETARY PREFERENCES DROPDOWN */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-amber-500 shrink-0" />
              <select
                id="menu-dietary-filter-select"
                value={dietaryFilter}
                onChange={(e) => setDietaryFilter(e.target.value as DietaryPreference | 'all')}
                className="w-full sm:w-auto text-xs sm:text-sm bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 rounded-2xl px-3.5 py-2.5 text-stone-800 dark:text-amber-300 font-bold focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none cursor-pointer"
              >
                {dietaryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-stone-900 text-stone-100 py-1">
                    {language === 'es' ? opt.labelEs : opt.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. SORTING DROPDOWN */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <ArrowUpDown className="w-4 h-4 text-stone-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                id="menu-sort-select"
                className="w-full sm:w-auto text-xs sm:text-sm bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 rounded-2xl px-3.5 py-2.5 text-stone-700 dark:text-stone-200 font-semibold focus:border-amber-500 outline-none cursor-pointer"
              >
                <option value="recommended">{language === 'es' ? 'Recomendados Chef' : "Chef's Recommendation"}</option>
                <option value="price_asc">{language === 'es' ? 'Menor Precio' : 'Price: Low to High'}</option>
                <option value="price_desc">{language === 'es' ? 'Mayor Precio' : 'Price: High to Low'}</option>
                <option value="prep_time">{language === 'es' ? 'Menor Tiempo Prep' : 'Fastest Prep'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Filter Tag Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-stone-400 dark:text-stone-500 font-bold text-[11px] uppercase tracking-wider shrink-0 mr-1">
            {language === 'es' ? 'Filtro Rápido:' : 'Quick Tags:'}
          </span>
          <button
            onClick={() => setDietaryFilter('all')}
            className={`px-3.5 py-1.5 rounded-full font-bold transition cursor-pointer shrink-0 ${
              dietaryFilter === 'all' ? 'bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 shadow-xs' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            {language === 'es' ? 'Todos los Platos' : 'All Dishes'}
          </button>
          <button
            onClick={() => setDietaryFilter(dietaryFilter === 'gluten_free' ? 'all' : 'gluten_free')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full font-bold transition cursor-pointer shrink-0 ${
              dietaryFilter === 'gluten_free' ? 'bg-sky-600 text-white shadow-xs' : 'bg-sky-50 dark:bg-sky-950/30 text-sky-900 dark:text-sky-300 hover:bg-sky-100 border border-sky-200 dark:border-sky-800/60'
            }`}
          >
            <WheatOff className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Sin Gluten' : 'Gluten Free'}</span>
          </button>
          <button
            onClick={() => setDietaryFilter(dietaryFilter === 'vegan' ? 'all' : 'vegan')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full font-bold transition cursor-pointer shrink-0 ${
              dietaryFilter === 'vegan' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/60'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Vegano' : 'Vegan'}</span>
          </button>
          <button
            onClick={() => setDietaryFilter(dietaryFilter === 'keto' ? 'all' : 'keto')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full font-bold transition cursor-pointer shrink-0 ${
              dietaryFilter === 'keto' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800/60'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Keto Friendly' : 'Keto'}</span>
          </button>
          <button
            onClick={() => setDietaryFilter(dietaryFilter === 'chef_special' ? 'all' : 'chef_special')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full font-bold transition cursor-pointer shrink-0 ${
              dietaryFilter === 'chef_special' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Especial Chef' : "Chef's Special"}</span>
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
                  ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-md shadow-amber-500/20 scale-[1.02]'
                  : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 border-stone-200 dark:border-stone-800'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-stone-950/10 text-stone-950' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'}`}>
                {getCategoryIcon(cat.icon)}
              </div>
              <span>{label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                isSelected ? 'bg-stone-950/20 text-stone-950' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
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
        <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-3xl border border-dashed border-stone-300 dark:border-stone-800 space-y-4">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
            <Utensils className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-800 dark:text-white">
            {language === 'es' ? 'No encontramos platos con esos filtros' : 'No dishes found with these filters'}
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
            {language === 'es' ? 'Intenta buscar con otros términos o limpia las preferencias dietéticas para ver la carta completa.' : 'Try different keywords or clear filters to view full menu.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setDietaryFilter('all');
            }}
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-md"
          >
            {language === 'es' ? 'Ver toda la carta' : 'Reset all filters'}
          </button>
        </div>
      )}
    </div>
  );
};
