import { Product } from '../types';

/** Retourne la galerie à afficher pour une couleur (ou les images générales). */
export function getImagesForColor(product: Product, colorId?: string | null): string[] {
  if (colorId && product.colorImages?.[colorId]?.length) {
    return product.colorImages[colorId];
  }

  if (colorId) {
    const variantImg = product.variants.find((v) => v.colorId === colorId && v.image)?.image;
    if (variantImg) {
      const rest = product.images.filter((img) => img !== variantImg);
      return [variantImg, ...rest];
    }
  }

  return product.images?.length ? product.images : [];
}

/** Première image pour une couleur (panier, cartes, etc.). */
export function getPrimaryImageForColor(product: Product, colorId?: string | null): string {
  const imgs = getImagesForColor(product, colorId);
  return imgs[0] || product.images?.[0] || '';
}
