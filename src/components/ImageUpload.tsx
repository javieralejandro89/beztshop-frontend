// src/components/ImageUpload.tsx - Componente para subir imágenes
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { productsApi } from '@/lib/api';

interface ImageData {
  url: string;
  publicId: string;
  originalName: string;
}

interface ImageUploadProps {
  images: ImageData[];
  onImagesChange: (images: ImageData[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export default function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 5,
  disabled = false 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Verificar límite de imágenes
    if (images.length + files.length > maxImages) {
      setUploadError(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      const response = await productsApi.uploadImages(formData);
      
      // Agregar las nuevas imágenes al array existente
      const newImages = [...images, ...response.images];
      onImagesChange(newImages);

    } catch (error: any) {
      console.error('Error uploading images:', error);
      setUploadError(error.response?.data?.error || 'Error al subir imágenes');
    } finally {
      setIsUploading(false);
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async (index: number) => {
  const imageToRemove = images[index];
  
  try {
    // ENVIAR EL publicId COMPLETO, no extraer solo la parte final
    await productsApi.deleteImage(imageToRemove.publicId);
    
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
    
  } catch (error: any) {
    console.error('Error deleting image:', error);
    alert('Error al eliminar imagen');
  }
};

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Botón de subida */}
      <div>
        <Button 
          type="button"
          variant="outline" 
          onClick={triggerFileInput}
          disabled={disabled || isUploading || images.length >= maxImages}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Subiendo...' : 'Subir Imágenes'}
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <p className="text-xs text-gray-500 mt-1">
          Máximo {maxImages} imágenes. Formatos: JPG, PNG, WebP (máx. 5MB cada una)
        </p>
      </div>

      {/* Error de subida */}
      {uploadError && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
          {uploadError}
        </div>
      )}

      {/* Preview de imágenes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={image.publicId} className="relative group">
              <CardContent className="p-2">
                <div className="aspect-square relative overflow-hidden rounded-md bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.originalName}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Botón de eliminar */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </button>
                  
                  {/* Indicador de imagen principal */}
                  {index === 0 && (
                    <div className="absolute bottom-1 left-1 px-2 py-1 bg-primary-600 text-white text-xs rounded">
                      Principal
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {image.originalName}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estado vacío */}
      {images.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No hay imágenes</p>
            <p className="text-sm text-gray-400">
              Haz clic en "Subir Imágenes" para agregar fotos del producto
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}