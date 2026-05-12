import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { uploadToStorage, deleteFromStorage, validateFile } from '@/lib/storage';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

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

    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    const validation = validateFile(file, {
      maxSize: MAX_FILE_SIZE,
      allowedTypes: ALLOWED_TYPES,
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const sql = getDb();

    // Get current avatar URL to delete old file
    const users = await sql`
      SELECT avatar_url FROM users WHERE id = ${user.id}
    `;

    const oldAvatarUrl = users[0]?.avatar_url;

    // Upload new avatar to cloud storage
    const avatarUrl = await uploadToStorage({
      file,
      folder: 'avatars',
      userId: user.id,
    });

    // Update user's avatar_url in database
    await sql`
      UPDATE users
      SET avatar_url = ${avatarUrl},
          updated_at = NOW()
      WHERE id = ${user.id}
    `;

    // Delete old avatar from storage (if exists)
    if (oldAvatarUrl && oldAvatarUrl.includes(process.env.S3_PUBLIC_URL || '')) {
      await deleteFromStorage(oldAvatarUrl);
    }

    return NextResponse.json({
      message: 'Avatar uploaded successfully',
      avatarUrl,
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('lawbridge_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = getDb();

    // Get current avatar URL
    const users = await sql`
      SELECT avatar_url FROM users WHERE id = ${user.id}
    `;

    const avatarUrl = users[0]?.avatar_url;

    // Remove avatar_url from database
    await sql`
      UPDATE users
      SET avatar_url = NULL,
          updated_at = NOW()
      WHERE id = ${user.id}
    `;

    // Delete file from storage
    if (avatarUrl && avatarUrl.includes(process.env.S3_PUBLIC_URL || '')) {
      await deleteFromStorage(avatarUrl);
    }

    return NextResponse.json({
      message: 'Avatar removed successfully',
    });
  } catch (error) {
    console.error('Avatar removal error:', error);
    return NextResponse.json(
      { error: 'Failed to remove avatar' },
      { status: 500 }
    );
  }
}
