// src/app/page.tsx - BeztShop Home Page Dark Tech Theme
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Star, 
  Truck, 
  Shield, 
  Headphones, 
  RefreshCw,
  Zap,
  TrendingUp,
  Heart,
  Award,
  ShoppingBag,
  Sparkles,
  Users,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Gamepad2,
  Smartphone,
  Eye,
  Percent
} from 'lucide-react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { productsApi } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import api from '@/lib/api';
import type { Product, Category } from '@/types';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { success, error, promise } = useToast();

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productsApi.getFeaturedProducts(),
        productsApi.getCategories()
      ]);
      
      setFeaturedProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (featuredProducts.length > 0) {      
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.min(featuredProducts.length, 5));
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [featuredProducts.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.min(featuredProducts.length, 5));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.min(featuredProducts.length, 5)) % Math.min(featuredProducts.length, 5));
  };

  const getProductImage = (product: Product): string => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const img = product.images[0];
      if (typeof img === 'string') return img;
      if (img && typeof img.url === 'string') return img.url;
    }
    return '/placeholder-product.jpg';
  };

  // Configuración de categorías con eslogans e imágenes
  const categoryConfig: Record<string, {
    slogan: string;
    images: string[];
    gradient: string;
  }> = {
    'ropa-de-hombre': {
      slogan: 'Donde la comodidad se encuentra con el estilo',
      images: [
        'https://res.cloudinary.com/du4amawxr/image/upload/v1760566997/download_1_cib9ff.jpg',
        'https://res.cloudinary.com/du4amawxr/image/upload/v1759952500/servipro/products/ns8avagc9upkeyllzyvx.jpg',
        'https://res.cloudinary.com/du4amawxr/image/upload/v1760566997/download_dnkse5.jpg'
      ],
      gradient: 'from-purple-500/20 to-pink-500/20'
    },
    'smartphone': {
      slogan: 'Lo más vendido en tecnología móvil',
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop',
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&h=200&fit=crop',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=300&h=200&fit=crop'
      ],
      gradient: 'from-blue-500/20 to-purple-500/20'
    },
    'laptops-y-tablets': {
      slogan: 'Potencia para crear sin límites',
      images: [
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=200&fit=crop',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=200&fit=crop',
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&h=200&fit=crop'
      ],
      gradient: 'from-cyan-500/20 to-blue-500/20'
    },    
    'accesorios': {
      slogan: 'Complementa tu estilo tech',
      images: [
        'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300&h=200&fit=crop',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=200&fit=crop'
      ],
      gradient: 'from-green-500/20 to-teal-500/20'
    },
    'perfumeria': {
      slogan: 'Vive con estilo, deja tu fragancia',
      images: [
        'https://res.cloudinary.com/du4amawxr/image/upload/v1760567473/download_2_oot9u5.jpg',
        'https://res.cloudinary.com/du4amawxr/image/upload/v1760567473/parfum_fragrance__fn1h1d.jpg',
        'https://res.cloudinary.com/du4amawxr/image/upload/v1760567473/%D0%94%D1%83%D1%85%D0%B8_%D0%B2_%D0%BE%D0%B1%D0%BB%D0%B0%D0%BA%D0%B0%D1%85_z7xsci.jpg'
      ],
      gradient: 'from-gold/20 to-cyan/20'
    },
    'cargadores': {
      slogan: 'Energía siempre disponible',
      images: [
        'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=300&h=200&fit=crop',
        'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=300&h=200&fit=crop',
        'https://images.unsplash.com/photo-1609017259558-4e4fea6e6f74?w=300&h=200&fit=crop'
      ],
      gradient: 'from-yellow-500/20 to-orange-500/20'
    }
  };

  const getCategoryConfig = (slug: string) => {
    return categoryConfig[slug] || {
      slogan: 'Descubre las mejores selecciones de productos',
      images: [
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=200&fit=crop'    
      ],
      gradient: 'from-gold/20 to-cyan/20'
    };
  };

  return (
    <div className="min-h-screen bg-darkbg overflow-hidden">
      <Header />
      
      <main>
        {/* Hero Slider Dark Tech */}
        {!isLoading && featuredProducts.length > 0 && (
          <section className="relative h-[500px] md:h-[500px] overflow-hidden bg-gradient-to-br from-darkbg via-darkbg-light to-darkbg">
            {/* Animated background effects */}
            <div className="absolute inset-0">
              <div className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full animate-pulse blur-3xl bg-gradient-to-br from-gold/20 to-transparent" />
              <div className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full animate-pulse blur-3xl bg-gradient-to-tl from-cyan/20 to-transparent" style={{ animationDelay: '1s' }} />
                            
              {/* Tech grid pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 border-2 border-gold/30 rounded-lg animate-spin-slow"></div>
                <div className="absolute bottom-20 right-20 w-24 h-24 border-2 border-cyan/30 rounded-full animate-pulse"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-gold/20 rotate-45"></div>
              </div>              
            </div>

            <div className="relative h-full">
              {featuredProducts.slice(0, 5).map((product, index) => (
                <div
                  key={product.id}
                  className={`absolute inset-0 transition-all duration-700 ${
                    index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                  }`}
                >
                  {/* Imagen de fondo para móvil - imagen real del producto */}
<div 
  className="md:hidden absolute inset-0 bg-cover bg-center opacity-20 z-5"
  style={{ backgroundImage: `url(${getProductImage(product)})` }}
/>
{/* Imagen de fondo para desktop - solo placeholder */}
<div 
  className="hidden md:block absolute inset-0 bg-cover bg-center opacity-20 z-5"
  style={{ backgroundImage: `url('/placeholder-product.jpg')` }}
/>
                  <div className="h-full flex items-center relative z-10">
                    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center md:justify-between text-center md:text-left h-full">
                      
                      {/* Content */}
                      <div className="text-white max-w-lg w-full px-4 md:px-0">
                        <div className="inline-block px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg bg-gradient-to-r from-gold to-cyan text-darkbg">
                          ⭐ PRODUCTO DESTACADO
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 md:mb-6 leading-tight text-white animate-neon-glow">
                          {product.name}
                        </h1>
                        <p className="text-sm sm:text-base md:text-xl mb-4 md:mb-4 text-gray-300 leading-relaxed line-clamp-3 md:line-clamp-none">
                          {product.shortDesc && product.shortDesc.trim() 
                            ? product.shortDesc
                            : product.description && product.description.trim()
                              ? product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '')
                              : 'Descubra este increíble producto'
                          }
                        </p>
                        <div className="flex items-center justify-center md:justify-start space-x-2 md:space-x-4 mb-4 md:mb-8">
                          <div className="text-4xl font-bold text-gold animate-pulse">
                            ${product.price}
                          </div>
                          {product.comparePrice && (
                            <div className="text-xl text-gray-500 line-through">
                              ${product.comparePrice}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 md:gap-4 w-full max-w-sm md:max-w-none mx-auto md:mx-0">
                          <Button 
                            asChild 
                            size="sm"
                            className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-bold py-3 px-6 md:py-4 md:px-8 rounded-xl text-sm md:text-lg shadow-glow-gold transform hover:scale-105 transition-all duration-300 border-0"
                          >
                            <Link href={`/products/${product.slug}`}>
                              <ShoppingBag className="mr-3 h-5 w-5" />
                              Ver producto
                              <ArrowRight className="ml-3 h-5 w-5" />
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="lg" 
                            className="border-2 border-cyan/40 bg-darkbg-light/50 backdrop-blur-md text-white hover:bg-cyan/20 hover:border-cyan font-bold py-4 px-8 rounded-xl transform hover:scale-105 transition-all duration-300 text-lg"
                          >
                            <Heart className="mr-3 h-4 w-4"/>
                            Añadir a favoritos
                          </Button>
                        </div>
                      </div>
                      
                      {/* Product Image */}
                      <div className="hidden md:block">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-3xl blur-xl transform rotate-6 bg-gradient-to-r from-gold/30 to-cyan/30"></div>
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="relative w-80 h-80 object-cover rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500 border-4 border-gold/30"
                          />
                          {product.isFeatured && (
                            <div className="absolute -top-4 -right-4 px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-bounce bg-gradient-to-r from-gold to-cyan text-darkbg">
                              ¡Destacado!
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}     
              
              {/* Indicators */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
                {featuredProducts.slice(0, 5).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`transition-all duration-300 border-2 border-gold/30 backdrop-blur-sm ${
                      index === currentSlide 
                        ? 'w-12 h-3 rounded-full bg-gradient-to-r from-gold to-cyan' 
                        : 'w-3 h-3 bg-white/50 hover:bg-white/70 rounded-full'
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Barra de Beneficios Rápidos */}
        <section className="bg-gradient-to-r from-gold/10 via-cyan/10 to-gold/10 backdrop-blur-sm py-6 border-y border-gold/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { icon: Truck, text: 'Envío Gratis +$299', color: 'text-gold' },
                { icon: Shield, text: 'Compra Segura', color: 'text-cyan' },
                { icon: RefreshCw, text: 'Devoluciones 30 días', color: 'text-gold' },
                { icon: Headphones, text: 'Soporte 24/7', color: 'text-cyan' }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <item.icon className={`h-8 w-8 ${item.color} mb-2`} />
                  <span className="text-white font-medium text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section Dark Tech */}
        <section className="py-20 bg-darkbg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/5 to-transparent" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between mb-16">
              <div className="text-left mb-8 lg:mb-0">
                <Badge className="bg-gold/20 backdrop-blur-sm text-gold border border-gold/30 text-sm font-medium px-4 py-2 rounded-full mb-4 inline-flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Más populares
                </Badge>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  Productos
                  <span className="text-gold"> Destacados</span>
                </h2>
                <p className="text-lg text-gray-400 max-w-2xl">
                  Los favoritos de nuestros clientes, seleccionados especialmente para ti
                </p>
              </div>
              
              <Button 
                asChild 
                size="lg"
                className="border-2 border-gold/30 bg-darkbg-light text-gold hover:bg-gold hover:text-darkbg font-bold py-4 px-8 rounded-xl transform hover:scale-105 transition-all duration-300"
              >
                <Link href="/products?featured=true">
                  Ver Todos
                  <ArrowRight className="ml-3 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gradient-to-r from-darkbg-light via-darkbg-lighter to-darkbg-light aspect-square rounded-2xl mb-4 animate-shimmer"></div>
                    <div className="h-6 bg-gradient-to-r from-darkbg-light via-darkbg-lighter to-darkbg-light rounded-lg mb-2 animate-shimmer"></div>
                    <div className="h-4 bg-gradient-to-r from-darkbg-light via-darkbg-lighter to-darkbg-light rounded-lg w-2/3 animate-shimmer"></div>
                  </div>
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.slice(0, 8).map((product, index) => (
                  <div 
                    key={product.id} 
                    className="animate-fade-in" 
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-darkbg-light w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="h-16 w-16 text-gray-600" />
                </div>
                <p className="text-xl text-gray-500">No hay productos destacados disponibles</p>
              </div>
            )}
          </div>
        </section>

        {/* Categorías Mejoradas - Estilo E-commerce */}
        <section className="py-20 bg-gradient-to-b from-darkbg via-darkbg-light to-darkbg backdrop-blur-sm relative">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan/5 via-transparent to-gold/5"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <Badge className="bg-cyan/20 backdrop-blur-sm text-cyan border border-cyan/30 text-sm font-medium px-4 py-2 rounded-full mb-4">
                Explora nuestras categorías
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Todo lo que necesitas
                <span className="text-cyan"> En un solo lugar</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Descubra nuestra amplia selección de productos tecnológicos premium
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.slice(0, 6).map((category, index) => {
                const config = getCategoryConfig(category.slug);
                
                return (
                  <Link 
                    key={category.id} 
                    href={`/categories/${category.slug}`}
                    className="group"
                  >
                    <Card className="overflow-hidden bg-darkbg-light border-gold/20 hover:border-gold/50 transition-all duration-500 transform hover:scale-105 hover:shadow-glow-gold">
                      <CardContent className="p-0">
                        {/* Header de la categoría */}
                        <div className={`bg-gradient-to-br ${config.gradient} p-6 relative overflow-hidden`}>
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                          </div>
                          
                          <div className="relative z-10">
                            <h3 className="text-2xl font-black text-white mb-2 group-hover:text-gold transition-colors">
                              {category.name}
                            </h3>
                            <p className="text-gray-300 text-sm mb-4">
                              {config.slogan}
                            </p>
                            
                            <div className="flex items-center text-gold group-hover:text-cyan transition-colors">
                              <span className="font-medium mr-2">Ver productos</span>
                              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Grid de imágenes de productos */}
                        <div className="grid grid-cols-3 gap-1 p-1 bg-darkbg">
                          {config.images.map((img, i) => (
                            <div key={i} className="aspect-square overflow-hidden rounded-lg relative group/img">
                              <img
                                src={img}
                                alt={`${category.name} ${i + 1}`}
                                className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity"></div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Footer con CTA */}
                        <div className="p-4 bg-darkbg-light border-t border-gold/10">
                          <Button 
                            className="w-full bg-gradient-to-r from-gold/20 to-cyan/20 hover:from-gold hover:to-cyan text-white hover:text-darkbg border border-gold/30 transition-all"
                            size="sm"
                          >
                            Explorar {category.name}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
            
            {/* CTA para ver todas las categorías */}
            {categories.length > 6 && (
              <div className="text-center mt-12">
                <Button 
                  asChild 
                  size="lg"
                  className="bg-gradient-to-r from-cyan to-gold hover:from-gold hover:to-cyan backdrop-blur-sm text-darkbg font-bold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 border border-gold/30"
                >
                  <Link href="/categories">
                    Ver Todas las Categorías ({categories.length})
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>  

        {/* Banner Promocional */}
        <section className="relative bg-gradient-to-br from-darkbg via-darkbg-light to-darkbg text-white py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNGRkQ3MDAiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <Sparkles className="h-12 w-12 text-gold mx-auto mb-6 animate-pulse" />
              <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
                ¡Ofertas Increíbles!
              </h2>
              <p className="text-2xl text-gray-300 mb-8">
                Hasta <span className="text-gold font-bold">50% de descuento</span> en productos seleccionados
              </p>
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-bold px-10 py-6 text-xl shadow-glow-gold transform hover:scale-105 transition-all"
              >
                <Link href="/products">
                  <Zap className="mr-2 h-6 w-6" />
                  Comprar Ahora
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 mt-16 animate-fade-in" style={{ animationDelay: '1s' }}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gold mb-2">1000+</div>
                  <div className="text-sm text-gray-400">Productos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-cyan mb-2">5000+</div>
                  <div className="text-sm text-gray-400">Clientes satisfechos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gold mb-2">99%</div>
                  <div className="text-sm text-gray-400">Satisfacción</div>
                </div>
              </div>           
          </div>
        </section>              

        {/* Testimonials Dark Tech */}
        <section className="py-20 bg-gradient-to-br from-darkbg via-darkbg-light to-darkbg text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-gold/10 to-cyan/10"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <Badge className="bg-cyan/20 text-cyan border border-cyan/30 mb-4 inline-flex items-center">
                <Users className="mr-2 h-4 w-4" />
                +5,000 Clientes Felices
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Lo que dicen nuestros
                <span className="text-gold"> clientes</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Miles de clientes satisfechos confían en nuestra excelencia
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "María González", rating: 5, comment: "BeztShop tiene la mejor selección de productos tecnológicos premium. ¡Envíos rápidos y excelente servicio al cliente!" },
                { name: "Carlos Rodríguez", rating: 5, comment: "Calidad increíble y precios inmejorables. Ahora es mi tienda de referencia para todas mis necesidades tecnológicas." },
                { name: "Ana Martínez", rating: 5, comment: "Productos y atención al cliente de primera. ¡El sitio web con tema oscuro es precioso! Lo recomiendo muchísimo." }
              ].map((testimonial, i) => (
                <Card key={i} className="bg-darkbg-light border-gold/20 hover:border-gold/50 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star key={j} className="h-5 w-5 fill-gold text-gold" />
                      ))}
                    </div>
                    <p className="text-gray-300 mb-4 leading-relaxed">"{testimonial.comment}"</p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-gold to-cyan rounded-full flex items-center justify-center mr-3">
                        <span className="text-darkbg font-bold">{testimonial.name.charAt(0)}</span>
                      </div>
                      <p className="font-bold text-white">{testimonial.name}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

            <div className="text-center mt-16">
              <div className="inline-flex items-center bg-darkbg-light/50 backdrop-blur-sm border border-gold/20 rounded-full px-8 py-4">
                <ThumbsUp className="h-6 w-6 mr-3 text-gold" />
                <span className="text-lg font-medium mr-3">Más de</span>
                <span className="text-3xl font-bold text-gold mr-3">10,000</span>
                <span className="text-lg">reseñas positivas</span>
              </div>
            </div>
        </section>

        {/* Newsletter Dark Tech */}
        <section className="py-20 bg-gradient-to-b from-gold/20 via-cyan/10 to-darkbg text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-gold/20 to-transparent rounded-full animate-pulse-gentle blur-3xl" />
            <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-cyan/15 to-transparent rounded-full animate-pulse-gentle blur-3xl" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center bg-darkbg-light/50 backdrop-blur-sm border border-gold/20 rounded-full px-6 py-2 mb-8">
                <Zap className="h-5 w-5 mr-2 text-gold" />
                <span className="text-sm font-medium">Ofertas exclusivas</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black mb-6">
                ¡No te lo pierdas!
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
                Suscríbete y recibe <span className="text-gold font-bold">15% off</span> tu primera compra
              </p>
              <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
                Ofertas exclusivas, novedades y contenido premium entregados directamente en tu bandeja de entrada.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-8">
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="Introduce tu correo electrónico"
                  className="flex-1 px-6 py-4 text-lg rounded-xl text-white bg-darkbg-light border-2 border-gold/20 focus:ring-4 focus:ring-gold/50 shadow-lg placeholder-gray-500"
                />
                <Button 
                  size="lg"
                  onClick={async () => {
                    const emailInput = document.getElementById('newsletter-email') as HTMLInputElement;
                    const email = emailInput.value;
                    
                    if (!email || !email.includes('@')) {
                      error('Por favor, introduzca un correo electrónico válido');
                      return;
                    }
                    
                    try {
                      await promise(
                        api.post('/newsletter/subscribe', { email }),
                        {
                          loading: 'Suscribirse...',
                          success: '¡Suscripción exitosa! Revisa tu correo electrónico para encontrar tu cupón de bienvenida.',
                          error: 'Suscripción fallida'
                        }
                      );
                      emailInput.value = '';
                    } catch (err) {
                      console.error('Error:', err);
                    }
                  }}
                  className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-bold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 text-lg"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  ¡Suscríbete ahora!
                </Button>
              </div>
              
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-gold" />
                  Sin spam
                </div>
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2 text-cyan" />
                  Cancelar en cualquier momento
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2 text-gold" />
                  Contenido exclusivo
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Dark Tech */}
      <footer className="bg-darkbg border-t border-gold/10 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="relative">
                <div className="absolute inset-0  rounded-full blur-lg opacity-50"></div>
                <Image
                  src="/logo.png"
                  alt="BeztShop Logo"
                  width={80}
                  height={80}
                  className="relative h-20 w-auto transition-transform duration-300 hover:scale-110 drop-shadow-lg"
                  priority
                />
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-gold to-cyan bg-clip-text text-transparent">Tech Store</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Su destino premium para tecnología y electrónica de vanguardia. 
              Calidad garantizada y servicio excepcional desde CDMX, México.
            </p>
            <p className="text-gray-500">
              © 2024 BeztShop. Todos los derechos reservados.
            </p>            
          </div>
        </div>
      </footer>
    </div>
  );
}