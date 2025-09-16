import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema for subcategory creation
const createSubcategorySchema = z.object({
  name: z.string().min(1, 'Subcategory name is required').max(50, 'Subcategory name must be less than 50 characters'),
});

// POST /api/categories/[id]/subcategories/create - Create a new subcategory (requires authentication)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to create subcategories' },
        { status: 401 }
      );
    }

    const { id: categoryId } = await params;
    const body = await request.json();
    const validatedData = createSubcategorySchema.parse(body);

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found', message: 'The specified category does not exist' },
        { status: 404 }
      );
    }

    // Check if subcategory already exists in this category
    const existingSubcategory = await prisma.subcategory.findUnique({
      where: { 
        name_categoryId: {
          name: validatedData.name,
          categoryId: categoryId
        }
      }
    });

    if (existingSubcategory) {
      return NextResponse.json(
        { error: 'Subcategory exists', message: 'A subcategory with this name already exists in this category' },
        { status: 409 }
      );
    }

    const subcategory = await prisma.subcategory.create({
      data: {
        name: validatedData.name,
        categoryId: categoryId,
      },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    return NextResponse.json({ subcategory }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', message: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to create subcategory', message: 'Internal server error' },
      { status: 500 }
    );
  }
}