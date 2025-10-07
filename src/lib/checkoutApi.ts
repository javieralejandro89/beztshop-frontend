// src/lib/checkoutApi.ts - API de checkout para frontend
import api from './api';
import type { Address, PaymentMethod } from './accountApi';

// Interfaces específicas para checkout
export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  isFree?: boolean;
}

export interface CheckoutSession {
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  shippingMethods: ShippingMethod[];
  config: {
    freeShippingThreshold: number;
    taxRate: number;
  };
}

export interface CartItem {
  productId: string;
  quantity: number;
  variants?: Record<string, string>;
}

export interface CheckoutCoupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  value: number;
  discount: number;
  freeShipping?: boolean;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  appliedCoupon: CheckoutCoupon | null;
  items: OrderItem[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  originalQuantity?: number; // ← Nuevo
  price: number;
  totalPrice: number;
  variants?: any;
  hasStockIssue?: boolean; // ← Nuevo
  availableStock?: number; // ← Nuevo
}

export interface CreateOrderRequest {
  items: CartItem[];
  shippingAddressId?: string;
  billingAddressId?: string;
  shippingAddress?: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
    phone?: string;
  };
  shippingMethod: 'standard' | 'express' | 'overnight';
  paymentMethod: 'card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
  couponCode?: string;
  customerNotes?: string;
}

export interface CreateOrderResponse {
  message: string;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: number;
    items: number;
    currency?: string;
    paymentData?: {
      orderId: string;
      amount: number;
      currency: string;
      buyerEmail?: string;
      shippingAddress?: any;
    };
  };
  requiresPayment?: boolean;
  redirectUrl: string;
}

export const checkoutApi = {
  // ==== SESIÓN DE CHECKOUT ====
  getCheckoutSession: async (): Promise<CheckoutSession> => {
    const { data } = await api.get('/checkout/session');
    return data;
  },

  // ==== MÉTODOS DE ENVÍO ====
  getShippingMethods: async (params?: { subtotal?: number }): Promise<{ shippingMethods: ShippingMethod[] }> => {
    const { data } = await api.get('/checkout/shipping-methods', { params });
    return data;
  },

  // ==== CUPONES ====
  validateCoupon: async (code: string, subtotal: number): Promise<{ 
    valid: boolean; 
    coupon?: CheckoutCoupon;
    error?: string;
  }> => {
    try {
      const { data } = await api.post('/checkout/validate-coupon', { code, subtotal });
      return data;
    } catch (error: any) {
      return {
        valid: false,
        error: error.response?.data?.error || 'Error validando cupón'
      };
    }
  },

  // ==== CÁLCULOS ====
  calculateOrderTotals: async (params: {
    items: CartItem[];
    shippingMethod?: string;
    couponCode?: string;
  }): Promise<OrderTotals> => {
    const { data } = await api.post('/checkout/calculate-totals', params);
    return data;
  },

  // ==== CREAR PEDIDO ====
  createOrder: async (orderData: CreateOrderRequest): Promise<CreateOrderResponse> => {
    const { data } = await api.post('/checkout/create-order', orderData);
    return data;
  },

  // ==== UTILIDADES ====
  // Validar dirección
  validateAddress: (address: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!address.name?.trim()) errors.push('Nombre es requerido');
    if (!address.street?.trim()) errors.push('Dirección es requerida');
    if (!address.city?.trim()) errors.push('Ciudad es requerida');
    if (!address.state?.trim()) errors.push('Estado es requerido');
    if (!address.zipCode?.trim()) errors.push('Código postal es requerido');

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Formatear dirección para mostrar
  formatAddress: (address: Address): string => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  },

  // Obtener descripción del método de pago
  getPaymentMethodDescription: (method: PaymentMethod): string => {
    switch (method.type) {
      case 'card':
        return method.brand && method.last4 
          ? `${method.brand} terminada en ${method.last4}`
          : 'Tarjeta de crédito/débito';
      case 'paypal':
        return method.paypalEmail ? `PayPal (${method.paypalEmail})` : 'PayPal';
      case 'bank_transfer':
        return 'Transferencia bancaria';
      case 'cash_on_delivery':
        return 'Pago contra entrega';
      default:
        return method.type;
    }
  },

  // Calcular tiempo estimado de entrega
  getEstimatedDelivery: (shippingMethod: string): string => {
    const now = new Date();
    let days = 7; // Por defecto

    switch (shippingMethod) {
      case 'standard':
        days = 7;
        break;
      case 'express':
        days = 3;
        break;
      case 'overnight':
        days = 1;
        break;
    }

    const deliveryDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    return deliveryDate.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

export default checkoutApi;