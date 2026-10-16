import { Order } from '../../types';

interface EmailApiResult {
  success: boolean;
  message?: string;
  emailSent?: boolean;
}

async function postEmail(payload: Record<string, unknown>): Promise<EmailApiResult> {
  try {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as EmailApiResult;
    if (!response.ok || !result.success) {
      console.warn('Email non envoyé:', result.message || response.statusText);
    }
    return { ...result, success: response.ok && result.success };
  } catch (error) {
    console.warn('Service email indisponible:', error);
    return { success: false, message: 'Service email indisponible.' };
  }
}

async function sendEmail(payload: Record<string, unknown>): Promise<boolean> {
  return (await postEmail(payload)).success;
}

/** Inscrit l'adresse avec consentement et envoie l'email de bienvenue côté serveur. */
export async function sendNewsletterWelcome(email: string): Promise<EmailApiResult> {
  return postEmail({ action: 'newsletter-signup', email, consent: true });
}

/** Enregistre comme membre une cliente dont la commande a été confirmée. */
export async function registerOrderMember(
  email: string,
  firstName: string,
  orderNumber: string
): Promise<boolean> {
  return sendEmail({ action: 'order-member', email, firstName, orderNumber });
}

/** Envoie le coupon personnel après le premier achat. */
export async function sendWelcomePromoAfterOrder(
  email: string,
  firstName: string,
  orderNumber: string,
  couponCode: string
): Promise<boolean> {
  return sendEmail({ action: 'purchase-reward', email, firstName, orderNumber, couponCode });
}

/** Notification boutique lorsqu'une nouvelle commande est passée. */
export async function sendOrderNotificationToAdmin(order: Order): Promise<boolean> {
  return sendEmail({ action: 'order-admin', order });
}

/** Confirmation client après création d'une commande. */
export async function sendOrderConfirmationToClient(order: Order): Promise<boolean> {
  if (!order.email) return false;
  return sendEmail({ action: 'order-confirmation', order });
}

/** Notification client après changement de statut. */
export async function sendOrderStatusUpdateToClient(order: Order, statusLabel: string): Promise<boolean> {
  if (!order.email) return false;
  return sendEmail({ action: 'order-status', order, statusLabel });
}