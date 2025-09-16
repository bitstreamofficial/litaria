import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToCloudinary, validateImageFile } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to upload images' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', message: 'Please select a file to upload' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid file', message: validation.error },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(buffer, 'litaria-posts');

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: 'Upload failed', message: uploadResult.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageUrl: uploadResult.data.secure_url,
      publicId: uploadResult.data.public_id,
      width: uploadResult.data.width,
      height: uploadResult.data.height,
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Upload failed', message: 'Internal server error' },
      { status: 500 }
    );
  }
}