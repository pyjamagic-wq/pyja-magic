import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { formatPrice } from '../../utils/formatters';
import { getPrimaryImageForColor } from '../../utils/productImages';
import { useStore } from '../../hooks/useStore';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onQuickView,
}) => {
  const { wishlist, toggleWishlist } = useStore();
  const [previewColorId, setPreviewColorId] = useState<string | null>(null);

  const isFavorited = wishlist.includes(product.id);

  // Compute total stock across all active variants
  const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
  const isOutOfStock = totalStock === 0;

  // Extract unique colors for swatches
  const uniqueColors = Array.from(
    new Map(
      product.variants.map((v) => [v.colorId, { id: v.colorId, name: v.colorName, hex: v.colorHex }])
    ).values()
  );

  const displayImage =
    getPrimaryImageForColor(product, previewColorId) || product.images[0] || '';

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-[#F2E5E8] hover:border-[#E8CBD3] hover:shadow-[0_12px_32px_rgba(45,32,36,0.08)] transition-all duration-300">
      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-[#FAF3F5] overflow-hidden cursor-pointer" onClick={() => onSelectProduct(product)}>
        <img
          src={displayImage}
          alt={product.name}
          className={`w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 ${
            isOutOfStock ? 'grayscale opacity-75' : ''
          }`}
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {isOutOfStock ? (
            <span className="bg-[#2D2024] text-white text-[11px] font-semibold tracking-wider px-2.5 py-1 rounded-md uppercase">
              Épuisé
            </span>
          ) : (
            <>
              {product.isNew && (
                <span className="bg-white/95 text-[#2D2024] text-[10px] font-semibold tracking-widest px-2 py-0.5 rounded shadow-sm uppercase border border-[#EBDDE1]">
                  Nouveau
                </span>
              )}
              {product.isBestSeller && (
                <span className="bg-[#BE395D] text-white text-[10px] font-semibold tracking-widest px-2 py-0.5 rounded shadow-sm uppercase">
                  Best Seller
                </span>
              )}
              {discountPercent > 0 && (
                <span className="bg-[#E54868] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                  -{discountPercent}%
                </span>
              )}
            </>
          )}
        </div>

        {/* Top Right Action: Wishlist */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all z-10 shadow-sm ${
            isFavorited
              ? 'bg-[#BE395D] text-white'
              : 'bg-white/90 text-[#4A3C40] hover:text-[#BE395D] hover:bg-white'
          }`}
          aria-label={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Hover Action Overlay: Quick View */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="w-full bg-[#FAF7F6]/95 hover:bg-white text-[#2D2024] hover:text-[#BE395D] text-xs font-semibold py-2.5 px-3 rounded-xl shadow-md backdrop-blur-sm transition-all flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>Aperçu Rapide</span>
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] text-[#8C737B] mb-1">
            <span className="uppercase tracking-wider font-medium">{product.category}</span>
            {product.rating && (
              <span className="flex items-center gap-1 font-semibold text-[#57444A]">
                ★ {product.rating.toFixed(1)}
                <span className="text-[#A69398] font-normal">({product.reviewCount || 0})</span>
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onSelectProduct(product)}
            className="font-serif-luxury text-lg text-[#2D2024] font-semibold line-clamp-1 group-hover:text-[#BE395D] transition-colors cursor-pointer"
          >
            {product.name}
          </h3>

          <p className="text-xs text-[#70585F] line-clamp-1 mt-0.5">
            {product.material}
          </p>
        </div>

        {/* Color Swatches — survol = aperçu photo de la couleur */}
        {uniqueColors.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1">
            {uniqueColors.map((col) => (
              <button
                key={col.id}
                type="button"
                onMouseEnter={() => setPreviewColorId(col.id)}
                onMouseLeave={() => setPreviewColorId(null)}
                onFocus={() => setPreviewColorId(col.id)}
                onBlur={() => setPreviewColorId(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewColorId(col.id);
                }}
                className={`w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs transition-transform ${
                  previewColorId === col.id ? 'scale-125 ring-1 ring-[#BE395D]' : ''
                }`}
                style={{ backgroundColor: col.hex }}
                title={col.name}
                aria-label={col.name}
              />
            ))}
            {uniqueColors.length > 1 && (
              <span className="text-[10px] text-[#8C737B] ml-1">
                {uniqueColors.length} coloris
              </span>
            )}
          </div>
        )}

        {/* Price & Action */}
        <div className="pt-2 border-t border-[#F8EFF1] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-[#2D2024]">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs text-[#A69398] line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] font-medium block ${
                isOutOfStock ? 'text-stone-400' : 'text-emerald-700'
              }`}
            >
              {isOutOfStock ? 'Épuisé' : 'Disponible'}
            </span>
          </div>

          <button
            onClick={() => onSelectProduct(product)}
            disabled={isOutOfStock}
            className={`p-2 rounded-xl transition-all ${
              isOutOfStock
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-[#FAF3F5] text-[#BE395D] hover:bg-[#BE395D] hover:text-white'
            }`}
            title={isOutOfStock ? 'Épuisé' : 'Choisir taille & couleur'}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
