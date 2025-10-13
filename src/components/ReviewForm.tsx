// src/components/ReviewForm.tsx - Formulario de reseña
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, AlertCircle, CheckCircle, X } from 'lucide-react';
import { reviewsApi } from '@/lib/api';

interface ReviewFormProps {
  productId: string;
  productName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({ 
  productId, 
  productName, 
  onSuccess, 
  onCancel 
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    if (comment.trim().length < 10) {
      setError('El comentario debe tener al menos 10 caracteres');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await reviewsApi.createReview({
        productId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim()
      });

      setSuccess(true);
      
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);

    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al enviar la reseña';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className="border-green-500/30 bg-green-500/10 animate-fade-in">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">¡Reseña Enviada!</h3>
          <p className="text-gray-300">
            ¡Tu reseña ha sido publicada! Aparecerá en la página del producto.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gold/20 bg-darkbg-light/90 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-white">Escribe tu opinión</CardTitle>
            <CardDescription className="text-gray-400">
              Comparte tu experiencia con {productName}
            </CardDescription>
          </div>
          {onCancel && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Calificación */}
          <div className="space-y-2">
            <Label className="text-gray-300 font-medium">
              Calificación <span className="text-red-400">*</span>
            </Label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-gold text-gold'
                        : 'text-gray-500'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-400">
                  ({rating}/5)
                </span>
              )}
            </div>
          </div>

          {/* Título (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-300 font-medium">
              Título (opcional)
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Resume tu opinión en pocas palabras"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="bg-darkbg border-gold/30 text-white placeholder-gray-500 focus:border-gold focus:ring-gold/50"
              disabled={isSubmitting}
            />
          </div>

          {/* Comentario */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-gray-300 font-medium">
              Tu opinión <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="comment"
              placeholder="Cuéntanos sobre tu experiencia con este producto..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              maxLength={1000}
              className="bg-darkbg border-gold/30 text-white placeholder-gray-500 focus:border-gold focus:ring-gold/50 resize-none"
              disabled={isSubmitting}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Mínimo 10 caracteres</span>
              <span>{comment.length}/1000</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4 animate-fade-in">
              <div className="flex items-center text-red-400">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
              className="flex-1 bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-darkbg mr-2" />
                  Enviando...
                </div>
              ) : (
                'Enviar Reseña'
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="border-gold/30 text-white hover:bg-gold/10 hover:border-gold/50"
              >
                Cancelar
              </Button>
            )}
          </div>

          {/* Nota */}
          <p className="text-xs text-gray-500 text-center">
             Tu reseña será visible inmediatamente para otros compradores
          </p>
        </form>
      </CardContent>
    </Card>
  );
}