export type OrderStatus =
  | 'en_attente'
  | 'nouvelle'
  | 'acceptee'
  | 'confirmee'
  | 'preparation'
  | 'arriver_yalidine'
  | 'expediee'
  | 'en_livraison'
  | 'livree'
  | 'refusee'
  | 'annulee'
  | 'retour';

export interface Color {
  id: string;
  name: string;
  hex: string;
}

export interface Size {
  id: string;
  name: string; // 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
  order: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sizeId: string;
  sizeName: string;
  colorId: string;
  colorName: string;
  colorHex: string;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  price?: number; // optional price override
  image?: string;
  location?: string; // Emplacement physique (ex: Étagère A1, Tiroir Rose 3)
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  material: string;
  careInstructions: string;
  location?: string; // Emplacement par défaut en stock
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
  rating?: number;
  reviewCount?: number;
}

export interface CartItem {
  id: string; // composite variant id
  productId: string;
  variantId: string;
  productName: string;
  productImage: string;
  sizeName: string;
  colorName: string;
  colorHex: string;
  price: number;
  quantity: number;
  maxStock: number;
  location?: string;
}

export interface Wilaya {
  id: number;
  code: string; // e.g. "01", "16", "31"
  name: string; // e.g. "Alger", "Oran"
  deliveryFee: number; // e.g. 400 DA
  stopDeskFee?: number; // bureau Yalidine fee e.g. 300 DA
  isActive: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  productImage: string;
  sizeName: string;
  colorName: string;
  price: number;
  quantity: number;
  subtotal: number;
  location?: string; // Emplacement stock
}

export interface OrderTimelineEvent {
  id: string;
  status: OrderStatus;
  label: string;
  description: string;
  timestamp: string;
  author: string; // "Système", "Admin", "Yalidine"
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. PJM-8K42X9
  customerFirstName: string;
  customerLastName: string;
  phone: string;
  email?: string;
  wilayaId: number;
  wilayaName: string;
  commune: string;
  address: string;
  notes?: string;
  deliveryType: 'domicile' | 'stopdesk';
  deliveryFee: number;
  subtotal: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: 'cod'; // Cash on Delivery
  status: OrderStatus;
  yalidineTrackingNumber?: string;
  yalidineStatus?: string;
  items: OrderItem[];
  timeline: OrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export type InventoryMovementType = 'entree' | 'sortie' | 'correction' | 'retour';

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantLabel: string;
  quantity: number; // positive or negative
  type: InventoryMovementType;
  reason: string;
  adminName: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // percentage (e.g. 10 for 10%) or DA (e.g. 500)
  minOrderAmount?: number;
  maxDiscount?: number;
  expiresAt?: string;
  usageCount: number;
  maxUsage?: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  customerWilaya: string;
  rating: number; // 1-5
  comment: string;
  isVerified: boolean;
  status: 'en_attente' | 'approuve' | 'rejete';
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  facebook: string;
  freeShippingThreshold: number; // 0 for none, or e.g. 15000 DA
  lowStockThresholdDefault: number;
  yalidineApiKey: string;
  yalidineApiToken: string;
  yalidineCenterId: string;
  yalidineEnabled: boolean;
  announcementText: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}
