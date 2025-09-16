import { PostWithAuthorAndCategory } from './types';

/**
 * Generate an excerpt from post content
 */
export function generateExcerpt(content: string, maxLength: number = 150): string {
  // Remove HTML tags if any
  const plainText = content.replace(/<[^>]*>/g, '');
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  // Find the last space before the max length to avoid cutting words
  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * Format post date for display
 */
export function formatPostDate(date: Date | string): string {
  const postDate = typeof date === 'string' ? new Date(date) : date;
  
  return postDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Calculate reading time estimate
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const plainText = content.replace(/<[^>]*>/g, '');
  const wordCount = plainText.split(/\s+/).length;
  
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Validate post data on the client side
 */
export function validatePostData(data: {
  title: string;
  content: string;
  categoryId: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.title.trim()) {
    errors.push('Title is required');
  } else if (data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }
  
  if (!data.content.trim()) {
    errors.push('Content is required');
  }
  
  if (!data.categoryId) {
    errors.push('Category is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get related posts (same category, excluding current post)
 */
export function getRelatedPosts(
  posts: PostWithAuthorAndCategory[],
  currentPost: PostWithAuthorAndCategory,
  limit: number = 3
): PostWithAuthorAndCategory[] {
  return posts
    .filter(post => 
      post.id !== currentPost.id && 
      post.categoryId === currentPost.categoryId
    )
    .slice(0, limit);
}

/**
 * Search posts by title or content
 */
export function searchPosts(
  posts: PostWithAuthorAndCategory[],
  query: string
): PostWithAuthorAndCategory[] {
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) {
    return posts;
  }
  
  return posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm) ||
    post.content.toLowerCase().includes(searchTerm) ||
    post.author.name?.toLowerCase().includes(searchTerm) ||
    post.category.name.toLowerCase().includes(searchTerm)
  );
}