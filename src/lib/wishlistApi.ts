// src/lib/wishlistApi.ts - API para gestión de wishlist
import api from './api';
import type { Product, PaginatedResponse } from '@/types';

export interface WishlistItem {
  id: string;
  productId: string;
  addedAt: string;
  product: Product;
}

export interface WishlistResponse {
  items: WishlistItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface WishlistStatus {
  inWishlist: boolean;
  wishlistItemId: string | null;
}

export const wishlistApi = {
  // Obtener wishlist completa
  getWishlist: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<WishlistResponse> => {
    const { data } = await api.get('/wishlist', { params });
    return data;
  },

  // Agregar producto a wishlist
  addToWishlist: async (productId: string): Promise<{ item: WishlistItem; message: string }> => {
    const { data } = await api.post('/wishlist/add', { productId });
    return data;
  },

  // Eliminar producto de wishlist
  removeFromWishlist: async (productId: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/wishlist/remove/${productId}`);
    return data;
  },

  // Verificar si producto está en wishlist
  // Verificar si producto está en wishlist
checkWishlistStatus: async (productId: string): Promise<WishlistStatus> => {
  try {
    const { data } = await api.get(`/wishlist/check/${productId}`);
    return data;
  } catch (error: any) {
    console.error('Error checking wishlist status:', error);
    // Retornar valor por defecto en caso de error
    return {
      inWishlist: false,
      wishlistItemId: null
    };
  }
},

  // Limpiar toda la wishlist
  clearWishlist: async (): Promise<{ message: string; deletedCount: number }> => {
    const { data } = await api.delete('/wishlist/clear');
    return data;
  },

  // Toggle wishlist (agregar o quitar según estado actual)
  toggleWishlist: async (productId: string): Promise<{ 
    action: 'added' | 'removed'; 
    inWishlist: boolean; 
    message: string 
  }> => {
    try {
      // Primero verificar estado actual
      const status = await wishlistApi.checkWishlistStatus(productId);
      
      if (status.inWishlist) {
        // Remover si está en wishlist
        await wishlistApi.removeFromWishlist(productId);
        return {
          action: 'removed',
          inWishlist: false,
          message: 'Producto eliminado de favoritos'
        };
      } else {
        // Agregar si no está en wishlist
        await wishlistApi.addToWishlist(productId);
        return {
          action: 'added',
          inWishlist: true,
          message: 'Producto agregado a favoritos'
        };
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al actualizar favoritos');
    }
  }
};

export default wishlistApi;