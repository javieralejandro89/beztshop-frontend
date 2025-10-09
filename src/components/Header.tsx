// src/components/Header.tsx - Navigation Dark Tech Theme
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  User,
  Heart,
  MapPin,
  Bell,
  Zap
} from 'lucide-react';
import { useCartStore } from '@/lib/cartStore';
import { productsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import SideCart from '@/components/SideCart';
import type { Category } from '@/types';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const { totalItems, toggleCart } = useCartStore();
  const { isAuthenticated, user, isInitialized } = useAuthStore();

  useEffect(() => {
    console.log('🔍 Header render:', { isAuthenticated, user: user?.firstName, isInitialized });
  }, [isAuthenticated, user, isInitialized]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await productsApi.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  return (
    <>
      <header className="bg-darkbg shadow-lg border-b-2 border-gold/20 sticky top-0 z-50">
        {/* Top bar Dark Tech */}
        <div className="bg-gradient-to-r from-darkbg via-darkbg-light to-darkbg text-white text-sm border-b border-gold/10">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 md:space-x-6">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-gold animate-pulse" />
                  <span className="font-medium">Envío rápido a todo el mundo</span>
                </div>
                <div className="hidden lg:flex items-center space-x-1">
                  <Bell className="h-4 w-4 text-cyan" />
                  <span>Soporte Premium 24/7</span>
                </div>
              </div>
              <div className="flex items-center text-xs md:text-sm">
                <span className="bg-gradient-to-r from-gold to-cyan text-darkbg px-2 py-1 md:px-3 md:py-1 rounded-full font-bold animate-pulse">
                  Envío gratis $200+
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main header Dark Tech */}
        <div className="bg-gradient-to-r from-darkbg via-darkbg-light to-darkbg text-white shadow-xl h-20">
          <div className="container mx-auto px-4 h-full">
            <div className="flex items-center justify-between gap-6 h-full">
              
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-4 group">
                <div className="relative">
                  <div className="absolute inset-0 blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <Image
                    src="/logo.png"
                    alt="BeztShop Logo"
                    width={150}
                    height={150}
                    className="relative h-32 w-auto transition-transform duration-300 group-hover:scale-110 drop-shadow-2xl"
                    priority
                  />
                </div>
                <div className="hidden sm:block">
                  <div className="font-black text-2xl bg-gradient-to-r from-gold via-cyan to-gold bg-clip-text text-transparent group-hover:from-cyan group-hover:via-gold group-hover:to-cyan transition-all duration-500 animate-neon-glow">
                    Tech Store
                  </div>
                  <div className="text-sm text-cyan font-semibold -mt-1 drop-shadow-sm">
                    Premium
                  </div>
                </div>
              </Link>

              {/* Search bar Dark Tech */}
              <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-2 md:mx-4">
                <div className="relative group">
                  <Input
                    type="text"
                    placeholder="Buscar productos, marcas, categorías..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-3 pr-12 py-2.5 md:pl-4 md:pr-14 md:py-3 text-base md:text-lg bg-darkbg-light/80 backdrop-blur-sm border-2 border-gold/20 text-white placeholder-gray-400 rounded-xl focus:ring-4 focus:ring-gold/50 focus:border-gold group-hover:border-gold/30 transition-all duration-300 shadow-lg"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-glow-gold transform hover:scale-105"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>

              {/* Right section */}
              <div className="flex items-center space-x-3">
                {/* Favorites */}
                {isAuthenticated && (
                  <Link href="/wishlist">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hidden sm:flex items-center space-x-2 hover:bg-darkbg-light hover:text-cyan text-white transition-all duration-300 rounded-xl px-3 py-2 border border-transparent hover:border-cyan/20"
                    >
                      <Heart className="h-5 w-5" />
                      <span className="hidden lg:inline font-medium text-base">Favoritos</span>
                    </Button>
                  </Link>
                )}

                {/* User account */}
                <div className="hidden sm:block">
                  {isAuthenticated ? (
                    <Link href="/account">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center space-x-2 hover:bg-darkbg-light hover:text-gold text-white transition-all duration-300 rounded-xl px-3 py-2 border border-transparent hover:border-gold/20"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-gold to-cyan rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-darkbg font-bold text-sm">
                            {user?.firstName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <span className="hidden lg:inline font-medium text-base">
                          {user?.firstName ? `Hola, ${user.firstName}` : isInitialized ? 'Hola' : 'Loading...'}
                        </span>
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth/login">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center space-x-2 hover:bg-darkbg-light hover:text-gold text-white transition-all duration-300 rounded-xl px-3 py-2 border border-transparent hover:border-gold/20"
                      >
                        <User className="h-5 w-5" />
                        <span className="hidden lg:inline font-medium text-base">Inicia sesión</span>
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Cart */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleCart}
                  className="relative flex items-center space-x-2 hover:bg-darkbg-light hover:text-cyan text-white transition-all duration-300 rounded-xl px-3 py-2 border border-transparent hover:border-cyan/20"
                >
                  <div className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                      <Badge 
                        className="absolute -top-2 -right-2 bg-gradient-to-r from-gold to-cyan text-darkbg rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-pulse shadow-lg"
                      >
                        {totalItems}
                      </Badge>
                    )}
                  </div>
                  <span className="hidden lg:inline font-medium text-base">Carrito</span>
                </Button>

                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden hover:bg-darkbg-light text-white rounded-xl p-2 border border-transparent hover:border-gold/20"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Categories navigation Dark Tech */}
        <div className="bg-gradient-to-r from-darkbg-light via-darkbg-lighter to-darkbg-light border-t border-gold/10">
          <div className="container mx-auto px-4 py-3">
            <div className="hidden md:flex items-center text-base space-x-8 overflow-x-auto scrollbar-hide">
              <Link 
                href="/products" 
                className="text-white hover:text-gold whitespace-nowrap py-2 font-semibold text-sm transition-all duration-300 hover:scale-105 border-b-2 border-transparent hover:border-gold"
              >
                <span className="hidden lg:inline font-medium text-base">Todos los productos</span>
              </Link>
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="text-white hover:text-cyan whitespace-nowrap py-2 text-sm transition-all duration-300 hover:scale-105 border-b-2 border-transparent hover:border-cyan"
                >
                  <span className="hidden lg:inline text-base">{category.name}</span>
                </Link>
              ))}
              {categories.length > 8 && (
                <Link
                  href="/categories"
                  className="text-white hover:text-gold whitespace-nowrap py-2 text-sm font-medium transition-all duration-300 hover:scale-105"
                >
                  Ver más...
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu Dark Tech */}
        {isMenuOpen && (
          <div className="md:hidden bg-darkbg-light border-t border-gold/10 shadow-xl">
            <div className="container mx-auto px-4 py-6 space-y-6">
              {/* Mobile user section */}
              <div className="border-b border-gold/10 pb-4">
                {isAuthenticated ? (
                  <Link 
                    href="/account" 
                    className="flex items-center space-x-3 text-white hover:text-gold transition-colors p-3 rounded-xl hover:bg-darkbg/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-gold to-cyan rounded-full flex items-center justify-center">
                      <span className="text-darkbg font-bold">
                        {user?.firstName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold">
                        {user?.firstName ? `Hi, ${user.firstName}` : isInitialized ? 'Hi' : 'Loading...'}
                      </div>
                      <div className="text-sm text-gray-400">Ver mi cuenta</div>
                    </div>
                  </Link>
                ) : (
                  <Link 
                    href="/auth/login" 
                    className="flex items-center space-x-3 text-white hover:text-gold transition-colors p-3 rounded-xl hover:bg-darkbg/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-6 w-6" />
                    <span className="font-semibold">Iniciar sesión</span>
                  </Link>
                )}
              </div>

              {/* Mobile favorites */}
              {isAuthenticated && (
                <div className="border-b border-gold/10 pb-4">
                  <Link 
                    href="/wishlist" 
                    className="flex items-center space-x-3 text-white hover:text-cyan transition-colors p-3 rounded-xl hover:bg-darkbg/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="h-6 w-6" />
                    <span className="font-semibold">Favoritos</span>
                  </Link>
                </div>
              )}

              {/* Mobile categories */}
              <div className="space-y-2">
                <h3 className="font-bold text-white text-lg mb-4">Categorías</h3>
                
                <Link
                  href="/products"
                  className="flex items-center text-white hover:text-gold py-3 px-3 rounded-xl hover:bg-darkbg/50 transition-all font-medium border-l-4 border-transparent hover:border-gold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="w-8 h-8 bg-gradient-to-r from-gold to-cyan rounded-lg flex items-center justify-center mr-3">
                    <span className="text-darkbg font-bold">A</span>
                  </span>
                  Todos los productos
                </Link>

                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="flex items-center text-white hover:text-cyan py-3 px-3 rounded-xl hover:bg-darkbg/50 transition-all font-medium border-l-4 border-transparent hover:border-cyan"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="w-8 h-8 bg-gradient-to-r from-cyan to-gold rounded-lg flex items-center justify-center mr-3">
                      <span className="text-darkbg font-bold">{category.name.charAt(0)}</span>
                    </span>
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <SideCart />
    </>
  );
}