'use client';

import { useEffect } from 'react';

export function ScheduledPostPublisher() {
  useEffect(() => {
    // Function to check and publish scheduled posts
    const publishScheduledPosts = async () => {
      try {
        await fetch('/api/posts/publish-scheduled', {
          method: 'POST',
        });
      } catch (error) {
        console.error('Error publishing scheduled posts:', error);
      }
    };

    // Check immediately on mount
    publishScheduledPosts();

    // Then check every 5 minutes
    const interval = setInterval(publishScheduledPosts, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // This component renders nothing
  return null;
}