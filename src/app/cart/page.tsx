// src/app/cart/page.tsx - Página completa del carrito con checkout - Dark Tech Theme
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Gift,
  Truck,
  Shield,
  Star,
  Zap,
  Heart,
  Tag,
  CreditCard,
  Lock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { useCartStore } from '@/lib/cartStore';
import { useAuthStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { productsApi } from '@/lib/api';
import type { Product, CartItem } from '@/types';

export default function CartPage() {
  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartStore();

  const { isAuthenticated, user } = useAuthStore();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecommendedProducts();
    setIsLoading(false);
  }, []);

  const loadRecommendedProducts = async () => {
    try {
      const response = await productsApi.getProducts({ featured: true, limit: 4 });
      setRecommendedProducts(response.data);
    } catch (error) {
      console.error('Error loading recommended products:', error);
    }
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    setRemovingItems(prev => new Set(prev).add(itemId));
    
    setTimeout(() => {
      removeItem(itemId);
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 300);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsApplyingCoupon(true);
    
    // Simular aplicación de cupón
    setTimeout(() => {
      if (couponCode.toLowerCase() === 'descuento10') {
        setAppliedCoupon({
          code: couponCode,
          discount: totalPrice * 0.1,
          type: 'percentage',
          value: 10
        });
      } else {
        // Cupón inválido
        setAppliedCoupon(null);
      }
      setIsApplyingCoupon(false);
    }, 1000);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  // Cálculos
  const subtotal = totalPrice;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const freeShippingThreshold = 100;
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : 15;
  const tax = (subtotal - couponDiscount) * 0.08; // 8% impuesto
  const total = subtotal - couponDiscount + shippingCost + tax;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const shippingOptions = [
    { id: 'standard', name: 'Envío Estándar', time: '5-7 días', cost: 15 },
    { id: 'express', name: 'Envío Rápido', time: '2-3 días', cost: 25 },
    { id: 'overnight', name: 'Envío Overnight', time: '1 día', cost: 45 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-darkbg">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-darkbg-light rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-darkbg-light rounded-lg"></div>
                ))}
              </div>
              <div className="h-96 bg-darkbg-light rounded-lg"></div>
            </div>
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
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6 animate-fade-in">
          <Link href="/" className="hover:text-gold transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-white font-medium">Carrito</span>
        </nav>

        {/* Título */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <ShoppingCart className="h-8 w-8 mr-3 text-gold" />
              Mi Carrito
              {totalItems > 0 && (
                <Badge className="ml-3 bg-gradient-to-r from-gold to-cyan text-darkbg animate-bounce-gentle">
                  {totalItems} producto{totalItems !== 1 ? 's' : ''}
                </Badge>
              )}
            </h1>
            {items.length > 0 && (
              <p className="text-gray-400 mt-2">
                Revisa tus productos antes de proceder al checkout
              </p>
            )}
          </div>
          
          <Button 
            asChild 
            variant="outline" 
            className="hidden sm:flex border-gold/30 text-white hover:bg-darkbg-light hover:border-gold/50"
          >
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Seguir Comprando
            </Link>
          </Button>
        </div>

        {items.length === 0 ? (
          /* Carrito vacío */
          <div className="text-center py-16 animate-fade-in">
            <div className="bg-gradient-to-br from-gold/20 to-cyan/20 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 shadow-glow-gold">
              <ShoppingCart className="h-16 w-16 text-gold" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Tu carrito está vacío</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Parece que aún no has agregado ningún producto a tu carrito. ¡Explora nuestra increíble selección!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg shadow-glow-gold hover:shadow-glow-cyan transform hover:scale-105 transition-all duration-200"
              >
                <Link href="/products">
                  <Heart className="h-4 w-4 mr-2" />
                  Explorar Productos
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-gold/30 text-white hover:bg-darkbg-light">
                <Link href="/products?featured=true">
                  Ver Destacados
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          /* Carrito con productos */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de productos */}
            <div className="lg:col-span-2 space-y-6">
              {/* Barra de envío gratuito */}
              {remainingForFreeShipping > 0 && (
                <Card className="border-gold/30 bg-gradient-to-r from-gold/10 to-cyan/10 shadow-card-hover animate-fade-in">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <p className="text-white">
                        <span className="font-bold text-gold">
                          {formatPrice(remainingForFreeShipping)}
                        </span> más para obtener <span className="font-bold text-cyan">ENVÍO GRATIS</span>
                      </p>
                    </div>
                    <div className="w-full bg-darkbg-light rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-gold to-cyan h-3 rounded-full transition-all duration-700 shadow-glow-gold animate-pulse-gentle"
                        style={{ width: `${freeShippingProgress}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {subtotal >= freeShippingThreshold && (
                <Card className="border-cyan/30 bg-gradient-to-r from-cyan/20 to-gold/20 shadow-card-hover animate-bounce-gentle">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center text-cyan">
                      <Gift className="h-6 w-6 mr-3" />
                      <span className="font-bold text-lg">¡Felicidades! Tienes envío GRATIS</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Productos */}
              <Card className="shadow-card-hover border-0 bg-darkbg-light/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-gold to-cyan text-darkbg rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Productos en tu carrito
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gold/10">
                    {items.map((item) => {
                      const isRemoving = removingItems.has(item.id);
                      const primaryImage = item.product.images?.[0]?.url || '/placeholder-product.jpg';
                      
                      return (
                        <div 
                          key={item.id}
                          className={`p-6 transition-all duration-300 hover:bg-darkbg/50 ${
                            isRemoving ? 'opacity-0 scale-95 -translate-x-full' : 'opacity-100 scale-100 translate-x-0'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                            {/* Imagen */}
                            <div className="flex-shrink-0 mx-auto sm:mx-0">
                              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-darkbg rounded-lg overflow-hidden border border-gold/20 shadow-sm">
                                <Image
                                  src={primaryImage}
                                  alt={item.product.name}
                                  width={96}
                                  height={96}
                                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                                />
                              </div>
                            </div>

                            {/* Información del producto */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0">
                                <div className="flex-1 min-w-0">
                                  <Link 
                                    href={`/products/${item.product.slug}`}
                                    className="text-lg font-medium text-white hover:text-gold transition-colors line-clamp-2"
                                  >
                                    {item.product.name}
                                  </Link>
                                  
                                  {item.product.brand && (
                                    <p className="text-gray-400 mt-1">
                                      Marca: {item.product.brand}
                                    </p>
                                  )}
                                  
                                  {item.variant && (
                                    <p className="text-gray-400 mt-1">
                                      {item.variant.type}: {item.variant.value}
                                    </p>
                                  )}
                                  
                                  {item.product.stockCount <= 5 && item.product.stockCount > 0 && (
                                    <div className="flex items-center text-orange-400 mt-2">
                                      <AlertTriangle className="h-4 w-4 mr-1" />
                                      <span className="text-sm">Solo quedan {item.product.stockCount} disponibles</span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Precio */}
                                <div className="text-right sm:text-right sm:ml-4 mt-2 sm:mt-0 flex-shrink-0">
                                  <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gold to-cyan bg-clip-text text-transparent">
                                    {formatPrice(item.product.price * item.quantity)}
                                  </p>
                                  {item.product.comparePrice && (
                                    <p className="text-xs sm:text-sm text-gray-500 line-through">
                                      {formatPrice(item.product.comparePrice * item.quantity)}
                                    </p>
                                  )}
                                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                                    {formatPrice(item.product.price)} c/u
                                  </p>
                                </div>
                              </div>

                              {/* Controles de cantidad y eliminar */}
                              <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center space-x-3">
                                  <Label className="text-sm text-gray-400">Cantidad:</Label>
                                  <div className="flex items-center border border-gold/30 rounded-lg bg-darkbg">
                                    <button
                                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                      className="p-2 hover:bg-darkbg-light transition-colors text-white"
                                    >
                                      <Minus className="h-4 w-4" />
                                    </button>
                                    
                                    <Input
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                                      className="w-16 border-0 text-center focus:ring-0 bg-transparent text-white"
                                      min="1"
                                      max={item.product.stockCount}
                                    />
                                    
                                    <button
                                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                      disabled={item.quantity >= item.product.stockCount}
                                      className="p-2 hover:bg-darkbg-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-cyan"
                                  >
                                    <Heart className="h-4 w-4" />
                                  </Button>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="text-gray-400 hover:text-red-400"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Cupón de descuento */}
              <Card className="shadow-card-hover border-0 bg-darkbg-light/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Tag className="h-5 w-5 mr-2 text-gold" />
                    Cupón de Descuento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!appliedCoupon ? (
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Código de cupón"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 bg-darkbg border-gold/30 text-white placeholder-gray-500"
                      />
                      <Button 
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponCode.trim()}
                        className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg"
                      >
                        {isApplyingCoupon ? 'Aplicando...' : 'Aplicar'}
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-cyan/20 border border-cyan/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-cyan">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          <span className="font-medium">
                            Cupón "{appliedCoupon.code}" aplicado
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-cyan font-bold">
                            -{formatPrice(appliedCoupon.discount)}
                          </span>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Resumen del pedido */}
            <div className="space-y-6">
              <Card className="sticky top-24 shadow-card-hover border-0 bg-darkbg-light/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-gold to-cyan text-darkbg rounded-t-lg">
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Subtotal */}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal ({totalItems} productos)</span>
                    <span className="font-medium text-white">{formatPrice(subtotal)}</span>
                  </div>

                  {/* Descuento cupón */}
                  {appliedCoupon && (
                    <div className="flex justify-between text-cyan">
                      <span>Descuento ({appliedCoupon.code})</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}

                  {/* Envío */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Envío</span>
                      {shippingCost === 0 ? (
                        <span className="font-medium text-cyan">GRATIS</span>
                      ) : (
                        <span className="font-medium text-white">{formatPrice(shippingCost)}</span>
                      )}
                    </div>
                    
                    <Select value={shippingMethod} onValueChange={setShippingMethod}>
                      <SelectTrigger className="text-sm bg-darkbg border-gold/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {shippingOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            <div className="flex justify-between w-full">
                              <span>{option.name} ({option.time})</span>
                              <span className="ml-2">
                                {subtotal >= freeShippingThreshold && option.id === 'standard' 
                                  ? 'GRATIS' 
                                  : formatPrice(option.cost)
                                }
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Impuestos */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Impuestos</span>
                    <span className="text-white">{formatPrice(tax)}</span>
                  </div>

                  <Separator className="bg-gold/20" />

                  {/* Total */}
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-white">Total</span>
                    <span className="bg-gradient-to-r from-gold to-cyan bg-clip-text text-transparent">{formatPrice(total)}</span>
                  </div>

                  {/* Botón de checkout */}
                  <div className="space-y-3 pt-4">
                    <Button 
                      asChild 
                      className="w-full bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg shadow-glow-gold hover:shadow-glow-cyan transform hover:scale-105 transition-all duration-200 py-3"
                    >
                      <Link href={isAuthenticated ? "/checkout" : "/auth/login?redirect=/checkout"}>
                        <Lock className="h-4 w-4 mr-2" />
                        Proceder al Checkout
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    
                    {!isAuthenticated && (
                      <p className="text-xs text-center text-gray-400">
                        Necesitas una cuenta para proceder al checkout
                      </p>
                    )}
                  </div>

                  {/* Garantías */}
                  <div className="pt-4 space-y-2 text-xs text-gray-400">
                    <div className="flex items-center">
                      <Shield className="h-3 w-3 mr-2 text-cyan" />
                      <span>Compra 100% segura</span>
                    </div>
                    <div className="flex items-center">
                      <Truck className="h-3 w-3 mr-2 text-cyan" />
                      <span>Envío con seguimiento</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 mr-2 text-cyan" />
                      <span>Garantía de satisfacción</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Métodos de pago aceptados */}
              <Card className="shadow-card-hover border-0 bg-darkbg-light/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center text-white">
                    <CreditCard className="h-4 w-4 mr-2 text-gold" />
                    Métodos de pago aceptados
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-center justify-center space-x-4">
                    {/* Visa */}
                    <div className="w-14 h-9 bg-darkbg border border-gold/20 rounded flex items-center justify-center shadow-sm">
                      <span className="text-blue-400 font-bold text-sm tracking-wider">VISA</span>
                    </div>
                    
                    {/* Mastercard */}
                    <div className="bg-darkbg border border-gold/20 rounded-lg p-2 shadow-sm">
                      <svg width="40" height="24" viewBox="0 0 40 24">
                        <circle cx="15" cy="12" r="10" fill="#EB001B"/>
                        <circle cx="25" cy="12" r="10" fill="#F79E1B"/>
                        <path fill="#FF5F00" d="M20 5.5c-2 1.8-3.3 4.5-3.3 7.5s1.3 5.7 3.3 7.5c2-1.8 3.3-4.5 3.3-7.5s-1.3-5.7-3.3-7.5z"/>
                      </svg>
                    </div>
                    
                    {/* Zelle */}
                    <div className="w-14 h-9 bg-darkbg border border-gold/20 rounded flex items-center justify-center shadow-sm">
                      <span className="text-cyan font-bold text-xs tracking-wider">ZELLE</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Productos recomendados */}
        {recommendedProducts.length > 0 && (
          <section className="mt-16 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              También te puede interesar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((product, index) => (
                <div 
                  key={product.id}
                  className="animate-fade-in transform hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}