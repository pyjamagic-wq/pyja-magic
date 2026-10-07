import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Truck,
  Tag,
  Star,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'stock'
  | 'wilayas'
  | 'coupons'
  | 'reviews'
  | 'settings';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
  onViewStore: () => void;
  adminEmail: string;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onLogout,
  onViewStore,
  adminEmail,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { id: 'dashboard' as AdminTab, label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'orders' as AdminTab, label: 'Commandes', icon: ShoppingBag },
    { id: 'products' as AdminTab, label: 'Produits & Variantes', icon: Package },
    { id: 'stock' as AdminTab, label: 'Stock & Mouvements', icon: Layers },
    { id: 'wilayas' as AdminTab, label: 'Livraison 69 Wilayas', icon: Truck },
    { id: 'coupons' as AdminTab, label: 'Promotions & Coupons', icon: Tag },
    { id: 'reviews' as AdminTab, label: 'Avis Clientes', icon: Star },
    { id: 'settings' as AdminTab, label: 'Paramètres Boutique', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F6] flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#2D2024] text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#3D2C31]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-[#3D2C31] text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-serif-luxury text-lg font-bold tracking-wider">
            PYJA MAGIC ADMIN
          </span>
        </div>

        <button
          onClick={onViewStore}
          className="text-xs text-[#F5B5C4] hover:text-white flex items-center gap-1 font-medium"
        >
          <span>Voir Boutique</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sidebar Desktop & Mobile Drawer */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#261B1E] text-[#E6D8DC] flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-[#38272C]`}
      >
        <div>
          {/* Brand Logo in Sidebar */}
          <div className="p-6 border-b border-[#38272C] flex items-center justify-between">
            <div>
              <h2 className="font-serif-luxury text-xl font-bold tracking-[0.2em] text-[#FAF7F6]">
                PYJA MAGIC
              </h2>
              <span className="text-[10px] tracking-wider uppercase text-[#F5B5C4] font-semibold block">
                Panneau Administrateur
              </span>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 text-[#A69398]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#BE395D] text-white shadow-md'
                      : 'text-[#C7B5BA] hover:bg-[#342429] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#38272C] space-y-2">
          <div className="px-3 py-2 bg-[#1F1618] rounded-xl text-[11px] text-[#A69398] truncate">
            <span className="block text-[9px] uppercase font-bold text-[#F5B5C4]">Connecté en tant que</span>
            <span className="font-medium text-[#FAF7F6] truncate">{adminEmail}</span>
          </div>

          <button
            onClick={onViewStore}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-[#C7B5BA] hover:bg-[#342429] hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-[#F5B5C4]" />
            <span>Aller sur la Boutique</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Desktop Top Sub-header */}
        <div className="hidden md:flex items-center justify-between bg-white border-b border-[#F2E5E8] px-8 py-4 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#BE395D]" />
            <h1 className="text-sm font-bold uppercase tracking-wider text-[#2D2024]">
              {navigation.find((n) => n.id === currentTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onViewStore}
              className="inline-flex items-center gap-1.5 text-xs text-[#BE395D] bg-[#FAF3F5] hover:bg-[#F2E0E5] px-3.5 py-2 rounded-full font-semibold transition-colors"
            >
              <span>Voir le site en direct</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Injected Tab Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
