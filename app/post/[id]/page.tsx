import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { formatPostDate, calculateReadingTime, getRelatedPosts } from '@/lib/post-utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PostCard } from '@/components/posts';
import { Clock, User, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

async function getPost(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
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
      }
    });

    return post;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

async function getRelatedPostsFromDB(categoryId: string, currentPostId: string, limit: number = 3) {
  try {
    const relatedPosts = await prisma.post.findMany({
      where: {
        categoryId,
        id: {
          not: currentPostId
        }
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
    });

    return relatedPosts;
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPostsFromDB(post.categoryId, post.id);
  const readingTime = calculateReadingTime(post.content);
  const formattedDate = formatPostDate(post.createdAt);
  const formattedUpdatedDate = post.updatedAt !== post.createdAt 
    ? formatPostDate(post.updatedAt) 
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Post Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white">
          {/* Post Header */}
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between mb-4">
              <Link href={`/category/${post.category.id}`}>
                <Badge variant="secondary" className="hover:bg-teal-100 hover:text-teal-800 transition-colors">
                  {post.category.name}
                </Badge>
              </Link>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {readingTime} min read
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Post Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 border-b border-gray-200 pb-4">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>By {post.author.name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Published {formattedDate}</span>
              </div>
              {formattedUpdatedDate && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Updated {formattedUpdatedDate}</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {/* Featured Image */}
            {post.imageUrl && (
              <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Post Content */}
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {post.content}
              </div>
            </div>
          </CardContent>
        </Card>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Related Posts</h2>
            <p className="text-gray-600">
              More posts from the {post.category.name} category
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((relatedPost) => (
              <PostCard 
                key={relatedPost.id} 
                post={relatedPost} 
                showAuthor={true}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return {
      title: 'Post Not Found - Litaria',
      description: 'The requested post could not be found.',
    };
  }

  return {
    title: `${post.title} - Litaria`,
    description: post.content.substring(0, 160) + '...',
    openGraph: {
      title: post.title,
      description: post.content.substring(0, 160) + '...',
      images: post.imageUrl ? [post.imageUrl] : [],
    },
  };
}