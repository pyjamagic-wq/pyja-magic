import { OrderStatus } from '../types';

export function formatPrice(amount: number): string {
  if (isNaN(amount)) return '0 DA';
  return `${amount.toLocaleString('fr-FR')} DA`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('fr-DZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function isValidAlgerianPhone(phone: string): boolean {
  const clean = phone.replace(/[\s\-\.\(\)]/g, '');
  // Algerian numbers: +213 followed by 5/6/7/9 or 0 followed by 5/6/7/9 with 9 digits total (0xxxxxxxxx)
  const regex = /^(0|\+213|00213)(5|6|7|9)\d{8}$/;
  return regex.test(clean);
}

export function getOrderStatusInfo(status: OrderStatus): {
  label: string;
  badgeClass: string;
  dotClass: string;
  stepIndex: number;
} {
  switch (status) {
    case 'en_attente':
    case 'nouvelle':
      return {
        label: 'En attente',
        badgeClass: 'bg-rose-50 text-rose-900 border border-rose-200',
        dotClass: 'bg-rose-500',
        stepIndex: 0,
      };
    case 'acceptee':
    case 'confirmee':
      return {
        label: 'Acceptée',
        badgeClass: 'bg-amber-50 text-amber-900 border border-amber-200',
        dotClass: 'bg-amber-500',
        stepIndex: 1,
      };
    case 'preparation':
      return {
        label: 'En cours de préparation',
        badgeClass: 'bg-purple-50 text-purple-900 border border-purple-200',
        dotClass: 'bg-purple-500',
        stepIndex: 2,
      };
    case 'arriver_yalidine':
    case 'expediee':
      return {
        label: 'Arrivé chez Yalidine',
        badgeClass: 'bg-sky-50 text-sky-900 border border-sky-200',
        dotClass: 'bg-sky-500',
        stepIndex: 3,
      };
    case 'en_livraison':
      return {
        label: 'En cours de livraison',
        badgeClass: 'bg-blue-50 text-blue-900 border border-blue-200',
        dotClass: 'bg-blue-500',
        stepIndex: 4,
      };
    case 'livree':
      return {
        label: 'Livrée & Encaissée',
        badgeClass: 'bg-emerald-50 text-emerald-900 border border-emerald-200',
        dotClass: 'bg-emerald-500',
        stepIndex: 5,
      };
    case 'refusee':
      return {
        label: 'Refusée',
        badgeClass: 'bg-red-50 text-red-900 border border-red-200',
        dotClass: 'bg-red-500',
        stepIndex: -1,
      };
    case 'annulee':
      return {
        label: 'Annulée',
        badgeClass: 'bg-stone-100 text-stone-800 border border-stone-200',
        dotClass: 'bg-stone-500',
        stepIndex: -1,
      };
    case 'retour':
      return {
        label: 'Retour colis',
        badgeClass: 'bg-orange-50 text-orange-900 border border-orange-200',
        dotClass: 'bg-orange-500',
        stepIndex: -1,
      };
    default:
      return {
        label: status,
        badgeClass: 'bg-stone-100 text-stone-800 border border-stone-200',
        dotClass: 'bg-stone-500',
        stepIndex: 0,
      };
  }
}
