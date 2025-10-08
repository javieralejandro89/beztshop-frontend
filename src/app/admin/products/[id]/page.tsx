// src/app/admin/products/[id]/page.tsx - Ver producto individual - Dark Tech Theme
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
      <div className="flex items-center justify-center min-h-screen bg-[#0D0D0D]">
        <div className="text-center">
          <div className="text-lg text-white">Cargando producto...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 bg-[#0D0D0D] min-h-screen p-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="bg-[#1F1F1F] border-[#FFD700]/30 text-white hover:bg-[#FFD700] hover:text-[#0D0D0D]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        
        <Card className="bg-[#1F1F1F] border-[#FFD700]/20">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-red-400 text-lg font-medium">{error}</div>
              <Button 
                onClick={() => router.push('/admin/products')} 
                className="mt-4 bg-[#FFD700] hover:bg-[#00C8FF] text-[#0D0D0D]"
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
    <div className="space-y-6 bg-[#0D0D0D] min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="bg-[#1F1F1F] border-[#FFD700]/30 text-white hover:bg-[#FFD700] hover:text-[#0D0D0D]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">{product.name}</h1>
            <p className="text-gray-400 mt-1">Detalles del producto</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            asChild
            className="bg-[#1F1F1F] border-[#FFD700]/30 text-white hover:bg-[#FFD700] hover:text-[#0D0D0D]"
          >
            <Link href={`/admin/products/${product.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDeleteProduct}
            className="bg-[#1F1F1F] border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white"
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
          <Card className="bg-[#1F1F1F] border-[#FFD700]/20">
            <CardHeader>
              <CardTitle className="text-white">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400">Nombre</label>
                <p className="text-lg font-medium text-white">{product.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-400">Descripción</label>
                <p className="text-gray-300">{product.description}</p>
              </div>
              
              {product.shortDesc && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Descripción Corta</label>
                  <p className="text-gray-300">{product.shortDesc}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {product.brand && (
                  <div>
                    <label className="text-sm font-medium text-gray-400">Marca</label>
                    <p className="text-white">{product.brand}</p>
                  </div>
                )}
                {product.model && (
                  <div>
                    <label className="text-sm font-medium text-gray-400">Modelo</label>
                    <p className="text-white">{product.model}</p>
                  </div>
                )}
              </div>

              {product.sku && (
                <div>
                  <label className="text-sm font-medium text-gray-400">SKU</label>
                  <p className="font-mono text-white">{product.sku}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Precios */}
          <Card className="bg-[#1F1F1F] border-[#FFD700]/20">
            <CardHeader>
              <CardTitle className="text-white">Precios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Precio</label>
                  <p className="text-2xl font-bold text-green-400">
                    {formatPrice(product.price)}
                  </p>
                </div>
                {product.comparePrice && (
                  <div>
                    <label className="text-sm font-medium text-gray-400">Precio de Comparación</label>
                    <p className="text-xl text-gray-400 line-through">
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
          <Card className="bg-[#1F1F1F] border-[#FFD700]/20">
            <CardHeader>
              <CardTitle className="text-white">Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Estado</span>
                <Badge 
                  variant={product.isActive ? "default" : "secondary"}
                  className={product.isActive ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}
                >
                  {product.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Destacado</span>
                <Badge 
                  variant={product.isFeatured ? "default" : "outline"}
                  className={product.isFeatured ? "bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30" : "bg-[#0D0D0D] border-[#FFD700]/30 text-gray-400"}
                >
                  {product.isFeatured ? 'Destacado' : 'Normal'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Categoría</span>
                <Badge variant="outline" className="bg-[#0D0D0D] border-[#FFD700]/30 text-gray-300">
                  {product.category?.name || 'Sin categoría'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Inventario */}
          <Card className="bg-[#1F1F1F] border-[#FFD700]/20">
            <CardHeader>
              <CardTitle className="text-white">Inventario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Stock Actual</span>
                <span className="font-medium text-white">{product.stockCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Tipo de Stock</span>
                <Badge variant="outline" className="bg-[#0D0D0D] border-[#FFD700]/30 text-gray-300">
                  {product.stockType}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Umbral Bajo</span>
                <span className="text-sm text-white">{product.lowStockThreshold || 5}</span>
              </div>
            </CardContent>
          </Card>

          {/* Información del Sistema */}
          <Card className="bg-[#1F1F1F] border-[#FFD700]/20">
            <CardHeader>
              <CardTitle className="text-white">Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-400">Creado</label>
                <p className="text-sm text-white">{formatDate(product.createdAt)}</p>
              </div>
              
              {product.updatedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Actualizado</label>
                  <p className="text-sm text-white">{formatDate(product.updatedAt)}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-400">ID</label>
                <p className="text-xs font-mono text-gray-400">{product.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}