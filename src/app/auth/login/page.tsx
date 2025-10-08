// src/app/auth/login/page.tsx - Página de login - Dark Tech Theme
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

  useEffect(() => {
    if (isAuthenticated && !loginSuccess) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo, loginSuccess]);

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
  setFormData((prev: LoginFormData) => ({ ...prev, [field]: value }));
  
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
    
    setLoginSuccess(true);
    login(response.user, response.accessToken);
    
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
    console.log(`Login with ${provider}`);
  };

  if (loginSuccess) {
    return (
      <div className="min-h-screen bg-darkbg flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-glow-cyan border-gold/20 bg-darkbg-light/90 backdrop-blur-sm animate-fade-in">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan to-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-cyan animate-bounce-gentle">
              <CheckCircle className="h-10 w-10 text-darkbg" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              ¡Bienvenido de vuelta!
            </h2>
            <p className="text-gray-300 mb-6">
              Has iniciado sesión exitosamente. Redirigiendo...
            </p>
            <div className="w-full bg-darkbg-light rounded-full h-2">
              <div className="bg-gradient-to-r from-gold to-cyan h-2 rounded-full animate-pulse w-full shadow-glow-gold" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkbg flex items-center justify-center px-4 py-8">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-gold/5 to-transparent rounded-full animate-pulse-gentle" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan/5 to-transparent rounded-full animate-pulse-gentle" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Botón volver */}
        <div className="mb-6 animate-fade-in">
          <Button 
            asChild 
            variant="ghost" 
            className="text-gray-400 hover:text-gold -ml-2"
          >
            <Link href={redirectTo === '/' ? '/' : '/products'}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
        </div>

        <Card className="shadow-glow-gold border-gold/20 bg-darkbg-light/90 backdrop-blur-sm animate-fade-in">
          <CardHeader className="text-center pb-2">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-gold to-cyan text-darkbg px-6 py-2 rounded-lg font-bold text-2xl shadow-glow-gold animate-bounce-gentle">
                BS
              </div>
            </div>
            
            <CardTitle className="text-2xl font-bold text-white">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-gray-400">
              Accede a tu cuenta de BeztShop
              {totalItems > 0 && (
                <span className="block mt-2 text-gold font-medium">
                  Tienes {totalItems} producto{totalItems !== 1 ? 's' : ''} en tu carrito
                </span>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error global */}
            {errors.submit && (
              <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4 animate-fade-in">
                <div className="flex items-center text-red-400">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">{errors.submit}</span>
                </div>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 font-medium">
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
                    className={`pl-10 bg-darkbg border-gold/30 text-white placeholder-gray-500 focus:border-gold focus:ring-2 focus:ring-gold/50 transition-all duration-200 ${
                      errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm flex items-center animate-fade-in">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 font-medium">
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
                    className={`pl-10 pr-10 bg-darkbg border-gold/30 text-white placeholder-gray-500 focus:border-gold focus:ring-2 focus:ring-gold/50 transition-all duration-200 ${
                      errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm flex items-center animate-fade-in">
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
                    className="data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-400 cursor-pointer">
                    Recordarme
                  </Label>
                </div>
                
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-gold hover:text-cyan transition-colors"
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
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold shadow-glow-gold hover:shadow-glow-cyan transform hover:scale-105'
                } text-darkbg`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-darkbg mr-2" />
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
              <p className="text-gray-400">
                ¿No tienes una cuenta?{' '}
                <Link 
                  href={`/auth/register${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                  className="text-gold hover:text-cyan font-medium transition-colors"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>

            {/* Beneficios de crear cuenta */}
            <div className="bg-gradient-to-r from-cyan/10 to-gold/10 rounded-lg p-4 border border-cyan/20">
              <h4 className="font-medium text-white mb-2">Beneficios de tener una cuenta:</h4>
              <div className="space-y-1 text-sm text-gray-300">
                <div className="flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-gold" />
                  <span>Checkout más rápido</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-gold" />
                  <span>Seguimiento de pedidos</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-gold" />
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
            <Link href="/terms" className="text-gold hover:underline">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="/privacy" className="text-gold hover:underline">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}