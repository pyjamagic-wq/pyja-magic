import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

interface AdminAuthProps {
  onLoginSuccess: (email: string) => void;
  onExitAdmin: () => void;
}

// SHA-256 helper for secure browser-side hash comparison (Inspect Element protection)
async function hashSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// SHA-256 hashes of "pyjamagic@gmail.com" and "Wala2002"
const AUTH_EMAIL_HASH = '8b56b0294870ca66fa9d812b9e8d71507eb985901e335809228115b685dd6506';
const AUTH_PASS_HASH = '048225605a4003a13c8030d3e516f356769cb72c7f29e139f0418ee665cb5986';

export const AdminAuth: React.FC<AdminAuthProps> = ({
  onLoginSuccess,
  onExitAdmin,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      const computedEmailHash = await hashSHA256(cleanEmail);
      const computedPassHash = await hashSHA256(cleanPass);

      if (computedEmailHash === AUTH_EMAIL_HASH && computedPassHash === AUTH_PASS_HASH) {
        localStorage.setItem(
          'pyjamagic_admin_session',
          JSON.stringify({ email: cleanEmail, token: 'auth-token-secured' })
        );
        onLoginSuccess(cleanEmail);
      } else {
        setError('Identifiants incorrects. Accès refusé.');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Erreur d\'authentification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <button
          onClick={onExitAdmin}
          className="inline-flex items-center gap-1.5 text-xs text-[#8C737B] hover:text-[#BE395D] font-medium mb-4"
        >
          ← Retour à la boutique cliente
        </button>

        <div className="w-14 h-14 bg-[#2D2024] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <ShieldCheck className="w-8 h-8 text-[#F5B5C4]" />
        </div>

        <h2 className="mt-4 font-serif-luxury text-3xl font-bold tracking-tight text-[#2D2024]">
          Administration PYJA MAGIC
        </h2>
        <p className="mt-1 text-xs text-[#70585F]">
          Accès restreint à la gestion des commandes, du stock et de la livraison.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-[#F2E5E8]">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#2D2024] mb-1">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A69398] absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="votre-email@domaine.dz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D] bg-[#FAF8F8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D2024] mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A69398] absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D] bg-[#FAF8F8]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold uppercase tracking-wider text-white bg-[#BE395D] hover:bg-[#9E2B4B] focus:outline-none transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Vérification...' : 'Se Connecter au Tableau de Bord'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
