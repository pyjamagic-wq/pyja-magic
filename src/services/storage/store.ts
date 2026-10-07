import {
  Product,
  ProductVariant,
  Order,
  OrderStatus,
  Wilaya,
  Coupon,
  Review,
  InventoryMovement,
  StoreSettings,
  CartItem,
  OrderTimelineEvent,
} from '../../types';
import { ALGERIA_WILAYAS } from '../../data/wilayas';
import {
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
  INITIAL_ORDERS,
} from '../../data/initialData';
import { getDeliveryProvider } from '../delivery';
import { getSupabase, isSupabaseConfigured, supabase } from '../supabase/supabaseClient';

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function isUUID(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

const STORAGE_KEYS = {
  PRODUCTS: 'pyjamagic_products_v1',
  ORDERS: 'pyjamagic_orders_v1',
  WILAYAS: 'pyjamagic_wilayas_v1',
  COUPONS: 'pyjamagic_coupons_v1',
  REVIEWS: 'pyjamagic_reviews_v1',
  MOVEMENTS: 'pyjamagic_movements_v1',
  SETTINGS: 'pyjamagic_settings_v1',
  CART: 'pyjamagic_cart_v1',
  WISHLIST: 'pyjamagic_wishlist_v1',
  RECENTLY_VIEWED: 'pyjamagic_recently_viewed_v1',
};

// Safe JSON load/save helpers
function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('LocalStorage save failed', err);
  }
}

class StoreService {
  private products: Product[];
  private orders: Order[];
  private wilayas: Wilaya[];
  private coupons: Coupon[];
  private reviews: Review[];
  private movements: InventoryMovement[];
  private settings: StoreSettings;
  private cart: CartItem[];
  private wishlist: string[]; // product IDs
  private recentlyViewed: string[]; // product IDs
  private listeners: Set<() => void> = new Set();

  constructor() {
    const savedProducts = loadStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    // Check if the saved list contains the default demo products
    const isOnlyDemo =
      savedProducts.length > 0 &&
      savedProducts.every((p) => ['prod-1', 'prod-2', 'prod-3', 'prod-4'].includes(p.id));

    // Per user request: empty demo stock so custom products can be added directly into Supabase
    if (isOnlyDemo || savedProducts.length === 0) {
      this.products = [];
      saveStorage(STORAGE_KEYS.PRODUCTS, []);
    } else {
      this.products = savedProducts;
    }

    this.orders = loadStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    this.wilayas = loadStorage<Wilaya[]>(STORAGE_KEYS.WILAYAS, ALGERIA_WILAYAS);
    this.coupons = loadStorage<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
    this.reviews = loadStorage<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    this.settings = loadStorage<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    if (!this.settings.supabaseUrl) {
      this.settings.supabaseUrl = INITIAL_SETTINGS.supabaseUrl;
    }
    if (!this.settings.supabaseAnonKey) {
      this.settings.supabaseAnonKey = INITIAL_SETTINGS.supabaseAnonKey;
    }
    saveStorage(STORAGE_KEYS.SETTINGS, this.settings);

    setTimeout(() => {
      this.loadProductsFromSupabase().catch(() => {});
    }, 300);
    this.cart = loadStorage<CartItem[]>(STORAGE_KEYS.CART, []);
    this.wishlist = loadStorage<string[]>(STORAGE_KEYS.WISHLIST, []);
    this.recentlyViewed = loadStorage<string[]>(STORAGE_KEYS.RECENTLY_VIEWED, []);

    const defaultMovements: InventoryMovement[] = [];
    this.movements = loadStorage<InventoryMovement[]>(STORAGE_KEYS.MOVEMENTS, defaultMovements);

    // Initial check with Supabase if configured
    if (isSupabaseConfigured) {
      this.syncWithSupabase();
    }
  }

  // Reactive subscription
  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  private async syncWithSupabase() {
    const client = getSupabase();
    if (!client) return;
    try {
      await this.loadProductsFromSupabase();
    } catch (err) {
      console.warn('Supabase fetch notice:', err);
    }
  }

  // --- GETTERS ---
  getProducts(): Product[] {
    return this.products;
  }

  getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id || p.slug === id);
  }

  getOrders(): Order[] {
    return this.orders;
  }

  getOrderByNumber(orderNumber: string): Order | undefined {
    const clean = orderNumber.trim().toUpperCase();
    return this.orders.find((o) => o.orderNumber.toUpperCase() === clean);
  }

  getWilayas(): Wilaya[] {
    return this.wilayas;
  }

  getActiveWilayas(): Wilaya[] {
    return this.wilayas.filter((w) => w.isActive);
  }

  getCoupons(): Coupon[] {
    return this.coupons;
  }

  getReviews(productId?: string): Review[] {
    if (productId) {
      return this.reviews.filter((r) => r.productId === productId);
    }
    return this.reviews;
  }

  getApprovedReviews(productId?: string): Review[] {
    const approved = this.reviews.filter((r) => r.status === 'approuve');
    if (productId) {
      return approved.filter((r) => r.productId === productId);
    }
    return approved;
  }

  getMovements(): InventoryMovement[] {
    return this.movements;
  }

  getSettings(): StoreSettings {
    return this.settings;
  }

  getCart(): CartItem[] {
    return this.cart;
  }

  getWishlist(): string[] {
    return this.wishlist;
  }

  getRecentlyViewed(): string[] {
    return this.recentlyViewed;
  }

  // --- CART OPERATIONS ---
  addToCart(item: CartItem): { success: boolean; message?: string } {
    // Check variant stock
    const product = this.getProductById(item.productId);
    if (!product) return { success: false, message: 'Produit introuvable.' };

    const variant = product.variants.find((v) => v.id === item.variantId);
    if (!variant) return { success: false, message: 'Variante introuvable.' };

    const existingIndex = this.cart.findIndex((c) => c.variantId === item.variantId);
    const currentQtyInCart = existingIndex > -1 ? this.cart[existingIndex].quantity : 0;
    const requestedTotal = currentQtyInCart + item.quantity;

    if (requestedTotal > variant.stockQuantity) {
      return {
        success: false,
        message: `Stock insuffisant pour cette taille/couleur.`,
      };
    }

    const location = item.location || variant.location || product.location || 'Rayon Stock';

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += item.quantity;
      if (!this.cart[existingIndex].location) {
        this.cart[existingIndex].location = location;
      }
    } else {
      this.cart.push({ ...item, location });
    }

    saveStorage(STORAGE_KEYS.CART, this.cart);
    this.notify();
    return { success: true };
  }

  updateCartQuantity(variantId: string, quantity: number): boolean {
    const index = this.cart.findIndex((c) => c.variantId === variantId);
    if (index === -1) return false;

    if (quantity <= 0) {
      this.removeFromCart(variantId);
      return true;
    }

    // Check available stock
    const item = this.cart[index];
    const product = this.getProductById(item.productId);
    const variant = product?.variants.find((v) => v.id === variantId);

    if (variant && quantity > variant.stockQuantity) {
      this.cart[index].quantity = variant.stockQuantity;
      saveStorage(STORAGE_KEYS.CART, this.cart);
      this.notify();
      return false;
    }

    this.cart[index].quantity = quantity;
    saveStorage(STORAGE_KEYS.CART, this.cart);
    this.notify();
    return true;
  }

  removeFromCart(variantId: string): void {
    this.cart = this.cart.filter((c) => c.variantId !== variantId);
    saveStorage(STORAGE_KEYS.CART, this.cart);
    this.notify();
  }

  clearCart(): void {
    this.cart = [];
    saveStorage(STORAGE_KEYS.CART, this.cart);
    this.notify();
  }

  // --- WISHLIST OPERATIONS ---
  toggleWishlist(productId: string): boolean {
    const exists = this.wishlist.includes(productId);
    if (exists) {
      this.wishlist = this.wishlist.filter((id) => id !== productId);
    } else {
      this.wishlist.push(productId);
    }
    saveStorage(STORAGE_KEYS.WISHLIST, this.wishlist);
    this.notify();
    return !exists;
  }

  // --- RECENTLY VIEWED ---
  recordRecentlyViewed(productId: string): void {
    this.recentlyViewed = [
      productId,
      ...this.recentlyViewed.filter((id) => id !== productId),
    ].slice(0, 10);
    saveStorage(STORAGE_KEYS.RECENTLY_VIEWED, this.recentlyViewed);
    this.notify();
  }

  // --- COUPON VALIDATION ---
  validateCoupon(code: string, subtotal: number): { valid: boolean; coupon?: Coupon; discount: number; message: string } {
    const clean = code.trim().toUpperCase();
    const coupon = this.coupons.find((c) => c.code.toUpperCase() === clean && c.isActive);

    if (!coupon) {
      return { valid: false, discount: 0, message: 'Code promo invalide ou expiré.' };
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        discount: 0,
        message: `Montant minimum requis de ${coupon.minOrderAmount.toLocaleString('fr-FR')} DA pour utiliser ce code.`,
      };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Math.min(coupon.discountValue, subtotal);
    }

    return {
      valid: true,
      coupon,
      discount,
      message: `Code ${coupon.code} appliqué (-${discount.toLocaleString('fr-FR')} DA) !`,
    };
  }

  // --- ORDER CREATION & ATOMIC STOCK DEDUCTION ---
  async placeOrder(orderData: {
    customerFirstName: string;
    customerLastName: string;
    phone: string;
    email?: string;
    wilayaId: number;
    commune: string;
    address: string;
    notes?: string;
    deliveryType: 'domicile' | 'stopdesk';
    couponCode?: string;
    items: CartItem[];
  }): Promise<{ success: boolean; order?: Order; message?: string }> {
    try {
      if (!orderData.items || orderData.items.length === 0) {
        return { success: false, message: 'Votre panier est vide.' };
      }

      // 1. ATOMIC VALIDATION: verify all stocks before decrementing
      for (const item of orderData.items) {
        const product = this.getProductById(item.productId);
        if (!product) {
          return { success: false, message: `Produit "${item.productName || 'sélectionné'}" introuvable.` };
        }
        const variant = (product.variants || []).find((v) => v.id === item.variantId);
        if (!variant) {
          return { success: false, message: `Variante (${item.sizeName || ''}/${item.colorName || ''}) introuvable.` };
        }
        if (variant.stockQuantity < item.quantity) {
          return {
            success: false,
            message: `Stock insuffisant pour "${item.productName}" en ${item.sizeName} / ${item.colorName}.`,
          };
        }
      }

      // 2. Fetch Wilaya and Delivery Fee
      const wilaya = this.wilayas.find((w) => w.id === orderData.wilayaId) || this.wilayas[0] || ALGERIA_WILAYAS[0];

      const subtotal = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Shipping calculation
      let deliveryFee = orderData.deliveryType === 'stopdesk'
        ? (wilaya.stopDeskFee ?? Math.max(300, (wilaya.deliveryFee || 600) - 200))
        : (wilaya.deliveryFee || 600);

      // Check free shipping threshold if configured
      if (this.settings.freeShippingThreshold > 0 && subtotal >= this.settings.freeShippingThreshold) {
        deliveryFee = 0;
      }

      // 3. Discount calculation
      let discount = 0;
      let validCouponCode = undefined;
      if (orderData.couponCode) {
        const couponCheck = this.validateCoupon(orderData.couponCode, subtotal);
        if (couponCheck.valid) {
          discount = couponCheck.discount;
          validCouponCode = couponCheck.coupon?.code;
          // increment coupon usage
          const cIndex = this.coupons.findIndex((c) => c.code === couponCheck.coupon?.code);
          if (cIndex > -1) {
            this.coupons[cIndex].usageCount += 1;
            saveStorage(STORAGE_KEYS.COUPONS, this.coupons);
          }
        }
      }

      const total = Math.max(0, subtotal - discount + deliveryFee);

      // 4. Generate unique readable order number: e.g. PJM-8K42X9
      const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
      const orderNumber = `PJM-${randomChars}`;

      const now = new Date().toISOString();

      // 5. ATOMICALLY DEDUCT STOCKS & LOG MOVEMENTS
      for (const item of orderData.items) {
        const productIndex = this.products.findIndex((p) => p.id === item.productId);
        if (productIndex > -1 && this.products[productIndex].variants) {
          const variantIndex = this.products[productIndex].variants.findIndex((v) => v.id === item.variantId);
          if (variantIndex > -1) {
            this.products[productIndex].variants[variantIndex].stockQuantity = Math.max(
              0,
              this.products[productIndex].variants[variantIndex].stockQuantity - item.quantity
            );

          // Record stock movement
          const movement: InventoryMovement = {
            id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            productId: item.productId,
            productName: item.productName,
            variantId: item.variantId,
            variantLabel: `${item.colorName} / ${item.sizeName}`,
            quantity: -item.quantity,
            type: 'sortie',
            reason: `Commande client ${orderNumber}`,
            adminName: 'Système Commande',
            createdAt: now,
          };
          this.movements.unshift(movement);
        }
      }
    }
    saveStorage(STORAGE_KEYS.PRODUCTS, this.products);
    saveStorage(STORAGE_KEYS.MOVEMENTS, this.movements);

    // 6. Assemble Order
    const timeline: OrderTimelineEvent[] = [
      {
        id: `tl-${Date.now()}-1`,
        status: 'en_attente',
        label: 'En attente',
        description: `Commande enregistrée sur le site. En attente de confirmation (Total: ${total.toLocaleString('fr-FR')} DA).`,
        timestamp: now,
        author: 'Système',
      },
    ];

    const order: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerFirstName: orderData.customerFirstName.trim(),
      customerLastName: orderData.customerLastName.trim(),
      phone: orderData.phone.trim(),
      email: orderData.email?.trim(),
      wilayaId: wilaya.id,
      wilayaName: wilaya.name,
      commune: orderData.commune.trim(),
      address: orderData.address.trim(),
      notes: orderData.notes?.trim(),
      deliveryType: orderData.deliveryType,
      deliveryFee,
      subtotal,
      discount,
      couponCode: validCouponCode,
      total,
      paymentMethod: 'cod',
      status: 'en_attente',
      items: orderData.items.map((it) => ({
        id: `oi-${Math.random().toString(36).substr(2, 6)}`,
        productId: it.productId,
        variantId: it.variantId,
        productName: it.productName,
        productImage: it.productImage,
        sizeName: it.sizeName,
        colorName: it.colorName,
        price: it.price,
        quantity: it.quantity,
        subtotal: it.price * it.quantity,
        location: it.location || 'Rayon Stock',
      })),
      timeline,
      createdAt: now,
      updatedAt: now,
    };

    this.orders.unshift(order);
    saveStorage(STORAGE_KEYS.ORDERS, this.orders);

    // Clear cart after successful order
    this.clearCart();
    this.notify();

    // If Supabase is connected, replicate to DB in background
    if (isSupabaseConfigured) {
      this.replicateOrderToSupabase(order).catch(console.error);
    }

    return { success: true, order };
    } catch (err: unknown) {
      console.error('placeOrder error:', err);
      const msg = err instanceof Error ? err.message : 'Erreur imprévue lors de la commande.';
      return { success: false, message: msg };
    }
  }

  private async replicateOrderToSupabase(order: Order) {
    const client = getSupabase();
    if (!client) return;
    try {
      await client.from('orders').insert([
        {
          order_number: order.orderNumber,
          customer_first_name: order.customerFirstName,
          customer_last_name: order.customerLastName,
          phone: order.phone,
          email: order.email,
          wilaya_id: order.wilayaId,
          wilaya_name: order.wilayaName,
          commune: order.commune,
          address: order.address,
          notes: order.notes,
          delivery_type: order.deliveryType,
          delivery_fee: order.deliveryFee,
          subtotal: order.subtotal,
          discount: order.discount,
          coupon_code: order.couponCode,
          total: order.total,
          payment_method: order.paymentMethod,
          status: order.status,
        },
      ]);

      // Also insert order items
      if (order.items && order.items.length > 0) {
        // Fetch newly created order id
        const { data: createdOrd } = await client
          .from('orders')
          .select('id')
          .eq('order_number', order.orderNumber)
          .single();

        if (createdOrd?.id) {
          const itemsPayload = order.items.map((it) => ({
            order_id: createdOrd.id,
            product_name: it.productName,
            size_name: it.sizeName,
            color_name: it.colorName,
            price: it.price,
            quantity: it.quantity,
            subtotal: it.subtotal,
            location: it.location || 'Rayon Stock',
          }));

          await client.from('order_items').insert(itemsPayload);
        }
      }
    } catch (err) {
      console.warn('Supabase order insert note:', err);
    }
  }

  // --- ORDER MANAGEMENT (ADMIN) ---
  updateOrderStatus(
    orderNumber: string,
    newStatus: OrderStatus,
    author = 'Admin',
    description?: string
  ): boolean {
    const index = this.orders.findIndex((o) => o.orderNumber === orderNumber);
    if (index === -1) return false;

    const order = this.orders[index];
    const prevStatus = order.status;
    order.status = newStatus;
    order.updatedAt = new Date().toISOString();

    const statusLabels: Record<OrderStatus, string> = {
      en_attente: 'En attente',
      nouvelle: 'En attente',
      acceptee: 'Acceptée',
      confirmee: 'Acceptée',
      preparation: 'En cours de préparation',
      arriver_yalidine: 'Arrivé chez Yalidine',
      expediee: 'Arrivé chez Yalidine',
      en_livraison: 'En cours de livraison',
      livree: 'Livrée & Encaissée',
      refusee: 'Refusée',
      annulee: 'Annulée',
      retour: 'Retour colis',
    };

    const newEvent: OrderTimelineEvent = {
      id: `tl-${Date.now()}`,
      status: newStatus,
      label: statusLabels[newStatus] || newStatus,
      description: description || `Statut modifié de "${statusLabels[prevStatus] || prevStatus}" à "${statusLabels[newStatus]}".`,
      timestamp: new Date().toISOString(),
      author,
    };

    order.timeline.push(newEvent);

    // If order was cancelled or returned, return stock to inventory
    if (newStatus === 'annulee' || newStatus === 'retour') {
      for (const item of order.items) {
        this.adjustStock(
          item.variantId,
          item.quantity,
          'retour',
          `Annulation/Retour de la commande ${order.orderNumber}`,
          author
        );
      }
    }

    saveStorage(STORAGE_KEYS.ORDERS, this.orders);
    this.notify();
    return true;
  }

  // --- MANUAL YALIDINE TRACKING (NO API REQUIRED) ---
  setManualTracking(orderNumber: string, trackingNumber: string, customNote?: string): boolean {
    const index = this.orders.findIndex((o) => o.orderNumber === orderNumber);
    if (index === -1) return false;

    const order = this.orders[index];
    const cleanTracking = trackingNumber.trim().toUpperCase();
    order.yalidineTrackingNumber = cleanTracking;
    order.yalidineStatus = 'Déposé au bureau Yalidine';
    order.status = 'arriver_yalidine';
    order.updatedAt = new Date().toISOString();

    const newEvent: OrderTimelineEvent = {
      id: `tl-${Date.now()}`,
      status: 'arriver_yalidine',
      label: 'Arrivé chez Yalidine',
      description: customNote || `Bordereau papier Yalidine N° ${cleanTracking} saisi. Colis pris en charge.`,
      timestamp: new Date().toISOString(),
      author: 'Admin',
    };

    order.timeline.push(newEvent);
    saveStorage(STORAGE_KEYS.ORDERS, this.orders);
    this.notify();
    return true;
  }

  // --- YALIDINE SHIPMENT CREATION & SYNC ---
  async createYalidineShipmentForOrder(orderNumber: string): Promise<{ success: boolean; trackingNumber?: string; message?: string }> {
    const order = this.getOrderByNumber(orderNumber);
    if (!order) return { success: false, message: 'Commande introuvable.' };

    const provider = getDeliveryProvider(this.settings.yalidineApiKey, this.settings.yalidineApiToken);

    try {
      const result = await provider.createParcel({
        orderNumber: order.orderNumber,
        customerFirstName: order.customerFirstName,
        customerLastName: order.customerLastName,
        phone: order.phone,
        wilayaName: order.wilayaName,
        wilayaCode: String(order.wilayaId),
        commune: order.commune,
        address: order.address,
        deliveryType: order.deliveryType,
        totalToCollect: order.total,
        productDescription: order.items.map((i) => `${i.quantity}x ${i.productName} (${i.sizeName})`).join(', '),
      });

      if (result.success) {
        order.yalidineTrackingNumber = result.trackingNumber;
        order.yalidineStatus = result.courierStatus;
        this.updateOrderStatus(
          orderNumber,
          'expediee',
          'Yalidine',
          `Bordereau Yalidine généré: ${result.trackingNumber}. Remis au transporteur.`
        );
        return { success: true, trackingNumber: result.trackingNumber, message: result.message };
      }

      return { success: false, message: result.message || 'Échec de la génération Yalidine' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur transporteur';
      return { success: false, message: msg };
    }
  }

  async syncYalidineStatus(orderNumber: string): Promise<boolean> {
    const order = this.getOrderByNumber(orderNumber);
    if (!order || !order.yalidineTrackingNumber) return false;

    const provider = getDeliveryProvider(this.settings.yalidineApiKey, this.settings.yalidineApiToken);
    const sync = await provider.syncOrderStatus(order.yalidineTrackingNumber);

    if (sync) {
      order.yalidineStatus = sync.rawStatus;
      if (sync.pyjaMagicStatus !== order.status) {
        this.updateOrderStatus(
          orderNumber,
          sync.pyjaMagicStatus as OrderStatus,
          'Yalidine Sync',
          `Synchronisation automatique transporteur: ${sync.rawStatus}`
        );
      } else {
        saveStorage(STORAGE_KEYS.ORDERS, this.orders);
        this.notify();
      }
      return true;
    }
    return false;
  }

  // --- INVENTORY ADJUSTMENT ---
  adjustStock(
    variantId: string,
    changeQuantity: number,
    type: 'entree' | 'sortie' | 'correction' | 'retour',
    reason: string,
    adminName = 'Admin'
  ): boolean {
    for (const prod of this.products) {
      const variant = prod.variants.find((v) => v.id === variantId);
      if (variant) {
        variant.stockQuantity = Math.max(0, variant.stockQuantity + changeQuantity);

        const movement: InventoryMovement = {
          id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: prod.id,
          productName: prod.name,
          variantId,
          variantLabel: `${variant.colorName} / ${variant.sizeName}`,
          quantity: changeQuantity,
          type,
          reason,
          adminName,
          createdAt: new Date().toISOString(),
        };

        this.movements.unshift(movement);
        saveStorage(STORAGE_KEYS.PRODUCTS, this.products);
        saveStorage(STORAGE_KEYS.MOVEMENTS, this.movements);
        this.notify();
        return true;
      }
    }
    return false;
  }

  // --- PRODUCT MANAGEMENT ---
  async saveProduct(product: Product): Promise<{ success: boolean; message?: string }> {
    const index = this.products.findIndex((p) => p.id === product.id);
    const now = new Date().toISOString();
    // Ensure product ID is valid UUID for PostgreSQL
    const productId = isUUID(product.id) ? product.id : generateUUID();

    // Ensure all variants have UUIDs as well
    const variantsWithUUID = (product.variants || []).map((v) => ({
      ...v,
      id: isUUID(v.id) ? v.id : generateUUID(),
      productId,
    }));

    const finalizedProduct: Product = {
      ...product,
      id: productId,
      variants: variantsWithUUID,
      createdAt: product.createdAt || now,
      updatedAt: now,
    };

    if (index > -1) {
      this.products[index] = finalizedProduct;
    } else {
      this.products.unshift(finalizedProduct);
    }
    saveStorage(STORAGE_KEYS.PRODUCTS, this.products);
    this.notify();

    // Sync to Supabase
    return await this.syncProductToSupabase(finalizedProduct);
  }

  deleteProduct(productId: string): void {
    this.products = this.products.filter((p) => p.id !== productId);
    saveStorage(STORAGE_KEYS.PRODUCTS, this.products);
    this.notify();

    const client = getSupabase();
    if (client && isUUID(productId)) {
      (async () => {
        try {
          await client.from('product_variants').delete().eq('product_id', productId);
          await client.from('products').delete().eq('id', productId);
        } catch (err) {
          console.warn('Supabase product delete warning:', err);
        }
      })();
    }
  }

  clearAllProducts(): void {
    this.products = [];
    saveStorage(STORAGE_KEYS.PRODUCTS, []);
    this.notify();

    const client = getSupabase();
    if (client) {
      (async () => {
        try {
          await client
            .from('product_variants')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
          await client
            .from('products')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        } catch (err) {
          console.warn('Supabase clear all products warning:', err);
        }
      })();
    }
  }

  async syncProductToSupabase(product: Product): Promise<{ success: boolean; message?: string }> {
    const client = getSupabase();
    if (!client) {
      return { success: false, message: 'Supabase non configuré (URL ou clé manquante).' };
    }

    try {
      const productId = isUUID(product.id) ? product.id : generateUUID();

      const basePayload: Record<string, unknown> = {
        id: productId,
        name: product.name,
        slug: product.slug || `pyjama-${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`,
        short_description: product.shortDescription || '',
        description: product.description || '',
        price: product.price,
        compare_at_price: product.compareAtPrice || null,
        category: product.category,
        material: product.material || '',
        care_instructions: product.careInstructions || '',
        location: product.location || 'Atelier Principal',
        is_active: product.isActive,
        is_featured: product.isFeatured,
        is_new: product.isNew,
        is_best_seller: product.isBestSeller,
        updated_at: new Date().toISOString(),
      };

      // Tente d'enregistrer avec images + color_images si les colonnes existent
      const payloadWithImages = {
        ...basePayload,
        images: product.images && product.images.length > 0 ? product.images : [],
        color_images: product.colorImages && Object.keys(product.colorImages).length > 0
          ? product.colorImages
          : {},
      };

      let { error: pErr } = await client.from('products').upsert(payloadWithImages, { onConflict: 'id' });

      // Si color_images n'existe pas encore, réessayer avec images seules
      if (pErr && (pErr.message.includes('color_images') || pErr.code === 'PGRST204')) {
        const withoutColorImages = {
          ...basePayload,
          images: product.images && product.images.length > 0 ? product.images : [],
        };
        const retryColor = await client.from('products').upsert(withoutColorImages, { onConflict: 'id' });
        pErr = retryColor.error;
      }

      // Si la colonne images n'existe pas encore, réessayer sans images
      if (pErr && (pErr.message.includes('images') || pErr.code === 'PGRST204')) {
        const retryResult = await client.from('products').upsert(basePayload, { onConflict: 'id' });
        pErr = retryResult.error;
      }

      if (pErr) {
        console.error('Erreur upsert produit Supabase:', pErr);
        return { success: false, message: pErr.message };
      }

      // Synchronisation des variantes
      if (product.variants && product.variants.length > 0) {
        const variantsPayload = product.variants.map((v) => ({
          id: isUUID(v.id) ? v.id : generateUUID(),
          product_id: productId,
          size_name: v.sizeName,
          color_name: v.colorName,
          color_hex: v.colorHex || '#F6C1CB',
          sku: v.sku || `${product.slug}-${v.sizeName}-${v.colorName}`.toUpperCase(),
          stock_quantity: v.stockQuantity,
          low_stock_threshold: v.lowStockThreshold || 3,
          location: v.location || product.location || 'Atelier Principal',
          is_active: v.isActive,
          updated_at: new Date().toISOString(),
        }));

        const { error: vErr } = await client.from('product_variants').upsert(variantsPayload, { onConflict: 'id' });
        if (vErr) {
          console.warn('Erreur variantes Supabase:', vErr);
          return {
            success: false,
            message: `Produit enregistré mais variantes rejetées : ${vErr.message}`
          };
        }
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: msg };
    }
  }

  async loadProductsFromSupabase(): Promise<{ success: boolean; count: number; message?: string }> {
    const client = getSupabase();
    if (!client) {
      return { success: false, count: 0, message: 'Supabase non configuré.' };
    }

    try {
      const { data: dbProducts, error: pErr } = await client
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (pErr) {
        return { success: false, count: 0, message: pErr.message };
      }

      if (!dbProducts || dbProducts.length === 0) {
        return { success: true, count: 0, message: 'Aucun produit dans Supabase.' };
      }

      const { data: dbVariants } = await client.from('product_variants').select('*');

      const mapped: Product[] = dbProducts.map((p) => {
        const pVariants = (dbVariants || [])
          .filter((v) => v.product_id === p.id)
          .map((v) => ({
            id: v.id,
            productId: p.id,
            sizeId: (v.size_name || 'M').toLowerCase(),
            sizeName: v.size_name || 'M',
            colorId: (v.color_name || 'Rose').toLowerCase(),
            colorName: v.color_name || 'Rose',
            colorHex: v.color_hex || '#F6C1CB',
            sku: v.sku || `PJM-${v.id.substring(0, 4)}`,
            stockQuantity: Number(v.stock_quantity) || 0,
            lowStockThreshold: Number(v.low_stock_threshold) || 3,
            location: v.location || p.location || 'Atelier Principal',
            isActive: v.is_active !== false,
          }));

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description || '',
          shortDescription: p.short_description || '',
          price: Number(p.price) || 0,
          compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : undefined,
          category: p.category || 'Pyjamas',
          material: p.material || 'Satin',
          careInstructions: p.care_instructions || '',
          location: p.location || 'Atelier Principal',
          images: Array.isArray(p.images)
            ? p.images
            : ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'],
          colorImages:
            p.color_images && typeof p.color_images === 'object' && !Array.isArray(p.color_images)
              ? (p.color_images as Record<string, string[]>)
              : undefined,
          isActive: p.is_active !== false,
          isFeatured: Boolean(p.is_featured),
          isNew: Boolean(p.is_new),
          isBestSeller: Boolean(p.is_best_seller),
          variants: pVariants.length > 0 ? pVariants : [
            {
              id: generateUUID(),
              productId: p.id,
              sizeId: 'm',
              sizeName: 'M',
              colorId: 'rose',
              colorName: 'Rose Poudré',
              colorHex: '#F6C1CB',
              sku: `PJM-${p.slug}-M`,
              stockQuantity: 10,
              lowStockThreshold: 3,
              location: p.location || 'Atelier Principal',
              isActive: true,
            }
          ],
          createdAt: p.created_at || new Date().toISOString(),
          updatedAt: p.updated_at || new Date().toISOString(),
        };
      });

      this.products = mapped;
      saveStorage(STORAGE_KEYS.PRODUCTS, this.products);
      this.notify();
      return { success: true, count: mapped.length };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, count: 0, message: msg };
    }
  }

  // --- WILAYAS MANAGEMENT ---
  updateWilayaFee(wilayaId: number, deliveryFee: number, stopDeskFee?: number, isActive?: boolean): void {
    const index = this.wilayas.findIndex((w) => w.id === wilayaId);
    if (index > -1) {
      this.wilayas[index].deliveryFee = deliveryFee;
      if (stopDeskFee !== undefined) this.wilayas[index].stopDeskFee = stopDeskFee;
      if (isActive !== undefined) this.wilayas[index].isActive = isActive;
      saveStorage(STORAGE_KEYS.WILAYAS, this.wilayas);
      this.notify();
    }
  }

  // --- COUPON MANAGEMENT ---
  saveCoupon(coupon: Coupon): void {
    const index = this.coupons.findIndex((c) => c.id === coupon.id);
    if (index > -1) {
      this.coupons[index] = coupon;
    } else {
      this.coupons.unshift({ ...coupon, id: coupon.id || `coup-${Date.now()}` });
    }
    saveStorage(STORAGE_KEYS.COUPONS, this.coupons);
    this.notify();
  }

  deleteCoupon(couponId: string): void {
    this.coupons = this.coupons.filter((c) => c.id !== couponId);
    saveStorage(STORAGE_KEYS.COUPONS, this.coupons);
    this.notify();
  }

  // --- REVIEW MANAGEMENT ---
  addReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'status'>): void {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      status: 'approuve', // auto-approve with moderation capability in admin
      createdAt: new Date().toISOString(),
    };
    this.reviews.unshift(newReview);
    saveStorage(STORAGE_KEYS.REVIEWS, this.reviews);
    this.notify();
  }

  updateReviewStatus(reviewId: string, status: 'approuve' | 'rejete' | 'en_attente'): void {
    const rev = this.reviews.find((r) => r.id === reviewId);
    if (rev) {
      rev.status = status;
      saveStorage(STORAGE_KEYS.REVIEWS, this.reviews);
      this.notify();
    }
  }

  deleteReview(reviewId: string): void {
    this.reviews = this.reviews.filter((r) => r.id !== reviewId);
    saveStorage(STORAGE_KEYS.REVIEWS, this.reviews);
    this.notify();
  }

  // --- SETTINGS MANAGEMENT ---
  updateSettings(settings: Partial<StoreSettings>): void {
    this.settings = { ...this.settings, ...settings };
    saveStorage(STORAGE_KEYS.SETTINGS, this.settings);
    this.notify();
  }

  // --- RESET DEMO DATA ---
  resetToDefaultData(): void {
    this.products = INITIAL_PRODUCTS;
    this.orders = INITIAL_ORDERS;
    this.wilayas = ALGERIA_WILAYAS;
    this.coupons = INITIAL_COUPONS;
    this.reviews = INITIAL_REVIEWS;
    this.settings = INITIAL_SETTINGS;
    saveStorage(STORAGE_KEYS.PRODUCTS, this.products);
    saveStorage(STORAGE_KEYS.ORDERS, this.orders);
    saveStorage(STORAGE_KEYS.WILAYAS, this.wilayas);
    saveStorage(STORAGE_KEYS.COUPONS, this.coupons);
    saveStorage(STORAGE_KEYS.REVIEWS, this.reviews);
    saveStorage(STORAGE_KEYS.SETTINGS, this.settings);
    this.notify();
  }
}

export const store = new StoreService();
