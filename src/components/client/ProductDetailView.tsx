import React, { useState, useMemo } from 'react';
import {
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Ruler,
  Star,
  ChevronRight,
  Share2,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { formatPrice } from '../../utils/formatters';
import { getImagesForColor, getPrimaryImageForColor } from '../../utils/productImages';
import { useStore } from '../../hooks/useStore';
import { SizeGuideModal } from './SizeGuideModal';

interface ProductDetailViewProps {
  product: Product;
  onBackToCatalog: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenCart: () => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  onBackToCatalog,
  onSelectProduct,
  onOpenCart,
}) => {
  const {
    products,
    wishlist,
    toggleWishlist,
    addToCart,
    approvedReviews,
    addReview,
    recordRecentlyViewed,
  } = useStore();

  const [activeImage, setActiveImage] = useState(product.images[0] || '');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Review submission state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewWilaya, setReviewWilaya] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Extract unique sizes and colors available on this product
  const availableSizes = useMemo(() => {
    const map = new Map<string, string>();
    product.variants.forEach((v) => map.set(v.sizeId, v.sizeName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [product.variants]);

  const availableColors = useMemo(() => {
    const map = new Map<string, { id: string; name: string; hex: string }>();
    product.variants.forEach((v) => {
      map.set(v.colorId, { id: v.colorId, name: v.colorName, hex: v.colorHex });
    });
    return Array.from(map.values());
  }, [product.variants]);

  // Selected Size & Color
  const [selectedColorId, setSelectedColorId] = useState<string>(
    availableColors[0]?.id || ''
  );
  const [selectedSizeId, setSelectedSizeId] = useState<string>(
    availableSizes[0]?.id || ''
  );

  const galleryImages = useMemo(
    () => getImagesForColor(product, selectedColorId),
    [product, selectedColorId]
  );

  // Record this product in recently viewed + reset selection
  React.useEffect(() => {
    recordRecentlyViewed(product.id);
    const firstColor = availableColors[0]?.id || '';
    setSelectedColorId(firstColor);
    setSelectedSizeId(availableSizes[0]?.id || '');
    setActiveImage(getImagesForColor(product, firstColor)[0] || '');
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  // Changer la galerie quand la couleur change
  React.useEffect(() => {
    const imgs = getImagesForColor(product, selectedColorId);
    if (imgs.length) setActiveImage(imgs[0]);
  }, [selectedColorId, product]);

  // Find exact active variant
  const currentVariant: ProductVariant | undefined = useMemo(() => {
    return product.variants.find(
      (v) => v.colorId === selectedColorId && v.sizeId === selectedSizeId
    );
  }, [product.variants, selectedColorId, selectedSizeId]);

  const variantStock = currentVariant ? currentVariant.stockQuantity : 0;
  const isVariantOutOfStock = variantStock === 0;

  const isFavorited = wishlist.includes(product.id);

  // Product reviews
  const productReviews = approvedReviews.filter((r) => r.productId === product.id);

  // Similar products
  const similarProducts = useMemo(() => {
    return products
      .filter((p) => p.id !== product.id && (p.category === product.category || p.isFeatured))
      .slice(0, 4);
  }, [products, product.id, product.category]);

  const handleAddToCart = () => {
    if (!currentVariant) {
      setToastMessage('Veuillez sélectionner une taille et une couleur disponibles.');
      return;
    }
    if (isVariantOutOfStock) {
      setToastMessage('Cette variante est actuellement épuisée.');
      return;
    }

    const res = addToCart({
      id: `${product.id}-${currentVariant.id}`,
      productId: product.id,
      variantId: currentVariant.id,
      productName: product.name,
      productImage: getPrimaryImageForColor(product, currentVariant.colorId),
      sizeName: currentVariant.sizeName,
      colorName: currentVariant.colorName,
      colorHex: currentVariant.colorHex,
      price: currentVariant.price || product.price,
      quantity,
      maxStock: currentVariant.stockQuantity,
    });

    if (res.success) {
      setToastMessage(`✓ ${quantity}x "${product.name}" ajouté au panier !`);
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      setToastMessage(res.message || 'Erreur lors de l’ajout.');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    addReview({
      productId: product.id,
      productName: product.name,
      customerName: reviewName.trim(),
      customerWilaya: reviewWilaya.trim() || 'Algérie',
      rating: reviewRating,
      comment: reviewComment.trim(),
      isVerified: true,
    });

    setReviewSubmitted(true);
    setReviewName('');
    setReviewComment('');
    setTimeout(() => {
      setShowReviewForm(false);
      setReviewSubmitted(false);
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-[#8C737B] mb-8">
        <button onClick={onBackToCatalog} className="hover:text-[#BE395D] transition-colors">
          Boutique
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="uppercase tracking-wider font-medium">{product.category}</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#2D2024] font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Grid: Gallery + Purchasing info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Gallery */}
        <div className="space-y-4">
          {/* Main Photo with Zoom hover */}
          <div className="relative aspect-[3/4] bg-[#FAF3F5] rounded-3xl overflow-hidden border border-[#F2E5E8] shadow-sm group">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
              {product.isNew && (
                <span className="bg-white/95 text-[#2D2024] text-[10px] font-semibold tracking-widest px-3 py-1 rounded shadow-sm uppercase">
                  Nouveau
                </span>
              )}
              {product.isBestSeller && (
                <span className="bg-[#BE395D] text-white text-[10px] font-semibold tracking-widest px-3 py-1 rounded shadow-sm uppercase">
                  Best Seller
                </span>
              )}
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="bg-[#E54868] text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm">
                  Économisez {(product.compareAtPrice - product.price).toLocaleString('fr-FR')} DA
                </span>
              )}
            </div>

            {/* Favorite button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 p-3 rounded-full shadow-md transition-all z-10 ${
                isFavorited
                  ? 'bg-[#BE395D] text-white'
                  : 'bg-white/90 text-[#2D2024] hover:text-[#BE395D] hover:bg-white'
              }`}
              aria-label="Favoris"
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Thumbnails (selon couleur) */}
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-24 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    activeImage === img
                      ? 'border-[#BE395D] shadow-sm ring-2 ring-[#BE395D]/20'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Buying Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-[#8C737B] mb-1">
              <span className="uppercase tracking-widest font-semibold text-[#BE395D]">
                {product.category}
              </span>
              {product.rating && (
                <div className="flex items-center gap-1">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-[#2D2024] ml-1">
                    {product.rating} ({product.reviewCount || 0} avis)
                  </span>
                </div>
              )}
            </div>

            <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#2D2024] font-semibold leading-tight">
              {product.name}
            </h1>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-2xl sm:text-3xl font-bold text-[#2D2024]">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-base text-[#A69398] line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
              <span className="text-xs bg-[#FAF3F5] text-[#BE395D] font-semibold px-2.5 py-1 rounded-full">
                Paiement à la réception (COD)
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#523F44] leading-relaxed">
            {product.description}
          </p>

          {/* Color Selector */}
          <div className="space-y-2 pt-2 border-t border-[#F2E5E8]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#2D2024]">
                Couleur : <span className="text-[#BE395D] font-normal">{currentVariant?.colorName}</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              {availableColors.map((color) => {
                const isSelected = selectedColorId === color.id;
                // Check if any variant with this color has stock
                const hasAnyStock = product.variants
                  .filter((v) => v.colorId === color.id)
                  .some((v) => v.stockQuantity > 0);

                return (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColorId(color.id)}
                    className={`group relative p-1 rounded-full transition-all ${
                      isSelected
                        ? 'ring-2 ring-[#BE395D] ring-offset-2'
                        : 'opacity-85 hover:opacity-100'
                    }`}
                    title={color.name}
                  >
                    <span
                      className="w-7 h-7 rounded-full block border border-black/15 shadow-inner"
                      style={{ backgroundColor: color.hex }}
                    />
                    {!hasAnyStock && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-8 h-0.5 bg-red-500 -rotate-45" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#2D2024]">
                Taille : <span className="text-[#BE395D] font-normal">{currentVariant?.sizeName}</span>
              </span>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="text-[#BE395D] hover:underline flex items-center gap-1 font-medium"
              >
                <Ruler className="w-3.5 h-3.5" />
                Guide des tailles
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {availableSizes.map((size) => {
                // Find stock for selectedColor + this size
                const sizeVariant = product.variants.find(
                  (v) => v.colorId === selectedColorId && v.sizeId === size.id
                );
                const stock = sizeVariant ? sizeVariant.stockQuantity : 0;
                const isOut = stock === 0;
                const isSelected = selectedSizeId === size.id;

                return (
                  <button
                    key={size.id}
                    disabled={isOut}
                    onClick={() => {
                      setSelectedSizeId(size.id);
                      setQuantity(1);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? 'border-[#BE395D] bg-[#FDF2F4] text-[#BE395D] shadow-xs'
                        : isOut
                        ? 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed line-through'
                        : 'border-[#EBDDE1] text-[#2D2024] hover:border-[#BE395D]'
                    }`}
                  >
                    <span>{size.name}</span>
                    <span className="text-[9px] font-normal opacity-75">
                      {isOut ? 'Épuisé' : 'Disponible'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock Availability Callout */}
          <div className="p-3.5 rounded-2xl bg-[#FAF3F5] border border-[#F2E5E8] flex items-center justify-between text-xs">
            {isVariantOutOfStock ? (
              <span className="text-stone-600 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-stone-500" />
                Épuisé — choisissez une autre taille ou couleur.
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Disponible
              </span>
            )}
          </div>

          {/* Quantity & Add to Cart button */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-[#EBDDE1] rounded-2xl bg-white p-1">
                <button
                  type="button"
                  disabled={quantity <= 1 || isVariantOutOfStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-[#2D2024] hover:bg-[#FAF3F5] disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-bold text-[#2D2024]">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= variantStock || isVariantOutOfStock}
                  onClick={() => setQuantity((q) => Math.min(variantStock, q + 1))}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-[#2D2024] hover:bg-[#FAF3F5] disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                >
                  +
                </button>
              </div>

              {/* Main Add Button */}
              <button
                type="button"
                disabled={isVariantOutOfStock}
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 ${
                  isVariantOutOfStock
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    : 'bg-[#BE395D] hover:bg-[#9E2B4B] text-white active:scale-[0.99]'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {isVariantOutOfStock
                    ? 'Variante Épuisée'
                    : `Ajouter au Panier • ${formatPrice((currentVariant?.price || product.price) * quantity)}`}
                </span>
              </button>
            </div>

            {/* Notification Toast */}
            {toastMessage && (
              <div className="bg-[#2D2024] text-white text-xs py-2.5 px-4 rounded-xl shadow-lg flex items-center justify-between animate-fadeIn">
                <span>{toastMessage}</span>
                <button
                  onClick={onOpenCart}
                  className="text-[#F5B5C4] font-bold underline ml-3 shrink-0"
                >
                  Voir Panier →
                </button>
              </div>
            )}
          </div>

          {/* Reassurance Features (Algeria delivery, COD, exchange) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#F2E5E8] text-xs text-[#523F44]">
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FAF8F8]">
              <Truck className="w-4 h-4 text-[#BE395D] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#2D2024]">69 Wilayas</p>
                <p className="text-[11px] text-[#8C737B]">Livraison à domicile ou Stop Desk Yalidine</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FAF8F8]">
              <ShieldCheck className="w-4 h-4 text-[#BE395D] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#2D2024]">Paiement COD</p>
                <p className="text-[11px] text-[#8C737B]">Réglez votre commande en espèces au livreur</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FAF8F8]">
              <RotateCcw className="w-4 h-4 text-[#BE395D] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#2D2024]">Échange Garanti</p>
                <p className="text-[11px] text-[#8C737B]">Échange de taille facile sous 48h</p>
              </div>
            </div>
          </div>

          {/* Technical Specifications Accordion / Cards */}
          <div className="space-y-3 pt-2">
            <div className="bg-white rounded-2xl p-4 border border-[#F2E5E8]">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2D2024] mb-2">
                Matière & Confection
              </h4>
              <p className="text-xs text-[#70585F] leading-relaxed">
                {product.material} — Finitions coutures renforcées et passepoils artisanaux.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#F2E5E8]">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2D2024] mb-2">
                Conseils d'Entretien
              </h4>
              <p className="text-xs text-[#70585F] leading-relaxed">
                {product.careInstructions}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="mt-16 pt-12 border-t border-[#F2E5E8]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="font-serif-luxury text-2xl text-[#2D2024] font-semibold">
              Avis de nos clientes ({productReviews.length})
            </h3>
            <p className="text-xs text-[#8C737B] mt-1">
              Des retours authentiques de femmes ayant commandé ce modèle en Algérie.
            </p>
          </div>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="self-start sm:self-auto bg-[#FAF3F5] text-[#BE395D] hover:bg-[#BE395D] hover:text-white px-4 py-2.5 rounded-full text-xs font-bold transition-all"
          >
            {showReviewForm ? 'Masquer le formulaire' : '✍️ Écrire un avis'}
          </button>
        </div>

        {/* Review Submission Form */}
        {showReviewForm && (
          <form
            onSubmit={handleReviewSubmit}
            className="bg-white border border-[#EBDDE1] rounded-3xl p-6 sm:p-8 mb-8 space-y-4 shadow-sm animate-fadeIn"
          >
            <h4 className="font-semibold text-sm text-[#2D2024]">Partagez votre expérience</h4>

            {reviewSubmitted ? (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl text-xs font-medium">
                Merci pour votre avis 💗 ! Il a été enregistré avec succès.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#2D2024] mb-1">Votre Nom & Prénom</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Yasmine B."
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#2D2024] mb-1">Votre Wilaya</label>
                    <input
                      type="text"
                      placeholder="Ex: Alger (16), Oran (31)"
                      value={reviewWilaya}
                      onChange={(e) => setReviewWilaya(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2D2024] mb-1">Note sur 5</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= reviewRating
                              ? 'text-amber-400 fill-current'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2D2024] mb-1">Votre commentaire</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Confort du tissu, qualité de la coupe, livraison..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D]"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#BE395D] hover:bg-[#9E2B4B] text-white text-xs font-bold py-3 px-6 rounded-xl uppercase tracking-wider transition-colors"
                >
                  Publier mon avis
                </button>
              </>
            )}
          </form>
        )}

        {/* Reviews Grid */}
        {productReviews.length === 0 ? (
          <p className="text-xs text-[#8C737B] italic">
            Soyez la première cliente à donner son avis sur cet article !
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-5 rounded-2xl border border-[#F2E5E8] shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#A69398]">{rev.customerWilaya}</span>
                </div>
                <p className="text-xs text-[#523F44] leading-relaxed">"{rev.comment}"</p>
                <div className="text-[11px] font-semibold text-[#2D2024] pt-2 border-t border-[#F8EFF1] flex items-center justify-between">
                  <span>{rev.customerName}</span>
                  {rev.isVerified && (
                    <span className="text-[10px] text-emerald-700 font-normal">Achat vérifié ✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Similar Products: "Vous pourriez aussi aimer" */}
      {similarProducts.length > 0 && (
        <section className="mt-16 pt-12 border-t border-[#F2E5E8]">
          <h3 className="font-serif-luxury text-2xl text-[#2D2024] font-semibold mb-6">
            Vous pourriez aussi aimer
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {similarProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-[#F2E5E8] p-3 hover:shadow-md transition-all"
              >
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#FAF3F5] mb-2.5">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h4 className="font-serif-luxury text-sm font-semibold text-[#2D2024] group-hover:text-[#BE395D] truncate">
                  {p.name}
                </h4>
                <p className="text-xs font-bold text-[#2D2024] mt-1">
                  {formatPrice(p.price)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Add-to-Cart Bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 bg-[#FAF7F6]/95 backdrop-blur-md border-t border-[#EBDDE1] p-3 shadow-lg flex items-center gap-3">
        <div className="flex-1 truncate">
          <p className="text-xs font-semibold text-[#2D2024] truncate">{product.name}</p>
          <p className="text-xs font-bold text-[#BE395D]">
            {formatPrice((currentVariant?.price || product.price) * quantity)}
          </p>
        </div>
        <button
          disabled={isVariantOutOfStock}
          onClick={handleAddToCart}
          className={`py-3 px-5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all ${
            isVariantOutOfStock
              ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
              : 'bg-[#BE395D] text-white active:scale-95'
          }`}
        >
          {isVariantOutOfStock ? 'Épuisé' : 'Ajouter au Panier'}
        </button>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        onSelectRecommendedSize={(sizeName) => {
          const found = availableSizes.find((s) => s.name === sizeName);
          if (found) setSelectedSizeId(found.id);
        }}
      />
    </div>
  );
};
