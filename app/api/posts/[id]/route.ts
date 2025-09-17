import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema for post update
const updatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  language: z.string().min(1, 'Language is required').optional(),
  categoryId: z.string().min(1, 'Category is required').optional(),
  subcategoryId: z.string().optional().nullable(),
  imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  isLead: z.boolean().optional(),
});

// GET /api/posts/[id] - Get a specific post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        },
        subcategory: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found', message: 'The requested post does not exist' },
        { status: 404 }
      );
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - Update a post (requires authentication and ownership)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to update posts' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updatePostSchema.parse(body);

    // Check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true }
        }
      }
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found', message: 'The requested post does not exist' },
        { status: 404 }
      );
    }

    if (existingPost.author.id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You can only update your own posts' },
        { status: 403 }
      );
    }

    // Verify category exists if provided
    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId }
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found', message: 'The selected category does not exist' },
          { status: 400 }
        );
      }
    }

    // Verify subcategory exists if provided
    if (validatedData.subcategoryId) {
      const subcategory = await prisma.subcategory.findUnique({
        where: { 
          id: validatedData.subcategoryId,
          categoryId: validatedData.categoryId || existingPost.categoryId
        }
      });

      if (!subcategory) {
        return NextResponse.json(
          { error: 'Subcategory not found', message: 'The selected subcategory does not exist or does not belong to the selected category' },
          { status: 400 }
        );
      }
    }

    // If setting this post as lead, remove lead status from all other posts in the same language
    if (validatedData.isLead === true) {
      const postLanguage = validatedData.language || existingPost.language;
      await prisma.post.updateMany({
        where: {
          language: postLanguage,
          isLead: true,
          id: { not: id } // Exclude the current post
        },
        data: {
          isLead: false
        }
      });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.content && { content: validatedData.content }),
        ...(validatedData.language && { language: validatedData.language }),
        ...(validatedData.categoryId && { categoryId: validatedData.categoryId }),
        ...(validatedData.subcategoryId !== undefined && { subcategoryId: validatedData.subcategoryId }),
        ...(validatedData.imageUrl !== undefined && { imageUrl: validatedData.imageUrl }),
        ...(validatedData.isLead !== undefined && { isLead: validatedData.isLead }),
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

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', message: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - Delete a post (requires authentication and ownership)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to delete posts' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true }
        }
      }
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found', message: 'The requested post does not exist' },
        { status: 404 }
      );
    }

    if (existingPost.author.id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You can only delete your own posts' },
        { status: 403 }
      );
    }

    await prisma.post.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post', message: 'Internal server error' },
      { status: 500 }
    );
  }
}