import React, { useState } from 'react';
import { X, Heart, ShoppingBag, Eye, ArrowRight, Star } from 'lucide-react';
import { Product } from '../../types';
import { formatPrice } from '../../utils/formatters';
import { useStore } from '../../hooks/useStore';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onViewFullProduct: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onViewFullProduct,
}) => {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!product) return null;

  // Set defaults
  const colors = Array.from(
    new Map(product.variants.map((v) => [v.colorHex, { id: v.colorId, name: v.colorName, hex: v.colorHex }])).values()
  );
  const sizes = Array.from(new Set(product.variants.map((v) => v.sizeName)));

  const activeColor = selectedColor || colors[0]?.id;
  const activeSize = selectedSize || sizes[0];

  const currentVariant = product.variants.find(
    (v) => v.colorId === activeColor && v.sizeName === activeSize
  );

  const isFavorited = wishlist.includes(product.id);
  const stock = currentVariant?.stockQuantity || 0;

  const handleQuickAdd = () => {
    if (!currentVariant || stock <= 0) return;
    addToCart({
      id: `${product.id}-${currentVariant.id}`,
      productId: product.id,
      variantId: currentVariant.id,
      productName: product.name,
      productImage: product.images[0],
      sizeName: currentVariant.sizeName,
      colorName: currentVariant.colorName,
      colorHex: currentVariant.colorHex,
      price: currentVariant.price || product.price,
      quantity: 1,
      maxStock: currentVariant.stockQuantity,
    });
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#F2E5E8]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 text-[#70585F] hover:text-[#2D2024] hover:bg-white transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Image */}
          <div className="aspect-[3/4] bg-[#FAF3F5] overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#BE395D]">
                {product.category}
              </span>
              <h3 className="font-serif-luxury text-2xl font-bold text-[#2D2024] mt-1">
                {product.name}
              </h3>

              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-xl font-bold text-[#2D2024]">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-xs text-[#A69398] line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>

              <p className="text-xs text-[#70585F] mt-2 line-clamp-3">
                {product.shortDescription || product.description}
              </p>

              {/* Color swatches */}
              <div className="mt-4 space-y-1.5">
                <span className="text-[11px] font-semibold text-[#2D2024]">Couleur :</span>
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedColor(c.id)}
                      className={`w-6 h-6 rounded-full border border-black/15 transition-all ${
                        activeColor === c.id ? 'ring-2 ring-[#BE395D] ring-offset-2' : ''
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="mt-3 space-y-1.5">
                <span className="text-[11px] font-semibold text-[#2D2024]">Taille :</span>
                <div className="flex flex-wrap gap-1.5">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-all ${
                        activeSize === s
                          ? 'border-[#BE395D] bg-[#FDF2F4] text-[#BE395D]'
                          : 'border-[#EBDDE1] text-[#2D2024] hover:border-[#BE395D]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 text-[11px]">
                {stock > 0 ? (
                  <span className="text-emerald-700 font-semibold">✓ {stock} en stock</span>
                ) : (
                  <span className="text-stone-400 font-semibold">Épuisé</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-[#F2E5E8]">
              <button
                disabled={stock <= 0}
                onClick={handleQuickAdd}
                className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  stock <= 0
                    ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                    : addedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#BE395D] hover:bg-[#9E2B4B] text-white shadow-sm'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{addedSuccess ? 'Ajouté ✓' : 'Ajouter au Panier'}</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onViewFullProduct(product);
                }}
                className="w-full text-center text-xs font-semibold text-[#BE395D] hover:underline flex items-center justify-center gap-1 py-1"
              >
                <span>Voir fiche détaillée & avis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
