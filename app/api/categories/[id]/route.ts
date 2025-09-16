import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema for category update
const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name must be less than 50 characters'),
});

// GET /api/categories/[id] - Get a specific category with post count
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found', message: 'The requested category does not exist' },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Update a category (requires authentication)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to update categories' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateCategorySchema.parse(body);

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found', message: 'The requested category does not exist' },
        { status: 404 }
      );
    }

    // Check if another category with the same name exists
    const duplicateCategory = await prisma.category.findFirst({
      where: { 
        name: validatedData.name,
        id: { not: id }
      }
    });

    if (duplicateCategory) {
      return NextResponse.json(
        { error: 'Category exists', message: 'A category with this name already exists' },
        { status: 409 }
      );
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: validatedData.name,
      },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    return NextResponse.json({ category: updatedCategory });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', message: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete a category (requires authentication)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to delete categories' },
        { status: 401 }
      );
    }

    const { id } = await params;
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found', message: 'The requested category does not exist' },
        { status: 404 }
      );
    }

    // Check if category has posts
    if (existingCategory._count.posts > 0) {
      return NextResponse.json(
        { error: 'Category in use', message: 'Cannot delete category that has posts assigned to it' },
        { status: 409 }
      );
    }

    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category', message: 'Internal server error' },
      { status: 500 }
    );
  }
}