import { prisma } from '@/lib/db';
import { HeroSection } from '@/components/home/hero-section';
import { CategoryPostsSection } from '@/components/home/category-posts-section';
import { PodcastSection } from '@/components/home/podcast-section';
import { PostWithAuthorAndCategorySelect } from '@/lib/types';

interface CategoryWithPosts {
  id: string;
  name: string;
  language: string;
  createdAt: Date;
  _count: {
    posts: number;
  };
  posts: PostWithAuthorAndCategorySelect[];
  displayName?: string; // For showing both English and Bengali names
}

interface CategoryWithCount {
  id: string;
  name: string;
  language: string;
  createdAt: Date;
  _count: {
    posts: number;
  };
}

async function getPostsByCategories(language?: string, postsPerCategory: number = 4): Promise<CategoryWithPosts[]> {
  try {
    // Define the desired category order
    const categoryOrder = ['Creative', 'Culture', 'Non-Fiction', 'Research', 'Podcast'];
    
    // If no language is specified, get all categories and group them by category name
    if (!language) {
      // Get all categories
      const allCategories = await prisma.category.findMany({
        include: {
          _count: {
            select: { posts: true }
          }
        }
      });

      // Group categories by name (English/Bengali pairs)
      const categoryGroups = new Map<string, CategoryWithCount[]>();
      
      // Map Bengali category names to English equivalents for grouping
      const bengaliToEnglishMap: { [key: string]: string } = {
        'ক্রিয়েটিভ': 'Creative',
        'কালচার': 'Culture',
        'নন-ফিকশন': 'Non-Fiction',
        'রিসার্চ': 'Research',
        'পডকাস্ট': 'Podcast'
      };
      
      allCategories.forEach((category: CategoryWithCount) => {
        // Use English name as the grouping key, mapping Bengali names to English
        const groupKey = bengaliToEnglishMap[category.name] || category.name;
        
        if (!categoryGroups.has(groupKey)) {
          categoryGroups.set(groupKey, []);
        }
        categoryGroups.get(groupKey)!.push(category);
      });

      // For each category group, fetch posts from all languages
      const categoriesWithPosts: CategoryWithPosts[] = [];
      
      for (const categoryName of categoryOrder) {
        const categoryGroup = categoryGroups.get(categoryName);
        if (categoryGroup && categoryGroup.length > 0) {
          // Determine how many posts to fetch based on category
          const postsToFetch = categoryName === 'Podcast' ? 1 : postsPerCategory;
          
          // Get posts from all language versions of this category
          const allPosts = await prisma.post.findMany({
            where: {
              categoryId: { in: categoryGroup.map(cat => cat.id) },
              isLead: false
            },
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
            take: postsToFetch,
          });

          if (allPosts.length > 0) {
            // Create display name with both English and Bengali for category sections
            const englishCategory = categoryGroup.find(cat => cat.language === 'en');
            
            // Map category names to their Bengali equivalents
            const categoryNameMap: { [key: string]: string } = {
              'Creative': 'ক্রিয়েটিভ',
              'Culture': 'কালচার', 
              'Non-Fiction': 'নন-ফিকশন',
              'Research': 'রিসার্চ',
              'Podcast': 'পডকাস্ট'
            };
            
            const bengaliName = categoryNameMap[categoryName] || categoryName;
            const displayName = `${categoryName} | ${bengaliName}`;
            
            // Use the English category for base info, or first available
            const displayCategory = englishCategory || categoryGroup[0];
            
            // Calculate total post count from all languages
            const totalPostCount = categoryGroup.reduce((total, cat) => total + cat._count.posts, 0);
            
            categoriesWithPosts.push({
              ...displayCategory,
              displayName,
              _count: { posts: totalPostCount },
              posts: allPosts
            });
          }
        }
      }

      return categoriesWithPosts;
    }
    
    // If language is specified, filter by that language
    const categories = await prisma.category.findMany({
      where: { language },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    // Sort categories according to the specified order
    const sortedCategories = categories.sort((a: CategoryWithCount, b: CategoryWithCount) => {
      const indexA = categoryOrder.indexOf(a.name);
      const indexB = categoryOrder.indexOf(b.name);
      
      // If category not found in order array, put it at the end
      if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      
      return indexA - indexB;
    });

    // For each category, fetch the latest posts (excluding lead posts)
    const categoriesWithPosts = await Promise.all(
      sortedCategories.map(async (category: CategoryWithCount): Promise<CategoryWithPosts> => {
        const posts = await prisma.post.findMany({
          where: {
            categoryId: category.id,
            isLead: false
          },
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
          take: postsPerCategory,
        });

        return {
          ...category,
          posts
        };
      })
    );

    // Filter out categories with no posts
    return categoriesWithPosts.filter((category: CategoryWithPosts) => category.posts.length > 0);
  } catch (error) {
    console.error('Error fetching posts by categories:', error);
    return [];
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
  searchParams: Promise<{ lang?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const language = params.lang; // undefined means show all posts (mixed)
  
  const [categoriesWithPosts, leadPost] = await Promise.all([
    getPostsByCategories(language),
    getLeadPost(language)
  ]);

  return (
    <div className="min-h-screen bg-secondary">
      {/* Hero Section with Lead Post */}
      <HeroSection leadPost={leadPost} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <main>
          {categoriesWithPosts.length > 0 ? (
            <div className="space-y-12">
              {categoriesWithPosts.map((category: CategoryWithPosts) => {
                // Use special podcast layout for Podcast category
                if (category.name === 'Podcast' || category.displayName?.includes('Podcast')) {
                  return (
                    <PodcastSection
                      key={category.id}
                      category={category}
                    />
                  );
                }
                
                // Use regular grid layout for other categories
                return (
                  <CategoryPostsSection
                    key={category.id}
                    category={category}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {language === 'bn' ? 'কোন পোস্ট পাওয়া যায়নি' : 'No Posts Found'}
              </h2>
              <p className="text-muted-foreground">
                {language === 'bn' 
                  ? 'এই ভাষায় এখনো কোন পোস্ট নেই।' 
                  : `No posts available${language ? ` in ${language === 'en' ? 'English' : 'this language'}` : ''}.`
                }
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
