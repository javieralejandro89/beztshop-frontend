// src/lib/adminStore.ts - Store para gestión de admin
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Product } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

interface AdminState {
  products: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    search: string;
    page: number;
    limit: number;
  };
  setProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateFilters: (filters: Partial<AdminState['filters']>) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
}

// Store de autenticación
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      
      login: (user: User, token: string) => {
        set({ 
          user, 
          accessToken: token, 
          isAuthenticated: true 
        });
        
        // Sincronizar con localStorage para axios
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', token);
          localStorage.setItem('user', JSON.stringify(user));
        }
      },
      
      logout: () => {
        set({ 
          user: null, 
          accessToken: null, 
          isAuthenticated: false 
        });
        
        // Limpiar localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      },
      
      updateUser: (userData: Partial<User>) => {
        set((state) => {
          const updatedUser = state.user ? { ...state.user, ...userData } : null;
          
          // Actualizar también en localStorage
          if (typeof window !== 'undefined' && updatedUser) {
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
          
          return { user: updatedUser };
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Store para el panel de admin
export const useAdminStore = create<AdminState>((set) => ({
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    page: 1,
    limit: 10,
  },
  
  setProducts: (products: Product[]) => {
    set({ products });
  },
  
  setSelectedProduct: (product: Product | null) => {
    set({ selectedProduct: product });
  },
  
  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },
  
  setError: (error: string | null) => {
    set({ error });
  },
  
  updateFilters: (newFilters: Partial<AdminState['filters']>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },
  
  addProduct: (product: Product) => {
    set((state) => ({
      products: [product, ...state.products]
    }));
  },
  
  updateProduct: (id: string, updates: Partial<Product>) => {
    set((state) => ({
      products: state.products.map((product) =>
        product.id === id ? { ...product, ...updates } : product
      ),
      selectedProduct: 
        state.selectedProduct?.id === id 
          ? { ...state.selectedProduct, ...updates }
          : state.selectedProduct
    }));
  },
  
  removeProduct: (id: string) => {
    set((state) => ({
      products: state.products.filter((product) => product.id !== id),
      selectedProduct: 
        state.selectedProduct?.id === id ? null : state.selectedProduct
    }));
  },
}));