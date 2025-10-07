// src/components/payments/SquarePaymentForm.tsx - Basado en tu versión que funcionaba
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard as CreditCardIcon, 
  Shield, 
  Loader2, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';

// Interfaces
export interface SquarePaymentData {
  orderId: string;
  amount: number;
  currency: string;
  buyerEmail?: string;
  orderData?: any; 
  billingAddress?: {
    addressLine1?: string;
    addressLine2?: string;
    locality?: string;
    administrativeDistrictLevel1?: string;
    postalCode?: string;
    country?: string;
  };
  shippingAddress?: {
    addressLine1?: string;
    addressLine2?: string;
    locality?: string;
    administrativeDistrictLevel1?: string;
    postalCode?: string;
    country?: string;
  };
}

interface SquareConfig {
  applicationId: string;
  locationId: string;
  environment: string;
  sandbox: boolean;
}

interface SquarePaymentFormProps {
  paymentData: SquarePaymentData;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

// Declarar tipos globales para Square
declare global {
  interface Window {
    Square?: any;
  }
}

const SquarePaymentForm: React.FC<SquarePaymentFormProps> = ({
  paymentData,
  onSuccess,
  onError,
  disabled = false,
  className = ''
}) => {
  const [config, setConfig] = useState<SquareConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [squareLoaded, setSquareLoaded] = useState(false);
  const [card, setCard] = useState<any>(null);
  
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true); // Para evitar memory leaks
  const { success, error } = useToast();

  // Cargar Square SDK script
  useEffect(() => {
    mountedRef.current = true;
    loadSquareScript();
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Inicializar Square cuando SDK esté cargado y config disponible
  useEffect(() => {
  if (squareLoaded && config && mountedRef.current) {
    // ✅ AUMENTAR el delay
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        initializeSquare();
      }
    }, 1000); // Cambiar de 800ms a 1000ms o más
    
    return () => clearTimeout(timer);
  }
}, [squareLoaded, config]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (card) {
        try {
          card.destroy();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [card]);

  const loadSquareScript = () => {
  // Si Square ya está cargado
  if (window.Square) {
    setSquareLoaded(true);
    loadSquareConfig(); // QUITAR setTimeout aquí
    return;
  }

  // Verificar si script ya existe
  const existingScript = document.querySelector('script[src*="square.js"]');
  if (existingScript) {
    existingScript.addEventListener('load', () => {
      if (mountedRef.current) {
        setSquareLoaded(true);
        loadSquareConfig(); // QUITAR setTimeout aquí
      }
    });
    return;
  }

  // ✅ CONFIGURACIÓN CORREGIDA PARA PRODUCCIÓN
    const script = document.createElement('script');
    
    // Determinar el entorno basado en SQUARE_ENV o URL actual
    const isSquareProduction = process.env.NEXT_PUBLIC_SQUARE_ENV === 'production' || 
                              window.location.hostname.includes('serviprogarcia.com');
    
    script.src = isSquareProduction 
      ? 'https://web.squarecdn.com/v1/square.js'           // ✅ PRODUCCIÓN
      : 'https://sandbox.web.squarecdn.com/v1/square.js'; // SANDBOX
    
    console.log(`🔧 Cargando Square SDK: ${isSquareProduction ? 'PRODUCCIÓN' : 'SANDBOX'}`);

  script.async = true;
  script.onload = () => {
    if (mountedRef.current) {
      setSquareLoaded(true);
      loadSquareConfig(); // QUITAR setTimeout aquí
    }
  };
  script.onerror = () => {
    if (mountedRef.current) {
      setConfigError('Error cargando Square SDK');
      setIsLoading(false);
    }
  };
  
  document.head.appendChild(script);
};

  const loadSquareConfig = async () => {
    if (!mountedRef.current) return;
    
    try {
      setIsLoading(true);
      setConfigError(null);
      
      const { data } = await api.get('/square/config');
      
      if (!data.applicationId) {
        throw new Error('Configuración de Square incompleta');
      }
      
      if (mountedRef.current) {
        setConfig(data);
        console.log('Square config loaded:', { 
          environment: data.environment, 
          isProduction: data.environment === 'production'
        });
      }
      
    } catch (err: any) {
      if (mountedRef.current) {
        const errorMessage = err.response?.data?.error || 'Error cargando configuración de pagos';
        setConfigError(errorMessage);
        console.error('Error loading Square config:', err);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const initializeSquare = async () => {
    if (!window.Square || !config || !mountedRef.current) return;

    try {
      console.log('Inicializando Square Payments...');
      
      // Crear payments instance
      const payments = window.Square.payments(config.applicationId, config.locationId);
      
      // Inicializar tarjeta de crédito - CORREGIR DUPLICACIÓN AQUÍ
      await initializeCreditCard(payments);
      
    } catch (err: any) {
      if (mountedRef.current) {
        console.error('Error inicializando Square:', err);
        setConfigError('Error inicializando sistema de pagos');
      }
    }
  };

  const initializeCreditCard = async (payments: any) => {
    if (!mountedRef.current || !cardContainerRef.current) {
      console.error('Contenedor o componente no disponible');
      return;
    }
    
    try {
      // IMPORTANTE: Limpiar instancia anterior si existe para evitar duplicación
      if (card) {
        try {
          await card.destroy();
          console.log('Tarjeta anterior destruida');
        } catch (e) {
          console.log('Error limpiando tarjeta anterior:', e);
        }
        setCard(null);
      }

      // IMPORTANTE: Limpiar contenedor completamente
      if (cardContainerRef.current) {
        cardContainerRef.current.innerHTML = '';
        console.log('Contenedor limpiado');        
        
      }

      // Esperar un poco más para asegurar que el DOM esté completamente listo
      await new Promise(resolve => setTimeout(resolve, 300));

if (!mountedRef.current || !cardContainerRef.current) {
  console.error('Contenedor no disponible para Square');
  return;
}

// Verificar que el contenedor esté en el DOM y visible
const containerRect = cardContainerRef.current.getBoundingClientRect();
if (containerRect.width === 0 || containerRect.height === 0) {
  console.error('Contenedor no es visible aún');
  return;
}

      const cardOptions = {
        style: {
          input: {
            fontSize: '16px',
            fontFamily: 'sans-serif',
            color: '#1F2937',
            backgroundColor: '#FFFFFF'
          },
          'input::placeholder': {
            color: '#9CA3AF'
          },
          '.message-text': {
            color: '#EF4444'
          },
          '.message-icon': {
            color: '#EF4444'
          }
        }
      };

      console.log('Creando nueva instancia de tarjeta...');
      const cardInstance = await payments.card(cardOptions);
      
      if (!mountedRef.current) return;
      
      console.log('Attachando tarjeta al contenedor...');
      console.log('Contenedor antes del attach:', cardContainerRef.current);
      
      await cardInstance.attach(cardContainerRef.current);
      
      // Verificar que el attach funcionó
      const attachedElements = cardContainerRef.current.querySelectorAll('iframe, div[data-sq-field]');
      console.log('Elementos attachados encontrados:', attachedElements.length);
      
      if (attachedElements.length === 0) {
        throw new Error('El formulario no se attachó correctamente - no se encontraron elementos');
      }
      
      if (mountedRef.current) {
        setCard(cardInstance);
        console.log('✅ Tarjeta inicializada correctamente');
        
        // Verificar el contenido final del contenedor
        setTimeout(() => {
          if (cardContainerRef.current) {
            console.log('Contenido del contenedor después del attach:', cardContainerRef.current.innerHTML.substring(0, 200));
          }
        }, 500);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        console.error('Error inicializando tarjeta:', err);
        setPaymentError('Error inicializando formulario de tarjeta');
      }
    }
  };

  const handleCardPayment = async () => {
    if (!card || isProcessing || !mountedRef.current) return;

    setIsProcessing(true);
    setPaymentError(null);

    try {
      console.log('Generando token de tarjeta...');
      
      // Tokenizar tarjeta
      const tokenResult = await card.tokenize();
      if (tokenResult.status === 'OK') {
        console.log('Token generado exitosamente');
        
        // Procesar pago en backend
        await processPayment(tokenResult.token);
      } else {
        // ✅ MANEJO MEJORADO DE ERRORES DE TOKENIZACIÓN
        console.error('❌ Error en tokenización:', tokenResult.errors);
        
        let tokenErrorMessage = 'Los datos de la tarjeta no son válidos.';
        
        if (tokenResult.errors && tokenResult.errors.length > 0) {
          const firstError = tokenResult.errors[0];
          const errorMessage = firstError.message?.toLowerCase() || '';
          
          if (errorMessage.includes('credit card number is not valid') || 
              errorMessage.includes('card number')) {
            tokenErrorMessage = config?.environment === 'sandbox' 
              ? 'Número de tarjeta no válido. En modo de prueba, usa: 4532 1234 5678 9012'
              : 'El número de tarjeta ingresado no es válido. Por favor verifica los datos.';
          } else if (errorMessage.includes('cvv') || errorMessage.includes('security code')) {
            tokenErrorMessage = 'Código de seguridad (CVV) inválido. Verifica los 3 dígitos en el reverso de tu tarjeta.';
          } else if (errorMessage.includes('expir')) {
            tokenErrorMessage = 'Fecha de vencimiento inválida. Verifica que tu tarjeta no esté vencida.';
          } else if (errorMessage.includes('zip') || errorMessage.includes('postal')) {
            tokenErrorMessage = 'Código postal inválido. Verifica que coincida con tu dirección de facturación.';
          } else {
            tokenErrorMessage = firstError.message || tokenErrorMessage;
          }
        }
        
        throw new Error(tokenErrorMessage);
      }

    } catch (err: any) {
      if (mountedRef.current) {
        console.error('❌ Error en pago con tarjeta:', err);
        
        const errorMessage = err.message || 'Error procesando el pago';
        setPaymentError(errorMessage);
        error(errorMessage);
        onError(errorMessage);
      }
    } finally {
      if (mountedRef.current) {
        setIsProcessing(false);
      }
    }
  };

  const processPayment = async (sourceId: string) => {
    if (!mountedRef.current) return;
    
    try {
      console.log('Procesando pago en backend...');

      // NUEVO: Si hay orderData, crear el pedido primero
      let finalOrderId = paymentData.orderId;    
      
      const paymentRequest = {
        sourceId,
        orderId: finalOrderId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        buyerEmail: paymentData.buyerEmail,
        billingAddress: paymentData.billingAddress,
        shippingAddress: paymentData.shippingAddress,
        orderData: paymentData.orderData // ✅ AGREGAR esto - pasar datos al backend
      };

      console.log('📤 Enviando pago a backend...');
const response = await api.post('/square/process-payment', paymentRequest);
console.log('📥 Respuesta completa del backend:', response);

if (!mountedRef.current) return;

// ✅ MANEJO MEJORADO DE RESPUESTAS DEL BACKEND
      if (response.data?.success) {
        console.log('✅ Pago confirmado por backend');
        setPaymentSuccess(true);
        success('Pago procesado exitosamente');
        onSuccess(response.data);
      } else {
        // El backend devolvió un error estructurado
        console.error('❌ Backend rechazó el pago:', response.data);
        
        const backendError = response.data;
        const userMessage = backendError.userMessage || backendError.error || 'Error procesando el pago';
        
        throw new Error(userMessage);
      }

    } catch (err: any) {
      if (!mountedRef.current) return;
      
      console.error('❌ Error procesando pago:', err);
      
      // ✅ MANEJO COMPLETO DE ERRORES DEL BACKEND
      let userFriendlyMessage = 'No se pudo procesar tu pago. Por favor intenta nuevamente.';
      let shouldShowRetryAdvice = true;
      
      if (err.response?.data) {
        const errorData = err.response.data;
        console.log('📋 Datos del error del backend:', errorData);
        
        // Usar el mensaje amigable del backend si está disponible
        if (errorData.userMessage) {
          userFriendlyMessage = errorData.userMessage;
        } else if (errorData.error) {
          userFriendlyMessage = errorData.error;
        }
        
        // Verificar si se debe permitir retry
        shouldShowRetryAdvice = errorData.shouldRetry !== false;
        
        // Agregar consejos específicos según el tipo de error
        if (errorData.details?.shouldRetry === false) {
          shouldShowRetryAdvice = false;
        }
      } else if (err.message) {
        // Error directo (como errores de tokenización)
        userFriendlyMessage = err.message;
      }
      
      // ✅ MOSTRAR MENSAJE DE ERROR MEJORADO
      setPaymentError(userFriendlyMessage);
      error(userFriendlyMessage);
      onError(userFriendlyMessage);
    }
  };

  // Estados de carga y error
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-3" />
            <span>Cargando sistema de pagos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (configError) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {configError}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setConfigError(null);
                  loadSquareConfig();
                }}
                className="ml-3"
              >
                Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!config) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Sistema de pagos no disponible. Contacta soporte.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (paymentSuccess) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ¡Pago Exitoso!
            </h3>
            <p className="text-green-700">
              Tu pago ha sido procesado correctamente
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCardIcon className="h-5 w-5 mr-2" />
          Información de Pago
          {/* ✅ BADGES CORREGIDOS PARA PRODUCCIÓN */}
          {config.environment === 'sandbox' && (
            <Badge variant="outline" className="ml-3 text-orange-600 border-orange-600">
              Modo Prueba
            </Badge>
          )}          
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ✅ MOSTRAR ERROR DE PAGO MEJORADO */}
        {paymentError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-red-800">No se pudo procesar el pago</p>
                  <p className="text-sm text-red-700 mt-1">{paymentError}</p>
                </div>
                
                {/* ✅ CONSEJOS ESPECÍFICOS SEGÚN EL ENTORNO */}
                <div className="text-xs bg-red-50 text-red-800 p-3 rounded border border-red-200">
                  {config?.environment === 'sandbox' ? (
                    // Consejos para modo de prueba
                    <div>
                      <strong>Modo de Prueba - Usa estos datos:</strong><br />
                      • <strong>Tarjeta válida:</strong> 4111 1111 1111 1111<br />
                      • <strong>CVV:</strong> Cualquier 3 dígitos (ej: 123)<br />
                      • <strong>Fecha:</strong> Cualquier fecha futura<br />
                      • <strong>Código postal:</strong> Cualquier código válido
                    </div>
                  ) : (
                    // Consejos para producción
                    <div>
                      <strong>¿Cómo resolver este problema?</strong><br />
                      • Verifica que todos los datos de tu tarjeta sean correctos<br />
                      • Asegúrate de que tu tarjeta tenga fondos suficientes<br />
                      • Confirma que tu tarjeta esté vigente (no expirada)<br />
                      • Si el problema persiste, contacta a tu banco<br />
                      • También puedes intentar con otra tarjeta o método de pago
                    </div>
                  )}
                </div>

                {/* ✅ INFORMACIÓN DE SOPORTE */}
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border">
                  <strong>¿Necesitas ayuda?</strong> Si el problema continúa, puedes contactar a nuestro 
                  equipo de soporte técnico o intentar el pago más tarde.
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Información del pago */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total a pagar:</span>
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(paymentData.amount)}
            </span>
          </div>
        </div>

        {/* Tarjeta de crédito/débito */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Tarjeta de Crédito/Débito</h3>
          
          {/* Contenedor para el formulario de Square */}
          <div 
            ref={cardContainerRef} 
            className="min-h-[60px] border rounded-lg p-3 bg-white"
            style={{ minHeight: '60px' }}
          />
          
          <Button
            onClick={handleCardPayment}
            disabled={isProcessing || disabled || !card}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                {config.environment === 'production' ? 'Pagar con Tarjeta' : 'Pagar (Modo Prueba)'}
              </>
            )}
          </Button>
        </div>

        {/* Indicadores de seguridad */}
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 pt-4 border-t">
          <div className="flex items-center">
            <Shield className="h-3 w-3 mr-1" />
            Pago 100% seguro
          </div>
          <div className="flex items-center">
            <CreditCardIcon className="h-3 w-3 mr-1" />
            PCI DSS Compliant
          </div>
        </div>

        
      </CardContent>
    </Card>
  );
};

export default SquarePaymentForm;