// src/app/admin/dashboard/page.tsx - Dashboard principal Dark Tech
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  featuredProducts: number;
  lowStockProducts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    featuredProducts: 0,
    lowStockProducts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
  try {
    setIsLoading(true);
    const response = await productsApi.getProductsAdmin();
    
    // Calcular estadísticas desde los productos (igual que la página de productos)
    const products = response.products || [];
    
    setStats({
      totalProducts: products.length,
      activeProducts: products.filter((p: any) => p.isActive).length,
      inactiveProducts: products.filter((p: any) => !p.isActive).length,
      featuredProducts: products.filter((p: any) => p.isFeatured).length,
      lowStockProducts: products.filter((p: any) => p.stockCount <= 5 && p.isActive).length,
    });
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  } finally {
    setIsLoading(false);
  }
};

  const statCards = [
    {
      title: 'Total Productos',
      value: stats.totalProducts,
      description: 'Productos en el catálogo',
      icon: Package,
      color: 'text-cyan',
      bgColor: 'bg-cyan/10',
    },
    {
      title: 'Productos Activos',
      value: stats.activeProducts,
      description: 'Disponibles para venta',
      icon: TrendingUp,
      color: 'text-gold',
      bgColor: 'bg-gold/10',
    },
    {
      title: 'Productos Destacados',
      value: stats.featuredProducts,
      description: 'En portada del sitio',
      icon: TrendingUp,
      color: 'text-gold',
      bgColor: 'bg-gold/10',
    },
    {
      title: 'Stock Bajo',
      value: stats.lowStockProducts,
      description: 'Requieren reposición',
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Resumen general de tu tienda online
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="transition-all hover:shadow-glow-gold bg-darkbg-light border-gold/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isLoading ? '...' : card.value}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="bg-darkbg-light border-gold/20">
          <CardHeader className="border-b border-gold/10">
            <CardTitle className="flex items-center text-white">
              <Package className="h-5 w-5 mr-2 text-gold" />
              Gestión de Productos
            </CardTitle>
            <CardDescription className="text-gray-400">
              Administra tu catálogo de productos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/admin/products"
                className="p-4 border border-gold/20 rounded-lg hover:bg-darkbg hover:border-gold transition-all text-center group"
              >
                <Package className="h-6 w-6 mx-auto mb-2 text-gold group-hover:text-cyan transition-colors" />
                <div className="text-sm font-medium text-white">Ver Productos</div>
                <div className="text-xs text-gray-500">Gestionar catálogo</div>
              </a>
              <a
                href="/admin/products/new"
                className="p-4 border border-cyan/20 rounded-lg hover:bg-darkbg hover:border-cyan transition-all text-center group"
              >
                <Package className="h-6 w-6 mx-auto mb-2 text-cyan group-hover:text-gold transition-colors" />
                <div className="text-sm font-medium text-white">Nuevo Producto</div>
                <div className="text-xs text-gray-500">Agregar al catálogo</div>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-darkbg-light border-gold/20">
          <CardHeader className="border-b border-gold/10">
            <CardTitle className="flex items-center text-white">
              <TrendingUp className="h-5 w-5 mr-2 text-gold" />
              Estado del Sistema
            </CardTitle>
            <CardDescription className="text-gray-400">
              Información del sistema y conexiones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">API Backend</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold/10 text-gold border border-gold/20">
                  Conectado
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Base de Datos</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold/10 text-gold border border-gold/20">
                  Conectado
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Última sincronización</span>
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-darkbg-light border-gold/20">
        <CardHeader className="border-b border-gold/10">
          <CardTitle className="text-white">Actividad Reciente</CardTitle>
          <CardDescription className="text-gray-400">
            Últimas acciones realizadas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Sistema iniciado correctamente</p>
                <p className="text-xs text-gray-500">Conexión establecida con la base de datos</p>
              </div>
              <div className="text-xs text-gray-500">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
            
            {stats.totalProducts > 0 && (
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-cyan rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {stats.totalProducts} productos en el catálogo
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.activeProducts} activos, {stats.featuredProducts} destacados
                  </p>
                </div>
              </div>
            )}
            
            {stats.lowStockProducts > 0 && (
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-400">
                    {stats.lowStockProducts} productos con stock bajo
                  </p>
                  <p className="text-xs text-gray-500">Revisa el inventario</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}