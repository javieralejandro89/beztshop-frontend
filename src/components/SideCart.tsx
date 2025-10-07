// src/components/SideCart.tsx - Carrito lateral con efectos visuales
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Star,
  Gift,
  Zap,
  Heart,
  ShoppingCart
} from 'lucide-react';
import { useCartStore } from '@/lib/cartStore';
import { formatPrice } from '@/lib/utils';
import type { CartItem } from '@/lib/cartStore';

export default function SideCart() {
  const {
    items,
    isOpen,
    totalItems,
    totalPrice,
    updateQuantity,
    removeItem,
    clearCart,
    closeCart,
  } = useCartStore();

  const [isClearing, setIsClearing] = useState(false);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    setRemovingItems(prev => new Set(prev).add(itemId));
    
    // Delay para animación
    setTimeout(() => {
      removeItem(itemId);
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 300);
  };

  const handleClearCart = async () => {
    setIsClearing(true);
    
    // Delay para animación
    setTimeout(() => {
      clearCart();
      setIsClearing(false);
    }, 500);
  };

  const freeShippingThreshold = 100;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - totalPrice);
  const freeShippingProgress = Math.min(100, (totalPrice / freeShippingThreshold) * 100);

  const CartItem = ({ item }: { item: CartItem }) => {
    const isRemoving = removingItems.has(item.id);
    const primaryImage = item.product.images?.[0]?.url || '/placeholder-product.jpg';

    return (
      <div 
        className={`group relative bg-darkbg-light/80 backdrop-blur-sm rounded-lg p-4 border border-gold/20 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gold/40 ${
          isRemoving ? 'opacity-0 scale-95 translate-x-full' : 'opacity-100 scale-100 translate-x-0'
        }`}
      >
        <div className="flex space-x-3">
          {/* Imagen del producto */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-darkbg rounded-lg overflow-hidden border border-gold/10">
              <Image
                src={primaryImage}
                alt={item.product.name}
                width={64}
                height={64}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
              />
            </div>
          </div>

          {/* Información del producto */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-gold transition-colors">
                  {item.product.name}
                </h3>
                {item.product.brand && (
                  <p className="text-xs text-gray-400 mt-1">
                    {item.product.brand}
                  </p>
                )}
                {item.variant && (
                  <p className="text-xs text-gray-400 mt-1">
                    {item.variant.type}: {item.variant.value}
                  </p>
                )}
              </div>
              
              {/* Botón eliminar */}
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="ml-2 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                disabled={isRemoving}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Precio y cantidad */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-gold/30 bg-darkbg hover:bg-gold/20 hover:border-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="h-3 w-3 text-white" />
                </button>
                
                <span className="text-sm font-medium min-w-[24px] text-center text-white">
                  {item.quantity}
                </span>
                
                <button
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= (item.product.stockCount || 999)}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-gold/30 bg-darkbg hover:bg-gold/20 hover:border-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-3 w-3 text-white" />
                </button>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-gold">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
                {item.product.comparePrice && (
                  <p className="text-xs text-gray-500 line-through">
                    {formatPrice(item.product.comparePrice * item.quantity)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de stock bajo */}
        {item.product.stockCount <= 5 && item.product.stockCount > 0 && (
          <div className="mt-2 text-xs text-orange-400 flex items-center">
            <Zap className="h-3 w-3 mr-1" />
            Solo quedan {item.product.stockCount} disponibles
          </div>
        )}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent 
        side="right" 
        className="w-full sm:w-96 p-0 bg-gradient-to-b from-darkbg via-darkbg-light to-darkbg border-l-2 border-gold/20"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <SheetHeader className="p-6 bg-gradient-to-r from-gold/20 via-cyan/10 to-gold/20 backdrop-blur-sm text-white border-b border-gold/20">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center text-white">
                <ShoppingBag className="h-5 w-5 mr-2 text-gold" />
                Mi Carrito
                {totalItems > 0 && (
                  <Badge className="ml-2 bg-gradient-to-r from-gold to-cyan text-darkbg animate-bounce-gentle font-bold">
                    {totalItems}
                  </Badge>
                )}
              </SheetTitle>
              <button 
                onClick={closeCart}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SheetDescription className="text-gray-300">
              {totalItems === 0 
                ? "Tu carrito está vacío" 
                : `${totalItems} producto${totalItems !== 1 ? 's' : ''} en tu carrito`
              }
            </SheetDescription>
          </SheetHeader>

          {/* Contenido */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {items.length === 0 ? (
              /* Carrito vacío */
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center space-y-4 animate-fade-in">
                  <div className="w-24 h-24 bg-gradient-to-br from-gold/20 to-cyan/20 rounded-full flex items-center justify-center mx-auto border-2 border-gold/30">
                    <ShoppingCart className="h-12 w-12 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      Tu carrito está vacío
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      ¡Agrega algunos productos increíbles!
                    </p>
                  </div>
                  <Button 
                    asChild 
                    onClick={closeCart}
                    className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg shadow-glow-gold hover:shadow-glow-cyan transform hover:scale-105 transition-all duration-200 font-bold"
                  >
                    <Link href="/products">
                      <Heart className="h-4 w-4 mr-2" />
                      Explorar Productos
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              /* Carrito con productos */
              <>
                {/* Barra de envío gratuito */}
                {remainingForFreeShipping > 0 && (
                  <div className="p-4 bg-gradient-to-r from-gold/10 to-cyan/10 backdrop-blur-sm border-b border-gold/20">
                    <div className="text-center mb-2">
                      <p className="text-sm text-gray-300">
                        <span className="font-medium text-gold">
                          {formatPrice(remainingForFreeShipping)}
                        </span> más para envío <span className="font-semibold text-white">GRATIS</span>
                      </p>
                    </div>
                    <div className="w-full bg-darkbg-light rounded-full h-2 border border-gold/20">
                      <div 
                        className="bg-gradient-to-r from-gold to-cyan h-2 rounded-full transition-all duration-500 shadow-glow-gold"
                        style={{ width: `${freeShippingProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {totalPrice >= freeShippingThreshold && (
                  <div className="p-4 bg-gradient-to-r from-gold/20 to-cyan/20 backdrop-blur-sm border-b border-gold/30 animate-bounce-gentle">
                    <div className="flex items-center justify-center text-gold">
                      <Gift className="h-5 w-5 mr-2" />
                      <span className="font-medium">¡Felicidades! Tienes envío GRATIS</span>
                    </div>
                  </div>
                )}

                {/* Lista de productos */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>

                {/* Footer con totales y botones */}
                <div className="border-t border-gold/20 bg-darkbg-light/50 backdrop-blur-sm p-6 space-y-4">
                  {/* Botón limpiar carrito */}
                  {items.length > 1 && (
                    <div className="text-center">
                      <button
                        onClick={handleClearCart}
                        disabled={isClearing}
                        className="text-sm text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                      >
                        {isClearing ? 'Limpiando...' : 'Limpiar carrito'}
                      </button>
                    </div>
                  )}

                  {/* Subtotal */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Subtotal</span>
                      <span className="font-medium text-white">{formatPrice(totalPrice)}</span>
                    </div>
                    
                    {totalPrice >= freeShippingThreshold ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Envío</span>
                        <span className="font-medium text-gold">GRATIS</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Envío</span>
                        <span className="font-medium text-cyan">Calcular en checkout</span>
                      </div>
                    )}
                    
                    <div className="border-t border-gold/20 pt-2 flex justify-between font-semibold text-lg">
                      <span className="text-white">Total</span>
                      <span className="text-gold text-xl">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="space-y-3">
                    <Button 
                      asChild 
                      className="w-full bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-bold shadow-glow-gold hover:shadow-glow-cyan transform hover:scale-105 transition-all duration-200"
                      onClick={closeCart}
                    >
                      <Link href="/cart">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Ver Carrito Completo
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    
                    <Button 
                      asChild 
                      variant="outline" 
                      className="w-full border-gold/30 bg-darkbg text-white hover:bg-gold/10 hover:border-gold/50"
                      onClick={closeCart}
                    >
                      <Link href="/products">
                        Seguir Comprando
                      </Link>
                    </Button>
                  </div>

                  {/* Mensajes de seguridad */}
                  <div className="text-center text-xs text-gray-400 space-y-1">
                    <p className="flex items-center justify-center">
                      <Star className="h-3 w-3 mr-1 text-gold" />
                      Compra 100% segura y garantizada
                    </p>
                    <p>Devoluciones gratuitas dentro de 30 días</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}