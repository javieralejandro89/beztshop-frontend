// src/lib/accountApi.ts - API para gestión de cuenta de usuario
import api from './api';
import type { 
  User,
  ApiResponse,
  PaginatedResponse
} from '@/types';

// Interfaces específicas para account
export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  paymentMethod?: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  shippingAddress: any;
  billingAddress?: any;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  notes?: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  variants?: any;
  product?: {
    id: string;
    name: string;
    slug: string;
    image: string;
  } | null;
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  paypalEmail?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface AccountStats {
  totalOrders: number;
  totalAddresses: number;
  totalPaymentMethods: number;
  wishlistItems: number;
}

// Tipos para formularios
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface CreateAddressData {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  isDefault?: boolean;
}

export interface CreatePaymentMethodData {
  type: 'CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY';
  cardToken?: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  stripePaymentMethodId?: string;
  paypalEmail?: string;
  isDefault?: boolean;
}

export interface UpdatePaymentMethodData {
  paypalEmail?: string;
  isDefault?: boolean;
}

export const accountApi = {
  // ==== PERFIL ====
  getProfile: async (): Promise<{ user: User }> => {
    const { data } = await api.get('/account/profile');
    return data;
  },

  updateProfile: async (profileData: UpdateProfileData): Promise<{ user: User; message: string }> => {
    const { data } = await api.put('/account/profile', profileData);
    return data;
  },

  getAccountStats: async (): Promise<{ stats: AccountStats }> => {
    const { data } = await api.get('/account/stats');
    return data;
  },

  // ==== PEDIDOS ====
  getOrders: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{ orders: Order[]; pagination: any }> => {
    const { data } = await api.get('/account/orders', { params });
    return data;
  },

  getOrderById: async (orderId: string): Promise<{ order: Order }> => {
    const { data } = await api.get(`/account/orders/${orderId}`);
    return data;
  },

  // ==== DIRECCIONES ====
  getAddresses: async (): Promise<{ addresses: Address[] }> => {
    const { data } = await api.get('/account/addresses');
    return data;
  },

  createAddress: async (addressData: CreateAddressData): Promise<{ address: Address; message: string }> => {
    const { data } = await api.post('/account/addresses', addressData);
    return data;
  },

  updateAddress: async (addressId: string, addressData: Partial<CreateAddressData>): Promise<{ address: Address; message: string }> => {
    const { data } = await api.put(`/account/addresses/${addressId}`, addressData);
    return data;
  },

  deleteAddress: async (addressId: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/account/addresses/${addressId}`);
    return data;
  },

  // ==== MÉTODOS DE PAGO ====
  getPaymentMethods: async (): Promise<{ paymentMethods: PaymentMethod[] }> => {
    const { data } = await api.get('/account/payment-methods');
    return data;
  },

  createPaymentMethod: async (data: CreatePaymentMethodData): Promise<PaymentMethod> => {
  const { data: response } = await api.post('/account/payment-methods', data);
  return response.paymentMethod;
},

  deletePaymentMethod: async (paymentMethodId: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/account/payment-methods/${paymentMethodId}`);
    return data;
  },

  updatePaymentMethod: async (paymentMethodId: string, data: UpdatePaymentMethodData): Promise<{ paymentMethod: PaymentMethod; message: string }> => {
  const { data: response } = await api.put(`/account/payment-methods/${paymentMethodId}`, data);
  return response;
},

  // ==== UTILIDADES ====
  // Cambiar contraseña (ya existe en authApi, pero también podría estar aquí)
  changePassword: async (passwords: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
    const { data } = await api.post('/auth/change-password', passwords);
    return data;
  },

  // Descargar factura (funcionalidad futura)
  downloadInvoice: async (orderId: string): Promise<Blob> => {
    const response = await api.get(`/account/orders/${orderId}/invoice`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Exportar como default también para compatibilidad
export default accountApi;