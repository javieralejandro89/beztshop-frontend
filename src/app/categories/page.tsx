// src/app/categories/page.tsx - Listado completo de categorías
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  ArrowLeft,
  Package,
  Grid,
  Tag,
  TrendingUp,
  Star,
  ChevronRight,
} from 'lucide-react';
import Header from '@/components/Header';
import { productsApi } from '@/lib/api';
import type { Category } from '@/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const categoriesData = await productsApi.getCategories();
      setCategories(categoriesData);
      setFilteredCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('smartphone') || name.includes('teléfono')) return '📱';
    if (name.includes('laptop') || name.includes('computador')) return '💻';
    if (name.includes('tablet')) return '📟';
    if (name.includes('accesorio')) return '🔌';
    if (name.includes('audio') || name.includes('auricular')) return '🎧';
    if (name.includes('gaming') || name.includes('juego')) return '🎮';
    if (name.includes('smart') || name.includes('inteligente')) return '🏠';
    if (name.includes('cámara') || name.includes('foto')) return '📷';
    return '📦';
  };

  const getPopularCategories = () => {
    return categories
      .filter(cat => cat.productCount && cat.productCount > 0)
      .sort((a, b) => (b.productCount || 0) - (a.productCount || 0))
      .slice(0, 6);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darkbg via-darkbg-light to-darkbg">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-darkbg-light rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-32 bg-darkbg-light rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkbg via-darkbg-light to-darkbg">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6 animate-fade-in">
          <Link href="/" className="hover:text-gold transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-white font-medium">Categorías</span>
        </nav>

        {/* Header */}
        <div className="mb-8 animate-fade-in relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Grid className="h-8 w-8 mr-3 text-gold" />
                Todas las Categorías
                <Badge className="ml-3 bg-gold/20 text-gold border border-gold/30">
                  {categories.length} categorías
                </Badge>
              </h1>
              <p className="text-gray-400 mt-2">
                Explora nuestra amplia selección de productos organizados por categorías
              </p>
            </div>
            
            <Button asChild variant="outline" className="absolute -top-12 right-0 md:relative md:top-auto md:right-auto bg-darkbg-light border-gold/30 text-white hover:bg-gold/10 hover:border-gold/50">
              <Link href="/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Ver productos</span>
                <span className="sm:hidden">Ver productos</span>
              </Link>
            </Button>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-darkbg border-gold/30 text-white placeholder-gray-500 focus:border-gold focus:ring-2 focus:ring-gold/50"
            />
          </div>
        </div>

        {/* Categorías populares */}
        {!searchTerm && getPopularCategories().length > 0 && (
          <section className="mb-12 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-gold" />
              Categorías Populares
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {getPopularCategories().map((category, index) => (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-gold/20 bg-gradient-to-br from-gold/10 to-cyan/10 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl">
                          {getCategoryIcon(category.name)}
                        </div>
                        <Badge className="bg-gradient-to-r from-gold to-cyan text-darkbg">
                          Popular
                        </Badge>
                      </div>
                      <h3 className="font-bold text-lg text-white group-hover:text-gold transition-colors mb-2">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gold">
                          {category.productCount} productos
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-gold transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Todas las categorías */}
        <section className="animate-fade-in">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Tag className="h-6 w-6 mr-2 text-cyan" />
            {searchTerm ? `Resultados para "${searchTerm}"` : 'Todas las Categorías'}
          </h2>

          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((category, index) => (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full bg-darkbg-light/80 backdrop-blur-sm border border-gold/20 hover:border-gold/40">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-2xl">
                          {getCategoryIcon(category.name)}
                        </div>
                        {category.productCount && category.productCount > 10 && (
                          <Badge variant="outline" className="border-gold/30 text-gold">
                            <Star className="h-3 w-3 mr-1" />
                            Top
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-lg text-white group-hover:text-gold transition-colors mb-2">
                        {category.name}
                      </h3>
                      
                      {category.description && (
                        <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">
                          {category.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-sm text-gray-300">
                          {category.productCount ? (
                            <span className="font-medium">
                              {category.productCount} producto{category.productCount !== 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-gray-500">Sin productos</span>
                          )}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-gold transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-gold/20 to-cyan/20 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-gold/30">
                <Search className="h-16 w-16 text-gold" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">
                No se encontraron categorías
              </h3>
              <p className="text-gray-400 mb-6">
                {searchTerm 
                  ? `No hay categorías que coincidan con "${searchTerm}"`
                  : 'Aún no hay categorías disponibles'
                }
              </p>
              {searchTerm && (
                <Button onClick={() => setSearchTerm('')} variant="outline" className="bg-darkbg border-gold/30 text-white hover:bg-gold/10 hover:border-gold/50">
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          )}
        </section>

        {/* Call to action */}
        {!searchTerm && (
          <section className="mt-16 text-center animate-fade-in">
            <div className="bg-gradient-to-r from-gold/20 via-cyan/10 to-gold/20 backdrop-blur-sm rounded-2xl p-8 text-white border border-gold/20">
              <h3 className="text-2xl font-bold mb-4">
                ¿No encuentras lo que buscas?
              </h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Explora todos nuestros productos o contáctanos para ayudarte a encontrar exactamente lo que necesitas
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-bold">
                  <Link href="/products">
                    <Package className="h-4 w-4 mr-2" />
                    Ver todos los productos
                  </Link>
                </Button>
                <Button asChild variant="outline" className="bg-darkbg border-gold/30 text-white hover:bg-gold/10 hover:border-gold/50 font-bold">
                  <Link href="https://wa.me/529985780385?text=Hola,%20me%20interesa%20conocer%20más%20sobre%20sus%20productos" target="_blank" rel="noopener noreferrer">
                        Contáctanos
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}