// src/app/page.tsx - Página principal ultramoderna con slider de productos reales
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Gift,
  Heart,
  Clock,
  Award,
  ShoppingBag,
  Sparkles,
  Target,
  Users,
  ThumbsUp,
  ChevronLeft,
  ChevronRight
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

  // Auto-rotate slider
  useEffect(() => {
    if (featuredProducts.length > 0) {      
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.min(featuredProducts.length, 3));
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [featuredProducts.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.min(featuredProducts.length, 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.min(featuredProducts.length, 3)) % Math.min(featuredProducts.length, 3));
  };

  // Función para obtener imagen principal del producto
  const getProductImage = (product: Product): string => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const img = product.images[0];
      if (typeof img === 'string') {
        return img;
      }
      if (img && typeof img.url === 'string') {
        return img.url;
      }
    }
    return '/placeholder-product.jpg'; // Imagen por defecto
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      <Header />
      
      <main>
        {/* NUEVO: Slider de Productos Destacados REALES - Versión Moderna */}
{!isLoading && featuredProducts.length > 0 && (
  <section className="relative h-[500px] md:h-[500px] overflow-hidden">
    {/* Fondo dinámico que alterna colores */}
    <div 
      className={`absolute inset-0 transition-all duration-1000 ${
        currentSlide % 2 === 0 
          ? 'bg-gradient-to-br from-green-500 via-green-600 to-green-700' 
          : 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700'
      }`}
    >
      {/* Efectos de fondo modernos */}
      <div className="absolute inset-0">
        <div className={`absolute -top-1/2 -left-1/2 w-full h-full rounded-full animate-pulse blur-3xl transition-all duration-1000 ${
          currentSlide % 2 === 0 
            ? 'bg-gradient-to-br from-yellow-400/30 to-transparent' 
            : 'bg-gradient-to-br from-green-400/30 to-transparent'
        }`} />
        <div className={`absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full animate-pulse blur-3xl transition-all duration-1000 ${
          currentSlide % 2 === 0 
            ? 'bg-gradient-to-tl from-yellow-300/20 to-transparent' 
            : 'bg-gradient-to-tl from-green-300/20 to-transparent'
        }`} style={{ animationDelay: '1s' }} />
        
        {/* Patrón geométrico moderno */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/20 rounded-full animate-spin-slow"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border-2 border-white/30 rounded-lg rotate-45 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-white/25 rounded-full"></div>
        </div>        
      </div>
    </div>

    <div className="relative h-full">
      {featuredProducts.slice(0, 3).map((product, index) => (
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
              {/* Contenido */}
              <div className="text-white max-w-lg w-full px-4 md:px-0">
                <div className={`inline-block px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg transition-all duration-500 ${
                  currentSlide % 2 === 0 
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900' 
                    : 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                }`}>
                  ⭐ PRODUCTO DESTACADO
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-6xl font-black mb-3 md:mb-4 leading-tight drop-shadow-lg">
                  {product.name}
                </h1>
                <p className="text-sm sm:text-base md:text-2xl mb-4 md:mb-6 text-white/95 leading-relaxed drop-shadow-md line-clamp-3 md:line-clamp-none">
  {product.shortDesc && product.shortDesc.trim() 
    ? product.shortDesc
    : product.description && product.description.trim()
      ? product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '')
      : 'Descubre este increíble producto'
  }
</p>
                <div className="flex items-center justify-center md:justify-start space-x-2 md:space-x-4 mb-4 md:mb-8">
                  <div className={`text-4xl font-bold drop-shadow-lg transition-colors duration-500 ${
                    currentSlide % 2 === 0 ? 'text-yellow-200' : 'text-green-200'
                  }`}>
                    ${product.price}
                  </div>
                  {product.comparePrice && (
                    <div className="text-xl text-white/70 line-through">
                      ${product.comparePrice}
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-4 w-full max-w-sm md:max-w-none mx-auto md:mx-0">
                  <Button 
                    asChild 
                    size="sm"
                      className={`font-bold py-3 px-6 md:py-4 md:px-8 rounded-xl text-sm md:text-lg shadow-2xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 border-0 text-lg ${
                      currentSlide % 2 === 0 
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 hover:shadow-yellow-400/25' 
                        : 'bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white hover:shadow-green-400/25'
                    }`}
                  >
                    <Link href={`/products/${product.slug}`}>
                      <ShoppingBag className="mr-3 h-5 w-5" />
                      Ver Producto
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-2 border-white/40 bg-white/15 backdrop-blur-md text-white hover:bg-white/25 hover:border-white/60 font-bold py-4 px-8 rounded-xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 text-lg"
                  >
                    <Heart className="mr-3 h-4 w-4"/>
                    Agregar a Favoritos
                  </Button>
                </div>
              </div>
              
              {/* Imagen del producto */}
              <div className="hidden md:block">
                <div className="relative">
                  <div className={`absolute inset-0 rounded-3xl blur-xl transform rotate-6 transition-all duration-500 ${
                    currentSlide % 2 === 0 
                      ? 'bg-gradient-to-r from-yellow-400/30 to-yellow-500/30' 
                      : 'bg-gradient-to-r from-green-400/30 to-green-500/30'
                  }`}></div>
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="relative w-80 h-80 object-cover rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500 border-4 border-white/30"
                  />
                  {product.isFeatured && (
                    <div className={`absolute -top-4 -right-4 px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-bounce transition-colors duration-500 ${
                      currentSlide % 2 === 0 
                        ? 'bg-yellow-400 text-gray-900' 
                        : 'bg-green-400 text-white'
                    }`}>
                      ¡Destacado!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}     
      
      
      {/* Indicadores modernos */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        {featuredProducts.slice(0, 3).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 border-2 border-white/30 backdrop-blur-sm ${
              index === currentSlide 
                ? `w-12 h-3 rounded-full ${
                    currentSlide % 2 === 0 ? 'bg-yellow-400' : 'bg-green-400'
                  }` 
                : 'w-3 h-3 bg-white/50 hover:bg-white/70 rounded-full'
            }`}
          />
        ))}
      </div>
      
      
    </div>
  </section>
)}

        {/* Featured Products Section Revolucionario - ORIGINAL MANTENIDO */}
        <section className="py-20 bg-white relative overflow-hidden">
          {/* Fondo decorativo */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-50/50 to-green-50/30" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between mb-16">
              <div className="text-left mb-8 lg:mb-0">
                <Badge className="bg-yellow-100 text-yellow-700 text-sm font-medium px-4 py-2 rounded-full mb-4 inline-flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Lo Más Popular
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Productos
                  <span className="text-yellow-600"> Destacados</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl">
                  Los favoritos de nuestros clientes, seleccionados especialmente para ti
                </p>
              </div>
              
              <Button 
                asChild 
                size="lg"
                variant="outline" 
                className="border-2 border-yellow-200 text-yellow-700 hover:bg-yellow-600 hover:text-white hover:border-yellow-600 font-bold py-4 px-8 rounded-xl transform hover:scale-105 transition-all duration-300"
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
                    <div className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 aspect-square rounded-2xl mb-4 animate-shimmer"></div>
                    <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg mb-2 animate-shimmer"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-2/3 animate-shimmer"></div>
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
                <div className="bg-gray-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="h-16 w-16 text-gray-400" />
                </div>
                <p className="text-xl text-gray-500">No hay productos destacados disponibles</p>
              </div>
            )}
          </div>
        </section>

        {/* Categories Section Con Efecto Glassmorphism Intensificado */}
<section className="py-20 bg-gradient-to-b from-yellow-200/100 via-yellow-350 to-yellow-400 backdrop-blur-sm relative">
  {/* Fondo adicional para intensificar el amarillo */}
  <div className="absolute inset-0 bg-yellow-300/20"></div>
  
  <div className="container mx-auto px-4 relative z-10">
    <div className="text-center mb-16">
      <Badge className="bg-yellow-100/90 backdrop-blur-sm text-yellow-800 text-sm font-medium px-4 py-2 rounded-full mb-4 border border-yellow-300/60 shadow-lg">
        Explora Nuestras Categorías
      </Badge>
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
        Todo lo que necesitas
        <span className="text-yellow-600"> en un solo lugar</span>
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Descubre nuestra amplia selección de productos organizados para tu comodidad
      </p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {categories.slice(0, 10).map((category, index) => {
        // Mapeo de imágenes por categoría
        const categoryImages: Record<string, string> = {
          'smartphones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
          'laptops': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
          'tablets': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop',
          'accesorios': 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=300&fit=crop',
          'cargadores': 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop'
        };
        
        const backgroundImage = categoryImages[category.slug] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop';
        
        return (
          <Link key={category.id} href={`/categories/${category.slug}`}>
            <Card className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 bg-white/20 backdrop-blur-md hover:backdrop-blur-lg transform hover:scale-105 hover:-translate-y-2 overflow-hidden relative border border-white/30">
              {/* Imagen de fondo en hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-all duration-500 bg-cover bg-center"
                style={{ backgroundImage: `url(${backgroundImage})` }}
              />
              
              {/* Overlay de vidrio */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 group-hover:from-yellow-200/20 group-hover:to-green-200/10 transition-all duration-500" />
              
              <CardContent className="p-8 text-center relative z-10">
                {/* Efecto de fondo animado */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/0 to-green-500/0 group-hover:from-yellow-500/10 group-hover:via-yellow-500/15 group-hover:to-green-500/10 transition-all duration-500 backdrop-blur-sm" />
                
                <div className="relative z-20">
                  <div className="bg-gradient-to-r from-green-500/80 to-green-600/80 group-hover:from-yellow-500/90 group-hover:to-yellow-600/90 backdrop-blur-sm w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg border border-white/20">
                    <span className="text-3xl font-black text-white drop-shadow-lg">
                      {category.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-yellow-700 transition-colors text-lg drop-shadow-sm">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 drop-shadow-sm">
                    Explorar productos
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>

    <div className="text-center mt-12">
      <Button 
        asChild 
        size="lg"
        className="bg-gradient-to-r from-green-500/90 to-green-600/90 hover:from-yellow-600 hover:to-yellow-700 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 border border-yellow-300/30"
      >
        <Link href="/categories">
          Ver Todas las Categorías
          <ArrowRight className="ml-3 h-5 w-5" />
        </Link>
      </Button>
    </div>
  </div>
</section>
        

        {/* Features Section Mejorado - ORIGINAL MANTENIDO */}
        <section className="py-16 bg-white relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Por qué elegir ServiPro Garcia?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Experiencia premium que supera tus expectativas</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Truck,
                  title: "Envío Express",
                  desc: "Entrega rápida y segura",
                  color: "from-yellow-500 to-yellow-600",
                  bgColor: "bg-yellow-50",
                  delay: "0s"
                },
                {
                  icon: Shield,
                  title: "100% Seguro",
                  desc: "Compra protegida",
                  color: "from-green-500 to-green-600", 
                  bgColor: "bg-green-50",
                  delay: "0.1s"
                },
                {
                  icon: RefreshCw,
                  title: "Garantía Total",
                  desc: "30 días sin preguntas",
                  color: "from-yellow-500 to-yellow-600",
                  bgColor: "bg-yellow-50", 
                  delay: "0.2s"
                },
                {
                  icon: Headphones,
                  title: "Soporte 24/7",
                  desc: "Siempre aquí para ti",
                  color: "from-green-500 to-green-600",
                  bgColor: "bg-green-50",
                  delay: "0.3s"
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className={`group ${feature.bgColor} rounded-2xl p-8 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-500 animate-fade-in border border-gray-100`}
                  style={{ animationDelay: feature.delay }}
                >
                  <div className={`bg-gradient-to-r ${feature.color} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>       

        

        {/* Hero Section Ultra Moderno - ORIGINAL MANTENIDO */}
        <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 md:py-32 overflow-hidden">
          {/* Efectos de fondo animados */}
          <div className="absolute inset-0">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full animate-pulse-gentle blur-3xl" />
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-yellow-300/15 to-transparent rounded-full animate-pulse-gentle blur-3xl" style={{ animationDelay: '1s' }} />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-6xl mx-auto">
              {/* Badge de bienvenida animado */}
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-8 animate-fade-in">
                <Sparkles className="h-4 w-4 mr-2 text-yellow-300" />
                <span className="text-sm font-medium">Bienvenido a la experiencia de compra del futuro</span>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <span className="bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
                  ServiPro
                </span>
                <br />
                <span className="text-yellow-300">Garcia</span>
              </h1>
              
              <p className="text-xl md:text-2xl lg:text-3xl mb-4 text-primary-100 max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.4s' }}>
                Tu tienda de confianza para productos especializados
              </p>
              
              <p className="text-lg md:text-xl mb-12 text-primary-200 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
                Tecnología de vanguardia, calidad premium y servicio excepcional
              </p>

              {/* CTAs ultra modernos */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold py-4 px-8 rounded-xl shadow-glow-yellow hover:shadow-glow-yellow transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 border-0 text-lg"
                >
                  <Link href="/products">
                    <ShoppingBag className="mr-3 h-5 w-5" />
                    Explorar Productos
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Link>
                </Button>
                
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-primary-700 font-bold py-4 px-8 rounded-xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 text-lg"
                >
                  <Link href="/categories">
                    <Target className="mr-3 h-4 w-4"/>
                    Ver Categorías
                  </Link>
                </Button>
              </div>

              {/* Stats animados */}
              <div className="grid grid-cols-3 gap-8 mt-16 animate-fade-in" style={{ animationDelay: '1s' }}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">1000+</div>
                  <div className="text-sm text-primary-200">Productos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">5000+</div>
                  <div className="text-sm text-primary-200">Clientes Felices</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">99%</div>
                  <div className="text-sm text-primary-200">Satisfacción</div>
                </div>
              </div>
            </div>
          </div>

          {/* Ondas decorativas */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,85.3C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="#f9fafb"/>
            </svg>
          </div>
        </section>

        {/* Testimonials Section Mejorado - ORIGINAL MANTENIDO */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjAzIj48cG9seWdvbiBwb2ludHM9IjUwIDAgNjAgNDAgMTAwIDUwIDYwIDYwIDUwIDEwMCA0MCA2MCAwIDUwIDQwIDQwIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <Badge className="bg-white/10 backdrop-blur-sm text-yellow-300 text-sm font-medium px-4 py-2 rounded-full mb-4 inline-flex items-center border border-white/20">
                <Users className="mr-2 h-4 w-4" />
                Testimonios Reales
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Lo que dicen nuestros
                <span className="text-yellow-300"> clientes</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Miles de clientes satisfechos respaldan nuestra excelencia
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "María González",
                  role: "Empresaria",
                  rating: 5,
                  comment: "Servicio excepcional y productos de la más alta calidad. La entrega fue súper rápida y todo llegó en perfectas condiciones. ¡Definitivamente volveré a comprar!",
                  delay: "0s"
                },
                {
                  name: "Carlos Rodríguez", 
                  role: "Ingeniero",
                  rating: 5,
                  comment: "La mejor experiencia de compra online que he tenido. El equipo de soporte es increíble y siempre están dispuestos a ayudar. Precios justos y calidad premium.",
                  delay: "0.2s"
                },
                {
                  name: "Ana Martínez",
                  role: "Diseñadora",
                  rating: 5,
                  comment: "Quedé impresionada con la rapidez del envío y la calidad del empaque. Los productos superaron mis expectativas. ServiPro Garcia se ha convertido en mi tienda de confianza.",
                  delay: "0.4s"
                }
              ].map((testimonial, index) => (
                <Card 
                  key={index}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 animate-fade-in transform hover:scale-105"
                  style={{ animationDelay: testimonial.delay }}
                >
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-200 mb-6 leading-relaxed text-lg">
                      "{testimonial.comment}"
                    </p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full flex items-center justify-center mr-4">
                        <span className="text-white font-bold text-lg">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">{testimonial.name}</p>
                        <p className="text-gray-400">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-16">
              <div className="inline-flex items-center bg-white/5 backdrop-blur-sm border border-white/20 rounded-full px-8 py-4">
                <ThumbsUp className="h-6 w-6 mr-3 text-yellow-300" />
                <span className="text-lg font-medium mr-3">Más de</span>
                <span className="text-3xl font-bold text-yellow-300 mr-3">10,000</span>
                <span className="text-lg">reseñas positivas</span>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section Ultra Atractivo - ORIGINAL MANTENIDO */}
        <section className="py-20 bg-gradient-to-b from-yellow-500 via-yellow-500 to-yellow-700 text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-green-400/20 to-transparent rounded-full animate-pulse-gentle blur-3xl" />
            <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-green-300/15 to-transparent rounded-full animate-pulse-gentle blur-3xl" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-8">
                <Gift className="h-5 w-5 mr-2 text-green-300" />
                <span className="text-sm font-medium">Ofertas Exclusivas</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black mb-6">
                ¡No te pierdas nada!
              </h2>
              <p className="text-xl md:text-2xl text-yellow-100 mb-4 max-w-3xl mx-auto">
                Suscríbete y recibe un <span className="text-green-300 font-bold">15% de descuento</span> en tu primera compra
              </p>
              <p className="text-lg text-yellow-200 mb-12 max-w-2xl mx-auto">
                Ofertas exclusivas, novedades y contenido premium directamente en tu bandeja de entrada
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-8">
        <input
          id="newsletter-email"
          type="email"
          placeholder="Ingresa tu mejor email"
          className="flex-1 px-6 py-4 text-lg rounded-xl text-gray-900 border-0 focus:ring-4 focus:ring-green-300/50 shadow-lg placeholder-gray-500"
        />
        <Button 
          size="lg"
          onClick={async () => {
            const emailInput = document.getElementById('newsletter-email') as HTMLInputElement;
            const email = emailInput.value;
            
            if (!email || !email.includes('@')) {
              error('Por favor ingresa un email válido');
              return;
            }
            
            try {
              await promise(
                api.post('/newsletter/subscribe', { email }),
                {
                  loading: 'Suscribiendo...',
                  success: '¡Suscripción exitosa! Revisa tu email para tu cupón de bienvenida',
                  error: 'Error al suscribirse'
                }
              );
              emailInput.value = '';
            } catch (err) {
              console.error('Error:', err);
            }
          }}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 text-lg"
        >
          <Zap className="mr-2 h-5 w-5" />
          ¡Suscribirme Ahora!
        </Button>
      </div>
              
              <div className="flex items-center justify-center space-x-6 text-sm text-yellow-200">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-300" />
                  Sin spam
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-green-300" />
                  Cancela cuando quieras
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2 text-green-300" />
                  Contenido exclusivo
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Simple pero Elegante - ORIGINAL MANTENIDO */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="relative">
                        <Image
                          src="/logo.png"
                          alt="ServiPro Garcia Logo"
                          width={80}
                          height={80}
                          className="h-20 w-auto transition-transform duration-300 group-hover:scale-110 drop-shadow-lg"
                          priority
                        />
                      </div>
              <span className="font-bold text-2xl">ServiPro Garcia</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Tu tienda de confianza para productos especializados, tecnología y mucho más. 
              Calidad premium y servicio excepcional desde Houston, TX.
            </p>
            <p className="text-gray-500">
              © 2024 ServiPro Garcia LLC. Todos los derechos reservados.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Diseñado con ❤️ en Houston, Texas
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}