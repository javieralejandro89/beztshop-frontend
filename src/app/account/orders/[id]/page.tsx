// src/app/account/orders/[id]/page.tsx - Detalles de pedido individual Dark Tech
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Loader2,
  Calendar,
  User,
  Phone,
  Mail
} from 'lucide-react';
import Header from '@/components/Header';
import { useAuthStore } from '@/lib/store';
import { useToast } from '@/hooks/useToast';
import { formatPrice, formatDate } from '@/lib/utils';
import accountApi, { type Order } from '@/lib/accountApi';

export default function OrderDetailPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const { error, success } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const orderId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/account/orders');
      return;
    }

    if (!orderId) {
      router.push('/account/orders');
      return;
    }

    loadOrderDetails();
  }, [isAuthenticated, orderId]);

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      const response = await accountApi.getOrderById(orderId);
      setOrder(response.order);
    } catch (err: any) {
      console.error('Error loading order details:', err);
      error('Error al cargar los detalles del pedido');
      router.push('/account/orders');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadInvoice = async () => {
    if (!order) return;

    try {
      setIsDownloading(true);
      
      console.log('Attempting to download invoice for order:', order.id);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/orders/${order.id}/invoice`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        // Intentar leer el error del servidor
        const errorData = await response.text();
        console.error('Server error response:', errorData);
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const blob = await response.blob();
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
      error(err.message || 'Error al descargar la factura');
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-gold" />;
      case 'processing':
      case 'confirmed':
        return <Package className="h-5 w-5 text-cyan" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-cyan" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-gold" />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-darkbg">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gold" />
            <div className="text-lg text-white">Cargando detalles del pedido...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-darkbg">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-600 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-white mb-4">
              Pedido no encontrado
            </h2>
            <Button asChild className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-semibold">
              <Link href="/account/orders">Volver a pedidos</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkbg">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        {/* Header móvil */}
<div className="block sm:hidden mb-6">
  <div className="flex items-center gap-3 mb-4">
    <Button 
      variant="ghost" 
      onClick={() => router.push('/account/orders')}
      className="p-2 text-white hover:text-gold hover:bg-darkbg-light"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
    <h1 className="text-lg font-bold text-white flex items-center gap-2 min-w-0 flex-1">
      <Package className="h-5 w-5 text-gold flex-shrink-0" />
      <span className="truncate">Pedido #{order.orderNumber}</span>
    </h1>
  </div>
  
  <div className="space-y-3 ml-11">
    <div className="flex items-center gap-2">
      {getStatusIcon(order.status)}
      <Badge variant="outline" className="flex items-center gap-1 text-xs border-cyan/30 text-cyan">
        {getStatusText(order.status)}
      </Badge>
    </div>
    
    <div className="flex items-center gap-2 text-gray-400 text-sm">
      <Calendar className="h-3 w-3" />
      <span>Pedido realizado el {formatDate(order.date)}</span>
    </div>
    
    {canDownloadInvoice(order) && (
      <Button 
        onClick={downloadInvoice}
        disabled={isDownloading}
        variant="outline"
        className="w-full text-sm bg-darkbg border-gold/30 text-white hover:bg-gold hover:text-darkbg hover:border-gold"
        size="sm"
      >
        {isDownloading ? (
          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
        ) : (
          <Download className="h-3 w-3 mr-2" />
        )}
        Descargar Factura
      </Button>
    )}
  </div>
</div>

{/* Header escritorio - mantiene diseño original */}
<div className="hidden sm:flex sm:items-center sm:gap-4 mb-8">
  <Button 
    variant="ghost" 
    onClick={() => router.push('/account/orders')}
    className="p-2 text-white hover:text-gold hover:bg-darkbg-light"
  >
    <ArrowLeft className="h-5 w-5" />
  </Button>
  <div className="flex-1">
    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
      <Package className="h-8 w-8 text-gold" />
      Pedido #{order.orderNumber}
    </h1>
    <div className="flex items-center gap-4 mt-2">
      <div className="flex items-center gap-2">
        {getStatusIcon(order.status)}
        <Badge variant="outline" className="flex items-center gap-1 border-cyan/30 text-cyan">
          {getStatusText(order.status)}
        </Badge>
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        <Calendar className="h-4 w-4" />
        <span>Pedido realizado el {formatDate(order.date)}</span>
      </div>
    </div>
  </div>

  {/* Acciones */}
  <div className="flex gap-2">
    {canDownloadInvoice(order) && (
      <Button 
        onClick={downloadInvoice}
        disabled={isDownloading}
        variant="outline"
        className="bg-darkbg border-gold/30 text-white hover:bg-gold hover:text-darkbg hover:border-gold"
      >
        {isDownloading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        Descargar Factura
      </Button>
    )}
  </div>
</div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Productos del pedido */}
            <Card className="bg-darkbg-light border-gold/20">
              <CardHeader className="border-b border-gold/10">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Package className="h-5 w-5 text-gold" />
                  Productos ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 pb-6 border-b border-gold/10 last:border-b-0 last:pb-0">
                      {/* Imagen del producto */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-darkbg rounded-lg overflow-hidden border border-gold/20">
                          {item.product ? (
                            <Image
                              src={item.product.image || '/placeholder-product.jpg'}
                              alt={item.productName}
                              width={80}
                              height={80}
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

                      {/* Información del producto */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg line-clamp-2 text-white">
                              {item.productName}
                            </h3>
                            {item.variants && (
                              <p className="text-sm text-gray-400 mt-1">
                                Variante: {JSON.stringify(item.variants)}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-bold text-lg text-gold">
                              {formatPrice(item.totalPrice)}
                            </p>
                            <p className="text-sm text-gray-400">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>Cantidad: {item.quantity}</span>
                          {item.product && (
                            <Link 
                              href={`/products/${item.product.slug}`}
                              className="text-cyan hover:text-gold transition-colors"
                            >
                              Ver producto →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dirección de envío */}
            <Card className="bg-darkbg-light border-gold/20">
              <CardHeader className="border-b border-gold/10">
                <CardTitle className="flex items-center gap-2 text-white">
                  <MapPin className="h-5 w-5 text-cyan" />
                  Dirección de Envío
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {order.shippingAddress && (
                  <div className="space-y-2">
                    <p className="font-semibold text-white">{order.shippingAddress.name}</p>
                    <p className="text-gray-400">{order.shippingAddress.street}</p>
                    <p className="text-gray-400">
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                    <p className="text-gray-400">{order.shippingAddress.country}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seguimiento del envío */}
            {order.trackingNumber && (
              <Card className="bg-darkbg-light border-gold/20">
                <CardHeader className="border-b border-gold/10">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Truck className="h-5 w-5 text-cyan" />
                    Seguimiento del Envío
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">Número de seguimiento:</span>
                      <Badge variant="outline" className="border-gold/30 text-gold">{order.trackingNumber}</Badge>
                    </div>
                    {order.shippedAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>Enviado el {formatDate(order.shippedAt)}</span>
                      </div>
                    )}
                    {order.deliveredAt && (
                      <div className="flex items-center gap-2 text-sm text-gold">
                        <CheckCircle className="h-4 w-4" />
                        <span>Entregado el {formatDate(order.deliveredAt)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notas del pedido */}
            {order.notes && (
              <Card className="bg-darkbg-light border-gold/20">
                <CardHeader className="border-b border-gold/10">
                  <CardTitle className="text-white">Notas del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-300">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resumen del pedido */}
            <Card className="bg-darkbg-light border-gold/20">
              <CardHeader className="border-b border-gold/10">
                <CardTitle className="text-white">Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{formatPrice(order.subtotal)}</span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-gold">
                    <span>Descuento</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-400">Envío</span>
                  {order.shipping === 0 ? (
                    <span className="text-gold font-medium">GRATIS</span>
                  ) : (
                    <span className="text-white">{formatPrice(order.shipping)}</span>
                  )}
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Impuestos</span>
                  <span className="text-white">{formatPrice(order.tax)}</span>
                </div>

                <Separator className="bg-gold/20" />

                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-gold">{formatPrice(order.total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Estado del pago */}
            <Card className="bg-darkbg-light border-gold/20">
              <CardHeader className="border-b border-gold/10">
                <CardTitle className="flex items-center gap-2 text-white">
                  <CreditCard className="h-5 w-5 text-cyan" />
                  Estado del Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Estado:</span>
                    <Badge 
                      variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}
                      className={order.paymentStatus === 'paid' ? 'bg-gradient-to-r from-gold to-cyan text-darkbg border-0' : 'bg-darkbg-light border-gray-600 text-gray-300'}
                    >
                      {getPaymentStatusText(order.paymentStatus)}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400">
                    <p>Método de pago: {order.paymentMethod || 'No especificado'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Historial de estado */}
            <Card className="bg-darkbg-light border-gold/20">
              <CardHeader className="border-b border-gold/10">
                <CardTitle className="text-white">Historial del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-gold rounded-full"></div>
                    <div>
                      <p className="font-medium text-white">Pedido realizado</p>
                      <p className="text-gray-400">{formatDate(order.date)}</p>
                    </div>
                  </div>

                  {order.status !== 'pending' && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-gold rounded-full"></div>
                      <div>
                        <p className="font-medium text-white">Pedido confirmado</p>
                        <p className="text-gray-400">Estado actual: {getStatusText(order.status)}</p>
                      </div>
                    </div>
                  )}

                  {order.shippedAt && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-cyan rounded-full"></div>
                      <div>
                        <p className="font-medium text-white">Pedido enviado</p>
                        <p className="text-gray-400">{formatDate(order.shippedAt)}</p>
                      </div>
                    </div>
                  )}

                  {order.deliveredAt && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-gold rounded-full"></div>
                      <div>
                        <p className="font-medium text-white">Pedido entregado</p>
                        <p className="text-gray-400">{formatDate(order.deliveredAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Acciones rápidas */}
            <Card className="bg-darkbg-light border-gold/20">
              <CardHeader className="border-b border-gold/10">
                <CardTitle className="text-white">Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                <Button asChild variant="outline" className="w-full bg-darkbg border-gold/30 text-white hover:bg-gold hover:text-darkbg hover:border-gold">
                  <Link href="/account/orders">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver a pedidos
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full bg-darkbg border-cyan/30 text-white hover:bg-cyan hover:text-darkbg hover:border-cyan">
                  <Link href="/products">
                    <Package className="h-4 w-4 mr-2" />
                    Seguir comprando
                  </Link>
                </Button>

                {order.paymentStatus === 'paid' && (
                  <Button asChild variant="outline" className="w-full bg-darkbg border-gold/30 text-white hover:bg-gold hover:text-darkbg hover:border-gold">
                    <Link href="/account/orders">
                      <Download className="h-4 w-4 mr-2" />
                      Historial completo
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}