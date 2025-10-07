// src/components/ProductCard.tsx - Tarjeta de producto CON WishlistButton funcional
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '@/lib/cartStore';
import { formatPrice } from '@/lib/utils';
import WishlistButton from '@/components/WishlistButton'; // ✅ Importar el componente real
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
  showWishlist?: boolean;
}

export default function ProductCard({ 
  product, 
  showAddToCart = true, 
  showWishlist = true 
}: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Solo navegar si no se hizo click en elementos interactivos
    const target = e.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('a') || 
      target.closest('[data-interactive]')
    ) {
      return;
    }
    window.location.href = `/products/${product.slug}`;
  };

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.category) {
      window.location.href = `/categories/${product.category.slug}`;
    }
  };

  // Obtener la primera imagen o usar placeholder
  const primaryImage = product.images?.[0]?.url || '/placeholder-product.jpg';
  
  // Calcular descuento si hay precio de comparación
  const discountPercentage = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  // Determinar disponibilidad
  const isOutOfStock = product.stockCount <= 0;
  const isLowStock = product.stockCount <= 5 && product.stockCount > 0;

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 relative overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative">
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 space-y-1">
          {product.isFeatured && (
            <Badge className="bg-primary-600 text-white">
              Destacado
            </Badge>
          )}
          {discountPercentage && (
            <Badge className="bg-red-500 text-white">
              -{discountPercentage}%
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="secondary" className="bg-gray-500 text-white">
              Agotado
            </Badge>
          )}
          {isLowStock && (
            <Badge className="bg-orange-500 text-white">
              ¡Últimos disponibles!
            </Badge>
          )}
        </div>

        {/* ✅ WISHLIST BUTTON FUNCIONAL - Reemplazar el botón dummy */}
        {showWishlist && (
          <div className="absolute top-2 right-2 z-10">
            <WishlistButton 
              productId={product.id}
              productName={product.name}
              variant="icon"
              size="md"
              className="bg-white/80 hover:bg-white"
            />
          </div>
        )}

        {/* Product image */}
        <div className="aspect-square overflow-hidden bg-gray-100">
          <Image
            src={primaryImage}
            alt={product.name}
            width={300}
            height={300}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-product.jpg';
            }}
          />
        </div>

        {/* Quick add to cart button */}
        {showAddToCart && !isOutOfStock && (
          <Button
            onClick={handleAddToCart}
            className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary-600 hover:bg-primary-700"
            size="sm"
            data-interactive="true"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Agregar al Carrito
          </Button>
        )}
      </div>

      <CardContent className="p-4">
        {/* Category */}
        {product.category && (
          <div className="mb-1">
            <button
              onClick={handleCategoryClick}
              className="text-xs text-gray-500 hover:text-primary-600 uppercase tracking-wide transition-colors"
              data-interactive="true"
            >
              {product.category.name}
            </button>
          </div>
        )}

        {/* Product name */}
        <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        {/* Brand */}
        {product.brand && (
          <p className="text-sm text-gray-600 mb-2">
            {product.brand}
          </p>
        )}

        {/* Short description */}
        {product.shortDesc && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {product.shortDesc}
          </p>
        )}

        {/* Rating - placeholder por ahora */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="h-3 w-3 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">(25)</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
          
          {/* Stock indicator */}
          <div className="text-xs">
            {isOutOfStock ? (
              <span className="text-red-500 font-medium">Agotado</span>
            ) : isLowStock ? (
              <span className="text-orange-500 font-medium">
                Solo {product.stockCount} left
              </span>
            ) : (
              <span className="text-green-500 font-medium">Disponible</span>
            )}
          </div>
        </div>

        {/* Additional actions for out of stock */}
        {isOutOfStock && (
          <Button
            variant="outline"
            className="w-full mt-3"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // TODO: Implementar notificación cuando esté disponible
            }}
            data-interactive="true"
          >
            <span className="hidden md:inline">Notificar disponibilidad</span>
            <span className="md:hidden">Notificarme cuando esté disponible</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}