// src/app/products/[slug]/page.tsx - Página de detalle del producto con efectos visuales
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Heart,
  ShoppingCart,
  Star,
  Plus,
  Minus,
  Share2,
  Shield,
  Truck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Zap,
  Award,
  CheckCircle,
} from 'lucide-react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { useCartStore } from '@/lib/cartStore';
import { productsApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Product } from '@/types';
import ProductReviews from '@/components/ProductReviews';
import WishlistButton from '@/components/WishlistButton'; 
import { useToast } from '@/hooks/useToast';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>({});
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  
  const { addItem } = useCartStore();
  const { success } = useToast();
  
  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const productData = await productsApi.getProductBySlug(slug);
      setProduct(productData);
      
      // Cargar productos relacionados
      if (productData.category) {
        const relatedResponse = await productsApi.getProducts({
          categoryId: productData.category.id,
          limit: 8
        });
        setRelatedProducts(
          relatedResponse.data.filter((p: Product) => p.id !== productData.id).slice(0, 4)
        );
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    
    // Simular delay para efecto visual
    await new Promise(resolve => setTimeout(resolve, 800));
    
    addItem(product, quantity, selectedVariant);
    setIsAddingToCart(false);
    
    // Reset quantity after adding
    setQuantity(1);
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stockCount || 999)) {
      setQuantity(newQuantity);
    }
  };

  const handleShare = async () => {
  if (!product) return;
  
  const productUrl = `${window.location.origin}/products/${product.slug}`;
  
  // Si el navegador soporta Web Share API (móviles)
  if (navigator.share) {
    try {
      await navigator.share({
        title: product.name,
        text: `Mira este producto: ${product.name}`,
        url: productUrl
      });
      return; // Salir si compartió exitosamente
    } catch (err) {
      // Usuario canceló o error - intentar fallback
      console.log('Share cancelled or failed, trying fallback');
    }
  }
  
  // Fallback 1: Clipboard API (requiere HTTPS)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(productUrl);
      success('Link copiado al portapapeles');
      return;
    } catch (err) {
      console.log('Clipboard API failed, trying manual fallback');
    }
  }
  
  // Fallback 2: Método manual (funciona sin HTTPS)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = productUrl;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      success('Link copiado al portapapeles');
    } else {
      // Fallback 3: Mostrar alert con el link
      alert(`Copia este link:\n\n${productUrl}`);
    }
  } catch (err) {
    // Último recurso: mostrar el link
    alert(`Copia este link:\n\n${productUrl}`);
  }
};

  const handleImageChange = (direction: 'next' | 'prev') => {
    if (!product?.images) return;
    
    if (direction === 'next') {
      setSelectedImage((prev) => 
        prev >= product.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setSelectedImage((prev) => 
        prev <= 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darkbg via-darkbg-light to-darkbg">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-darkbg-light rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-darkbg-light rounded w-3/4"></div>
                <div className="h-6 bg-darkbg-light rounded w-1/2"></div>
                <div className="h-12 bg-darkbg-light rounded w-1/4"></div>
                <div className="h-24 bg-darkbg-light rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darkbg via-darkbg-light to-darkbg">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Producto no encontrado</h1>
          <Link href="/products">
            <Button className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg">
              Ver todos los productos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const discountPercentage = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  const isOutOfStock = product.stockCount <= 0;
  const isLowStock = product.stockCount <= 5 && product.stockCount > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkbg via-darkbg-light to-darkbg">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6 animate-fade-in">
          <Link href="/" className="hover:text-gold transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gold transition-colors">Productos</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link 
                href={`/categories/${product.category.slug}`}
                className="hover:text-gold transition-colors"
              >
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-white font-medium">{product.name}</span>
        </nav>

        {/* Producto principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Galería de imágenes */}
          <div className="space-y-4 animate-fade-in">
            <div className="relative group">
              <div className="aspect-square bg-darkbg rounded-2xl shadow-card-hover overflow-hidden border-2 border-gold/20">
                <Image
                  src={product.images?.[selectedImage]?.url || '/placeholder-product.jpg'}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onClick={() => setShowImageModal(true)}
                />
                
                {/* Navegación de imágenes */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => handleImageChange('prev')}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-darkbg-light/80 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-darkbg-light border border-gold/30"
                    >
                      <ChevronLeft className="h-5 w-5 text-white" />
                    </button>
                    <button
                      onClick={() => handleImageChange('next')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-darkbg-light/80 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-darkbg-light border border-gold/30"
                    >
                      <ChevronRight className="h-5 w-5 text-white" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 space-y-2">
                  {product.isFeatured && (
                    <Badge className="bg-gradient-to-r from-gold to-cyan text-darkbg shadow-glow-gold animate-pulse-gentle">
                      <Award className="h-3 w-3 mr-1" />
                      Destacado
                    </Badge>
                  )}
                  {discountPercentage && (
                    <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-glow animate-bounce-gentle">
                      <Zap className="h-3 w-3 mr-1" />
                      -{discountPercentage}% OFF
                    </Badge>
                  )}
                  {isLowStock && (
                    <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white animate-pulse">
                      ¡Últimos disponibles!
                    </Badge>
                  )}
                </div>

                {/* Botón favorito */}
                <button className="absolute top-4 right-4 bg-darkbg-light/80 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-darkbg-light hover:text-red-400 border border-gold/30">
                  <Heart className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Miniaturas */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === index
                        ? 'border-gold ring-2 ring-gold/50 shadow-glow-gold'
                        : 'border-gold/20 hover:border-gold/50'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-6 animate-slide-in-right">
            {/* Categoría */}
            {product.category && (
              <div className="animate-fade-in">
                <Link 
                  href={`/categories/${product.category.slug}`}
                  className="inline-flex items-center text-cyan hover:text-gold font-medium transition-colors"
                >
                  {product.category.name}
                </Link>
              </div>
            )}
 
            {/* Título */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
                {product.name}
              </h1>
              {product.brand && (
                <p className="text-lg text-gray-400">por {product.brand}</p>
              )}
            </div>

           {/* Rating y reseñas */}
<div className="flex items-center space-x-4">
  {(() => {
    console.log('🌟 Product data:', {
      rating: product.rating,
      ratingType: typeof product.rating,
      reviewCount: product.reviewCount,
      reviewCountType: typeof product.reviewCount
    });
    return null;
  })()}
  
  <div className="flex items-center">
    {[1, 2, 3, 4, 5].map((star) => {
      const rating = Number(product.rating) || 0;
      console.log(`Star ${star} - Rating: ${rating} - Active: ${star <= Math.round(rating)}`);
      return (
        <Star 
          key={star} 
          className={`h-5 w-5 ${
            star <= Math.round(rating)
              ? 'fill-gold text-gold'
              : 'text-gray-500'
          }`}
        />
      );
    })}
    {product.rating && (
      <span className="ml-2 text-sm text-gray-400">
        ({Number(product.rating).toFixed(1)})
      </span>
    )}
  </div>
  {(product.reviewCount || 0) > 0 && (
    <span className="text-sm text-gray-400">
      {product.reviewCount} {product.reviewCount === 1 ? 'reseña' : 'reseñas'}
    </span>
  )}
</div>

            {/* Precio */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold bg-gradient-to-r from-gold to-cyan bg-clip-text text-transparent">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>
              {discountPercentage && (
                <p className="text-gold font-medium">
                  ¡Ahorras {formatPrice(product.comparePrice! - product.price)}!
                </p>
              )}
            </div>

            {/* Descripción corta */}
            {product.shortDesc && (
              <p className="text-gray-400 leading-relaxed">
                {product.shortDesc}
              </p>
            )}

            {/* Estado de stock */}
            <div className="flex items-center space-x-2">
              {isOutOfStock ? (
                <Badge variant="secondary" className="bg-red-500/20 text-red-400 border border-red-500/30">
                  Agotado
                </Badge>
              ) : isLowStock ? (
                <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Solo quedan {product.stockCount} unidades
                </Badge>
              ) : (
                <div className="flex items-center text-green-400">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">En stock ({product.stockCount} disponibles)</span>
                </div>
              )}
            </div>

            {/* Selector de cantidad */}
            {!isOutOfStock && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Label className="text-sm font-medium text-gray-300">Cantidad:</Label>
                  <div className="flex items-center border border-gold/30 rounded-lg bg-darkbg shadow-sm">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-darkbg-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 font-medium min-w-[60px] text-center text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stockCount}
                      className="p-2 hover:bg-darkbg-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-400">
                    (Máximo: {product.stockCount})
                  </span>
                </div>

                {/* Botones de acción */}
                <div className="space-y-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className={`w-full py-4 text-lg font-medium transition-all duration-300 ${
                      isAddingToCart
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg shadow-glow-gold hover:shadow-glow-cyan transform hover:scale-105'
                    }`}
                  >
                    {isAddingToCart ? (
                      <div className="flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 mr-2 animate-spin" />
                        Agregando...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Agregar al Carrito
                      </div>
                    )}
                  </Button>

                  <div className="flex space-x-3">
  <WishlistButton
    productId={product.id}
    productName={product.name}
    variant="outline"
    size="lg"
    showText={true}
    className="flex-1 bg-darkbg border-gold/30 text-white hover:bg-gold/10 hover:border-gold/50"
  />
  <Button 
    variant="outline" 
    onClick={handleShare}
    className="flex-1 bg-darkbg border-gold/30 text-white hover:bg-gold/10 hover:border-gold/50"
  >
    <Share2 className="h-4 w-4 mr-2" />
    Compartir
  </Button>
</div>
                </div>
              </div>
            )}

            {/* Garantías y servicios */}
            <div className="bg-gradient-to-r from-gold/10 to-cyan/10 backdrop-blur-sm rounded-2xl p-6 space-y-4 border border-gold/20">
              <h3 className="font-semibold text-white mb-3">Beneficios incluidos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-300">
                  <Shield className="h-5 w-5 mr-3 text-gold" />
                  <span>Garantía de 30 días</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Truck className="h-5 w-5 mr-3 text-cyan" />
                  <span>Envío gratuito +$200</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <RotateCcw className="h-5 w-5 mr-3 text-gold" />
                  <span>Devoluciones fáciles</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Zap className="h-5 w-5 mr-3 text-cyan" />
                  <span>Soporte 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs con información adicional */}
        <Card className="mb-16 shadow-card-hover border-0 bg-darkbg-light/80 backdrop-blur-sm border border-gold/20 animate-fade-in">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-gold/20 to-cyan/20">
              <TabsTrigger value="description" className="data-[state=active]:bg-darkbg data-[state=active]:text-gold">
                Descripción
              </TabsTrigger>
              <TabsTrigger value="specifications" className="data-[state=active]:bg-darkbg data-[state=active]:text-gold">
                Especificaciones
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-darkbg data-[state=active]:text-gold">
  Reseñas ({Number(product.reviewCount) || 0})
</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="p-6">
              <div className="prose max-w-none">
                <p className="text-gray-400 leading-relaxed">
                  {product.description || "Descripción detallada del producto no disponible."}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="specifications" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gold/20">
                    <span className="font-medium text-gray-300">Marca</span>
                    <span className="text-white">{product.brand || 'No especificado'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gold/20">
                    <span className="font-medium text-gray-300">Modelo</span>
                    <span className="text-white">{product.model || 'No especificado'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gold/20">
                    <span className="font-medium text-gray-300">SKU</span>
                    <span className="text-white">{product.sku || 'No especificado'}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="p-6">
  <ProductReviews 
    productId={product.id} 
    productName={product.name}
    onReviewUpdate={loadProduct} 
  />
</TabsContent>
          </Tabs>
        </Card>

        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <section className="animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-8">Productos Relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <div 
                  key={relatedProduct.id}
                  className="animate-fade-in transform hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard product={relatedProduct} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}