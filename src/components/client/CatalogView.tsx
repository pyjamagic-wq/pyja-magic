import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, ArrowUpDown, Sparkles, Filter, X, RotateCcw } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { useStore } from '../../hooks/useStore';

interface CatalogViewProps {
  initialCategory?: string;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  initialCategory,
  onSelectProduct,
  onQuickView,
}) => {
  const { products } = useStore();

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-asc' | 'price-desc' | 'bestsellers'>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync if initialCategory changes
  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const baseCategories = [
    { id: 'all', label: 'Toute la Collection' },
    { id: 'Pyjamas satin', label: 'Pyjamas Satin & Soie' },
    { id: 'Pyjamas coton', label: 'Pyjamas Coton Bio' },
    { id: 'Pyjamas velours', label: 'Pyjamas Velours' },
    { id: 'Nuisettes & Déshabillés', label: 'Nuisettes & Déshabillés' },
    { id: 'Shortamas & Caracos', label: 'Shortamas & Caracos' },
    { id: 'Peignoirs & Kimonos', label: 'Peignoirs & Kimonos' },
    { id: 'Ensembles 3 & 4 Pièces', label: 'Ensembles 3 & 4 Pièces' },
    { id: 'Chemises de nuit', label: 'Chemises de Nuit' },
    { id: 'Trouseau Mariée', label: 'Trouseau Mariée' },
    { id: 'Loungewear & Homewear', label: 'Loungewear & Homewear' },
    { id: 'Polaire & Pilou Pilou', label: 'Polaire & Pilou' },
    { id: 'Collection hiver', label: 'Collection Hiver' },
    { id: 'Collection été', label: 'Collection Été' },
    { id: 'promotions', label: 'Promotions %' },
  ];

  const categories = useMemo(() => {
    const list = [...baseCategories];
    const existingIds = new Set(list.map((c) => c.id.toLowerCase()));

    products.forEach((p) => {
      if (p.category && !existingIds.has(p.category.toLowerCase())) {
        existingIds.add(p.category.toLowerCase());
        list.splice(list.length - 1, 0, { id: p.category, label: p.category });
      }
    });

    return list;
  }, [products]);

  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Extract unique colors across catalog
  const allColors = useMemo(() => {
    const map = new Map<string, { id: string; name: string; hex: string }>();
    products.forEach((p) => {
      p.variants.forEach((v) => {
        map.set(v.colorId, { id: v.colorId, name: v.colorName, hex: v.colorHex });
      });
    });
    return Array.from(map.values());
  }, [products]);

  // Filtering logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category
        if (selectedCategory === 'promotions') {
          if (!p.compareAtPrice || p.compareAtPrice <= p.price) return false;
        } else if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }

        // Price
        if (p.price > maxPrice) return false;

        // Size filter
        if (selectedSize !== 'all') {
          const hasSizeWithStock = p.variants.some(
            (v) => v.sizeName === selectedSize && v.stockQuantity > 0
          );
          if (!hasSizeWithStock) return false;
        }

        // Color filter
        if (selectedColor !== 'all') {
          const hasColor = p.variants.some((v) => v.colorId === selectedColor);
          if (!hasColor) return false;
        }

        // In-stock only
        if (inStockOnly) {
          const totalStock = p.variants.reduce((s, v) => s + v.stockQuantity, 0);
          if (totalStock === 0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        if (sortBy === 'bestsellers') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedCategory, selectedSize, selectedColor, inStockOnly, maxPrice, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedSize('all');
    setSelectedColor('all');
    setInStockOnly(false);
    setMaxPrice(10000);
    setSortBy('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Category Pills Bar (Horizontal Scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none border-b border-[#F2E5E8] mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider shrink-0 transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#2D2024] text-white shadow-sm'
                : 'bg-white text-[#523F44] hover:bg-[#FAF3F5] border border-[#F2E5E8]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif-luxury text-3xl font-bold text-[#2D2024]">
            {categories.find((c) => c.id === selectedCategory)?.label || 'Boutique'}
          </h1>
          <p className="text-xs text-[#8C737B] mt-0.5">
            {filteredProducts.length} modèle(s) disponible(s)
          </p>
        </div>

        {/* Top sorting & mobile filter button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 bg-white border border-[#EBDDE1] px-3.5 py-2 rounded-xl text-xs font-semibold text-[#2D2024]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#BE395D]" />
            <span>Filtres</span>
          </button>

          <div className="flex items-center gap-2 bg-white border border-[#EBDDE1] px-3 py-1.5 rounded-xl text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#BE395D]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent focus:outline-none font-medium text-[#2D2024]"
            >
              <option value="featured">Populaires</option>
              <option value="newest">Nouveautés d'abord</option>
              <option value="bestsellers">Meilleures ventes</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid with Sidebar Filter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar / Mobile Dropdown */}
        <div
          className={`${
            mobileFilterOpen ? 'block' : 'hidden md:block'
          } bg-white rounded-3xl p-6 border border-[#F2E5E8] space-y-6 shadow-2xs h-fit`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#F2E5E8]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2D2024] flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#BE395D]" />
              Filtres
            </span>
            <button
              onClick={resetFilters}
              className="text-[11px] text-[#BE395D] hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Réinitialiser
            </button>
          </div>

          {/* Size Filter */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#2D2024]">Taille</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setSelectedSize('all')}
                className={`py-1.5 px-2 text-xs rounded-lg border font-medium ${
                  selectedSize === 'all'
                    ? 'border-[#BE395D] bg-[#FAF3F5] text-[#BE395D]'
                    : 'border-[#EBDDE1] text-[#70585F]'
                }`}
              >
                Toutes
              </button>
              {allSizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`py-1.5 px-2 text-xs rounded-lg border font-medium ${
                    selectedSize === sz
                      ? 'border-[#BE395D] bg-[#FAF3F5] text-[#BE395D]'
                      : 'border-[#EBDDE1] text-[#70585F] hover:border-[#BE395D]'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#2D2024]">Couleur</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedColor('all')}
                className={`px-2.5 py-1 text-xs rounded-lg border ${
                  selectedColor === 'all'
                    ? 'border-[#BE395D] bg-[#FAF3F5] text-[#BE395D] font-bold'
                    : 'border-[#EBDDE1] text-[#70585F]'
                }`}
              >
                Toutes
              </button>
              {allColors.map((col) => (
                <button
                  key={col.id}
                  onClick={() => setSelectedColor(col.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-all ${
                    selectedColor === col.id
                      ? 'border-[#BE395D] bg-[#FAF3F5] text-[#BE395D] font-bold'
                      : 'border-[#EBDDE1] text-[#70585F]'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/15"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span>{col.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stock Availability Toggle */}
          <div className="pt-2 border-t border-[#F2E5E8]">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#2D2024]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-[#EBDDE1] text-[#BE395D] focus:ring-[#BE395D]"
              />
              <span className="font-medium">En stock uniquement</span>
            </label>
          </div>
        </div>

        {/* Product Grid */}
        <div className="md:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#F2E5E8] space-y-4">
              <Sparkles className="w-10 h-10 text-[#E8CBD3] mx-auto" />
              <h3 className="font-serif-luxury text-xl text-[#2D2024] font-semibold">
                Aucun modèle ne correspond à vos critères
              </h3>
              <p className="text-xs text-[#70585F] max-w-sm mx-auto">
                Modifiez vos filtres ou réinitialisez la sélection pour afficher tous les pyjamas disponibles.
              </p>
              <button
                onClick={resetFilters}
                className="bg-[#BE395D] text-white text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-full shadow-sm hover:bg-[#9E2B4B] transition-colors"
              >
                Afficher toute la collection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={onSelectProduct}
                  onQuickView={onQuickView}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
