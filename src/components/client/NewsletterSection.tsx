import React, { useState } from 'react';
import { Mail, Sparkles, Check } from 'lucide-react';
import { useStore } from '../../hooks/useStore';

export const NewsletterSection: React.FC = () => {
  const { subscribeNewsletter } = useStore();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const res = await subscribeNewsletter(email, consent);
    setLoading(false);
    setMessage(res.message);
    if (res.success) {
      setSubmitted(true);
      setEmail('');
      setConsent(false);
    }
  };

  return (
    <section className="py-16 bg-[#FDF9F8] border-b border-[#F2E5E8] text-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="w-12 h-12 rounded-full bg-[#FAF3F5] text-[#BE395D] flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6" />
        </div>

        <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#2D2024] font-semibold">
          Restez informée
        </h2>
        <p className="text-xs sm:text-sm text-[#70585F] mt-2 max-w-md mx-auto">
          Laissez votre email pour recevoir nos nouvelles collections, publications et codes promo exclusifs.
          Après votre premier achat, recevez un code personnel de 5%, utilisable une seule fois.
        </p>

        {submitted ? (
          <div className="mt-6 bg-[#FAF3F5] border border-[#E8CBD3] text-[#2D2024] p-4 rounded-2xl text-xs font-medium flex items-center justify-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message || 'Merci ! Surveillez votre boîte mail.'}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 max-w-md mx-auto">
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
            <label className="flex items-start gap-2 text-left text-[11px] text-[#70585F]">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 accent-[#BE395D]"
              />
              <span>J’accepte de recevoir par email les nouveautés et offres de Pyja Magic. Je peux me désinscrire à tout moment.</span>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="self-center bg-[#BE395D] hover:bg-[#9E2B4B] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-full transition-colors shadow-sm"
            >
              {loading ? 'Inscription…' : "M'inscrire"}
            </button>
            {message && !submitted && (
              <p className="text-[11px] text-red-600 sm:col-span-2 w-full text-center">{message}</p>
            )}
          </form>
        )}
      </div>
    </section>
  );
};
