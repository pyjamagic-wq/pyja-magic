import React, { useState } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, X } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { Coupon } from '../../types';
import { formatPrice } from '../../utils/formatters';

export const AdminCoupons: React.FC = () => {
  const { coupons, saveCoupon, deleteCoupon } = useStore();
  const [modalOpen, setModalOpen] = useState(false);

  // New coupon state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrder, setMinOrder] = useState(5000);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    saveCoupon({
      id: `coup-${Date.now()}`,
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrder),
      usageCount: 0,
      isActive: true,
    });

    setModalOpen(false);
    setCode('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-luxury text-2xl font-bold text-[#2D2024]">
            Codes Promotionnels & Coupons
          </h2>
          <p className="text-xs text-[#8C737B] mt-0.5">
            Créez des remises en pourcentage ou en dinars avec minimum de commande.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-[#BE395D] hover:bg-[#9E2B4B] text-white px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un Code Promo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="bg-white p-5 rounded-3xl border border-[#F2E5E8] shadow-2xs space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-[#BE395D] bg-[#FAF3F5] px-3 py-1 rounded-xl">
                  {c.code}
                </span>
                <button
                  onClick={() => deleteCoupon(c.id)}
                  className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-1 text-xs text-[#523F44]">
                <p className="font-bold text-sm text-[#2D2024]">
                  {c.discountType === 'percentage' ? `-${c.discountValue}%` : `-${formatPrice(c.discountValue)}`}
                </p>
                {c.minOrderAmount && (
                  <p className="text-[11px] text-[#70585F]">
                    Minimum commande : {formatPrice(c.minOrderAmount)}
                  </p>
                )}
                <p className="text-[11px] text-[#8C737B]">
                  Utilisé {c.usageCount} fois
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#FAF3F5] flex justify-between items-center text-xs">
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold">
                Actif ✓
              </span>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#F2E5E8] space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-serif-luxury text-xl font-bold text-[#2D2024]">
                Nouveau Code Promo
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-[#70585F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#2D2024] mb-1">Code promo (MAJUSCULES) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: RAMADAN20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] uppercase font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D2024] mb-1">Type de réduction</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDiscountType('percentage')}
                    className={`p-2.5 rounded-xl border font-semibold ${
                      discountType === 'percentage'
                        ? 'border-[#BE395D] bg-[#FAF3F5] text-[#BE395D]'
                        : 'border-[#EBDDE1]'
                    }`}
                  >
                    Pourcentage (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('fixed')}
                    className={`p-2.5 rounded-xl border font-semibold ${
                      discountType === 'fixed'
                        ? 'border-[#BE395D] bg-[#FAF3F5] text-[#BE395D]'
                        : 'border-[#EBDDE1]'
                    }`}
                  >
                    Montant fixe (DA)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2D2024] mb-1">
                  Valeur ({discountType === 'percentage' ? '%' : 'DA'}) *
                </label>
                <input
                  type="number"
                  required
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D2024] mb-1">Minimum de commande (DA)</label>
                <input
                  type="number"
                  value={minOrder}
                  onChange={(e) => setMinOrder(Number(e.target.value))}
                  className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#EBDDE1] font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#BE395D] text-white font-bold uppercase"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
