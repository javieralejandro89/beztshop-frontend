// src/components/Header.tsx - Navegación moderna con logo PNG
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
  Bell
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

  // ✅ AGREGAR: Log para debugging
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
      <header className="bg-white shadow-lg border-b-2 border-yellow-200 sticky top-0 z-50">
        {/* Top bar responsive */}
<div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white text-sm">
  <div className="container mx-auto px-4 py-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4 md:space-x-6">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-yellow-400" />
          <span className="font-medium">Entrega en todo EE.UU</span>
        </div>
        <div className="hidden lg:flex items-center space-x-1">
          <Bell className="h-4 w-4 text-yellow-400" />
          <span>Servicio al Cliente 24/7</span>
        </div>
      </div>
      <div className="flex items-center text-xs md:text-sm">
        <span className="bg-yellow-400 text-gray-900 px-2 py-1 md:px-3 md:py-1 rounded-full font-bold">
          Envío Gratis +$100
        </span>
      </div>
    </div>
  </div>
</div>

        {/* Main header oscuro modernizado */}
<div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white shadow-xl h-20"> {/* Altura fija */}
  <div className="container mx-auto px-4 h-full"> {/* Contenedor con altura completa */}
    <div className="flex items-center justify-between gap-6 h-full"> {/* Items centrados verticalmente */}
      
      {/* Logo con altura máxima limitada */}
      <Link href="/" className="flex items-center space-x-4 group">
        <div className="relative">
          <Image
            src="/logo.png"
            alt="ServiPro Garcia Logo"
            width={150}
            height={150}
            className="h-32 w-auto transition-transform duration-300 group-hover:scale-110 drop-shadow-lg"
            priority
          />
        </div>
        <div className="hidden sm:block">
          <div className="font-black text-2xl text-white group-hover:text-yellow-200 transition-colors drop-shadow-md">
            ServiPro Garcia
          </div>
          <div className="text-sm text-yellow-300 font-semibold -mt-1 drop-shadow-sm">
            Tecnología Premium
          </div>
        </div>
      </Link>

      {/* Search bar responsive */}
<form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-2 md:mx-4">
  <div className="relative group">
    <Input
      type="text"
      placeholder="Buscar productos, marcas, categorías..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-3 pr-12 py-2.5 md:pl-4 md:pr-14 md:py-3 text-base md:text-lg bg-white/80 backdrop-blur-sm border-2 border-white/20 text-gray-900 placeholder-gray-300 rounded-xl focus:ring-4 focus:ring-yellow-200/50 focus:border-yellow-400 group-hover:border-white/30 transition-all duration-300 shadow-lg"
    />
    <Button
      type="submit"
      size="sm"
      className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
    >
      <Search className="h-4 w-4" />
    </Button>
  </div>
</form>

      {/* Right section adaptada para fondo oscuro */}
      <div className="flex items-center space-x-3">
        {/* Favorites */}
        {isAuthenticated && (
          <Link href="/wishlist">
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden sm:flex items-center space-x-2 hover:bg-white/10 hover:text-red-300 text-white transition-all duration-300 rounded-xl px-3 py-2"
            >
              <Heart className="h-5 w-5" />
              <span className="hidden lg:inline font-medium text-base">Favoritos</span>
            </Button>
          </Link>
        )}

        {/* User account con texto más grande */}
<div className="hidden sm:block">
  {isAuthenticated ? (
  <Link href="/account">
    <Button 
      variant="ghost" 
      size="sm" 
      className="flex items-center space-x-2 hover:bg-white/10 hover:text-green-300 text-white transition-all duration-300 rounded-xl px-3 py-2"
    >
      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-sm">
          {user?.firstName?.charAt(0) || 'U'}
        </span>
      </div>
      <span className="hidden lg:inline font-medium text-base">
        {/* ✅ CORREGIDO: Mostrar "Cargando..." si no hay firstName aún */}
        {user?.firstName ? `Hola, ${user.firstName}` : isInitialized ? 'Hola' : 'Cargando...'}
      </span>
    </Button>
  </Link>
  ) : (
    <Link href="/auth/login">
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center space-x-2 hover:bg-white/10 hover:text-blue-300 text-white transition-all duration-300 rounded-xl px-3 py-2"
      >
        <User className="h-5 w-5" />
        <span className="hidden lg:inline font-medium text-base">Ingresar</span> {/* Aumentado */}
      </Button>
    </Link>
  )}
</div>

{/* Cart con texto más grande */}
<Button
  variant="ghost"
  size="sm"
  onClick={toggleCart}
  className="relative flex items-center space-x-2 hover:bg-white/10 hover:text-yellow-300 text-white transition-all duration-300 rounded-xl px-3 py-2"
>
  <div className="relative">
    <ShoppingCart className="h-5 w-5" />
    {totalItems > 0 && (
      <Badge 
        className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-pulse shadow-lg"
      >
        {totalItems}
      </Badge>
    )}
  </div>
  <span className="hidden lg:inline font-medium text-base">Carrito</span> {/* Aumentado */}
</Button>

        {/* Mobile menu button adaptado */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden hover:bg-white/10 text-white rounded-xl p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  </div>
</div>

        {/* Categories navigation modernizada */}
        <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-t border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <div className="hidden md:flex items-center text-base space-x-8 overflow-x-auto scrollbar-hide">
              <Link 
                href="/products" 
                className="text-gray-700 hover:text-yellow-600 whitespace-nowrap py-2 font-semibold text-sm transition-all duration-300 hover:scale-105 border-b-2 border-transparent hover:border-yellow-400"
              >
                <span className="hidden lg:inline font-medium text-base">Todos los productos</span>
              </Link>
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="text-gray-700 hover:text-green-600 whitespace-nowrap py-2 text-sm transition-all duration-300 hover:scale-105 border-b-2 border-transparent hover:border-green-400"
                >
                  <span className="hidden lg:inline text-base">{category.name}</span>
                </Link>
              ))}
              {categories.length > 8 && (
                <Link
                  href="/categories"
                  className="text-gray-700 hover:text-yellow-600 whitespace-nowrap py-2 text-sm font-medium transition-all duration-300 hover:scale-105"
                >
                  Ver más...
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu con categorías */}
{isMenuOpen && (
  <div className="md:hidden bg-white border-t border-gray-200 shadow-xl">
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Mobile user section */}
      <div className="border-b border-gray-200 pb-4">
        {isAuthenticated ? (
          <Link 
            href="/account" 
            className="flex items-center space-x-3 text-gray-700 hover:text-green-600 transition-colors p-3 rounded-xl hover:bg-green-50"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {user?.firstName?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <div className="font-semibold">
                 {user?.firstName ? `Hola, ${user.firstName}` : isInitialized ? 'Hola' : 'Cargando...'}
              </div>
              <div className="text-sm text-gray-500">Ver mi cuenta</div>
            </div>
          </Link>
        ) : (
          <Link 
            href="/auth/login" 
            className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors p-3 rounded-xl hover:bg-blue-50"
            onClick={() => setIsMenuOpen(false)}
          >
            <User className="h-6 w-6" />
            <span className="font-semibold">Iniciar Sesión</span>
          </Link>
        )}
      </div>

      {/* Mobile favorites link */}
      {isAuthenticated && (
        <div className="border-b border-gray-200 pb-4">
          <Link 
            href="/wishlist" 
            className="flex items-center space-x-3 text-gray-700 hover:text-red-600 transition-colors p-3 rounded-xl hover:bg-red-50"
            onClick={() => setIsMenuOpen(false)}
          >
            <Heart className="h-6 w-6" />
            <span className="font-semibold">Favoritos</span>
          </Link>
        </div>
      )}

      {/* Mobile categories - CORREGIDO */}
      <div className="space-y-2">
        <h3 className="font-bold text-gray-900 text-lg mb-4">Categorías</h3>
        
        {/* Todos los productos */}
        <Link
          href="/products"
          className="flex items-center text-gray-700 hover:text-yellow-600 py-3 px-3 rounded-xl hover:bg-yellow-50 transition-all font-medium border-l-4 border-transparent hover:border-yellow-400"
          onClick={() => setIsMenuOpen(false)}
        >
          <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
            <span className="text-yellow-600 font-bold">T</span>
          </span>
          Todos los Productos
        </Link>

        {/* Categorías específicas */}
        {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="block text-gray-700 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
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