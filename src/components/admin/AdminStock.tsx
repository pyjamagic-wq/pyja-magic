import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Minus,
  AlertTriangle,
  History,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { formatPrice, formatDate } from '../../utils/formatters';

export const AdminStock: React.FC = () => {
  const { products, movements, adjustStock } = useStore();
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out'>('all');
  const [activeTab, setActiveTab] = useState<'inventory' | 'movements'>('inventory');

  // Adjustment Modal
  const [adjustingVariant, setAdjustingVariant] = useState<{
    variantId: string;
    productName: string;
    label: string;
    currentStock: number;
  } | null>(null);
  const [adjustQty, setAdjustQty] = useState(5);
  const [adjustOpType, setAdjustOpType] = useState<'entree' | 'sortie' | 'correction' | 'retour'>('entree');
  const [adjustReason, setAdjustReason] = useState('Nouvel arrivage atelier');

  // Flatten all variants with product metadata
  const allVariantItems = products.flatMap((p) =>
    p.variants.map((v) => ({
      ...v,
      productId: p.id,
      productName: p.name,
      productPrice: v.price || p.price,
      isLow: v.stockQuantity > 0 && v.stockQuantity <= v.lowStockThreshold,
      isOut: v.stockQuantity === 0,
    }))
  );

  const filteredItems = allVariantItems.filter((item) => {
    if (filterType === 'low') return item.isLow;
    if (filterType === 'out') return item.isOut;
    return true;
  });

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingVariant) return;

    const delta = adjustOpType === 'sortie' ? -Math.abs(adjustQty) : Math.abs(adjustQty);
    adjustStock(
      adjustingVariant.variantId,
      delta,
      adjustOpType,
      adjustReason,
      'Admin'
    );

    setAdjustingVariant(null);
    setAdjustQty(5);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-luxury text-2xl font-bold text-[#2D2024]">
            Gestion du Stock & Traçabilité des Mouvements
          </h2>
          <p className="text-xs text-[#8C737B] mt-0.5">
            Suivi précis au niveau de chaque taille et couleur pour éviter les ruptures.
          </p>
        </div>

        {/* View Switcher: Inventory vs Movements Log */}
        <div className="flex bg-white p-1 rounded-2xl border border-[#EBDDE1]">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'inventory'
                ? 'bg-[#BE395D] text-white shadow-xs'
                : 'text-[#70585F] hover:text-[#2D2024]'
            }`}
          >
            Inventaire Actuel
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'movements'
                ? 'bg-[#BE395D] text-white shadow-xs'
                : 'text-[#70585F] hover:text-[#2D2024]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historique des Flux ({movements.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Quick Filter Bar */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
                filterType === 'all'
                  ? 'border-[#BE395D] bg-[#FAF3F5] text-[#BE395D]'
                  : 'border-[#EBDDE1] bg-white text-[#523F44]'
              }`}
            >
              Toutes les Variantes ({allVariantItems.length})
            </button>
            <button
              onClick={() => setFilterType('low')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 ${
                filterType === 'low'
                  ? 'border-amber-500 bg-amber-50 text-amber-800'
                  : 'border-[#EBDDE1] bg-white text-[#523F44]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Stock Faible ({allVariantItems.filter((i) => i.isLow).length})</span>
            </button>
            <button
              onClick={() => setFilterType('out')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
                filterType === 'out'
                  ? 'border-red-500 bg-red-50 text-red-800'
                  : 'border-[#EBDDE1] bg-white text-[#523F44]'
              }`}
            >
              Épuisés (0) ({allVariantItems.filter((i) => i.isOut).length})
            </button>
          </div>

          {/* Variants Table */}
          <div className="bg-white rounded-3xl border border-[#F2E5E8] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF3F5] text-[#2D2024] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Modèle</th>
                    <th className="py-3 px-4">Taille</th>
                    <th className="py-3 px-4">Couleur</th>
                    <th className="py-3 px-4">📍 Emplacement Stock</th>
                    <th className="py-3 px-4">Stock Disponible</th>
                    <th className="py-3 px-4">État</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2E5E8] text-[#523F44]">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FAF8F8]">
                      <td className="py-3 px-4 font-bold text-[#2D2024]">{item.productName}</td>
                      <td className="py-3 px-4 font-bold text-[#BE395D]">{item.sizeName}</td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-3 h-3 rounded-full border border-black/15"
                            style={{ backgroundColor: item.colorHex }}
                          />
                          {item.colorName}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-[#FAF3F5] text-[#BE395D] border border-[#E8CBD3] px-2 py-0.5 rounded text-[11px] font-medium">
                          📍 {item.location || 'Rayon Principal'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-sm text-[#2D2024]">
                        {item.stockQuantity} pcs
                      </td>
                      <td className="py-3 px-4">
                        {item.isOut ? (
                          <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            ÉPUISÉ
                          </span>
                        ) : item.isLow ? (
                          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            FAIBLE (≤{item.lowStockThreshold})
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            OPTIMAL
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() =>
                            setAdjustingVariant({
                              variantId: item.id,
                              productName: item.productName,
                              label: `${item.colorName} / ${item.sizeName}`,
                              currentStock: item.stockQuantity,
                            })
                          }
                          className="bg-[#FAF3F5] hover:bg-[#BE395D] hover:text-white text-[#BE395D] px-3 py-1.5 rounded-xl font-bold transition-all"
                        >
                          Ajuster stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Movements Log Tab */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-3xl border border-[#F2E5E8] shadow-2xs overflow-hidden">
          <div className="p-4 bg-[#FAF3F5] border-b border-[#F2E5E8] flex justify-between items-center">
            <span className="font-serif-luxury text-sm font-bold text-[#2D2024]">
              Registre d'Audit des Entrées & Sorties de Stock
            </span>
            <span className="text-xs text-[#8C737B]">{movements.length} opérations enregistrées</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF8F8] text-[#2D2024] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date & Heure</th>
                  <th className="py-3 px-4">Produit & Variante</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Quantité</th>
                  <th className="py-3 px-4">Raison / Référence</th>
                  <th className="py-3 px-4">Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2E5E8] text-[#523F44]">
                {movements.map((m) => {
                  const isPositive = m.quantity > 0;
                  return (
                    <tr key={m.id} className="hover:bg-[#FAF8F8]">
                      <td className="py-2.5 px-4 text-[#8C737B]">{formatDate(m.createdAt)}</td>
                      <td className="py-2.5 px-4 font-semibold text-[#2D2024]">
                        {m.productName} ({m.variantLabel})
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          m.type === 'entree' ? 'bg-emerald-100 text-emerald-800' :
                          m.type === 'sortie' ? 'bg-blue-100 text-blue-800' :
                          m.type === 'retour' ? 'bg-purple-100 text-purple-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {m.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-bold text-sm">
                        <span className={isPositive ? 'text-emerald-700' : 'text-red-600'}>
                          {isPositive ? `+${m.quantity}` : m.quantity}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-[#70585F]">{m.reason}</td>
                      <td className="py-2.5 px-4 font-medium text-[#2D2024]">{m.adminName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustingVariant && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#F2E5E8] space-y-4">
            <h3 className="font-serif-luxury text-xl font-bold text-[#2D2024]">
              Ajustement de Stock
            </h3>

            <div className="p-3 bg-[#FAF3F5] rounded-xl text-xs space-y-1">
              <p className="font-bold text-[#2D2024]">{adjustingVariant.productName}</p>
              <p className="text-[#70585F]">Variante : {adjustingVariant.label}</p>
              <p className="font-semibold text-[#BE395D]">
                Stock actuel : {adjustingVariant.currentStock} unités
              </p>
            </div>

            <form onSubmit={handleApplyAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#2D2024] mb-1">Type d'opération</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'entree', label: '➕ Entrée (Arrivage)' },
                    { id: 'sortie', label: '➖ Sortie Manuelle' },
                    { id: 'correction', label: '⚖️ Correction Inventaire' },
                    { id: 'retour', label: '↩️ Retour Réceptionné' },
                  ].map((op) => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => setAdjustOpType(op.id as any)}
                      className={`p-2 rounded-xl border text-left font-semibold transition-all ${
                        adjustOpType === op.id
                          ? 'border-[#BE395D] bg-[#FDF2F4] text-[#BE395D]'
                          : 'border-[#EBDDE1] text-[#70585F]'
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2D2024] mb-1">Quantité d'unités</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D2024] mb-1">Motif / Justificatif *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Réception atelier Tipaza, inventaire physique..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingVariant(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#EBDDE1] font-semibold text-[#70585F]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#BE395D] hover:bg-[#9E2B4B] text-white font-bold uppercase tracking-wider"
                >
                  Valider le mouvement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
