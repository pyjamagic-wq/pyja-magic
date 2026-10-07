import React from 'react';
import { Sparkles, Heart, CheckCircle2, Feather, Star } from 'lucide-react';

export const WhyUsSection: React.FC = () => {
  const points = [
    {
      title: 'Confort Ultime & Respirabilité',
      desc: 'Des textiles délicatement choisis qui caressent la peau, thermorégulateurs et ultra-légers pour des nuits paisibles.',
    },
    {
      title: 'Coupes Pensées pour les Femmes Algériennes',
      desc: 'Du XS au XXL, nos modèles allient pudeur gracieuse, aisance de mouvement et élégance moderne.',
    },
    {
      title: 'Finitions Couture Haut de Gamme',
      desc: 'Passepoils satinés, boutons nacrés, dentelles douces non irritantes et coutures renforcées faites pour durer.',
    },
    {
      title: 'Emballage Parfumé & Soigné',
      desc: 'Chaque commande est enveloppée dans du papier de soie avec un délicat ruban satiné, prête à s’offrir ou à se faire plaisir.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-[#FAF7F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Text */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#BE395D] bg-[#FAF3F5] px-3.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              L'Excellence du Homewear
            </div>

            <h2 className="font-serif-luxury text-3xl sm:text-5xl text-[#2D2024] font-semibold leading-tight">
              Pourquoi choisir <br />
              <span className="italic text-[#BE395D]">PYJA MAGIC ?</span>
            </h2>

            <p className="text-xs sm:text-sm text-[#70585F] leading-relaxed">
              Nous croyons que vos vêtements de nuit méritent la même attention que vos tenues de jour. Pyja Magic transforme chaque coucher et chaque réveil en une parenthèse de douceur et de féminité raffinée.
            </p>

            <div className="space-y-4 pt-2">
              {points.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-[#F2E5E8] shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-[#FAF3F5] flex items-center justify-center text-[#BE395D] shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs text-[#2D2024]">{pt.title}</h3>
                    <p className="text-[11px] text-[#70585F] mt-0.5 leading-relaxed">{pt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual Image */}
          <div className="relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=1000&q=85"
                alt="Pyjama confort femme Algérie Pyja Magic"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <p className="font-serif-luxury text-2xl font-semibold">
                  "L’art de se sentir belle chez soi."
                </p>
                <p className="text-xs text-white/80">
                  Créé avec passion pour les femmes d'Alger, d'Oran, de Constantine et des 69 wilayas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
