'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategorySelector } from '@/components/categories/category-selector';
import { SubcategorySelector } from '@/components/categories/subcategory-selector';
import { LanguageSelector } from '@/components/ui/language-selector';
import { ImageUpload } from '@/components/ui/image-upload';
import { validatePostData } from '@/lib/post-utils';
import { PostWithAuthorAndCategory, PostWithAuthorAndCategorySelect } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { FormErrors, FieldError } from '@/components/ui/form-errors';
import { LoadingOverlay } from '@/components/ui/loading-states';
import { handleAPIError, getErrorMessage } from '@/lib/form-validation';

interface PostFormProps {
  post?: PostWithAuthorAndCategory | PostWithAuthorAndCategorySelect;
  onSuccess?: () => void;
}

export function PostForm({ post, onSuccess }: PostFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!post;

  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    language: post?.language || 'en',
    categoryId: post?.categoryId || '',
    subcategoryId: post?.subcategory?.id || '',
    imageUrl: post?.imageUrl || '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validation = validatePostData({
      title: formData.title,
      content: formData.content,
      language: formData.language,
      categoryId: formData.categoryId,
      subcategoryId: formData.subcategoryId,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      setFieldErrors({
        title: validation.errors.find(e => e.includes('title')) || '',
        content: validation.errors.find(e => e.includes('content')) || '',
        categoryId: validation.errors.find(e => e.includes('category')) || '',
      });
      return;
    }

    setLoading(true);
    setErrors([]);
    setFieldErrors({});

    try {
      const url = isEditing ? `/api/posts/${post.id}` : '/api/posts';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          language: formData.language,
          categoryId: formData.categoryId,
          subcategoryId: formData.subcategoryId || undefined,
          imageUrl: formData.imageUrl || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = handleAPIError(response, data);
        throw new Error(errorMessage);
      }

      toast({
        title: 'Success',
        description: `Post ${isEditing ? 'updated' : 'created'} successfully`,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} post:`, error);
      const errorMessage = getErrorMessage(error);
      setErrors([errorMessage]);

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Clear category and subcategory when language changes
    if (field === 'language') {
      setFormData(prev => ({ ...prev, language: value, categoryId: '', subcategoryId: '' }));
    }
    // Clear subcategory when category changes
    else if (field === 'categoryId') {
      setFormData(prev => ({ ...prev, categoryId: value, subcategoryId: '' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <LoadingOverlay
      isLoading={loading}
      loadingText={isEditing ? 'Updating post...' : 'Creating post...'}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Edit Post' : 'Create New Post'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Error messages */}
          <FormErrors
            errors={errors}
            className="mb-6"
            dismissible
            onDismiss={() => setErrors([])}
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter post title"
                required
                maxLength={200}
              />
              <FieldError error={fieldErrors.title} />
            </div>

            {/* Language */}
            <LanguageSelector
              value={formData.language}
              onValueChange={(value) => handleInputChange('language', value)}
              required
            />

            {/* Category */}
            <CategorySelector
              language={formData.language}
              value={formData.categoryId}
              onValueChange={(value) => handleInputChange('categoryId', value)}
              required
            />

            {/* Subcategory */}
            <SubcategorySelector
              categoryId={formData.categoryId}
              value={formData.subcategoryId}
              onValueChange={(value) => handleInputChange('subcategoryId', value)}
            />

            {/* Cover Image */}
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <ImageUpload
                currentImage={formData.imageUrl}
                onImageUpload={(imageUrl) => handleInputChange('imageUrl', imageUrl)}
                onImageRemove={() => handleInputChange('imageUrl', '')}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                Optional: Upload a cover image for your post
              </p>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Write your post content here..."
                required
                rows={12}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-vertical bg-background text-foreground"
              />
              <FieldError error={fieldErrors.content} />
            </div>



            {/* Submit buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
              >
                {loading
                  ? (isEditing ? 'Updating...' : 'Creating...')
                  : (isEditing ? 'Update Post' : 'Create Post')
                }
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </LoadingOverlay>
  );
}