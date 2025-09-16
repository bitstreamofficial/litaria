'use client';

import { PostWithAuthorAndCategory, PostWithAuthorAndCategorySelect } from '@/lib/types';
import { PostCard } from './post-card';

interface PostListProps {
  posts: (PostWithAuthorAndCategory | PostWithAuthorAndCategorySelect)[];
  showAuthor?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function PostList({ 
  posts, 
  showAuthor = true, 
  emptyMessage = "No posts found.",
  className = ""
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {posts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post} 
          showAuthor={showAuthor}
        />
      ))}
    </div>
  );
}