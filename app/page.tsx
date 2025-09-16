import { prisma } from '@/lib/db';
import { PostList } from '@/components/posts';
import { Pagination } from '@/components/ui/pagination';

async function getPosts(language?: string, page: number = 1, limit: number = 10) {
  try {
    const skip = (page - 1) * limit;
    
    // If no language specified, show all posts (mixed)
    // If language specified, filter by that language
    const where = language ? { language } : {};

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
    console.error('Error fetching posts:', error);
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



interface HomePageProps {
  searchParams: Promise<{ page?: string; lang?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const language = params.lang; // undefined means show all posts (mixed)
  
  const { posts, pagination } = await getPosts(language, page);

  return (
    <div className="min-h-screen bg-secondary">
      {/* Hero Section */}
      <section className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Welcome to <span className="text-primary">Litaria</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover amazing stories, insights, and ideas from our community of writers. 
              Join the conversation and share your own thoughts with the world.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <main>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {language === 'bn' ? 'সর্বশেষ পোস্ট' : 
               language === 'en' ? 'Latest English Posts' : 
               'Latest Posts'}
            </h2>
            <p className="text-muted-foreground">
              {pagination.totalPosts > 0 
                ? `Showing ${posts.length} of ${pagination.totalPosts} posts${language ? ` in ${language === 'bn' ? 'Bengali' : 'English'}` : ''}`
                : `No posts available${language ? ` in ${language === 'bn' ? 'Bengali' : 'English'}` : ''}`
              }
            </p>
          </div>

          <PostList 
            posts={posts}
            showAuthor={true}
            emptyMessage="No posts available. Be the first to create one!"
            className="mb-12"
          />

          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              baseUrl={language ? `/?lang=${language}` : "/"}
              className="mt-12"
            />
          )}
        </main>
      </div>
    </div>
  );
}
