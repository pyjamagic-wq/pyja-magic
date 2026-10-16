type RuntimeEnv = typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};

export function getServerEnv(name: string): string {
  return (globalThis as RuntimeEnv).process?.env?.[name] || '';
}

export function getSupabaseServerConfig(): { url: string; serviceKey: string } | null {
  const url = (getServerEnv('SUPABASE_URL') || 'https://husnrgwesumshcyiukdt.supabase.co').replace(/\/$/, '');
  const serviceKey = getServerEnv('SUPABASE_SERVICE_ROLE_KEY');
  return serviceKey ? { url, serviceKey } : null;
}

export async function supabaseServiceFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const config = getSupabaseServerConfig();
  if (!config) throw new Error('SUPABASE_SERVICE_ROLE_KEY manquante dans Vercel.');
  const headers = new Headers(init.headers);
  headers.set('apikey', config.serviceKey);
  headers.set('Authorization', `Bearer ${config.serviceKey}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return fetch(`${config.url}/rest/v1/${path.replace(/^\//, '')}`, { ...init, headers });
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character);
}

export interface BrevoMessage {
  to: string;
  subject: string;
  textContent: string;
  htmlContent: string;
  headers?: Record<string, string>;
}

export async function sendBrevoEmail(message: BrevoMessage): Promise<{ success: boolean; message?: string }> {
  const apiKey = getServerEnv('BREVO_API_KEY');
  if (!apiKey) return { success: false, message: 'BREVO_API_KEY manquante dans Vercel.' };

  const senderEmail = getServerEnv('BREVO_SENDER_EMAIL') || 'pyjamagic@gmail.com';
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Pyja Magic', email: senderEmail },
        to: [{ email: message.to }],
        replyTo: { email: senderEmail, name: 'Pyja Magic' },
        subject: message.subject,
        textContent: message.textContent,
        htmlContent: message.htmlContent,
        headers: message.headers,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error('Brevo rejected email:', response.status, details.slice(0, 500));
      return { success: false, message: `Brevo a refusé l’envoi (${response.status}). Vérifiez la clé API et l’expéditeur vérifié.` };
    }
    return { success: true };
  } catch (error) {
    console.error('Brevo request failed:', error instanceof Error ? error.message : 'unknown error');
    return { success: false, message: 'Impossible de contacter le service email.' };
  }
}