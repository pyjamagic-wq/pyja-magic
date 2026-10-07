import React, { useState } from 'react';
import { Save, RefreshCw, Key, Shield, Check, Truck, Database, Copy, ExternalLink, Sparkles, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { isSupabaseConfigured, testSupabaseConnection } from '../../services/supabase/supabaseClient';
import { SUPABASE_SQL_SCHEMA, SUPABASE_RLS_FIX_SQL } from '../../data/sqlSchemaString';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, resetToDefaultData } = useStore();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [phone, setPhone] = useState(settings.phone);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [email, setEmail] = useState(settings.email);
  const [instagram, setInstagram] = useState(settings.instagram);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(settings.freeShippingThreshold);
  const [yalidineApiKey, setYalidineApiKey] = useState(settings.yalidineApiKey);
  const [yalidineApiToken, setYalidineApiToken] = useState(settings.yalidineApiToken);
  const [announcementText, setAnnouncementText] = useState(settings.announcementText);

  // Supabase state
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings.supabaseAnonKey || '');
  const [sqlCopied, setSqlCopied] = useState(false);
  const [rlsFixCopied, setRlsFixCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; rlsBlocked?: boolean } | null>(null);

  const handleTestConnection = async () => {
    setIsTestingDb(true);
    setTestResult(null);
    // Make sure latest settings are updated first
    updateSettings({
      supabaseUrl,
      supabaseAnonKey,
    });
    const res = await testSupabaseConnection();
    setTestResult(res);
    setIsTestingDb(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName,
      tagline,
      phone,
      whatsapp,
      email,
      instagram,
      freeShippingThreshold: Number(freeShippingThreshold),
      yalidineApiKey,
      yalidineApiToken,
      announcementText,
      supabaseUrl,
      supabaseAnonKey,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCopySqlScript = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 3000);
    } catch {
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 3000);
    }
  };

  const handleCopyRlsFix = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_RLS_FIX_SQL);
      setRlsFixCopied(true);
      setTimeout(() => setRlsFixCopied(false), 4000);
    } catch {
      setRlsFixCopied(true);
      setTimeout(() => setRlsFixCopied(false), 4000);
    }
  };

  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    resetToDefaultData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl animate-fadeIn">
      <div>
        <h2 className="font-serif-luxury text-2xl font-bold text-[#2D2024]">
          Paramètres Généraux de la Boutique
        </h2>
        <p className="text-xs text-[#8C737B] mt-0.5">
          Configuration de l'identité, des contacts, de la logistique Yalidine et de la base de données Supabase.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Paramètres enregistrés avec succès !</span>
        </div>
      )}

      {/* SECTION SUPABASE GUIDE & CONFIGURATION */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#F2E5E8] shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F2E5E8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-lg font-bold text-[#2D2024]">
                Connexion Supabase ("Superbase")
              </h3>
              <p className="text-xs text-[#70585F]">
                Comment héberger et synchroniser vos données sur votre base de données PostgreSQL gratuite.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
              isSupabaseConfigured || (supabaseUrl && supabaseAnonKey)
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-stone-100 text-stone-600'
            }`}>
              {isSupabaseConfigured || (supabaseUrl && supabaseAnonKey) ? '✓ Supabase Actif' : '● Mode Local Réactif'}
            </span>
          </div>
        </div>

        {/* 5-Step Visual Guide */}
        <div className="space-y-3 bg-[#FAF8F8] p-5 rounded-2xl border border-[#F2E5E8] text-xs">
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#2D2024] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#BE395D]" />
            Guide pas à pas pour connecter Supabase en 2 minutes :
          </h4>

          <ol className="space-y-2.5 list-decimal list-inside text-[#523F44] leading-relaxed">
            <li>
              Rendez-vous sur <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#BE395D] font-bold underline inline-flex items-center gap-1">supabase.com <ExternalLink className="w-3 h-3 inline" /></a> et créez un compte gratuit si ce n'est pas déjà fait.
            </li>
            <li>
              Cliquez sur <strong>"New Project"</strong> et nommez-le <strong>"Pyja Magic"</strong> avec un mot de passe de base de données de votre choix.
            </li>
            <li>
              Dans le menu latéral gauche de Supabase, cliquez sur l'onglet <strong>"SQL Editor"</strong>.
            </li>
            <li>
              Cliquez sur le bouton ci-dessous pour copier le script SQL préparé, collez-le dans le SQL Editor de Supabase et cliquez sur le bouton vert <strong>"RUN"</strong> :
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCopySqlScript}
                  className="bg-[#2D2024] hover:bg-[#3E2D32] text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{sqlCopied ? 'Code SQL copié avec succès ! ✓' : 'Copier le script SQL complet (schema.sql)'}</span>
                </button>
              </div>
            </li>
            <li>
              Dans Supabase, allez dans <strong>Project Settings &gt; API</strong> et copiez votre <strong>Project URL</strong> ainsi que votre clé <strong>anon (public)</strong>, puis collez-les dans les champs ci-dessous :
            </li>
          </ol>
        </div>

        {/* Supabase URL and Anon Key inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          <div>
            <label className="block font-semibold text-[#2D2024] mb-1">
              Project URL Supabase
            </label>
            <input
              type="text"
              placeholder="https://xyzabcdefg.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] font-mono focus:outline-none focus:border-[#BE395D]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#2D2024] mb-1">
              Clé publique anon (anon key)
            </label>
            <input
              type="text"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] font-mono focus:outline-none focus:border-[#BE395D]"
            />
          </div>
        </div>

        {/* Test Connection Button & Result */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTestingDb}
            className="bg-[#2D2024] hover:bg-[#3E2D32] text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isTestingDb ? 'Vérification en cours...' : 'Tester la connexion Supabase'}</span>
          </button>

          {testResult && (
            <div
              className={`p-3.5 rounded-xl text-xs flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span className="font-medium">{testResult.message}</span>
              </div>
              {testResult.rlsBlocked && (
                <button
                  type="button"
                  onClick={handleCopyRlsFix}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-xs shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{rlsFixCopied ? 'Script copié !' : 'Copier le script SQL de déblocage'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Problème d'écriture RLS : Card explicative */}
        <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Vos produits ne s'affichent pas dans Supabase après l'enregistrement ? (Erreur RLS)</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Par défaut, Supabase bloque les écritures de la clé publique avec l'erreur <em>"new row violates row-level security policy"</em>. Pour autoriser l'enregistrement de vos produits et variantes en temps réel :
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleCopyRlsFix}
              className="bg-[#2D2024] hover:bg-[#3E2D32] text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{rlsFixCopied ? '✓ Script de déblocage copié !' : 'Copier le script SQL de déblocage express (3 lignes)'}</span>
            </button>
            <span className="text-[11px] text-[#70585F]">
              Collez-le dans <strong>Supabase &gt; SQL Editor &gt; New query</strong> et cliquez sur <strong>RUN</strong>.
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand identity */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#F2E5E8] shadow-2xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D2024]">
            1. Coordonnées & Contacts Officiels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#2D2024] mb-1">Nom de la marque</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#2D2024] mb-1">Slogan</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#2D2024] mb-1">Téléphone Service Client</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#2D2024] mb-1">Numéro WhatsApp</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#2D2024] mb-1">Email de contact</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#2D2024] mb-1">Compte Instagram</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2D2024] mb-1">
              Bandeau d'annonce en haut du site
            </label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1]"
            />
          </div>
        </div>

        {/* Yalidine Logistics Info & Manual Workflow Mode */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#F2E5E8] shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#BE395D]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D2024]">
              2. Gestion Logistique Yalidine (Mode Manuel Activé)
            </h3>
          </div>

          <div className="bg-[#FAF3F5] p-4 rounded-2xl border border-[#E8CBD3] text-xs text-[#523F44] space-y-2">
            <p className="font-bold text-[#2D2024] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Mode Manuel Opérationnel :
            </p>
            <p>
              Vous n'avez pas besoin de compte API Yalidine. Pour chaque commande :
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#70585F]">
              <li>Vous vérifiez l'<strong>emplacement stock</strong> de l'article pour le préparer.</li>
              <li>Vous passez la commande en <strong>"En préparation"</strong>.</li>
              <li>Lors de la remise au bureau Yalidine, vous saisissez simplement le <strong>N° de bordereau papier</strong> dans le champ dédié de la commande.</li>
              <li>La commande passe automatiquement en <strong>"Arrivé chez Yalidine"</strong> et la cliente peut suivre son colis avec son code !</li>
            </ul>
          </div>
        </div>

        {/* Save button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-red-600 hover:underline flex items-center gap-1 font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Réinitialiser aux données de test</span>
            </button>
            {resetSuccess && (
              <span className="text-xs text-emerald-600 font-medium">✓ Données réinitialisées</span>
            )}
          </div>

          <button
            type="submit"
            className="bg-[#BE395D] hover:bg-[#9E2B4B] text-white px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les paramètres</span>
          </button>
        </div>
      </form>
    </div>
  );
};
