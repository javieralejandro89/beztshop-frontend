// src/components/modals/PaymentMethodModal.tsx - Modal simplificado sin Square
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Shield, AlertTriangle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import accountApi, { type PaymentMethod, type CreatePaymentMethodData } from '@/lib/accountApi';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  paymentMethod?: PaymentMethod | null;
}

interface CardFormData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  isDefault: boolean;
}

export default function PaymentMethodModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  paymentMethod 
}: PaymentMethodModalProps) {
  const { success, error, promise } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState<CardFormData>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    isDefault: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: '',
        isDefault: false
      });
      setErrors({});
      setIsEditing(false);
    }
  }, [isOpen]);

  // Load payment method data if editing
  useEffect(() => {
    if (isOpen && paymentMethod) {
      setFormData({
        cardNumber: `****${paymentMethod.last4 || ''}`,
        expiryMonth: paymentMethod.expiryMonth?.toString() || '',
        expiryYear: paymentMethod.expiryYear?.toString() || '',
        cvv: '***',
        cardholderName: '',
        isDefault: paymentMethod.isDefault
      });
    }
  }, [isOpen, paymentMethod]);

  const formatCardNumber = (value: string) => {
    // Remove all spaces and non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add space every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const getCardBrand = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '');
    if (/^4/.test(number)) return 'Visa';
    if (/^5[1-5]/.test(number)) return 'Mastercard';
    if (/^3[47]/.test(number)) return 'American Express';
    return 'Tarjeta';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Card number validation
    const cardNumber = formData.cardNumber.replace(/\s/g, '');
    if (!paymentMethod) { // Only validate when creating new
      if (!cardNumber) {
        newErrors.cardNumber = 'Número de tarjeta requerido';
      } else if (cardNumber.length < 13 || cardNumber.length > 19) {
        newErrors.cardNumber = 'Número de tarjeta inválido';
      }

      // CVV validation
      if (!formData.cvv) {
        newErrors.cvv = 'CVV requerido';
      } else if (formData.cvv.length < 3 || formData.cvv.length > 4) {
        newErrors.cvv = 'CVV inválido';
      }
    }

    // Cardholder name
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Nombre del titular requerido';
    }

    // Expiry validation
    if (!formData.expiryMonth) {
      newErrors.expiryMonth = 'Mes requerido';
    }
    if (!formData.expiryYear) {
      newErrors.expiryYear = 'Año requerido';
    }

    // Check if expiry date is in the future
    if (formData.expiryMonth && formData.expiryYear) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const expiryYear = parseInt(formData.expiryYear);
      const expiryMonth = parseInt(formData.expiryMonth);

      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        newErrors.expiryMonth = 'Fecha de vencimiento inválida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CardFormData, value: string | boolean) => {
    let processedValue = value;

    if (field === 'cardNumber' && typeof value === 'string') {
      processedValue = formatCardNumber(value);
    }
    
    if (field === 'cvv' && typeof value === 'string') {
      processedValue = value.replace(/[^0-9]/g, '').slice(0, 4);
    }

    if (field === 'cardholderName' && typeof value === 'string') {
      processedValue = value.toUpperCase();
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const cardNumber = formData.cardNumber.replace(/\s/g, '');
      const last4 = cardNumber.slice(-4);
      const brand = getCardBrand(cardNumber);

      const paymentMethodData: CreatePaymentMethodData = {
        type: 'CARD',
        last4,
        brand,
        expiryMonth: parseInt(formData.expiryMonth),
        expiryYear: parseInt(formData.expiryYear),
        isDefault: formData.isDefault
      };

      if (paymentMethod) {
        // Update existing (limited fields)
        await promise(
          accountApi.updatePaymentMethod(paymentMethod.id, {
            isDefault: formData.isDefault
          }),
          {
            loading: 'Actualizando método de pago...',
            success: 'Método de pago actualizado exitosamente',
            error: 'Error al actualizar el método de pago'
          }
        );
      } else {
        // Create new
        await promise(
          accountApi.createPaymentMethod(paymentMethodData),
          {
            loading: 'Agregando método de pago...',
            success: 'Método de pago agregado exitosamente',
            error: 'Error al agregar el método de pago'
          }
        );
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error en método de pago:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!paymentMethod) return;

    const confirmed = window.confirm('¿Estás seguro de que quieres eliminar este método de pago?');
    if (!confirmed) return;

    setIsLoading(true);

    try {
      await promise(
        accountApi.deletePaymentMethod(paymentMethod.id),
        {
          loading: 'Eliminando método de pago...',
          success: 'Método de pago eliminado exitosamente',
          error: 'Error al eliminar el método de pago'
        }
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error eliminando método de pago:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return { value: month.toString(), label: month.toString().padStart(2, '0') };
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
  <CreditCard className="h-5 w-5" />
  {paymentMethod ? 'Detalles del Método de Pago' : 'Nuevo Método de Pago'}
</DialogTitle>
<DialogDescription>
  {paymentMethod 
    ? 'Información de tu método de pago guardado' 
    : 'Agrega un nuevo método de pago seguro'
  }
</DialogDescription>
        </DialogHeader>

        {paymentMethod ? (
  // Modo solo lectura
  <div className="space-y-4">
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center space-x-3">
        <CreditCard className="h-8 w-8 text-gray-400" />
        <div>
          <p className="font-medium">
            {paymentMethod.brand} terminada en {paymentMethod.last4}
          </p>
          <p className="text-sm text-gray-500">
            Expira {paymentMethod.expiryMonth?.toString().padStart(2, '0')}/{paymentMethod.expiryYear}
          </p>
          {paymentMethod.isDefault && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1 inline-block">
              Predeterminada
            </span>
          )}
        </div>
      </div>
    </div>
    
    <Alert>
      <Shield className="h-4 w-4" />
      <AlertDescription>
        Por seguridad, los métodos de pago no pueden editarse directamente. 
        Para cambios, elimina este método y agrega uno nuevo.
      </AlertDescription>
    </Alert>
  </div>
) : (
  // Modo creación
  <form onSubmit={handleSubmit} className="space-y-4">
    {/* Card Number */}
    <div className="space-y-2">
      <Label htmlFor="cardNumber">Número de Tarjeta *</Label>
      <Input
        id="cardNumber"
        placeholder="1234 5678 9012 3456"
        value={formData.cardNumber}
        onChange={(e) => handleInputChange('cardNumber', e.target.value)}
        maxLength={19}
        className={errors.cardNumber ? 'border-red-500' : ''}
      />
      {errors.cardNumber && (
        <p className="text-sm text-red-500">{errors.cardNumber}</p>
      )}
      {formData.cardNumber && (
        <p className="text-sm text-gray-600">
          Tipo: {getCardBrand(formData.cardNumber)}
        </p>
      )}
    </div>

    {/* Cardholder Name */}
    <div className="space-y-2">
      <Label htmlFor="cardholderName">Nombre del Titular *</Label>
      <Input
        id="cardholderName"
        placeholder="JUAN PÉREZ"
        value={formData.cardholderName}
        onChange={(e) => handleInputChange('cardholderName', e.target.value)}
        className={errors.cardholderName ? 'border-red-500' : ''}
      />
      {errors.cardholderName && (
        <p className="text-sm text-red-500">{errors.cardholderName}</p>
      )}
    </div>

    {/* Expiry and CVV */}
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="expiryMonth">Mes *</Label>
        <Select
          value={formData.expiryMonth}
          onValueChange={(value) => handleInputChange('expiryMonth', value)}
        >
          <SelectTrigger className={errors.expiryMonth ? 'border-red-500' : ''}>
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.expiryMonth && (
          <p className="text-xs text-red-500">{errors.expiryMonth}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiryYear">Año *</Label>
        <Select
          value={formData.expiryYear}
          onValueChange={(value) => handleInputChange('expiryYear', value)}
        >
          <SelectTrigger className={errors.expiryYear ? 'border-red-500' : ''}>
            <SelectValue placeholder="YYYY" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.expiryYear && (
          <p className="text-xs text-red-500">{errors.expiryYear}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cvv">CVV *</Label>
        <Input
          id="cvv"
          placeholder="123"
          value={formData.cvv}
          onChange={(e) => handleInputChange('cvv', e.target.value)}
          maxLength={4}
          className={errors.cvv ? 'border-red-500' : ''}
        />
        {errors.cvv && (
          <p className="text-xs text-red-500">{errors.cvv}</p>
        )}
      </div>
    </div>

    {/* Default checkbox */}
    <div className="flex items-center space-x-2">
      <Checkbox
        id="isDefault"
        checked={formData.isDefault}
        onCheckedChange={(checked) => handleInputChange('isDefault', !!checked)}
      />
      <Label htmlFor="isDefault" className="text-sm">
        Establecer como método predeterminado
      </Label>
    </div>

    {/* Security notice */}
    <Alert>
      <Shield className="h-4 w-4" />
      <AlertDescription>
        Tu información de pago está protegida con encriptación de nivel bancario.
      </AlertDescription>
    </Alert>
  </form>
)}

        <DialogFooter className="gap-2">
  <Button
    type="button"
    variant="outline"
    onClick={onClose}
    disabled={isLoading}
  >
    {paymentMethod ? 'Cerrar' : 'Cancelar'}
  </Button>
  
  {paymentMethod ? (
    <Button
      type="button"
      variant="destructive"
      onClick={handleDelete}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4 mr-2" />
      )}
      Eliminar Método
    </Button>
  ) : (
    <Button onClick={handleSubmit} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Guardando...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          Guardar Tarjeta
        </>
      )}
    </Button>
  )}
</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}