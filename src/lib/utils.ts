import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para formatear precios
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price);
}

// Función para formatear fechas
export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Función para formatear fechas más simple (solo fecha)
export function formatDateShort(dateString: string | Date | null | undefined): string {
  if (!dateString) {
    return 'N/A';
  }
  
  const date = new Date(dateString);
  
  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) {
    return 'Fecha inválida';
  }
  
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

// Función para generar SKU automático
export function generateSKU(name: string, brand?: string): string {
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 6);
  const cleanBrand = brand ? brand.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 3) : '';
  const timestamp = Date.now().toString().slice(-4);
  
  return `${cleanBrand}${cleanName}${timestamp}`;
}

// Función para validar URLs de imágenes
export function isValidImageUrl(url: string): boolean {
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
  return imageExtensions.test(url) || url.startsWith('data:image/');
}
