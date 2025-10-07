// src/types/index.ts - Tipos TypeScript completos para el e-commerce
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'CLIENT' | 'ADMIN' | 'SUPER_ADMIN';
  userLevel: 'REGULAR' | 'VIP' | 'PREMIUM';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  parentId?: string;
  createdAt: string;
  updatedAt?: string;
  // Campos calculados
  productCount?: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  sortOrder?: number;
  isMain?: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  type: string; // 'color', 'size', 'storage', etc.
  value: string;
  price?: number; // Si tiene precio diferente
  sku?: string;
  stockCount?: number;
  isActive: boolean;
  sortOrder?: number;
  images?: ProductImage[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc?: string;
  price: number;
  comparePrice?: number;
  categoryId: string;
  category?: Category;
  brand?: string;
  model?: string;
  sku?: string;
  barcode?: string;
  weight?: number;
  stockType: 'PHYSICAL' | 'DROPSHIPPING' | 'BOTH';
  stockCount: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  inStock: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  tags: string[];
  metaTitle?: string;
  metaDesc?: string;
  images: ProductImage[];
  variants?: ProductVariant[];
  reviews?: ProductReview[];
  // Campos calculados/agregados
  rating?: number;
  reviewCount?: number;
  salesCount?: number;
  searchTerms?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  rating: number; // 1-5
  title?: string;
  comment: string;
  isApproved: boolean;
  isVerifiedPurchase: boolean;
  helpfulCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  variant?: {
    type: string;
    value: string;
    priceModifier?: number;
  };
  addedAt?: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  subtotal: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  couponCode?: string;
}

export interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
  type?: 'SHIPPING' | 'BILLING';
}

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedDays: number;
  carrier?: string;
  isActive: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'CREDIT_CARD' | 'PAYPAL' | 'STRIPE' | 'ZELLE' | 'BANK_TRANSFER';
  name: string;
  isActive: boolean;
  processingFee?: number;
  minAmount?: number;
  maxAmount?: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  value: number; // percentage or amount
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productSnapshot?: {
    name: string;
    image?: string;
    sku?: string;
  };
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIAL_REFUND';
  
  // Productos
  items: OrderItem[];
  
  // Precios
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  
  // Cupón
  couponId?: string;
  couponCode?: string;
  
  // Direcciones
  shippingAddress: Address;
  billingAddress?: Address;
  
  // Envío
  shippingMethodId?: string;
  shippingMethod?: ShippingMethod;
  trackingNumber?: string;
  estimatedDelivery?: string;
  
  // Pago
  paymentMethodId?: string;
  paymentMethod?: PaymentMethod;
  paymentIntentId?: string; // Para Stripe
  
  // Notas
  customerNotes?: string;
  adminNotes?: string;
  
  // Fechas
  createdAt: string;
  updatedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  addedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'ORDER_UPDATE' | 'PROMOTION' | 'PRODUCT_BACK_IN_STOCK' | 'WELCOME' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

// API Response Types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  products: never[];
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  message: string;
}

// Product Management Types
export interface ProductCreateRequest {
  name: string;
  description: string;
  shortDesc?: string;
  price: number;
  comparePrice?: number;
  categoryId: string;
  brand?: string;
  model?: string;
  sku?: string;
  barcode?: string;
  weight?: number;
  stockType: 'PHYSICAL' | 'DROPSHIPPING' | 'BOTH';
  stockCount: number;
  lowStockThreshold?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isDigital?: boolean;
  tags?: string[];
  metaTitle?: string;
  metaDesc?: string;
  images?: ProductImage[];
  variants?: Omit<ProductVariant, 'id' | 'productId'>[];
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  id: string;
}

// Filter Types
export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'salesCount' | 'rating';
  sortOrder?: 'asc' | 'desc';
  tags?: string[];
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: Order['status'];
  paymentStatus?: Order['paymentStatus'];
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string; // buscar por orderNumber, email, etc.
}

// Checkout Types
export interface CheckoutSession {
  cart: Cart;
  shippingAddress?: Address;
  billingAddress?: Address;
  shippingMethod?: ShippingMethod;
  paymentMethod?: PaymentMethod;
  couponCode?: string;
  customerNotes?: string;
  
  // Calculated totals
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

// Store/State Types
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading?: boolean;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  subtotal: number;
  shippingCost?: number;
  tax?: number;
  discount?: number;
  couponCode?: string;
}

export interface AdminState {
  products: Product[];
  categories: Category[];
  orders: Order[];
  users: User[];
  selectedProduct: Product | null;
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    products: ProductFilters;
    orders: OrderFilters;
  };
}

// Form Types
export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface NewsletterSignup {
  email: string;
  firstName?: string;
  interests?: string[];
}

export interface ProductReviewForm {
  rating: number;
  title?: string;
  comment: string;
  productId: string;
}

// Utility Types
export interface ImageUploadResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface FileUpload {
  file: File;
  preview?: string;
  progress?: number;
  uploaded?: boolean;
  error?: string;
}

// Analytics Types
export interface AnalyticsEvent {
  event: string;
  category: string;
  label?: string;
  value?: number;
  userId?: string;
  properties?: Record<string, any>;
}

export interface ProductAnalytics {
  productId: string;
  views: number;
  clicks: number;
  conversions: number;
  revenue: number;
  period: 'day' | 'week' | 'month' | 'year';
  date: string;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: Record<string, any>;
}

export interface FormError {
  field: string;
  message: string;
}

export interface ValidationError {
  field: string;
  rule: string;
  message: string;
}

// Constants/Enums
export const ORDER_STATUSES = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
} as const;

export const PAYMENT_STATUSES = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIAL_REFUND: 'PARTIAL_REFUND'
} as const;

export const USER_ROLES = {
  CLIENT: 'CLIENT',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN'
} as const;

export const USER_LEVELS = {
  REGULAR: 'REGULAR',
  VIP: 'VIP',
  PREMIUM: 'PREMIUM'
} as const;

export const STOCK_TYPES = {
  PHYSICAL: 'PHYSICAL',
  DROPSHIPPING: 'DROPSHIPPING',
  BOTH: 'BOTH'
} as const;

export const PAYMENT_METHODS = {
  CREDIT_CARD: 'CREDIT_CARD',
  PAYPAL: 'PAYPAL',
  STRIPE: 'STRIPE',
  ZELLE: 'ZELLE',
  BANK_TRANSFER: 'BANK_TRANSFER'
} as const;