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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-12 bg-gray-200 rounded w-1/4"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
          <Link href="/products">
            <Button className="bg-primary-600 hover:bg-primary-700">
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6 animate-fade-in">
          <Link href="/" className="hover:text-primary-600 transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary-600 transition-colors">Productos</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link 
                href={`/categories/${product.category.slug}`}
                className="hover:text-primary-600 transition-colors"
              >
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Producto principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Galería de imágenes */}
          <div className="space-y-4 animate-fade-in">
            <div className="relative group">
              <div className="aspect-square bg-white rounded-2xl shadow-card-hover overflow-hidden border-2 border-gray-100">
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleImageChange('next')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-700" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 space-y-2">
                  {product.isFeatured && (
                    <Badge className="bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow animate-pulse-gentle">
                      <Award className="h-3 w-3 mr-1" />
                      Destacado
                    </Badge>
                  )}
                  {discountPercentage && (
                    <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-glow-yellow animate-bounce-gentle">
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
                <button className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:text-red-500">
                  <Heart className="h-5 w-5" />
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
                        ? 'border-primary-500 ring-2 ring-primary-200 shadow-glow'
                        : 'border-gray-200 hover:border-primary-300'
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
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  {product.category.name}
                </Link>
              </div>
            )}

            {/* Título */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
                {product.name}
              </h1>
              {product.brand && (
                <p className="text-lg text-gray-600">por {product.brand}</p>
              )}
            </div>

            {/* Rating y reseñas */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 text-sm text-gray-600">(4.8)</span>
              </div>
              <span className="text-sm text-gray-500">125 reseñas</span>
            </div>

            {/* Precio */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>
              {discountPercentage && (
                <p className="text-primary-600 font-medium">
                  ¡Ahorras {formatPrice(product.comparePrice! - product.price)}!
                </p>
              )}
            </div>

            {/* Descripción corta */}
            {product.shortDesc && (
              <p className="text-gray-600 leading-relaxed">
                {product.shortDesc}
              </p>
            )}

            {/* Estado de stock */}
            <div className="flex items-center space-x-2">
              {isOutOfStock ? (
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  Agotado
                </Badge>
              ) : isLowStock ? (
                <Badge className="bg-orange-100 text-orange-800">
                  Solo quedan {product.stockCount} unidades
                </Badge>
              ) : (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">En stock ({product.stockCount} disponibles)</span>
                </div>
              )}
            </div>

            {/* Selector de cantidad */}
            {!isOutOfStock && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Label className="text-sm font-medium text-gray-700">Cantidad:</Label>
                  <div className="flex items-center border border-gray-300 rounded-lg bg-white shadow-sm">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 font-medium min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stockCount}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
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
                        : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-glow hover:shadow-glow-yellow transform hover:scale-105'
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
                    <Button variant="outline" className="flex-1 hover:bg-primary-50 border-primary-300 text-primary-700">
                      <Heart className="h-4 w-4 mr-2" />
                      Favoritos
                    </Button>
                    <Button variant="outline" className="flex-1 hover:bg-primary-50 border-primary-300 text-primary-700">
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartir
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Garantías y servicios */}
            <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-2xl p-6 space-y-4 border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-3">Beneficios incluidos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-green-700">
                  <Shield className="h-5 w-5 mr-3 text-green-600" />
                  <span>Garantía de 30 días</span>
                </div>
                <div className="flex items-center text-green-700">
                  <Truck className="h-5 w-5 mr-3 text-green-600" />
                  <span>Envío gratuito +$100</span>
                </div>
                <div className="flex items-center text-green-700">
                  <RotateCcw className="h-5 w-5 mr-3 text-green-600" />
                  <span>Devoluciones fáciles</span>
                </div>
                <div className="flex items-center text-green-700">
                  <Zap className="h-5 w-5 mr-3 text-green-600" />
                  <span>Soporte 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs con información adicional */}
        <Card className="mb-16 shadow-card-hover border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-primary-50 to-yellow-50">
              <TabsTrigger value="description" className="data-[state=active]:bg-white data-[state=active]:text-primary-700">
                Descripción
              </TabsTrigger>
              <TabsTrigger value="specifications" className="data-[state=active]:bg-white data-[state=active]:text-primary-700">
                Especificaciones
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-white data-[state=active]:text-primary-700">
                Reseñas (125)
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="p-6">
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed">
                  {product.description || "Descripción detallada del producto no disponible."}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="specifications" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-700">Marca</span>
                    <span className="text-gray-900">{product.brand || 'No especificado'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-700">Modelo</span>
                    <span className="text-gray-900">{product.model || 'No especificado'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-700">SKU</span>
                    <span className="text-gray-900">{product.sku || 'No especificado'}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-500">Sistema de reseñas próximamente</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <section className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Productos Relacionados</h2>
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