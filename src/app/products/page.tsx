// src/app/products/page.tsx - Listado de productos con filtros y efectos
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Search,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  X,
  Star,
  ArrowUpDown,
} from 'lucide-react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { productsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import type { Product, Category } from '@/types';

interface Filters {
  search: string;
  category: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  featured: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || 2000,
    inStock: searchParams.get('inStock') === 'true',
    featured: searchParams.get('featured') === 'true',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  });

  const [priceRange, setPriceRange] = useState([filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      const [categoriesData] = await Promise.all([
        productsApi.getCategories(),
      ]);
      
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      
      const params: any = {
        page: 1,
        limit: 20,
      };

      if (filters.search) params.search = filters.search;
      if (filters.category) params.categoryId = filters.category;
      if (filters.brand) params.brand = filters.brand;
      if (filters.minPrice > 0) params.minPrice = filters.minPrice;
      if (filters.maxPrice < 2000) params.maxPrice = filters.maxPrice;
      if (filters.inStock) params.inStock = true;
      if (filters.featured) params.featured = true;
      
      params.sortBy = filters.sortBy;
      params.sortOrder = filters.sortOrder;

      const response = await productsApi.getProducts(params);
      setProducts(response.data || []);
      
      // Extraer marcas únicas de los productos
      const uniqueBrands = [...new Set(
        (response.data || [])
          .map((p: Product) => p.brand)
          .filter(Boolean)
       )] as string[];

    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilters = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    
    // Actualizar URL
    const params = new URLSearchParams();
    const updatedFilters = { ...filters, ...newFilters };
    
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 0) {
        params.set(key, value.toString());
      }
    });

    router.push(`/products?${params.toString()}`, { scroll: false });
  }, [filters, router]);

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      category: '',
      brand: '',
      minPrice: 0,
      maxPrice: 2000,
      inStock: false,
      featured: false,
      sortBy: 'createdAt',
      sortOrder: 'desc' as const,
    };
    setFilters(clearedFilters);
    setPriceRange([0, 2000]);
    router.push('/products');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.brand) count++;
    if (filters.minPrice > 0 || filters.maxPrice < 2000) count++;
    if (filters.inStock) count++;
    if (filters.featured) count++;
    return count;
  }, [filters]);

  const FiltersSection = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Búsqueda */}
      <div>
        <Label className="text-sm font-medium text-gray-300 mb-2 block">
          Buscar Productos
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Buscar..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10 bg-darkbg border-gold/30 text-white placeholder-gray-500 focus:border-gold focus:ring-2 focus:ring-gold/50 transition-all duration-200"
          />
        </div>
      </div>

      {/* Categorías */}
      <div>
        <Label className="text-sm font-medium text-gray-300 mb-3 block">
          Categorías
        </Label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="all-categories"
              checked={!filters.category}
              onCheckedChange={() => updateFilters({ category: '' })}
              className="data-[state=checked]:bg-gold data-[state=checked]:border-gold"
            />
            <label htmlFor="all-categories" className="text-sm text-gray-300 cursor-pointer">
              Todas las categorías
            </label>
          </div>
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2 group">
              <Checkbox
                id={`category-${category.id}`}
                checked={filters.category === category.id}
                onCheckedChange={() => 
                  updateFilters({ 
                    category: filters.category === category.id ? '' : category.id 
                  })
                }
                className="data-[state=checked]:bg-gold data-[state=checked]:border-gold"
              />
              <label 
                htmlFor={`category-${category.id}`} 
                className="text-sm text-gray-300 cursor-pointer group-hover:text-gold transition-colors"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Marcas */}
      {brands.length > 0 && (
        <div>
          <Label className="text-sm font-medium text-gray-300 mb-3 block">
            Marcas
          </Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="all-brands"
                checked={!filters.brand}
                onCheckedChange={() => updateFilters({ brand: '' })}
                className="data-[state=checked]:bg-gold data-[state=checked]:border-gold"
              />
              <label htmlFor="all-brands" className="text-sm text-gray-300 cursor-pointer">
                Todas las marcas
              </label>
            </div>
            {brands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2 group">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={filters.brand === brand}
                  onCheckedChange={() => 
                    updateFilters({ 
                      brand: filters.brand === brand ? '' : brand 
                    })
                  }
                  className="data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                />
                <label 
                  htmlFor={`brand-${brand}`} 
                  className="text-sm text-gray-300 cursor-pointer group-hover:text-gold transition-colors"
                >
                  {brand}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rango de Precio */}
      <div>
        <Label className="text-sm font-medium text-gray-300 mb-3 block">
          Rango de Precio
        </Label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            onValueCommit={(value) => updateFilters({ minPrice: value[0], maxPrice: value[1] })}
            max={2000}
            min={0}
            step={10}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      {/* Filtros adicionales */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={filters.inStock}
            onCheckedChange={(checked) => updateFilters({ inStock: !!checked })}
            className="data-[state=checked]:bg-gold data-[state=checked]:border-gold"
          />
          <label htmlFor="in-stock" className="text-sm text-gray-300 cursor-pointer">
            Solo productos en stock
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="featured"
            checked={filters.featured}
            onCheckedChange={(checked) => updateFilters({ featured: !!checked })}
            className="data-[state=checked]:bg-gold data-[state=checked]:border-gold"
          />
          <label htmlFor="featured" className="text-sm text-gray-300 cursor-pointer">
            Solo productos destacados
          </label>
        </div>
      </div>

      {/* Limpiar filtros */}
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full border-gold/30 bg-darkbg text-white hover:bg-gold/10 hover:border-gold/50 transition-all duration-200"
        >
          <X className="h-4 w-4 mr-2" />
          Limpiar Filtros ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkbg via-darkbg-light to-darkbg">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb y título */}
        <div className="mb-8 animate-fade-in">
          <nav className="text-sm text-gray-400 mb-2">
            <span>Inicio</span>
            <span className="mx-2">/</span>
            <span className="text-white font-medium">Productos</span>
          </nav>
          <h1 className="text-3xl font-bold text-white mb-2">
            Nuestros Productos
          </h1>
          <p className="text-gray-400">
            Encuentra exactamente lo que necesitas
          </p>
        </div>

        {/* Barra de herramientas */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 animate-fade-in">
          <div className="flex items-center gap-4">
            {/* Botón de filtros móvil */}
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden relative bg-darkbg-light border-gold/30 text-white hover:bg-gold/10 hover:border-gold/50 hover:shadow-card-hover transition-all duration-200">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-gold to-cyan text-darkbg">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto bg-darkbg-light border-gold/20">
                <SheetHeader>
                  <SheetTitle className="text-white">Filtrar Productos</SheetTitle>
                  <SheetDescription className="text-gray-400">
                    Encuentra productos específicos usando los filtros
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <FiltersSection />
                </div>
              </SheetContent>
            </Sheet>

            {/* Filtros activos */}
            {activeFiltersCount > 0 && (
              <Badge 
                variant="outline" 
                className="bg-gold/20 text-gold border-gold/30 animate-bounce-gentle"
              >
                {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} activo{activeFiltersCount !== 1 ? 's' : ''}
              </Badge>
            )}

            {/* Resultados */}
            <span className="text-sm text-gray-400">
              {isLoading ? 'Cargando...' : `${products.length} productos encontrados`}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Ordenamiento */}
            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-300">Ordenar por:</Label>
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split('-');
                  updateFilters({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
                }}
              >
                <SelectTrigger className="w-48 bg-darkbg-light border-gold/30 text-white focus:border-gold transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-darkbg-light border-gold/30">
                  <SelectItem value="createdAt-desc">Más recientes</SelectItem>
                  <SelectItem value="createdAt-asc">Más antiguos</SelectItem>
                  <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
                  <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
                  <SelectItem value="name-asc">Nombre: A-Z</SelectItem>
                  <SelectItem value="name-desc">Nombre: Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cambio de vista */}
            <div className="flex items-center bg-darkbg-light rounded-lg p-1 shadow-sm border border-gold/20">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-gold to-cyan text-darkbg shadow-glow-gold' 
                    : 'text-gray-400 hover:text-gold'
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
                    ? 'bg-gradient-to-r from-gold to-cyan text-darkbg shadow-glow-gold' 
                    : 'text-gray-400 hover:text-gold'
                }`}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex gap-8">
          {/* Filtros sidebar - Desktop */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <Card className="sticky top-24 shadow-card-hover border-0 bg-darkbg-light/80 backdrop-blur-sm border border-gold/20">
              <CardHeader className="bg-gradient-to-r from-gold/20 to-cyan/20 backdrop-blur-sm text-white rounded-t-lg border-b border-gold/20">
                <CardTitle className="flex items-center text-white">
                  <SlidersHorizontal className="h-5 w-5 mr-2 text-gold" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <FiltersSection />
              </CardContent>
            </Card>
          </aside>

          {/* Lista de productos */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Card key={i} className="animate-pulse bg-darkbg-light border-gold/20">
                    <div className="aspect-square bg-darkbg rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-darkbg rounded mb-2"></div>
                      <div className="h-4 bg-darkbg rounded w-2/3 mb-2"></div>
                      <div className="h-6 bg-darkbg rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length > 0 ? (
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
                <div className="bg-gradient-to-br from-gold/20 to-cyan/20 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-gold/30">
                  <Search className="h-16 w-16 text-gold" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-400 mb-6">
                  Intenta ajustar tus filtros o buscar con otros términos
                </p>
                <Button 
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg shadow-glow-gold hover:shadow-glow-cyan transition-all duration-200"
                >
                  Limpiar Filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}