// src/app/account/page.tsx - Página de cuenta con modales funcionales
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCountryName } from '@/lib/countries';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  User,
  Package,
  MapPin,
  CreditCard,
  Heart,
  Settings,
  Edit,
  Plus,
  Eye,
  Download,
  Bell,
  Shield,
  LogOut,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Loader2,
  Trash2
} from 'lucide-react';
import Header from '@/components/Header';
import AddressModal from '@/components/modals/AddressModal';
import PaymentMethodModal from '@/components/modals/PaymentMethodModal';
import { useAuthStore } from '@/lib/store';
import { formatPrice, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import accountApi, { 
  type Order, 
  type Address, 
  type PaymentMethod, 
  type AccountStats,
  type UpdateProfileData 
} from '@/lib/accountApi';

export default function AccountPage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const { success, error, promise } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estados para modales
  const [addressModal, setAddressModal] = useState({
    isOpen: false,
    address: null as Address | null
  });
  const [paymentMethodModal, setPaymentMethodModal] = useState({
    isOpen: false,
    paymentMethod: null as PaymentMethod | null
  });
  const [deleteDialog, setDeleteDialog] = useState({
  isOpen: false,
  type: 'address' as 'address' | 'payment',
  id: '',
  name: ''
});
  

  // Estados para datos
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [stats, setStats] = useState<AccountStats>({
    totalOrders: 0,
    totalAddresses: 0,
    totalPaymentMethods: 0,
    wishlistItems: 0
  });

  // Estados para formularios
  const [userForm, setUserForm] = useState<UpdateProfileData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/account');
      return;
    }
    loadAccountData();
  }, [isAuthenticated]);

  const loadAccountData = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('No token found, redirecting to login');
      router.push('/auth/login?redirect=/account');
      return;
    }

    setIsLoading(true);
      
      const [
        ordersResponse,
        addressesResponse,
        paymentMethodsResponse,
        statsResponse
      ] = await Promise.allSettled([
        accountApi.getOrders({ page: 1, limit: 5 }),
        accountApi.getAddresses(),
        accountApi.getPaymentMethods(),
        accountApi.getAccountStats()
      ]);

      if (ordersResponse.status === 'fulfilled') {
      setOrders(ordersResponse.value.orders);
    }
      if (addressesResponse.status === 'fulfilled') {
      setAddresses(addressesResponse.value.addresses);
    }
    if (paymentMethodsResponse.status === 'fulfilled') {
      setPaymentMethods(paymentMethodsResponse.value.paymentMethods);
       }
      if (statsResponse.status === 'fulfilled') {
      setStats(statsResponse.value.stats);
       }

    } catch (err: any) {
      console.error('Error loading account data:', err);
      error('Error al cargar los datos de la cuenta');
    // Si es error de autenticación, redirigir
    if (err.response?.status === 401) {
      logout();
      router.push('/auth/login?redirect=/account');
    }
  } finally {
    setIsLoading(false);
  }
}, [router, error, logout]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleUpdateProfile = async () => {
  try {
    setIsSaving(true);
    
    // CORRECCIÓN: Capturar la respuesta de la API
    const response = await promise(
      accountApi.updateProfile(userForm),
      {
        loading: 'Actualizando perfil...',
        success: 'Perfil actualizado exitosamente',
        error: 'Error al actualizar el perfil'
      }
    );
    
    // CORRECCIÓN: Actualizar el estado global del usuario en Zustand
    // Necesitas importar la función setUser del store
    const { setUser } = useAuthStore.getState();
    setUser(response.user);
    
    setIsEditing(false);
    
  } catch (err: any) {
    console.error('Error updating profile:', err);
  } finally {
    setIsSaving(false);
  }
};

  const downloadInvoice = async (orderId: string, orderNumber: string) => {
    try {
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

      success('Factura descargada exitosamente');
    } catch (err: any) {
      console.error('Error downloading invoice:', err);
      error(err.message || 'Error al descargar la factura');
    }
  };
  
  // Handlers para direcciones
  const handleEditAddress = (address: Address) => {
    setAddressModal({ isOpen: true, address });
  };

  const handleCreateAddress = () => {
    setAddressModal({ isOpen: true, address: null });
  };

  const handleDeleteAddress = (address: Address) => {
    setDeleteDialog({
      isOpen: true,
      type: 'address',
      id: address.id,
      name: address.name
    });
  };

  const handleConfirmDelete = async () => {
  try {
    if (deleteDialog.type === 'address') {
      await promise(
        accountApi.deleteAddress(deleteDialog.id),
        {
          loading: 'Eliminando dirección...',
          success: 'Dirección eliminada exitosamente',
          error: 'Error al eliminar la dirección'
        }
      );
      setAddresses(prev => prev.filter(addr => addr.id !== deleteDialog.id));
    } else if (deleteDialog.type === 'payment') {
      await promise(
        accountApi.deletePaymentMethod(deleteDialog.id),
        {
          loading: 'Eliminando método de pago...',
          success: 'Método de pago eliminado exitosamente',
          error: 'Error al eliminar el método de pago'
        }
      );
      setPaymentMethods(prev => prev.filter(pm => pm.id !== deleteDialog.id));
    }
    
    setDeleteDialog({ isOpen: false, type: 'address', id: '', name: '' });
  } catch (err: any) {
    console.error('Error deleting:', err);
  }
};

  // Handlers para métodos de pago
  const handleViewPaymentMethod = (paymentMethod: PaymentMethod) => {
  setPaymentMethodModal({ isOpen: true, paymentMethod });
};

  const handleCreatePaymentMethod = () => {
    setPaymentMethodModal({ isOpen: true, paymentMethod: null });
  }; 
  const handleDeletePaymentMethod = (paymentMethod: PaymentMethod) => {
  const name = paymentMethod.type === 'card' 
    ? `${paymentMethod.brand} ****${paymentMethod.last4}`
    : paymentMethod.type === 'paypal'
      ? `PayPal (${paymentMethod.paypalEmail})`
      : paymentMethod.type;
      
  setDeleteDialog({
    isOpen: true,
    type: 'payment',
    id: paymentMethod.id,
    name
  });
};

  

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
      case 'confirmed':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Cuenta</h1>
          <p className="text-gray-600">Gestiona tu información personal y pedidos</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <div className="text-lg">Cargando información de la cuenta...</div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1 h-auto p-1">
              <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm">
  <User className="h-3 w-3 sm:h-4 sm:w-4" />
  <span className="text-xs sm:text-sm">Resumen</span>
</TabsTrigger>
              <TabsTrigger value="orders" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm">
  <Package className="h-3 w-3 sm:h-4 sm:w-4" />
  <span className="text-xs sm:text-sm">Pedidos</span>
</TabsTrigger>
<TabsTrigger value="addresses" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm">
  <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
  <span className="text-xs sm:text-sm">Direcciones</span>
</TabsTrigger>
<TabsTrigger value="payments" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm">
  <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
  <span className="text-xs sm:text-sm">Pagos</span>
</TabsTrigger>
<TabsTrigger value="wishlist" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm">
  <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
  <span className="text-xs sm:text-sm">Favoritos</span>
</TabsTrigger>
<TabsTrigger value="settings" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm">
  <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
  <span className="text-xs sm:text-sm">Config</span>
</TabsTrigger>
            </TabsList>

            {/* Resumen de Cuenta */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Información Personal */}
<Card className="lg:col-span-2">
  <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
    <div>
      <CardTitle className="text-lg sm:text-xl">Información Personal</CardTitle>
      <CardDescription className="text-sm">
        Gestiona tu información de contacto
      </CardDescription>
    </div>
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsEditing(!isEditing)}
      disabled={isSaving}
      className="w-full sm:w-auto"
    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Edit className="h-4 w-4 mr-2" />
                      )}
                      {isEditing ? 'Cancelar' : 'Editar'}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
  <div>
    <Label htmlFor="firstName" className="text-sm font-medium">Nombre</Label>
    <Input
      id="firstName"
      value={userForm.firstName}
      onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
      className="mt-1"
    />
  </div>
  <div>
    <Label htmlFor="lastName" className="text-sm font-medium">Apellido</Label>
    <Input
      id="lastName"
      value={userForm.lastName}
      onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
      className="mt-1"
    />
  </div>
</div>
                        <div>
                          <Label htmlFor="phone">Teléfono</Label>
                          <Input
                            id="phone"
                            value={userForm.phone}
                            onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                          />
                        </div>
                        <Button onClick={handleUpdateProfile} disabled={isSaving} className="w-full sm:w-auto">
  {isSaving ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Guardando...
    </>
  ) : (
    'Guardar Cambios'
  )}
</Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm text-gray-500">Nombre completo</Label>
                          <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">Email</Label>
                          <p className="font-medium">{user?.email}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">Teléfono</Label>
                          <p className="font-medium">{user?.phone || 'No especificado'}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">Miembro desde</Label>
                          <p className="font-medium">{formatDate(user?.createdAt || new Date())}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Estadísticas rápidas */}
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <ShoppingBag className="h-8 w-8 text-primary-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Total de Pedidos</p>
                          <p className="text-2xl font-bold">{stats.totalOrders}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Heart className="h-8 w-8 text-red-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Productos Favoritos</p>
                          <p className="text-2xl font-bold">{stats.wishlistItems}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <MapPin className="h-8 w-8 text-blue-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Direcciones</p>
                          <p className="text-2xl font-bold">{stats.totalAddresses}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Pedidos Recientes */}
<Card>
  <CardHeader>
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
      <div>
        <CardTitle className="text-lg sm:text-xl">Pedidos Recientes</CardTitle>
        <CardDescription className="text-sm">Tus últimos pedidos realizados</CardDescription>
      </div>
      <Button variant="outline" onClick={() => setActiveTab('orders')} className="w-full sm:w-auto text-sm">
        Ver todos
      </Button>
    </div>
  </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No tienes pedidos aún</p>
                      <Button asChild className="mt-4">
                        <Link href="/products">Empezar a comprar</Link>
                      </Button>
                    </div>
                  ) : (
                    orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 sm:py-4 border-b last:border-b-0 space-y-2 sm:space-y-0">
  <div className="flex items-center space-x-3 sm:space-x-4">
    {getStatusIcon(order.status)}
    <div className="min-w-0 flex-1">
      <p className="font-medium text-sm sm:text-base truncate">Pedido #{order.orderNumber}</p>
      <p className="text-xs sm:text-sm text-gray-500">{formatDate(order.date)}</p>
    </div>
  </div>
  <div className="flex items-center justify-between sm:flex-col sm:text-right ml-7 sm:ml-0">
    <p className="font-medium text-sm sm:text-base">{formatPrice(order.total)}</p>
    <Badge variant="outline" className="text-xs">{getStatusText(order.status)}</Badge>
  </div>
</div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Direcciones */}
            <TabsContent value="addresses" className="space-y-6">
              <Card>
                <CardHeader>
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
    <div>
      <CardTitle className="text-lg sm:text-xl">Direcciones Guardadas</CardTitle>
      <CardDescription className="text-sm">
        Gestiona tus direcciones de envío y facturación
      </CardDescription>
    </div>
    <Button onClick={handleCreateAddress} className="w-full sm:w-auto text-sm">
      <Plus className="h-4 w-4 mr-2" />
      Nueva Dirección
    </Button>
  </div>
</CardHeader>
                <CardContent>
                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No tienes direcciones guardadas</p>
                      <Button onClick={handleCreateAddress} className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Primera Dirección
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                        <Card key={address.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-semibold">{address.name}</h3>
                              {address.isDefault && (
                                <Badge>Predeterminada</Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1 mb-4">
                              <p>{address.street}</p>
                              <p>{address.city}, {address.state} {address.zipCode}</p>
                              <p>{getCountryName(address.country)}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:space-x-2 sm:gap-0">
  <Button 
    variant="outline" 
    size="sm"
    onClick={() => handleEditAddress(address)}
    className="w-full sm:w-auto text-xs sm:text-sm"
  >
    <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
    Editar
  </Button>
  <Button 
    variant="outline" 
    size="sm"
    onClick={() => handleDeleteAddress(address)}
    className="w-full sm:w-auto text-xs sm:text-sm text-red-600 hover:text-red-700"
  >
    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
    Eliminar
  </Button>
</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Métodos de Pago */}
            <TabsContent value="payments" className="space-y-6">
              <Card>
                <CardHeader>
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
    <div>
      <CardTitle className="text-lg sm:text-xl">Métodos de Pago</CardTitle>
      <CardDescription className="text-sm">
        Gestiona tus tarjetas y métodos de pago
      </CardDescription>
    </div>
    <Button onClick={handleCreatePaymentMethod} className="w-full sm:w-auto text-sm">
      <Plus className="h-4 w-4 mr-2" />
      Nuevo Método
    </Button>
  </div>
</CardHeader>
                <CardContent>
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No tienes métodos de pago guardados</p>
                      <Button onClick={handleCreatePaymentMethod} className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Primer Método
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <Card key={method.id} className="border">
                          <CardContent className="p-4">
                            {/* Layout móvil */}
<div className="block sm:hidden space-y-3">
  {/* Información del método de pago */}
  <div className="flex items-start space-x-3">
    <CreditCard className="h-6 w-6 text-gray-400 mt-1" />
    <div className="flex-1 min-w-0">
      <p className="font-medium text-sm break-words">
        {method.type === 'card' && method.brand && method.last4 ? 
          `${method.brand} terminada en ${method.last4}` :
          method.type === 'paypal' ? 
            `PayPal (${method.paypalEmail})` :
            method.type
        }
      </p>
      {method.expiryMonth && method.expiryYear && (
        <p className="text-xs text-gray-500 mt-1">
          Expira {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
        </p>
      )}
    </div>
  </div>
  
  {/* Badge predeterminada - separado */}
  {method.isDefault && (
    <div className="flex justify-start ml-9">
      <Badge className="text-xs">Predeterminada</Badge>
    </div>
  )}
  
  {/* Botones en móvil - stack vertical */}
  <div className="flex flex-col gap-2 ml-9">
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => handleViewPaymentMethod(method)}
      className="w-full justify-start text-xs"
    >
      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
      Ver Detalles
    </Button>
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => handleDeletePaymentMethod(method)}
      className="w-full justify-start text-xs text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
    >
      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
      Eliminar
    </Button>
  </div>
</div>

{/* Layout escritorio - mantiene diseño actual */}
<div className="hidden sm:flex sm:items-center sm:justify-between">
  <div className="flex items-center space-x-4">
    <CreditCard className="h-8 w-8 text-gray-400" />
    <div>
      <p className="font-medium">
        {method.type === 'card' && method.brand && method.last4 ? 
          `${method.brand} terminada en ${method.last4}` :
          method.type === 'paypal' ? 
            `PayPal (${method.paypalEmail})` :
            method.type
        }
      </p>
      {method.expiryMonth && method.expiryYear && (
        <p className="text-sm text-gray-500">
          Expira {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
        </p>
      )}
    </div>
  </div>
  <div className="flex items-center space-x-2">
    {method.isDefault && (
      <Badge>Predeterminada</Badge>
    )}
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => handleViewPaymentMethod(method)}
    >
      <Eye className="h-4 w-4 mr-2" />
      Ver
    </Button>
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => handleDeletePaymentMethod(method)}
      className="text-red-600 hover:text-red-700"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      Eliminar
    </Button>
  </div>
</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pedidos */}
            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
    <div>
      <CardTitle className="text-lg sm:text-xl">Historial de Pedidos</CardTitle>
      <CardDescription className="text-sm">
        Todos tus pedidos y su estado actual
      </CardDescription>
    </div>
    <Button asChild variant="outline" className="w-full sm:w-auto text-sm">
      <Link href="/account/orders">Ver Lista Completa</Link>
    </Button>
  </div>
</CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No tienes pedidos aún</p>
                      <Button asChild className="mt-4">
                        <Link href="/products">Empezar a comprar</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg hover:bg-gray-50 transition-colors p-3 sm:p-4">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
    {/* Información principal */}
    <div className="flex items-start space-x-3 min-w-0 flex-1">
      {getStatusIcon(order.status)}
      <div className="min-w-0 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mb-1">
          <p className="font-medium text-sm sm:text-base truncate">Pedido #{order.orderNumber}</p>
          <Badge variant="outline" className="text-xs w-fit mt-1 sm:mt-0">
            {getStatusText(order.status)}
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-gray-500">{formatDate(order.date)}</p>
        <p className="text-xs sm:text-sm text-gray-600">
          {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>    
    
    {/* Precio y acciones */}
<div className="flex flex-col text-right sm:ml-4 flex-shrink-0 space-y-2 sm:space-y-0">
  <p className="font-bold text-base sm:text-lg text-primary-600">{formatPrice(order.total)}</p>
      <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto text-xs">
          <Link href={`/account/orders/${order.id}`}>
            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Ver
          </Link>
        </Button>
        {['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => downloadInvoice(order.id, order.orderNumber)}
            className="w-full sm:w-auto text-xs"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Factura
          </Button>
        )}
      </div>
    </div>
  </div>
</div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wishlist">
  <Card>
    <CardHeader>
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
    <div>
      <CardTitle className="text-lg sm:text-xl">Lista de Favoritos</CardTitle>
      <CardDescription className="text-sm">
        Productos que has guardado para más tarde
      </CardDescription>
    </div>
    {stats.wishlistItems > 0 && (
      <Button asChild variant="outline" className="w-full sm:w-auto text-sm">
        <Link href="/wishlist">Ver Lista Completa</Link>
      </Button>
    )}
  </div>
</CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">
          {stats.wishlistItems === 0 
            ? 'Tu lista de favoritos está vacía' 
            : `Tienes ${stats.wishlistItems} producto${stats.wishlistItems !== 1 ? 's' : ''} en favoritos`
          }
        </p>
        <div className="flex gap-2 justify-center mt-4">
          {stats.wishlistItems > 0 ? (
            <Button asChild>
              <Link href="/wishlist">Ver Mis Favoritos</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/products">Explorar Productos</Link>
            </Button>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
</TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-red-600">Cerrar Sesión</h3>
                      <p className="text-sm text-gray-500">
                        Cerrar sesión en este dispositivo
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleLogout} className="text-red-600 border-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Modales */}
        <AddressModal
          isOpen={addressModal.isOpen}
          onClose={() => setAddressModal({ isOpen: false, address: null })}
          onSuccess={() => {
            loadAccountData();
            setAddressModal({ isOpen: false, address: null });
          }}
          address={addressModal.address}
        />

        <PaymentMethodModal
          isOpen={paymentMethodModal.isOpen}
          onClose={() => setPaymentMethodModal({ isOpen: false, paymentMethod: null })}
          onSuccess={() => {
            loadAccountData();
            setPaymentMethodModal({ isOpen: false, paymentMethod: null });
          }}
          paymentMethod={paymentMethodModal.paymentMethod}
        />

        {/* Dialog de confirmación de eliminación */}
        <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => 
          setDeleteDialog(prev => ({ ...prev, isOpen: open }))
        }>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que quieres eliminar "{deleteDialog.name}"? 
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}