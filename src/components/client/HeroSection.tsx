import React from 'react';
import { ArrowRight, Sparkles, Truck, ShieldCheck, Heart } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { formatPrice } from '../../utils/formatters';

interface HeroSectionProps {
  onDiscover: () => void;
  onBestSellers: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onDiscover,
  onBestSellers,
}) => {
  const { products, approvedReviews } = useStore();
  const heroProduct = products.find((p) => p.isActive && p.images && p.images.length > 0);
  const firstReview = approvedReviews.find((r) => r.rating === 5 && r.comment);

  const heroImage = heroProduct ? heroProduct.images[0] : '/logo.jpg';
  const heroTitle = heroProduct ? heroProduct.name : 'PYJAMAS MAGIQUE';
  const heroCategory = heroProduct ? heroProduct.category : 'Collection Algérie';
  const heroPriceText = heroProduct ? `À partir de ${formatPrice(heroProduct.price)}` : 'Boutique en Ligne Algérie';
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FDF9F8] via-[#F8EEF1] to-[#FAF7F6] pt-10 pb-16 md:py-20 border-b border-[#F2E5E8]">
      {/* Decorative ambient blurs */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-[#F8CBD4]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#E8D4C8]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Brand Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-xs border border-[#F2E5E8] px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-[#BE395D] shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#BE395D]" />
              Nouvelle Collection Homewear & Pyjamas 2026
            </div>

            <div className="space-y-3">
              <h1 className="font-serif-luxury text-4xl sm:text-6xl lg:text-7xl text-[#2D2024] font-semibold tracking-tight leading-[1.08]">
                PYJA MAGIC
                <span className="block italic font-normal text-[#BE395D] text-3xl sm:text-5xl lg:text-6xl mt-1">
                  Le confort qui vous ressemble.
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-[#70585F] max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Sublimez vos nuits et vos moments cocooning avec des pyjamas soyeux, délicats et d’une élégance intemporelle. Pensés pour la femme moderne algérienne avec paiement à la livraison dans les 69 wilayas.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={onDiscover}
                className="w-full sm:w-auto bg-[#BE395D] hover:bg-[#9E2B4B] text-white py-4 px-8 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
              >
                <span>Découvrir la collection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onBestSellers}
                className="w-full sm:w-auto bg-white/90 hover:bg-white text-[#2D2024] py-4 px-8 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider border border-[#EBDDE1] hover:border-[#BE395D] transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Nos meilleures ventes</span>
              </button>
            </div>

            {/* Micro reassurance badges */}
            <div className="pt-6 border-t border-[#F0DFE3] flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#523F44]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#BE395D] shadow-2xs">
                  <Truck className="w-4 h-4" />
                </div>
                <span>Livraison 69 Wilayas</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#BE395D] shadow-2xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Paiement Cash à Réception</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md">
              {/* Main arched photo frame */}
              <div className="relative aspect-[3/4] rounded-t-[120px] rounded-b-3xl overflow-hidden shadow-2xl border-4 border-white bg-[#FAF3F5]">
                <img
                  src={heroImage}
                  alt={heroTitle}
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-[#BE395D] px-2.5 py-1 rounded">
                    {heroCategory}
                  </span>
                  <p className="font-serif-luxury text-xl font-bold mt-1 line-clamp-1">
                    {heroTitle}
                  </p>
                  <p className="text-xs text-white/90">{heroPriceText}</p>
                </div>
              </div>

              {/* Floating review card (Shown only if a real 5-star review exists) */}
              {firstReview && (
                <div className="absolute -bottom-4 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#F2E5E8] shadow-xl max-w-[220px] hidden sm:block animate-fadeIn">
                  <div className="flex text-amber-400 text-xs mb-1">
                    ★★★★★
                  </div>
                  <p className="text-[11px] text-[#2D2024] font-medium leading-snug line-clamp-2">
                    "{firstReview.comment}"
                  </p>
                  <span className="text-[10px] text-[#8C737B] mt-1 block font-semibold">
                    — {firstReview.customerName} ({firstReview.customerWilaya})
                  </span>
                </div>
              )}

              {/* Floating fast delivery card */}
              <div className="absolute -top-4 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md p-3 px-4 rounded-2xl border border-[#F2E5E8] shadow-xl hidden sm:flex items-center gap-2.5 animate-fadeIn">
                <Truck className="w-4 h-4 text-[#BE395D]" />
                <div className="text-[11px]">
                  <p className="font-bold text-[#2D2024]">Expédition 48h</p>
                  <p className="text-[#8C737B] text-[10px]">Via Yalidine Express</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
