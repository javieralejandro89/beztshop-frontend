// src/app/wishlist/page.tsx - Página completa de favoritos - Dark Tech Theme
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Heart, 
  ShoppingCart, 
  Star,
  Trash2,
  ArrowLeft,
  Grid3X3,
  List,
  Loader2,
  Package
} from 'lucide-react';
import Header from '@/components/Header';
import WishlistButton from '@/components/WishlistButton';
import { useAuthStore } from '@/lib/store';
import { useToast } from '@/hooks/useToast';
import { formatPrice } from '@/lib/utils';
import wishlistApi, { type WishlistItem } from '@/lib/wishlistApi';

export default function WishlistPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { success, error, promise } = useToast();
  
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [clearDialog, setClearDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/wishlist');
      return;
    }
    loadWishlist();
  }, [isAuthenticated, page]);

  const loadWishlist = async () => {
    try {
      setIsLoading(true);
      const response = await wishlistApi.getWishlist({ page, limit: 12 });
      setWishlistItems(response.items);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Error loading wishlist:', err);
      error('Error al cargar la lista de favoritos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearWishlist = async () => {
    try {
      await promise(
        wishlistApi.clearWishlist(),
        {
          loading: 'Limpiando lista de favoritos...',
          success: 'Lista de favoritos limpiada exitosamente',
          error: 'Error al limpiar la lista'
        }
      );
      
      setWishlistItems([]);
      setPagination({ total: 0, pages: 0, hasNext: false, hasPrev: false });
      setClearDialog(false);
    } catch (err: any) {
      console.error('Error clearing wishlist:', err);
    }
  };

  const getImageUrl = (images: any) => {
    if (!Array.isArray(images) || images.length === 0) {
      return '/placeholder-product.jpg';
    }
    
    const firstImage = images[0];
    if (typeof firstImage === 'string') {
      return firstImage;
    }
    
    if (typeof firstImage === 'object' && firstImage?.url) {
      return firstImage.url;
    }
    
    return '/placeholder-product.jpg';
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
            onClick={() => router.back()}
            className="p-2 text-white hover:text-gold hover:bg-darkbg-light"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-400" />
              Mi Lista de Favoritos
            </h1>
            <p className="text-gray-400 mt-2">
              {pagination.total} producto{pagination.total !== 1 ? 's' : ''} guardado{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gold" />
            <div className="text-lg text-white">Cargando favoritos...</div>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Heart className="h-24 w-24 text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-white mb-4">
                Tu lista de favoritos está vacía
              </h2>
              <p className="text-gray-400 mb-8">
                Explora nuestros productos y guarda los que más te gusten para verlos después
              </p>
              <Button asChild size="lg" className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg">
                <Link href="/products">
                  <Package className="h-5 w-5 mr-2" />
                  Explorar Productos
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Controles */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-gradient-to-r from-gold to-cyan text-darkbg' : 'border-gold/30 text-white hover:bg-darkbg-light'}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-gradient-to-r from-gold to-cyan text-darkbg' : 'border-gold/30 text-white hover:bg-darkbg-light'}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Button 
                variant="outline" 
                onClick={() => setClearDialog(true)}
                className="text-red-400 border-red-400/50 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar Lista
              </Button>
            </div>

            {/* Lista de productos */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlistItems.map((item) => (
                  <Card key={item.id} className="group hover:shadow-glow-gold transition-shadow duration-200 bg-darkbg-light/80 backdrop-blur-sm border-gold/20">
                    <CardContent className="p-4">
                      <div className="relative mb-4">
                        <Link href={`/products/${item.product.slug}`}>
                          <Image
                            src={getImageUrl(item.product.images)}
                            alt={item.product.name}
                            width={300}
                            height={300}
                            className="w-full h-48 object-cover rounded-lg border border-gold/20"
                          />
                        </Link>
                        <div className="absolute top-2 right-2">
                          <WishlistButton 
                            productId={item.productId}
                            variant="icon"
                            size="sm"
                          />
                        </div>
                        {!item.product.inStock && (
                          <Badge variant="secondary" className="absolute top-2 left-2 bg-gray-700 text-white">
                            Agotado
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Link 
                            href={`/products/${item.product.slug}`}
                            className="font-semibold text-white hover:text-gold line-clamp-2"
                          >
                            {item.product.name}
                          </Link>
                          {item.product.brand && (
                            <p className="text-sm text-gray-400">{item.product.brand}</p>
                          )}
                        </div>

                        {item.product.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-gold text-gold" />
                            <span className="text-sm font-medium text-white">{item.product.rating}</span>
                            <span className="text-sm text-gray-400">({item.product.reviewCount})</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold bg-gradient-to-r from-gold to-cyan bg-clip-text text-transparent">
                            {formatPrice(item.product.price)}
                          </span>
                          {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(item.product.comparePrice)}
                            </span>
                          )}
                        </div>

                        <Button 
                          className="w-full bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg" 
                          disabled={!item.product.inStock}
                          asChild
                        >
                          <Link href={`/products/${item.product.slug}`}>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {item.product.inStock ? 'Ver Producto' : 'Agotado'}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {wishlistItems.map((item) => (
                  <Card key={item.id} className="hover:shadow-glow-gold transition-shadow bg-darkbg-light/80 backdrop-blur-sm border-gold/20">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <div className="relative flex-shrink-0">
                          <Link href={`/products/${item.product.slug}`}>
                            <Image
                              src={getImageUrl(item.product.images)}
                              alt={item.product.name}
                              width={120}
                              height={120}
                              className="w-30 h-30 object-cover rounded-lg border border-gold/20"
                            />
                          </Link>
                          {!item.product.inStock && (
                            <Badge variant="secondary" className="absolute top-2 left-2 bg-gray-700 text-white">
                              Agotado
                            </Badge>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <Link 
                                href={`/products/${item.product.slug}`}
                                className="text-lg font-semibold text-white hover:text-gold"
                              >
                                {item.product.name}
                              </Link>
                              {item.product.brand && (
                                <p className="text-gray-400">{item.product.brand}</p>
                              )}
                            </div>
                            <WishlistButton 
                              productId={item.productId}
                              variant="icon"
                              size="sm"
                            />
                          </div>

                          {item.product.rating && (
                            <div className="flex items-center gap-1 mb-3">
                              <Star className="h-4 w-4 fill-gold text-gold" />
                              <span className="text-sm font-medium text-white">{item.product.rating}</span>
                              <span className="text-sm text-gray-400">({item.product.reviewCount})</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold bg-gradient-to-r from-gold to-cyan bg-clip-text text-transparent">
                                {formatPrice(item.product.price)}
                              </span>
                              {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                                <span className="text-gray-500 line-through">
                                  {formatPrice(item.product.comparePrice)}
                                </span>
                              )}
                            </div>

                            <Button 
                              disabled={!item.product.inStock}
                              asChild
                              className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg"
                            >
                              <Link href={`/products/${item.product.slug}`}>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                {item.product.inStock ? 'Ver Producto' : 'Agotado'}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Paginación */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  disabled={!pagination.hasPrev}
                  onClick={() => setPage(page - 1)}
                  className="border-gold/30 text-white hover:bg-darkbg-light disabled:opacity-50 disabled:text-gray-600"
                >
                  Anterior
                </Button>
                
                <span className="text-sm text-gray-400">
                  Página {page} de {pagination.pages}
                </span>
                
                <Button
                  variant="outline"
                  disabled={!pagination.hasNext}
                  onClick={() => setPage(page + 1)}
                  className="border-gold/30 text-white hover:bg-darkbg-light disabled:opacity-50 disabled:text-gray-600"
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}

        {/* Dialog de confirmación para limpiar */}
        <AlertDialog open={clearDialog} onOpenChange={setClearDialog}>
          <AlertDialogContent className="bg-darkbg-light border-gold/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">¿Limpiar lista de favoritos?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Esta acción eliminará todos los productos de tu lista de favoritos. 
                No se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-darkbg border-gold/30 text-white hover:bg-darkbg-light">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleClearWishlist}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              >
                Limpiar Lista
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}