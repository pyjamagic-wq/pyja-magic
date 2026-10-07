import React from 'react';
import { Star, Heart, CheckCircle2, Quote } from 'lucide-react';
import { useStore } from '../../hooks/useStore';

export const TestimonialsSection: React.FC = () => {
  const { approvedReviews } = useStore();
  const displayReviews = approvedReviews.slice(0, 4);

  return (
    <section className="py-16 md:py-24 bg-white border-b border-[#F2E5E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#BE395D] bg-[#FAF3F5] px-3.5 py-1 rounded-full mb-3">
            <Heart className="w-3.5 h-3.5 fill-current" />
            Elles adorent Pyja Magic
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#2D2024] font-semibold">
            Ce que disent nos clientes
          </h2>
          <p className="text-xs sm:text-sm text-[#70585F] mt-2">
            Plus de 98% de satisfaction client à travers les 69 wilayas d’Algérie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#FAF8F8] rounded-3xl p-6 border border-[#F2E5E8] flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-[#EBDDE1]" />
                </div>
                <p className="text-xs text-[#523F44] italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-[#F0DFE3]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#2D2024]">{rev.customerName}</h4>
                    <p className="text-[10px] text-[#8C737B]">{rev.customerWilaya}</p>
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Vérifié
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
