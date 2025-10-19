// src/components/modals/AddressModal.tsx - Modal para crear/editar direcciones
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CountrySelect } from '@/components/ui/CountrySelect';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, MapPin, X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import accountApi, { type Address, type CreateAddressData } from '@/lib/accountApi';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  address?: Address | null; // null = crear, Address = editar
}

export default function AddressModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  address 
}: AddressModalProps) {
  const { success, error, promise } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAddressData>({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Resetear form cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      if (address) {
        // Modo edición
        setFormData({
          name: address.name,
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country,
          isDefault: address.isDefault
        });
      } else {
        // Modo creación
        setFormData({
          name: '',
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          isDefault: false
        });
      }
      setErrors({});
    }
  }, [isOpen, address]);

  const handleInputChange = (field: keyof CreateAddressData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!formData.street.trim()) {
      newErrors.street = 'La dirección es requerida';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'El estado es requerido';
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'El código postal es requerido';
    }
    if (!formData.country?.trim()) {
  newErrors.country = 'El país es requerido';
}

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (address) {
        // Modo edición
        await promise(
          accountApi.updateAddress(address.id, formData),
          {
            loading: 'Actualizando dirección...',
            success: 'Dirección actualizada exitosamente',
            error: 'Error al actualizar la dirección'
          }
        );
      } else {
        // Modo creación
        await promise(
          accountApi.createAddress(formData),
          {
            loading: 'Creando dirección...',
            success: 'Dirección creada exitosamente',
            error: 'Error al crear la dirección'
          }
        );
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error en address modal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {address ? 'Editar Dirección' : 'Nueva Dirección'}
          </DialogTitle>
          <DialogDescription>
            {address 
              ? 'Modifica los datos de tu dirección' 
              : 'Agrega una nueva dirección de envío'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre de la dirección */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la dirección *</Label>
            <Input
              id="name"
              placeholder="Ej: Casa, Oficina, etc."
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="street">Dirección *</Label>
            <Input
              id="street"
              placeholder="Calle, número, colonia"
              value={formData.street}
              onChange={(e) => handleInputChange('street', e.target.value)}
              className={errors.street ? 'border-red-500' : ''}
            />
            {errors.street && (
              <p className="text-sm text-red-500">{errors.street}</p>
            )}
          </div>

          {/* Ciudad y Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Alcaldía *</Label>
              <Input
                id="city"
                placeholder="Alcaldía"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado *</Label>
              <Input
                id="state"
                placeholder="Estado"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className={errors.state ? 'border-red-500' : ''}
              />
              {errors.state && (
                <p className="text-sm text-red-500">{errors.state}</p>
              )}
            </div>
          </div>

          {/* Código postal y País */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zipCode">Código Postal *</Label>
              <Input
                id="zipCode"
                placeholder="12345"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                className={errors.zipCode ? 'border-red-500' : ''}
              />
              {errors.zipCode && (
                <p className="text-sm text-red-500">{errors.zipCode}</p>
              )}
            </div>
            <div className="space-y-2">
  <Label htmlFor="country">País *</Label>
  <CountrySelect
    value={formData.country || ''}
    onValueChange={(value) => handleInputChange('country', value)}
    placeholder="Selecciona tu país"
    className={errors.country ? 'border-red-500' : ''}
  />
  {errors.country && (
    <p className="text-sm text-red-500">{errors.country}</p>
  )}
</div>
          </div>

          {/* Dirección por defecto */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) => handleInputChange('isDefault', !!checked)}
            />
            <Label htmlFor="isDefault" className="text-sm">
              Establecer como dirección predeterminada
            </Label>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {address ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                address ? 'Actualizar' : 'Crear Dirección'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}