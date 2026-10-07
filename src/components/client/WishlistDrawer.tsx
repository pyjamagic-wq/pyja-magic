import React from 'react';
import { X, Heart, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { formatPrice } from '../../utils/formatters';
import { Product } from '../../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const { wishlist, toggleWishlist, products } = useStore();

  if (!isOpen) return null;

  const favoritedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F6] shadow-2xl flex flex-col border-l border-[#F2E5E8]">
          <div className="p-5 border-b border-[#F2E5E8] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#BE395D] fill-current" />
              <h2 className="font-serif-luxury text-xl text-[#2D2024] font-semibold">
                Mes Coups de Cœur ({favoritedProducts.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#70585F] hover:text-[#2D2024] hover:bg-[#FAF3F5] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {favoritedProducts.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <Heart className="w-12 h-12 text-[#E8CBD3] mx-auto" />
                <h3 className="font-serif-luxury text-lg text-[#2D2024]">
                  Votre liste d'envies est vide
                </h3>
                <p className="text-xs text-[#70585F] max-w-xs mx-auto">
                  Cliquez sur le cœur d'un produit pour le sauvegarder et le retrouver plus tard sans besoin de compte.
                </p>
              </div>
            ) : (
              favoritedProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex gap-4 p-3 bg-white rounded-2xl border border-[#F2E5E8] shadow-2xs items-center"
                >
                  <div
                    onClick={() => {
                      onClose();
                      onSelectProduct(p);
                    }}
                    className="w-16 h-20 rounded-xl overflow-hidden bg-[#FAF3F5] shrink-0 cursor-pointer"
                  >
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4
                      onClick={() => {
                        onClose();
                        onSelectProduct(p);
                      }}
                      className="font-serif-luxury text-sm font-semibold text-[#2D2024] truncate cursor-pointer hover:text-[#BE395D]"
                    >
                      {p.name}
                    </h4>
                    <p className="text-xs font-bold text-[#BE395D] mt-0.5">
                      {formatPrice(p.price)}
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        onSelectProduct(p);
                      }}
                      className="text-[11px] text-[#2D2024] font-semibold underline mt-1 block"
                    >
                      Choisir ma taille →
                    </button>
                  </div>

                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="p-2 text-[#A69398] hover:text-red-600 transition-colors"
                    title="Retirer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
