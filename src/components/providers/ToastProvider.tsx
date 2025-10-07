// src/components/providers/ToastProvider.tsx - Proveedor de notificaciones
'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Define default options
        className: '',
        duration: 4000,
        style: {
          background: '#fff',
          color: '#333',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          fontSize: '14px',
          padding: '12px 16px',
        },

        // Default options for specific types
        success: {
          duration: 3000,
          style: {
            background: '#f0fdf4',
            border: '1px solid #86efac',
            color: '#166534',
          },
          iconTheme: {
            primary: '#22c55e',
            secondary: '#f0fdf4',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            color: '#dc2626',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fef2f2',
          },
        },
        loading: {
          style: {
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            color: '#475569',
          },
        },
      }}
    />
  );
}