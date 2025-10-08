// src/app/admin/layout.tsx - Layout del panel de administración Dark Tech
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  Menu
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Verificar autenticación al cargar
    if (!isAuthenticated || !user) {
      router.push('/admin/login');
      return;
    }

    // Verificar que sea admin
    if (user.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };

  // No mostrar layout en la página de login
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // No renderizar si no está autenticado
  if (!isAuthenticated || !user || user.role !== 'ADMIN') {
    return null;
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      current: pathname === '/admin/dashboard'
    },
    {
      name: 'Productos',
      href: '/admin/products',
      icon: Package,
      current: pathname.startsWith('/admin/products')
    },
    {
      name: 'Pedidos',
      href: '/admin/orders',
      icon: ShoppingCart,
      current: pathname.startsWith('/admin/orders')
    },
    {
      name: 'Usuarios',
      href: '/admin/users',
      icon: Users,
      current: pathname.startsWith('/admin/users')
    },
    {
      name: 'Configuración',
      href: '/admin/settings',
      icon: Settings,
      current: pathname.startsWith('/admin/settings')
    },
  ];

  return (
    <div className="min-h-screen bg-darkbg">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-darkbg-light shadow-glow-gold border-r border-gold/20">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gold/20">
            <h1 className="text-xl font-bold bg-gradient-to-r from-gold to-cyan bg-clip-text text-transparent">
              BeztShop
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all
                    ${item.current
                      ? 'bg-gradient-to-r from-gold/10 to-cyan/10 text-gold border-r-2 border-gold shadow-glow-gold'
                      : 'text-gray-400 hover:bg-darkbg hover:text-white hover:border-l-2 hover:border-cyan'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 mr-3 ${item.current ? 'text-gold' : ''}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="border-t border-gold/20 p-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-gold to-cyan rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm font-medium text-darkbg">
                    {(user.firstName || 'User').charAt(0)}{(user.lastName || 'System').charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full justify-start bg-darkbg border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <div className="bg-darkbg-light shadow-sm border-b border-gold/20">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Panel de Administración
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">
                  Bienvenido, {user.firstName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}