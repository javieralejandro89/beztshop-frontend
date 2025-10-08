// src/app/auth/reset-password/page.tsx - Dark Tech Theme
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Shield,
  AlertTriangle,
} from 'lucide-react';

// Componente interno para manejar los search params
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tokenError, setTokenError] = useState('');

  // Validar token al montar el componente
  useEffect(() => {
    if (!token) {
      setTokenError('Token de recuperación no encontrado en la URL');
      return;
    }

    // Verificar que el token tenga el formato correcto (3 partes separadas por puntos)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      setTokenError('Token de recuperación inválido');
      return;
    }

    try {
      // Intentar decodificar el token para verificar que no esté corrupto
      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp < currentTime) {
        setTokenError('El enlace de recuperación ha expirado');
        return;
      }

      if (payload.type !== 'password-reset') {
        setTokenError('Tipo de token inválido');
        return;
      }
    } catch (error) {
      setTokenError('Token de recuperación corrupto');
    }
  }, [token]);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    if (error) setError('');
  };

  const validatePasswords = () => {
    if (!formData.newPassword) {
      setError('La nueva contraseña es requerida');
      return false;
    }

    if (formData.newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    // Validaciones adicionales de seguridad
    const hasUpperCase = /[A-Z]/.test(formData.newPassword);
    const hasLowerCase = /[a-z]/.test(formData.newPassword);
    const hasNumbers = /\d/.test(formData.newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword);

    if (!hasLowerCase || !hasNumbers) {
      setError('La contraseña debe contener al menos una letra y un número');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords() || !token) return;

    setIsLoading(true);
    setError('');

    try {
      await authApi.resetPassword(token, formData.newPassword);
      setIsSuccess(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al restablecer la contraseña';
      
      if (error.response?.data?.error?.includes('inválido') || 
          error.response?.data?.error?.includes('expirado')) {
        setTokenError(errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    const levels = [
      { strength: 0, label: 'Muy débil', color: 'text-red-400 bg-red-500/10' },
      { strength: 1, label: 'Débil', color: 'text-red-400 bg-red-500/10' },
      { strength: 2, label: 'Regular', color: 'text-yellow-400 bg-yellow-500/10' },
      { strength: 3, label: 'Buena', color: 'text-blue-400 bg-blue-500/10' },
      { strength: 4, label: 'Fuerte', color: 'text-cyan bg-cyan/10' },
      { strength: 5, label: 'Muy fuerte', color: 'text-cyan bg-cyan/20' },
    ];

    return levels[score] || levels[0];
  };

  // Si hay error de token, mostrar página de error
  if (tokenError) {
    return (
      <div className="min-h-screen bg-darkbg flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-glow-gold border-gold/20 bg-darkbg-light/90 backdrop-blur-sm animate-fade-in">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
              <AlertTriangle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Enlace Inválido
            </h2>
            <p className="text-gray-300 mb-6">
              {tokenError}
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg">
                <Link href="/auth/forgot-password">
                  Solicitar Nuevo Enlace
                </Link>
              </Button>
              <Button variant="ghost" asChild className="w-full text-white hover:text-gold hover:bg-darkbg">
                <Link href="/auth/login">
                  Volver al Login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si es exitoso, mostrar página de éxito
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-darkbg flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-glow-cyan border-gold/20 bg-darkbg-light/90 backdrop-blur-sm animate-fade-in">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan to-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-cyan animate-bounce-gentle">
              <CheckCircle className="h-10 w-10 text-darkbg" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              ¡Contraseña Actualizada!
            </h2>
            <p className="text-gray-300 mb-6">
              Tu contraseña ha sido restablecida exitosamente. 
              Ahora puedes iniciar sesión con tu nueva contraseña.
            </p>
            <Button 
              asChild 
              className="w-full bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg"
              onClick={() => {
                setTimeout(() => router.push('/auth/login'), 100);
              }}
            >
              <Link href="/auth/login">
                Iniciar Sesión
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="min-h-screen bg-darkbg flex items-center justify-center px-4 py-8">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-cyan/5 to-transparent rounded-full animate-pulse-gentle" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-gold/5 to-transparent rounded-full animate-pulse-gentle" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Botón volver */}
        <div className="mb-6 animate-fade-in">
          <Button 
            asChild 
            variant="ghost" 
            className="text-gray-400 hover:text-gold -ml-2"
          >
            <Link href="/auth/login">
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
                SP
              </div>
            </div>
            
            <CardTitle className="text-2xl font-bold text-white">
              Nueva Contraseña
            </CardTitle>
            <CardDescription className="text-gray-400">
              Ingresa tu nueva contraseña segura
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4 animate-fade-in">
                <div className="flex items-center text-red-400">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nueva contraseña */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-300 font-medium">
                  Nueva contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={formData.newPassword}
                    onChange={handleInputChange('newPassword')}
                    className={`pl-10 pr-10 bg-darkbg border-gold/30 text-white placeholder-gray-500 focus:border-gold focus:ring-2 focus:ring-gold/50 transition-all duration-200 ${
                      error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''
                    }`}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Indicador de fortaleza de contraseña */}
                {formData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Fortaleza:</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-darkbg-light rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          passwordStrength.strength <= 2 ? 'bg-red-500' :
                          passwordStrength.strength <= 3 ? 'bg-yellow-500' :
                          'bg-cyan'
                        }`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300 font-medium">
                  Confirmar contraseña
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirma tu contraseña"
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    className={`pl-10 pr-10 bg-darkbg border-gold/30 text-white placeholder-gray-500 focus:border-gold focus:ring-2 focus:ring-gold/50 transition-all duration-200 ${
                      error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''
                    }`}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Validación visual de coincidencia */}
                {formData.confirmPassword && (
                  <div className="flex items-center mt-2">
                    {formData.newPassword === formData.confirmPassword ? (
                      <div className="flex items-center text-cyan">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs">Las contraseñas coinciden</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-400">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs">Las contraseñas no coinciden</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botón de envío */}
              <Button
                type="submit"
                disabled={isLoading || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword}
                className={`w-full py-3 font-medium transition-all duration-300 ${
                  isLoading || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold shadow-glow-gold hover:shadow-glow-cyan transform hover:scale-105'
                } text-darkbg`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-darkbg mr-2" />
                    Actualizando contraseña...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Actualizar Contraseña
                  </div>
                )}
              </Button>
            </form>

            {/* Requerimientos de contraseña */}
            <div className="bg-gradient-to-r from-cyan/10 to-gold/10 rounded-lg p-4 border border-cyan/20">
              <h4 className="font-medium text-white mb-2">Requerimientos de seguridad:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li className={`flex items-center ${formData.newPassword.length >= 8 ? 'text-cyan' : ''}`}>
                  {formData.newPassword.length >= 8 ? '✓' : '•'} Al menos 8 caracteres
                </li>
                <li className={`flex items-center ${/[a-z]/.test(formData.newPassword) ? 'text-cyan' : ''}`}>
                  {/[a-z]/.test(formData.newPassword) ? '✓' : '•'} Una letra minúscula
                </li>
                <li className={`flex items-center ${/\d/.test(formData.newPassword) ? 'text-cyan' : ''}`}>
                  {/\d/.test(formData.newPassword) ? '✓' : '•'} Un número
                </li>
                <li className="text-gray-400">• Recomendado: mayúsculas y símbolos</li>
              </ul>
            </div>

            {/* Links adicionales */}
            <div className="text-center space-y-2">
              <p className="text-gray-400">
                ¿Recordaste tu contraseña?{' '}
                <Link 
                  href="/auth/login"
                  className="text-gold hover:text-cyan font-medium transition-colors"
                >
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Componente principal con Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-darkbg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}