import Link from 'next/link';
import { PostWithAuthorAndCategorySelect } from '@/lib/types';
import { YouTubeEmbed } from '@/components/posts/youtube-embed';

interface CategoryWithPosts {
  id: string;
  name: string;
  language: string;
  createdAt: Date;
  _count: {
    posts: number;
  };
  posts: PostWithAuthorAndCategorySelect[];
  displayName?: string;
}

interface PodcastSectionProps {
  category: CategoryWithPosts;
}

export function PodcastSection({ category }: PodcastSectionProps) {
  // Only show if there are posts and take only the first one
  if (category.posts.length === 0) {
    return null;
  }

  const podcastPost = category.posts[0]; // Only show the most recent podcast

  return (
    <section className="mb-8 sm:mb-12">
      {/* Category Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
          {category.displayName || category.name}
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Latest podcast episode
        </p>
      </div>

      {/* Podcast Post - Lead Post Style Layout */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left Side - Content */}
          <div className="p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
            <div className="space-y-4 sm:space-y-6">
              {/* Category and Author */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                  {podcastPost.category.name}
                </span>
                <span>•</span>
                <span>by {podcastPost.author.name}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                <Link 
                  href={`/post/${podcastPost.id}`}
                  className="hover:text-primary transition-colors"
                >
                  {podcastPost.title}
                </Link>
              </h1>

              {/* Excerpt */}
              <p className="text-muted-foreground text-base sm:text-lg lg:text-xl leading-relaxed line-clamp-3 sm:line-clamp-4">
                {podcastPost.content.length > 200 
                  ? `${podcastPost.content.substring(0, 200)}...`
                  : podcastPost.content
                }
              </p>

              {/* Date */}
              <div className="text-sm sm:text-base text-muted-foreground">
                {new Date(podcastPost.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>

              {/* Read More Button */}
              <div className="pt-2">
                <Link 
                  href={`/post/${podcastPost.id}`}
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors text-base sm:text-lg"
                >
                  Listen Now →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side - Video */}
          <div className="relative aspect-video lg:aspect-auto lg:h-full min-h-[250px] sm:min-h-[350px] lg:min-h-[450px] p-4 sm:p-6 flex items-center justify-center">
            <div className="w-full h-full max-h-[200px] sm:max-h-[300px] lg:max-h-[350px] rounded-lg overflow-hidden shadow-md">
              {podcastPost.videoUrl ? (
                <YouTubeEmbed 
                  url={podcastPost.videoUrl} 
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <div className="text-4xl mb-2">🎙️</div>
                    <p>Podcast Episode</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}