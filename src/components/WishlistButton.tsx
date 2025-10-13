// src/components/WishlistButton.tsx - Botón para agregar/quitar de favoritos
'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { useAuthStore } from '@/lib/store';
import wishlistApi from '@/lib/wishlistApi';

interface WishlistButtonProps {
  productId: string;
  productName?: string;
  variant?: 'default' | 'icon' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export default function WishlistButton({
  productId,
  productName,
  variant = 'icon',
  size = 'md',
  className,
  showText = false
}: WishlistButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const { success, error } = useToast();
  
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Verificar estado inicial
  useEffect(() => {
    if (isAuthenticated && productId) {
      checkWishlistStatus();
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, productId]);

  const checkWishlistStatus = async () => {
  try {
    setIsChecking(true);
    
    // Verificar token antes de hacer la petición
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('No token, skipping wishlist check');
      setIsInWishlist(false);
      return;
    }
    
    const status = await wishlistApi.checkWishlistStatus(productId);
    setIsInWishlist(status.inWishlist);
  } catch (err: any) {
    console.error('Error checking wishlist status:', err);
    // Si es 401, simplemente asume que no está autenticado
    if (err.response?.status === 401) {
      setIsInWishlist(false);
    }
  } finally {
    setIsChecking(false);
  }
};

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      error('Debes iniciar sesión para agregar productos a favoritos');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await wishlistApi.toggleWishlist(productId);
      setIsInWishlist(result.inWishlist);
      success(result.message);
    } catch (err: any) {
      error(err.message || 'Error al actualizar favoritos');
    } finally {
      setIsLoading(false);
    }
  };

  // Tamaños de icono según el size prop
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  // Tamaños de botón según el size prop
  const buttonSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  if (!isAuthenticated) {
    return null; // No mostrar botón si no está autenticado
  }

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleWishlist}
        disabled={isLoading || isChecking}
        className={cn(
          buttonSizes[size],
          'rounded-full transition-all duration-200 hover:scale-110',
          isInWishlist 
            ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
            : 'text-gray-400 hover:text-red-500 hover:bg-red-50',
          className
        )}
        title={isInWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <Heart 
          className={cn(
            iconSizes[size],
            'transition-all duration-200',
            isInWishlist ? 'fill-current' : '',
            isLoading ? 'animate-pulse' : ''
          )} 
        />
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleWishlist}
      disabled={isLoading || isChecking}
      className={cn(
        'transition-all duration-200',
        isInWishlist 
          ? 'text-red-500 border-red-500 hover:bg-red-50' 
          : 'hover:text-red-500 hover:border-red-500',
        className
      )}
    >
      <Heart 
        className={cn(
          iconSizes[size],
          'transition-all duration-200',
          showText ? 'mr-2' : '',
          isInWishlist ? 'fill-current' : '',
          isLoading ? 'animate-pulse' : ''
        )} 
      />
      {showText && (
        <span>
          {isLoading 
            ? 'Cargando...' 
            : isInWishlist 
              ? 'En Favoritos' 
              : 'Agregar a Favoritos'
          }
        </span>
      )}
    </Button>
  );
}