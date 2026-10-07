import React from 'react';
import { Home, Sparkles, ShoppingBag, PackageSearch, Heart } from 'lucide-react';
import { useStore } from '../../hooks/useStore';

interface MobileBottomNavProps {
  activeView: string;
  onNavigate: (view: 'home' | 'catalog' | 'tracking' | 'faq' | 'admin') => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  onNavigate,
  onOpenCart,
  onOpenWishlist,
}) => {
  const { cart, wishlist } = useStore();
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FAF7F6]/95 backdrop-blur-md border-t border-[#EBDDE1] py-2 px-3 shadow-[0_-4px_16px_rgba(45,32,36,0.06)]">
      <div className="flex items-center justify-around">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeView === 'home' ? 'text-[#BE395D]' : 'text-[#70585F] hover:text-[#2D2024]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Accueil</span>
        </button>

        <button
          onClick={() => onNavigate('catalog')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeView === 'catalog' ? 'text-[#BE395D]' : 'text-[#70585F] hover:text-[#2D2024]'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>Boutique</span>
        </button>

        <button
          onClick={onOpenCart}
          className="flex flex-col items-center gap-1 text-[10px] font-medium relative text-[#70585F] hover:text-[#2D2024]"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#BE395D] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalCartCount}
              </span>
            )}
          </div>
          <span>Panier</span>
        </button>

        <button
          onClick={() => onNavigate('tracking')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeView === 'tracking' ? 'text-[#BE395D]' : 'text-[#70585F] hover:text-[#2D2024]'
          }`}
        >
          <PackageSearch className="w-5 h-5" />
          <span>Suivi</span>
        </button>

        <button
          onClick={onOpenWishlist}
          className="flex flex-col items-center gap-1 text-[10px] font-medium relative text-[#70585F] hover:text-[#2D2024]"
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#BE395D] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {wishlist.length}
              </span>
            )}
          </div>
          <span>Favoris</span>
        </button>
      </div>
    </div>
  );
};
