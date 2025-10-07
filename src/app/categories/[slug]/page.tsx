// src/app/categories/[slug]/page.tsx - Página de categoría individual
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Grid,
  List,
  Search,
  SlidersHorizontal,
  Filter,
  Package,
  Tag,
} from 'lucide-react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { productsApi } from '@/lib/api';
import type { Product, Category } from '@/types';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name-asc');

  useEffect(() => {
    if (slug) {
      loadCategoryData();
    }
  }, [slug]);

  const loadCategoryData = async () => {
  try {
    setIsLoading(true);
    
    // Cargar datos de la categoría - SOLO una llamada
    const categoryData = await productsApi.getCategoryBySlug(slug);
    setCategory(categoryData);
    
    // Cargar productos de la categoría
    const productsResponse = await productsApi.getProducts({
      categoryId: categoryData.id,
      limit: 50
    });
    
    setProducts(productsResponse.data || []);
    
  } catch (error) {
    console.error('Error loading category:', error);
    setCategory(null); // Importante: setear null para mostrar el mensaje de "no encontrada"
  } finally {
    setIsLoading(false);
  }
};

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    
    const [field, order] = newSort.split('-');
    const sortedProducts = [...products].sort((a, b) => {
      let aValue: any = a[field as keyof Product];
      let bValue: any = b[field as keyof Product];
      
      if (field === 'price') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setProducts(sortedProducts);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Categoría no encontrada</h1>
            <p className="text-gray-600 mb-6">
              La categoría que buscas no existe o ha sido eliminada.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/categories">
                  Ver todas las categorías
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/products">
                  Ver todos los productos
                </Link>
              </Button>
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
          <Link href="/categories" className="hover:text-primary-600 transition-colors">Categorías</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{category.name}</span>
        </nav>

        {/* Header de categoría */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/categories">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver a categorías
                  </Link>
                </Button>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Tag className="h-8 w-8 mr-3 text-primary-600" />
                {category.name}
                <Badge className="ml-3 bg-primary-100 text-primary-800">
                  {products.length} productos
                </Badge>
              </h1>
              
              {category.description && (
                <p className="text-gray-600 mt-2 max-w-2xl">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Controles de vista y ordenamiento */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {products.length} productos encontrados
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Ordenamiento */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="name-asc">Nombre: A-Z</option>
              <option value="name-desc">Nombre: Z-A</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
            </select>

            {/* Cambio de vista */}
            <div className="flex items-center bg-white rounded-lg p-1 shadow-sm border">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de productos */}
        {products.length > 0 ? (
          <div 
            className={`
              animate-fade-in
              ${viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                : 'space-y-4'
              }
            `}
          >
            {products.map((product, index) => (
              <div 
                key={product.id}
                className="animate-fade-in transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard 
                  product={product} 
                  showAddToCart={true}
                  showWishlist={true}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No hay productos en esta categoría
            </h3>
            <p className="text-gray-600 mb-6">
              Aún no hemos agregado productos a esta categoría. ¡Vuelve pronto!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/products">
                  Ver todos los productos
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/categories">
                  Otras categorías
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Categorías relacionadas */}
        <section className="mt-16 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Explora otras categorías
          </h2>
          <div className="text-center">
            <Button asChild variant="outline" size="lg" className="bg-gradient-to-r from-green-500/90 to-green-600/90 hover:from-yellow-600 hover:to-yellow-700 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 border border-yellow-300/30">
              <Link href="/categories">
                Ver todas las categorías
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}