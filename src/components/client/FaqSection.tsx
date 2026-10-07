import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Truck, ShieldCheck, RotateCcw, MapPin } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { formatPrice } from '../../utils/formatters';

export const FaqSection: React.FC = () => {
  const { wilayas } = useStore();
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [wilayaSearch, setWilayaSearch] = useState('');

  const faqs = [
    {
      q: 'Comment fonctionne le paiement à la livraison (COD) ?',
      a: 'Chez Pyja Magic, vous ne payez rien en ligne ! Vous passez simplement votre commande sur le site en indiquant votre adresse et votre numéro de téléphone. Dès que le livreur se présente chez vous (ou au bureau Yalidine), vous vérifiez votre colis et réglez le montant exact en dinars algériens (DA).',
    },
    {
      q: 'Combien de temps faut-il pour recevoir ma commande ?',
      a: 'Pour la région d’Alger, Blida, Boumerdès et Tipaza, la livraison prend généralement entre 24h et 48h. Pour les grandes wilayas du Nord et de l’Ouest/Est (Oran, Constantine, Sétif, Annaba...), le délai est de 48h à 72h. Pour les wilayas du Sud, comptez 3 à 5 jours ouvrés.',
    },
    {
      q: 'Comment puis-je suivre l’avancement de ma commande ?',
      a: 'Dès que vous confirmez votre commande, un code unique vous est attribué (ex : PJM-8K42X9). Rendez-vous sur la page "Suivre ma commande", entrez ce numéro, et vous visualiserez la timeline en temps réel (Préparation, Expédition, En livraison par Yalidine, etc.).',
    },
    {
      q: 'Puis-je échanger si la taille ne me convient pas ?',
      a: 'Oui, absolument ! Si la taille choisie ne vous convient pas, vous disposez de 48h après réception pour nous contacter via WhatsApp ou téléphone. Nous organiserons un échange de taille avec le livreur sous réserve de disponibilité du stock.',
    },
    {
      q: 'Quelle est la différence entre livraison à domicile et Stop Desk ?',
      a: 'La livraison à domicile s’effectue directement à votre porte. L’option Stop Desk (Bureau Yalidine) vous permet de faire livrer le colis au centre Yalidine le plus proche de chez vous à un tarif plus économique, et de le récupérer quand vous êtes disponible.',
    },
  ];

  const filteredWilayas = wilayaSearch.trim()
    ? wilayas.filter(
        (w) =>
          w.name.toLowerCase().includes(wilayaSearch.toLowerCase()) ||
          w.code.includes(wilayaSearch)
      )
    : wilayas;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn space-y-12">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#BE395D] bg-[#FAF3F5] px-3.5 py-1 rounded-full mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          Foire Aux Questions
        </div>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#2D2024] font-semibold">
          Tout savoir sur Pyja Magic
        </h1>
        <p className="text-xs sm:text-sm text-[#70585F] mt-2">
          Retrouvez les réponses à vos questions concernant la commande, la livraison dans les 69 wilayas et les échanges.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#F2E5E8] overflow-hidden shadow-2xs transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-[#2D2024] hover:text-[#BE395D]"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#BE395D] transition-transform duration-300 shrink-0 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-[#523F44] leading-relaxed border-t border-[#FAF3F5]">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 69 Wilayas Tariffs Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F2E5E8] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif-luxury text-2xl font-bold text-[#2D2024]">
              Grille des Frais de Livraison (69 Wilayas)
            </h2>
            <p className="text-xs text-[#70585F] mt-0.5">
              Tarifs officiels appliqués automatiquement lors de votre commande.
            </p>
          </div>

          <input
            type="text"
            placeholder="🔍 Filtrer une wilaya..."
            value={wilayaSearch}
            onChange={(e) => setWilayaSearch(e.target.value)}
            className="text-xs p-2.5 px-4 rounded-full border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D] max-w-xs"
          />
        </div>

        <div className="overflow-x-auto max-h-96 rounded-2xl border border-[#F2E5E8]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF3F5] text-[#2D2024] font-semibold sticky top-0 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Nom de la Wilaya</th>
                <th className="py-3 px-4">À Domicile</th>
                <th className="py-3 px-4">Bureau Yalidine (Stop Desk)</th>
                <th className="py-3 px-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2E5E8] text-[#523F44]">
              {filteredWilayas.map((w) => (
                <tr key={w.id} className="hover:bg-[#FAF8F8]">
                  <td className="py-2.5 px-4 font-mono font-bold text-[#BE395D]">{w.code}</td>
                  <td className="py-2.5 px-4 font-medium text-[#2D2024]">{w.name}</td>
                  <td className="py-2.5 px-4 font-semibold">{formatPrice(w.deliveryFee)}</td>
                  <td className="py-2.5 px-4 text-[#70585F]">{formatPrice(w.stopDeskFee || 400)}</td>
                  <td className="py-2.5 px-4">
                    <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                      Desservie ✓
                    </span>
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
