'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  Copy, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Smartphone
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

interface ZellePaymentData {
  orderId: string;
  amount: number;
  currency: string;
}

interface ZellePaymentInstructionsProps {
  paymentData: ZellePaymentData;
  onConfirm: () => void;
}

const ZellePaymentInstructions: React.FC<ZellePaymentInstructionsProps> = ({
  paymentData,
  onConfirm
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const { success } = useToast();

  // TUS DATOS DE ZELLE - MODIFICA AQUÍ
  const ZELLE_INFO = {
    email: "contacto@serviprogarcia.com", // CAMBIAR POR TU EMAIL DE ZELLE
    phone: "+1-832-523-0060",     // CAMBIAR POR TU TELÉFONO DE ZELLE  
    name: "ServiPro Garcia LLC"    // CAMBIAR POR TU NOMBRE COMPLETO
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    success(`${label} copiado al portapapeles`);
  };

  const handleConfirmPayment = async () => {
    setIsConfirming(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
    onConfirm();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Pago con Zelle
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Monto a pagar */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-center">
            <p className="text-sm text-blue-700 mb-1">Total a pagar:</p>
            <p className="text-2xl font-bold text-blue-900">
              {formatPrice(paymentData.amount)}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Pedido: {paymentData.orderId}
            </p>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Instrucciones de Pago:</h3>
          
          {/* Información de contacto Zelle */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-3">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
    <span className="text-xs sm:text-sm text-gray-600 font-medium">Phone de Zelle:</span>
    <div className="flex items-center space-x-2">
      <span className="font-mono text-sm sm:text-base font-bold">{ZELLE_INFO.phone}</span>
      <Button 
        size="sm" 
        variant="ghost"
        onClick={() => copyToClipboard(ZELLE_INFO.phone, 'Phone')}
        className="h-6 w-6 sm:h-8 sm:w-8 p-1"
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
  <span className="text-xs sm:text-sm text-gray-600 font-medium">Nombre del beneficiario:</span>
  <span className="font-medium text-sm sm:text-base">{ZELLE_INFO.name}</span>
</div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
  <span className="text-xs sm:text-sm text-gray-600 font-medium">Monto exacto:</span>
  <div className="flex items-center space-x-2">
    <span className="font-mono text-base sm:text-lg font-bold text-green-600">
      ${paymentData.amount.toFixed(2)}
    </span>
    <Button 
      size="sm" 
      variant="ghost"
      onClick={() => copyToClipboard(paymentData.amount.toFixed(2), 'Monto')}
      className="h-6 w-6 sm:h-8 sm:w-8 p-1"
    >
      <Copy className="h-3 w-3" />
    </Button>
  </div>
</div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
              <span className="text-xs sm:text-sm text-gray-600 font-medium">Nota/Concepto:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold">Pedido #{paymentData.orderId}</span>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => copyToClipboard(`Pedido #${paymentData.orderId}`, 'Número de pedido')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Pasos */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Pasos a seguir:</h4>
            <div className="space-y-3 sm:space-y-2">
  <div className="flex items-start space-x-3 p-2 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
    <span className="bg-blue-500 text-white rounded-full w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
    <span className="text-sm sm:text-sm text-gray-700 leading-relaxed">Abre tu app bancaria o la app de Zelle</span>
  </div>
              <div className="flex items-start space-x-3 p-2 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
  <span className="bg-blue-500 text-white rounded-full w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
  <span className="text-sm sm:text-sm text-gray-700 leading-relaxed">Envía <strong className="text-green-600">${paymentData.amount.toFixed(2)}</strong> a <strong className="text-blue-600">{ZELLE_INFO.phone}</strong></span>
</div>
              <div className="flex items-start space-x-3 p-2 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <span className="text-sm sm:text-sm text-gray-700 leading-relaxed">En el concepto escribe: <strong>Pedido #{paymentData.orderId}</strong></span>
              </div>
              <div className="flex items-start space-x-3 p-2 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                <span className="text-sm sm:text-sm text-gray-700 leading-relaxed">Haz clic en "Ya realicé el pago" abajo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas importantes */}
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <strong>Tiempo de procesamiento:</strong> Los pagos con Zelle son instantáneos, 
            pero la confirmación de tu pedido puede tomar hasta 2 horas en horario laboral.
          </AlertDescription>
        </Alert>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> El monto debe ser exacto y debes incluir el número 
            de pedido para procesar tu compra correctamente.
          </AlertDescription>
        </Alert>

        {/* Botón de confirmación */}
        <Button
          onClick={handleConfirmPayment}
          disabled={isConfirming}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {isConfirming ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Confirmando...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Ya Realicé el Pago con Zelle
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ZellePaymentInstructions;