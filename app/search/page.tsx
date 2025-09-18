import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import { PostList } from '@/components/posts';
import { Pagination } from '@/components/ui/pagination';
import { Search } from 'lucide-react';

async function searchPosts(query: string, page: number = 1, limit: number = 10) {
  try {
    if (!query.trim()) {
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

    const skip = (page - 1) * limit;
    
    // Search in title and content (only published posts)
    const searchCondition = {
      status: 'published',
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive' as const
          }
        },
        {
          content: {
            contains: query,
            mode: 'insensitive' as const
          }
        }
      ]
    };

    const [posts, totalPosts] = await Promise.all([
      prisma.post.findMany({
        where: searchCondition,
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
      prisma.post.count({ where: searchCondition })
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
    console.error('Error searching posts:', error);
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

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

async function SearchResults({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const page = parseInt(params.page || '1');
  
  const { posts, pagination } = await searchPosts(query, page);

  return (
    <div className="min-h-screen bg-secondary">
      {/* Search Header */}
      <section className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Search className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Search Results
            </h1>
            {query && (
              <p className="text-xl text-muted-foreground">
                {pagination.totalPosts > 0 
                  ? `Found ${pagination.totalPosts} ${pagination.totalPosts === 1 ? 'result' : 'results'} for "${query}"`
                  : `No results found for "${query}"`
                }
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Search Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <main>
          {query ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Search Results for "{query}"
                </h2>
                <p className="text-muted-foreground">
                  {pagination.totalPosts > 0 
                    ? `Showing ${posts.length} of ${pagination.totalPosts} results`
                    : 'No posts found matching your search'
                  }
                </p>
              </div>

              <PostList 
                posts={posts}
                showAuthor={true}
                emptyMessage={`No posts found matching "${query}". Try different keywords or browse our categories.`}
                className="mb-12"
              />

              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  baseUrl={`/search?q=${encodeURIComponent(query)}`}
                  className="mt-12"
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Enter a search term
              </h2>
              <p className="text-muted-foreground">
                Use the search box in the header to find posts by title or content.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function SearchPage(props: SearchPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <Search className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Searching...</p>
        </div>
      </div>
    }>
      <SearchResults {...props} />
    </Suspense>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';

  return {
    title: query ? `Search results for "${query}" - Litaria` : 'Search - Litaria',
    description: query 
      ? `Search results for "${query}" on Litaria. Find posts, articles, and stories.`
      : 'Search for posts, articles, and stories on Litaria.',
  };
}