import React, { useEffect, useState } from 'react';
import { CheckCircle, Copy, Check, ArrowRight, PackageSearch, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '../../types';
import { formatPrice } from '../../utils/formatters';

interface OrderConfirmationViewProps {
  order: Order;
  onTrackOrder: (orderNumber: string) => void;
  onContinueShopping: () => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
  order,
  onTrackOrder,
  onContinueShopping,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Launch festive elegant confetti
    try {
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F6C1CB', '#BE395D', '#E5D3C5', '#FAF7F6'],
        });
      }
    } catch {
      // ignore
    }
  }, []);

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-serif-luxury text-2xl font-bold text-[#2D2024]">Commande non disponible</h2>
        <button
          onClick={onContinueShopping}
          className="bg-[#BE395D] text-white py-3 px-6 rounded-full text-xs font-bold uppercase"
        >
          Retour à la boutique
        </button>
      </div>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-[#F2E5E8] shadow-xl p-6 sm:p-10 text-center space-y-6">
        {/* Top Icon Badge */}
        <div className="w-20 h-20 bg-[#FAF3F5] text-[#BE395D] rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Heart className="w-10 h-10 fill-current animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BE395D]">
            Commande validée avec succès
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#2D2024] font-semibold">
            Votre commande est confirmée 💗
          </h1>
          <p className="text-xs sm:text-sm text-[#70585F] max-w-md mx-auto">
            Merci pour votre confiance, <strong className="text-[#2D2024]">{order.customerFirstName}</strong> ! Nos équipes préparent votre pyjama avec soin et amour.
          </p>
        </div>

        {/* Order Code Highlight Box */}
        <div className="bg-[#FAF3F5] border-2 border-dashed border-[#E8CBD3] rounded-3xl p-6 max-w-md mx-auto space-y-3">
          <p className="text-xs uppercase tracking-wider text-[#70585F] font-semibold">
            Votre numéro de commande unique
          </p>
          <div className="text-3xl sm:text-4xl font-serif-luxury font-bold text-[#BE395D] tracking-wider">
            {order.orderNumber}
          </div>

          <button
            onClick={handleCopyCode}
            className="inline-flex items-center gap-2 bg-white hover:bg-[#FAF8F8] text-[#2D2024] text-xs font-bold py-2.5 px-5 rounded-full border border-[#EBDDE1] shadow-2xs transition-all active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Code copié dans le presse-papier !</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#BE395D]" />
                <span>Copier mon code</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-[#8C737B] pt-1">
            Gardez précieusement ce code pour suivre l’acheminement de votre colis en temps réel.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="text-left bg-[#FAF8F8] rounded-2xl p-5 border border-[#F2E5E8] space-y-3 text-xs">
          <h3 className="font-bold text-[#2D2024] uppercase tracking-wider text-[11px]">
            Détails de l'expédition
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#523F44]">
            <div>
              <p><strong className="text-[#2D2024]">Destinataire :</strong> {order.customerFirstName} {order.customerLastName}</p>
              <p><strong className="text-[#2D2024]">Téléphone :</strong> {order.phone}</p>
            </div>
            <div>
              <p><strong className="text-[#2D2024]">Destination :</strong> {order.commune}, {order.wilayaName}</p>
              <p><strong className="text-[#2D2024]">Montant à payer au livreur :</strong> <span className="font-bold text-[#BE395D]">{formatPrice(order.total)}</span></p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#EBDDE1] space-y-2">
            <p className="font-semibold text-[#2D2024]">Articles commandés :</p>
            {(order.items || []).map((it) => (
              <div key={it.id} className="flex justify-between items-center text-[#70585F]">
                <span>
                  {it.quantity}x {it.productName} ({it.sizeName} - {it.colorName})
                </span>
                <span className="font-medium text-[#2D2024]">{formatPrice(it.subtotal)}</span>
              </div>
            ))}
          </div>

          {order.email && (
            <div className="pt-3 border-t border-[#EBDDE1] bg-white rounded-xl p-3 space-y-1">
              <p className="font-semibold text-[#2D2024]">Vous êtes maintenant membre 💗</p>
              <p className="text-[#70585F]">
                Un email vous a été envoyé à <strong>{order.email}</strong> avec le code promo{' '}
                <strong className="text-[#BE395D]">BIENVENU (−5%)</strong> pour votre prochaine commande.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onTrackOrder(order.orderNumber)}
            className="w-full sm:w-auto bg-[#BE395D] hover:bg-[#9E2B4B] text-white py-3.5 px-8 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
          >
            <PackageSearch className="w-4 h-4" />
            <span>Suivre ma commande en direct</span>
          </button>

          <button
            onClick={onContinueShopping}
            className="w-full sm:w-auto bg-white hover:bg-[#FAF3F5] text-[#2D2024] py-3.5 px-8 rounded-full text-xs font-bold uppercase tracking-wider border border-[#EBDDE1] transition-all flex items-center justify-center gap-2"
          >
            <span>Retourner à la boutique</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
