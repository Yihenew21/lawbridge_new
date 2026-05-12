import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { uploadToStorage, validateFile } from '@/lib/storage';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('lawbridge_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'lawyer') {
      return NextResponse.json(
        { error: 'Only lawyers can upload verification documents' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('documents') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Validate all files
    for (const file of files) {
      const validation = validateFile(file, {
        maxSize: MAX_FILE_SIZE,
        allowedTypes: ALLOWED_TYPES,
      });

      if (!validation.valid) {
        return NextResponse.json(
          { error: `${file.name}: ${validation.error}` },
          { status: 400 }
        );
      }
    }

    // Upload all files to cloud storage
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const url = await uploadToStorage({
        file,
        folder: 'verification-docs',
        userId: user.id,
      });
      uploadedUrls.push(url);
    }

    return NextResponse.json({
      message: 'Documents uploaded successfully',
      documentUrls: uploadedUrls,
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload documents' },
      { status: 500 }
    );
  }
}
