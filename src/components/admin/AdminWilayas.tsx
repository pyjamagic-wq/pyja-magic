import React, { useState } from 'react';
import { Truck, Search, Edit2, Check, X, ShieldCheck } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { formatPrice } from '../../utils/formatters';

export const AdminWilayas: React.FC = () => {
  const { wilayas, updateWilayaFee, orders } = useStore();
  const [search, setSearch] = useState('');
  const [editingWilayaId, setEditingWilayaId] = useState<number | null>(null);
  const [feeInput, setFeeInput] = useState<number>(600);
  const [stopDeskInput, setStopDeskInput] = useState<number>(400);

  const filtered = wilayas.filter(
    (w) => w.name.toLowerCase().includes(search.toLowerCase()) || w.code.includes(search)
  );

  const handleStartEdit = (w: typeof wilayas[0]) => {
    setEditingWilayaId(w.id);
    setFeeInput(w.deliveryFee);
    setStopDeskInput(w.stopDeskFee || 400);
  };

  const handleSaveEdit = (wId: number) => {
    updateWilayaFee(wId, feeInput, stopDeskInput);
    setEditingWilayaId(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-luxury text-2xl font-bold text-[#2D2024]">
            Tarification des 69 Wilayas d'Algérie
          </h2>
          <p className="text-xs text-[#8C737B] mt-0.5">
            Configurez les frais de livraison à domicile et en point relais Yalidine pour chaque région.
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-[#A69398] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Filtrer par nom ou code wilaya..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-full border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D] bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#F2E5E8] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF3F5] text-[#2D2024] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Wilaya</th>
                <th className="py-3 px-4">Tarif Domicile (DA)</th>
                <th className="py-3 px-4">Tarif Bureau Yalidine (DA)</th>
                <th className="py-3 px-4">Commandes Passées</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2E5E8] text-[#523F44]">
              {filtered.map((w) => {
                const isEditing = editingWilayaId === w.id;
                const orderCount = orders.filter((o) => o.wilayaId === w.id).length;

                return (
                  <tr key={w.id} className="hover:bg-[#FAF8F8]">
                    <td className="py-3 px-4 font-mono font-bold text-[#BE395D]">{w.code}</td>
                    <td className="py-3 px-4 font-semibold text-[#2D2024]">{w.name}</td>

                    {/* Domicile Fee */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={feeInput}
                          onChange={(e) => setFeeInput(Number(e.target.value))}
                          className="w-24 p-1.5 rounded-lg border border-[#EBDDE1] text-xs font-bold"
                        />
                      ) : (
                        <span className="font-bold text-[#2D2024]">{formatPrice(w.deliveryFee)}</span>
                      )}
                    </td>

                    {/* Stop Desk Fee */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={stopDeskInput}
                          onChange={(e) => setStopDeskInput(Number(e.target.value))}
                          className="w-24 p-1.5 rounded-lg border border-[#EBDDE1] text-xs font-bold"
                        />
                      ) : (
                        <span className="text-[#70585F]">{formatPrice(w.stopDeskFee || 400)}</span>
                      )}
                    </td>

                    {/* Total orders */}
                    <td className="py-3 px-4">
                      <span className="font-semibold">{orderCount}</span>
                    </td>

                    {/* Active toggle */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => updateWilayaFee(w.id, w.deliveryFee, w.stopDeskFee, !w.isActive)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          w.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {w.isActive ? 'Active' : 'Désactivée'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleSaveEdit(w.id)}
                            className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                            title="Sauvegarder"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingWilayaId(null)}
                            className="p-1.5 bg-stone-200 text-stone-700 rounded-lg"
                            title="Annuler"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(w)}
                          className="p-2 rounded-xl text-[#BE395D] hover:bg-[#FAF3F5]"
                          title="Modifier tarif"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
