import { escapeHtml, getServerEnv, sendBrevoEmail, supabaseServiceFetch } from '../src/server/brevo.js';

interface ApiRequest {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  setHeader(name: string, value: string): void;
  status(code: number): ApiResponse;
  json(body: unknown): void;
}

interface EmailItem {
  quantity: number;
  productName: string;
  sizeName?: string;
  price?: number;
}

interface EmailOrder {
  orderNumber: string;
  customerFirstName: string;
  customerLastName: string;
  phone?: string;
  email?: string;
  wilayaName?: string;
  commune?: string;
  address?: string;
  notes?: string;
  deliveryType?: string;
  total?: number;
  status?: string;
  items?: EmailItem[];
  yalidineTrackingNumber?: string;
}

type EmailRequest =
  | { action: 'newsletter-signup'; email: string; consent: boolean }
  | { action: 'newsletter-welcome'; email: string; unsubscribeToken: string }
  | { action: 'order-member'; email: string; firstName: string; orderNumber: string }
  | { action: 'purchase-reward'; email: string; firstName: string; orderNumber: string; couponCode: string }
  | { action: 'order-admin'; order: EmailOrder }
  | { action: 'order-confirmation'; order: EmailOrder }
  | { action: 'order-status'; order: EmailOrder; statusLabel: string };

const validEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const requestCounts = new Map<string, { count: number; expiresAt: number }>();

const ORDER_STATUS_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  nouvelle: 'En attente',
  acceptee: 'Acceptée',
  confirmee: 'Acceptée',
  preparation: 'En cours de préparation',
  arriver_yalidine: 'Arrivé chez Yalidine',
  expediee: 'Arrivé chez Yalidine',
  en_livraison: 'En cours de livraison',
  livree: 'Livrée & encaissée',
  refusee: 'Refusée',
  annulee: 'Annulée',
  retour: 'Retour colis',
};

function withinRateLimit(req: ApiRequest): boolean {
  const ip = requestHeader(req, 'x-forwarded-for').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const current = requestCounts.get(ip);
  if (!current || current.expiresAt <= now) {
    requestCounts.set(ip, { count: 1, expiresAt: now + 60_000 });
    return true;
  }
  if (current.count >= 20) return false;
  current.count += 1;
  return true;
}

function page(title: string, content: string): string {
  return `<div style="font-family:Arial,sans-serif;color:#2D2024;max-width:600px;margin:auto;padding:24px"><h1 style="color:#BE395D">${escapeHtml(title)}</h1>${content}<p style="margin-top:32px;color:#70585F">Avec amour,<br>Pyja Magic</p></div>`;
}

function requestHeader(req: ApiRequest, name: string): string {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] || '' : value || '';
}

function buildEmail(request: EmailRequest, req: ApiRequest): { to: string; subject: string; text: string; html: string } | null {
  if (request.action === 'newsletter-welcome') {
    const unsubscribeUrl = `https://${requestHeader(req, 'x-forwarded-host') || requestHeader(req, 'host')}/api/unsubscribe?token=${encodeURIComponent(request.unsubscribeToken)}`;
    return {
      to: request.email,
      subject: 'Bienvenue chez Pyja Magic',
      text: `Merci pour votre inscription à la newsletter Pyja Magic. Vous recevrez nos nouveautés et offres. Désinscription : ${unsubscribeUrl}`,
      html: page('Bienvenue chez Pyja Magic', `<p>Merci pour votre inscription. Vous recevrez nos nouveautés et offres par email.</p><p>Après votre premier achat, vous recevrez votre code personnel de 5%, utilisable une seule fois.</p><p style="font-size:12px;color:#70585F"><a href="${escapeHtml(unsubscribeUrl)}">Se désinscrire de la newsletter</a></p>`),
    };
  }

  if (request.action === 'purchase-reward') {
    return {
      to: request.email,
      subject: 'Votre code personnel Pyja Magic (-5%)',
      text: `Bonjour ${request.firstName}, merci pour votre commande ${request.orderNumber}. Votre code personnel ${request.couponCode} vous donne 5% de réduction, utilisable une fois avec cette adresse email.`,
      html: page('Votre code personnel de fidélité', `<p>Bonjour ${escapeHtml(request.firstName)}, merci pour votre commande <strong>${escapeHtml(request.orderNumber)}</strong>.</p><p>Votre code <strong style="color:#BE395D;font-size:20px">${escapeHtml(request.couponCode)}</strong> donne 5% de réduction, utilisable une seule fois avec cette adresse email.</p>`),
    };
  }

  if (request.action !== 'order-admin' && request.action !== 'order-confirmation' && request.action !== 'order-status') {
    return null;
  }

  const order = request.order;
  const orderEmail = order.email || '';
  const itemsText = (order.items || []).map((item) => `${item.quantity}x ${item.productName}${item.sizeName ? ` (${item.sizeName})` : ''}`).join('\n');
  const itemsHtml = (order.items || []).map((item) => `<li>${escapeHtml(item.quantity)}x ${escapeHtml(item.productName)}${item.sizeName ? ` (${escapeHtml(item.sizeName)})` : ''}</li>`).join('');

  if (request.action === 'order-admin') {
    const to = getServerEnv('STORE_EMAIL') || 'pyjamagic@gmail.com';
    return {
      to,
      subject: `Nouvelle commande ${order.orderNumber} — Pyja Magic`,
      text: `Commande ${order.orderNumber}\nCliente: ${order.customerFirstName} ${order.customerLastName}\nEmail: ${orderEmail}\nTéléphone: ${order.phone || ''}\nDestination: ${order.wilayaName || ''} — ${order.commune || ''}\nTotal: ${Number(order.total || 0).toLocaleString('fr-FR')} DA\n\nArticles:\n${itemsText}`,
      html: page(`Nouvelle commande ${order.orderNumber}`, `<p>Cliente : ${escapeHtml(order.customerFirstName)} ${escapeHtml(order.customerLastName)}</p><p>Email : ${escapeHtml(orderEmail)}<br>Téléphone : ${escapeHtml(order.phone)}</p><p>Destination : ${escapeHtml(order.wilayaName)} — ${escapeHtml(order.commune)}</p><p>Total : <strong>${Number(order.total || 0).toLocaleString('fr-FR')} DA</strong></p><ul>${itemsHtml}</ul>`),
    };
  }

  if (!validEmail(orderEmail)) return null;

  if (request.action === 'order-confirmation') {
    return {
      to: orderEmail,
      subject: `Confirmation de commande ${order.orderNumber} — Pyja Magic`,
      text: `Bonjour ${order.customerFirstName}, votre commande ${order.orderNumber} est enregistrée. Gardez ce numéro pour suivre votre colis sur le site.\n\nArticles:\n${itemsText}\n\nTotal à payer: ${Number(order.total || 0).toLocaleString('fr-FR')} DA`,
      html: page('Votre commande est confirmée', `<p>Bonjour ${escapeHtml(order.customerFirstName)}, votre commande <strong>${escapeHtml(order.orderNumber)}</strong> est enregistrée.</p><p>Gardez ce numéro pour suivre votre colis sur la page Suivi du site.</p><ul>${itemsHtml}</ul><p>Total à payer : <strong>${Number(order.total || 0).toLocaleString('fr-FR')} DA</strong></p>`),
    };
  }

  const tracking = order.yalidineTrackingNumber ? ` Numéro Yalidine : ${order.yalidineTrackingNumber}.` : '';
  const statusLabel = ORDER_STATUS_LABELS[order.status || ''] ||
    (request.action === 'order-status' ? request.statusLabel : 'Mise à jour');
  return {
    to: orderEmail,
    subject: `Suivi de commande ${order.orderNumber} — ${statusLabel}`,
    text: `Bonjour ${order.customerFirstName}, le statut de votre commande ${order.orderNumber} est maintenant : ${statusLabel}.${tracking}`,
    html: page(`Votre commande évolue : ${statusLabel}`, `<p>Bonjour ${escapeHtml(order.customerFirstName)},</p><p>Le statut de votre commande <strong>${escapeHtml(order.orderNumber)}</strong> est maintenant : <strong>${escapeHtml(statusLabel)}</strong>.</p>${order.yalidineTrackingNumber ? `<p>Numéro Yalidine : <strong>${escapeHtml(order.yalidineTrackingNumber)}</strong></p>` : ''}<p>Vous pouvez consulter le suivi sur notre site avec votre numéro de commande.</p>`),
  };
}

async function verifyEmailEvent(request: EmailRequest): Promise<boolean> {
  if (request.action === 'newsletter-welcome') {
    const query = new URLSearchParams({
      select: 'id',
      email: `eq.${request.email}`,
      unsubscribe_token: `eq.${request.unsubscribeToken}`,
      marketing_consent: 'eq.true',
      unsubscribed_at: 'is.null',
      limit: '1',
    });
    const response = await supabaseServiceFetch(`subscribers?${query}`);
    if (!response.ok) return false;
    const rows = (await response.json()) as unknown[];
    return rows.length === 1;
  }

  if (request.action === 'purchase-reward') {
    const query = new URLSearchParams({
      select: 'code',
      code: `eq.${request.couponCode}`,
      customer_email: `eq.${request.email.toLowerCase()}`,
      issued_order_number: `eq.${request.orderNumber}`,
      limit: '1',
    });
    const response = await supabaseServiceFetch(`coupons?${query}`);
    if (!response.ok) return false;
    const rows = (await response.json()) as unknown[];
    return rows.length === 1;
  }

  if (request.action === 'newsletter-signup' || request.action === 'order-member') return false;

  const order = request.order;
  const query = new URLSearchParams({
    select: 'order_number,email,status,yalidine_tracking_number',
    order_number: `eq.${order.orderNumber}`,
    limit: '1',
  });
  const response = await supabaseServiceFetch(`orders?${query}`);
  if (!response.ok) return false;
  const rows = (await response.json()) as Array<{ order_number: string; email: string | null; status: string; yalidine_tracking_number: string | null }>;
  const stored = rows[0];
  if (!stored) return false;
  if (request.action !== 'order-admin' && stored.email?.toLowerCase() !== order.email?.toLowerCase()) return false;
  if (request.action === 'order-status') {
    if (stored.status !== order.status) return false;
    request.statusLabel = ORDER_STATUS_LABELS[stored.status] || stored.status;
    order.yalidineTrackingNumber = stored.yalidine_tracking_number || undefined;
  }
  return true;
}

async function saveNewsletterSignup(email: string): Promise<{ token?: string; alreadySubscribed?: boolean; error?: string }> {
  const query = new URLSearchParams({
    select: 'id,is_member,source,unsubscribe_token,marketing_consent,unsubscribed_at,created_at',
    email: `eq.${email}`,
    limit: '1',
  });
  const read = await supabaseServiceFetch(`subscribers?${query}`);
  if (!read.ok) {
    const error = read.status === 401
      ? 'Supabase refuse la clé serveur (401). Dans Vercel, vérifiez SUPABASE_SERVICE_ROLE_KEY : elle doit être la clé service_role du même projet que SUPABASE_URL, pas VITE_SUPABASE_ANON_KEY.'
      : `Lecture abonnés refusée (${read.status}).`;
    return { error };
  }
  const rows = (await read.json()) as Array<{
    id: string;
    is_member: boolean;
    source: 'newsletter' | 'order';
    unsubscribe_token: string | null;
    marketing_consent: boolean;
    unsubscribed_at: string | null;
    created_at: string;
  }>;
  const existing = rows[0];
  if (existing?.marketing_consent && !existing.unsubscribed_at) {
    return { alreadySubscribed: true };
  }

  const token = globalThis.crypto.randomUUID();
  const now = new Date().toISOString();
  const response = await supabaseServiceFetch('subscribers?on_conflict=email', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      id: existing?.id || globalThis.crypto.randomUUID(),
      email,
      source: 'newsletter',
      is_member: existing?.is_member || false,
      marketing_consent: true,
      unsubscribe_token: token,
      marketing_last_sent_at: now,
      unsubscribed_at: null,
      created_at: existing?.created_at || now,
    }),
  });
  if (!response.ok) return { error: `Inscription Supabase refusée (${response.status}).` };
  return { token };
}

async function saveOrderMember(email: string, orderNumber: string): Promise<boolean> {
  const orderQuery = new URLSearchParams({
    select: 'order_number,email',
    order_number: `eq.${orderNumber}`,
    limit: '1',
  });
  const orderResponse = await supabaseServiceFetch(`orders?${orderQuery}`);
  if (!orderResponse.ok) return false;
  const orders = (await orderResponse.json()) as Array<{ order_number: string; email: string | null }>;
  if (!orders[0] || orders[0].email?.toLowerCase() !== email.toLowerCase()) return false;

  const subscriberQuery = new URLSearchParams({
    select: 'id,is_member,source,marketing_consent,unsubscribe_token,marketing_last_sent_at,unsubscribed_at,created_at',
    email: `eq.${email}`,
    limit: '1',
  });
  const subscriberResponse = await supabaseServiceFetch(`subscribers?${subscriberQuery}`);
  if (!subscriberResponse.ok) return false;
  const subscribers = (await subscriberResponse.json()) as Array<{
    id: string;
    is_member: boolean;
    source: 'newsletter' | 'order';
    marketing_consent: boolean;
    unsubscribe_token: string | null;
    marketing_last_sent_at: string | null;
    unsubscribed_at: string | null;
    created_at: string;
  }>;
  const existing = subscribers[0];

  const response = await supabaseServiceFetch('subscribers?on_conflict=email', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      id: existing?.id || globalThis.crypto.randomUUID(),
      email,
      source: existing?.source === 'newsletter' ? 'newsletter' : 'order',
      is_member: true,
      marketing_consent: existing?.marketing_consent || false,
      unsubscribe_token: existing?.unsubscribe_token || globalThis.crypto.randomUUID(),
      marketing_last_sent_at: existing?.marketing_last_sent_at || null,
      unsubscribed_at: existing?.unsubscribed_at || null,
      created_at: existing?.created_at || new Date().toISOString(),
    }),
  });
  return response.ok;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Méthode non autorisée.' });

  const origin = requestHeader(req, 'origin');
  const host = requestHeader(req, 'x-forwarded-host') || requestHeader(req, 'host');
  if (!origin || !host) return res.status(403).json({ success: false, message: 'Origine non autorisée.' });
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return res.status(403).json({ success: false, message: 'Origine non autorisée.' });
    } catch {
      return res.status(403).json({ success: false, message: 'Origine non autorisée.' });
    }
  }
  if (!withinRateLimit(req)) return res.status(429).json({ success: false, message: 'Trop de demandes. Réessayez dans une minute.' });

  const body = req.body as Partial<EmailRequest> | undefined;
  if (!body || typeof body !== 'object') return res.status(400).json({ success: false, message: 'Requête invalide.' });

  try {
    let emailRequest = body as EmailRequest;
    let newsletterSignup = false;
    if (emailRequest.action === 'newsletter-signup') {
      if (emailRequest.consent !== true) {
        return res.status(400).json({ success: false, message: 'Le consentement à la newsletter est obligatoire.' });
      }
      newsletterSignup = true;
      const email = emailRequest.email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'Adresse email invalide.' });
      }
      const signup = await saveNewsletterSignup(email);
      if (signup.error) return res.status(502).json({ success: false, message: signup.error });
      if (signup.alreadySubscribed) {
        return res.status(200).json({ success: true, emailSent: false, message: 'Déjà inscrite.' });
      }
      emailRequest = { action: 'newsletter-welcome', email, unsubscribeToken: signup.token! };
    }
    if (emailRequest.action === 'order-member') {
      const saved = await saveOrderMember(emailRequest.email.trim().toLowerCase(), emailRequest.orderNumber);
      return res.status(saved ? 200 : 403).json({ success: saved, message: saved ? undefined : 'Commande non vérifiée.' });
    }
    if (!(await verifyEmailEvent(emailRequest))) {
      return res.status(403).json({ success: false, message: 'Événement email non confirmé dans Supabase.' });
    }
    const message = buildEmail(emailRequest, req);
    if (!message || !validEmail(message.to)) {
      return res.status(400).json({ success: false, message: 'Adresse email ou données de message invalides.' });
    }

    const result = await sendBrevoEmail({
      to: message.to,
      subject: message.subject,
      textContent: message.text,
      htmlContent: message.html,
    });
    if (newsletterSignup) {
      return res.status(200).json({
        success: true,
        emailSent: result.success,
        message: result.success ? 'Inscription confirmée.' : result.message,
      });
    }
    return res.status(result.success ? 200 : 502).json(result);
  } catch (err: unknown) {
    console.error('Email endpoint error:', err instanceof Error ? err.message : 'unknown error');
    return res.status(500).json({ success: false, message: 'Erreur interne lors de la préparation de l’email.' });
  }
}