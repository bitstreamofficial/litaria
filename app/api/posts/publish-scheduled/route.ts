import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withErrorHandler, handleDatabaseOperation } from '@/lib/api-error-handler';

// POST /api/posts/publish-scheduled - Publish scheduled posts that are due
export const POST = withErrorHandler(async () => {
  const now = new Date();

  // Find all scheduled posts that are due to be published
  const scheduledPosts = await handleDatabaseOperation(async () => {
    return prisma.post.findMany({
      where: {
        status: 'scheduled',
        scheduledDate: {
          lte: now // Scheduled date is less than or equal to current time
        }
      },
      select: {
        id: true,
        title: true,
        scheduledDate: true
      }
    });
  });

  if (scheduledPosts.length === 0) {
    return NextResponse.json({
      message: 'No scheduled posts due for publishing',
      publishedCount: 0
    });
  }

  // Update all due scheduled posts to published status
  const updateResult = await handleDatabaseOperation(async () => {
    return prisma.post.updateMany({
      where: {
        id: {
          in: scheduledPosts.map(post => post.id)
        }
      },
      data: {
        status: 'published',
        // Optional: Update publishedAt timestamp if you have one
        // publishedAt: now
      }
    });
  });

  return NextResponse.json({
    message: `Successfully published ${updateResult.count} scheduled posts`,
    publishedCount: updateResult.count,
    publishedPosts: scheduledPosts.map(post => ({
      id: post.id,
      title: post.title,
      scheduledDate: post.scheduledDate
    }))
  });
});

// GET /api/posts/publish-scheduled - Check scheduled posts (for debugging)
export const GET = withErrorHandler(async () => {
  const now = new Date();

  const scheduledPosts = await handleDatabaseOperation(async () => {
    return prisma.post.findMany({
      where: {
        status: 'scheduled'
      },
      select: {
        id: true,
        title: true,
        scheduledDate: true,
        createdAt: true
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    });
  });

  const duePosts = scheduledPosts.filter(post => 
    post.scheduledDate && new Date(post.scheduledDate) <= now
  );

  const futurePosts = scheduledPosts.filter(post => 
    post.scheduledDate && new Date(post.scheduledDate) > now
  );

  return NextResponse.json({
    currentTime: now.toISOString(),
    totalScheduled: scheduledPosts.length,
    duePosts: duePosts.length,
    futurePosts: futurePosts.length,
    scheduledPosts: scheduledPosts.map(post => ({
      id: post.id,
      title: post.title,
      scheduledDate: post.scheduledDate,
      isDue: post.scheduledDate ? new Date(post.scheduledDate) <= now : false
    }))
  });
});