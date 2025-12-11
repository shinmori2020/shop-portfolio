import { Timestamp } from 'firebase/firestore';

// User Types
export interface User {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  phone?: string;
  role: 'customer' | 'admin';
  defaultAddress?: Address;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
}

export interface Address {
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  building?: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  brand?: string;
  sku: string;
  images: string[];
  mainImage: string;
  stock: number;
  sold: number;
  rating: number;
  reviewCount: number;
  specifications?: Record<string, string>;
  metaTitle?: string;
  metaDescription?: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  isNew: boolean;
  onSale: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  productCount: number;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  shippingAddress: Address;
  deliveryNote?: string;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'card' | 'bank' | 'convenience';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentIntentId?: string;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: Timestamp;
  deliveredAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  subtotal: number;
}

// Review Types
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  helpful: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Cart Types
export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Timestamp;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: Timestamp;
}

// Settings Types
export interface Settings {
  siteName: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  freeShippingThreshold: number;
  shippingFee: number;
  taxRate: number;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  social: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  updatedAt: Timestamp;
}
