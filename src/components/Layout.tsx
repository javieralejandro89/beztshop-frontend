// src/components/Layout.tsx - Layout principal con efectos visuales
'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowUp,
  Heart,
  Star,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Shield,
  Truck,
  RotateCcw,
  MessageCircle,
  Clock,
  Award,
  Gift,
} from 'lucide-react';
import Header from '@/components/Header';
import SideCart from '@/components/SideCart';
import { useCartStore } from '@/lib/cartStore';
import { useAuthStore } from '@/lib/store';

interface LayoutProps {
  children: ReactNode;
  showBackToTop?: boolean;
  showFooter?: boolean;
  className?: string;
}

export default function Layout({ 
  children, 
  showBackToTop = true, 
  showFooter = true,
  className = "" 
}: LayoutProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { totalItems } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  // Mostrar/ocultar botón de scroll to top
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <Header />
      
      {/* Contenido principal */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      {showFooter && <Footer />}

      {/* Side Cart */}
      <SideCart />

      {/* Botón scroll to top */}
      {showBackToTop && showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white p-3 rounded-full shadow-glow hover:shadow-glow-yellow transform hover:scale-110 transition-all duration-300 animate-bounce-gentle"
          aria-label="Volver arriba"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/18325230060"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 animate-pulse-gentle"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
      </a>

      {/* Floating Cart Indicator (solo en mobile cuando hay productos) */}
      {totalItems > 0 && (
        <div className="fixed bottom-20 right-6 z-40 md:hidden">
          <button
            onClick={() => useCartStore.getState().openCart()}
            className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-3 rounded-full shadow-glow relative animate-bounce-gentle"
          >
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full min-w-[20px] h-5 flex items-center justify-center text-xs animate-pulse">
              {totalItems}
            </Badge>
            <span className="sr-only">Ver carrito</span>
          </button>
        </div>
      )}

      {/* Toast/Notification Area - para futuras notificaciones */}
      <div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2" />
    </div>
  );
}

// Footer Component
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-800">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 flex items-center justify-center">
              <Gift className="h-6 w-6 mr-2" />
              ¡Suscríbete y Ahorra!
            </h3>
            <p className="text-primary-100 mb-6">
              Recibe ofertas exclusivas, novedades y un 10% de descuento en tu primera compra
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 border-0 focus:ring-2 focus:ring-white/50"
              />
              <Button className="bg-white text-primary-700 hover:bg-gray-100 px-6 py-3 font-medium">
                Suscribirse
              </Button>
            </div>
            <p className="text-xs text-primary-200 mt-3">
              No spam. Puedes cancelar en cualquier momento.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-3 py-1 rounded font-bold text-xl">
                SP
              </div>
              <span className="font-bold text-lg">ServiPro Garcia</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Tu tienda de confianza para productos especializados, tecnología y mucho más. 
              Calidad garantizada y servicio excepcional desde Houston, TX.
            </p>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">Houston, TX - Estados Unidos</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">(832) 523-0060</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">info@servipro-garcia.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-white">Enlaces Rápidos</h4>
            <div className="space-y-2">
              {[
                { name: 'Todos los Productos', href: '/products' },
                { name: 'Productos Destacados', href: '/products?featured=true' },
                { name: 'Ofertas', href: '/offers' },
                { name: 'Categorías', href: '/categories' },
                { name: 'Mi Cuenta', href: '/account' },
                { name: 'Seguimiento de Pedidos', href: '/orders' }
              ].map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-white">Atención al Cliente</h4>
            <div className="space-y-2">
              {[
                { name: 'Centro de Ayuda', href: '/help' },
                { name: 'Contacto', href: '/contact' },
                { name: 'Política de Devoluciones', href: '/returns' },
                { name: 'Envíos y Entregas', href: '/shipping' },
                { name: 'Términos y Condiciones', href: '/terms' },
                { name: 'Política de Privacidad', href: '/privacy' }
              ].map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            {/* Horarios */}
            <div className="space-y-2 pt-4">
              <div className="flex items-center text-gray-400">
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Horarios de Atención</span>
              </div>
              <div className="text-sm text-gray-500 space-y-1 ml-6">
                <div>Lun - Vie: 9:00 AM - 6:00 PM</div>
                <div>Sábados: 10:00 AM - 4:00 PM</div>
                <div>Domingos: Cerrado</div>
              </div>
            </div>
          </div>

          {/* Social & Trust */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-white">Síguenos</h4>
            <div className="flex space-x-3">
              {[
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Youtube, href: '#', label: 'YouTube' }
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="bg-gray-800 hover:bg-primary-600 p-2 rounded-lg transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="space-y-3 pt-4">
              <h5 className="font-medium text-white text-sm">Garantías y Seguridad</h5>
              <div className="space-y-2">
                <div className="flex items-center text-gray-400 text-sm">
                  <Shield className="h-4 w-4 mr-2 text-green-400" />
                  Compra 100% Segura
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <Truck className="h-4 w-4 mr-2 text-blue-400" />
                  Envío con Seguimiento
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <RotateCcw className="h-4 w-4 mr-2 text-yellow-400" />
                  Garantía de 30 Días
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <Award className="h-4 w-4 mr-2 text-purple-400" />
                  Satisfacción Garantizada
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3 pt-4">
              <h5 className="font-medium text-white text-sm">Métodos de Pago</h5>
              <div className="flex space-x-2">
                <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold">
                  VISA
                </div>
                <div className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold">
                  MC
                </div>
                <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded font-bold">
                  AMEX
                </div>
                <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded font-bold">
                  ZELLE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © {currentYear} ServiPro Garcia LLC. Todos los derechos reservados.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Diseñado con ❤️ en Houston, Texas
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link 
                href="/terms" 
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                Términos
              </Link>
              <Link 
                href="/privacy" 
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                Privacidad
              </Link>
              <Link 
                href="/sitemap" 
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}