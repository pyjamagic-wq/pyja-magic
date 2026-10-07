import React, { useState } from 'react';
import { Mail, Sparkles, Check } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section className="py-16 bg-[#FDF9F8] border-b border-[#F2E5E8] text-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="w-12 h-12 rounded-full bg-[#FAF3F5] text-[#BE395D] flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6" />
        </div>

        <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#2D2024] font-semibold">
          Rejoignez le Cercle Privilège Pyja Magic
        </h2>
        <p className="text-xs sm:text-sm text-[#70585F] mt-2 max-w-md mx-auto">
          Inscrivez-vous pour recevoir nos nouvelles collections en avant-première et profitez d'un code promo exclusif de <strong className="text-[#BE395D]">-10%</strong> sur votre première commande.
        </p>

        {submitted ? (
          <div className="mt-6 bg-[#FAF3F5] border border-[#E8CBD3] text-[#2D2024] p-4 rounded-2xl text-xs font-medium flex items-center justify-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Merci ! Utilisez le code promo <strong>MAGIC10</strong> lors de votre commande pour bénéficier de -10%.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-[#A69398] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="Votre adresse email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs pl-10 pr-3 py-3 rounded-full border border-[#EBDDE1] bg-white focus:outline-none focus:border-[#BE395D]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#BE395D] hover:bg-[#9E2B4B] text-white text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-full transition-colors shadow-sm"
            >
              M'inscrire
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
