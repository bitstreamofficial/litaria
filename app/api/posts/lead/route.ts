import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/posts/lead - Get the current lead post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');

    // Build where clause for language filtering
    const where = language ? { isLead: true, language } : { isLead: true };

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
        updatedAt: 'desc' // Get the most recently updated lead post
      }
    });

    return NextResponse.json({ leadPost });
  } catch (error) {
    console.error('Error fetching lead post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead post', message: 'Internal server error' },
      { status: 500 }
    );
  }
}