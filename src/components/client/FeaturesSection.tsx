import React from 'react';
import { Truck, ShieldCheck, Sparkles, PackageSearch, HeartHandshake } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Truck,
      title: 'Livraison 69 Wilayas',
      description: 'Expédition rapide et soignée dans toute l’Algérie, à domicile ou en point relais Yalidine.',
    },
    {
      icon: ShieldCheck,
      title: 'Paiement à la Livraison',
      description: 'Commandez en toute sérénité sans carte bancaire et réglez en espèces à la réception de votre colis.',
    },
    {
      icon: Sparkles,
      title: 'Matières d’Exception',
      description: 'Satin soyeux, coton biologique peigné et velours ultra-doux au toucher caresse.',
    },
    {
      icon: PackageSearch,
      title: 'Suivi de Colis en Direct',
      description: 'Suivez chaque étape de préparation et de livraison en temps réel grâce à votre code unique.',
    },
    {
      icon: HeartHandshake,
      title: 'Service Client Dédié',
      description: 'Une équipe bienveillante à votre écoute par téléphone et WhatsApp pour vous conseiller.',
    },
  ];

  return (
    <section className="py-12 bg-white border-y border-[#F2E5E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#FAF8F8] border border-[#F5EDEF] hover:border-[#E8CBD3] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#BE395D] shrink-0 shadow-2xs">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-[#2D2024]">{feat.title}</h4>
                  <p className="text-[11px] text-[#70585F] mt-1 leading-snug">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
