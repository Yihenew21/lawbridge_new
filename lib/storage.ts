import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

// Initialize S3 client (works with AWS S3, Cloudflare R2, DigitalOcean Spaces, etc.)
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT, // For Cloudflare R2 or other S3-compatible services
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || '';
const PUBLIC_URL = process.env.S3_PUBLIC_URL || ''; // CDN URL or bucket public URL

interface UploadOptions {
  file: File;
  folder: string; // e.g., 'avatars', 'verification-docs'
  userId: string;
}

export async function uploadToStorage(options: UploadOptions): Promise<string> {
  const { file, folder, userId } = options;

  // Generate unique filename
  const fileExtension = file.name.split('.').pop();
  const uniqueFilename = `${folder}/${userId}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${fileExtension}`;

  // Convert file to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Upload to S3-compatible storage
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: uniqueFilename,
    Body: buffer,
    ContentType: file.type,
    // Make file publicly readable
    ACL: 'public-read',
  });

  await s3Client.send(command);

  // Return public URL
  const publicUrl = `${PUBLIC_URL}/${uniqueFilename}`;
  return publicUrl;
}

export async function deleteFromStorage(fileUrl: string): Promise<void> {
  try {
    // Extract key from URL
    const key = fileUrl.replace(`${PUBLIC_URL}/`, '');

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Failed to delete file from storage:', error);
    // Don't throw error - file might already be deleted
  }
}

// Validate file type and size
export function validateFile(file: File, options: {
  maxSize: number;
  allowedTypes: string[];
}): { valid: boolean; error?: string } {
  if (!options.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${options.allowedTypes.join(', ')}`,
    };
  }

  if (file.size > options.maxSize) {
    const maxSizeMB = options.maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxSizeMB}MB.`,
    };
  }

  return { valid: true };
}
