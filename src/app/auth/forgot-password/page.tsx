// src/app/auth/forgot-password/page.tsx - Dark Tech Theme
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Mail,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Send,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('El email es requerido');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email inválido');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.forgotPassword(email);
      
      setIsSuccess(true);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al enviar email de recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-darkbg flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-glow-cyan border-gold/20 bg-darkbg-light/90 backdrop-blur-sm animate-fade-in">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan to-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-cyan animate-bounce-gentle">
              <CheckCircle className="h-10 w-10 text-darkbg" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              ¡Email Enviado!
            </h2>
            <p className="text-gray-300 mb-6">
              Hemos enviado un enlace de recuperación a <strong className="text-gold">{email}</strong>. 
              Revisa tu bandeja de entrada y spam.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg">
                <Link href="/auth/login">
                  Volver al Login
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setIsSuccess(false)}
                className="w-full text-white hover:text-gold hover:bg-darkbg"
              >
                Enviar a otro email
              </Button>
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
              Recuperar Contraseña
            </CardTitle>
            <CardDescription className="text-gray-400">
              Ingresa tu email para recibir un enlace de recuperación
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
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    className={`pl-10 bg-darkbg border-gold/30 text-white placeholder-gray-500 focus:border-gold focus:ring-2 focus:ring-gold/50 transition-all duration-200 ${
                      error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''
                    }`}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Botón de envío */}
              <Button
                type="submit"
                disabled={isLoading || !email}
                className={`w-full py-3 font-medium transition-all duration-300 ${
                  isLoading || !email
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold shadow-glow-gold hover:shadow-glow-cyan transform hover:scale-105'
                } text-darkbg`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-darkbg mr-2" />
                    Enviando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Send className="h-5 w-5 mr-2" />
                    Enviar Enlace de Recuperación
                  </div>
                )}
              </Button>
            </form>

            {/* Información adicional */}
            <div className="bg-gradient-to-r from-cyan/10 to-gold/10 rounded-lg p-4 border border-cyan/20">
              <h4 className="font-medium text-white mb-2">¿Cómo funciona?</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Te enviaremos un enlace seguro a tu email</li>
                <li>• El enlace será válido por 1 hora</li>
                <li>• Podrás crear una nueva contraseña</li>
                <li>• Tu sesión actual seguirá activa</li>
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
              <p className="text-gray-400">
                ¿No tienes cuenta?{' '}
                <Link 
                  href="/auth/register"
                  className="text-gold hover:text-cyan font-medium transition-colors"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}