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
  Smartphone
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

  const getProductImage = (product: Product): string => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const img = product.images[0];
      if (typeof img === 'string') return img;
      if (img && typeof img.url === 'string') return img.url;
    }
    return '/placeholder-product.jpg';
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
                      
                      {/* Content */}
                      <div className="text-white max-w-lg w-full px-4 md:px-0">
                        <div className="inline-block px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg bg-gradient-to-r from-gold to-cyan text-darkbg">
                          ⭐ FEATURED PRODUCT
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-6xl font-black mb-3 md:mb-4 leading-tight text-white animate-neon-glow">
                          {product.name}
                        </h1>
                        <p className="text-sm sm:text-base md:text-2xl mb-4 md:mb-6 text-gray-300 leading-relaxed line-clamp-3 md:line-clamp-none">
                          {product.shortDesc && product.shortDesc.trim() 
                            ? product.shortDesc
                            : product.description && product.description.trim()
                              ? product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '')
                              : 'Discover this amazing product'
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
                              View Product
                              <ArrowRight className="ml-3 h-5 w-5" />
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="lg" 
                            className="border-2 border-cyan/40 bg-darkbg-light/50 backdrop-blur-md text-white hover:bg-cyan/20 hover:border-cyan font-bold py-4 px-8 rounded-xl transform hover:scale-105 transition-all duration-300 text-lg"
                          >
                            <Heart className="mr-3 h-4 w-4"/>
                            Add to Wishlist
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
                              Featured!
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
                {featuredProducts.slice(0, 3).map((_, index) => (
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

        {/* Featured Products Section Dark Tech */}
        <section className="py-20 bg-darkbg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/5 to-transparent" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between mb-16">
              <div className="text-left mb-8 lg:mb-0">
                <Badge className="bg-gold/20 backdrop-blur-sm text-gold border border-gold/30 text-sm font-medium px-4 py-2 rounded-full mb-4 inline-flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Most Popular
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Featured
                  <span className="text-gold"> Products</span>
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl">
                  Handpicked premium tech for tech enthusiasts
                </p>
              </div>
              
              <Button 
                asChild 
                size="lg"
                className="border-2 border-gold/30 bg-darkbg-light text-gold hover:bg-gold hover:text-darkbg font-bold py-4 px-8 rounded-xl transform hover:scale-105 transition-all duration-300"
              >
                <Link href="/products?featured=true">
                  View All
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
                <p className="text-xl text-gray-500">No featured products available</p>
              </div>
            )}
          </div>
        </section>

        {/* Categories Section Dark Tech */}
        <section className="py-20 bg-gradient-to-b from-darkbg via-darkbg-light to-darkbg backdrop-blur-sm relative">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan/5 via-transparent to-gold/5"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <Badge className="bg-cyan/20 backdrop-blur-sm text-cyan border border-cyan/30 text-sm font-medium px-4 py-2 rounded-full mb-4">
                Explore Our Categories
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Everything You Need
                <span className="text-cyan"> In One Place</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Discover our wide selection of premium tech products
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {categories.slice(0, 10).map((category, index) => {
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
                    <Card className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 bg-darkbg-light/50 backdrop-blur-md hover:backdrop-blur-lg transform hover:scale-105 hover:-translate-y-2 overflow-hidden relative border border-gold/10 hover:border-gold/30">
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-500 bg-cover bg-center"
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-cyan/5 group-hover:from-gold/10 group-hover:to-cyan/10 transition-all duration-500" />
                      
                      <CardContent className="p-8 text-center relative z-10">
                        <div className="relative z-20">
                          <div className="bg-gradient-to-r from-gold to-cyan group-hover:from-cyan group-hover:to-gold backdrop-blur-sm w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg border border-gold/20">
                            <span className="text-3xl font-black text-darkbg drop-shadow-lg">
                              {category.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <h3 className="font-bold text-white group-hover:text-gold transition-colors text-lg drop-shadow-sm">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            Explore products
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
                className="bg-gradient-to-r from-cyan to-gold hover:from-gold hover:to-cyan backdrop-blur-sm text-darkbg font-bold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 border border-gold/30"
              >
                <Link href="/categories">
                  View All Categories
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section Dark Tech */}
        <section className="py-16 bg-darkbg relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Why Choose BeztShop?</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">Premium experience that exceeds expectations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Truck,
                  title: "Express Shipping",
                  desc: "Fast and secure delivery",
                  color: "from-gold to-cyan",
                  bgColor: "bg-gold/10",
                  delay: "0s"
                },
                {
                  icon: Shield,
                  title: "100% Secure",
                  desc: "Protected purchase",
                  color: "from-cyan to-gold", 
                  bgColor: "bg-cyan/10",
                  delay: "0.1s"
                },
                {
                  icon: RefreshCw,
                  title: "Total Warranty",
                  desc: "30-day guarantee",
                  color: "from-gold to-cyan",
                  bgColor: "bg-gold/10", 
                  delay: "0.2s"
                },
                {
                  icon: Headphones,
                  title: "24/7 Support",
                  desc: "Always here for you",
                  color: "from-cyan to-gold",
                  bgColor: "bg-cyan/10",
                  delay: "0.3s"
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className={`group ${feature.bgColor} backdrop-blur-sm rounded-2xl p-8 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-fade-in border border-gold/10 hover:border-gold/30`}
                  style={{ animationDelay: feature.delay }}
                >
                  <div className={`bg-gradient-to-r ${feature.color} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-darkbg" />
                  </div>
                  <h3 className="font-bold text-xl text-white mb-3 group-hover:text-gold transition-colors">{feature.title}</h3>
                  <p className="text-gray-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hero Section Dark Tech */}
        <section className="relative bg-gradient-to-br from-darkbg via-darkbg-light to-darkbg text-white py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-gold/20 to-transparent rounded-full animate-pulse-gentle blur-3xl" />
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan/15 to-transparent rounded-full animate-pulse-gentle blur-3xl" style={{ animationDelay: '1s' }} />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNGRkQ3MDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-6xl mx-auto">
              <div className="inline-flex items-center bg-darkbg-light/50 backdrop-blur-sm border border-gold/20 rounded-full px-6 py-2 mb-8 animate-fade-in">
                <Sparkles className="h-4 w-4 mr-2 text-gold" />
                <span className="text-sm font-medium">Welcome to the future of tech shopping</span>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <span className="bg-gradient-to-r from-white via-gold to-white bg-clip-text text-transparent">
                  Bezt
                </span>
                <br />
                <span className="text-cyan">Shop</span>
              </h1>
              
              <p className="text-xl md:text-2xl lg:text-3xl mb-4 text-gray-300 max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.4s' }}>
                Your premium destination for cutting-edge technology
              </p>
              
              <p className="text-lg md:text-xl mb-12 text-gray-400 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
                Premium quality, exceptional service, unbeatable prices
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-bold py-4 px-8 rounded-xl shadow-glow-gold hover:shadow-glow-cyan transform hover:scale-105 transition-all duration-300 border-0 text-lg"
                >
                  <Link href="/products">
                    <ShoppingBag className="mr-3 h-5 w-5" />
                    Shop Now
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Link>
                </Button>
                
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-gold/30 bg-darkbg-light/50 backdrop-blur-sm text-white hover:bg-gold/20 hover:border-gold font-bold py-4 px-8 rounded-xl transform hover:scale-105 transition-all duration-300 text-lg"
                >
                  <Link href="/categories">
                    <Cpu className="mr-3 h-4 w-4"/>
                    Browse Categories
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-8 mt-16 animate-fade-in" style={{ animationDelay: '1s' }}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gold mb-2">1000+</div>
                  <div className="text-sm text-gray-400">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-cyan mb-2">5000+</div>
                  <div className="text-sm text-gray-400">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gold mb-2">99%</div>
                  <div className="text-sm text-gray-400">Satisfaction</div>
                </div>
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
              <Badge className="bg-darkbg-light/50 backdrop-blur-sm text-gold border border-gold/30 text-sm font-medium px-4 py-2 rounded-full mb-4 inline-flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Real Testimonials
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                What Our Customers
                <span className="text-gold"> Say</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Thousands of satisfied customers trust our excellence
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Alex Johnson",
                  role: "Tech Enthusiast",
                  rating: 5,
                  comment: "BeztShop has the best selection of premium tech products. Fast shipping and excellent customer service!",
                  delay: "0s"
                },
                {
                  name: "Sarah Williams", 
                  role: "Digital Creator",
                  rating: 5,
                  comment: "Amazing quality and unbeatable prices. This is now my go-to store for all my tech needs.",
                  delay: "0.2s"
                },
                {
                  name: "Mike Chen",
                  role: "Software Engineer",
                  rating: 5,
                  comment: "Top-notch products and customer support. The dark theme website is gorgeous! Highly recommend.",
                  delay: "0.4s"
                }
              ].map((testimonial, index) => (
                <Card 
                  key={index}
                  className="bg-darkbg-light/50 backdrop-blur-sm border border-gold/10 hover:bg-darkbg-light hover:border-gold/30 transition-all duration-500 animate-fade-in transform hover:scale-105"
                  style={{ animationDelay: testimonial.delay }}
                >
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-gold text-gold" />
                      ))}
                    </div>
                    <p className="text-gray-300 mb-6 leading-relaxed text-lg">
                      "{testimonial.comment}"
                    </p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-gold to-cyan rounded-full flex items-center justify-center mr-4">
                        <span className="text-darkbg font-bold text-lg">
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
              <div className="inline-flex items-center bg-darkbg-light/50 backdrop-blur-sm border border-gold/20 rounded-full px-8 py-4">
                <ThumbsUp className="h-6 w-6 mr-3 text-gold" />
                <span className="text-lg font-medium mr-3">Over</span>
                <span className="text-3xl font-bold text-gold mr-3">10,000</span>
                <span className="text-lg">positive reviews</span>
              </div>
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
                <span className="text-sm font-medium">Exclusive Offers</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black mb-6">
                Don't Miss Out!
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
                Subscribe and get <span className="text-gold font-bold">15% off</span> your first purchase
              </p>
              <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
                Exclusive deals, new arrivals and premium content delivered to your inbox
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-8">
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 text-lg rounded-xl text-white bg-darkbg-light border-2 border-gold/20 focus:ring-4 focus:ring-gold/50 shadow-lg placeholder-gray-500"
                />
                <Button 
                  size="lg"
                  onClick={async () => {
                    const emailInput = document.getElementById('newsletter-email') as HTMLInputElement;
                    const email = emailInput.value;
                    
                    if (!email || !email.includes('@')) {
                      error('Please enter a valid email');
                      return;
                    }
                    
                    try {
                      await promise(
                        api.post('/newsletter/subscribe', { email }),
                        {
                          loading: 'Subscribing...',
                          success: 'Successfully subscribed! Check your email for your welcome coupon',
                          error: 'Subscription failed'
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
                  Subscribe Now!
                </Button>
              </div>
              
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-gold" />
                  No spam
                </div>
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2 text-cyan" />
                  Cancel anytime
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2 text-gold" />
                  Exclusive content
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
                <div className="absolute inset-0 bg-gradient-to-r from-gold to-cyan rounded-full blur-lg opacity-50"></div>
                <Image
                  src="/logo.png"
                  alt="BeztShop Logo"
                  width={80}
                  height={80}
                  className="relative h-20 w-auto transition-transform duration-300 hover:scale-110 drop-shadow-lg"
                  priority
                />
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-gold to-cyan bg-clip-text text-transparent">BeztShop</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Your premium destination for cutting-edge technology and electronics. 
              Quality guaranteed and exceptional service from Houston, TX.
            </p>
            <p className="text-gray-500">
              © 2024 BeztShop LLC. All rights reserved.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Designed with 🖤 in Houston, Texas
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}