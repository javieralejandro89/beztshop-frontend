// src/components/SyncFix.tsx - Componente para sincronizar tokens
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

export default function SyncFix() {
  const { user, isAuthenticated } = useAuthStore();
  // Si necesitas el accessToken, probablemente esté guardado en localStorage, así que recupéralo así:
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;

    // Si hay datos en Zustand pero no en localStorage, sincronizar
    if (isAuthenticated && user && accessToken) {
      const localToken = localStorage.getItem('accessToken');
      const localUser = localStorage.getItem('user');

      if (!localToken || !localUser) {
        console.log('🔄 Sincronizando tokens entre Zustand y localStorage...');
        
        // Guardar en localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('✅ Tokens sincronizados exitosamente');
        
        // Recargar la página para que las APIs funcionen
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    }
  }, [user, accessToken, isAuthenticated]);

  return null; // Componente invisible
}