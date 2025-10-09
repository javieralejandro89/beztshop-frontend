// src/app/checkout/page.tsx - Página de checkout - Dark Tech Theme
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import SquarePaymentForm, { SquarePaymentData } from '@/components/payments/SquarePaymentForm';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { getCountryName } from '@/lib/countries';
import api from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StockWarning from '@/components/ui/StockWarning';
import ZellePaymentInstructions from '@/components/payments/ZellePaymentInstructions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ShoppingCart,
  MapPin,
  CreditCard,
  Truck,
  Plus,
  Edit,
  Gift,
  Shield,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Clock,
  Package,
  Trash2,
  Tag,
  DollarSign    
} from 'lucide-react';
import Header from '@/components/Header';
import { useCartStore } from '@/lib/cartStore';
import { useAuthStore } from '@/lib/store';
import { formatPrice, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import checkoutApi, { 
  type CheckoutSession, 
  type OrderTotals, 
  type ShippingMethod,
  type CreateOrderRequest,
  type CheckoutCoupon 
} from '@/lib/checkoutApi';
import type { Address, PaymentMethod } from '@/lib/accountApi';

interface CheckoutState {
  currentStep: 1 | 2 | 3 | 4;
  shippingAddress: Address | null;
  billingAddress: Address | null;
  useShippingAsBilling: boolean;
  shippingMethod: string;
  paymentMethod: PaymentMethod | null;
  selectedPaymentType?: 'square' | 'zelle';
  newAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  couponCode: string;
  appliedCoupon: CheckoutCoupon | null;
  customerNotes: string;
}

export default function CheckoutPage() {
  const { items, totalItems, totalPrice, clearCart, removeItem, updateQuantity } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const { success, error, promise } = useToast();

  // Estados principales
  const [checkoutSession, setCheckoutSession] = useState<CheckoutSession | null>(null);
  const [orderTotals, setOrderTotals] = useState<OrderTotals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [stockWarnings, setStockWarnings] = useState<any[]>([]);
  const [showStockWarning, setShowStockWarning] = useState(false);
  
  const [squarePaymentData, setSquarePaymentData] = useState<SquarePaymentData | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Estado del checkout
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    currentStep: 1,
    shippingAddress: null,
    billingAddress: null,
    useShippingAsBilling: true,
    shippingMethod: 'standard',
    paymentMethod: {
    id: 'card',
    type: 'card',
    brand: 'Card',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
    newAddress: {
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      phone: ''
    },
    couponCode: '',
    appliedCoupon: null,
    customerNotes: ''
  });

  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      router.push('/cart');
      return;
    }

    loadCheckoutSession();
    verifyStockBeforeCheckout();
  }, [isAuthenticated, items.length]);

  // Recalcular totales cuando cambie algo relevante
  useEffect(() => {
    if (checkoutSession && items.length > 0) {
      calculateTotals();
    }
  }, [checkoutState.shippingMethod, checkoutState.appliedCoupon, checkoutSession]);

  const loadCheckoutSession = async () => {
    try {
      setIsLoading(true);
      const session = await checkoutApi.getCheckoutSession();
      setCheckoutSession(session);

      // Establecer dirección por defecto si existe
      const defaultAddress = session.addresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setCheckoutState(prev => ({
          ...prev,
          shippingAddress: defaultAddress,
          billingAddress: defaultAddress
        }));
      }

      // Establecer método de pago por defecto si existe
      const defaultPayment = session.paymentMethods.find(pm => pm.isDefault);
      if (defaultPayment) {
        setCheckoutState(prev => ({
          ...prev,
          paymentMethod: defaultPayment
        }));
      }

    } catch (err: any) {
      console.error('Error loading checkout session:', err);
      error('Error al cargar información del checkout');
    } finally {
      setIsLoading(false);
    }
  };

  interface OutOfStockItem {
  productId: string;
  productName: string;
  requested: number;
  available: number;
}

const verifyStockBeforeCheckout = async () => {
  try {
    const cartItems = items.map((item: any) => ({
      productId: item.product.id,
      quantity: item.quantity
    }));

    const { data } = await api.post('/checkout/verify-stock', { items: cartItems });
    
    if (!data.valid && data.outOfStockItems?.length > 0) {
      setStockWarnings(data.outOfStockItems);
      setShowStockWarning(true);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error verificando stock:', err);
    return true;
  }
};

  const calculateTotals = async () => {
  try {
    const cartItems = items.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      variants: item.variant
    }));

    const totals = await checkoutApi.calculateOrderTotals({
      items: cartItems,
      shippingMethod: checkoutState.shippingMethod,
      couponCode: checkoutState.appliedCoupon?.code
    });

    setOrderTotals(totals);

    // Verificar si hay problemas de stock en los totales
    const itemsWithStockIssues = totals.items?.filter((item: any) => item.hasStockIssue) || [];
    if (itemsWithStockIssues.length > 0) {
      const stockIssues = itemsWithStockIssues.map((item: any) => ({
        productId: item.productId,
        productName: item.productName,
        requested: item.originalQuantity,
        available: item.availableStock
      }));
      setStockWarnings(stockIssues);
      setShowStockWarning(true);
    }

  } catch (err: any) {
    console.error('Error calculating totals:', err);
    if (!err.response?.data?.error?.includes('Stock insuficiente')) {
      error('Error al calcular el total del pedido');
    }
  }
};

const removeOutOfStockItems = () => {
  console.log('Verificando stockWarnings:', stockWarnings);
  
  if (stockWarnings.length === 0) return;

  let itemsRemoved = 0;
  let itemsAdjusted = 0;
  const { updateQuantity } = useCartStore.getState();

  stockWarnings.forEach(warning => {
    const cartItem = items.find(item => item.product.id === warning.productId);
    
    if (!cartItem) {
      console.log(`Producto ${warning.productId} no encontrado en carrito`);
      return;
    }

    if (warning.available === 0) {
      console.log(`Eliminando ${warning.productName} - agotado`);
      removeItem(cartItem.id);
      itemsRemoved++;
    } else if (warning.available < warning.requested) {
      console.log(`Ajustando ${warning.productName}: de ${warning.requested} a ${warning.available} unidades`);
      updateQuantity(cartItem.id, warning.available);
      itemsAdjusted++;
    }
  });

  setStockWarnings([]);
  setShowStockWarning(false);
  
  setTimeout(() => {
    calculateTotals();
  }, 100);

  const messages = [];
  if (itemsRemoved > 0) {
    messages.push(`${itemsRemoved} producto(s) agotado(s) eliminado(s)`);
  }
  if (itemsAdjusted > 0) {
    messages.push(`${itemsAdjusted} producto(s) ajustado(s) a cantidad disponible`);
  }
  
  if (messages.length > 0) {
    success(messages.join(' y ') + ' del carrito');
  }
};

  const handleApplyCoupon = async () => {
    if (!checkoutState.couponCode.trim() || !orderTotals) return;

    try {
      const result = await checkoutApi.validateCoupon(
        checkoutState.couponCode, 
        orderTotals.subtotal
      );

      if (result.valid && result.coupon) {
        setCheckoutState(prev => ({
          ...prev,
          appliedCoupon: result.coupon!
        }));
        success('Cupón aplicado exitosamente');
      } else {
        error(result.error || 'Cupón no válido');
      }
    } catch (err: any) {
      error('Error al validar cupón');
    }
  };

  const handleRemoveCoupon = () => {
    setCheckoutState(prev => ({
      ...prev,
      couponCode: '',
      appliedCoupon: null
    }));
  };

  const isValidNewAddress = (): boolean => {
    const { name, street, city, state, zipCode } = checkoutState.newAddress;
    return !!(name && street && city && state && zipCode);
  };

const generateOrderNumber = (): string => {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `ORD-${timestamp}-${randomPart}`;
};

  const handleCreateOrder = async () => {
  try {
    setIsProcessing(true);

    if (!checkoutState.shippingAddress && !isValidNewAddress()) {
      error('Dirección de envío requerida');
      return;
    }

    if (!checkoutState.paymentMethod) {
      error('Método de pago requerido');
      return;
    }

    const orderData = {
      items: items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        variants: item.variant ? {
          [item.variant.type]: item.variant.value
        } : undefined
      })),
      shippingMethod: checkoutState.shippingMethod as any,
      paymentMethod: checkoutState.selectedPaymentType === 'zelle' ? 'zelle' as any : checkoutState.paymentMethod.type.toLowerCase() as any,
      customerNotes: checkoutState.customerNotes || undefined,
      couponCode: checkoutState.appliedCoupon?.code,
      shippingAddressId: checkoutState.shippingAddress?.id,
      shippingAddress: checkoutState.shippingAddress || checkoutState.newAddress
    };

    if (checkoutState.selectedPaymentType === 'zelle') {
      console.log('🔄 Preparando Zelle...');
      const totals = await checkoutApi.calculateOrderTotals({
        items: orderData.items,
        shippingMethod: orderData.shippingMethod,
        couponCode: orderData.couponCode
      });

      const realOrderNumber = generateOrderNumber();
      console.log('📋 Número generado para Zelle:', realOrderNumber);       
      

      const zelleData = {
        orderId: realOrderNumber,
        amount: totals.total,
        currency: 'USD',
        orderData,
        tempOrder: true
      };
      console.log('📋 ZelleData final:', zelleData); 
      
      setSquarePaymentData(zelleData);

    } else {
    const totals = await checkoutApi.calculateOrderTotals({
      items: orderData.items,
      shippingMethod: orderData.shippingMethod,
      couponCode: orderData.couponCode
    });

    console.log('Datos preparados para pago, abriendo formulario...');

    const paymentData = {
      orderId: `temp-${Date.now()}`,
      amount: totals.total,
      currency: 'USD',
      buyerEmail: user?.email,
      orderData,
      shippingAddress: checkoutState.shippingAddress ? 
        checkoutState.shippingAddress : 
        checkoutState.newAddress
    };
    
    setSquarePaymentData(paymentData);  
    } 

  } catch (err: any) {
    console.error('Error preparando pedido:', err);
    error(`Error preparando el pedido: ${err.message || 'Error desconocido'}`);
    setIsProcessing(false);
  }
  setCheckoutState(prev => ({ ...prev, currentStep: 4 }));
  setIsProcessing(false);
};

  const handleSquarePaymentSuccess = (paymentResult: any) => {
    console.log('✅ Pago con Square exitoso:', paymentResult);

    setIsProcessing(false);
    
    setOrderResult(paymentResult);
    setShowSuccessDialog(true);
    clearCart();
    
    success('¡Pago procesado exitosamente!');
  };

  const handleSquarePaymentError = (errorMessage: string) => {
    console.error('❌ Error en pago con Square:', errorMessage);
    
    setIsProcessing(false);
    
    let contextualMessage = errorMessage;
    
    if (errorMessage.includes('fondos insuficientes')) {
      contextualMessage += '\n\nPuedes intentar con otra tarjeta o método de pago.';
    } else if (errorMessage.includes('declinada')) {
      contextualMessage += '\n\nVerifica los datos de tu tarjeta o contacta a tu banco.';
    } else if (errorMessage.includes('expirada')) {
      contextualMessage += '\n\nPor favor usa una tarjeta vigente.';
    } else if (errorMessage.includes('inválid')) {
      contextualMessage += '\n\nRevisa que todos los datos sean correctos.';
    }
    
    error(contextualMessage);
  };

  

  const getStepStatus = (step: number) => {
    if (step < checkoutState.currentStep) return 'completed';
    if (step === checkoutState.currentStep) return 'current';
    return 'pending';
  };

  const handleZellePaymentConfirm = async () => {
  try {
    setIsProcessing(true);

    const orderData = {
      items: items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        variants: item.variant ? { [item.variant.type]: item.variant.value } : undefined
      })),
      shippingMethod: checkoutState.shippingMethod as any,
      paymentMethod: 'zelle' as any,
      customerNotes: checkoutState.customerNotes || undefined,
      couponCode: checkoutState.appliedCoupon?.code,
      shippingAddressId: checkoutState.shippingAddress?.id,
      shippingAddress: checkoutState.shippingAddress || checkoutState.newAddress
    };

    const response = await checkoutApi.createOrder(orderData);
    
    setOrderResult({
      order: {
        ...response.order,
        paymentMethod: 'Zelle - Pendiente de confirmación'
      }
    });
    setShowSuccessDialog(true);
    clearCart();
    success('Pedido creado. Te contactaremos cuando confirmemos tu pago.');

  } catch (err: any) {
    error(`Error creando pedido: ${err.message || 'Error desconocido'}`);
  } finally {
    setIsProcessing(false);
  }
};

  const canProceedToNextStep = (): boolean => {
    switch (checkoutState.currentStep) {
      case 1:
        return !!(checkoutState.shippingAddress || isValidNewAddress());
      case 2:
        return !!checkoutState.shippingMethod;      
      default:
        return true;
    }
  };

  if (!isAuthenticated || items.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-darkbg">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gold" />
            <div className="text-lg text-white">Cargando checkout...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkbg">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-gold transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-gold transition-colors">Carrito</Link>
          <span>/</span>
          <span className="text-white font-medium">Checkout</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <ShoppingCart className="h-8 w-8 mr-3 text-gold" />
              Finalizar Compra
            </h1>
            <p className="text-gray-400 mt-2">
              {totalItems} producto{totalItems !== 1 ? 's' : ''} en tu carrito
            </p>
          </div>
          
          <Button 
            asChild 
            variant="outline" 
            className="hidden sm:flex border-gold/30 text-white hover:bg-darkbg-light"
          >
            <Link href="/cart">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Carrito
            </Link>
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { number: 1, title: 'Envío', icon: MapPin },
              { number: 2, title: 'Método', icon: Truck },
              { number: 3, title: 'Confirmar', icon: CheckCircle },
              { number: 4, title: 'Pago', icon: CreditCard }
            ].map((step, index) => {
              const status = getStepStatus(step.number);
              const Icon = step.icon;
              
              return (
  <div key={step.number} className="flex items-center">
    <div className={`
      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
      ${status === 'completed' 
        ? 'bg-cyan border-cyan text-darkbg sm:text-darkbg [&>svg]:text-darkbg sm:[&>svg]:text-darkbg' 
        : status === 'current' 
        ? 'bg-gold border-gold text-darkbg sm:text-darkbg [&>svg]:text-darkbg sm:[&>svg]:text-darkbg' 
        : 'bg-darkbg-light border-gold/30 text-gray-400 [&>svg]:text-gray-400'}
    `}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="ml-3 hidden sm:block">
      <div className={`text-sm font-medium ${
        status === 'current' ? 'text-gold' : 
        status === 'completed' ? 'text-cyan' : 'text-gray-400'
      }`}>
        {step.title}
      </div>
    </div>
    {index < 3 && (
      <div className={`flex-1 h-0.5 mx-4 ${
        step.number < checkoutState.currentStep ? 'bg-cyan' : 'bg-gold/20'
      }`} />
    )}
  </div>
);
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de Checkout */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Paso 1: Dirección de Envío */}
            {checkoutState.currentStep === 1 && (
              <Card className="bg-darkbg-light/80 backdrop-blur-sm border-gold/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <MapPin className="h-5 w-5 mr-2 text-gold" />
                    Dirección de Envío
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {checkoutSession?.addresses.length ? (
                    <div className="space-y-4">
                      <h3 className="font-medium text-white">Direcciones Guardadas</h3>
                      <RadioGroup
                        value={checkoutState.shippingAddress?.id || 'new'}
                        onValueChange={(value) => {
                          if (value === 'new') {
                            setCheckoutState(prev => ({ ...prev, shippingAddress: null }));
                          } else {
                            const address = checkoutSession.addresses.find(a => a.id === value);
                            setCheckoutState(prev => ({ ...prev, shippingAddress: address || null }));
                          }
                        }}
                      >
                        {checkoutSession.addresses.map((address) => (
                          <div key={address.id} className="flex items-start space-x-3 p-4 border border-gold/20 rounded-lg bg-darkbg/50 hover:border-gold/40">
                            <RadioGroupItem value={address.id} className="mt-1" />
                            <div className="flex-1">
                              <div className="font-medium text-white">{address.name}</div>
                              <div className="text-sm text-gray-400 mt-1">
                                {checkoutApi.formatAddress(address)}
                              </div>
                              {address.isDefault && (
                                <Badge variant="outline" className="mt-2 border-cyan/30 text-cyan">Predeterminada</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                        <div className="flex items-start space-x-3 p-4 border border-gold/20 rounded-lg bg-darkbg/50 hover:border-gold/40">
                          <RadioGroupItem value="new" className="mt-1" />
                          <div className="flex-1">
                            <div className="font-medium text-white">Nueva Dirección</div>
                            <div className="text-sm text-gray-400">Agregar una nueva dirección de envío</div>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  ) : null}

                  {(!checkoutState.shippingAddress) && (
                    <div className="space-y-4">
                      <h3 className="font-medium text-white">
                        {checkoutSession?.addresses.length ? 'Nueva Dirección' : 'Dirección de Envío'}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-gray-300">Nombre completo</Label>
                          <Input
                            id="name"
                            value={checkoutState.newAddress.name}
                            onChange={(e) => setCheckoutState(prev => ({
                              ...prev,
                              newAddress: { ...prev.newAddress, name: e.target.value }
                            }))}
                            placeholder="Juan Pérez"
                            className="bg-darkbg border-gold/30 text-white placeholder-gray-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-gray-300">Teléfono</Label>
                          <Input
                            id="phone"
                            value={checkoutState.newAddress.phone}
                            onChange={(e) => setCheckoutState(prev => ({
                              ...prev,
                              newAddress: { ...prev.newAddress, phone: e.target.value }
                            }))}
                            placeholder="+52 555 234 5678"
                            className="bg-darkbg border-gold/30 text-white placeholder-gray-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="street" className="text-gray-300">Dirección</Label>
                        <Input
                          id="street"
                          value={checkoutState.newAddress.street}
                          onChange={(e) => setCheckoutState(prev => ({
                            ...prev,
                            newAddress: { ...prev.newAddress, street: e.target.value }
                          }))}
                          className="bg-darkbg border-gold/30 text-white placeholder-gray-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city" className="text-gray-300">Ciudad</Label>
                          <Input
                            id="city"
                            value={checkoutState.newAddress.city}
                            onChange={(e) => setCheckoutState(prev => ({
                              ...prev,
                              newAddress: { ...prev.newAddress, city: e.target.value }
                            }))}
                            className="bg-darkbg border-gold/30 text-white placeholder-gray-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state" className="text-gray-300">Estado</Label>
                          <Input
                            id="state"
                            value={checkoutState.newAddress.state}
                            onChange={(e) => setCheckoutState(prev => ({
                              ...prev,
                              newAddress: { ...prev.newAddress, state: e.target.value }
                            }))}
                            className="bg-darkbg border-gold/30 text-white placeholder-gray-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="country" className="text-gray-300">País</Label>
                          <CountrySelect
                            value={checkoutState.newAddress.country}
                            onValueChange={(value) => setCheckoutState(prev => ({
                              ...prev,
                              newAddress: { ...prev.newAddress, country: value }
                            }))}
                            placeholder="Selecciona tu país"
                          />
                        </div>
                        <div>
                          <Label htmlFor="zipCode" className="text-gray-300">Código Postal</Label>
                          <Input
                            id="zipCode"
                            value={checkoutState.newAddress.zipCode}
                            onChange={(e) => setCheckoutState(prev => ({
                              ...prev,
                              newAddress: { ...prev.newAddress, zipCode: e.target.value }
                            }))}
                            placeholder="01000"
                            className="bg-darkbg border-gold/30 text-white placeholder-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCheckoutState(prev => ({ ...prev, currentStep: 2 }))}
                      disabled={!canProceedToNextStep()}
                      className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg"
                    >
                      Continuar
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Paso 2: Método de Envío */}
            {checkoutState.currentStep === 2 && (
              <Card className="bg-darkbg-light/80 backdrop-blur-sm border-gold/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Truck className="h-5 w-5 mr-2 text-gold" />
                    Método de Envío
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={checkoutState.shippingMethod}
                    onValueChange={(value) => 
                      setCheckoutState(prev => ({ ...prev, shippingMethod: value }))
                    }
                  >
                    {checkoutSession?.shippingMethods.map((method) => (
                      <div key={method.id} className="flex items-center space-x-3 p-4 border border-gold/20 rounded-lg bg-darkbg/50 hover:border-gold/40">
                        <RadioGroupItem value={method.id} />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-white">{method.name}</div>
                              <div className="text-sm text-gray-400">{method.description}</div>
                              <div className="text-sm text-gray-500 mt-1">
                                Entrega estimada: {checkoutApi.getEstimatedDelivery(method.id)}
                              </div>
                            </div>
                            <div className="text-right">
                              {method.isFree ? (
                                <span className="font-bold text-cyan">GRATIS</span>
                              ) : (
                                <span className="font-medium text-white">{formatPrice(method.price)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCheckoutState(prev => ({ ...prev, currentStep: 1 }))}
                      className="border-gold/30 text-white hover:bg-darkbg-light"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Atrás
                    </Button>
                    <Button
                      onClick={() => setCheckoutState(prev => ({ ...prev, currentStep: 3 }))}
                      disabled={!canProceedToNextStep()}
                      className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg"
                    >
                      Revisar Pedido
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}           

            {/* Paso 3: Revisar y Confirmar */}
            {checkoutState.currentStep === 3 && (
              <Card className="bg-darkbg-light/80 backdrop-blur-sm border-gold/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <CheckCircle className="h-5 w-5 mr-2 text-gold" />
                    Continuar al Pago
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Resumen de direcciones */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-3 text-white">Dirección de Envío</h3>
                      <div className="p-4 bg-darkbg/50 rounded-lg text-sm border border-gold/20">
                        {checkoutState.shippingAddress ? (
                          <>
                            <div className="font-medium text-white">{checkoutState.shippingAddress.name}</div>
                            <div className="text-gray-400 mt-1">
                              {checkoutApi.formatAddress(checkoutState.shippingAddress)}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-medium text-white">{checkoutState.newAddress.name}</div>
                            <div className="text-gray-400 mt-1">
                              {checkoutState.newAddress.street}<br />
                              {checkoutState.newAddress.city}, {checkoutState.newAddress.state} {checkoutState.newAddress.zipCode}<br />
                              {checkoutState.newAddress.country}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3 text-white">Método de Pago</h3>
                      <div className="p-4 bg-darkbg/50 rounded-lg text-sm border border-gold/20">
                        {checkoutState.paymentMethod && (
                          <div className="font-medium text-white">
                            {checkoutApi.getPaymentMethodDescription(checkoutState.paymentMethod)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>                 

                  {/* Notas del cliente */}
                  <div>
                    <Label htmlFor="customerNotes" className="text-gray-300">Notas del Pedido (Opcional)</Label>
                    <Textarea
                      id="customerNotes"
                      value={checkoutState.customerNotes}
                      onChange={(e) => setCheckoutState(prev => ({ 
                        ...prev, 
                        customerNotes: e.target.value 
                      }))}
                      placeholder="Instrucciones especiales para la entrega..."
                      className="mt-2 bg-darkbg border-gold/30 text-white placeholder-gray-500"
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCheckoutState(prev => ({ ...prev, currentStep: 2 }))}
                      disabled={isProcessing}
                      className="border-gold/30 text-white hover:bg-darkbg-light"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Atrás
                    </Button>
                    <Button
                      onClick={handleCreateOrder}
                      disabled={isProcessing}
                      className="bg-gradient-to-r from-cyan to-gold hover:from-gold hover:to-cyan text-darkbg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Confirmar Pedido
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

           {/* Paso 4: Pago */}
{checkoutState.currentStep === 4 && (
  <Card className="bg-darkbg-light/80 backdrop-blur-sm border-gold/20">
    <CardHeader>
      <CardTitle className="flex items-center text-white">
        <CreditCard className="h-5 w-5 mr-2 text-gold" />
        Completar Pago
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      {/* SELECTOR DE MÉTODO DE PAGO */}
      <div>
        <Label className="text-base font-medium text-white">Método de Pago</Label>
        <RadioGroup
          value={checkoutState.selectedPaymentType || 'square'}
          onValueChange={(value) => 
             setCheckoutState(prev => ({ ...prev, selectedPaymentType: value as 'square' | 'zelle' }))
       }
          className="mt-3"
        >
          <div className="flex items-center space-x-2 p-3 border border-gold/20 rounded-lg hover:bg-darkbg/50 bg-darkbg/30">
            <RadioGroupItem value="square" id="square" />
            <Label htmlFor="square" className="flex items-center cursor-pointer flex-1 text-white">
              <CreditCard className="h-4 w-4 mr-2 text-gold" />
              <div>
                <div className="font-medium">Tarjeta de Crédito/Débito</div>
                <div className="text-sm text-gray-400">Procesado por Square - Seguro y rápido</div>
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 p-3 border border-gold/20 rounded-lg hover:bg-darkbg/50 bg-darkbg/30">
            <RadioGroupItem value="zelle" id="zelle" />
            <Label htmlFor="zelle" className="flex items-center cursor-pointer flex-1 text-white">
              <DollarSign className="h-4 w-4 mr-2 text-cyan" />
              <div>
                <div className="font-medium">Zelle</div>
                <div className="text-sm text-gray-400">Transferencia bancaria instantánea</div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* COMPONENTE SQUARE */}
      {checkoutState.selectedPaymentType === 'square' && squarePaymentData && (
        <SquarePaymentForm
          paymentData={squarePaymentData}
          onSuccess={handleSquarePaymentSuccess}
          onError={handleSquarePaymentError}
        />
      )}

      {/* COMPONENTE ZELLE */}
      {checkoutState.selectedPaymentType === 'zelle' && squarePaymentData && (
        <ZellePaymentInstructions
          paymentData={{
            orderId: squarePaymentData.orderId,
            amount: squarePaymentData.amount, 
            currency: 'USD'
          }}
          onConfirm={handleZellePaymentConfirm}
        />
      )}
      
      {/* BOTONES DE NAVEGACIÓN */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => setCheckoutState(prev => ({ ...prev, currentStep: 3 }))}
          disabled={isProcessing}
          className="border-gold/30 text-white hover:bg-darkbg-light"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        
        <div className="text-right text-xs text-gray-400">
          <div className="flex items-center">
            <Shield className="h-3 w-3 mr-1 text-cyan" />
            Transacción 100% segura
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)}

            {/* Productos en el pedido */}
            <Card className="bg-darkbg-light/80 backdrop-blur-sm border-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Package className="h-5 w-5 mr-2 text-gold" />
                  Productos ({totalItems})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Image
                          src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
                          alt={item.product.name}
                          width={60}
                          height={60}
                          className="rounded-lg object-cover border border-gold/20"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-2 text-white">
                          {item.product.name}
                        </h3>
                        {item.variant && (
                          <p className="text-xs text-gray-400 mt-1">
                            {item.variant.type}: {item.variant.value}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatPrice(item.product.price)} c/u
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advertencia de Stock */}
{showStockWarning && stockWarnings.length > 0 && (
  <StockWarning
    items={stockWarnings}
    onClose={() => setShowStockWarning(false)}
    onRemoveOutOfStockItems={removeOutOfStockItems}
    className="mb-6"
  />
)}

          {/* Resumen del Pedido */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 bg-darkbg-light/90 backdrop-blur-sm border-gold/20">
              <CardHeader className="bg-gradient-to-r from-gold to-cyan text-darkbg rounded-t-lg">
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderTotals ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white">{formatPrice(orderTotals.subtotal)}</span>
                    </div>

                    {orderTotals.appliedCoupon && (
                      <div className="flex justify-between text-cyan">
                        <span>Descuento ({orderTotals.appliedCoupon.code})</span>
                        <span>-{formatPrice(orderTotals.discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-400">Envío</span>
                      {orderTotals.shippingCost === 0 ? (
                        <span className="text-cyan font-medium">GRATIS</span>
                      ) : (
                        <span className="text-white">{formatPrice(orderTotals.shippingCost)}</span>
                      )}
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">Impuestos</span>
                      <span className="text-white">{formatPrice(orderTotals.tax)}</span>
                    </div>

                    <Separator className="bg-gold/20" />

                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-white">Total</span>
                      <span className="bg-gradient-to-r from-gold to-cyan bg-clip-text text-transparent">{formatPrice(orderTotals.total)}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-gold" />
                    <p className="text-sm text-gray-400">Calculando totales...</p>
                  </div>
                )}

                {/* Cupón de descuento */}
                <Separator className="bg-gold/20" />
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center text-white">
                    <Tag className="h-4 w-4 mr-2 text-gold" />
                    Cupón de Descuento
                  </h3>
                  
                  {!checkoutState.appliedCoupon ? (
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Código de cupón"
                        value={checkoutState.couponCode}
                        onChange={(e) => setCheckoutState(prev => ({ 
                          ...prev, 
                          couponCode: e.target.value.toUpperCase() 
                        }))}
                        className="flex-1 text-sm bg-darkbg border-gold/30 text-white placeholder-gray-500"
                      />
                      <Button 
                        size="sm"
                        onClick={handleApplyCoupon}
                        disabled={!checkoutState.couponCode.trim()}
                        className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg"
                      >
                        Aplicar
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-cyan/20 border border-cyan/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-cyan">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">
                            {checkoutState.appliedCoupon.code}
                          </span>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Garantías */}
                <Separator className="bg-gold/20" />
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex items-center">
                    <Shield className="h-3 w-3 mr-2 text-cyan" />
                    <span>Compra 100% segura</span>
                  </div>
                  <div className="flex items-center">
                    <Truck className="h-3 w-3 mr-2 text-cyan" />
                    <span>Envío con seguimiento</span>
                  </div>
                  <div className="flex items-center">
                    <Package className="h-3 w-3 mr-2 text-cyan" />
                    <span>Garantía de satisfacción</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>      

        {/* Dialog de éxito */}
        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <AlertDialogContent className="bg-darkbg-light border-gold/30">
            <AlertDialogHeader>
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-cyan/20 rounded-full">
                <CheckCircle className="h-8 w-8 text-cyan" />
              </div>
              <AlertDialogTitle className="text-center text-white">
                ¡Pedido Confirmado!
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-gray-400">
                Tu pedido ha sido procesado exitosamente.
                {orderResult && (
                  <div className="mt-4 p-4 bg-darkbg/50 rounded-lg border border-gold/20">
                    <div className="text-sm">
                      <div className="text-white"><strong>Número de pedido:</strong> {orderResult.order.orderNumber}</div>
                      <div className="text-white"><strong>Total:</strong> {formatPrice(orderResult.order.total)}</div>
                      <div className="text-white"><strong>Estado:</strong> {orderResult.order.status}</div>
                    </div>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center">
              <AlertDialogAction
                onClick={() => {
                  if (orderResult?.redirectUrl) {
                    router.push(orderResult.redirectUrl);
                  } else {
                    router.push('/account/orders');
                  }
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg"
              >
                Ver Detalles del Pedido
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}