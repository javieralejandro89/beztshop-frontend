// src/components/providers/AuthProvider.tsx - Provider de autenticación para tu estructura
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useAuth } from '@/lib/store';

// Componente de loading para la inicialización - Dark Tech Theme
const AuthLoadingScreen = () => (
  <div className="min-h-screen bg-darkbg flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-gold to-cyan rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse shadow-glow-gold">
        <span className="text-darkbg font-bold text-2xl">BS</span>
      </div>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto mb-4"></div>
      <p className="text-gray-400">Inicializando sesión...</p>
    </div>
  </div>
);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { isInitialized, initialize } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Marcar como hidratado después del primer render
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !isInitialized) {
      // Inicializar autenticación al montar el componente
      initialize();
    }
  }, [isHydrated, isInitialized, initialize]);

  // Mostrar loading mientras se inicializa
  if (!isHydrated || !isInitialized) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
};

// Hook personalizado para usar en componentes que requieren autenticación
export const useRequireAuth = (redirectTo: string = '/auth/login') => {
  const { isAuthenticated, isInitialized, user } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      setShouldRedirect(true);
    }
  }, [isInitialized, isAuthenticated]);

  useEffect(() => {
    if (shouldRedirect && typeof window !== 'undefined') {
      const currentPath = window.location.pathname + window.location.search;
      const redirectParam = currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : '';
      router.push(`${redirectTo}${redirectParam}`);
    }
  }, [shouldRedirect, redirectTo, router]);

  return {
    isAuthenticated,
    isInitialized,
    user,
    isLoading: !isInitialized || shouldRedirect,
  };
};

// Hook para proteger rutas de admin
export const useRequireAdmin = (redirectTo: string = '/') => {
  const { isAuthenticated, isInitialized, user } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated || user?.role !== 'ADMIN') {
        setShouldRedirect(true);
      }
    }
  }, [isInitialized, isAuthenticated, user]);

  useEffect(() => {
    if (shouldRedirect && typeof window !== 'undefined') {
      router.push(redirectTo);
    }
  }, [shouldRedirect, redirectTo, router]);

  return {
    isAuthenticated,
    isAdmin: user?.role === 'ADMIN',
    isInitialized,
    user,
    isLoading: !isInitialized || shouldRedirect,
  };
};

// Hook para verificar permisos en tiempo real
export const useAuthPermissions = () => {
  const { user, isAuthenticated } = useAuth();

  return {
    isAuthenticated,
    isAdmin: isAuthenticated && user?.role === 'ADMIN',
    isClient: isAuthenticated && user?.role === 'CLIENT',
    isVIP: isAuthenticated && user?.userLevel === 'VIP',
    isWholesale: isAuthenticated && user?.userLevel === 'WHOLESALE',
    
    // Permisos específicos
    canAccessAdmin: isAuthenticated && user?.role === 'ADMIN',
    canManageProducts: isAuthenticated && user?.role === 'ADMIN',
    canManageOrders: isAuthenticated && user?.role === 'ADMIN',
    canViewAnalytics: isAuthenticated && user?.role === 'ADMIN',
    canManageUsers: isAuthenticated && user?.role === 'ADMIN',
    
    // Permisos de cliente
    canPlaceOrders: isAuthenticated,
    canViewOwnOrders: isAuthenticated,
    canManageProfile: isAuthenticated,
    canAddToWishlist: isAuthenticated,
  };
};

// Component Guard para proteger rutas
interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'CLIENT';
  requiredLevel?: 'REGULAR' | 'VIP' | 'WHOLESALE';
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredRole,
  requiredLevel,
  redirectTo = '/auth/login',
  fallback,
}) => {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isInitialized) {
      // Verificar autenticación
      if (!isAuthenticated) {
        setShouldRedirect(true);
        return;
      }

      // Verificar rol si es requerido
      if (requiredRole && user?.role !== requiredRole) {
        setShouldRedirect(true);
        return;
      }

      // Verificar nivel si es requerido
      if (requiredLevel && user?.userLevel !== requiredLevel) {
        setShouldRedirect(true);
        return;
      }
    }
  }, [isInitialized, isAuthenticated, user, requiredRole, requiredLevel]);

  useEffect(() => {
    if (shouldRedirect && typeof window !== 'undefined') {
      const currentPath = window.location.pathname + window.location.search;
      const redirectParam = currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : '';
      router.push(`${redirectTo}${redirectParam}`);
    }
  }, [shouldRedirect, redirectTo, router]);

  // Mostrar loading mientras inicializa
  if (!isInitialized) {
    return <AuthLoadingScreen />;
  }

  // Mostrar fallback o loading si debe redirigir
  if (shouldRedirect) {
    return fallback || <AuthLoadingScreen />;
  }

  // Si todo está bien, mostrar children
  return <>{children}</>;
};

// HOC para proteger componentes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requiredRole?: 'ADMIN' | 'CLIENT';
    requiredLevel?: 'REGULAR' | 'VIP' | 'WHOLESALE';
    redirectTo?: string;
  } = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

// Hook para logout con confirmación
export const useLogout = () => {
  const { logout, logoutAllDevices } = useAuthStore();
  const router = useRouter();

  const handleLogout = async (allDevices: boolean = false) => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(
        allDevices 
          ? '¿Estás seguro de que quieres cerrar sesión en todos los dispositivos?' 
          : '¿Estás seguro de que quieres cerrar sesión?'
      );
      
      if (!confirmed) return false;
    }

    try {
      if (allDevices) {
        await logoutAllDevices();
      } else {
        await logout();
      }
      
      // Redirigir a página principal
      router.push('/');
      
      return true;
    } catch (error) {
      console.error('Error durante logout:', error);
      return false;
    }
  };

  return { handleLogout };
};