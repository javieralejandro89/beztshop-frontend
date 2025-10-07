// src/app/admin/products/[id]/edit/page.tsx - Editar producto CON IMÁGENES
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { useAdminStore } from '@/lib/adminStore';
import ImageUpload from '@/components/ImageUpload'; // ← AGREGADO
import type { Category, Product } from '@/types';

const productSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  description: z.string().min(10, 'Descripción debe tener al menos 10 caracteres'),
  shortDesc: z.string().optional(),
  price: z.number().positive('Precio debe ser mayor a 0'),
  comparePrice: z.number().optional(),
  categoryId: z.string().min(1, 'Categoría es requerida'),
  brand: z.string().optional(),
  model: z.string().optional(),
  sku: z.string().optional(),
  stockType: z.enum(['PHYSICAL', 'DROPSHIPPING', 'BOTH']),
  stockCount: z.number().int().min(0, 'Stock no puede ser negativo'),
  lowStockThreshold: z.number().int().min(0, 'Umbral debe ser positivo'),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  isDigital: z.boolean(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<any[]>([]); // ← AGREGADO
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { updateProduct } = useAdminStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (productId) {
      loadProductData();
      loadCategories();
    }
  }, [productId]);

  const loadProductData = async () => {
    try {
      setIsLoadingData(true);
      setError(null);
      
      const response = await productsApi.getProductById(productId);
      setProduct(response);
      setProductImages(response.images || []); // ← AGREGADO
      
      // Pre-llenar el formulario con los datos del producto
      reset({
        name: response.name,
        description: response.description,
        shortDesc: response.shortDesc || '',
        price: response.price,
        comparePrice: response.comparePrice || undefined,
        categoryId: response.categoryId,
        brand: response.brand || '',
        model: response.model || '',
        sku: response.sku || '',
        stockType: response.stockType,
        stockCount: response.stockCount,
        lowStockThreshold: response.lowStockThreshold || 5,
        isActive: response.isActive,
        isFeatured: response.isFeatured,
        isDigital: response.isDigital || false,
        metaTitle: response.metaTitle || '',
        metaDesc: response.metaDesc || '',
      });
      
    } catch (err: any) {
      console.error('Error loading product:', err);
      if (err.response?.status === 404) {
        setError('Producto no encontrado');
      } else {
        setError(err.response?.data?.error || 'Error al cargar producto');
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await productsApi.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const onSubmit = async (data: ProductForm) => {
    if (!product) return;
    
    try {
      setIsLoading(true);

      const productData = {
        ...data,
        images: productImages, // ← AGREGADO
        comparePrice: data.comparePrice || undefined,
        shortDesc: data.shortDesc || undefined,
        brand: data.brand || undefined,
        model: data.model || undefined,
        sku: data.sku || undefined,
        metaTitle: data.metaTitle || undefined,
        metaDesc: data.metaDesc || undefined,
      };

      await productsApi.updateProduct(product.id, productData);
      
      // Actualizar en el store local
      updateProduct(product.id, data);

      alert('Producto actualizado exitosamente');
      router.push('/admin/products');
    } catch (err: any) {
      console.error('Error updating product:', err);
      if (err.response?.status === 409) {
        alert(err.response.data.error);
      } else {
        alert(err.response?.data?.error || 'Error al actualizar producto');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
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
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
          <p className="text-gray-600 mt-1">
            Modifica la información de: {product.name}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Básica */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
                <CardDescription>
                  Detalles principales del producto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre del Producto *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Ej: iPhone 15 Pro Max"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Descripción detallada del producto..."
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="shortDesc">Descripción Corta</Label>
                  <Input
                    id="shortDesc"
                    {...register('shortDesc')}
                    placeholder="Resumen breve para listados"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Marca</Label>
                    <Input
                      id="brand"
                      {...register('brand')}
                      placeholder="Ej: Apple, Samsung"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Modelo</Label>
                    <Input
                      id="model"
                      {...register('model')}
                      placeholder="Ej: iPhone 15 Pro"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuración */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="categoryId">Categoría *</Label>
                  <Select 
                    value={watch('categoryId')} 
                    onValueChange={(value) => setValue('categoryId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-sm text-red-500 mt-1">{errors.categoryId.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="stockType">Tipo de Stock</Label>
                  <Select 
                    value={watch('stockType')} 
                    onValueChange={(value) => setValue('stockType', value as 'PHYSICAL' | 'DROPSHIPPING' | 'BOTH')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PHYSICAL">Físico</SelectItem>
                      <SelectItem value="DROPSHIPPING">Dropshipping</SelectItem>
                      <SelectItem value="BOTH">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      checked={watch('isActive')}
                      onCheckedChange={(checked) => setValue('isActive', !!checked)}
                    />
                    <Label htmlFor="isActive">Producto Activo</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isFeatured"
                      checked={watch('isFeatured')}
                      onCheckedChange={(checked) => setValue('isFeatured', !!checked)}
                    />
                    <Label htmlFor="isFeatured">Producto Destacado</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isDigital"
                      checked={watch('isDigital')}
                      onCheckedChange={(checked) => setValue('isDigital', !!checked)}
                    />
                    <Label htmlFor="isDigital">Producto Digital</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ← NUEVA SECCIÓN: Imágenes del Producto */}
        <Card>
          <CardHeader>
            <CardTitle>Imágenes del Producto</CardTitle>
            <CardDescription>
              Sube hasta 5 imágenes del producto. La primera será la imagen principal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload 
              images={productImages}
              onImagesChange={setProductImages}
              maxImages={5}
              disabled={isLoading}
            />
          </CardContent>
        </Card>

        {/* Precios e Inventario */}
        <Card>
          <CardHeader>
            <CardTitle>Precios e Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="price">Precio *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="comparePrice">Precio de Comparación</Label>
                <Input
                  id="comparePrice"
                  type="number"
                  step="0.01"
                  {...register('comparePrice', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="stockCount">Stock</Label>
                <Input
                  id="stockCount"
                  type="number"
                  {...register('stockCount', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="lowStockThreshold">Alerta Stock Bajo</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  {...register('lowStockThreshold', { valueAsNumber: true })}
                  placeholder="5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información Adicional */}
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  {...register('sku')}
                  placeholder="Código único del producto"
                />
              </div>

              <div>
                <Label htmlFor="metaTitle">Meta Título (SEO)</Label>
                <Input
                  id="metaTitle"
                  {...register('metaTitle')}
                  placeholder="Título para motores de búsqueda"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="metaDesc">Meta Descripción (SEO)</Label>
                <Textarea
                  id="metaDesc"
                  {...register('metaDesc')}
                  placeholder="Descripción para motores de búsqueda (máx. 160 caracteres)"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Guardando...' : 'Actualizar Producto'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}