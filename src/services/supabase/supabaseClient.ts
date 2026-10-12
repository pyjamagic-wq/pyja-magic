import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default project credentials provided by the user
export const DEFAULT_SUPABASE_URL = 'https://husnrgwesumshcyiukdt.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1c25yZ3dlc3Vtc2hjeWl1a2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzODk3NDUsImV4cCI6MjEwNjk2NTc0NX0.CqvcpfvKMlvbWM6e1X_NtDKS0Eyw4fOpQ9DikPlHJqY';

function getActiveUrl(): string {
  try {
    const stored = localStorage.getItem('pyjamagic_settings_v1');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.supabaseUrl && parsed.supabaseUrl.trim().startsWith('http')) {
        return parsed.supabaseUrl.trim();
      }
    }
  } catch {
    // ignore
  }
  return import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
}

function getActiveKey(): string {
  try {
    const stored = localStorage.getItem('pyjamagic_settings_v1');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.supabaseAnonKey && parsed.supabaseAnonKey.trim().length > 20) {
        return parsed.supabaseAnonKey.trim();
      }
    }
  } catch {
    // ignore
  }
  return import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
}

let currentClient: SupabaseClient | null = null;
let currentClientKey = '';

export function getSupabase(): SupabaseClient | null {
  const url = getActiveUrl();
  const key = getActiveKey();

  if (!url || !key) return null;

  const keyCombo = `${url}:::${key}`;
  if (currentClient && currentClientKey === keyCombo) {
    return currentClient;
  }

  try {
    currentClient = createClient(url, key);
    currentClientKey = keyCombo;
    return currentClient;
  } catch (err) {
    console.error('Failed to create Supabase client', err);
    return null;
  }
}

export const isSupabaseConfigured = Boolean(getActiveUrl() && getActiveKey());

export const supabase: SupabaseClient | null = getSupabase();

export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  hasTables: boolean;
  rlsBlocked?: boolean;
}> {
  const client = getSupabase();
  if (!client) {
    return {
      success: false,
      message: 'Client Supabase non initialisé (URL ou clé manquante).',
      hasTables: false,
    };
  }

  try {
    // 1. Tester la lecture de la table products
    const { data, error } = await client.from('products').select('id').limit(1);

    if (error) {
      if (
        error.code === '42P01' ||
        error.message.includes('does not exist') ||
        error.message.includes('relation "products" does not exist')
      ) {
        return {
          success: false,
          message: 'Connecté à Supabase, mais la table "products" n\'existe pas encore. Exécutez le script SQL dans SQL Editor.',
          hasTables: false,
        };
      }

      return {
        success: false,
        message: `Erreur Supabase: ${error.message} (${error.code || ''})`,
        hasTables: false,
      };
    }

    const [{ error: reviewsErr }, { error: settingsErr }] = await Promise.all([
      client.from('reviews').select('id').limit(1),
      client.from('settings').select('key').eq('key', 'store_settings').limit(1),
    ]);
    if (reviewsErr || settingsErr) {
      const error = reviewsErr || settingsErr;
      return {
        success: false,
        message: `Lecture des tables reviews/settings échouée : ${error.message}`,
        hasTables: true,
      };
    }

    return {
      success: true,
      message: `Connexion Supabase opérationnelle en lecture. Aucune donnée n'a été écrite (${data?.length ?? 0} produit(s) existant(s)).`,
      hasTables: true,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Impossible de contacter Supabase: ${msg}`,
      hasTables: false,
    };
  }
}
