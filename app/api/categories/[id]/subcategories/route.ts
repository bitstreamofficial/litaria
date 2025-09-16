import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/categories/[id]/subcategories - Get all subcategories for a category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;

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

    const subcategories = await prisma.subcategory.findMany({
      where: {
        categoryId: categoryId
      },
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ subcategories });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subcategories', message: 'Internal server error' },
      { status: 500 }
    );
  }
}