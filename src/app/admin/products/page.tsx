// src/app/admin/products/page.tsx - Gestión de productos
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Package,
  AlertTriangle,
  Star
} from 'lucide-react';
import { productsApi } from '@/lib/api';
import { useAdminStore } from '@/lib/adminStore';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Product } from '@/types';

export default function ProductsAdminPage() {
  const {
    products,
    isLoading,
    error,
    filters,
    setProducts,
    setLoading,
    setError,
    updateFilters,
    removeProduct
  } = useAdminStore();

  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [filters.page, filters.limit]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getProductsAdmin({
        page: filters.page,
        limit: filters.limit,
        search: filters.search
      });
      
      setProducts(response.products || []);
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError(err.response?.data?.error || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await productsApi.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleSearch = () => {
    updateFilters({ search: searchTerm, page: 1 });
    loadProducts();
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      await productsApi.deleteProduct(productId);
      removeProduct(productId);
      alert('Producto eliminado exitosamente');
    } catch (err: any) {
      console.error('Error deleting product:', err);
      alert(err.response?.data?.error || 'Error al eliminar producto');
    }
  };

  const getStockStatus = (product: Product) => {
    if (!product.isActive) return 'inactive';
    if (product.stockCount <= 0) return 'out-of-stock';
    if (product.stockCount <= 5) return 'low-stock';
    return 'in-stock';
  };

  const getStockBadge = (product: Product) => {
    const status = getStockStatus(product);
    
    switch (status) {
      case 'inactive':
        return <Badge variant="secondary">Inactivo</Badge>;
      case 'out-of-stock':
        return <Badge variant="destructive">Sin Stock</Badge>;
      case 'low-stock':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Stock Bajo</Badge>;
      default:
        return <Badge className="bg-green-500 hover:bg-green-600">En Stock</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tu catálogo de productos
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-primary-600 hover:bg-primary-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Activos</p>
                <p className="text-2xl font-bold">
                  {products.filter(p => p.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-primary-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Destacados</p>
                <p className="text-2xl font-bold">
                  {products.filter(p => p.isFeatured).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Stock Bajo</p>
                <p className="text-2xl font-bold">
                  {products.filter(p => p.stockCount <= 5 && p.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre, marca, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
          <CardDescription>
            {products.length} productos en total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando productos...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay productos para mostrar
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            {product.brand} • SKU: {product.sku || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {product.category?.name || 'Sin categoría'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatPrice(product.price)}
                          </div>
                          {product.comparePrice && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(product.comparePrice)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{product.stockCount}</span>
                          {getStockBadge(product)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {product.isActive && (
                            <Badge className="bg-green-100 text-green-800">
                              Activo
                            </Badge>
                          )}
                          {product.isFeatured && (
                            <Badge className="bg-primary-100 text-primary-800">
                              Destacado
                            </Badge>
                          )}
                          {!product.isActive && (
                            <Badge variant="secondary">Inactivo</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {product.createdAt ? formatDate(product.createdAt) : 'Recién creado'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link href={`/admin/products/${product.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}