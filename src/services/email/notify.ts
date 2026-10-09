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
