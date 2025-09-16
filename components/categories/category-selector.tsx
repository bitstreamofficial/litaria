'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Category {
  id: string;
  name: string;
  _count?: {
    posts: number;
  };
}

interface CategorySelectorProps {
  language?: string;
  value?: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}

export function CategorySelector({ 
  language,
  value, 
  onValueChange, 
  required = false, 
  disabled = false 
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (language) {
      fetchCategories();
    } else {
      setCategories([]);
    }
  }, [language]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const url = language ? `/api/categories?language=${language}` : '/api/categories';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data.categories || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  if (!language) {
    return (
      <div className="space-y-2">
        <Label htmlFor="category">Category {required && '*'}</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Please select a language first" />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Label htmlFor="category">Category {required && '*'}</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Loading categories..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Label htmlFor="category">Category {required && '*'}</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Error loading categories" />
          </SelectTrigger>
        </Select>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="category">Category {required && '*'}</Label>
      <Select 
        value={value} 
        onValueChange={onValueChange}
        disabled={disabled || categories.length === 0}
        required={required}
      >
        <SelectTrigger>
          <SelectValue placeholder={
            categories.length === 0 
              ? "No categories available" 
              : "Select a category"
          } />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
              {category._count && (
                <span className="ml-2 text-sm text-gray-500">
                  ({category._count.posts} posts)
                </span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {categories.length === 0 && (
        <p className="text-sm text-gray-600">
          No categories available. Create a category first.
        </p>
      )}
    </div>
  );
}