// src/components/Layout.tsx - Layout Dark Tech Theme
'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowUp,
  Heart,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Shield,
  Truck,
  RotateCcw,
  MessageCircle,
  Clock,
  Award,
  Zap,
} from 'lucide-react';
import Header from '@/components/Header';
import SideCart from '@/components/SideCart';
import { useCartStore } from '@/lib/cartStore';

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
    <div className={`min-h-screen flex flex-col bg-darkbg ${className}`}>
      <Header />
      
      <main className="flex-1">
        {children}
      </main>

      {showFooter && <Footer />}

      <SideCart />

      {showBackToTop && showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg p-3 rounded-full shadow-glow-gold hover:shadow-glow-cyan transform hover:scale-110 transition-all duration-300 animate-bounce-gentle"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/529985780385"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-cyan to-gold hover:from-gold hover:to-cyan text-darkbg p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 animate-pulse-gentle"
        aria-label="Contact via WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
      </a>

      {totalItems > 0 && (
        <div className="fixed bottom-20 right-6 z-40 md:hidden">
          <button
            onClick={() => useCartStore.getState().openCart()}
            className="bg-gradient-to-r from-gold to-cyan text-darkbg p-3 rounded-full shadow-glow-gold relative animate-bounce-gentle"
          >
            <Badge className="absolute -top-2 -right-2 bg-darkbg text-gold rounded-full min-w-[20px] h-5 flex items-center justify-center text-xs animate-pulse">
              {totalItems}
            </Badge>
            <span className="sr-only">Ver carrito</span>
          </button>
        </div>
      )}

      <div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2" />
    </div>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-darkbg text-white border-t border-gold/10">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-darkbg-light to-darkbg border-b border-gold/10">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 flex items-center justify-center text-gold">
              <Zap className="h-6 w-6 mr-2" />
              Suscríbete y ahorra!
            </h3>
            <p className="text-gray-400 mb-6">
              Recibe ofertas exclusivas, novedades y un 10% de descuento en tu primera compra
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 px-4 py-3 rounded-lg text-white bg-darkbg-light border border-gold/20 focus:ring-2 focus:ring-gold/50"
              />
              <Button className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg px-6 py-3 font-medium">
                Suscríbete
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Sin spam. Cancela cuando quieras.
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
              <div className="bg-gradient-to-r from-gold to-cyan text-darkbg px-3 py-1 rounded font-bold text-xl">
                BZ
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-gold to-cyan bg-clip-text text-transparent">BeztShop</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Su destino premium para tecnología y electrónica de vanguardia. 
              Calidad garantizada y servicio excepcional desde CDMX, México.
            </p>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-gold" />
                <span className="text-sm">Ciudad de México - México</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 flex-shrink-0 text-cyan" />
                <span className="text-sm">(998) 578-0385</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0 text-gold" />
                <span className="text-sm">atencionalcliente@beztshop.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-white">Enlaces rápidos</h4>
            <div className="space-y-2">
              {[
                { name: 'All Products', href: '/products' },
                { name: 'Featured Products', href: '/products?featured=true' },
                { name: 'Offers', href: '/offers' },
                { name: 'Categories', href: '/categories' },
                { name: 'My Account', href: '/account' },
                { name: 'Order Tracking', href: '/orders' }
              ].map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-gray-400 hover:text-gold transition-colors text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-white">Servicio al cliente</h4>
            <div className="space-y-2">
              {[
                { name: 'Help Center', href: '/help' },
                { name: 'Contact', href: '/contact' },
                { name: 'Return Policy', href: '/returns' },
                { name: 'Shipping & Delivery', href: '/shipping' },
                { name: 'Terms & Conditions', href: '/terms' },
                { name: 'Privacy Policy', href: '/privacy' }
              ].map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-gray-400 hover:text-cyan transition-colors text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className="space-y-2 pt-4">
              <div className="flex items-center text-gray-400">
                <Clock className="h-4 w-4 mr-2 text-gold" />
                <span className="text-sm font-medium">Horario comercial</span>
              </div>
              <div className="text-sm text-gray-500 space-y-1 ml-6">
                <div>Lunes - Viernes: 9:00 AM - 6:00 PM</div>
                <div>Sábado: 10:00 AM - 4:00 PM</div>
                <div>Domingo: Cerrado</div>
              </div>
            </div>
          </div>

          {/* Social & Trust */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-white">Síganos</h4>
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
                  className="bg-darkbg-light hover:bg-gradient-to-r hover:from-gold hover:to-cyan p-2 rounded-lg transition-all duration-300 hover:scale-110"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            <div className="space-y-3 pt-4">
              <h5 className="font-medium text-white text-sm">Garantías y seguridad</h5>
              <div className="space-y-2">
                <div className="flex items-center text-gray-400 text-sm">
                  <Shield className="h-4 w-4 mr-2 text-gold" />
                  Compra 100% segura
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <Truck className="h-4 w-4 mr-2 text-cyan" />
                  Envío con seguimiento
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <RotateCcw className="h-4 w-4 mr-2 text-gold" />
                  Garantía de 30 días
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <Award className="h-4 w-4 mr-2 text-cyan" />
                  Satisfacción garantizada
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h5 className="font-medium text-white text-sm">Métodos de pago</h5>
              <div className="flex space-x-2">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs px-2 py-1 rounded font-bold">
                  VISA
                </div>
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white text-xs px-2 py-1 rounded font-bold">
                  MC
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-2 py-1 rounded font-bold">
                  AMEX
                </div>
                <div className="bg-gradient-to-r from-gold to-cyan text-darkbg text-xs px-2 py-1 rounded font-bold">
                  ZELLE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gold/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © {currentYear} BeztShop. Reservados todos los derechos.
              </p>              
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link 
                href="/terms" 
                className="text-gray-400 hover:text-gold transition-colors"
              >
                Términos
              </Link>
              <Link 
                href="/privacy" 
                className="text-gray-400 hover:text-cyan transition-colors"
              >
                Privacidad
              </Link>
              <Link 
                href="/sitemap" 
                className="text-gray-400 hover:text-gold transition-colors"
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