// src/components/ui/use-toast.ts - Hook para notificaciones toast
import { useState } from 'react';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

let toastCount = 0;

export function toast({ title, description, variant = 'default', duration = 5000 }: Omit<Toast, 'id'>) {
  // Implementación simple usando alert por ahora
  // En una implementación real, usarías un contexto y componente de toast
  const message = `${title ? title + ': ' : ''}${description || ''}`;
  
  if (variant === 'destructive') {
    console.error('Toast Error:', message);
    alert(`Error: ${message}`);
  } else {
    console.log('Toast Success:', message);
    alert(message);
  }
}

// Hook dummy para compatibilidad
export function useToast() {
  return { toast };
}