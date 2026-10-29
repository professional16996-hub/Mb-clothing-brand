export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  fabricDetails: string;
  careInstructions: string;
  category: string;
  subcategory: string;
  regularPrice: number;
  salePrice?: number;
  costPrice?: number;
  stock: number;
  sku: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  images: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isPublished: boolean;
  createdAt: string;
  rating: number;
  reviewCount: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount?: number;
}

export interface CartItem {
  productId: string;
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  province: string;
  city: string;
  address: string;
  landmark?: string;
  postalCode?: string;
}

export interface OrderTimelineEvent {
  status: string;
  title: string;
  message: string;
  timestamp: string;
}

export interface Order {
  id: string;
  customerId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  total: number;
  paymentMethod: 'cod' | 'bank_transfer' | 'card';
  paymentStatus: 'pending' | 'paid' | 'cod_received' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  courierName?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  timeline: OrderTimelineEvent[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  createdAt: string;
  city?: string;
  province?: string;
  address?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  active: boolean;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  logoText: string;
  whatsappNumber: string;
  supportEmail: string;
  supportPhone: string;
  physicalAddress: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  expressShippingFee: number;
  shippingPolicy: string;
  returnPolicy: string;
  currency: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}
