// src/lib/api.ts - Sistema de API con auto-refresh de tokens
import axios from 'axios';
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  Product, 
  ProductCreateRequest, 
  Category,
  PaginatedResponse 
} from '@/types';
import accountApi from './accountApi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Flag para evitar múltiples intentos de refresh simultáneos
let isRefreshing = false;
let failedQueue: any[] = [];

// Función para procesar la cola de peticiones pendientes
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Configurar axios con interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // IMPORTANTE: para enviar cookies automáticamente
  timeout: 10000, // 10 segundos timeout
});

// Interceptor de requests - agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de responses - manejar refresh automático
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error no es 401 o ya se intentó refresh, rechazar
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Verificar si es un error de token expirado
    const errorCode = error.response?.data?.code;
    const needsRefresh = error.response?.data?.needsRefresh;
    
    if (errorCode === 'ACCESS_TOKEN_EXPIRED' || needsRefresh) {
      // Marcar que se intentó refresh
      originalRequest._retry = true;

      if (isRefreshing) {
        // Si ya se está refrescando, agregar a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;

      try {
        // Intentar refresh
        console.log('🔄 Token expirado, renovando automáticamente...');
        
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {}, // Body vacío, el refresh token está en cookies
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const { accessToken, user } = response.data;
        
        // Guardar nuevo token
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Actualizar header por defecto
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        // Procesar cola de peticiones pendientes
        processQueue(null, accessToken);
        
        // Reintentar petición original
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        console.log('✅ Token renovado automáticamente');
        
        return api(originalRequest);

      } catch (refreshError: any) {
        console.error('❌ Error renovando token:', refreshError);
        
        // Si el refresh falló, limpiar sesión
        const refreshErrorCode = refreshError.response?.data?.code;
        const requiresLogin = refreshError.response?.data?.requiresLogin;
        
        if (requiresLogin || 
            refreshErrorCode === 'REFRESH_TOKEN_EXPIRED' ||
            refreshErrorCode === 'REFRESH_TOKEN_INVALID') {
          
          console.log('🚪 Sesión expirada, redirigiendo al login...');
          
          // Limpiar tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
          
          // Procesar cola con error
          processQueue(refreshError, null);
          
          // Redirigir a login si no estamos ya ahí
          if (typeof window !== 'undefined' && 
              !window.location.pathname.includes('/auth/login')) {
            const currentPath = window.location.pathname + window.location.search;
            const redirectParam = currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : '';
            window.location.href = `/auth/login${redirectParam}`;
          }
        }
        
        return Promise.reject(refreshError);
        
      } finally {
        isRefreshing = false;
      }
    }

    // Para otros errores 401 (usuario inactivo, permisos, etc.)
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code;
      
      if (errorCode === 'USER_INACTIVE' || 
          errorCode === 'NOT_AUTHENTICATED' ||
          errorCode === 'TOKEN_REQUIRED') {
        
        console.log('🔒 Usuario no autorizado, limpiando sesión...');
        
        // Limpiar sesión y redirigir
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        
        if (typeof window !== 'undefined' && 
            !window.location.pathname.includes('/auth/login')) {
          const currentPath = window.location.pathname + window.location.search;
          const redirectParam = currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : '';
          window.location.href = `/auth/login${redirectParam}`;
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API con manejo mejorado
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      console.log('🔐 Iniciando sesión...');
      const { data } = await api.post('/auth/login', credentials);
      
      // El refresh token se guarda automáticamente en cookie
      // Solo guardamos access token en localStorage
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Configurar header por defecto
      api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
      
      console.log('✅ Sesión iniciada exitosamente');
      return data;
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  },

  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    try {
      console.log('📝 Registrando usuario...');
      const { data } = await api.post('/auth/register', userData);
      
      // Guardar tokens de la misma forma
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
      
      console.log('✅ Usuario registrado exitosamente');
      return data;
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      throw error;
    }
  },

  // Refresh manual (por si se necesita)
  refreshToken: async () => {
    try {
      console.log('🔄 Renovando token manualmente...');
      const { data } = await api.post('/auth/refresh');
      
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
      
      console.log('✅ Token renovado manualmente');
      return data;
    } catch (error: any) {
      console.error('❌ Error renovando token:', error);
      throw error;
    }
  },

  getProfile: async () => {
    const { data } = await api.get('/auth/profile');
    return data;
  },

  logout: async () => {
    try {
      console.log('🚪 Cerrando sesión...');
      // Llamar logout en backend
      await api.post('/auth/logout');
      console.log('✅ Logout exitoso en backend');
    } catch (error) {
      // Incluso si falla, limpiar localmente
      console.error('⚠️ Error en logout backend:', error);
    } finally {
      // Limpiar tokens locales
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      console.log('🧹 Sesión local limpiada');
    }
  },

  logoutAllDevices: async () => {
    try {
      console.log('📱 Cerrando todas las sesiones...');
      await api.post('/auth/logout-all');
      console.log('✅ Todas las sesiones cerradas');
    } catch (error) {
      console.error('❌ Error cerrando todas las sesiones:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
    }
  },

  changePassword: async (passwords: { currentPassword: string; newPassword: string }) => {
    const { data } = await api.post('/auth/change-password', passwords);
    return data;
  },

  forgotPassword: async (email: string) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
},

resetPassword: async (token: string, newPassword: string) => {
  const { data } = await api.post('/auth/reset-password', { token, newPassword });
  return data;
},

  verifyToken: async () => {
    try {
      const { data } = await api.get('/auth/verify');
      return data;
    } catch (error: any) {
      console.error('❌ Error verificando token:', error);
      throw error;
    }
  },
};

// Función para inicializar la API con token existente
export const initializeAuth = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Token inicial cargado');
    }
  }
};

// Products API (sin cambios, pero ahora con auto-refresh)
export const productsApi = {
  // Rutas públicas
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    featured?: boolean;
  }) => {
    const { data } = await api.get('/products', { params });
    return data as PaginatedResponse<Product>;
  },

  getProductBySlug: async (slug: string): Promise<Product> => {
    const { data } = await api.get(`/products/${slug}`);
    return data;
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    const { data } = await api.get('/products/featured');
    return data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const { data } = await api.get(`/products/admin/${id}`);
    return data;
  },

  // Subir imágenes
  uploadImages: async (formData: FormData) => {
    const { data } = await api.post('/images/products/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // Eliminar imagen
  deleteImage: async (publicId: string) => {
  // Encodificar el publicId para que funcione en URL (/ se convierte en %2F)
  const encodedPublicId = encodeURIComponent(publicId);
  const { data } = await api.delete(`/images/products/${encodedPublicId}`);
  return data;
},

  // Actualizar imágenes de producto
  updateProductImages: async (productId: string, images: any[]) => {
    const { data } = await api.put(`/images/products/${productId}`, { images });
    return data;
  },

  // Rutas de admin (ahora con auto-refresh automático)
  getProductsAdmin: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const { data } = await api.get('/products/admin/all', { params });
    return data as PaginatedResponse<Product>;
  },

  createProduct: async (product: ProductCreateRequest): Promise<Product> => {
    const { data } = await api.post('/products', product);
    return data;
  },

  updateProduct: async (id: string, updates: Partial<ProductCreateRequest>): Promise<Product> => {
    const { data } = await api.put(`/products/${id}`, updates);
    return data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  getCategories: async (): Promise<Category[]> => {
    const { data } = await api.get('/categories');
    return data.categories;
  },

  getCategoryBySlug: async (slug: string): Promise<any> => {
    const { data } = await api.get(`/categories/${slug}`);
    return data;
  },
  createCategory: async (categoryData: { name: string; description?: string }): Promise<any> => {
  const { data } = await api.post('/categories', categoryData);
  return data;
},
};

// Utility function para verificar si hay token válido
export const hasValidToken = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('accessToken');
  if (!token) return false;
  
  try {
    // ✅ CORRECCIÓN: Verificación menos estricta
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Solo verificar que no esté expirado (sin buffer de 60 segundos)
    const isValid = payload.exp > currentTime;
    
    console.log('🔍 Token check:', {
      exp: payload.exp,
      now: currentTime,
      valid: isValid,
      remaining: Math.round(payload.exp - currentTime) + 's'
    });
    
    return isValid;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

// Función para limpiar sesión manualmente
export const clearSession = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
  console.log('🧹 Sesión limpiada manualmente');
};

// Hook para debugging (development only)
export const debugApi = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Debug API:', {
      baseURL: API_BASE_URL,
      hasToken: !!localStorage.getItem('accessToken'),
      isRefreshing,
      queueLength: failedQueue.length
    });
  }
};

// Admin API para gestión de pedidos y usuarios
export const adminApi = {
  // === ORDERS ===
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const { data } = await api.get('/admin/orders', { params });
    return data;
  },

  getOrderById: async (id: string) => {
    const { data } = await api.get(`/admin/orders/${id}`);
    return data;
  },

  updateOrderStatus: async (id: string, updateData: {
    status: string;
    trackingNumber?: string;
    notes?: string;
    notifyCustomer?: boolean;
  }) => {
    const { data } = await api.patch(`/admin/orders/${id}/status`, updateData);
    return data;
  },

  sendCustomNotification: async (id: string, notification: {
    subject: string;
    message: string;
    type?: string;
  }) => {
    const { data } = await api.post(`/admin/orders/${id}/notify`, notification);
    return data;
  },

  generateInvoice: async (id: string) => {
    const response = await api.get(`/admin/orders/${id}/invoice`, {
      responseType: 'blob'
    });
    return response.data;
  },

  getOrderStats: async () => {
    const { data } = await api.get('/admin/orders/stats');
    return data;
  },

  // === USERS ===
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    userLevel?: string;
    isActive?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const { data } = await api.get('/admin/users', { params });
    return data;
  },

  getUserById: async (id: string) => {
    const { data } = await api.get(`/admin/users/${id}`);
    return data;
  },

  createUser: async (userData: any) => {
    const { data } = await api.post('/admin/users', userData);
    return data;
  },

  updateUser: async (id: string, updates: any) => {
    const { data } = await api.put(`/admin/users/${id}`, updates);
    return data;
  },

  deleteUser: async (id: string) => {
    const { data } = await api.delete(`/admin/users/${id}`);
    return data;
  },

  toggleUserStatus: async (id: string) => {
    const { data } = await api.patch(`/admin/users/${id}/toggle-status`);
    return data;
  },

  getUserStats: async () => {
    const { data } = await api.get('/admin/users/stats');
    return data;
  },

  // === DASHBOARD ===
  getDashboard: async () => {
    const { data } = await api.get('/admin/dashboard');
    return data;
  },

  getHealth: async () => {
    const { data } = await api.get('/admin/health');
    return data;
  },

  // === SETTINGS ===
  getSiteSettings: async () => {
    const { data } = await api.get('/admin/settings/site');
    return data;
  },

  updateSiteSettings: async (settings: any) => {
    const { data } = await api.put('/admin/settings/site', { settings });
    return data;
  },

  getEmailSettings: async () => {
    const { data } = await api.get('/admin/settings/email');
    return data;
  },

  updateEmailSettings: async (settings: any) => {
    const { data } = await api.put('/admin/settings/email', { settings });
    return data;
  },

  getPaymentSettings: async () => {
    const { data } = await api.get('/admin/settings/payment');
    return data;
  },

  updatePaymentSettings: async (settings: any) => {
    const { data } = await api.put('/admin/settings/payment', { settings });
    return data;
  },

  getShippingSettings: async () => {
    const { data } = await api.get('/admin/settings/shipping');
    return data;
  },

  updateShippingSettings: async (settings: any) => {
    const { data } = await api.put('/admin/settings/shipping', { settings });
    return data;
  },
  

  // === COUPONS ===
  getCoupons: async () => {
    const { data } = await api.get('/admin/coupons');
    return data;
  },

  createCoupon: async (couponData: any) => {
    const { data } = await api.post('/admin/coupons', couponData);
    return data;
  },

  updateCoupon: async (id: string, couponData: any) => {
    const { data } = await api.put(`/admin/coupons/${id}`, couponData);
    return data;
  },

  deleteCoupon: async (id: string) => {
    const { data } = await api.delete(`/admin/coupons/${id}`);
    return data;
  },

  toggleCouponStatus: async (id: string) => {
    const { data } = await api.patch(`/admin/coupons/${id}/toggle`);
    return data;
  },
  // === NEWSLETTER ===
getNewsletterStats: async () => {
  const { data } = await api.get('/newsletter/stats');
  return data;
},

getNewsletterSubscribers: async (params?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}) => {
  const { data } = await api.get('/newsletter/subscribers', { params });
  return data;
},

getNewsletterCampaigns: async () => {
  const { data } = await api.get('/newsletter/campaigns');
  return data;
},

createNewsletterCampaign: async (campaignData: any) => {
  const { data } = await api.post('/newsletter/campaigns', campaignData);
  return data;
},

sendNewsletterCampaign: async (id: string) => {
  const { data } = await api.post(`/newsletter/campaigns/${id}/send`);
  return data;
},

previewNewsletterCampaign: async (campaignData: any) => {
  const { data } = await api.post('/newsletter/campaigns/preview', campaignData);
  return data;
},

// Para el frontend público
subscribeNewsletter: async (data: { email: string; name?: string }) => {
  const { data: response } = await api.post('/newsletter/subscribe', data);
  return response;
},

unsubscribeNewsletter: async (email: string) => {
  const { data } = await api.post(`/newsletter/unsubscribe/direct`, { email });
  return data;
}
};

// Reviews API
export const reviewsApi = {
  // Obtener reseñas de un producto (público)
  getProductReviews: async (productId: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get(`/reviews/products/${productId}`, { params });
    return data;
  },

  // Crear reseña (requiere autenticación)
  createReview: async (reviewData: {
    productId: string;
    rating: number;
    title?: string;
    comment?: string;
  }) => {
    const { data } = await api.post('/reviews', reviewData);
    return data;
  },

  // Verificar si el usuario ya dejó reseña
  checkUserReview: async (productId: string) => {
    const { data } = await api.get(`/reviews/products/${productId}/check`);
    return data;
  },

  // === ADMIN ===
  getAllReviewsAdmin: async (params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'approved' | 'all';
  }) => {
    const { data } = await api.get('/reviews/admin/all', { params });
    return data;
  },

  updateReviewStatus: async (reviewId: string, isApproved: boolean) => {
    const { data } = await api.patch(`/reviews/admin/${reviewId}/status`, { isApproved });
    return data;
  },

  deleteReviewAdmin: async (reviewId: string) => {
    const { data } = await api.delete(`/reviews/admin/${reviewId}`);
    return data;
  }
};

export default api;
export { accountApi };
export { mercadolibreApi } from './mercadolibreApi';
