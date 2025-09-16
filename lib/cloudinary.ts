import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

export interface UploadError {
  message: string;
  code?: string;
}

/**
 * Upload an image to Cloudinary
 * @param file - The file to upload (as base64 string or buffer)
 * @param folder - Optional folder to organize uploads
 * @returns Promise with upload result or error
 */
export async function uploadToCloudinary(
  file: string | Buffer,
  folder: string = 'litaria-posts'
): Promise<{ success: true; data: CloudinaryUploadResult } | { success: false; error: UploadError }> {
  try {
    // Convert Buffer to base64 string if needed
    const fileToUpload = Buffer.isBuffer(file) 
      ? `data:image/jpeg;base64,${file.toString('base64')}`
      : file;

    const uploadResult = await cloudinary.uploader.upload(fileToUpload, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 800, crop: 'limit' }, // Limit max size
        { quality: 'auto' }, // Auto quality optimization
        { format: 'auto' } // Auto format optimization
      ]
    });

    return {
      success: true,
      data: {
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
      }
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to upload image',
        code: (error as { error?: { http_code?: string } })?.error?.http_code || 'UPLOAD_ERROR'
      }
    };
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 * @returns Promise with deletion result
 */
export async function deleteFromCloudinary(
  publicId: string
): Promise<{ success: true } | { success: false; error: UploadError }> {
  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to delete image',
        code: 'DELETE_ERROR'
      }
    };
  }
}

/**
 * Convert File to base64 string for upload
 * @param file - File object from form input
 * @returns Promise with base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Validate image file
 * @param file - File to validate
 * @returns Validation result
 */
export function validateImageFile(file: File): { valid: true } | { valid: false; error: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
    };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Please upload an image smaller than 5MB.'
    };
  }

  return { valid: true };
}

export default cloudinary;