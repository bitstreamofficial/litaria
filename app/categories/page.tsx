import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Folder, ArrowLeft, FileText } from 'lucide-react';

async function getAllCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getAllCategories();
  const totalPosts = categories.reduce((sum, category) => sum + category._count.posts, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Folder className="h-12 w-12 text-teal-700" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              All Categories
            </h1>
            <p className="text-xl text-gray-600">
              Browse posts by category. {categories.length} categories with {totalPosts} total posts.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {categories.length === 0 ? (
          <Card className="max-w-md mx-auto text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Folder className="h-16 w-16 text-gray-400" />
              </div>
              <CardTitle className="text-xl text-gray-900">
                No Categories Yet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                No categories have been created yet. Categories will appear here once posts are published.
              </p>
              <Link href="/">
                <Button className="bg-teal-700 hover:bg-teal-800">
                  Browse All Posts
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <Link key={category.id} href={`/category/${category.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Folder className="h-6 w-6 text-teal-700" />
                      <Badge variant="secondary" className="text-xs">
                        {category._count.posts} {category._count.posts === 1 ? 'post' : 'posts'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900 hover:text-teal-700 transition-colors">
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center text-sm text-gray-500">
                      <FileText className="h-4 w-4 mr-1" />
                      <span>
                        {category._count.posts === 0 
                          ? 'No posts yet'
                          : `${category._count.posts} ${category._count.posts === 1 ? 'post' : 'posts'} available`
                        }
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export const metadata = {
  title: 'Categories - Litaria',
  description: 'Browse all post categories on Litaria. Find content organized by topics and interests.',
};