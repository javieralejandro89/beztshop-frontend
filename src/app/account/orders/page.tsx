// src/app/account/orders/page.tsx - Historial de pedidos con filtros Dark Tech
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Package,
  Search,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  RefreshCcw
} from 'lucide-react';
import Header from '@/components/Header';
import { useAuthStore } from '@/lib/store';
import { useToast } from '@/hooks/useToast';
import { formatPrice, formatDate } from '@/lib/utils';
import accountApi, { type Order } from '@/lib/accountApi';

interface OrderFilters {
  search: string;
  status: string;
  paymentStatus: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function OrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { error, promise } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Filtros
  const [filters, setFilters] = useState<OrderFilters>({
  search: searchParams.get('search') || '',
  status: searchParams.get('status') || 'all',
  paymentStatus: searchParams.get('paymentStatus') || 'all',
  dateFrom: searchParams.get('dateFrom') || '',
  dateTo: searchParams.get('dateTo') || '',
  sortBy: searchParams.get('sortBy') || 'createdAt',
  sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
});

  const memoizedFilters = useMemo(() => filters, [
  filters.search,
  filters.status, 
  filters.paymentStatus,
  filters.dateFrom,
  filters.dateTo,
  filters.sortBy,
  filters.sortOrder
]);

useEffect(() => {
  if (!isAuthenticated) {
    router.push('/auth/login?redirect=/account/orders');
    return;
  }
  loadOrders();
}, [isAuthenticated, currentPage, memoizedFilters]);

  const loadOrders = useCallback(async () => {
  try {
    setIsLoading(true);
    
    // Construir parámetros de búsqueda
    const params: any = {
      page: currentPage,
      limit: 10,
      ...memoizedFilters
    };

    // Limpiar parámetros vacíos y valores 'all'
    Object.keys(params).forEach(key => {
      if (!params[key] || params[key] === 'all') {
        delete params[key];
      }
    });

    const response = await accountApi.getOrders(params);
    setOrders(response.orders);
    setPagination(response.pagination);

  } catch (err: any) {
    console.error('Error loading orders:', err);
    error('Error al cargar el historial de pedidos');
    
    // Si es error de autenticación, redirigir
    if (err.response?.status === 401) {
      router.push('/auth/login?redirect=/account/orders');
    }
  } finally {
    setIsLoading(false);
  }
}, [currentPage, memoizedFilters, error, router]);

  const handleFilterChange = (key: keyof OrderFilters, value: string) => {
  // Convertir "all" a string vacío para la API
  const filterValue = value === 'all' ? '' : value;
  setFilters(prev => ({ ...prev, [key]: filterValue }));
  setCurrentPage(1); // Reset página al cambiar filtros
};

  const clearFilters = () => {
  setFilters({
    search: '',
    status: 'all',
    paymentStatus: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  setCurrentPage(1);
};

  const downloadInvoice = async (orderId: string, orderNumber: string) => {
    try {
      setIsDownloading(orderId);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/orders/${orderId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al descargar la factura');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err: any) {
      console.error('Error downloading invoice:', err);
      error(err.message || 'Error al descargar la factura');
    } finally {
      setIsDownloading(null);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gold" />;
      case 'processing':
      case 'confirmed':
        return <Package className="h-4 w-4 text-cyan" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-cyan" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-gold" />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: Order['status']) => {
    const statusMap = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      processing: 'Procesando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado'
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusText = (status: Order['paymentStatus']) => {
    const statusMap = {
      pending: 'Pendiente',
      paid: 'Pagado',
      failed: 'Fallido',
      refunded: 'Reembolsado',
      partially_refunded: 'Parcialmente Reembolsado'
    };
    return statusMap[status] || status;
  };

  const canDownloadInvoice = (order: Order) => {
    return ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-darkbg">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/account')}
            className="p-2 text-white hover:text-gold hover:bg-darkbg-light"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Package className="h-8 w-8 text-gold" />
              Historial de Pedidos
            </h1>
            <p className="text-gray-400 mt-2">
              {pagination.total} pedido{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6 bg-darkbg-light border-gold/20">
          <CardHeader className="border-b border-gold/10">
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
    <CardTitle className="text-lg sm:text-xl text-white">Filtros de Búsqueda</CardTitle>
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowFilters(!showFilters)}
        className="w-full sm:w-auto text-xs sm:text-sm bg-darkbg border-gold/30 text-white hover:bg-gold hover:text-darkbg hover:border-gold"
      >
        <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
        {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={clearFilters}
        className="w-full sm:w-auto text-xs sm:text-sm bg-darkbg border-cyan/30 text-white hover:bg-cyan hover:text-darkbg hover:border-cyan"
      >
        <RefreshCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
        Limpiar
      </Button>
    </div>
  </div>
</CardHeader>
          
          {showFilters && (
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Búsqueda */}
                <div>
                  <Label htmlFor="search" className="text-gray-300">Buscar por número de pedido</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="search"
                      placeholder="Ej: ORD-123456"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-10 bg-darkbg border-gold/20 text-white placeholder-gray-500 focus:border-gold focus:ring-gold/50"
                    />
                  </div>
                </div>

                {/* Estado del pedido */}
                <div>
                  <Label className="text-gray-300">Estado del Pedido</Label>
                  <Select 
                    value={filters.status} 
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger className="bg-darkbg border-gold/20 text-white focus:border-gold focus:ring-gold/50">
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent className="bg-darkbg-light border-gold/20">
                      <SelectItem value="all" className="text-white hover:bg-darkbg hover:text-gold">Todos los estados</SelectItem>
                      <SelectItem value="pending" className="text-white hover:bg-darkbg hover:text-gold">Pendiente</SelectItem>
                      <SelectItem value="confirmed" className="text-white hover:bg-darkbg hover:text-gold">Confirmado</SelectItem>
                      <SelectItem value="processing" className="text-white hover:bg-darkbg hover:text-gold">Procesando</SelectItem>
                      <SelectItem value="shipped" className="text-white hover:bg-darkbg hover:text-gold">Enviado</SelectItem>
                      <SelectItem value="delivered" className="text-white hover:bg-darkbg hover:text-gold">Entregado</SelectItem>
                      <SelectItem value="cancelled" className="text-white hover:bg-darkbg hover:text-gold">Cancelado</SelectItem>
                      <SelectItem value="refunded" className="text-white hover:bg-darkbg hover:text-gold">Reembolsado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Estado del pago */}
                <div>
                  <Label className="text-gray-300">Estado del Pago</Label>
                  <Select 
                    value={filters.paymentStatus} 
                    onValueChange={(value) => handleFilterChange('paymentStatus', value)}
                  >
                    <SelectTrigger className="bg-darkbg border-gold/20 text-white focus:border-gold focus:ring-gold/50">
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent className="bg-darkbg-light border-gold/20">
                      <SelectItem value="all" className="text-white hover:bg-darkbg hover:text-gold">Todos los estados</SelectItem>
                      <SelectItem value="pending" className="text-white hover:bg-darkbg hover:text-gold">Pendiente</SelectItem>
                      <SelectItem value="paid" className="text-white hover:bg-darkbg hover:text-gold">Pagado</SelectItem>
                      <SelectItem value="failed" className="text-white hover:bg-darkbg hover:text-gold">Fallido</SelectItem>
                      <SelectItem value="refunded" className="text-white hover:bg-darkbg hover:text-gold">Reembolsado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fecha desde */}
                <div>
                  <Label htmlFor="dateFrom" className="text-gray-300">Fecha desde</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="bg-darkbg border-gold/20 text-white focus:border-gold focus:ring-gold/50"
                  />
                </div>

                {/* Fecha hasta */}
                <div>
                  <Label htmlFor="dateTo" className="text-gray-300">Fecha hasta</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="bg-darkbg border-gold/20 text-white focus:border-gold focus:ring-gold/50"
                  />
                </div>

                {/* Ordenar por */}
                <div>
                  <Label className="text-gray-300">Ordenar por</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={filters.sortBy} 
                      onValueChange={(value) => handleFilterChange('sortBy', value)}
                    >
                      <SelectTrigger className="bg-darkbg border-gold/20 text-white focus:border-gold focus:ring-gold/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-darkbg-light border-gold/20">
                        <SelectItem value="createdAt" className="text-white hover:bg-darkbg hover:text-gold">Fecha de creación</SelectItem>
                        <SelectItem value="totalAmount" className="text-white hover:bg-darkbg hover:text-gold">Monto total</SelectItem>
                        <SelectItem value="orderNumber" className="text-white hover:bg-darkbg hover:text-gold">Número de pedido</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={filters.sortOrder} 
                      onValueChange={(value) => handleFilterChange('sortOrder', value)}
                    >
                      <SelectTrigger className="w-24 bg-darkbg border-gold/20 text-white focus:border-gold focus:ring-gold/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-darkbg-light border-gold/20">
                        <SelectItem value="desc" className="text-white hover:bg-darkbg hover:text-gold">↓</SelectItem>
                        <SelectItem value="asc" className="text-white hover:bg-darkbg hover:text-gold">↑</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Lista de pedidos */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gold" />
            <div className="text-lg text-white">Cargando pedidos...</div>
          </div>
        ) : orders.length === 0 ? (
          <Card className="bg-darkbg-light border-gold/20">
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 text-gray-600 mx-auto mb-6" />
              <h2 className="text-xl font-semibold text-white mb-4">
                No se encontraron pedidos
              </h2>
              <p className="text-gray-400 mb-8">
                {Object.values(filters).some(v => v) 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Aún no has realizado ningún pedido'
                }
              </p>
              {!Object.values(filters).some(v => v) && (
                <Button asChild className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-semibold">
                  <Link href="/products">Empezar a comprar</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-glow-gold transition-all bg-darkbg-light border-gold/20">
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4 sm:space-y-6 lg:flex-row lg:gap-6 lg:space-y-0">
  {/* Información principal */}
  <div className="flex-1">
    {/* Header móvil - vertical */}
    <div className="block sm:hidden space-y-3 mb-4">
      <div>
        <h3 className="text-base font-semibold text-white">
          Pedido #{order.orderNumber}
        </h3>
        <p className="text-xs text-gray-400">
          {formatDate(order.date)}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold text-gold">
          {formatPrice(order.total)}
        </div>
        <Badge variant="outline" className="flex items-center gap-1 text-xs border-cyan/30 text-cyan">
          {getStatusIcon(order.status)}
          {getStatusText(order.status)}
        </Badge>
      </div>
    </div>
    
    {/* Header escritorio - horizontal */}
    <div className="hidden sm:flex sm:items-center sm:justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-white">
          Pedido #{order.orderNumber}
        </h3>
        <p className="text-sm text-gray-400">
          {formatDate(order.date)}
        </p>
      </div>
      <div className="text-right">
        <div className="text-xl font-bold text-gold">
          {formatPrice(order.total)}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="flex items-center gap-1 border-cyan/30 text-cyan">
            {getStatusIcon(order.status)}
            {getStatusText(order.status)}
          </Badge>
        </div>
      </div>
    </div>

                      {/* Productos del pedido */}
                      <div className="space-y-2">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
  <div className="flex-shrink-0">
    <div className="w-12 h-12 sm:w-20 sm:h-20 bg-darkbg rounded-lg overflow-hidden border border-gold/20">
                                                      {item.product ? (
                                                        <Image
                                                          src={item.product.image || '/placeholder-product.jpg'}
                                                          alt={item.productName}
                                                          width={80}
                                                          height={90}
                                                          className="w-full h-full object-cover"
                                                          onError={(e) => {
                                                            (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                                                          }}
                                                        />
                                                      ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                          <Package className="h-8 w-8 text-gray-600" />
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                            <div className="flex-1">
                              <span className="font-medium text-white">{item.productName}</span>
                              <span className="text-gray-400 ml-2">x{item.quantity}</span>
                            </div>
                            <span className="font-medium text-gray-300">
                              {formatPrice(item.totalPrice)}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-sm text-gray-400">
                            +{order.items.length - 3} producto{order.items.length - 3 !== 1 ? 's' : ''} más
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-48">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                        className="bg-darkbg border-cyan/30 text-white hover:bg-cyan hover:text-darkbg hover:border-cyan"
                      >
                        <Link href={`/account/orders/${order.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </Link>
                      </Button>
                      
                      {canDownloadInvoice(order) && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => downloadInvoice(order.id, order.orderNumber)}
                          disabled={isDownloading === order.id}
                          className="bg-darkbg border-gold/30 text-white hover:bg-gold hover:text-darkbg hover:border-gold"
                        >
                          {isDownloading === order.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          Factura
                        </Button>
                      )}

                      {order.trackingNumber && (
                        <Badge variant="outline" className="justify-center border-cyan/30 text-cyan">
                          <Truck className="h-3 w-3 mr-1" />
                          {order.trackingNumber}
                        </Badge>
                      )}

                      <Badge 
                        variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}
                        className={order.paymentStatus === 'paid' ? 'justify-center bg-gradient-to-r from-gold to-cyan text-darkbg border-0' : 'justify-center bg-darkbg-light border-gray-600 text-gray-300'}
                      >
                        {getPaymentStatusText(order.paymentStatus)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Paginación */}
        {pagination.pages > 1 && (
  <div className="flex justify-center items-center gap-2 sm:gap-4 mt-8 px-4">
    <Button
      variant="outline"
      disabled={!pagination.hasPrev}
      onClick={() => setCurrentPage(currentPage - 1)}
      className="flex-shrink-0 text-xs sm:text-sm bg-darkbg border-gold/30 text-white hover:bg-gold hover:text-darkbg hover:border-gold disabled:opacity-50 disabled:cursor-not-allowed"
      size="sm"
    >
      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
      <span className="hidden xs:inline">Anterior</span>
      <span className="xs:hidden">Ant</span>
    </Button>
    
    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-[200px] sm:max-w-none">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const pageNum = currentPage <= 3 
                  ? i + 1 
                  : currentPage >= pagination.pages - 2
                    ? pagination.pages - 4 + i
                    : currentPage - 2 + i;
                
                if (pageNum < 1 || pageNum > pagination.pages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={currentPage === pageNum 
                      ? "bg-gradient-to-r from-gold to-cyan text-darkbg border-0" 
                      : "bg-darkbg border-gold/30 text-white hover:bg-gold hover:text-darkbg hover:border-gold"
                    }
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
  variant="outline"
  disabled={!pagination.hasNext}
  onClick={() => setCurrentPage(currentPage + 1)}
  className="flex-shrink-0 text-xs sm:text-sm bg-darkbg border-gold/30 text-white hover:bg-gold hover:text-darkbg hover:border-gold disabled:opacity-50 disabled:cursor-not-allowed"
  size="sm"
>
  <span className="hidden xs:inline">Siguiente</span>
  <span className="xs:hidden">Sig</span>
  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
</Button>
          </div>
        )}
      </main>
    </div>
  );
}