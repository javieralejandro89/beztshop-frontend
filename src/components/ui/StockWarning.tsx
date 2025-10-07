// src/components/ui/StockWarning.tsx - Componente amigable para advertencias de stock
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface StockIssueItem {
  productId: string;
  productName: string;
  requested: number;
  available: number;
}

interface StockWarningProps {
  items: StockIssueItem[];
  onClose?: () => void;
  onRemoveOutOfStockItems?: () => void;
  className?: string;
}

export default function StockWarning({ items, onClose, onRemoveOutOfStockItems, className }: StockWarningProps) {
  if (!items || items.length === 0) return null;

  const handleContinueAnyway = () => {
    // Eliminar productos sin stock automáticamente
    if (onRemoveOutOfStockItems) {
      onRemoveOutOfStockItems();
    }
    
    // Cerrar la advertencia
    if (onClose) {
      onClose();
    }
  };

  return (
    <Alert className={`border-orange-200 bg-orange-50 ${className}`}>
      <Package className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Disponibilidad Limitada
            </h4>
            <p className="text-sm mb-3">
              Algunos productos en tu carrito tienen stock limitado:
            </p>
            <div className="space-y-2 mb-4">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-white rounded p-2 text-sm">
                  <div className="font-medium">{item.productName}</div>
                  <div className="text-orange-700">
                    {item.available === 0 ? (
                      <span className="font-medium text-red-600">Agotado</span>
                    ) : (
                      <span>Solo {item.available} disponible{item.available !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                asChild 
                size="sm" 
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Link href="/cart">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Ajustar Carrito
                </Link>
              </Button>
              {onClose && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleContinueAnyway}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  Continuar Solo con Disponibles
                </Button>
              )}
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}