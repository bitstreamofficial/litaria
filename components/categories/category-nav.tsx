'use client';

import Link from 'next/link';
import { CategoryWithPostCount } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder, Hash } from 'lucide-react';

interface CategoryNavProps {
  categories: CategoryWithPostCount[];
  currentCategoryId?: string;
  className?: string;
}

export function CategoryNav({ categories, currentCategoryId, className = "" }: CategoryNavProps) {
  if (categories.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Folder className="h-5 w-5 mr-2" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No categories available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Folder className="h-5 w-5 mr-2" />
          Categories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* All Posts Link */}
          <Link 
            href="/"
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              !currentCategoryId 
                ? 'bg-primary/10 text-primary border border-primary/20' 
                : 'hover:bg-secondary'
            }`}
          >
            <span className="font-medium">All Posts</span>
            <Badge variant="secondary" className="text-xs">
              {categories.reduce((total, cat) => total + cat._count.posts, 0)}
            </Badge>
          </Link>

          {/* Category Links */}
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                currentCategoryId === category.id
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'hover:bg-secondary'
              }`}
            >
              <span className="font-medium">{category.name}</span>
              <Badge variant="secondary" className="text-xs">
                {category._count.posts}
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}