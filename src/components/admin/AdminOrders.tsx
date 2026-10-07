import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Truck,
  RefreshCw,
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  X,
  ExternalLink,
  ChevronDown,
  Sparkles,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { Order, OrderStatus } from '../../types';
import { formatPrice, formatDate, getOrderStatusInfo } from '../../utils/formatters';

export const AdminOrders: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    setManualTracking,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [manualTrackingInput, setManualTrackingInput] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    // Status
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = o.orderNumber.toLowerCase().includes(q);
      const matchName = `${o.customerFirstName} ${o.customerLastName}`.toLowerCase().includes(q);
      const matchPhone = o.phone.includes(q);
      const matchWilaya = o.wilayaName.toLowerCase().includes(q);
      const matchYalidine = (o.yalidineTrackingNumber || '').toLowerCase().includes(q);

      if (!matchNumber && !matchName && !matchPhone && !matchWilaya && !matchYalidine) {
        return false;
      }
    }

    return true;
  });

  const allStatuses: Array<{ key: OrderStatus; label: string }> = [
    { key: 'en_attente', label: '1. En attente' },
    { key: 'acceptee', label: '2. Acceptée' },
    { key: 'preparation', label: '3. En préparation' },
    { key: 'arriver_yalidine', label: '4. Arrivé chez Yalidine' },
    { key: 'en_livraison', label: '5. En livraison' },
    { key: 'livree', label: '6. Livrée & Encaissée' },
    { key: 'refusee', label: 'Refusée' },
    { key: 'retour', label: 'Retour' },
    { key: 'annulee', label: 'Annulée' },
  ];

  const handleStatusChange = (orderNumber: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderNumber, newStatus, 'Admin', `Statut mis à jour manuellement par l’administrateur.`);
    if (selectedOrder && selectedOrder.orderNumber === orderNumber) {
      setSelectedOrder({
        ...selectedOrder,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    }
    setActionNotice(`Statut de ${orderNumber} mis à jour avec succès.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleSaveManualTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !manualTrackingInput.trim()) return;

    setManualTracking(selectedOrder.orderNumber, manualTrackingInput.trim());
    setSelectedOrder({
      ...selectedOrder,
      status: 'arriver_yalidine',
      yalidineTrackingNumber: manualTrackingInput.trim().toUpperCase(),
      yalidineStatus: 'Déposé au bureau Yalidine',
    });
    setManualTrackingInput('');
    setActionNotice(`N° de bordereau papier enregistré ! Statut passé à "Arrivé chez Yalidine".`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Action Notification */}
      {actionNotice && (
        <div className="p-4 bg-[#2D2024] text-white rounded-2xl text-xs font-semibold shadow-lg flex items-center justify-between animate-fadeIn">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-[#F5B5C4] underline ml-3">
            Fermer
          </button>
        </div>
      )}

      {/* Top Filter & Search Controls */}
      <div className="bg-white p-5 rounded-3xl border border-[#F2E5E8] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A69398] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Rechercher par N° commande, nom cliente, téléphone, wilaya, N° Yalidine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-3 py-3 rounded-2xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D] bg-[#FAF8F8]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#BE395D]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-3 rounded-2xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D] bg-white font-medium text-[#2D2024]"
            >
              <option value="all">Tous les statuts ({orders.length})</option>
              {allStatuses.map((st) => (
                <option key={st.key} value={st.key}>
                  {st.label} ({orders.filter((o) => o.status === st.key).length})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#F2E5E8] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF3F5] text-[#2D2024] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Commande</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Wilaya & Commune</th>
                <th className="py-3.5 px-4">Articles</th>
                <th className="py-3.5 px-4">Total COD</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4">Yalidine</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2E5E8] text-[#523F44]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#8C737B]">
                    Aucune commande ne correspond à vos filtres.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = getOrderStatusInfo(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-[#FAF8F8] transition-colors">
                      {/* Order number */}
                      <td className="py-3 px-4 font-mono font-bold text-[#BE395D]">
                        {order.orderNumber}
                        <span className="block text-[10px] text-[#8C737B] font-sans font-normal">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <p className="font-semibold text-[#2D2024]">
                          {order.customerFirstName} {order.customerLastName}
                        </p>
                        <p className="text-[11px] text-[#70585F]">{order.phone}</p>
                      </td>

                      {/* Destination */}
                      <td className="py-3 px-4">
                        <p className="font-medium text-[#2D2024]">{order.wilayaName}</p>
                        <p className="text-[10px] text-[#8C737B]">
                          {order.commune} ({order.deliveryType === 'stopdesk' ? 'Bureau' : 'Domicile'})
                        </p>
                      </td>

                      {/* Items */}
                      <td className="py-3 px-4">
                        {order.items.map((i, idx) => (
                          <div key={idx} className="line-clamp-1 text-[11px]">
                            {i.quantity}x {i.productName} ({i.sizeName})
                          </div>
                        ))}
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 font-bold text-[#2D2024]">
                        {formatPrice(order.total)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Yalidine Tracking */}
                      <td className="py-3 px-4">
                        {order.yalidineTrackingNumber ? (
                          <div>
                            <span className="font-mono text-[11px] text-[#BE395D] font-bold block">
                              {order.yalidineTrackingNumber}
                            </span>
                            <span className="text-[9px] text-[#8C737B]">
                              {order.yalidineStatus || 'En cours'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#A69398] italic">
                            Non généré
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="bg-[#FAF3F5] hover:bg-[#BE395D] hover:text-white text-[#BE395D] p-2 rounded-xl transition-all"
                          title="Détails de la commande"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-[#FAF7F6] rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#F2E5E8] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-white border-b border-[#F2E5E8] flex items-center justify-between sticky top-0 z-20">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#BE395D] tracking-wider">
                  Détails Commande
                </span>
                <h2 className="font-serif-luxury text-2xl font-bold text-[#2D2024]">
                  {selectedOrder.orderNumber}
                </h2>
                <p className="text-xs text-[#8C737B]">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-[#70585F] hover:bg-[#FAF3F5] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 space-y-6 flex-1">
              {/* Quick Status Workflow Progression */}
              <div className="bg-white p-5 rounded-2xl border border-[#F2E5E8] space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#BE395D] block">
                  Flux Opérationnel de Traitement
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedOrder.orderNumber, 'acceptee')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      selectedOrder.status === 'acceptee'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    1. Accepter
                  </button>

                  <button
                    onClick={() => handleStatusChange(selectedOrder.orderNumber, 'preparation')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      selectedOrder.status === 'preparation'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
                    }`}
                  >
                    2. En préparation
                  </button>

                  <button
                    onClick={() => handleStatusChange(selectedOrder.orderNumber, 'arriver_yalidine')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      selectedOrder.status === 'arriver_yalidine'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-sky-50 text-sky-900 hover:bg-sky-100 border border-sky-200'
                    }`}
                  >
                    3. Arrivé Yalidine
                  </button>

                  <button
                    onClick={() => handleStatusChange(selectedOrder.orderNumber, 'livree')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      selectedOrder.status === 'livree'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    4. Livrée (Encaissée)
                  </button>
                </div>

                {/* Additional manual status selector */}
                <div className="pt-2 border-t border-[#FAF3F5] flex items-center justify-between text-xs">
                  <span className="text-[#8C737B]">Autre statut :</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {allStatuses.map((st) => (
                      <button
                        key={st.key}
                        onClick={() => handleStatusChange(selectedOrder.orderNumber, st.key)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                          selectedOrder.status === st.key
                            ? 'bg-[#2D2024] text-white'
                            : 'bg-[#FAF8F8] text-[#523F44] hover:bg-[#F2E0E5]'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Saisie Manuelle du Numéro de Bordereau Yalidine (Sans API requise) */}
              <div className="bg-white p-5 rounded-2xl border border-[#F2E5E8] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D2024] flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#BE395D]" />
                    Bordereau / Suivi Yalidine (Saisie Manuelle)
                  </h3>
                  {selectedOrder.yalidineTrackingNumber && (
                    <a
                      href={`https://yalidine.app/tracking?tracking=${selectedOrder.yalidineTrackingNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#BE395D] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Vérifier sur Yalidine.app</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <p className="text-[11px] text-[#70585F] leading-relaxed">
                  Lorsque vous déposez le colis au bureau Yalidine, inscrivez simplement le numéro de bordereau remis sur votre reçu papier. La cliente pourra suivre son colis en direct.
                </p>

                {selectedOrder.yalidineTrackingNumber ? (
                  <div className="p-3 bg-[#FAF3F5] rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#8C737B] block">N° de suivi actuel :</span>
                      <span className="font-mono text-base font-bold text-[#BE395D]">
                        {selectedOrder.yalidineTrackingNumber}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setManualTrackingInput(selectedOrder.yalidineTrackingNumber || '');
                      }}
                      className="text-xs text-[#70585F] underline hover:text-[#2D2024]"
                    >
                      Modifier le code
                    </button>
                  </div>
                ) : null}

                <form onSubmit={handleSaveManualTracking} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Tapez le N° de bordereau papier (ex: YAL-948210)..."
                    value={manualTrackingInput}
                    onChange={(e) => setManualTrackingInput(e.target.value.toUpperCase())}
                    className="flex-1 text-xs p-3 rounded-xl border border-[#EBDDE1] bg-[#FAF8F8] font-mono uppercase focus:outline-none focus:border-[#BE395D]"
                  />
                  <button
                    type="submit"
                    className="bg-[#2D2024] hover:bg-[#3E2D32] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0"
                  >
                    Enregistrer Bordereau
                  </button>
                </form>
              </div>

              {/* Customer and Delivery Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-4 rounded-2xl border border-[#F2E5E8] space-y-1.5">
                  <h4 className="font-bold uppercase tracking-wider text-[11px] text-[#2D2024]">Coordonnées Cliente</h4>
                  <p><strong className="text-[#2D2024]">Nom :</strong> {selectedOrder.customerFirstName} {selectedOrder.customerLastName}</p>
                  <p><strong className="text-[#2D2024]">Téléphone :</strong> <a href={`tel:${selectedOrder.phone}`} className="text-[#BE395D] font-bold text-sm">{selectedOrder.phone}</a></p>
                  {selectedOrder.email && <p><strong className="text-[#2D2024]">Email :</strong> {selectedOrder.email}</p>}
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#F2E5E8] space-y-1.5">
                  <h4 className="font-bold uppercase tracking-wider text-[11px] text-[#2D2024]">Destination & Livraison</h4>
                  <p><strong className="text-[#2D2024]">Wilaya :</strong> {selectedOrder.wilayaName} ({selectedOrder.wilayaId})</p>
                  <p><strong className="text-[#2D2024]">Commune :</strong> {selectedOrder.commune}</p>
                  <p><strong className="text-[#2D2024]">Adresse :</strong> {selectedOrder.address}</p>
                  <p><strong className="text-[#2D2024]">Mode :</strong> {selectedOrder.deliveryType === 'stopdesk' ? 'Bureau Yalidine (Stop Desk)' : 'Livraison à Domicile'}</p>
                  {selectedOrder.notes && <p className="italic text-[#8C737B] pt-1">Note: "{selectedOrder.notes}"</p>}
                </div>
              </div>

              {/* Items & Product Locations (Emplacement du Produit) */}
              <div className="bg-white p-5 rounded-2xl border border-[#F2E5E8] space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold uppercase tracking-wider text-[11px] text-[#2D2024]">
                    Articles & Emplacements de Stock (Pour Préparation)
                  </h4>
                  <span className="text-[10px] text-[#8C737B]">Localisation dans l'atelier</span>
                </div>

                {selectedOrder.items.map((it) => (
                  <div key={it.id} className="p-3 bg-[#FAF8F8] rounded-xl border border-[#F2E5E8] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-sm text-[#2D2024]">
                        {it.quantity}x {it.productName} ({it.sizeName} - {it.colorName})
                      </p>
                      {/* Warehouse Location Indicator */}
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="bg-[#FAF3F5] text-[#BE395D] border border-[#E8CBD3] px-2.5 py-0.5 rounded-md font-bold text-[11px]">
                          📍 Emplacement : {it.location || 'Rayon Principal'}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-[#2D2024]">{formatPrice(it.subtotal)}</span>
                  </div>
                ))}

                <div className="pt-2 space-y-1 text-right border-t border-[#FAF3F5]">
                  <p className="text-[#70585F]">Sous-total articles : {formatPrice(selectedOrder.subtotal)}</p>
                  {selectedOrder.discount > 0 && <p className="text-emerald-700">Réduction code promo : -{formatPrice(selectedOrder.discount)}</p>}
                  <p className="text-[#70585F]">Frais livraison ({selectedOrder.wilayaName}) : {formatPrice(selectedOrder.deliveryFee)}</p>
                  <p className="text-base font-bold text-[#BE395D] pt-1">
                    Total COD à faire encaisser par le livreur : {formatPrice(selectedOrder.total)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
