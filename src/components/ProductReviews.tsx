// src/components/ProductReviews.tsx - Lista de reseñas con estadísticas
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, User, MessageSquare, CheckCircle } from 'lucide-react';
import { reviewsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import ReviewForm from './ReviewForm';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean;
  createdAt: string;
  user: {
    name: string;
    firstName: string;
  };
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
  onReviewUpdate?: () => void;
}

export default function ProductReviews({ productId, productName, onReviewUpdate }: ProductReviewsProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [userReview, setUserReview] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadReviews();
    if (isAuthenticated) {
      checkUserReview();
    }
  }, [productId, page]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const data = await reviewsApi.getProductReviews(productId, { page, limit: 10 });
      setReviews(data.reviews);
      setStats(data.stats);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error cargando reseñas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserReview = async () => {
    try {
      const data = await reviewsApi.checkUserReview(productId);
      setHasReviewed(data.hasReviewed);
      setUserReview(data.review);
    } catch (error) {
      console.error('Error verificando reseña del usuario:', error);
    }
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    setShowForm(true);
  };

  const handleReviewSuccess = async () => {
  setShowForm(false);
  setHasReviewed(true);
  await loadReviews();
  await checkUserReview();
  
  // Esperar un momento para que el backend actualice stats
  setTimeout(() => {
    if (onReviewUpdate) {
      onReviewUpdate();
    }
  }, 500);
};

  // Renderizar estrellas
  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'fill-gold text-gold' : 'text-gray-500'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading && reviews.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse bg-darkbg-light/50">
            <CardContent className="p-6">
              <div className="h-4 bg-darkbg rounded w-1/4 mb-4"></div>
              <div className="h-20 bg-darkbg rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas de reseñas */}
      {stats && stats.totalReviews > 0 && (
        <Card className="border-gold/20 bg-darkbg-light/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Rating promedio */}
              <div className="text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4">
                  <div>
                    <div className="text-5xl font-bold bg-gradient-to-r from-gold to-cyan bg-clip-text text-transparent">
                      {stats.averageRating.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">de 5.0</div>
                  </div>
                  <div className="space-y-1">
                    {renderStars(Math.round(stats.averageRating), 'lg')}
                    <p className="text-sm text-gray-400">
                      {stats.totalReviews} {stats.totalReviews === 1 ? 'reseña' : 'reseñas'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Distribución de ratings */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.distribution[rating as keyof typeof stats.distribution];
                  const percentage = stats.totalReviews > 0
                    ? Math.round((count / stats.totalReviews) * 100)
                    : 0;

                  return (
                    <div key={rating} className="flex items-center space-x-3">
                      <span className="text-sm text-gray-400 w-12">{rating} ⭐</span>
                      <div className="flex-1 h-2 bg-darkbg rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-gold to-cyan transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 w-12 text-right">
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botón para escribir reseña */}
      {!showForm && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">
            Opiniones de clientes
          </h3>
          {!hasReviewed ? (
  <Button
    onClick={handleWriteReview}
    className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-bold"
  >
    <MessageSquare className="h-4 w-4 mr-2" />
    Escribir opinión
  </Button>
) : (
  <div className="text-sm text-green-400 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/30 flex items-center gap-2">
    <CheckCircle className="h-4 w-4" />
    Ya dejaste tu reseña
  </div>
)}
        </div>
      )}

      {/* Formulario de reseña */}
      {showForm && (
        <div className="animate-fade-in">
          <ReviewForm
            productId={productId}
            productName={productName}
            onSuccess={handleReviewSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Lista de reseñas */}
      {reviews.length === 0 ? (
        <Card className="border-gold/20 bg-darkbg-light/90 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Aún no hay reseñas
            </h3>
            <p className="text-gray-400 mb-4">
              Sé el primero en compartir tu opinión sobre este producto
            </p>
            {!hasReviewed && (
              <Button
                onClick={handleWriteReview}
                className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-bold"
              >
                Escribir la primera reseña
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="border-gold/20 bg-darkbg-light/90 backdrop-blur-sm hover:border-gold/40 transition-all"
            >
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gold to-cyan flex items-center justify-center">
                      <User className="h-5 w-5 text-darkbg" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{review.user.name}</p>
                      <p className="text-sm text-gray-400">
                        {formatDateShort(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  {review.isVerified && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30">
                      Compra verificada
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="mb-3">
                  {renderStars(review.rating)}
                </div>

                {/* Título */}
                {review.title && (
                  <h4 className="font-semibold text-white mb-2">{review.title}</h4>
                )}

                {/* Comentario */}
                {review.comment && (
                  <p className="text-gray-300 leading-relaxed">{review.comment}</p>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="border-gold/30 text-white hover:bg-gold/10 hover:border-gold/50 disabled:opacity-50"
              >
                Anterior
              </Button>
              <span className="flex items-center px-4 text-gray-400">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="border-gold/30 text-white hover:bg-gold/10 hover:border-gold/50 disabled:opacity-50"
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}