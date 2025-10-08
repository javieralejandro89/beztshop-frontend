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
    <Card className="bg-darkbg-light/80 backdrop-blur-sm border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <DollarSign className="h-5 w-5 mr-2 text-gold" />
          Pago con Zelle
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Monto a pagar */}
        <div className="bg-gradient-to-r from-cyan/20 to-gold/20 p-4 rounded-lg border border-cyan/30">
          <div className="text-center">
            <p className="text-sm text-cyan mb-1">Total a pagar:</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-gold to-cyan bg-clip-text text-transparent">
              {formatPrice(paymentData.amount)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Pedido: {paymentData.orderId}
            </p>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="space-y-4">
          <h3 className="font-semibold text-white">Instrucciones de Pago:</h3>
          
          {/* Información de contacto Zelle */}
          <div className="bg-darkbg/50 p-3 sm:p-4 rounded-lg space-y-3 border border-gold/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
              <span className="text-xs sm:text-sm text-gray-400 font-medium">Phone de Zelle:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm sm:text-base font-bold text-white">{ZELLE_INFO.phone}</span>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => copyToClipboard(ZELLE_INFO.phone, 'Phone')}
                  className="h-6 w-6 sm:h-8 sm:w-8 p-1 text-gold hover:text-cyan hover:bg-darkbg-light"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
              <span className="text-xs sm:text-sm text-gray-400 font-medium">Nombre del beneficiario:</span>
              <span className="font-medium text-sm sm:text-base text-white">{ZELLE_INFO.name}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
              <span className="text-xs sm:text-sm text-gray-400 font-medium">Monto exacto:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-base sm:text-lg font-bold text-cyan">
                  ${paymentData.amount.toFixed(2)}
                </span>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => copyToClipboard(paymentData.amount.toFixed(2), 'Monto')}
                  className="h-6 w-6 sm:h-8 sm:w-8 p-1 text-gold hover:text-cyan hover:bg-darkbg-light"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
              <span className="text-xs sm:text-sm text-gray-400 font-medium">Nota/Concepto:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-white">Pedido #{paymentData.orderId}</span>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => copyToClipboard(`Pedido #${paymentData.orderId}`, 'Número de pedido')}
                  className="text-gold hover:text-cyan hover:bg-darkbg-light"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Pasos */}
          <div className="space-y-3">
            <h4 className="font-medium text-white">Pasos a seguir:</h4>
            <div className="space-y-3 sm:space-y-2">
              <div className="flex items-start space-x-3 p-2 sm:p-0 bg-darkbg/30 sm:bg-transparent rounded-lg sm:rounded-none border border-gold/10 sm:border-0">
                <span className="bg-gradient-to-r from-gold to-cyan text-darkbg rounded-full w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <span className="text-sm sm:text-sm text-gray-300 leading-relaxed">Abre tu app bancaria o la app de Zelle</span>
              </div>
              <div className="flex items-start space-x-3 p-2 sm:p-0 bg-darkbg/30 sm:bg-transparent rounded-lg sm:rounded-none border border-gold/10 sm:border-0">
                <span className="bg-gradient-to-r from-gold to-cyan text-darkbg rounded-full w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <span className="text-sm sm:text-sm text-gray-300 leading-relaxed">Envía <strong className="text-cyan">${paymentData.amount.toFixed(2)}</strong> a <strong className="text-gold">{ZELLE_INFO.phone}</strong></span>
              </div>
              <div className="flex items-start space-x-3 p-2 sm:p-0 bg-darkbg/30 sm:bg-transparent rounded-lg sm:rounded-none border border-gold/10 sm:border-0">
                <span className="bg-gradient-to-r from-gold to-cyan text-darkbg rounded-full w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <span className="text-sm sm:text-sm text-gray-300 leading-relaxed">En el concepto escribe: <strong className="text-white">Pedido #{paymentData.orderId}</strong></span>
              </div>
              <div className="flex items-start space-x-3 p-2 sm:p-0 bg-darkbg/30 sm:bg-transparent rounded-lg sm:rounded-none border border-gold/10 sm:border-0">
                <span className="bg-gradient-to-r from-gold to-cyan text-darkbg rounded-full w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                <span className="text-sm sm:text-sm text-gray-300 leading-relaxed">Haz clic en "Ya realicé el pago" abajo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas importantes */}
        <Alert className="bg-cyan/10 border-cyan/30">
          <Clock className="h-4 w-4 text-cyan" />
          <AlertDescription className="text-gray-300">
            <strong className="text-white">Tiempo de procesamiento:</strong> Los pagos con Zelle son instantáneos, 
            pero la confirmación de tu pedido puede tomar hasta 2 horas en horario laboral.
          </AlertDescription>
        </Alert>

        <Alert variant="destructive" className="bg-orange-500/10 border-orange-400/30">
          <AlertTriangle className="h-4 w-4 text-orange-400" />
          <AlertDescription className="text-gray-300">
            <strong className="text-orange-400">Importante:</strong> El monto debe ser exacto y debes incluir el número 
            de pedido para procesar tu compra correctamente.
          </AlertDescription>
        </Alert>

        {/* Botón de confirmación */}
        <Button
          onClick={handleConfirmPayment}
          disabled={isConfirming}
          className="w-full bg-gradient-to-r from-cyan to-gold hover:from-gold hover:to-cyan text-darkbg"
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