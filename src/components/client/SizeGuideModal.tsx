import React, { useState } from 'react';
import { X, Sparkles, Ruler, CheckCircle2 } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecommendedSize?: (size: string) => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectRecommendedSize,
}) => {
  const [tab, setTab] = useState<'tableau' | 'calculateur'>('tableau');

  // Calculator state
  const [height, setHeight] = useState('165');
  const [weight, setWeight] = useState('60');
  const [fitPreference, setFitPreference] = useState<'ajuste' | 'regular' | 'ample'>('regular');
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);

  if (!isOpen) return null;

  const calculateSize = () => {
    const h = parseInt(height, 10);
    const w = parseInt(weight, 10);
    if (!h || !w) return;

    // Approximate BMI & garment sizing for loungewear
    let base = 'M';
    if (w < 52) base = 'XS';
    else if (w < 58) base = 'S';
    else if (w < 68) base = 'M';
    else if (w < 78) base = 'L';
    else if (w < 88) base = 'XL';
    else base = 'XXL';

    if (fitPreference === 'ample') {
      const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      const curIdx = order.indexOf(base);
      if (curIdx < order.length - 1) base = order[curIdx + 1];
    } else if (fitPreference === 'ajuste') {
      const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      const curIdx = order.indexOf(base);
      if (curIdx > 0 && w < 65) base = order[curIdx - 1];
    }

    setRecommendedSize(base);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl border border-[#F2E5E8]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#70585F] hover:bg-[#FAF3F5] hover:text-[#BE395D] transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#BE395D] bg-[#FDF2F4] px-3 py-1 rounded-full mb-2">
            <Ruler className="w-3.5 h-3.5" />
            Guide des Tailles & Morphologie
          </div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#2D2024] font-semibold">
            Comment bien choisir votre taille ?
          </h2>
          <p className="text-xs text-[#70585F] mt-1 max-w-md mx-auto">
            Nos pyjamas Pyja Magic sont conçus selon les standards de confort des femmes algériennes avec une coupe fluide et décontractée.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#F2E5E8] mb-6">
          <button
            onClick={() => setTab('tableau')}
            className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase border-b-2 transition-colors ${
              tab === 'tableau'
                ? 'border-[#BE395D] text-[#BE395D]'
                : 'border-transparent text-[#70585F] hover:text-[#2D2024]'
            }`}
          >
            Tableau des mesures (cm)
          </button>
          <button
            onClick={() => setTab('calculateur')}
            className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'calculateur'
                ? 'border-[#BE395D] text-[#BE395D]'
                : 'border-transparent text-[#70585F] hover:text-[#2D2024]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#BE395D]" />
            Trouvez votre taille (Assistant)
          </button>
        </div>

        {/* Tab 1: Measurements Table */}
        {tab === 'tableau' && (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-xl border border-[#F2E5E8]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF3F5] text-[#2D2024] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Taille</th>
                    <th className="py-3 px-3">Standard DZ / FR</th>
                    <th className="py-3 px-3">Poitrine</th>
                    <th className="py-3 px-3">Tour de Taille</th>
                    <th className="py-3 px-3">Tour de Bassin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2E5E8] text-[#523F44]">
                  <tr className="hover:bg-[#FAF8F8]">
                    <td className="py-2.5 px-3 font-bold text-[#BE395D]">XS</td>
                    <td className="py-2.5 px-3">34 - 36</td>
                    <td className="py-2.5 px-3">80 - 84 cm</td>
                    <td className="py-2.5 px-3">62 - 66 cm</td>
                    <td className="py-2.5 px-3">86 - 90 cm</td>
                  </tr>
                  <tr className="hover:bg-[#FAF8F8]">
                    <td className="py-2.5 px-3 font-bold text-[#BE395D]">S</td>
                    <td className="py-2.5 px-3">36 - 38</td>
                    <td className="py-2.5 px-3">85 - 89 cm</td>
                    <td className="py-2.5 px-3">67 - 71 cm</td>
                    <td className="py-2.5 px-3">91 - 95 cm</td>
                  </tr>
                  <tr className="hover:bg-[#FAF8F8]">
                    <td className="py-2.5 px-3 font-bold text-[#BE395D]">M</td>
                    <td className="py-2.5 px-3">38 - 40</td>
                    <td className="py-2.5 px-3">90 - 95 cm</td>
                    <td className="py-2.5 px-3">72 - 77 cm</td>
                    <td className="py-2.5 px-3">96 - 101 cm</td>
                  </tr>
                  <tr className="hover:bg-[#FAF8F8]">
                    <td className="py-2.5 px-3 font-bold text-[#BE395D]">L</td>
                    <td className="py-2.5 px-3">40 - 42</td>
                    <td className="py-2.5 px-3">96 - 102 cm</td>
                    <td className="py-2.5 px-3">78 - 84 cm</td>
                    <td className="py-2.5 px-3">102 - 108 cm</td>
                  </tr>
                  <tr className="hover:bg-[#FAF8F8]">
                    <td className="py-2.5 px-3 font-bold text-[#BE395D]">XL</td>
                    <td className="py-2.5 px-3">44 - 46</td>
                    <td className="py-2.5 px-3">103 - 110 cm</td>
                    <td className="py-2.5 px-3">85 - 92 cm</td>
                    <td className="py-2.5 px-3">109 - 116 cm</td>
                  </tr>
                  <tr className="hover:bg-[#FAF8F8]">
                    <td className="py-2.5 px-3 font-bold text-[#BE395D]">XXL</td>
                    <td className="py-2.5 px-3">46 - 48</td>
                    <td className="py-2.5 px-3">111 - 118 cm</td>
                    <td className="py-2.5 px-3">93 - 100 cm</td>
                    <td className="py-2.5 px-3">117 - 124 cm</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-[#FAF3F5] rounded-2xl p-4 text-xs text-[#523F44] space-y-2">
              <p className="font-semibold text-[#2D2024]">💡 Astuce Pyja Magic :</p>
              <p>
                Si vous hésitez entre deux tailles ou si vous aimez porter vos pyjamas amples et très confortables pour la nuit, nous vous recommandons de choisir **la taille supérieure**.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Assistant */}
        {tab === 'calculateur' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2D2024] mb-1">
                  Votre taille (en cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Ex: 165"
                  className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2024] mb-1">
                  Votre poids approximatif (en kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Ex: 62"
                  className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D2024] mb-2">
                Comment préférez-vous porter vos pyjamas ?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'ajuste', label: 'Cintré / Ajusté' },
                  { id: 'regular', label: 'Standard / Normal' },
                  { id: 'ample', label: 'Ample & Cocooning' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFitPreference(item.id as any)}
                    className={`py-2 px-3 text-xs rounded-xl border text-center transition-all ${
                      fitPreference === item.id
                        ? 'border-[#BE395D] bg-[#FDF2F4] text-[#BE395D] font-bold'
                        : 'border-[#EBDDE1] text-[#70585F] hover:bg-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={calculateSize}
              className="w-full bg-[#BE395D] hover:bg-[#9E2B4B] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Calculer ma taille idéale
            </button>

            {recommendedSize && (
              <div className="bg-[#FAF3F5] border border-[#E8CBD3] rounded-2xl p-5 text-center space-y-3 animate-fadeIn">
                <p className="text-xs text-[#70585F]">Taille recommandée pour vous :</p>
                <div className="inline-block bg-[#BE395D] text-white text-3xl font-serif-luxury font-bold px-6 py-2 rounded-2xl shadow-sm">
                  {recommendedSize}
                </div>
                <p className="text-xs text-[#523F44] max-w-sm mx-auto">
                  Cette taille vous offrira une aisance parfaite pour vos nuits et vos moments de détente chez vous.
                </p>
                {onSelectRecommendedSize && (
                  <button
                    onClick={() => {
                      onSelectRecommendedSize(recommendedSize);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-[#BE395D] font-bold underline hover:text-[#9E2B4B]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Appliquer la taille {recommendedSize} à mon choix
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
