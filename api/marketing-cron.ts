import { escapeHtml, getServerEnv, sendBrevoEmail } from '../src/server/brevo.js';

interface ApiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  status(code: number): ApiResponse;
  json(body: unknown): void;
}

interface SubscriberRow {
  id: string;
  email: string;
  unsubscribe_token: string;
  marketing_last_sent_at: string | null;
}

interface ProductRow {
  id: string;
  name: string;
  short_description?: string | null;
  description?: string | null;
  price: number;
  images?: string[] | null;
  created_at: string;
}

function header(req: ApiRequest, key: string): string {
  const value = req.headers[key.toLowerCase()];
  return Array.isArray(value) ? value[0] || '' : value || '';
}

function restHeaders(serviceKey: string): Record<string, string> {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;
const CAMPAIGN_INTERVAL_MS = 4 * DAY_MS;
const MAX_EMAILS_PER_RUN = 20;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Méthode non autorisée.' });

  const cronSecret = getServerEnv('CRON_SECRET');
  if (!cronSecret) return res.status(500).json({ success: false, message: 'CRON_SECRET manquant dans Vercel.' });
  if (header(req, 'authorization') !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ success: false, message: 'Non autorisé.' });
  }

  const supabaseUrl = getServerEnv('SUPABASE_URL').replace(/\/$/, '');
  const serviceKey = getServerEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ success: false, message: 'SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans Vercel.' });
  }

  try {
    const headers = restHeaders(serviceKey);
    const [subscribersResponse, productsResponse] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/subscribers?select=id,email,unsubscribe_token,marketing_last_sent_at&source=eq.newsletter&marketing_consent=eq.true&unsubscribed_at=is.null&order=created_at.asc`, { headers }),
      fetch(`${supabaseUrl}/rest/v1/products?select=id,name,short_description,description,price,images,created_at&is_active=eq.true&order=created_at.desc&limit=8`, { headers }),
    ]);

    if (!subscribersResponse.ok || !productsResponse.ok) {
      const status = !subscribersResponse.ok ? subscribersResponse.status : productsResponse.status;
      console.error('Marketing data fetch failed:', status);
      return res.status(502).json({ success: false, message: `Lecture Supabase échouée (${status}).` });
    }

    const subscribers = (await subscribersResponse.json()) as SubscriberRow[];
    const products = (await productsResponse.json()) as ProductRow[];
    if (!subscribers.length || !products.length) {
      return res.status(200).json({ success: true, sent: 0, message: 'Aucun abonné ou produit à présenter.' });
    }

    const siteBase = `https://${header(req, 'x-forwarded-host') || header(req, 'host')}`;
    const now = new Date();
    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      if (sent >= MAX_EMAILS_PER_RUN) break;
      const lastSentMs = subscriber.marketing_last_sent_at
        ? Date.parse(subscriber.marketing_last_sent_at)
        : 0;
      const newProducts = products
        .filter((product) => Date.parse(product.created_at) > lastSentMs)
        .slice(0, 4);
      const periodicDue = !lastSentMs || now.getTime() - lastSentMs >= CAMPAIGN_INTERVAL_MS;
      if (!newProducts.length && !periodicDue) continue;

      const featuredProducts = newProducts.length ? newProducts : products.slice(0, 4);
      const unsubscribeUrl = `${siteBase}/api/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribe_token)}`;
      const subject = newProducts.length
        ? 'Nouveautés Pyja Magic à découvrir'
        : 'Les nouvelles de Pyja Magic';
      const productText = featuredProducts
        .map((product) => `- ${product.name} — ${Number(product.price).toLocaleString('fr-FR')} DA`)
        .join('\n');
      const productHtml = featuredProducts.map((product) => {
        const imageUrl = Array.isArray(product.images) ? product.images[0] : '';
        const image = imageUrl && /^https:\/\//i.test(imageUrl)
          ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.name)}" style="width:100%;max-width:220px;border-radius:8px">`
          : '';
        return `<li style="margin:0 0 20px">${image}<p><strong>${escapeHtml(product.name)}</strong> — ${Number(product.price).toLocaleString('fr-FR')} DA</p><p>${escapeHtml(product.short_description || product.description || '')}</p></li>`;
      }).join('');
      const emailResult = await sendBrevoEmail({
        to: subscriber.email,
        subject,
        textContent: `Bonjour, voici les nouveautés Pyja Magic :\n\n${productText}\n\nVoir la collection : ${siteBase}/catalogue\nSe désinscrire : ${unsubscribeUrl}`,
        htmlContent: `<div style="font-family:Arial,sans-serif;color:#2D2024;max-width:600px;margin:auto;padding:24px"><h1 style="color:#BE395D">${newProducts.length ? 'Nouveautés' : 'La sélection Pyja Magic'}</h1><p>Bonjour, découvrez notre sélection du moment.</p><ul style="padding-left:20px">${productHtml}</ul><p><a href="${siteBase}/catalogue" style="display:inline-block;background:#BE395D;color:white;padding:12px 18px;text-decoration:none;border-radius:6px">Voir la collection</a></p><p style="font-size:12px;color:#70585F"><a href="${escapeHtml(unsubscribeUrl)}">Se désinscrire de la newsletter</a></p></div>`,
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      });

      if (!emailResult.success) {
        failed += 1;
        continue;
      }

      const updateResponse = await fetch(
        `${supabaseUrl}/rest/v1/subscribers?id=eq.${encodeURIComponent(subscriber.id)}`,
        {
          method: 'PATCH',
          headers: { ...headers, Prefer: 'return=minimal' },
          body: JSON.stringify({ marketing_last_sent_at: now.toISOString() }),
        }
      );
      if (!updateResponse.ok) {
        failed += 1;
        console.error('Campaign timestamp update failed:', updateResponse.status);
      } else {
        sent += 1;
      }
    }

    return res.status(200).json({ success: failed === 0, sent, failed });
  } catch (error) {
    console.error('Marketing cron failed:', error instanceof Error ? error.message : 'unknown error');
    return res.status(500).json({ success: false, message: 'Erreur interne de campagne.' });
  }
}