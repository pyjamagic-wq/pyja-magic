import React, { useState } from 'react';
import { ShoppingBag, Heart, Search, Truck, ShieldCheck, Sparkles, Menu, X, PackageSearch, SlidersHorizontal } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { formatPrice } from '../../utils/formatters';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onNavigate: (view: 'home' | 'catalog' | 'tracking' | 'faq' | 'admin', category?: string) => void;
  activeView: string;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenWishlist,
  onNavigate,
  activeView,
  onOpenSearch,
}) => {
  const { cart, wishlist, settings } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const navLinks = [
    { label: 'Accueil', view: 'home' as const },
    { label: 'Collection 2026', view: 'catalog' as const },
    { label: 'Pyjamas Satin', view: 'catalog' as const, category: 'Pyjamas satin' },
    { label: 'Pyjamas Coton', view: 'catalog' as const, category: 'Pyjamas coton' },
    { label: 'Suivre ma commande', view: 'tracking' as const },
    { label: 'FAQ & Livraison', view: 'faq' as const },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F6]/95 backdrop-blur-md border-b border-[#F2E5E8] transition-all">
      {/* Top Luxury Announcement Bar */}
      <div className="bg-[#2D2024] text-[#FAF7F6] text-xs py-2 px-4 tracking-wider text-center font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden md:flex items-center gap-4 text-[#E6C9D1] text-[11px]">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#F5B5C4]" />
              Livraison 69 Wilayas
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F5B5C4]" />
              Paiement à la livraison (COD)
            </span>
          </div>

          <p className="mx-auto text-center text-[11px] md:text-xs text-[#FAF7F6]">
            {settings.announcementText || '✨ LIVRAISON EXPRESS DANS LES 69 WILAYAS • PAIEMENT À LA LIVRAISON (COD) ✨'}
          </p>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile hamburger menu */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#2D2024] hover:text-[#BE395D] transition-colors focus:outline-none"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              onClick={onOpenSearch}
              className="p-2 text-[#2D2024] hover:text-[#BE395D] transition-colors ml-1"
              aria-label="Recherche"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-1 md:flex-initial text-center md:text-left">
            <button
              onClick={() => onNavigate('home')}
              className="group inline-flex items-center gap-3 focus:outline-none"
            >
              <img
                src="/logo.jpg"
                alt="Pyjamas Magique Logo"
                className="h-10 sm:h-12 w-auto object-contain rounded-full shadow-xs group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col text-left">
                <span className="font-serif-luxury text-xl sm:text-2xl tracking-[0.15em] text-[#2D2024] font-semibold group-hover:text-[#BE395D] transition-colors">
                  PYJAMAS MAGIQUE
                </span>
                <span className="text-[9px] tracking-[0.25em] text-[#9A7D85] uppercase -mt-0.5 font-medium">
                  Mostaganem • Algérie
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7">
            {navLinks.map((link, idx) => (
              <button
                key={idx}
                onClick={() => onNavigate(link.view, link.category)}
                className={`text-[13px] tracking-wider uppercase font-medium transition-colors relative py-1 ${
                  activeView === link.view
                    ? 'text-[#BE395D]'
                    : 'text-[#4A3C40] hover:text-[#BE395D]'
                }`}
              >
                {link.label}
                {activeView === link.view && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#BE395D] rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop Search Button */}
            <button
              onClick={onOpenSearch}
              className="hidden md:flex items-center gap-2 text-xs text-[#70585F] hover:text-[#2D2024] bg-[#F3ECEE] hover:bg-[#EBDDE1] px-3 py-2 rounded-full transition-all"
            >
              <Search className="w-4 h-4 text-[#9A7D85]" />
              <span className="tracking-wide">Rechercher...</span>
            </button>

            {/* Suivi Rapide Link Desktop */}
            <button
              onClick={() => onNavigate('tracking')}
              title="Suivre ma commande"
              className="hidden lg:flex items-center gap-1.5 text-xs text-[#5C4B50] hover:text-[#BE395D] px-2 py-1 transition-colors"
            >
              <PackageSearch className="w-4 h-4 text-[#BE395D]" />
              <span className="hidden xl:inline text-[12px] font-medium">Suivi Colis</span>
            </button>

            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 text-[#2D2024] hover:text-[#BE395D] transition-colors"
              title="Favoris"
              aria-label="Favoris"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 text-[10px] bg-[#BE395D] text-white rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 bg-[#2D2024] hover:bg-[#3E2D32] text-white px-3.5 py-2 rounded-full transition-all shadow-sm group"
              aria-label="Panier d'achat"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-[#F5B5C4] group-hover:scale-110 transition-transform" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#BE395D] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-medium tracking-wide">
                {totalCartAmount > 0 ? formatPrice(totalCartAmount) : 'Panier'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF7F6] border-b border-[#F2E5E8] px-5 py-4 space-y-3 animate-fadeIn">
          {navLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={() => {
                onNavigate(link.view, link.category);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm font-medium tracking-wide text-[#2D2024] hover:text-[#BE395D] border-b border-[#F5EDEF] last:border-0"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 flex items-center justify-between text-xs text-[#9A7D85]">
            <span>Livraison 69 Wilayas</span>
            <span>Paiement à la livraison (COD)</span>
          </div>
        </div>
      )}
    </header>
  );
};
