import React, { useState } from 'react';
import { X, Search, Sparkles, ArrowRight } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { formatPrice } from '../../utils/formatters';
import { Product } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const { products } = useStore();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const results = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.material.toLowerCase().includes(query.toLowerCase()) ||
          p.variants.some((v) => v.colorName.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-[#F2E5E8] overflow-hidden">
        {/* Search Input bar */}
        <div className="p-4 border-b border-[#F2E5E8] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#BE395D] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Rechercher par nom, satin, coton, bordeaux, velours..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent focus:outline-none text-[#2D2024]"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-[#70585F] hover:bg-[#FAF3F5] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-2">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-xs text-[#8C737B] space-y-2">
              <p>Recherchez parmi notre collection de pyjamas et homewear féminin.</p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {['Satin', 'Coton', 'Rose Poudré', 'Velours', 'Ensembles'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="bg-[#FAF3F5] hover:bg-[#F2E0E5] text-[#BE395D] px-3 py-1 rounded-full text-xs font-medium transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#70585F]">
              Aucun modèle trouvé pour "{query}".
            </div>
          ) : (
            results.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  onClose();
                  onSelectProduct(product);
                }}
                className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#FAF3F5] cursor-pointer transition-colors"
              >
                <div className="w-12 h-14 rounded-xl overflow-hidden bg-[#FAF3F5] shrink-0">
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif-luxury text-sm font-semibold text-[#2D2024] truncate">
                    {product.name}
                  </p>
                  <p className="text-[11px] text-[#8C737B]">{product.category}</p>
                </div>
                <span className="text-xs font-bold text-[#BE395D]">
                  {formatPrice(product.price)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
