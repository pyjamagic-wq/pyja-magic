import { Order } from '../../types';

const STORE_MAIL = 'pyjamagic@gmail.com';
const FORMSUBMIT = `https://formsubmit.co/ajax/${STORE_MAIL}`;

async function postMail(payload: Record<string, string>): Promise<boolean> {
  try {
    const res = await fetch(FORMSUBMIT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        _template: 'table',
        _captcha: 'false',
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Inscription newsletter → notifie la boutique + message auto à la cliente */
export async function sendNewsletterWelcome(email: string): Promise<boolean> {
  return postMail({
    email,
    _replyto: email,
    _subject: 'Nouvelle inscription newsletter — Pyja Magic',
    message: `Nouvelle inscrite à la newsletter : ${email}`,
    _autoresponse:
      `Bienvenue chez Pyja Magic 💗\n\n` +
      `Merci de votre inscription ! Vous recevrez désormais nos nouvelles collections et offres exclusives.\n\n` +
      `Après votre premier achat, vous recevrez aussi le code promo BIENVENU (-5%) par email.\n\n` +
      `À très bientôt,\nL'équipe Pyja Magic\n${STORE_MAIL}`,
  });
}

/** Après commande → membre + code BIENVENU -5% */
export async function sendWelcomePromoAfterOrder(
  email: string,
  firstName: string,
  orderNumber: string
): Promise<boolean> {
  return postMail({
    email,
    _replyto: email,
    _subject: `Bienvenue membre Pyja Magic — code BIENVENU (-5%)`,
    message:
      `Nouvelle cliente membre après commande ${orderNumber}\n` +
      `Nom : ${firstName}\nEmail : ${email}\nCode envoyé : BIENVENU (-5%)`,
    _autoresponse:
      `Bonjour ${firstName},\n\n` +
      `Merci pour votre commande ${orderNumber} chez Pyja Magic 💗\n\n` +
      `Vous êtes maintenant membre de notre cercle !\n` +
      `Voici votre code promo exclusif pour une prochaine commande :\n\n` +
      `👉 BIENVENU  (−5%)\n\n` +
      `Utilisez-le au checkout. Vous recevrez aussi de temps en temps nos nouveautés et rappels depuis ${STORE_MAIL}.\n\n` +
      `Avec amour,\nPyja Magic`,
  });
}

/** Notification admin pour nouvelle commande */
export async function sendOrderNotificationToAdmin(order: Order): Promise<boolean> {
  const itemsList = (order.items || [])
    .map((i) => `- ${i.quantity}x ${i.productName} (${i.sizeName || ''}) — ${i.price.toLocaleString('fr-FR')} DA`)
    .join('\n');

  return postMail({
    email: STORE_MAIL,
    _replyto: STORE_MAIL,
    _subject: `Nouvelle commande ${order.orderNumber} — Pyja Magic`,
    message:
      `Nouvelle commande ${order.orderNumber}\n` +
      `Cliente: ${order.customerFirstName} ${order.customerLastName}\n` +
      `Tel: ${order.phone}\n` +
      `Wilaya: ${order.wilayaName} — ${order.commune}\n` +
      `Total: ${order.total.toLocaleString('fr-FR')} DA\n\n` +
      `Articles:\n${itemsList}\n\n` +
      `Notes: ${order.notes || '—'}`,
  });
}

/** Confirmation client après commande */
export async function sendOrderConfirmationToClient(order: Order): Promise<boolean> {
  if (!order.email) return false;

  const itemsList = (order.items || [])
    .map((i) => `- ${i.quantity}x ${i.productName} (${i.sizeName || ''})`)
    .join('\n');

  return postMail({
    email: order.email,
    _replyto: STORE_MAIL,
    _subject: `Confirmation de commande ${order.orderNumber} — Pyja Magic`,
    message:
      `Bonjour ${order.customerFirstName},\n\n` +
      `Merci pour votre commande ${order.orderNumber}. Nous avons bien reçu votre commande et elle est en cours de traitement.\n\n` +
      `Résumé de la commande :\n${itemsList}\n\n` +
      `Total à payer: ${order.total.toLocaleString('fr-FR')} DA\n` +
      `Mode livraison: ${order.deliveryType} — ${order.wilayaName}\n` +
      `Suivi transporteur: ${order.yalidineTrackingNumber || 'Bientôt disponible'}\n\n` +
      `Nous vous recontacterons si besoin.\n\n` +
      `Avec amour,\nL'équipe Pyja Magic\n${STORE_MAIL}`,
  });
}

/** Notification client pour tout changement de statut */
export async function sendOrderStatusUpdateToClient(order: Order, statusLabel: string): Promise<boolean> {
  if (!order.email) return false;

  return postMail({
    email: order.email,
    _replyto: STORE_MAIL,
    _subject: `Mise à jour commande ${order.orderNumber} — ${statusLabel}`,
    message:
      `Bonjour ${order.customerFirstName},\n\n` +
      `Votre commande ${order.orderNumber} a changé de statut : ${statusLabel}.\n\n` +
      `Vous pouvez suivre l'état depuis notre site ou répondre à cet email pour toute question.\n\n` +
      `Avec amour,\nL'équipe Pyja Magic\n${STORE_MAIL}`,
  });
}
