'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { Category, Subcategory } from '@/lib/types';

interface CategoryWithSubcategories extends Category {
  subcategories?: Subcategory[];
}

interface HeaderCategoriesProps {
  language?: string;
}

export function HeaderCategories({ language: propLanguage }: HeaderCategoriesProps) {
  const searchParams = useSearchParams();
  const urlLanguage = searchParams.get('lang');
  
  // Use URL language if available, otherwise use prop language, default to 'en'
  const language = urlLanguage || propLanguage || 'en';
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [language]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/categories?language=${language}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      const categoriesWithSubcategories = await Promise.all(
        data.categories.map(async (category: Category) => {
          // Fetch subcategories for each category
          const subResponse = await fetch(`/api/categories/${category.id}/subcategories`);
          if (subResponse.ok) {
            const subData = await subResponse.json();
            return {
              ...category,
              subcategories: subData.subcategories || []
            };
          }
          return {
            ...category,
            subcategories: []
          };
        })
      );
      
      setCategories(categoriesWithSubcategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="hidden md:flex items-center space-x-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <nav className="hidden md:flex items-center space-x-6">
      {categories.map((category) => (
        <div
          key={category.id}
          className="relative group"
          onMouseEnter={() => setHoveredCategory(category.id)}
          onMouseLeave={() => setHoveredCategory(null)}
        >
          <Link
            href={`/category/${category.id}`}
            className="flex items-center text-gray-700 hover:text-[#004D4D] transition-colors font-medium py-2"
          >
            {category.name}
            {category.subcategories && category.subcategories.length > 0 && (
              <ChevronDown className="h-4 w-4 ml-1 transition-transform group-hover:rotate-180" />
            )}
          </Link>

          {/* Subcategory Dropdown */}
          {category.subcategories && category.subcategories.length > 0 && hoveredCategory === category.id && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-2">
                {category.subcategories.map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    href={`/category/${category.id}?subcategory=${subcategory.id}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#004D4D] transition-colors"
                  >
                    {subcategory.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}