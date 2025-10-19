'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { mercadolibreApi } from '@/lib/mercadolibreApi';
import { productsApi } from '@/lib/api';
import { CheckCircle, XCircle, ExternalLink, RefreshCw, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function MercadoLibreIntegrationPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [mlUser, setMlUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [publishedProducts, setPublishedProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    checkAuth();
    loadProducts();
    loadPublishedProducts();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await mercadolibreApi.checkAuth();
      setIsAuthorized(response.isAuthorized);
      if (response.user) {
        setMlUser(response.user);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      toast.error('Error al verificar autorización');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      console.log('🔍 Cargando productos...');
      const response = await productsApi.getProductsAdmin({ limit: 100 });
      
      // ✅ CORRECCIÓN: El backend devuelve { products: [...] }
      const productsList = response.products || [];
      console.log('📦 Productos cargados:', productsList.length);
      
      setProducts(productsList);
      
      if (productsList.length === 0) {
        toast.info('No hay productos disponibles. Crea productos primero.');
      }
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar productos');
    }
  };

  const loadPublishedProducts = async () => {
    try {
      console.log('🔍 Cargando productos publicados en ML...');
      const response = await mercadolibreApi.getPublishedProducts();
      const publishedList = response.data || [];
      console.log('✅ Productos publicados en ML:', publishedList.length);
      
      setPublishedProducts(publishedList);
    } catch (error: any) {
      console.error('Error loading published products:', error);
      toast.error('Error al cargar productos publicados');
    }
  };

  const handleAuthorize = async () => {
    try {
      const response = await mercadolibreApi.getAuthUrl();
      window.open(response.authUrl, '_blank');
      toast.info('Completa la autorización en la ventana que se abrió');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al obtener URL de autorización');
    }
  };

  const handlePublishSelected = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Selecciona al menos un producto');
      return;
    }

    try {
      setIsPublishing(true);
      console.log('📤 Publicando productos:', selectedProducts);
      
      const toastId = toast.loading(`Publicando ${selectedProducts.length} producto(s)...`);
      
      const response = await mercadolibreApi.publishMultipleProducts(selectedProducts);
      
      toast.dismiss(toastId);
      
      console.log('✅ Respuesta de publicación:', response);
      
      if (response.results && response.results.length > 0) {
        toast.success(`✅ ${response.results.length} producto(s) publicado(s) exitosamente`);
      }
      
      if (response.errors && response.errors.length > 0) {
        toast.warning(`⚠️ ${response.errors.length} producto(s) con errores`);
        console.error('Errores en publicación:', response.errors);
      }

      setSelectedProducts([]);
      await loadPublishedProducts();
    } catch (error: any) {
      console.error('❌ Error publicando productos:', error);
      toast.error(error.response?.data?.error || 'Error al publicar productos');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSync = async (productId: string) => {
    try {
      toast.loading('Sincronizando producto...');
      await mercadolibreApi.syncProduct(productId);
      toast.dismiss();
      toast.success('✅ Producto sincronizado');
      await loadPublishedProducts();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.error || 'Error al sincronizar');
    }
  };

  const handleToggleStatus = async (mlItemId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    try {
      toast.loading(`${newStatus === 'active' ? 'Activando' : 'Pausando'} producto...`);
      await mercadolibreApi.updateStatus(mlItemId, newStatus);
      toast.dismiss();
      toast.success(`✅ Producto ${newStatus === 'active' ? 'activado' : 'pausado'}`);
      await loadPublishedProducts();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.error || 'Error al cambiar estado');
    }
  };

  const handleSelectAll = () => {
    const availableProducts = products.filter(
      p => !publishedProducts.find(pp => pp.productId === p.id)
    );
    
    if (selectedProducts.length === availableProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(availableProducts.map(p => p.id));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-darkbg">
        <span className="text-white">Cargando...</span>
      </div>
    );
  }

  // Productos disponibles para publicar
  const availableProducts = products.filter(
    p => !publishedProducts.find(pp => pp.productId === p.id)
  );

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-gold to-cyan bg-clip-text text-transparent">
        Integración con Mercado Libre
      </h1>

      {/* Estado de Autorización */}
      <Card className="mb-8 bg-darkbg-light border-gold/20">
        <CardHeader>
          <CardTitle className="text-white">Estado de Conexión</CardTitle>
          <CardDescription className="text-gray-400">
            Conecta tu cuenta de Mercado Libre para sincronizar productos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAuthorized ? (
            <div className="flex items-center gap-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
              <div>
                <p className="font-semibold text-white">Conectado como: {mlUser?.nickname}</p>
                <p className="text-sm text-gray-400">{mlUser?.email}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <XCircle className="h-8 w-8 text-red-400" />
                <p className="text-white">No conectado a Mercado Libre</p>
              </div>
              <Button 
                onClick={handleAuthorize} 
                className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-bold shadow-glow-gold"
              >
                Conectar con Mercado Libre
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isAuthorized && (
        <>
          {/* Publicar Productos */}
          <Card className="mb-8 bg-darkbg-light border-gold/20">
            <CardHeader>
              <CardTitle className="text-white">Publicar Nuevos Productos</CardTitle>
              <CardDescription className="text-gray-400">
                Selecciona los productos que deseas publicar en Mercado Libre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Botones de acción */}
                <div className="flex gap-4 mb-4 items-center">
                  <Button
                    onClick={handlePublishSelected}
                    disabled={selectedProducts.length === 0 || isPublishing}
                    className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-bold shadow-glow-gold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isPublishing 
                      ? 'Publicando...' 
                      : `Publicar Seleccionados (${selectedProducts.length})`
                    }
                  </Button>

                  {availableProducts.length > 0 && (
                    <Button
                      onClick={handleSelectAll}
                      variant="outline"
                      className="border-gold/30 text-gold hover:bg-gold/10 hover:border-gold"
                    >
                      {selectedProducts.length === availableProducts.length 
                        ? 'Deseleccionar Todo' 
                        : 'Seleccionar Todo'
                      }
                    </Button>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-400 ml-auto">
                    <AlertCircle className="h-4 w-4" />
                    <span>{availableProducts.length} producto(s) disponible(s)</span>
                  </div>
                </div>

                {/* Lista de productos */}
                {availableProducts.length === 0 ? (
                  <div className="text-center py-12 border border-gold/20 rounded bg-darkbg">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-white text-lg mb-2">No hay productos disponibles para publicar</p>
                    <p className="text-gray-400 text-sm mb-4">
                      {products.length === 0 
                        ? 'Crea productos primero en la sección de Productos'
                        : 'Todos tus productos ya están publicados en Mercado Libre'
                      }
                    </p>
                    {products.length === 0 && (
                      <Button 
                        onClick={() => window.location.href = '/admin/products/new'}
                        className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-bold"
                      >
                        Crear Producto
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableProducts.map((product) => (
                      <div 
                        key={product.id} 
                        className="flex items-center gap-4 p-4 border border-gold/20 rounded bg-darkbg hover:border-gold/40 transition-colors cursor-pointer"
                        onClick={() => {
                          if (selectedProducts.includes(product.id)) {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                          } else {
                            setSelectedProducts([...selectedProducts, product.id]);
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => e.stopPropagation()}
                          className="w-4 h-4 accent-gold cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-white">{product.name}</p>
                          <div className="flex gap-2 items-center mt-1">
                            <p className="text-sm text-gray-400">${product.price}</p>
                            {product.brand && (
                              <Badge variant="outline" className="bg-darkbg border-cyan/30 text-cyan text-xs">
                                {product.brand}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-gold/20 text-gold border-gold/30">
                          {product.stockCount} en stock
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Productos Publicados */}
          <Card className="bg-darkbg-light border-gold/20">
            <CardHeader>
              <CardTitle className="text-white">
                Productos Publicados en Mercado Libre ({publishedProducts.length})
              </CardTitle>
              <CardDescription className="text-gray-400">
                Gestiona tus productos activos en Mercado Libre
              </CardDescription>
            </CardHeader>
            <CardContent>
              {publishedProducts.length === 0 ? (
                <div className="text-center py-12 border border-gold/20 rounded bg-darkbg">
                  <p className="text-gray-400">No hay productos publicados aún</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {publishedProducts.map((mlProduct) => (
                    <div 
                      key={mlProduct.id} 
                      className="flex items-center gap-4 p-4 border border-gold/20 rounded bg-darkbg hover:border-gold/40 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-white">{mlProduct.product.name}</p>
                        <p className="text-sm text-gray-400">ML ID: {mlProduct.mlItemId}</p>
                        {mlProduct.permalink && (
                          <a
                            href={mlProduct.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan text-sm flex items-center gap-1 hover:text-gold transition-colors mt-1"
                          >
                            Ver en Mercado Libre <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      
                      <Badge 
                        variant={mlProduct.status === 'active' ? 'default' : 'secondary'} 
                        className={
                          mlProduct.status === 'active' 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                            : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }
                      >
                        {mlProduct.status === 'active' ? 'Activo' : 'Pausado'}
                      </Badge>

                      <div className="flex gap-2 items-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSync(mlProduct.productId)}
                          className="border-gold/30 text-gold hover:bg-gold/10 hover:border-gold"
                          title="Sincronizar precio y stock"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {mlProduct.status === 'active' ? 'Pausar' : 'Activar'}
                          </span>
                          <Switch
                            checked={mlProduct.status === 'active'}
                            onCheckedChange={() => handleToggleStatus(mlProduct.mlItemId, mlProduct.status)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}