import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { PostList } from '@/components/posts';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Folder, Tag } from 'lucide-react';

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

async function getCategoryPosts(categoryId: string, categoryLanguage: string, subcategoryId?: string, page: number = 1, limit: number = 10) {
  try {
    const skip = (page - 1) * limit;
    
    // Filter posts by category, language, and optionally subcategory
    const where = subcategoryId 
      ? { categoryId, subcategoryId, language: categoryLanguage }
      : { categoryId, language: categoryLanguage };

    const [posts, totalPosts] = await Promise.all([
      prisma.post.findMany({
        where,
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
          },
          subcategory: {
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
      prisma.post.count({ where })
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

async function getSubcategory(id: string) {
  try {
    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return subcategory;
  } catch (error) {
    console.error('Error fetching subcategory:', error);
    return null;
  }
}

async function getCategorySubcategories(categoryId: string, categoryLanguage: string) {
  try {
    const subcategories = await prisma.subcategory.findMany({
      where: { categoryId },
      include: {
        _count: {
          select: { 
            posts: {
              where: {
                language: categoryLanguage
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return subcategories;
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return [];
  }
}

interface CategoryPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; subcategory?: string }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { id } = await params;
  const { page: pageParam, subcategory: subcategoryParam } = await searchParams;
  const page = parseInt(pageParam || '1');

  const [category, currentSubcategory] = await Promise.all([
    getCategory(id),
    subcategoryParam ? getSubcategory(subcategoryParam) : null
  ]);

  if (!category) {
    notFound();
  }

  if (subcategoryParam && !currentSubcategory) {
    notFound();
  }

  // Get subcategories with language-filtered post counts
  const subcategories = await getCategorySubcategories(id, category.language);

  if (!category) {
    notFound();
  }

  if (subcategoryParam && !currentSubcategory) {
    notFound();
  }

  // Get posts with the category's language
  const { posts, pagination } = await getCategoryPosts(id, category.language, subcategoryParam, page);

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
              {currentSubcategory ? (
                <Tag className="h-12 w-12 text-teal-700" />
              ) : (
                <Folder className="h-12 w-12 text-teal-700" />
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {currentSubcategory ? currentSubcategory.name : category.name}
            </h1>
            {currentSubcategory && (
              <p className="text-lg text-gray-500 mb-2">
                in {category.name}
              </p>
            )}
            <p className="text-xl text-gray-600">
              {pagination.totalPosts === 0 
                ? `No posts ${currentSubcategory ? 'in this subcategory' : 'in this category'} yet`
                : `${pagination.totalPosts} ${pagination.totalPosts === 1 ? 'post' : 'posts'} ${currentSubcategory ? 'in this subcategory' : 'in this category'}`
              }
            </p>
          </div>
        </div>
      </section>

      {/* Subcategory Navigation */}
      {subcategories.length > 0 && (
        <section className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={`/category/${category.id}`}>
                <Button 
                  variant={!currentSubcategory ? "default" : "outline"} 
                  size="sm"
                  className={!currentSubcategory ? "bg-[#004D4D] hover:bg-[#003333]" : ""}
                >
                  All {category.name}
                </Button>
              </Link>
              {subcategories.map((subcategory) => (
                <Link key={subcategory.id} href={`/category/${category.id}?subcategory=${subcategory.id}`}>
                  <Button 
                    variant={currentSubcategory?.id === subcategory.id ? "default" : "outline"} 
                    size="sm"
                    className={currentSubcategory?.id === subcategory.id ? "bg-[#004D4D] hover:bg-[#003333]" : ""}
                  >
                    {subcategory.name}
                    <span className="ml-2 text-xs opacity-70">({subcategory._count.posts})</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <main>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentSubcategory 
                ? `Posts in ${currentSubcategory.name}`
                : `Posts in ${category.name}`
              }
            </h2>
            <p className="text-gray-600">
              {pagination.totalPosts > 0 
                ? `Showing ${posts.length} of ${pagination.totalPosts} posts`
                : `No posts available ${currentSubcategory ? 'in this subcategory' : 'in this category'}`
              }
            </p>
          </div>

          <PostList 
            posts={posts}
            showAuthor={true}
            emptyMessage={`No posts found ${currentSubcategory ? `in the ${currentSubcategory.name} subcategory` : `in the ${category.name} category`}. Be the first to create one!`}
            className="mb-12"
          />

          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              baseUrl={`/category/${category.id}${currentSubcategory ? `?subcategory=${currentSubcategory.id}` : ''}`}
              className="mt-12"
            />
          )}
        </main>
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