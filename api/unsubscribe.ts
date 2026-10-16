import { getServerEnv } from '../src/server/brevo.js';

interface ApiRequest {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface ApiResponse {
  setHeader(name: string, value: string): void;
  status(code: number): ApiResponse;
  send(body: string): void;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).send('<h1>Méthode non autorisée</h1>');
  }

  const body = req.body as { token?: unknown } | undefined;
  const tokenValue = (req.method === 'POST' ? body?.token : undefined) ?? req.query?.token;
  const token = Array.isArray(tokenValue) ? tokenValue[0] : tokenValue;
  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
    return res.status(400).send('<h1>Lien de désinscription invalide.</h1>');
  }

  if (req.method === 'GET') {
    const escapedToken = encodeURIComponent(token);
    return res.status(200).send(`<div style="font-family:Arial,sans-serif;max-width:520px;margin:48px auto;padding:24px;color:#2D2024"><h1>Se désinscrire de la newsletter</h1><p>Confirmez pour ne plus recevoir les nouveautés et offres Pyja Magic.</p><form method="post" action="/api/unsubscribe"><input type="hidden" name="token" value="${escapedToken}"><button type="submit" style="background:#BE395D;color:white;border:0;border-radius:6px;padding:12px 18px;cursor:pointer">Confirmer la désinscription</button></form></div>`);
  }

  const supabaseUrl = getServerEnv('SUPABASE_URL').replace(/\/$/, '');
  const serviceKey = getServerEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).send('<h1>Service indisponible. Contactez la boutique pour vous désinscrire.</h1>');
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/subscribers?unsubscribe_token=eq.${encodeURIComponent(token)}`,
      {
        method: 'PATCH',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ marketing_consent: false, unsubscribed_at: new Date().toISOString() }),
      }
    );
    if (!response.ok) return res.status(502).send('<h1>La désinscription a échoué. Réessayez plus tard.</h1>');
    return res.status(200).send('<h1>Vous êtes désinscrite de la newsletter Pyja Magic.</h1><p>Les emails concernant vos commandes continueront d’être envoyés.</p>');
  } catch {
    return res.status(500).send('<h1>Service momentanément indisponible.</h1>');
  }
}