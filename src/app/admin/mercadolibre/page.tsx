'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { mercadolibreApi } from '@/lib/mercadolibreApi';
import { productsApi } from '@/lib/api';
import { CheckCircle, XCircle, ExternalLink, RefreshCw, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function MercadoLibreIntegrationPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [mlUser, setMlUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [publishedProducts, setPublishedProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

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
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productsApi.getProductsAdmin({ limit: 100 });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadPublishedProducts = async () => {
    try {
      const response = await mercadolibreApi.getPublishedProducts();
      setPublishedProducts(response.data || []);
    } catch (error) {
      console.error('Error loading published products:', error);
    }
  };

  const handleAuthorize = async () => {
    try {
      const response = await mercadolibreApi.getAuthUrl();
      window.open(response.authUrl, '_blank');
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
      toast.loading('Publicando productos...');
      const response = await mercadolibreApi.publishMultipleProducts(selectedProducts);
      
      toast.dismiss();
      toast.success(`${response.results.length} productos publicados`);
      
      if (response.errors.length > 0) {
        toast.warning(`${response.errors.length} productos con errores`);
      }

      setSelectedProducts([]);
      loadPublishedProducts();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.error || 'Error al publicar productos');
    }
  };

  const handleSync = async (productId: string) => {
    try {
      await mercadolibreApi.syncProduct(productId);
      toast.success('Producto sincronizado');
      loadPublishedProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al sincronizar');
    }
  };

  const handleToggleStatus = async (mlItemId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    try {
      await mercadolibreApi.updateStatus(mlItemId, newStatus);
      toast.success(`Producto ${newStatus === 'active' ? 'activado' : 'pausado'}`);
      loadPublishedProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al cambiar estado');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-darkbg"><span className="text-white">Cargando...</span></div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-gold to-cyan bg-clip-text text-transparent">Integración con Mercado Libre</h1>

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
              <Button onClick={handleAuthorize} className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-bold shadow-glow-gold">
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
                <div className="flex gap-4 mb-4">
                  <Button
                    onClick={handlePublishSelected}
                    disabled={selectedProducts.length === 0}
                    className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-bold shadow-glow-gold disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Publicar Seleccionados ({selectedProducts.length})
                  </Button>
                </div>

                <div className="space-y-2">
                  {products
                    .filter(p => !publishedProducts.find(pp => pp.productId === p.id))
                    .map((product) => (
                      <div key={product.id} className="flex items-center gap-4 p-4 border border-gold/20 rounded bg-darkbg hover:border-gold/40 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts([...selectedProducts, product.id]);
                            } else {
                              setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                            }
                          }}
                          className="w-4 h-4 accent-gold"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-white">{product.name}</p>
                          <p className="text-sm text-gray-400">${product.price}</p>
                        </div>
                        <Badge className="bg-gold/20 text-gold border-gold/30">{product.stockCount} en stock</Badge>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Productos Publicados */}
          <Card className="bg-darkbg-light border-gold/20">
            <CardHeader>
              <CardTitle className="text-white">Productos Publicados en Mercado Libre</CardTitle>
              <CardDescription className="text-gray-400">
                Gestiona tus productos activos en Mercado Libre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {publishedProducts.map((mlProduct) => (
                  <div key={mlProduct.id} className="flex items-center gap-4 p-4 border border-gold/20 rounded bg-darkbg hover:border-gold/40 transition-colors">
                    <div className="flex-1">
                      <p className="font-semibold text-white">{mlProduct.product.name}</p>
                      <p className="text-sm text-gray-400">
                        ML ID: {mlProduct.mlItemId}
                      </p>
                      {mlProduct.permalink && (
                        <a
                          href={mlProduct.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan text-sm flex items-center gap-1 hover:text-gold transition-colors"
                        >
                          Ver en ML <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    
                    <Badge variant={mlProduct.status === 'active' ? 'default' : 'secondary'} className={mlProduct.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
                      {mlProduct.status}
                    </Badge>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSync(mlProduct.productId)}
                        className="border-gold/30 text-gold hover:bg-gold/10 hover:border-gold"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>

                      <Switch
                        checked={mlProduct.status === 'active'}
                        onCheckedChange={() => handleToggleStatus(mlProduct.mlItemId, mlProduct.status)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}