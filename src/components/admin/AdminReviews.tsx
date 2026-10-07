import React from 'react';
import { Star, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { formatDate } from '../../utils/formatters';

export const AdminReviews: React.FC = () => {
  const { reviews, updateReviewStatus, deleteReview } = useStore();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="font-serif-luxury text-2xl font-bold text-[#2D2024]">
          Modération des Avis Clientes
        </h2>
        <p className="text-xs text-[#8C737B] mt-0.5">
          Validez ou masquez les avis déposés par vos clientes sur les pyjamas.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#F2E5E8] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF3F5] text-[#2D2024] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Cliente & Wilaya</th>
                <th className="py-3 px-4">Produit</th>
                <th className="py-3 px-4">Note</th>
                <th className="py-3 px-4">Commentaire</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2E5E8] text-[#523F44]">
              {reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-[#FAF8F8]">
                  <td className="py-3 px-4 text-[#8C737B]">{formatDate(rev.createdAt)}</td>
                  <td className="py-3 px-4 font-semibold text-[#2D2024]">
                    {rev.customerName}
                    <span className="block text-[10px] text-[#8C737B] font-normal">{rev.customerWilaya}</span>
                  </td>
                  <td className="py-3 px-4">{rev.productName}</td>
                  <td className="py-3 px-4 text-amber-500 font-bold">
                    {'★'.repeat(rev.rating)}
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate italic">
                    "{rev.comment}"
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      rev.status === 'approuve' ? 'bg-emerald-100 text-emerald-800' :
                      rev.status === 'rejete' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {rev.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    {rev.status !== 'approuve' && (
                      <button
                        onClick={() => updateReviewStatus(rev.id, 'approuve')}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                        title="Approuver"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {rev.status !== 'rejete' && (
                      <button
                        onClick={() => updateReviewStatus(rev.id, 'rejete')}
                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50"
                        title="Masquer"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteReview(rev.id)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
