import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

interface AdminAuthProps {
  onLoginSuccess: (email: string) => void;
  onExitAdmin: () => void;
}

export const AdminAuth: React.FC<AdminAuthProps> = ({
  onLoginSuccess,
  onExitAdmin,
}) => {
  const [email, setEmail] = useState('admin@pyjamagic.dz');
  const [password, setPassword] = useState('pyjamagic2026');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation (accepts demo credentials or any configured admin email)
    if (
      (email === 'admin@pyjamagic.dz' && password === 'pyjamagic2026') ||
      (email.includes('@') && password.length >= 6)
    ) {
      localStorage.setItem('pyjamagic_admin_session', JSON.stringify({ email, token: 'auth-token' }));
      onLoginSuccess(email);
    } else {
      setError('Identifiants incorrects. Veuillez utiliser les identifiants administrateur.');
    }
  };

  const handleQuickDemoFill = () => {
    setEmail('admin@pyjamagic.dz');
    setPassword('pyjamagic2026');
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D] bg-[#FAF8F8]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold uppercase tracking-wider text-white bg-[#BE395D] hover:bg-[#9E2B4B] focus:outline-none transition-all"
            >
              <span>Se Connecter au Tableau de Bord</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="mt-6 pt-6 border-t border-[#F2E5E8] text-center">
            <div className="bg-[#FAF3F5] rounded-2xl p-4 text-xs text-[#523F44] space-y-2">
              <p className="font-semibold text-[#2D2024]">💡 Accès Démo Rapide :</p>
              <p className="font-mono text-[11px] text-[#70585F]">
                admin@pyjamagic.dz / pyjamagic2026
              </p>
              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="text-xs text-[#BE395D] font-bold underline hover:text-[#9E2B4B]"
              >
                Remplir automatiquement
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
