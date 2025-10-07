// src/hooks/useToast.ts - Hook mejorado para toast notifications
import toast from 'react-hot-toast';
import { ReactElement } from 'react';

interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export const useToast = () => {
  const success = (message: string, options?: ToastOptions) => {
    toast.success(message, {
      duration: options?.duration || 3000,
      position: options?.position || 'top-right',
    });
  };

  const error = (message: string, options?: ToastOptions) => {
    toast.error(message, {
      duration: options?.duration || 5000,
      position: options?.position || 'top-right',
    });
  };

  const loading = (message: string, options?: ToastOptions) => {
    return toast.loading(message, {
      position: options?.position || 'top-right',
    });
  };

  const promise = <T,>(
    promiseFunction: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ) => {
    return toast.promise(
      promiseFunction,
      messages,
      {
        position: options?.position || 'top-right',
      }
    );
  };

  const dismiss = (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  const custom = (jsx: ReactElement, options?: ToastOptions) => {
    toast.custom(jsx, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
    });
  };

  return {
    success,
    error,
    loading,
    promise,
    dismiss,
    custom,
  };
};

export default useToast;