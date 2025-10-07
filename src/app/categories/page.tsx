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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6 animate-fade-in">
          <Link href="/" className="hover:text-primary-600 transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Categorías</span>
        </nav>

        {/* Header */}
        <div className="mb-8 animate-fade-in relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Grid className="h-8 w-8 mr-3 text-primary-600" />
                Todas las Categorías
                <Badge className="ml-3 bg-primary-100 text-primary-800">
                  {categories.length} categorías
                </Badge>
              </h1>
              <p className="text-gray-600 mt-2">
                Explora nuestra amplia selección de productos organizados por categorías
              </p>
            </div>
            
            <Button asChild variant="outline" className="absolute -top-12 right-0 md:relative md:top-auto md:right-auto">
  <Link href="/products">
    <ArrowLeft className="h-4 w-4 mr-2" />
    <span className="hidden sm:inline">Ver productos</span>
    <span className="sm:hidden">Ver productos</span>
  </Link>
</Button>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
          </div>
        </div>

        {/* Categorías populares */}
        {!searchTerm && getPopularCategories().length > 0 && (
          <section className="mb-12 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-primary-600" />
              Categorías Populares
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {getPopularCategories().map((category, index) => (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary-200 bg-gradient-to-br from-primary-50 to-yellow-50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl">
                          {getCategoryIcon(category.name)}
                        </div>
                        <Badge className="bg-primary-600 text-white">
                          Popular
                        </Badge>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-primary-700">
                          {category.productCount} productos
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Tag className="h-6 w-6 mr-2 text-primary-600" />
            {searchTerm ? `Resultados para "${searchTerm}"` : 'Todas las Categorías'}
          </h2>

          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((category, index) => (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-2xl">
                          {getCategoryIcon(category.name)}
                        </div>
                        {category.productCount && category.productCount > 10 && (
                          <Badge variant="outline" className="border-primary-300 text-primary-700">
                            <Star className="h-3 w-3 mr-1" />
                            Top
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                        {category.name}
                      </h3>
                      
                      {category.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                          {category.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-sm text-gray-700">
                          {category.productCount ? (
                            <span className="font-medium">
                              {category.productCount} producto{category.productCount !== 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-gray-500">Sin productos</span>
                          )}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No se encontraron categorías
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? `No hay categorías que coincidan con "${searchTerm}"`
                  : 'Aún no hay categorías disponibles'
                }
              </p>
              {searchTerm && (
                <Button onClick={() => setSearchTerm('')} variant="outline">
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          )}
        </section>

        {/* Call to action */}
        {!searchTerm && (
          <section className="mt-16 text-center animate-fade-in">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">
                ¿No encuentras lo que buscas?
              </h3>
              <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
                Explora todos nuestros productos o contáctanos para ayudarte a encontrar exactamente lo que necesitas
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-yellow-400 text-black hover:bg-green-800 hover:text-white">
                  <Link href="/products">
                    <Package className="h-4 w-4 mr-2" />
                    Ver todos los productos
                  </Link>
                </Button>
                <Button asChild variant="outline" className="bg-yellow-400 text-black hover:bg-green-800 hover:text-white">
                  <Link href="https://wa.me/18325230060?text=Hola,%20me%20interesa%20conocer%20más%20sobre%20sus%20productos" target="_blank" rel="noopener noreferrer">
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