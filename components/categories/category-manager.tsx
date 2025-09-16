'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  _count?: {
    posts: number;
  };
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const { toast } = useToast();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      setCreating(true);
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create category');
      }

      setCategories([...categories, data.category]);
      setNewCategoryName('');
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create category',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const updateCategory = async (id: string) => {
    if (!editingName.trim()) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editingName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update category');
      }

      setCategories(categories.map(cat => 
        cat.id === id ? data.category : cat
      ));
      setEditingId(null);
      setEditingName('');
      toast({
        title: 'Success',
        description: 'Category updated successfully',
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update category',
        variant: 'destructive',
      });
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete category');
      }

      setCategories(categories.filter(cat => cat.id !== id));
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete category',
        variant: 'destructive',
      });
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading categories...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create new category */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="new-category" className="sr-only">
              New category name
            </Label>
            <Input
              id="new-category"
              placeholder="Enter category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  createCategory();
                }
              }}
            />
          </div>
          <Button 
            onClick={createCategory} 
            disabled={creating || !newCategoryName.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            {creating ? 'Creating...' : 'Add'}
          </Button>
        </div>

        {/* Categories list */}
        <div className="space-y-2">
          {categories.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No categories yet. Create your first category above.
            </p>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {editingId === category.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateCategory(category.id);
                          } else if (e.key === 'Escape') {
                            cancelEditing();
                          }
                        }}
                        className="w-48"
                      />
                      <Button
                        size="sm"
                        onClick={() => updateCategory(category.id)}
                        disabled={!editingName.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium">{category.name}</span>
                      <Badge variant="secondary">
                        {category._count?.posts || 0} posts
                      </Badge>
                    </>
                  )}
                </div>

                {editingId !== category.id && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing(category)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteCategory(category.id)}
                      disabled={!!(category._count?.posts && category._count.posts > 0)}
                      title={
                        category._count?.posts && category._count.posts > 0
                          ? 'Cannot delete category with posts'
                          : 'Delete category'
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}