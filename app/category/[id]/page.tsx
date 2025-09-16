import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { PostList } from '@/components/posts';
import { CategoryNav } from '@/components/categories';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Folder } from 'lucide-react';

async function getCategory(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    return category;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

async function getCategoryPosts(categoryId: string, page: number = 1, limit: number = 10) {
  try {
    const skip = (page - 1) * limit;

    const [posts, totalPosts] = await Promise.all([
      prisma.post.findMany({
        where: { categoryId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          category: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.post.count({ where: { categoryId } })
    ]);

    const totalPages = Math.ceil(totalPosts / limit);

    return {
      posts,
      pagination: {
        page,
        limit,
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    };
  } catch (error) {
    console.error('Error fetching category posts:', error);
    return {
      posts: [],
      pagination: {
        page: 1,
        limit,
        totalPages: 0,
        totalPosts: 0,
        hasNextPage: false,
        hasPrevPage: false,
      }
    };
  }
}

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

interface CategoryPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam || '1');

  const [category, { posts, pagination }, allCategories] = await Promise.all([
    getCategory(id),
    getCategoryPosts(id, page),
    getAllCategories()
  ]);

  if (!category) {
    notFound();
  }

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

      {/* Category Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Folder className="h-12 w-12 text-teal-700" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {category.name}
            </h1>
            <p className="text-xl text-gray-600">
              {category._count.posts === 0 
                ? 'No posts in this category yet'
                : `${category._count.posts} ${category._count.posts === 1 ? 'post' : 'posts'} in this category`
              }
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <CategoryNav 
              categories={allCategories}
              currentCategoryId={category.id}
              className="sticky top-8"
            />
          </aside>

          {/* Posts */}
          <main className="lg:col-span-3">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Posts in {category.name}
              </h2>
              <p className="text-gray-600">
                {pagination.totalPosts > 0 
                  ? `Showing ${posts.length} of ${pagination.totalPosts} posts`
                  : 'No posts available in this category'
                }
              </p>
            </div>

            <PostList 
              posts={posts}
              showAuthor={true}
              emptyMessage={`No posts found in the ${category.name} category. Be the first to create one!`}
              className="mb-12"
            />

            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                baseUrl={`/category/${category.id}`}
                className="mt-12"
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps) {
  const { id } = await params;
  const category = await getCategory(id);

  if (!category) {
    return {
      title: 'Category Not Found - Litaria',
      description: 'The requested category could not be found.',
    };
  }

  return {
    title: `${category.name} - Litaria`,
    description: `Browse all posts in the ${category.name} category. ${category._count.posts} posts available.`,
  };
}