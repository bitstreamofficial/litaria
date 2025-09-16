import { useState, useCallback } from 'react';
import { isNetworkError, getErrorMessage } from '@/lib/form-validation';

interface UseImageUploadOptions {
  onSuccess?: (imageUrl: string) => void;
  onError?: (error: string) => void;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    maxFileSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  } = options;

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`;
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `File type must be one of: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`;
    }

    return null;
  }, [maxFileSize, allowedTypes]);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setError(null);

    try {
      // Validate file before upload
      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      const imageUrl = result.imageUrl;
      options.onSuccess?.(imageUrl);
      return imageUrl;
    } catch (err) {
      console.error('Image upload error:', err);
      
      let errorMessage: string;
      if (isNetworkError(err)) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage = getErrorMessage(err);
      }
      
      setError(errorMessage);
      options.onError?.(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [options, validateFile]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadImage,
    isUploading,
    error,
    clearError,
    validateFile,
  };
}