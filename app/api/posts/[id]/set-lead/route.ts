import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/posts/[id]/set-lead - Set a post as lead post (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to set lead posts' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true }
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found', message: 'The requested post does not exist' },
        { status: 404 }
      );
    }

    // For now, allow any authenticated user to set lead posts
    // In a real app, you'd check for admin role here
    // if (!session.user.isAdmin) {
    //   return NextResponse.json(
    //     { error: 'Forbidden', message: 'Only admins can set lead posts' },
    //     { status: 403 }
    //   );
    // }

    // First, remove lead status from all other posts in the same language
    await prisma.post.updateMany({
      where: {
        language: post.language,
        isLead: true
      },
      data: {
        isLead: false
      }
    });

    // Set this post as lead
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        isLead: true
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
      }
    });

    return NextResponse.json({ 
      message: 'Post set as lead successfully',
      post: updatedPost 
    });
  } catch (error) {
    console.error('Error setting lead post:', error);
    return NextResponse.json(
      { error: 'Failed to set lead post', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id]/set-lead - Remove lead status from a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to manage lead posts' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found', message: 'The requested post does not exist' },
        { status: 404 }
      );
    }

    // Remove lead status
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        isLead: false
      }
    });

    return NextResponse.json({ 
      message: 'Lead status removed successfully',
      post: updatedPost 
    });
  } catch (error) {
    console.error('Error removing lead status:', error);
    return NextResponse.json(
      { error: 'Failed to remove lead status', message: 'Internal server error' },
      { status: 500 }
    );
  }
}