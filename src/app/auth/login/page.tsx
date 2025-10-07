// src/app/auth/login/page.tsx - Página de login con efectos visuales
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Zap,
  Shield,
  Star,
} from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useCartStore } from '@/lib/cartStore';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  
  const { login, isAuthenticated } = useAuthStore();
  const { totalItems } = useCartStore();
  
  const [formData, setFormData] = useState<LoginFormData>({
  email: '',
  password: '',
  rememberMe: false,
});
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !loginSuccess) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo, loginSuccess]);

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
  setFormData((prev: LoginFormData) => ({ ...prev, [field]: value }));
  
  // Limpiar error específico cuando el usuario empiece a escribir
  if (errors[field]) {
    setErrors((prev: Record<string, string>) => ({ ...prev, [field]: '' }));
  }
};

  const validateForm = () => {
  const newErrors: Record<string, string> = {};
  
  if (!formData.email) {
    newErrors.email = 'El email es requerido';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = 'Email inválido';
  }
  
  if (!formData.password) {
    newErrors.password = 'La contraseña es requerida';
  } else if (formData.password.length < 6) {
    newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

 // Reemplaza esta parte en tu handleSubmit existente:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setIsLoading(true);

  setFormData(prev => ({ ...prev, password: '' }));
  
  try {
    const response = await authApi.login({
      email: formData.email,
      password: formData.password,
    });    
    
    // Éxito - el sistema automáticamente guardará los tokens
    setLoginSuccess(true);
    login(response.user, response.accessToken);
    
    
    // Delay para mostrar animación de éxito
    setTimeout(() => {
      router.push(redirectTo);
    }, 1500);
    
  } catch (error: any) {
    setErrors((prev: Record<string, string>) => ({
      ...prev,
      submit: error.response?.data?.error || 'Error al iniciar sesión'
    }));
  } finally {
    setIsLoading(false);
  }
};

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    // Implementar login social
    console.log(`Login with ${provider}`);
  };

  if (loginSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-card-hover border-0 bg-white/90 backdrop-blur-sm animate-fade-in">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow animate-bounce-gentle">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Bienvenido de vuelta!
            </h2>
            <p className="text-gray-600 mb-6">
              Has iniciado sesión exitosamente. Redirigiendo...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-primary-500 to-yellow-500 h-2 rounded-full animate-pulse w-full shadow-glow" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex items-center justify-center px-4 py-8">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary-100/20 to-transparent rounded-full animate-pulse-gentle" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-yellow-100/20 to-transparent rounded-full animate-pulse-gentle" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Botón volver */}
        <div className="mb-6 animate-fade-in">
          <Button 
            asChild 
            variant="ghost" 
            className="text-gray-600 hover:text-primary-600 -ml-2"
          >
            <Link href={redirectTo === '/' ? '/' : '/products'}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
        </div>

        <Card className="shadow-card-hover border-0 bg-white/90 backdrop-blur-sm animate-fade-in">
          <CardHeader className="text-center pb-2">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-2 rounded-lg font-bold text-2xl shadow-glow animate-bounce-gentle">
                SP
              </div>
            </div>
            
            <CardTitle className="text-2xl font-bold text-gray-900">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-gray-600">
              Accede a tu cuenta de ServiPro Garcia
              {totalItems > 0 && (
                <span className="block mt-2 text-primary-600 font-medium">
                  Tienes {totalItems} producto{totalItems !== 1 ? 's' : ''} en tu carrito
                </span>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error global */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
                <div className="flex items-center text-red-700">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">{errors.submit}</span>
                </div>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 ${
                      errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm flex items-center animate-fade-in">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 pr-10 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 ${
                      errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm flex items-center animate-fade-in">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Recordarme y Olvidé contraseña */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => handleInputChange('rememberMe', !!checked)}
                    className="data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer">
                    Recordarme
                  </Label>
                </div>
                
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón de login */}
              <Button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 font-medium transition-all duration-300 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-glow hover:shadow-glow-yellow transform hover:scale-105'
                } text-white`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Iniciando sesión...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Iniciar Sesión
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </div>
                )}
              </Button>
            </form>

            

            {/* Registro */}
            <div className="text-center">
              <p className="text-gray-600">
                ¿No tienes una cuenta?{' '}
                <Link 
                  href={`/auth/register${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>

            {/* Beneficios de crear cuenta */}
            <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-medium text-gray-900 mb-2">Beneficios de tener una cuenta:</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-primary-600" />
                  <span>Checkout más rápido</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-primary-600" />
                  <span>Seguimiento de pedidos</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-primary-600" />
                  <span>Ofertas exclusivas</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Política de privacidad */}
        <div className="text-center mt-6 animate-fade-in">
          <p className="text-xs text-gray-500">
            Al iniciar sesión, aceptas nuestros{' '}
            <Link href="/terms" className="text-primary-600 hover:underline">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="/privacy" className="text-primary-600 hover:underline">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}