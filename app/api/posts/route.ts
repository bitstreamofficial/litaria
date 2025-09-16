import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { 
  createErrorResponse, 
  withErrorHandler, 
  handleDatabaseOperation,
  AuthenticationError,
  NotFoundError,
  validateRequest
} from '@/lib/api-error-handler';

// Validation schema for post creation
const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  categoryId: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url('Invalid image URL').optional(),
});

// GET /api/posts - Get all posts with pagination and filtering
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const categoryId = searchParams.get('categoryId');
  const authorId = searchParams.get('authorId');

  const skip = (page - 1) * limit;

  // Build where clause
  const where: {
    categoryId?: string;
    authorId?: string;
  } = {};
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (authorId) {
    where.authorId = authorId;
  }

  // Get posts with pagination
  const [posts, totalPosts] = await handleDatabaseOperation(async () => {
    return Promise.all([
      prisma.post.findMany({
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
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.post.count({ where })
    ]);
  });

  const totalPages = Math.ceil(totalPosts / limit);

  return NextResponse.json({
    posts,
    pagination: {
      page,
      limit,
      totalPages,
      totalPosts,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    }
  });
});

// POST /api/posts - Create a new post (requires authentication)
export const POST = withErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new AuthenticationError('You must be logged in to create posts');
  }

  const body = await request.json();
  const validatedData = validateRequest(createPostSchema, body);

  // Verify category exists
  const category = await handleDatabaseOperation(async () => {
    return prisma.category.findUnique({
      where: { id: validatedData.categoryId }
    });
  });

  if (!category) {
    throw new NotFoundError('The selected category does not exist');
  }

  const post = await handleDatabaseOperation(async () => {
    return prisma.post.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        imageUrl: validatedData.imageUrl,
        authorId: session.user.id,
        categoryId: validatedData.categoryId,
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
        }
      }
    });
  });

  return NextResponse.json({ post }, { status: 201 });
});