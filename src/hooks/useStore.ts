import { useState, useEffect } from 'react';
import { store } from '../services/storage/store';
import { Product, Order, Wilaya, Coupon, Review, StoreSettings, CartItem, InventoryMovement } from '../types';

export function useStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  return {
    products: store.getProducts(),
    orders: store.getOrders(),
    wilayas: store.getWilayas(),
    activeWilayas: store.getActiveWilayas(),
    coupons: store.getCoupons(),
    reviews: store.getReviews(),
    approvedReviews: store.getApprovedReviews(),
    settings: store.getSettings(),
    cart: store.getCart(),
    wishlist: store.getWishlist(),
    recentlyViewed: store.getRecentlyViewed(),
    movements: store.getMovements(),

    // Methods
    getProductById: (id: string) => store.getProductById(id),
    getOrderByNumber: (orderNumber: string) => store.getOrderByNumber(orderNumber),
    addToCart: (item: CartItem) => store.addToCart(item),
    updateCartQuantity: (variantId: string, qty: number) => store.updateCartQuantity(variantId, qty),
    removeFromCart: (variantId: string) => store.removeFromCart(variantId),
    clearCart: () => store.clearCart(),
    toggleWishlist: (productId: string) => store.toggleWishlist(productId),
    recordRecentlyViewed: (productId: string) => store.recordRecentlyViewed(productId),
    validateCoupon: (code: string, subtotal: number) => store.validateCoupon(code, subtotal),
    placeOrder: (data: Parameters<typeof store.placeOrder>[0]) => store.placeOrder(data),
    updateOrderStatus: (orderNumber: string, status: any, author?: string, desc?: string) =>
      store.updateOrderStatus(orderNumber, status, author, desc),
    setManualTracking: (orderNumber: string, trackingNumber: string, note?: string) =>
      store.setManualTracking(orderNumber, trackingNumber, note),
    createYalidineShipment: (orderNumber: string) => store.createYalidineShipmentForOrder(orderNumber),
    syncYalidineStatus: (orderNumber: string) => store.syncYalidineStatus(orderNumber),
    adjustStock: (variantId: string, qty: number, type: any, reason: string, admin?: string) =>
      store.adjustStock(variantId, qty, type, reason, admin),
    saveProduct: (product: Product) => store.saveProduct(product),
    deleteProduct: (productId: string) => store.deleteProduct(productId),
    clearAllProducts: () => store.clearAllProducts(),
    syncProductToSupabase: (product: Product) => store.syncProductToSupabase(product),
    loadProductsFromSupabase: () => store.loadProductsFromSupabase(),
    updateWilayaFee: (id: number, fee: number, stopDesk?: number, active?: boolean) =>
      store.updateWilayaFee(id, fee, stopDesk, active),
    saveCoupon: (coupon: Coupon) => store.saveCoupon(coupon),
    deleteCoupon: (id: string) => store.deleteCoupon(id),
    addReview: (review: Omit<Review, 'id' | 'createdAt' | 'status'>) => store.addReview(review),
    updateReviewStatus: (id: string, st: any) => store.updateReviewStatus(id, st),
    deleteReview: (id: string) => store.deleteReview(id),
    updateSettings: (s: Partial<StoreSettings>) => store.updateSettings(s),
    syncSettingsToSupabase: () => store.syncSettingsToSupabase(),
    subscribeNewsletter: (email: string) => store.subscribeNewsletter(email),
    subscribers: store.getSubscribers(),
    resetToDefaultData: () => store.resetToDefaultData(),
  };
}
