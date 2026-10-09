import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { formatPrice } from '../../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const { cart, updateCartQuantity, removeFromCart } = useStore();

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F6] shadow-2xl flex flex-col border-l border-[#F2E5E8]">
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#F2E5E8] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#BE395D]" />
              <h2 className="font-serif-luxury text-xl text-[#2D2024] font-semibold">
                Mon Panier ({totalCount})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#70585F] hover:text-[#2D2024] hover:bg-[#FAF3F5] rounded-full transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF3F5] flex items-center justify-center mx-auto text-[#BE395D]">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="font-serif-luxury text-lg text-[#2D2024] font-semibold">
                  Votre panier vous attend 💗
                </h3>
                <p className="text-xs text-[#70585F] max-w-xs mx-auto">
                  Découvrez nos pyjamas soyeux et confortables confectionnés pour sublimer vos nuits.
                </p>
                <button
                  onClick={onClose}
                  className="inline-block bg-[#BE395D] text-white text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-full shadow-sm hover:bg-[#9E2B4B] transition-colors"
                >
                  Découvrir la collection
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-4 p-3 bg-white rounded-2xl border border-[#F2E5E8] shadow-2xs group"
                >
                  {/* Item Image */}
                  <div className="w-20 h-24 rounded-xl overflow-hidden bg-[#FAF3F5] shrink-0 border border-[#F5EDEF]">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="font-serif-luxury text-sm font-semibold text-[#2D2024] line-clamp-1">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.variantId)}
                          className="text-[#A69398] hover:text-red-600 transition-colors p-1"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variant badges */}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[#70585F]">
                        <span className="font-medium bg-[#FAF3F5] px-2 py-0.5 rounded text-[#2D2024]">
                          Taille : {item.sizeName}
                        </span>
                        <span className="flex items-center gap-1 bg-[#FAF3F5] px-2 py-0.5 rounded text-[#2D2024]">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/15 inline-block"
                            style={{ backgroundColor: item.colorHex }}
                          />
                          {item.colorName}
                        </span>
                      </div>
                    </div>

                    {/* Stepper + Subtotal */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[#EBDDE1] rounded-xl bg-[#FAF8F8]">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.variantId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#2D2024] hover:bg-white rounded-l-xl"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-[#2D2024]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={item.quantity >= item.maxStock}
                          onClick={() => updateCartQuantity(item.variantId, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#2D2024] hover:bg-white rounded-r-xl disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-bold text-[#2D2024]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with Totals */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#F2E5E8] bg-white space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#70585F]">
                  <span>Sous-total articles</span>
                  <span className="font-semibold text-[#2D2024]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#70585F]">
                  <span>Livraison (69 Wilayas)</span>
                  <span className="italic text-[#BE395D]">Calculée au checkout</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#2D2024] pt-2 border-t border-[#F5EDEF]">
                  <span>Total estimé</span>
                  <span className="text-base text-[#BE395D]">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full bg-[#BE395D] hover:bg-[#9E2B4B] text-white py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 group"
              >
                <span>Commander Maintenant</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] text-[#8C737B] pt-1">
                <span>🔒 Paiement à la livraison</span>
                <span>•</span>
                <span>📦 Suivi Yalidine Express</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
