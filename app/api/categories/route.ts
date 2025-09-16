import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema for category creation
const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name must be less than 50 characters'),
});

// GET /api/categories - Get all categories with post counts
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category (requires authentication)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to create categories' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createCategorySchema.parse(body);

    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: validatedData.name }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category exists', message: 'A category with this name already exists' },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
      },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', message: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category', message: 'Internal server error' },
      { status: 500 }
    );
  }
}