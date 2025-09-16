'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Subcategory } from '@/lib/types';

interface SubcategorySelectorProps {
  categoryId?: string;
  value?: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}

export function SubcategorySelector({ 
  categoryId,
  value, 
  onValueChange, 
  required = false, 
  disabled = false 
}: SubcategorySelectorProps) {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryId) {
      fetchSubcategories(categoryId);
    } else {
      setSubcategories([]);
      setError(null);
    }
  }, [categoryId]);

  const fetchSubcategories = async (catId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/categories/${catId}/subcategories`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch subcategories');
      }

      const data = await response.json();
      setSubcategories(data.subcategories || []);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      setError('Failed to load subcategories');
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no category is selected
  if (!categoryId) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Label htmlFor="subcategory">Subcategory {required && '*'}</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Loading subcategories..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Label htmlFor="subcategory">Subcategory {required && '*'}</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Error loading subcategories" />
          </SelectTrigger>
        </Select>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="subcategory">Subcategory {required && '*'}</Label>
      <Select 
        value={value} 
        onValueChange={onValueChange}
        disabled={disabled || subcategories.length === 0}
        required={required}
      >
        <SelectTrigger>
          <SelectValue placeholder={
            subcategories.length === 0 
              ? "No subcategories available" 
              : "Select a subcategory"
          } />
        </SelectTrigger>
        <SelectContent>
          {subcategories.map((subcategory) => (
            <SelectItem key={subcategory.id} value={subcategory.id}>
              {subcategory.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {subcategories.length === 0 && (
        <p className="text-sm text-gray-600">
          No subcategories available for this category.
        </p>
      )}
    </div>
  );
}