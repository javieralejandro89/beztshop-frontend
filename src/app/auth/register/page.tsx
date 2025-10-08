// src/app/auth/register/page.tsx - Página de registro - Dark Tech Theme
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
  User,
  Phone,
  Zap,
  Shield,
  Star,
  Gift,
  Check,
} from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useCartStore } from '@/lib/cartStore';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  subscribeNewsletter: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  
  const { login, isAuthenticated } = useAuthStore();
  const { totalItems } = useCartStore();
  
  const [formData, setFormData] = useState<RegisterFormData>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
  subscribeNewsletter: true,
});
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (isAuthenticated && !registerSuccess) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo, registerSuccess]);

  useEffect(() => {
    const calculateStrength = (password: string) => {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[a-z]/.test(password)) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      return strength;
    };
    
    setPasswordStrength(calculateStrength(formData.password));
  }, [formData.password]);

  const handleInputChange = (field: keyof RegisterFormData, value: string | boolean) => {
  setFormData((prev: RegisterFormData) => ({ ...prev, [field]: value }));
  
  if (errors[field]) {
    setErrors((prev: Record<string, string>) => ({ ...prev, [field]: '' }));
  }
};

  const validateForm = () => {
  const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'El apellido debe tener al menos 2 caracteres';
    }
    
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (passwordStrength < 3) {
      newErrors.password = 'La contraseña es muy débil';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await authApi.register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
      });
      
      setRegisterSuccess(true);
      login(response.user, response.accessToken);
      
      setTimeout(() => {
        router.push(redirectTo);
      }, 2000);
      
    } catch (error: any) {
  setErrors((prev: Record<string, string>) => ({
    ...prev,
    submit: error.response?.data?.error || 'Error al crear la cuenta'
  }));
} finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = (provider: 'google' | 'facebook') => {
    console.log(`Register with ${provider}`);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-blue-500';
      case 5: return 'bg-green-500';
      default: return 'bg-gray-600';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return 'Muy débil';
      case 2: return 'Débil';
      case 3: return 'Buena';
      case 4: return 'Fuerte';
      case 5: return 'Muy fuerte';
      default: return '';
    }
  };

  if (registerSuccess) {
    return (
      <div className="min-h-screen bg-darkbg flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-glow-cyan border-gold/20 bg-darkbg-light/90 backdrop-blur-sm animate-fade-in">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan to-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-cyan animate-bounce-gentle">
              <CheckCircle className="h-10 w-10 text-darkbg" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              ¡Cuenta creada exitosamente!
            </h2>
            <p className="text-gray-300 mb-6">
              Bienvenido a BeztShop. Tu cuenta ha sido creada y ya puedes disfrutar de todos nuestros beneficios.
            </p>
            <div className="space-y-3 text-left bg-gradient-to-r from-cyan/10 to-gold/10 rounded-lg p-4 border border-cyan/20">
              <div className="flex items-center text-cyan">
                <Gift className="h-4 w-4 mr-2" />
                <span className="text-sm">10% de descuento en tu primera compra</span>
              </div>
              <div className="flex items-center text-cyan">
                <Shield className="h-4 w-4 mr-2" />
                <span className="text-sm">Envío gratuito en pedidos +$100</span>
              </div>
              <div className="flex items-center text-cyan">
                <Star className="h-4 w-4 mr-2" />
                <span className="text-sm">Acceso a ofertas exclusivas</span>
              </div>
            </div>
            <div className="w-full bg-darkbg-light rounded-full h-2 mt-6">
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
            <Link href={`/auth/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al login
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
              Crear Cuenta
            </CardTitle>
            <CardDescription className="text-gray-400">
              Únete a BeztShop y disfruta de beneficios exclusivos
              {totalItems > 0 && (
                <span className="block mt-2 text-gold font-medium">
                  Tienes {totalItems} producto{totalItems !== 1 ? 's' : ''} esperándote
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

            {/* Beneficios destacados */}
            <div className="bg-gradient-to-r from-cyan/10 to-gold/10 rounded-lg p-4 border border-cyan/20">
              <h4 className="font-medium text-white mb-3 flex items-center">
                <Gift className="h-5 w-5 mr-2 text-gold" />
                Al crear tu cuenta obtienes:
              </h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-cyan" />
                  <span>10% de descuento en tu primera compra</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-cyan" />
                  <span>Envío gratis en compras +$100</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-cyan" />
                  <span>Acceso a ofertas exclusivas</span>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombres */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-300 font-medium">
                    Nombre *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Tu nombre"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`pl-10 bg-darkbg border-gold/30 text-white placeholder-gray-500 focus:border-gold focus:ring-2 focus:ring-gold/50 transition-all duration-200 ${
                        errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''
                      }`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-400 text-xs flex items-center animate-fade-in">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-300 font-medium">
                    Apellido *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Tu apellido"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`bg-darkbg border-gold/30 text-white placeholder-gray-500 focus:border-gold focus:ring-2 focus:ring-gold/50 transition-all duration-200 ${
                      errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''
                    }`}
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <p className="text-red-400 text-xs flex items-center animate-fade-in">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 font-medium">
                  Correo electrónico *
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

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300 font-medium">
                  Teléfono (opcional)
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10 bg-darkbg border-gold/30 text-white placeholder-gray-500 focus:border-gold focus:ring-2 focus:ring-gold/50 transition-all duration-200"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 font-medium">
                  Contraseña *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Crea una contraseña segura"
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

                {/* Indicador de fuerza de contraseña */}
                {formData.password && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-darkbg-light rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 min-w-[70px]">
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      <p>La contraseña debe incluir:</p>
                      <ul className="list-none space-y-1 mt-1">
                        <li className={`flex items-center ${formData.password.length >= 8 ? 'text-cyan' : 'text-gray-500'}`}>
                          <Check className="h-3 w-3 mr-1" />
                          Al menos 8 caracteres
                        </li>
                        <li className={`flex items-center ${/[a-z]/.test(formData.password) ? 'text-cyan' : 'text-gray-500'}`}>
                          <Check className="h-3 w-3 mr-1" />
                          Una letra minúscula
                        </li>
                        <li className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-cyan' : 'text-gray-500'}`}>
                          <Check className="h-3 w-3 mr-1" />
                          Una letra mayúscula
                        </li>
                        <li className={`flex items-center ${/[0-9]/.test(formData.password) ? 'text-cyan' : 'text-gray-500'}`}>
                          <Check className="h-3 w-3 mr-1" />
                          Un número
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="text-red-400 text-sm flex items-center animate-fade-in">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300 font-medium">
                  Confirmar contraseña *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirma tu contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`pl-10 pr-10 bg-darkbg border-gold/30 text-white placeholder-gray-500 focus:border-gold focus:ring-2 focus:ring-gold/50 transition-all duration-200 ${
                      errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="flex items-center text-cyan text-sm animate-fade-in">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Las contraseñas coinciden
                  </div>
                )}
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm flex items-center animate-fade-in">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Términos y newsletter */}
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleInputChange('acceptTerms', !!checked)}
                    className="data-[state=checked]:bg-gold data-[state=checked]:border-gold mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="acceptTerms" className="text-sm text-gray-300 cursor-pointer">
                      Acepto los{' '}
                      <Link href="/terms" className="text-gold hover:underline">
                        términos y condiciones
                      </Link>{' '}
                      y la{' '}
                      <Link href="/privacy" className="text-gold hover:underline">
                        política de privacidad
                      </Link>
                    </Label>
                  </div>
                </div>
                {errors.acceptTerms && (
                  <p className="text-red-400 text-sm flex items-center animate-fade-in">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.acceptTerms}
                  </p>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="subscribeNewsletter"
                    checked={formData.subscribeNewsletter}
                    onCheckedChange={(checked) => handleInputChange('subscribeNewsletter', !!checked)}
                    className="data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                  />
                  <Label htmlFor="subscribeNewsletter" className="text-sm text-gray-400 cursor-pointer">
                    Quiero recibir ofertas y novedades por email
                  </Label>
                </div>
              </div>

              {/* Botón de registro */}
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
                    Creando cuenta...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Crear Cuenta
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </div>
                )}
              </Button>
            </form>            

            {/* Login */}
            <div className="text-center">
              <p className="text-gray-400">
                ¿Ya tienes una cuenta?{' '}
                <Link 
                  href={`/auth/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                  className="text-gold hover:text-cyan font-medium transition-colors"
                >
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Seguridad */}
        <div className="text-center mt-6 animate-fade-in">
          <div className="flex items-center justify-center text-sm text-gray-500 mb-2">
            <Shield className="h-4 w-4 mr-2 text-cyan" />
            Tus datos están seguros y protegidos
          </div>
        </div>
      </div>
    </div>
  );
}