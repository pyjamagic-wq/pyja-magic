import React, { useState, useEffect } from 'react';
import { Header } from './components/client/Header';
import { Footer } from './components/client/Footer';
import { MobileBottomNav } from './components/client/MobileBottomNav';
import { HeroSection } from './components/client/HeroSection';
import { FeaturesSection } from './components/client/FeaturesSection';
import { WhyUsSection } from './components/client/WhyUsSection';
import { TestimonialsSection } from './components/client/TestimonialsSection';
import { NewsletterSection } from './components/client/NewsletterSection';
import { ProductCard } from './components/client/ProductCard';
import { ProductDetailView } from './components/client/ProductDetailView';
import { CatalogView } from './components/client/CatalogView';
import { CartDrawer } from './components/client/CartDrawer';
import { CheckoutModal } from './components/client/CheckoutModal';
import { OrderConfirmationView } from './components/client/OrderConfirmationView';
import { OrderTrackingView } from './components/client/OrderTrackingView';
import { FaqSection } from './components/client/FaqSection';
import { WishlistDrawer } from './components/client/WishlistDrawer';
import { SearchModal } from './components/client/SearchModal';
import { QuickViewModal } from './components/client/QuickViewModal';

// Admin imports
import { AdminAuth } from './components/admin/AdminAuth';
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminOrders } from './components/admin/AdminOrders';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminStock } from './components/admin/AdminStock';
import { AdminWilayas } from './components/admin/AdminWilayas';
import { AdminCoupons } from './components/admin/AdminCoupons';
import { AdminReviews } from './components/admin/AdminReviews';
import { AdminSettings } from './components/admin/AdminSettings';

import { useStore } from './hooks/useStore';
import { Product, Order } from './types';
import { Sparkles, ArrowRight, Flame } from 'lucide-react';

export default function App() {
  const { products } = useStore();

  // Navigation state
  const [currentView, setCurrentView] = useState<'home' | 'catalog' | 'product' | 'tracking' | 'faq' | 'confirmation' | 'admin'>('home');
  const [catalogCategory, setCatalogCategory] = useState<string | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Modals state
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Confirmed / Tracked Order
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [trackingOrderCode, setTrackingOrderCode] = useState<string>('');

  // Admin Auth state
  const [adminSession, setAdminSession] = useState<{ email: string } | null>(() => {
    try {
      const sess = localStorage.getItem('pyjamagic_admin_session');
      return sess ? JSON.parse(sess) : null;
    } catch {
      return null;
    }
  });
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // Best Sellers & New Arrivals on Home
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const newArrivals = products.filter((p) => p.isNew).slice(0, 4);

  const handleNavigate = (view: 'home' | 'catalog' | 'tracking' | 'faq' | 'admin', category?: string) => {
    setCurrentView(view);
    setCatalogCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setCurrentView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
    setCheckoutOpen(false);
    setCurrentView('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackOrderFromConfirmation = (code: string) => {
    setTrackingOrderCode(code);
    setCurrentView('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('pyjamagic_admin_session');
    setAdminSession(null);
    setCurrentView('home');
  };

  // --- RENDER ADMIN INTERFACE ---
  if (currentView === 'admin') {
    if (!adminSession) {
      return (
        <AdminAuth
          onLoginSuccess={(email) => setAdminSession({ email })}
          onExitAdmin={() => setCurrentView('home')}
        />
      );
    }

    return (
      <AdminLayout
        currentTab={adminTab}
        onTabChange={setAdminTab}
        onLogout={handleAdminLogout}
        onViewStore={() => setCurrentView('home')}
        adminEmail={adminSession.email}
      >
        {adminTab === 'dashboard' && <AdminDashboard onNavigateTab={setAdminTab} />}
        {adminTab === 'orders' && <AdminOrders />}
        {adminTab === 'products' && <AdminProducts />}
        {adminTab === 'stock' && <AdminStock />}
        {adminTab === 'wilayas' && <AdminWilayas />}
        {adminTab === 'coupons' && <AdminCoupons />}
        {adminTab === 'reviews' && <AdminReviews />}
        {adminTab === 'settings' && <AdminSettings />}
      </AdminLayout>
    );
  }

  // --- RENDER CLIENT INTERFACE ---
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F6] text-[#2D2024]">
      {/* Client Header */}
      <Header
        activeView={currentView}
        onNavigate={handleNavigate}
        onOpenCart={() => setCartOpen(true)}
        onOpenWishlist={() => setWishlistOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16 md:pb-0">
        {/* VIEW 1: HOMEPAGE */}
        {currentView === 'home' && (
          <div className="space-y-16">
            <HeroSection
              onDiscover={() => handleNavigate('catalog')}
              onBestSellers={() => {
                const el = document.getElementById('bestsellers-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <FeaturesSection />

            {/* Best Sellers Section */}
            <section id="bestsellers-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#BE395D] mb-1">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    Plébiscités par nos clientes
                  </div>
                  <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#2D2024]">
                    Nos Meilleures Ventes
                  </h2>
                </div>

                <button
                  onClick={() => handleNavigate('catalog')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#BE395D] hover:underline"
                >
                  <span>Voir toute la collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {bestSellers.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onSelectProduct={handleSelectProduct}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>
            </section>

            {/* Category Discovery Cards */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#BE395D]">
                  Matières & Univers
                </span>
                <h2 className="font-serif-luxury text-3xl font-bold text-[#2D2024] mt-1">
                  Explorez par Catégorie
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Pyjamas en Satin Soyeux',
                    category: 'Pyjamas satin',
                    desc: 'Élégance classique avec col chemisier et douceur soyeuse sur la peau.',
                    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80',
                  },
                  {
                    title: 'Pyjamas en Pur Coton Bio',
                    category: 'Pyjamas coton',
                    desc: 'Respirabilité naturelle et douceur cocooning pour toutes les saisons.',
                    image: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=700&q=80',
                  },
                  {
                    title: 'Collection Hiver & Velours',
                    category: 'Collection hiver',
                    desc: 'Velours côtelé fin et chaleur douillette pour les soirées fraîches.',
                    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=700&q=80',
                  },
                ].map((cat, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleNavigate('catalog', cat.category)}
                    className="group relative rounded-3xl overflow-hidden aspect-[4/5] cursor-pointer shadow-md border border-[#F2E5E8]"
                  >
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                      <h3 className="font-serif-luxury text-2xl font-bold">{cat.title}</h3>
                      <p className="text-xs text-white/80 line-clamp-2">{cat.desc}</p>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F5B5C4] pt-2 underline">
                        Découvrir →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* New Arrivals Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#BE395D] mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Derniers arrivages
                  </div>
                  <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#2D2024]">
                    Nouveautés de la Semaine
                  </h2>
                </div>

                <button
                  onClick={() => handleNavigate('catalog')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#BE395D] hover:underline"
                >
                  <span>Explorer le catalogue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {newArrivals.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onSelectProduct={handleSelectProduct}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>
            </section>

            <WhyUsSection />
            <TestimonialsSection />
            <NewsletterSection />
          </div>
        )}

        {/* VIEW 2: CATALOG */}
        {currentView === 'catalog' && (
          <CatalogView
            initialCategory={catalogCategory}
            onSelectProduct={handleSelectProduct}
            onQuickView={setQuickViewProduct}
          />
        )}

        {/* VIEW 3: PRODUCT DETAIL */}
        {currentView === 'product' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            onBackToCatalog={() => handleNavigate('catalog')}
            onSelectProduct={handleSelectProduct}
            onOpenCart={() => setCartOpen(true)}
          />
        )}

        {/* VIEW 4: ORDER TRACKING */}
        {currentView === 'tracking' && (
          <OrderTrackingView
            initialOrderCode={trackingOrderCode}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}

        {/* VIEW 5: FAQ & 69 WILAYAS */}
        {currentView === 'faq' && <FaqSection />}

        {/* VIEW 6: ORDER CONFIRMATION */}
        {currentView === 'confirmation' && (
          confirmedOrder ? (
            <OrderConfirmationView
              order={confirmedOrder}
              onTrackOrder={handleTrackOrderFromConfirmation}
              onContinueShopping={() => handleNavigate('catalog')}
            />
          ) : (
            <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
              <h2 className="text-2xl font-serif-luxury font-bold text-[#2D2024]">Aucune commande récente</h2>
              <p className="text-xs text-[#70585F]">Vous n'avez pas de commande active à afficher.</p>
              <button
                onClick={() => handleNavigate('catalog')}
                className="bg-[#BE395D] text-white text-xs font-bold uppercase py-3 px-6 rounded-full"
              >
                Retourner au catalogue
              </button>
            </div>
          )
        )}
      </main>

      {/* Client Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Mobile Bottom Sticky Navigation */}
      <MobileBottomNav
        activeView={currentView}
        onNavigate={(v) => handleNavigate(v)}
        onOpenCart={() => setCartOpen(true)}
        onOpenWishlist={() => setWishlistOpen(true)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onProceedToCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        onSelectProduct={handleSelectProduct}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onViewFullProduct={handleSelectProduct}
      />
    </div>
  );
}
