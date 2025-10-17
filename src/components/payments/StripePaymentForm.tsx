// src/components/payments/StripePaymentForm.tsx - VERSIÓN CORREGIDA
'use client';

import { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Shield } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripePaymentFormProps {
  paymentData: {
    amount: number;
    currency: string;
    orderData: any; // Datos del pedido para crear después del pago
  };
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

function CheckoutForm({ paymentData, onSuccess, onError }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Confirmar el pago con Stripe
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`
        },
        redirect: 'if_required'
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!paymentIntent) {
        throw new Error('No se pudo confirmar el pago');
      }

      console.log('✅ Pago confirmado con Stripe:', paymentIntent.id);

      // 2. Crear la orden en el backend con el pago confirmado
      const result = await api.post('/stripe/confirm-payment', {
        paymentIntentId: paymentIntent.id,
        orderData: paymentData.orderData
      });

      onSuccess(result.data);

    } catch (err: any) {
      console.error('❌ Error procesando pago:', err);
      
      // Mensajes de error más específicos
      let errorMessage = 'Error procesando el pago';
      
      if (err.message.includes('fondos insuficientes') || err.message.includes('insufficient')) {
        errorMessage = 'Fondos insuficientes en la tarjeta';
      } else if (err.message.includes('declinada') || err.message.includes('declined')) {
        errorMessage = 'La tarjeta fue declinada. Verifica los datos o contacta a tu banco';
      } else if (err.message.includes('expirada') || err.message.includes('expired')) {
        errorMessage = 'La tarjeta está expirada. Por favor usa una tarjeta vigente';
      } else if (err.message.includes('inválid') || err.message.includes('invalid')) {
        errorMessage = 'Datos de tarjeta inválidos. Revisa la información';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center text-blue-700 mb-2">
          <Shield className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Pago 100% Seguro</span>
        </div>
        <p className="text-xs text-blue-600">
          Los datos de tu tarjeta están encriptados
        </p>
      </div>

      <PaymentElement />

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total a pagar:</span>
          <span className="text-2xl font-bold text-primary-600">
            ${paymentData.amount.toFixed(2)} {paymentData.currency}
          </span>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Procesando Pago...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Pagar ${paymentData.amount.toFixed(2)}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-gray-500">
  Al hacer clic en "Pagar" aceptas nuestros{' '}
  <Link 
    href="/terms" 
    target="_blank"
    className="text-primary-600 hover:text-primary-700 underline"
  >
    términos y condiciones
  </Link>
</p>
    </form>
  );
}

export default function StripePaymentForm({ paymentData, onSuccess, onError }: StripePaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const { data } = await api.post('/stripe/create-payment-intent', {
          amount: paymentData.amount,
          currency: paymentData.currency,
          metadata: {
            userId: 'current-user', // Se obtiene del token en el backend
            items: paymentData.orderData.items,
            shippingMethod: paymentData.orderData.shippingMethod,
            shippingAddress: paymentData.orderData.shippingAddress,
            couponCode: paymentData.orderData.couponCode,
            customerNotes: paymentData.orderData.customerNotes
          }
        });

        setClientSecret(data.clientSecret);
      } catch (err: any) {
        console.error('Error creando Payment Intent:', err);
        onError('Error inicializando el pago');
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [paymentData]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Inicializando pago seguro...</p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-8 text-red-600">
        Error al inicializar el pago. Por favor intenta nuevamente.
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#059669'
      }
    }       
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm paymentData={paymentData} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}