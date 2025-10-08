// src/app/admin/login/page.tsx - Página de login del admin Dark Tech
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.login(data);
      
      // Verificar que sea admin
      if (response.user.role !== 'ADMIN') {
        setError('Acceso denegado. Solo administradores pueden acceder.');
        return;
      }

      // Guardar en store y localStorage
      login(response.user, response.accessToken);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Redirigir al dashboard
      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.error || 
        'Error de conexión. Verifica que el servidor esté funcionando.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-darkbg p-4">
      <Card className="w-full max-w-md shadow-glow-gold bg-darkbg-light border-gold/20">
        <CardHeader className="space-y-1 text-center border-b border-gold/10 pb-6">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gold to-cyan bg-clip-text text-transparent">
            BeztShop
          </CardTitle>
          <CardDescription className="text-gray-400">
            Panel de Administración
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@beztshop.com"
                {...register('email')}
                className="transition-colors bg-darkbg border-gold/20 text-white placeholder-gray-500 focus:border-gold focus:ring-gold/50"
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="transition-colors bg-darkbg border-gold/20 text-white placeholder-gray-500 focus:border-gold focus:ring-gold/50"
              />
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-semibold transition-all shadow-lg hover:shadow-glow-gold"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
}