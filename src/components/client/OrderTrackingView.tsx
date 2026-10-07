import React, { useState } from 'react';
import {
  PackageSearch,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  HelpCircle,
  Phone,
  MessageCircle,
  ExternalLink,
  AlertTriangle,
  ArrowRight,
  Package,
} from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { formatPrice, formatDate, getOrderStatusInfo } from '../../utils/formatters';
import { Order, OrderStatus } from '../../types';

interface OrderTrackingViewProps {
  initialOrderCode?: string;
  onNavigateHome: () => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialOrderCode = '',
  onNavigateHome,
}) => {
  const { getOrderByNumber, settings } = useStore();
  const [orderCode, setOrderCode] = useState(initialOrderCode);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(
    initialOrderCode ? getOrderByNumber(initialOrderCode) || null : null
  );
  const [errorNotFound, setErrorNotFound] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderCode.trim()) return;

    setErrorNotFound(false);
    const found = getOrderByNumber(orderCode.trim());
    if (found) {
      setSearchedOrder(found);
    } else {
      setSearchedOrder(null);
      setErrorNotFound(true);
    }
  };

  const steps: Array<{ key: OrderStatus; label: string; desc: string }> = [
    { key: 'en_attente', label: 'En attente', desc: 'Commande enregistrée sur le site' },
    { key: 'acceptee', label: 'Acceptée', desc: 'Confirmée par l’équipe Pyja Magic' },
    { key: 'preparation', label: 'Préparation', desc: 'Préparation et emballage soigné' },
    { key: 'arriver_yalidine', label: 'Arrivé chez Yalidine', desc: 'Déposé au bureau Yalidine' },
    { key: 'en_livraison', label: 'En livraison', desc: 'Livreur en tournée vers votre adresse' },
    { key: 'livree', label: 'Livrée & Encaissée', desc: 'Colis réceptionné et réglé en espèces' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 animate-fadeIn">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#BE395D] bg-[#FAF3F5] px-3.5 py-1 rounded-full mb-3">
          <PackageSearch className="w-3.5 h-3.5" />
          Suivi des 69 Wilayas en temps réel
        </div>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#2D2024] font-semibold">
          Où est ma commande ?
        </h1>
        <p className="text-xs sm:text-sm text-[#70585F] mt-2 leading-relaxed">
          Saisissez votre code unique de commande (reçu lors de la validation, ex : <span className="font-bold text-[#BE395D]">PJM-8K42X9</span>) pour suivre son acheminement.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            required
            placeholder="Ex : PJM-8K42X9"
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
            className="flex-1 text-sm p-3.5 rounded-2xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D] bg-white uppercase font-medium shadow-2xs tracking-wider"
          />
          <button
            type="submit"
            className="bg-[#BE395D] hover:bg-[#9E2B4B] text-white text-xs font-bold uppercase tracking-wider py-3.5 px-7 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <PackageSearch className="w-4 h-4" />
            <span>Suivre ma commande</span>
          </button>
        </form>

        {errorNotFound && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
            <span>
              Aucune commande trouvée avec le numéro <strong>"{orderCode}"</strong>. Vérifiez l’orthographe ou contactez notre assistance.
            </span>
          </div>
        )}
      </div>

      {/* Order Results */}
      {searchedOrder && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Status Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F2E5E8] shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F2E5E8]">
              <div>
                <span className="text-[11px] text-[#8C737B] uppercase tracking-wider">Commande</span>
                <h2 className="font-serif-luxury text-2xl font-bold text-[#2D2024]">
                  {searchedOrder.orderNumber}
                </h2>
                <p className="text-xs text-[#70585F] mt-0.5">
                  Effectuée le {formatDate(searchedOrder.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${
                    getOrderStatusInfo(searchedOrder.status).badgeClass
                  }`}
                >
                  {getOrderStatusInfo(searchedOrder.status).label}
                </span>
              </div>
            </div>

            {/* Yalidine Tracking Banner */}
            {searchedOrder.yalidineTrackingNumber && (
              <div className="mt-6 bg-[#FAF3F5] border border-[#E8CBD3] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#BE395D] shadow-2xs">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#2D2024]">
                      Expédié avec Yalidine Express
                    </p>
                    <p className="text-xs text-[#70585F]">
                      N° de suivi : <span className="font-mono font-bold text-[#BE395D]">{searchedOrder.yalidineTrackingNumber}</span>
                    </p>
                    {searchedOrder.yalidineStatus && (
                      <p className="text-[11px] text-emerald-800 font-medium">
                        Statut transporteur : {searchedOrder.yalidineStatus}
                      </p>
                    )}
                  </div>
                </div>

                <a
                  href={`https://yalidine.app/tracking?tracking=${searchedOrder.yalidineTrackingNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#BE395D] font-bold hover:underline self-start sm:self-auto"
                >
                  Suivre sur Yalidine.app
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Timeline Steps Visualization */}
            <div className="mt-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D2024] mb-6">
                Progression de votre colis
              </h3>

              {searchedOrder.status === 'refusee' || searchedOrder.status === 'annulee' ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800">
                  Cette commande est actuellement marquée comme : <strong>{getOrderStatusInfo(searchedOrder.status).label}</strong>. Pour toute réclamation, contactez notre service client.
                </div>
              ) : (
                <div className="relative">
                  {/* Desktop horizontal timeline */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {steps.map((st, idx) => {
                      const currentStepIndex = getOrderStatusInfo(searchedOrder.status).stepIndex;
                      const isCompleted = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;

                      return (
                        <div
                          key={st.key}
                          className={`p-3 rounded-2xl border text-center transition-all ${
                            isCurrent
                              ? 'border-[#BE395D] bg-[#FDF2F4] shadow-xs'
                              : isCompleted
                              ? 'border-[#E8CBD3] bg-white text-[#2D2024]'
                              : 'border-stone-100 bg-stone-50/70 opacity-60 text-stone-400'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold mb-2 ${
                              isCurrent
                                ? 'bg-[#BE395D] text-white shadow-xs'
                                : isCompleted
                                ? 'bg-[#EBDDE1] text-[#BE395D]'
                                : 'bg-stone-200 text-stone-500'
                            }`}
                          >
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <p className={`text-xs font-bold line-clamp-1 ${isCurrent ? 'text-[#BE395D]' : 'text-[#2D2024]'}`}>
                            {st.label}
                          </p>
                          <p className="text-[10px] text-[#8C737B] mt-0.5 line-clamp-2">
                            {st.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Event History Logs */}
            {searchedOrder.timeline && searchedOrder.timeline.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[#F2E5E8]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D2024] mb-3">
                  Historique des étapes
                </h4>
                <div className="space-y-3">
                  {searchedOrder.timeline.map((ev) => (
                    <div key={ev.id} className="flex items-start gap-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-[#BE395D] mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#2D2024]">{ev.label}</span>
                          <span className="text-[10px] text-[#8C737B]">{formatDate(ev.timestamp)}</span>
                        </div>
                        <p className="text-[#70585F] text-[11px] mt-0.5">{ev.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Details & Delivery Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Details */}
            <div className="bg-white rounded-3xl p-6 border border-[#F2E5E8] shadow-2xs space-y-3 text-xs">
              <h3 className="font-bold text-[#2D2024] uppercase tracking-wider text-[11px] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#BE395D]" />
                Coordonnées de livraison
              </h3>
              <div className="space-y-1.5 text-[#523F44]">
                <p><strong className="text-[#2D2024]">Cliente :</strong> {searchedOrder.customerFirstName} {searchedOrder.customerLastName}</p>
                <p><strong className="text-[#2D2024]">Téléphone :</strong> {searchedOrder.phone}</p>
                <p><strong className="text-[#2D2024]">Wilaya :</strong> {searchedOrder.wilayaName} ({searchedOrder.wilayaId})</p>
                <p><strong className="text-[#2D2024]">Commune :</strong> {searchedOrder.commune}</p>
                <p><strong className="text-[#2D2024]">Adresse complète :</strong> {searchedOrder.address}</p>
                <p><strong className="text-[#2D2024]">Mode :</strong> {searchedOrder.deliveryType === 'stopdesk' ? 'Bureau Yalidine (Stop Desk)' : 'Livraison à Domicile'}</p>
                {searchedOrder.notes && (
                  <p className="italic text-[#8C737B] pt-1">
                    Remarque : "{searchedOrder.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Items & Payment */}
            <div className="bg-white rounded-3xl p-6 border border-[#F2E5E8] shadow-2xs space-y-3 text-xs">
              <h3 className="font-bold text-[#2D2024] uppercase tracking-wider text-[11px] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#BE395D]" />
                Articles & Total à payer
              </h3>
              <div className="space-y-2">
                {searchedOrder.items.map((it) => (
                  <div key={it.id} className="flex justify-between items-center text-[#523F44] pb-2 border-b border-[#FAF3F5]">
                    <div>
                      <p className="font-medium text-[#2D2024]">{it.quantity}x {it.productName}</p>
                      <p className="text-[10px] text-[#8C737B]">{it.sizeName} • {it.colorName}</p>
                    </div>
                    <span className="font-bold">{formatPrice(it.subtotal)}</span>
                  </div>
                ))}

                <div className="pt-1 space-y-1 text-[#70585F]">
                  <div className="flex justify-between">
                    <span>Frais de livraison</span>
                    <span>{formatPrice(searchedOrder.deliveryFee)}</span>
                  </div>
                  {searchedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Réduction code promo</span>
                      <span>-{formatPrice(searchedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-[#2D2024] pt-2 border-t border-[#F2E5E8]">
                    <span>Montant total en espèces (COD) :</span>
                    <span className="text-base text-[#BE395D]">{formatPrice(searchedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Need Help Support Banner */}
          <div className="bg-[#FAF3F5] rounded-3xl p-6 border border-[#E8CBD3] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-[#BE395D] shrink-0" />
              <div>
                <p className="font-bold text-[#2D2024]">Besoin d'aide concernant votre livraison ?</p>
                <p className="text-[#70585F]">
                  Notre équipe service client est à votre écoute pour toute modification d'adresse ou question.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={`tel:${settings.phone}`}
                className="bg-white hover:bg-[#FAF8F8] text-[#2D2024] px-4 py-2.5 rounded-full font-bold border border-[#EBDDE1] flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#BE395D]" />
                Appeler
              </a>
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#1EBE5D] text-white px-4 py-2.5 rounded-full font-bold flex items-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
