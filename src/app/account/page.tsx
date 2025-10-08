// src/app/account/page.tsx - Página de cuenta con tema Dark Tech
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
        return <Clock className="h-4 w-4 text-gray-400" />;
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
    <div className="min-h-screen bg-darkbg">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Mi Cuenta</h1>
          <p className="text-gray-400">Gestiona tu información personal y pedidos</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gold" />
            <div className="text-lg text-white">Cargando información de la cuenta...</div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1 h-auto p-1 bg-darkbg-light border border-gold/20">
              <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold data-[state=active]:to-cyan data-[state=active]:text-darkbg text-gray-400 hover:text-white transition-all">
  <User className="h-3 w-3 sm:h-4 sm:w-4" />
  <span className="text-xs sm:text-sm">Resumen</span>
</TabsTrigger>
              <TabsTrigger value="orders" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold data-[state=active]:to-cyan data-[state=active]:text-darkbg text-gray-400 hover:text-white transition-all">
  <Package className="h-3 w-3 sm:h-4 sm:w-4" />
  <span className="text-xs sm:text-sm">Pedidos</span>
</TabsTrigger>
<TabsTrigger value="addresses" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold data-[state=active]:to-cyan data-[state=active]:text-darkbg text-gray-400 hover:text-white transition-all">
  <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
  <span className="text-xs sm:text-sm">Direcciones</span>
</TabsTrigger>
<TabsTrigger value="payments" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold data-[state=active]:to-cyan data-[state=active]:text-darkbg text-gray-400 hover:text-white transition-all">
  <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
  <span className="text-xs sm:text-sm">Pagos</span>
</TabsTrigger>
<TabsTrigger value="wishlist" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold data-[state=active]:to-cyan data-[state=active]:text-darkbg text-gray-400 hover:text-white transition-all">
  <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
  <span className="text-xs sm:text-sm">Favoritos</span>
</TabsTrigger>
<TabsTrigger value="settings" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold data-[state=active]:to-cyan data-[state=active]:text-darkbg text-gray-400 hover:text-white transition-all">
  <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
  <span className="text-xs sm:text-sm">Config</span>
</TabsTrigger>
            </TabsList>

            {/* Resumen de Cuenta */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Información Personal */}
<Card className="lg:col-span-2 bg-darkbg-light border-gold/20">
  <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 border-b border-gold/10">
    <div>
      <CardTitle className="text-lg sm:text-xl text-white">Información Personal</CardTitle>
      <CardDescription className="text-sm text-gray-400">
        Gestiona tu información de contacto
      </CardDescription>
    </div>
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsEditing(!isEditing)}
      disabled={isSaving}
      className="w-full sm:w-auto bg-darkbg-light border-gold/30 text-white hover:bg-gold hover:text-darkbg hover:border-gold transition-all"
    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Edit className="h-4 w-4 mr-2" />
                      )}
                      {isEditing ? 'Cancelar' : 'Editar'}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
  <div>
    <Label htmlFor="firstName" className="text-sm font-medium text-gray-300">Nombre</Label>
    <Input
      id="firstName"
      value={userForm.firstName}
      onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
      className="mt-1 bg-darkbg border-gold/20 text-white focus:border-gold focus:ring-gold/50"
    />
  </div>
  <div>
    <Label htmlFor="lastName" className="text-sm font-medium text-gray-300">Apellido</Label>
    <Input
      id="lastName"
      value={userForm.lastName}
      onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
      className="mt-1 bg-darkbg border-gold/20 text-white focus:border-gold focus:ring-gold/50"
    />
  </div>
</div>
                        <div>
                          <Label htmlFor="phone" className="text-gray-300">Teléfono</Label>
                          <Input
                            id="phone"
                            value={userForm.phone}
                            onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                            className="bg-darkbg border-gold/20 text-white focus:border-gold focus:ring-gold/50"
                          />
                        </div>
                        <Button onClick={handleUpdateProfile} disabled={isSaving} className="w-full sm:w-auto bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-semibold">
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
                          <Label className="text-sm text-gray-400">Nombre completo</Label>
                          <p className="font-medium text-white">{user?.firstName} {user?.lastName}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-400">Email</Label>
                          <p className="font-medium text-white">{user?.email}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-400">Teléfono</Label>
                          <p className="font-medium text-white">{user?.phone || 'No especificado'}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-400">Miembro desde</Label>
                          <p className="font-medium text-white">{formatDate(user?.createdAt || new Date())}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Estadísticas rápidas */}
                <div className="space-y-4">
                  <Card className="bg-darkbg-light border-gold/20 hover:shadow-glow-gold transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <ShoppingBag className="h-8 w-8 text-gold" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-400">Total de Pedidos</p>
                          <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-darkbg-light border-cyan/20 hover:shadow-glow-cyan transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Heart className="h-8 w-8 text-cyan" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-400">Productos Favoritos</p>
                          <p className="text-2xl font-bold text-white">{stats.wishlistItems}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-darkbg-light border-gold/20 hover:shadow-glow-gold transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <MapPin className="h-8 w-8 text-gold" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-400">Direcciones</p>
                          <p className="text-2xl font-bold text-white">{stats.totalAddresses}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Pedidos Recientes */}
<Card className="bg-darkbg-light border-gold/20">
  <CardHeader>
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0 border-b border-gold/10 pb-4">
      <div>
        <CardTitle className="text-lg sm:text-xl text-white">Pedidos Recientes</CardTitle>
        <CardDescription className="text-sm text-gray-400">Tus últimos pedidos realizados</CardDescription>
      </div>
      <Button variant="outline" onClick={() => setActiveTab('orders')} className="w-full sm:w-auto text-sm bg-darkbg border-cyan/30 text-white hover:bg-cyan hover:text-darkbg hover:border-cyan">
        Ver todos
      </Button>
    </div>
  </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No tienes pedidos aún</p>
                      <Button asChild className="mt-4 bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-semibold">
                        <Link href="/products">Empezar a comprar</Link>
                      </Button>
                    </div>
                  ) : (
                    orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 sm:py-4 border-b border-gold/10 last:border-b-0 space-y-2 sm:space-y-0 hover:bg-darkbg/50 px-2 rounded transition-colors">
  <div className="flex items-center space-x-3 sm:space-x-4">
    {getStatusIcon(order.status)}
    <div className="min-w-0 flex-1">
      <p className="font-medium text-sm sm:text-base truncate text-white">Pedido #{order.orderNumber}</p>
      <p className="text-xs sm:text-sm text-gray-400">{formatDate(order.date)}</p>
    </div>
  </div>
  <div className="flex items-center justify-between sm:flex-col sm:text-right ml-7 sm:ml-0">
    <p className="font-medium text-sm sm:text-base text-gold">{formatPrice(order.total)}</p>
    <Badge variant="outline" className="text-xs border-cyan/30 text-cyan">{getStatusText(order.status)}</Badge>
  </div>
</div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Direcciones */}
            <TabsContent value="addresses" className="space-y-6">
              <Card className="bg-darkbg-light border-gold/20">
                <CardHeader>
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0 border-b border-gold/10 pb-4">
    <div>
      <CardTitle className="text-lg sm:text-xl text-white">Direcciones Guardadas</CardTitle>
      <CardDescription className="text-sm text-gray-400">
        Gestiona tus direcciones de envío y facturación
      </CardDescription>
    </div>
    <Button onClick={handleCreateAddress} className="w-full sm:w-auto text-sm bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-semibold">
      <Plus className="h-4 w-4 mr-2" />
      Nueva Dirección
    </Button>
  </div>
</CardHeader>
                <CardContent>
                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No tienes direcciones guardadas</p>
                      <Button onClick={handleCreateAddress} className="mt-4 bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-semibold">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Primera Dirección
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                        <Card key={address.id} className="border border-gold/20 bg-darkbg hover:shadow-glow-gold transition-all">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-semibold text-white">{address.name}</h3>
                              {address.isDefault && (
                                <Badge className="bg-gradient-to-r from-gold to-cyan text-darkbg border-0">Predeterminada</Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-400 space-y-1 mb-4">
                              <p>{address.street}</p>
                              <p>{address.city}, {address.state} {address.zipCode}</p>
                              <p>{getCountryName(address.country)}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:space-x-2 sm:gap-0">
  <Button 
    variant="outline" 
    size="sm"
    onClick={() => handleEditAddress(address)}
    className="w-full sm:w-auto text-xs sm:text-sm bg-darkbg border-gold/30 text-white hover:bg-gold hover:text-darkbg hover:border-gold"
  >
    <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
    Editar
  </Button>
  <Button 
    variant="outline" 
    size="sm"
    onClick={() => handleDeleteAddress(address)}
    className="w-full sm:w-auto text-xs sm:text-sm bg-darkbg border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500"
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
              <Card className="bg-darkbg-light border-gold/20">
                <CardHeader>
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0 border-b border-gold/10 pb-4">
    <div>
      <CardTitle className="text-lg sm:text-xl text-white">Métodos de Pago</CardTitle>
      <CardDescription className="text-sm text-gray-400">
        Gestiona tus tarjetas y métodos de pago
      </CardDescription>
    </div>
    <Button onClick={handleCreatePaymentMethod} className="w-full sm:w-auto text-sm bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-semibold">
      <Plus className="h-4 w-4 mr-2" />
      Nuevo Método
    </Button>
  </div>
</CardHeader>
                <CardContent>
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No tienes métodos de pago guardados</p>
                      <Button onClick={handleCreatePaymentMethod} className="mt-4 bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-semibold">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Primer Método
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <Card key={method.id} className="border border-gold/20 bg-darkbg hover:shadow-glow-cyan transition-all">
                          <CardContent className="p-4">
                            {/* Layout móvil */}
<div className="block sm:hidden space-y-3">
  {/* Información del método de pago */}
  <div className="flex items-start space-x-3">
    <CreditCard className="h-6 w-6 text-cyan mt-1" />
    <div className="flex-1 min-w-0">
      <p className="font-medium text-sm break-words text-white">
        {method.type === 'card' && method.brand && method.last4 ? 
          `${method.brand} terminada en ${method.last4}` :
          method.type === 'paypal' ? 
            `PayPal (${method.paypalEmail})` :
            method.type
        }
      </p>
      {method.expiryMonth && method.expiryYear && (
        <p className="text-xs text-gray-400 mt-1">
          Expira {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
        </p>
      )}
    </div>
  </div>
  
  {/* Badge predeterminada - separado */}
  {method.isDefault && (
    <div className="flex justify-start ml-9">
      <Badge className="text-xs bg-gradient-to-r from-gold to-cyan text-darkbg border-0">Predeterminada</Badge>
    </div>
  )}
  
  {/* Botones en móvil - stack vertical */}
  <div className="flex flex-col gap-2 ml-9">
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => handleViewPaymentMethod(method)}
      className="w-full justify-start text-xs bg-darkbg border-cyan/30 text-white hover:bg-cyan hover:text-darkbg hover:border-cyan"
    >
      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
      Ver Detalles
    </Button>
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => handleDeletePaymentMethod(method)}
      className="w-full justify-start text-xs bg-darkbg border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500"
    >
      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
      Eliminar
    </Button>
  </div>
</div>

{/* Layout escritorio - mantiene diseño actual */}
<div className="hidden sm:flex sm:items-center sm:justify-between">
  <div className="flex items-center space-x-4">
    <CreditCard className="h-8 w-8 text-cyan" />
    <div>
      <p className="font-medium text-white">
        {method.type === 'card' && method.brand && method.last4 ? 
          `${method.brand} terminada en ${method.last4}` :
          method.type === 'paypal' ? 
            `PayPal (${method.paypalEmail})` :
            method.type
        }
      </p>
      {method.expiryMonth && method.expiryYear && (
        <p className="text-sm text-gray-400">
          Expira {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
        </p>
      )}
    </div>
  </div>
  <div className="flex items-center space-x-2">
    {method.isDefault && (
      <Badge className="bg-gradient-to-r from-gold to-cyan text-darkbg border-0">Predeterminada</Badge>
    )}
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => handleViewPaymentMethod(method)}
      className="bg-darkbg border-cyan/30 text-white hover:bg-cyan hover:text-darkbg hover:border-cyan"
    >
      <Eye className="h-4 w-4 mr-2" />
      Ver
    </Button>
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => handleDeletePaymentMethod(method)}
      className="bg-darkbg border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500"
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
              <Card className="bg-darkbg-light border-gold/20">
                <CardHeader>
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0 border-b border-gold/10 pb-4">
    <div>
      <CardTitle className="text-lg sm:text-xl text-white">Historial de Pedidos</CardTitle>
      <CardDescription className="text-sm text-gray-400">
        Todos tus pedidos y su estado actual
      </CardDescription>
    </div>
    <Button asChild variant="outline" className="w-full sm:w-auto text-sm bg-darkbg border-cyan/30 text-white hover:bg-cyan hover:text-darkbg hover:border-cyan">
      <Link href="/account/orders">Ver Lista Completa</Link>
    </Button>
  </div>
</CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No tienes pedidos aún</p>
                      <Button asChild className="mt-4 bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-semibold">
                        <Link href="/products">Empezar a comprar</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gold/20 rounded-lg hover:bg-darkbg hover:shadow-glow-gold transition-all p-3 sm:p-4">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
    {/* Información principal */}
    <div className="flex items-start space-x-3 min-w-0 flex-1">
      {getStatusIcon(order.status)}
      <div className="min-w-0 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mb-1">
          <p className="font-medium text-sm sm:text-base truncate text-white">Pedido #{order.orderNumber}</p>
          <Badge variant="outline" className="text-xs w-fit mt-1 sm:mt-0 border-cyan/30 text-cyan">
            {getStatusText(order.status)}
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-gray-400">{formatDate(order.date)}</p>
        <p className="text-xs sm:text-sm text-gray-400">
          {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>    
    
    {/* Precio y acciones */}
<div className="flex flex-col text-right sm:ml-4 flex-shrink-0 space-y-2 sm:space-y-0">
  <p className="font-bold text-base sm:text-lg text-gold">{formatPrice(order.total)}</p>
      <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto text-xs bg-darkbg border-cyan/30 text-white hover:bg-cyan hover:text-darkbg hover:border-cyan">
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
            className="w-full sm:w-auto text-xs bg-darkbg border-gold/30 text-white hover:bg-gold hover:text-darkbg hover:border-gold"
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
  <Card className="bg-darkbg-light border-gold/20">
    <CardHeader>
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0 border-b border-gold/10 pb-4">
    <div>
      <CardTitle className="text-lg sm:text-xl text-white">Lista de Favoritos</CardTitle>
      <CardDescription className="text-sm text-gray-400">
        Productos que has guardado para más tarde
      </CardDescription>
    </div>
    {stats.wishlistItems > 0 && (
      <Button asChild variant="outline" className="w-full sm:w-auto text-sm bg-darkbg border-cyan/30 text-white hover:bg-cyan hover:text-darkbg hover:border-cyan">
        <Link href="/wishlist">Ver Lista Completa</Link>
      </Button>
    )}
  </div>
</CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <Heart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">
          {stats.wishlistItems === 0 
            ? 'Tu lista de favoritos está vacía' 
            : `Tienes ${stats.wishlistItems} producto${stats.wishlistItems !== 1 ? 's' : ''} en favoritos`
          }
        </p>
        <div className="flex gap-2 justify-center mt-4">
          {stats.wishlistItems > 0 ? (
            <Button asChild className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-semibold">
              <Link href="/wishlist">Ver Mis Favoritos</Link>
            </Button>
          ) : (
            <Button asChild className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-semibold">
              <Link href="/products">Explorar Productos</Link>
            </Button>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
</TabsContent>

            <TabsContent value="settings">
              <Card className="bg-darkbg-light border-gold/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-red-400">Cerrar Sesión</h3>
                      <p className="text-sm text-gray-400">
                        Cerrar sesión en este dispositivo
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleLogout} className="bg-darkbg text-red-400 border-red-500/30 hover:bg-red-500 hover:text-white hover:border-red-500">
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
          <AlertDialogContent className="bg-darkbg-light border-gold/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">¿Confirmar eliminación?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                ¿Estás seguro de que quieres eliminar "{deleteDialog.name}"? 
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-darkbg border-gray-600 text-white hover:bg-darkbg-light">Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDelete}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
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