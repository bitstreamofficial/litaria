import { prisma } from '@/lib/db';
import { PostList } from '@/components/posts';
import { Pagination } from '@/components/ui/pagination';
import { HeroSection } from '@/components/home/hero-section';

async function getPosts(language?: string, page: number = 1, limit: number = 10) {
  try {
    const skip = (page - 1) * limit;
    
    // If no language specified, show all posts (mixed)
    // If language specified, filter by that language
    // Exclude lead posts from regular listing
    const where = language 
      ? { language, isLead: false } 
      : { isLead: false };

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

async function getLeadPost(language?: string) {
  try {
    // Default to English for lead post when no language is specified
    const leadPostLanguage = language || 'en';
    const where = { isLead: true, language: leadPostLanguage };

    const leadPost = await prisma.post.findFirst({
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
        updatedAt: 'desc'
      }
    });

    return leadPost || undefined;
  } catch (error) {
    console.error('Error fetching lead post:', error);
    return undefined;
  }
}



interface HomePageProps {
  searchParams: Promise<{ page?: string; lang?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const language = params.lang; // undefined means show all posts (mixed)
  
  const [{ posts, pagination }, leadPost] = await Promise.all([
    getPosts(language, page),
    getLeadPost(language)
  ]);

  return (
    <div className="min-h-screen bg-secondary">
      {/* Hero Section with Lead Post */}
      <HeroSection leadPost={leadPost} />

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
