import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  AlertTriangle,
  XCircle,
  Users,
  DollarSign,
  Package,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { formatPrice } from '../../utils/formatters';

interface AdminDashboardProps {
  onNavigateTab: (tab: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { orders, products } = useStore();

  // Metrics calculations
  const totalRevenue = orders
    .filter((o) => o.status !== 'annulee' && o.status !== 'refusee')
    .reduce((sum, o) => sum + o.total, 0);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 3600 * 1000).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const ordersToday = orders.filter((o) => new Date(o.createdAt).getTime() >= startOfToday).length;
  const ordersThisWeek = orders.filter((o) => new Date(o.createdAt).getTime() >= startOfWeek).length;
  const ordersThisMonth = orders.filter((o) => new Date(o.createdAt).getTime() >= startOfMonth).length;

  const pendingOrders = orders.filter((o) => ['en_attente', 'nouvelle', 'acceptee', 'confirmee', 'preparation'].includes(o.status)).length;
  const shippedOrders = orders.filter((o) => ['arriver_yalidine', 'expediee', 'en_livraison'].includes(o.status)).length;
  const deliveredOrders = orders.filter((o) => o.status === 'livree').length;
  const refusedOrders = orders.filter((o) => o.status === 'refusee' || o.status === 'retour').length;

  // Stock alerts
  let outOfStockCount = 0;
  let lowStockCount = 0;

  products.forEach((p) => {
    p.variants.forEach((v) => {
      if (v.stockQuantity === 0) outOfStockCount++;
      else if (v.stockQuantity <= v.lowStockThreshold) lowStockCount++;
    });
  });

  // Unique customers by phone
  const uniqueCustomerPhones = new Set(orders.map((o) => o.phone.replace(/\s+/g, ''))).size;

  // Wilaya distribution
  const wilayaCounts: Record<string, number> = {};
  orders.forEach((o) => {
    wilayaCounts[o.wilayaName] = (wilayaCounts[o.wilayaName] || 0) + 1;
  });
  const topWilayas = Object.entries(wilayaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#2D2024] to-[#452D34] text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#F5B5C4] font-semibold">
            Boutique PYJA MAGIC Algérie • En Direct
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold mt-1">
            Performances E-Commerce & Suivi Logistique
          </h2>
          <p className="text-xs text-[#E6D8DC] mt-1 max-w-xl">
            Gestion centralisée des commandes dans les 69 wilayas, des stocks par variante et des expéditions Yalidine Express.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('orders')}
          className="bg-[#BE395D] hover:bg-[#9E2B4B] text-white px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm shrink-0 flex items-center gap-2 self-start sm:self-auto"
        >
          <span>Voir les commandes récentes</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-[#F2E5E8] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8C737B] uppercase tracking-wider">
              Chiffre d'Affaires Total
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              DA
            </div>
          </div>
          <div className="text-2xl font-bold text-[#2D2024]">
            {formatPrice(totalRevenue)}
          </div>
          <p className="text-[11px] text-[#8C737B]">
            Sur les commandes validées & expédiées
          </p>
        </div>

        {/* Orders Today / Month */}
        <div className="bg-white p-5 rounded-3xl border border-[#F2E5E8] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8C737B] uppercase tracking-wider">
              Commandes Actives
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF3F5] text-[#BE395D] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#2D2024]">
            {orders.length}
          </div>
          <p className="text-[11px] text-[#8C737B]">
            <span className="font-bold text-[#BE395D]">{ordersToday}</span> aujourd'hui • <span className="font-bold text-[#BE395D]">{ordersThisMonth}</span> ce mois
          </p>
        </div>

        {/* Unique Customers */}
        <div className="bg-white p-5 rounded-3xl border border-[#F2E5E8] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8C737B] uppercase tracking-wider">
              Clientes Uniques
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#2D2024]">
            {uniqueCustomerPhones}
          </div>
          <p className="text-[11px] text-[#8C737B]">
            Commandes sans inscription requise
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-3xl border border-[#F2E5E8] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8C737B] uppercase tracking-wider">
              Alertes Stock
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#2D2024]">
            {lowStockCount + outOfStockCount}
          </div>
          <p className="text-[11px] text-[#8C737B]">
            <span className="text-amber-700 font-semibold">{lowStockCount} faibles</span> • <span className="text-red-600 font-semibold">{outOfStockCount} épuisés</span>
          </p>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-[#F2E5E8] shadow-2xs space-y-4">
        <h3 className="font-serif-luxury text-lg font-bold text-[#2D2024]">
          État des Commandes en Cours
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>À traiter / Préparation</span>
            </div>
            <p className="text-2xl font-bold text-amber-950 mt-2">{pendingOrders}</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>En cours d'expédition</span>
            </div>
            <p className="text-2xl font-bold text-blue-950 mt-2">{shippedOrders}</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Livrées & Encaissées</span>
            </div>
            <p className="text-2xl font-bold text-emerald-950 mt-2">{deliveredOrders}</p>
          </div>

          <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200">
            <div className="flex items-center gap-2 text-xs font-bold text-red-900">
              <XCircle className="w-4 h-4 text-red-600" />
              <span>Refusées / Retours</span>
            </div>
            <p className="text-2xl font-bold text-red-950 mt-2">{refusedOrders}</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Wilayas distribution & Inventory summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Wilayas */}
        <div className="bg-white p-6 rounded-3xl border border-[#F2E5E8] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-luxury text-lg font-bold text-[#2D2024]">
              Top Wilayas d'Algérie
            </h3>
            <button
              onClick={() => onNavigateTab('wilayas')}
              className="text-xs text-[#BE395D] font-semibold hover:underline"
            >
              Gérer tarifs 69 wilayas →
            </button>
          </div>

          <div className="space-y-3">
            {topWilayas.length === 0 ? (
              <p className="text-xs text-[#8C737B]">Aucune commande pour le moment.</p>
            ) : (
              topWilayas.map(([wilayaName, count], idx) => {
                const percent = Math.round((count / orders.length) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-[#2D2024]">
                      <span>{wilayaName}</span>
                      <span className="font-bold text-[#BE395D]">
                        {count} commande(s) ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#FAF3F5] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#BE395D] rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Stock Action Alert */}
        <div className="bg-white p-6 rounded-3xl border border-[#F2E5E8] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-luxury text-lg font-bold text-[#2D2024]">
              Articles à Réapprovisionner
            </h3>
            <button
              onClick={() => onNavigateTab('stock')}
              className="text-xs text-[#BE395D] font-semibold hover:underline"
            >
              Gestion du stock →
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {products.flatMap((p) =>
              p.variants
                .filter((v) => v.stockQuantity <= v.lowStockThreshold)
                .map((v) => (
                  <div
                    key={v.id}
                    className="p-3 bg-[#FAF8F8] rounded-2xl border border-[#F2E5E8] flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#2D2024]">{p.name}</p>
                      <p className="text-[11px] text-[#70585F]">
                        {v.colorName} • Taille {v.sizeName}
                      </p>
                    </div>

                    <div className="text-right">
                      {v.stockQuantity === 0 ? (
                        <span className="text-red-700 bg-red-100 font-bold px-2 py-0.5 rounded text-[10px]">
                          ÉPUISÉ (0)
                        </span>
                      ) : (
                        <span className="text-amber-800 bg-amber-100 font-bold px-2 py-0.5 rounded text-[10px]">
                          Restant : {v.stockQuantity}
                        </span>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
