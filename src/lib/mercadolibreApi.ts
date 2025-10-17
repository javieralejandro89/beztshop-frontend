// src/lib/mercadolibreApi.ts
import api from './api';

export const mercadolibreApi = {
  // Obtener URL de autorización
  getAuthUrl: async () => {
    const { data } = await api.get('/mercadolibre/auth-url');
    return data;
  },

  // Verificar si está autorizado
  checkAuth: async () => {
    const { data } = await api.get('/mercadolibre/check-auth');
    return data;
  },

  // Publicar un producto
  publishProduct: async (productId: string, siteId: string = 'MLM') => {
    const { data } = await api.post('/mercadolibre/publish', {
      productId,
      siteId,
    });
    return data;
  },

  // Publicar múltiples productos
  publishMultipleProducts: async (productIds: string[], siteId: string = 'MLM') => {
    const { data } = await api.post('/mercadolibre/publish-multiple', {
      productIds,
      siteId,
    });
    return data;
  },

  // Obtener productos publicados
  getPublishedProducts: async () => {
    const { data } = await api.get('/mercadolibre/published');
    return data;
  },

  // Actualizar precio
  updatePrice: async (mlItemId: string, price: number) => {
    const { data } = await api.put('/mercadolibre/update-price', {
      mlItemId,
      price,
    });
    return data;
  },

  // Actualizar stock
  updateStock: async (mlItemId: string, quantity: number) => {
    const { data } = await api.put('/mercadolibre/update-stock', {
      mlItemId,
      quantity,
    });
    return data;
  },

  // Cambiar estado
  updateStatus: async (mlItemId: string, status: 'active' | 'paused') => {
    const { data } = await api.put('/mercadolibre/update-status', {
      mlItemId,
      status,
    });
    return data;
  },

  // Eliminar producto
  deleteProduct: async (mlItemId: string) => {
    const { data } = await api.delete(`/mercadolibre/product/${mlItemId}`);
    return data;
  },

  // Sincronizar producto
  syncProduct: async (productId: string) => {
    const { data } = await api.post(`/mercadolibre/sync/${productId}`);
    return data;
  },
};