import { PostCard } from '@/components/posts';
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

interface CategoryPostsSectionProps {
  category: CategoryWithPosts;
}

export function CategoryPostsSection({ category }: CategoryPostsSectionProps) {
  if (category.posts.length === 0) {
    return null;
  }

  return (
    <section className="mb-8 sm:mb-12">
      {/* Category Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
          {category.displayName || category.name}
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          {category._count.posts} {category._count.posts === 1 ? 'post' : 'posts'} available
        </p>
      </div>

      {/* Posts Grid - Responsive: 1 on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {category.posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            showAuthor={true}
            excerptLength={100}
          />
        ))}
      </div>
    </section>
  );
}