import React from 'react';
import { Truck, ShieldCheck, Heart, Phone, Mail, Instagram, MapPin } from 'lucide-react';
import { useStore } from '../../hooks/useStore';

interface FooterProps {
  onNavigate: (view: 'home' | 'catalog' | 'tracking' | 'faq' | 'admin', category?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useStore();

  return (
    <footer className="bg-[#261B1E] text-[#E6D8DC] pt-16 pb-24 md:pb-12 border-t border-[#3D2C31]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#3D2C31]">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-serif-luxury text-2xl tracking-[0.2em] text-[#FAF7F6] font-semibold">
              PYJA MAGIC
            </h3>
            <p className="text-xs text-[#C7B5BA] leading-relaxed max-w-sm">
              La première marque algérienne de pyjamas et homewear féminin haut de gamme. Confort voluptueux, finitions couture et livraison dans l’ensemble des 69 wilayas d’Algérie avec paiement à la livraison.
            </p>
            <div className="pt-2 flex items-center space-x-3 text-xs text-[#FAF7F6]">
              <span className="flex items-center gap-1.5 bg-[#36262B] px-3 py-1.5 rounded-full">
                <Truck className="w-3.5 h-3.5 text-[#F5B5C4]" />
                69 Wilayas
              </span>
              <span className="flex items-center gap-1.5 bg-[#36262B] px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F5B5C4]" />
                Paiement Cash COD
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#FAF7F6]">Collections</h4>
            <ul className="space-y-2 text-xs text-[#C7B5BA]">
              <li>
                <button onClick={() => onNavigate('catalog')} className="hover:text-white transition-colors">
                  Toute la collection
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog', 'Pyjamas satin')} className="hover:text-white transition-colors">
                  Pyjamas en satin soyeux
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog', 'Pyjamas coton')} className="hover:text-white transition-colors">
                  Pyjamas en pur coton bio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog', 'Collection hiver')} className="hover:text-white transition-colors">
                  Collection Hiver & Velours
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog', 'Collection été')} className="hover:text-white transition-colors">
                  Ensembles & Shortamas Été
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#FAF7F6]">Service Client</h4>
            <ul className="space-y-2 text-xs text-[#C7B5BA]">
              <li>
                <button onClick={() => onNavigate('tracking')} className="hover:text-white transition-colors font-medium text-[#F5B5C4]">
                  📦 Suivre ma commande
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">
                  Tarifs des 69 Wilayas
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">
                  Guide des tailles algériennes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">
                  Échanges & Retours faciles
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">
                  Paiement à la livraison (COD)
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Algeria info */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#FAF7F6]">Contactez-nous</h4>
            <ul className="space-y-2.5 text-xs text-[#C7B5BA]">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#F5B5C4]" />
                <a href={`tel:${settings.phone}`} className="hover:text-white transition-colors">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#F5B5C4]" />
                <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="w-3.5 h-3.5 text-[#F5B5C4]" />
                <span className="hover:text-white transition-colors">
                  {settings.instagram}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#F5B5C4]" />
                <span>Expéditions quotidiennes depuis Alger</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A69398] gap-4">
          <p>© {new Date().getFullYear()} PYJA MAGIC Algérie. Tous droits réservés.</p>
          <div className="flex items-center space-x-6">
            <button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">
              Conditions Générales de Vente
            </button>
            <button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">
              Politique de Confidentialité
            </button>
            <button
              onClick={() => onNavigate('admin')}
              className="text-[#E6C9D1] hover:text-white transition-colors font-medium"
            >
              Administration
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
