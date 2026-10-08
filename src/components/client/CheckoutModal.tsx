import React, { useState, useMemo } from 'react';
import {
  X,
  Truck,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  Mail,
  FileText,
  Tag,
  CheckCircle2,
  AlertCircle,
  Home,
  Building,
} from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { formatPrice, isValidAlgerianPhone } from '../../utils/formatters';
import { Order } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const {
    cart,
    activeWilayas,
    placeOrder,
    validateCoupon,
    settings,
  } = useStore();

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedWilayaId, setSelectedWilayaId] = useState<number>(16); // Default Alger (16)
  const [wilayaSearch, setWilayaSearch] = useState('');
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryType, setDeliveryType] = useState<'domicile' | 'stopdesk'>('domicile');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    message: string;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filtered wilayas for search dropdown (Hook placed before early return)
  const filteredWilayas = useMemo(() => {
    if (!wilayaSearch.trim()) return activeWilayas;
    const q = wilayaSearch.toLowerCase();
    return (activeWilayas || []).filter(
      (w) => (w.name || '').toLowerCase().includes(q) || (w.code || '').includes(q)
    );
  }, [activeWilayas, wilayaSearch]);

  if (!isOpen) return null;

  // Selected wilaya with safe fallback
  const defaultWilayaFallback = { id: 16, code: '16', name: 'Alger', deliveryFee: 600, stopDeskFee: 400, isActive: true };
  const selectedWilaya = activeWilayas.find((w) => w.id === selectedWilayaId) || activeWilayas[0] || defaultWilayaFallback;

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let deliveryFee =
    deliveryType === 'stopdesk'
      ? (selectedWilaya?.stopDeskFee ?? Math.max(300, (selectedWilaya?.deliveryFee ?? 600) - 200))
      : (selectedWilaya?.deliveryFee ?? 600);

  if (settings.freeShippingThreshold > 0 && subtotal >= settings.freeShippingThreshold) {
    deliveryFee = 0;
  }

  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  const handleApplyCoupon = () => {
    setCouponError(null);
    if (!couponInput.trim()) return;

    const res = validateCoupon(couponInput.trim(), subtotal);
    if (res.valid) {
      setAppliedCoupon({
        code: res.coupon?.code || couponInput.toUpperCase(),
        discount: res.discount,
        message: res.message,
      });
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form validations
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('Veuillez renseigner votre nom et votre prénom.');
      return;
    }

    if (!isValidAlgerianPhone(phone)) {
      setErrorMessage(
        'Numéro de téléphone invalide. Veuillez saisir un numéro algérien valide (ex: 0555 12 34 56, 0661..., 0770...).'
      );
      return;
    }

    if (!commune.trim()) {
      setErrorMessage('Veuillez renseigner votre commune de résidence.');
      return;
    }

    if (!address.trim() || address.trim().length < 5) {
      setErrorMessage('Veuillez préciser votre adresse de livraison complète (rue, quartier, bâtiment...).');
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('Votre panier est vide.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await placeOrder({
        customerFirstName: firstName,
        customerLastName: lastName,
        phone,
        email: email || undefined,
        wilayaId: selectedWilaya.id,
        commune,
        address,
        notes: notes || undefined,
        deliveryType,
        couponCode: appliedCoupon?.code,
        items: cart,
      });

      if (result.success && result.order) {
        onOrderSuccess(result.order);
      } else {
        setErrorMessage(result.message || 'Une erreur est survenue lors de la commande.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-[#FAF7F6] rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#F2E5E8] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-[#F2E5E8] flex items-center justify-between sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-bold text-[#BE395D]">
                Commande Express sans Inscription
              </span>
            </div>
            <h2 className="font-serif-luxury text-2xl text-[#2D2024] font-semibold">
              Finaliser ma commande 💗
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#70585F] hover:text-[#2D2024] hover:bg-[#FAF3F5] rounded-full transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmitOrder} className="p-5 sm:p-8 space-y-6 flex-1">
          {/* Error Callout */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Customer Personal Details */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#F2E5E8] space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D2024] flex items-center gap-2">
              <User className="w-4 h-4 text-[#BE395D]" />
              1. Informations de contact
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2D2024] mb-1">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Amina"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D] bg-[#FAF8F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2024] mb-1">
                  Nom de famille <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Benali"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D] bg-[#FAF8F8]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2D2024] mb-1">
                  Numéro de Téléphone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#A69398] absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="05 / 06 / 07 XX XX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D] bg-[#FAF8F8]"
                  />
                </div>
                <span className="text-[10px] text-[#8C737B] mt-1 block">
                  Le livreur vous appellera sur ce numéro avant son arrivée.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2024] mb-1">
                  Adresse Email (Facultatif)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A69398] absolute left-3 top-3.5" />
                  <input
                    type="email"
                    placeholder="Pour recevoir votre récapitulatif"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D] bg-[#FAF8F8]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Wilaya Details (The 69 Wilayas of Algeria) */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#F2E5E8] space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D2024] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#BE395D]" />
              2. Adresse de livraison (69 Wilayas d'Algérie)
            </h3>

            {/* Delivery Mode Choice: Home vs Stop Desk Yalidine */}
            <div>
              <label className="block text-xs font-semibold text-[#2D2024] mb-2">
                Mode de livraison
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryType('domicile')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    deliveryType === 'domicile'
                      ? 'border-[#BE395D] bg-[#FDF2F4] text-[#2D2024]'
                      : 'border-[#EBDDE1] bg-[#FAF8F8] text-[#70585F] hover:bg-white'
                  }`}
                >
                  <Home className={`w-5 h-5 shrink-0 ${deliveryType === 'domicile' ? 'text-[#BE395D]' : 'text-[#A69398]'}`} />
                  <div>
                    <p className="text-xs font-bold text-[#2D2024]">Livraison à Domicile</p>
                    <p className="text-[11px] text-[#70585F]">Remis directement chez vous en main propre</p>
                    <p className="text-xs font-bold text-[#BE395D] mt-1">
                      {selectedWilaya ? formatPrice(selectedWilaya.deliveryFee) : ''}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('stopdesk')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    deliveryType === 'stopdesk'
                      ? 'border-[#BE395D] bg-[#FDF2F4] text-[#2D2024]'
                      : 'border-[#EBDDE1] bg-[#FAF8F8] text-[#70585F] hover:bg-white'
                  }`}
                >
                  <Building className={`w-5 h-5 shrink-0 ${deliveryType === 'stopdesk' ? 'text-[#BE395D]' : 'text-[#A69398]'}`} />
                  <div>
                    <p className="text-xs font-bold text-[#2D2024]">Stop Desk (Bureau Yalidine)</p>
                    <p className="text-[11px] text-[#70585F]">Récupérez votre colis au centre Yalidine le plus proche</p>
                    <p className="text-xs font-bold text-[#BE395D] mt-1">
                      {selectedWilaya ? formatPrice(selectedWilaya.stopDeskFee || 400) : ''}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Wilaya Selection with Instant Search */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#2D2024]">
                Sélectionnez votre Wilaya parmi les 69 wilayas <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="🔍 Rechercher wilaya (nom ou code)..."
                  value={wilayaSearch}
                  onChange={(e) => setWilayaSearch(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D] bg-white"
                />

                <select
                  value={selectedWilayaId}
                  onChange={(e) => setSelectedWilayaId(Number(e.target.value))}
                  className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D] bg-white font-medium text-[#2D2024]"
                >
                  {filteredWilayas.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.code} - {w.name} ({formatPrice(deliveryType === 'stopdesk' ? (w.stopDeskFee || 400) : w.deliveryFee)})
                    </option>
                  ))}
                </select>
              </div>

              {selectedWilaya && (
                <div className="p-3 bg-[#FAF3F5] rounded-xl flex items-center justify-between text-xs text-[#523F44]">
                  <span>
                    Frais de livraison ({selectedWilaya.name}) :
                  </span>
                  <span className="font-bold text-[#BE395D]">
                    {formatPrice(deliveryFee)}
                  </span>
                </div>
              )}
            </div>

            {/* Commune & Full Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2D2024] mb-1">
                  Commune / Ville <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Hydra, Chéraga, Akid Lotfi..."
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D] bg-[#FAF8F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2024] mb-1">
                  Adresse complète <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="N° rue, quartier, bâtiment, appartement..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D] bg-[#FAF8F8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D2024] mb-1">
                Remarque facultative pour le livreur
              </label>
              <input
                type="text"
                placeholder="Ex: Appeler en arrivant, sonner à l'interphone 3B..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D] bg-[#FAF8F8]"
              />
            </div>
          </div>

          {/* Coupon / Promo Code */}
          <div className="bg-white p-5 rounded-2xl border border-[#F2E5E8] space-y-3 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D2024] flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#BE395D]" />
              Code Promo
            </h3>

            {appliedCoupon ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center justify-between">
                <span className="font-medium">
                  ✓ {appliedCoupon.message}
                </span>
                <button
                  type="button"
                  onClick={() => setAppliedCoupon(null)}
                  className="text-xs font-bold underline text-emerald-900"
                >
                  Retirer
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Code de réduction (ex: MAGIC10, BIENVENUE)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D] bg-[#FAF8F8] uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-[#2D2024] hover:bg-[#3E2D32] text-white text-xs font-semibold px-4 rounded-xl transition-colors"
                >
                  Appliquer
                </button>
              </div>
            )}
            {couponError && (
              <p className="text-[11px] text-red-600 font-medium">{couponError}</p>
            )}
          </div>

          {/* Order Summary & Total Breakdown */}
          <div className="bg-[#FAF3F5] p-5 sm:p-6 rounded-2xl border border-[#E8CBD3] space-y-3">
            <h3 className="font-serif-luxury text-lg text-[#2D2024] font-semibold">
              Récapitulatif de votre commande
            </h3>

            <div className="space-y-1.5 text-xs text-[#523F44]">
              <div className="flex justify-between">
                <span>Articles ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                <span className="font-semibold text-[#2D2024]">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Réduction code promo</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Frais de livraison ({selectedWilaya?.name || 'Algérie'} - {deliveryType === 'stopdesk' ? 'Bureau' : 'Domicile'})</span>
                <span className="font-semibold text-[#2D2024]">
                  {deliveryFee === 0 ? 'GRATUIT' : formatPrice(deliveryFee)}
                </span>
              </div>

              <div className="pt-2 border-t border-[#E8CBD3] flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-bold text-[#2D2024] block">Total à payer à la livraison</span>
                  <span className="text-[10px] text-[#70585F]">Pas de paiement en ligne requis</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-[#BE395D]">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#BE395D] hover:bg-[#9E2B4B] text-white py-4 px-6 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {isSubmitting
                  ? 'Confirmation en cours...'
                  : `Confirmer ma commande • ${formatPrice(total)} (Paiement COD)`}
              </span>
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-[#70585F]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#BE395D]" />
                Paiement 100% à la livraison
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#BE395D]" />
                Expédition Yalidine Express
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
