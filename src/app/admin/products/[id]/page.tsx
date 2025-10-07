// src/app/admin/products/[id]/page.tsx - Ver producto individual
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Product } from '@/types';

export default function ViewProductPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Obtener producto por ID (necesitarás agregar esta función al API)
      const response = await productsApi.getProductById(productId);
      setProduct(response);
    } catch (err: any) {
      console.error('Error loading product:', err);
      if (err.response?.status === 404) {
        setError('Producto no encontrado');
      } else {
        setError(err.response?.data?.error || 'Error al cargar producto');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!product) return;
    
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      await productsApi.deleteProduct(product.id);
      alert('Producto eliminado exitosamente');
      router.push('/admin/products');
    } catch (err: any) {
      console.error('Error deleting product:', err);
      alert(err.response?.data?.error || 'Error al eliminar producto');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg">Cargando producto...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-red-600 text-lg font-medium">{error}</div>
              <Button 
                onClick={() => router.push('/admin/products')} 
                className="mt-4"
              >
                Volver a Productos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 mt-1">Detalles del producto</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/products/${product.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDeleteProduct}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre</label>
                <p className="text-lg font-medium">{product.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Descripción</label>
                <p className="text-gray-700">{product.description}</p>
              </div>
              
              {product.shortDesc && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Descripción Corta</label>
                  <p className="text-gray-700">{product.shortDesc}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {product.brand && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Marca</label>
                    <p>{product.brand}</p>
                  </div>
                )}
                {product.model && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Modelo</label>
                    <p>{product.model}</p>
                  </div>
                )}
              </div>

              {product.sku && (
                <div>
                  <label className="text-sm font-medium text-gray-500">SKU</label>
                  <p className="font-mono">{product.sku}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Precios */}
          <Card>
            <CardHeader>
              <CardTitle>Precios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Precio</label>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(product.price)}
                  </p>
                </div>
                {product.comparePrice && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Precio de Comparación</label>
                    <p className="text-xl text-gray-500 line-through">
                      {formatPrice(product.comparePrice)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Estado */}
          <Card>
            <CardHeader>
              <CardTitle>Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estado</span>
                <Badge variant={product.isActive ? "default" : "secondary"}>
                  {product.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Destacado</span>
                <Badge variant={product.isFeatured ? "default" : "outline"}>
                  {product.isFeatured ? 'Destacado' : 'Normal'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Categoría</span>
                <Badge variant="outline">
                  {product.category?.name || 'Sin categoría'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Inventario */}
          <Card>
            <CardHeader>
              <CardTitle>Inventario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Stock Actual</span>
                <span className="font-medium">{product.stockCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tipo de Stock</span>
                <Badge variant="outline">{product.stockType}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Umbral Bajo</span>
                <span className="text-sm">{product.lowStockThreshold || 5}</span>
              </div>
            </CardContent>
          </Card>

          {/* Información del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Creado</label>
                <p className="text-sm">{formatDate(product.createdAt)}</p>
              </div>
              
              {product.updatedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Actualizado</label>
                  <p className="text-sm">{formatDate(product.updatedAt)}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">ID</label>
                <p className="text-xs font-mono text-gray-500">{product.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}