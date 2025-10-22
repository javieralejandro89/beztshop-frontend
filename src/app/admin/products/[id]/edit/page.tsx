// src/app/admin/products/[id]/edit/page.tsx - Editar producto CON IMÁGENES - Dark Tech Theme
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
import ImageUpload from '@/components/ImageUpload';
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
  tags: z.array(z.string()).optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<any[]>([]);
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
      setProductImages(response.images || []);
      
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
        images: productImages,
        comparePrice: data.comparePrice || undefined,
        shortDesc: data.shortDesc || undefined,
        brand: data.brand || undefined,
        model: data.model || undefined,
        sku: data.sku || undefined,
        metaTitle: data.metaTitle || undefined,
        metaDesc: data.metaDesc || undefined,
      };

      await productsApi.updateProduct(product.id, productData);
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
          <h1 className="text-3xl font-bold text-white">Editar Producto</h1>
          <p className="text-gray-400 mt-1">
            Modifica la información de: {product.name}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Básica */}
          <div className="lg:col-span-2">
            <Card className="bg-[#1F1F1F] border-[#FFD700]/20">
              <CardHeader>
                <CardTitle className="text-white">Información Básica</CardTitle>
                <CardDescription className="text-gray-400">
                  Detalles principales del producto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white">Nombre del Producto *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Ej: iPhone 15 Pro Max"
                    className="bg-[#0D0D0D] border-[#FFD700]/30 text-white placeholder:text-gray-500"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-400 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description" className="text-white">Descripción *</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Descripción detallada del producto..."
                    rows={4}
                    className="bg-[#0D0D0D] border-[#FFD700]/30 text-white placeholder:text-gray-500"
                  />
                  {errors.description && (
                    <p className="text-sm text-red-400 mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="shortDesc" className="text-white">Descripción Corta</Label>
                  <Input
                    id="shortDesc"
                    {...register('shortDesc')}
                    placeholder="Resumen breve para listados"
                    className="bg-[#0D0D0D] border-[#FFD700]/30 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand" className="text-white">Marca</Label>
                    <Input
                      id="brand"
                      {...register('brand')}
                      placeholder="Ej: Apple, Samsung"
                      className="bg-[#0D0D0D] border-[#FFD700]/30 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model" className="text-white">Modelo</Label>
                    <Input
                      id="model"
                      {...register('model')}
                      placeholder="Ej: iPhone 15 Pro"
                      className="bg-[#0D0D0D] border-[#FFD700]/30 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>
                {/* NUEVO: Atributos opcionales para Mercado Libre */}
                                <div className="border-t border-gold/20 pt-4 mt-4">
                                  <h3 className="text-sm font-medium text-white mb-3">
                                    Atributos para Mercado Libre (Opcional)
                                  </h3>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="mlColor" className="text-gray-300">Color</Label>
                                      <Input
                                        id="mlColor"
                                        placeholder="Ej: Negro, Blanco, Azul"
                                        className="bg-[#0D0D0D] border-[#FFD700]/30 text-white placeholder:text-gray-500"
                                        onChange={(e) => {
                                          const currentTags = watch('tags') || [];
                                          setValue('tags', [...currentTags.filter((t: any) => !t.startsWith('ML_COLOR:')), `ML_COLOR:${e.target.value}`]);
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="mlCarrier" className="text-gray-300">Compañía (para celulares)</Label>
                                      <Select onValueChange={(value) => {
                                        const currentTags = watch('tags') || [];
                                        setValue('tags', [...currentTags.filter((t: any) => !t.startsWith('ML_CARRIER:')), `ML_CARRIER:${value}`]);
                                      }}>
                                        <SelectTrigger className="bg-[#0D0D0D] border-[#FFD700]/30 text-white">
                                          <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1F1F1F] border-[#FFD700]/30">
                                          <SelectItem value="Desbloqueado" className="text-white">Desbloqueado</SelectItem>
                                          <SelectItem value="Telcel" className="text-white">Telcel</SelectItem>
                                          <SelectItem value="Movistar" className="text-white">Movistar</SelectItem>
                                          <SelectItem value="AT&T" className="text-white">AT&T</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuración */}
          <div>
            <Card className="bg-[#1F1F1F] border-[#FFD700]/20">
              <CardHeader>
                <CardTitle className="text-white">Configuración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="categoryId" className="text-white">Categoría *</Label>
                  <Select 
                    value={watch('categoryId')} 
                    onValueChange={(value) => setValue('categoryId', value)}
                  >
                    <SelectTrigger className="bg-[#0D0D0D] border-[#FFD700]/30 text-white">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F1F1F] border-[#FFD700]/30">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="text-white hover:bg-[#FFD700]/20">
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-sm text-red-400 mt-1">{errors.categoryId.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="stockType" className="text-white">Tipo de Stock</Label>
                  <Select 
                    value={watch('stockType')} 
                    onValueChange={(value) => setValue('stockType', value as 'PHYSICAL' | 'DROPSHIPPING' | 'BOTH')}
                  >
                    <SelectTrigger className="bg-[#0D0D0D] border-[#FFD700]/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F1F1F] border-[#FFD700]/30">
                      <SelectItem value="PHYSICAL" className="text-white hover:bg-[#FFD700]/20">Físico</SelectItem>
                      <SelectItem value="DROPSHIPPING" className="text-white hover:bg-[#FFD700]/20">Dropshipping</SelectItem>
                      <SelectItem value="BOTH" className="text-white hover:bg-[#FFD700]/20">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      checked={watch('isActive')}
                      onCheckedChange={(checked) => setValue('isActive', !!checked)}
                      className="border-[#FFD700]/30 data-[state=checked]:bg-[#FFD700] data-[state=checked]:text-[#0D0D0D]"
                    />
                    <Label htmlFor="isActive" className="text-white">Producto Activo</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isFeatured"
                      checked={watch('isFeatured')}
                      onCheckedChange={(checked) => setValue('isFeatured', !!checked)}
                      className="border-[#FFD700]/30 data-[state=checked]:bg-[#FFD700] data-[state=checked]:text-[#0D0D0D]"
                    />
                    <Label htmlFor="isFeatured" className="text-white">Producto Destacado</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isDigital"
                      checked={watch('isDigital')}
                      onCheckedChange={(checked) => setValue('isDigital', !!checked)}
                      className="border-[#FFD700]/30 data-[state=checked]:bg-[#FFD700] data-[state=checked]:text-[#0D0D0D]"
                    />
                    <Label htmlFor="isDigital" className="text-white">Producto Digital</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Imágenes del Producto */}
        <Card className="bg-[#1F1F1F] border-[#FFD700]/20">
          <CardHeader>
            <CardTitle className="text-white">Imágenes del Producto</CardTitle>
            <CardDescription className="text-gray-400">
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
        <Card className="bg-[#1F1F1F] border-[#FFD700]/20">
          <CardHeader>
            <CardTitle className="text-white">Precios e Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="price" className="text-white">Precio *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0.00"
                  className="bg-[#0D0D0D] border-[#FFD700]/30 text-white placeholder:text-gray-500"
                />
                {errors.price && (
                  <p className="text-sm text-red-400 mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="comparePrice" className="text-white">Precio de Comparación</Label>
                <Input
                  id="comparePrice"
                  type="number"
                  step="0.01"
                  {...register('comparePrice', { valueAsNumber: true })}
                  placeholder="0.00"
                  className="bg-[#0D0D0D] border-[#FFD700]/30 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <Label htmlFor="stockCount" className="text-white">Stock</Label>
                <Input
                  id="stockCount"
                  type="number"
                  {...register('stockCount', { valueAsNumber: true })}
                  placeholder="0"
                  className="bg-[#0D0D0D] border-[#FFD700]/30 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <Label htmlFor="lowStockThreshold" className="text-white">Alerta Stock Bajo</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  {...register('lowStockThreshold', { valueAsNumber: true })}
                  placeholder="5"
                  className="bg-[#0D0D0D] border-[#FFD700]/30 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información Adicional */}
        <Card className="bg-[#1F1F1F] border-[#FFD700]/20">
          <CardHeader>
            <CardTitle className="text-white">Información Adicional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sku" className="text-white">SKU</Label>
                <Input
                  id="sku"
                  {...register('sku')}
                  placeholder="Código único del producto"
                  className="bg-[#0D0D0D] border-[#FFD700]/30 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <Label htmlFor="metaTitle" className="text-white">Meta Título (SEO)</Label>
                <Input
                  id="metaTitle"
                  {...register('metaTitle')}
                  placeholder="Título para motores de búsqueda"
                  className="bg-[#0D0D0D] border-[#FFD700]/30 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="metaDesc" className="text-white">Meta Descripción (SEO)</Label>
                <Textarea
                  id="metaDesc"
                  {...register('metaDesc')}
                  placeholder="Descripción para motores de búsqueda (máx. 160 caracteres)"
                  rows={2}
                  className="bg-[#0D0D0D] border-[#FFD700]/30 text-white placeholder:text-gray-500"
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
            className="bg-[#FFD700] hover:bg-[#00C8FF] text-[#0D0D0D] font-semibold transition-all duration-300"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Guardando...' : 'Actualizar Producto'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="bg-[#1F1F1F] border-[#FFD700]/30 text-white hover:bg-[#FFD700] hover:text-[#0D0D0D]"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}