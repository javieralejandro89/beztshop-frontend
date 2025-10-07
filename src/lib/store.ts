// src/lib/store.ts - Store de autenticación actualizado para tu estructura
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, initializeAuth, clearSession, hasValidToken } from './api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  userLevel: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  isActive?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  
  
  // Actions
  login: (user: User, accessToken: string) => void;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  setUser: (user: User) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initialize: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      isAuthenticated: false,
      isInitialized: false,
      isLoading: false,
      error: null,

      // Función de login
      login: (user: User, accessToken: string) => {
        try {
          // El token ya se guardó en localStorage en authApi.login
          set({
            user,
            isAuthenticated: true,
            error: null,
          });
          
          console.log('Usuario autenticado en store:', user.email);
        } catch (error) {
          console.error('Error en store login:', error);
          set({
            error: 'Error al guardar sesión'
          });
        }
      },

      // Función de logout
      logout: async () => {
        set({ isLoading: true });
        
        try {
          // Llamar logout en backend (limpia refresh token)
          await authApi.logout();
          
          console.log('Logout exitoso desde store');
        } catch (error: any) {
          console.error('Error en logout desde store:', error);
          // Continuar con logout local incluso si falla el backend
        } finally {
          // Limpiar estado local
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            isLoading: false,
          });
          
          // Limpiar tokens (ya se hace en authApi.logout)
          clearSession();
        }
      },

      // Logout de todos los dispositivos
      logoutAllDevices: async () => {
        set({ isLoading: true });
        
        try {
          await authApi.logoutAllDevices();
          console.log('Logout de todos los dispositivos exitoso desde store');
        } catch (error: any) {
          console.error('Error en logout all devices desde store:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            isLoading: false,
          });
          
          clearSession();
        }
      },

      // Actualizar datos del usuario
      setUser: (user: User) => {
        set({ user });
        
        // Actualizar localStorage también
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
        }
      },

      // Manejar errores
      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // Inicializar autenticación desde localStorage
      initialize: async () => {
        if (get().isInitialized) return;
        
        set({ isLoading: true });
        
        try {
          // Verificar si estamos en el cliente
          if (typeof window === 'undefined') {
            set({
              user: null,
              isAuthenticated: false,
              isInitialized: true,
              isLoading: false,
            });
            return;
          }
          
          // Verificar si hay token válido
          if (!hasValidToken()) {
            console.log('No hay token válido al inicializar, sesión no iniciada');
            set({
              user: null,
              isAuthenticated: false,
              isInitialized: true,
              isLoading: false,
            });
            return;
          }
          
          // Intentar obtener datos del usuario desde localStorage
          const userData = localStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            
            // Inicializar API con token existente
            initializeAuth();
            
            // Verificar que el token sigue siendo válido con el backend
            try {
  const verifyResponse = await authApi.verifyToken();
  
  // ✅ AGREGAR: Log para ver qué devuelve verifyToken
  console.log('🔍 verifyToken response:', verifyResponse);
  
  // ✅ CORRECCIÓN: Usar datos del localStorage si verifyToken no tiene firstName
  let finalUser = verifyResponse.user;
  if (!finalUser.firstName && user && user.firstName) {
    console.log('🔧 Combinando datos: localStorage tiene más info que verifyToken');
    finalUser = { ...verifyResponse.user, ...user };
  }
  
  set({
    user: finalUser,
    isAuthenticated: true,
    isInitialized: true,
    isLoading: false,
    error: null,
  });
  
  console.log('Sesión restaurada desde store:', finalUser.email, 'firstName:', finalUser.firstName);
            } catch (verifyError: any) {
              console.log('Token inválido al inicializar, limpiando sesión');
              
              // Si falla la verificación, limpiar sesión
              clearSession();
              set({
                user: null,
                isAuthenticated: false,
                isInitialized: true,
                isLoading: false,
                error: null,
              });
            }
          } else {
            // No hay datos de usuario guardados
            set({
              user: null,
              isAuthenticated: false,
              isInitialized: true,
              isLoading: false,
            });
          }
        } catch (error: any) {
          console.error('Error inicializando auth desde store:', error);
          
          // En caso de error, limpiar sesión
          clearSession();
          set({
            user: null,
            isAuthenticated: false,
            isInitialized: true,
            isLoading: false,
            error: 'Error al inicializar sesión'
          });
        }
      },

      // Refrescar datos del usuario
      refreshUserData: async () => {
        if (!get().isAuthenticated) return;
        
        try {
          const response = await authApi.getProfile();
          const updatedUser = response.user;
          
          set({ user: updatedUser });
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
          
          console.log('Datos del usuario actualizados desde store');
        } catch (error: any) {
          console.error('Error refrescando datos del usuario desde store:', error);
          
          // Si falla, podría ser que el token expiró
          if (error.response?.status === 401) {
            console.log('Token expirado durante refresh de datos');
            set({
              user: null,
              isAuthenticated: false,
              error: null,
            });
            clearSession();
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      // Solo persistir datos básicos, no funciones
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Restaurar estado desde localStorage
      onRehydrateStorage: () => (state) => {
  if (state) {
    // Marcar como no inicializado para forzar verificación
    state.isInitialized = false;
    state.isLoading = false;
    state.error = null;
    console.log('Store rehydrated desde localStorage');
    
    // ✅ AGREGAR: Forzar inicialización después de rehidratar
    // Ejecutar después del render para que el AuthProvider pueda llamar initialize()
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        console.log('🔄 Forzando verificación de auth después de rehidratación...');
        // El AuthProvider debería detectar isInitialized = false y llamar initialize()
      }, 50);
    }
  }
},
    }
  )
);

// Selector hooks para componentes (mantener compatibilidad con tu estructura)
export const useAuth = () => {
  const { 
    user, 
    isAuthenticated, 
    isInitialized, 
    isLoading, 
    error 
  } = useAuthStore();
  
  return { 
    user, 
    isAuthenticated, 
    isInitialized, 
    isLoading, 
    error 
  };
};

export const useAuthActions = () => {
  const {
    login,
    logout,
    logoutAllDevices,
    setUser,
    setError,
    clearError,
    initialize,
    refreshUserData,
  } = useAuthStore();
  
  return {
    login,
    logout,
    logoutAllDevices,
    setUser,
    setError,
    clearError,
    initialize,
    refreshUserData,
  };
};

// Hook personalizado para verificar permisos (compatible con tu estructura)
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();
  
  return {
    isAuthenticated,
    isAdmin: isAuthenticated && user?.role === 'ADMIN',
    isClient: isAuthenticated && user?.role === 'CLIENT',
    isVIP: isAuthenticated && user?.userLevel === 'VIP',
    isWholesale: isAuthenticated && user?.userLevel === 'WHOLESALE',
    canAccessAdmin: isAuthenticated && user?.role === 'ADMIN',
    canManageProducts: isAuthenticated && user?.role === 'ADMIN',
    canViewOrders: isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'CLIENT'),
  };
};

// Export por defecto del store para compatibilidad
export default useAuthStore;