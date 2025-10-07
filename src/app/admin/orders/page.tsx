// src/app/admin/orders/page.tsx - Gestión de ordenes con filtros CORREGIDOS
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Package,
  Search,
  Filter,
  Eye,
  Edit,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Loader2,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Send,
  User
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatPrice, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { adminApi } from '@/lib/api';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  product?: {
    id: string;
    images?: any;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  guestEmail?: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  paymentMethod?: string;
  shippingAddress: any;
  billingAddress?: any;
  notes?: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  items: OrderItem[];
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

interface OrderFilters {
  search: string;
  status: string;
  paymentStatus: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { success, error, promise } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);

  // NUEVO: Estado para debounce de búsqueda
  const [searchInput, setSearchInput] = useState('');

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
    search: '',
    status: '',
    paymentStatus: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Formularios
  const [statusForm, setStatusForm] = useState({
    status: '',
    trackingNumber: '',
    notes: '',
    notifyCustomer: true
  });

  const [notificationForm, setNotificationForm] = useState({
    subject: '',
    message: '',
    type: 'ORDER_UPDATE' as const
  });

  // NUEVO: Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    loadOrders();
  }, [currentPage, filters]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      
      const data = await adminApi.getOrders({
        page: currentPage,
        limit: 10,
        ...filters
      });

      setOrders(data.orders);
      setPagination(data.pagination);

    } catch (err: any) {
      console.error('Error loading orders:', err);
      error('Error al cargar los pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  // CORREGIDO: Función handleFilterChange
  const handleFilterChange = (key: keyof OrderFilters, value: string) => {
    const actualValue = value === 'all' ? '' : value;
    setFilters(prev => ({ ...prev, [key]: actualValue }));
    setCurrentPage(1);
  };

  // CORREGIDO: Función clearFilters
  const clearFilters = () => {
    setSearchInput(''); // Limpiar también el input
    setFilters({
      search: '',
      status: '',
      paymentStatus: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setCurrentPage(1);
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const openStatusUpdate = (order: Order) => {
    setSelectedOrder(order);
    setStatusForm({
      status: order.status,
      trackingNumber: order.trackingNumber || '',
      notes: '',
      notifyCustomer: true
    });
    setShowStatusModal(true);
  };

  const openNotifyModal = (order: Order) => {
    setSelectedOrder(order);
    const customerName = order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Cliente';
    setNotificationForm({
      subject: `Actualización de tu pedido #${order.orderNumber}`,
      message: `Hola ${customerName},\n\nTe informamos sobre una actualización en tu pedido #${order.orderNumber}.\n\nGracias por comprar con ServiPro Garcia LLC.`,
      type: 'ORDER_UPDATE'
    });
    setShowNotifyModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;

    try {
      await promise(
        adminApi.updateOrderStatus(selectedOrder.id, {
          status: statusForm.status,
          trackingNumber: statusForm.trackingNumber || undefined,
          notes: statusForm.notes || undefined,
          notifyCustomer: statusForm.notifyCustomer
        }),
        {
          loading: 'Actualizando estado del pedido...',
          success: 'Estado del pedido actualizado exitosamente',
          error: 'Error al actualizar estado del pedido'
        }
      );

      setShowStatusModal(false);
      loadOrders();

    } catch (err: any) {
      console.error('Error updating order status:', err);
    }
  };

  const handleSendNotification = async () => {
    if (!selectedOrder) return;

    try {
      await promise(
        adminApi.sendCustomNotification(selectedOrder.id, notificationForm),
        {
          loading: 'Enviando notificación...',
          success: 'Notificación enviada exitosamente',
          error: 'Error al enviar notificación'
        }
      );

      setShowNotifyModal(false);

    } catch (err: any) {
      console.error('Error sending notification:', err);
    }
  };

  const downloadInvoice = async (order: Order) => {
  try {
    const blob = await adminApi.generateInvoice(order.id);
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factura-${order.orderNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    success('Factura descargada exitosamente');

  } catch (err: any) {
    console.error('Error downloading invoice:', err);
    error('Error al descargar la factura');
  }
};

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'CONFIRMED':
      case 'PROCESSING':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'SHIPPED':
        return <Truck className="h-4 w-4 text-purple-500" />;
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CANCELLED':
      case 'REFUNDED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: Order['status']) => {
    const statusMap = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmado',
      PROCESSING: 'Procesando',
      SHIPPED: 'Enviado',
      DELIVERED: 'Entregado',
      CANCELLED: 'Cancelado',
      REFUNDED: 'Reembolsado'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: Order['status']) => {
    const colorMap = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusText = (status: Order['paymentStatus']) => {
    const statusMap = {
      PENDING: 'Pendiente',
      PAID: 'Pagado',
      FAILED: 'Fallido',
      REFUNDED: 'Reembolsado',
      PARTIALLY_REFUNDED: 'Parcialmente Reembolsado'
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    const colorMap = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-red-100 text-red-800',
      PARTIALLY_REFUNDED: 'bg-orange-100 text-orange-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin/dashboard')}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="h-8 w-8 text-primary-600" />
              Gestión de Pedidos
            </h1>
            <p className="text-gray-600 mt-2">
              {pagination.total} pedido{pagination.total !== 1 ? 's' : ''} en total
            </p>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  type="button"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearFilters}
                  type="button"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadOrders}
                  type="button"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {showFilters && (
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Búsqueda CORREGIDA */}
                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Número, email..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="pl-10"
                    />
                    {searchInput !== filters.search && searchInput.length > 0 && (
                      <div className="absolute right-3 top-3">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Estado del pedido CORREGIDO */}
                <div>
                  <Label>Estado del Pedido</Label>
                  <Select 
                    value={filters.status || 'all'} 
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="PENDING">Pendiente</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                      <SelectItem value="PROCESSING">Procesando</SelectItem>
                      <SelectItem value="SHIPPED">Enviado</SelectItem>
                      <SelectItem value="DELIVERED">Entregado</SelectItem>
                      <SelectItem value="CANCELLED">Cancelado</SelectItem>
                      <SelectItem value="REFUNDED">Reembolsado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Estado del pago CORREGIDO */}
                <div>
                  <Label>Estado del Pago</Label>
                  <Select 
                    value={filters.paymentStatus || 'all'} 
                    onValueChange={(value) => handleFilterChange('paymentStatus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="PENDING">Pendiente</SelectItem>
                      <SelectItem value="PAID">Pagado</SelectItem>
                      <SelectItem value="FAILED">Fallido</SelectItem>
                      <SelectItem value="REFUNDED">Reembolsado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fecha desde */}
                <div>
                  <Label htmlFor="dateFrom">Fecha desde</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                </div>

                {/* Fecha hasta */}
                <div>
                  <Label htmlFor="dateTo">Fecha hasta</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  />
                </div>

                {/* Ordenar */}
                <div>
                  <Label>Ordenar por</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={filters.sortBy} 
                      onValueChange={(value) => handleFilterChange('sortBy', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Fecha</SelectItem>
                        <SelectItem value="totalAmount">Monto</SelectItem>
                        <SelectItem value="orderNumber">Número</SelectItem>
                        <SelectItem value="status">Estado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={filters.sortOrder} 
                      onValueChange={(value) => handleFilterChange('sortOrder', value)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">↓</SelectItem>
                        <SelectItem value="asc">↑</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Lista de pedidos */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <div className="text-lg">Cargando pedidos...</div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  No se encontraron pedidos
                </h2>
                <p className="text-gray-600">
                  Ajusta los filtros de búsqueda
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Pedido #{order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{getStatusText(order.status)}</span>
                        </Badge>
                        <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                          <DollarSign className="h-3 w-3 mr-1" />
                          {getPaymentStatusText(order.paymentStatus)}
                        </Badge>
                        {order.trackingNumber && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Truck className="h-3 w-3" />
                            {order.trackingNumber}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {order.user ? (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {order.user.firstName} {order.user.lastName}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {order.guestEmail}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openOrderDetails(order)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openStatusUpdate(order)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Actualizar Estado
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openNotifyModal(order)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Notificar
                        </Button>
                        {['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadInvoice(order)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Factura
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paginación */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <Button
              variant="outline"
              disabled={!pagination.hasPrev}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            
            <span className="text-sm text-gray-600">
              Página {currentPage} de {pagination.pages}
            </span>
            
            <Button
              variant="outline"
              disabled={!pagination.hasNext}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Modal de detalles del pedido */}
        <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Detalles del Pedido #{selectedOrder?.orderNumber}
              </DialogTitle>
              <DialogDescription>
                Información completa del pedido y cliente
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                {/* Información del pedido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información del Pedido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <Badge className={getStatusColor(selectedOrder.status)}>
                          {getStatusIcon(selectedOrder.status)}
                          <span className="ml-1">{getStatusText(selectedOrder.status)}</span>
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pago:</span>
                        <Badge className={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                          {getPaymentStatusText(selectedOrder.paymentStatus)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Método de pago:</span>
                        <span>{selectedOrder.paymentMethod || 'No especificado'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fecha del pedido:</span>
                        <span>{formatDate(selectedOrder.createdAt)}</span>
                      </div>
                      {selectedOrder.trackingNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Número de seguimiento:</span>
                          <span className="font-mono">{selectedOrder.trackingNumber}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información del Cliente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedOrder.user ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nombre:</span>
                            <span>{selectedOrder.user.firstName} {selectedOrder.user.lastName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span>{selectedOrder.user.email}</span>
                          </div>
                          {selectedOrder.user.phone && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Teléfono:</span>
                              <span>{selectedOrder.user.phone}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email (invitado):</span>
                          <span>{selectedOrder.guestEmail}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Direcciones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Dirección de Envío</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm space-y-1">
                        <p>{selectedOrder.shippingAddress.name}</p>
                        <p>{selectedOrder.shippingAddress.street}</p>
                        <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                        <p>{selectedOrder.shippingAddress.country}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedOrder.billingAddress && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Dirección de Facturación</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm space-y-1">
                          <p>{selectedOrder.billingAddress.name}</p>
                          <p>{selectedOrder.billingAddress.street}</p>
                          <p>{selectedOrder.billingAddress.city}, {selectedOrder.billingAddress.state} {selectedOrder.billingAddress.zipCode}</p>
                          <p>{selectedOrder.billingAddress.country}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Productos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Productos del Pedido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between border-b pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                              <p className="text-sm text-gray-500">Precio unitario: {formatPrice(item.price)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatPrice(item.totalPrice)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 space-y-2 border-t pt-4">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatPrice(selectedOrder.subtotal)}</span>
                      </div>
                      {selectedOrder.discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Descuento:</span>
                          <span>-{formatPrice(selectedOrder.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Envío:</span>
                        <span>{formatPrice(selectedOrder.shippingAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Impuestos:</span>
                        <span>{formatPrice(selectedOrder.taxAmount)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total:</span>
                        <span>{formatPrice(selectedOrder.totalAmount)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedOrder.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notas del Pedido</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowOrderModal(false)}>
                Cerrar
              </Button>
              {selectedOrder && ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(selectedOrder.status) && (
                <Button onClick={() => downloadInvoice(selectedOrder)}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Factura
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de actualización de estado */}
        <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Actualizar Estado del Pedido</DialogTitle>
              <DialogDescription>
                Pedido #{selectedOrder?.orderNumber}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Nuevo Estado</Label>
                <Select 
                  value={statusForm.status} 
                  onValueChange={(value) => setStatusForm({...statusForm, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                    <SelectItem value="PROCESSING">Procesando</SelectItem>
                    <SelectItem value="SHIPPED">Enviado</SelectItem>
                    <SelectItem value="DELIVERED">Entregado</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                    <SelectItem value="REFUNDED">Reembolsado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(statusForm.status === 'SHIPPED' || statusForm.status === 'DELIVERED') && (
                <div>
                  <Label htmlFor="trackingNumber">Número de Seguimiento</Label>
                  <Input
                    id="trackingNumber"
                    value={statusForm.trackingNumber}
                    onChange={(e) => setStatusForm({...statusForm, trackingNumber: e.target.value})}
                    placeholder="Ej: 1234567890"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notas Adicionales (opcional)</Label>
                <Textarea
                  id="notes"
                  value={statusForm.notes}
                  onChange={(e) => setStatusForm({...statusForm, notes: e.target.value})}
                  placeholder="Información adicional sobre el cambio de estado..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notifyCustomer"
                  checked={statusForm.notifyCustomer}
                  onChange={(e) => setStatusForm({...statusForm, notifyCustomer: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="notifyCustomer">Notificar al cliente por email</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStatusModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleStatusUpdate}>
                Actualizar Estado
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de notificación personalizada */}
        <Dialog open={showNotifyModal} onOpenChange={setShowNotifyModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Enviar Notificación al Cliente</DialogTitle>
              <DialogDescription>
                Pedido #{selectedOrder?.orderNumber} - {selectedOrder?.user ? `${selectedOrder.user.firstName} ${selectedOrder.user.lastName}` : selectedOrder?.guestEmail}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Asunto</Label>
                <Input
                  id="subject"
                  value={notificationForm.subject}
                  onChange={(e) => setNotificationForm({...notificationForm, subject: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="message">Mensaje</Label>
                <Textarea
                  id="message"
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                  rows={6}
                  placeholder="Escribe tu mensaje personalizado aquí..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNotifyModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSendNotification}>
                <Send className="h-4 w-4 mr-2" />
                Enviar Notificación
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}