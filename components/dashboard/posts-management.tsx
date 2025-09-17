"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PostWithAuthorAndCategorySelect } from "@/lib/types";
import { formatPostDate, generateExcerpt } from "@/lib/post-utils";
import { useToast } from "@/hooks/use-toast";
import { DeletePostDialog } from "./delete-post-dialog";

interface PostsManagementProps {
  userId: string;
}

type PostStatus = 'all' | 'published' | 'draft' | 'scheduled';

export function PostsManagement({ userId }: PostsManagementProps) {
  const [posts, setPosts] = useState<PostWithAuthorAndCategorySelect[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostWithAuthorAndCategorySelect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<PostWithAuthorAndCategorySelect | null>(null);
  const [activeFilter, setActiveFilter] = useState<PostStatus>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterPosts();
  }, [posts, activeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts?authorId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      setPosts(data.posts || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    if (activeFilter === 'all') {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(post => post.status === activeFilter));
    }
  };

  const getStatusCounts = () => {
    const counts = {
      all: posts.length,
      published: posts.filter(p => p.status === 'published').length,
      draft: posts.filter(p => p.status === 'draft').length,
      scheduled: posts.filter(p => p.status === 'scheduled').length,
    };
    return counts;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'scheduled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return '🚀';
      case 'draft':
        return '💾';
      case 'scheduled':
        return '⏰';
      default:
        return '📄';
    }
  };

  const formatScheduledDate = (scheduledDate: string | Date | null) => {
    if (!scheduledDate) return '';
    const date = new Date(scheduledDate);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteClick = (post: PostWithAuthorAndCategorySelect) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    try {
      const response = await fetch(`/api/posts/${postToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      setPosts(posts.filter(post => post.id !== postToDelete.id));
      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchPosts} variant="outline">
          Try Again
        </Button>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No posts yet
        </h3>
        <p className="text-gray-600 mb-6">
          You haven&apos;t created any blog posts yet. Start writing your first post!
        </p>
        <Link href="/dashboard/posts/new">
          <Button className="bg-teal-700 hover:bg-teal-800">
            Create Your First Post
          </Button>
        </Link>
      </Card>
    );
  }

  const counts = getStatusCounts();

  return (
    <>
      {/* Status Filter Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Posts', icon: '📄' },
            { key: 'published', label: 'Published', icon: '🚀' },
            { key: 'draft', label: 'Drafts', icon: '💾' },
            { key: 'scheduled', label: 'Scheduled', icon: '⏰' },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key as PostStatus)}
              className={`${
                activeFilter === filter.key
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
            >
              <span>{filter.icon}</span>
              <span>{filter.label}</span>
              <Badge variant="secondary" className="ml-2">
                {counts[filter.key as keyof typeof counts]}
              </Badge>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} found
        </p>
        <Link href="/dashboard/posts/new">
          <Button className="bg-teal-700 hover:bg-teal-800">
            New Post
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {post.title}
                  </h3>
                  <Badge variant={getStatusBadgeVariant(post.status)} className="flex items-center space-x-1">
                    <span>{getStatusIcon(post.status)}</span>
                    <span className="capitalize">{post.status}</span>
                  </Badge>
                  <Badge variant="secondary">
                    {post.category.name}
                  </Badge>
                </div>
                
                <p className="text-gray-600 mb-4">
                  {generateExcerpt(post.content, 200)}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Created: {formatPostDate(post.createdAt)}</span>
                  {post.updatedAt !== post.createdAt && (
                    <span>Updated: {formatPostDate(post.updatedAt)}</span>
                  )}
                  {post.status === 'scheduled' && post.scheduledDate && (
                    <span className="text-blue-600 font-medium">
                      📅 Scheduled: {formatScheduledDate(post.scheduledDate)}
                    </span>
                  )}
                </div>
              </div>

              {post.imageUrl && (
                <div className="ml-6 flex-shrink-0">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t">
              {post.status === 'published' && (
                <Link href={`/post/${post.id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              )}
              <Link href={`/dashboard/posts/${post.id}/edit`}>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </Link>
              {post.status === 'draft' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                >
                  Publish
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteClick(post)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <DeletePostDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        post={postToDelete}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}