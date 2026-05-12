import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createToken } from '@/lib/auth';
import speakeasy from 'speakeasy';
import { verifyBackupCode } from '@/lib/backup-codes';

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: NextRequest) {
  try {
    const { userId, code, isBackupCode } = await request.json();

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'User ID and code are required' },
        { status: 400 }
      );
    }

    const sql = getDb();

    // Get user details
    const users = await sql`
      SELECT id, email, first_name, last_name, role, two_factor_secret, two_factor_backup_codes, two_factor_enabled
      FROM users
      WHERE id = ${userId}
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];

    if (!user.two_factor_enabled) {
      return NextResponse.json(
        { error: '2FA is not enabled for this user' },
        { status: 400 }
      );
    }

    let verified = false;

    if (isBackupCode) {
      // Verify backup code
      const backupCodes = user.two_factor_backup_codes || [];
      verified = verifyBackupCode(code, backupCodes);

      if (verified) {
        // Remove used backup code
        const updatedCodes = backupCodes.filter(
          (hashedCode: string) => hashedCode !== require('crypto').createHash('sha256').update(code.replace(/-/g, '').toUpperCase()).digest('hex')
        );

        await sql`
          UPDATE users
          SET two_factor_backup_codes = ${JSON.stringify(updatedCodes)}
          WHERE id = ${userId}
        `;
      }
    } else {
      // Verify TOTP code
      verified = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token: code,
        window: 2,
      });
    }

    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 401 }
      );
    }

    // Create session token
    const sessionUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
    };
    const token = await createToken(sessionUser);

    // Store session in database
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
    await sql`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})
    `;

    // Set cookie
    const response = NextResponse.json({
      user: sessionUser,
      message: '2FA verification successful'
    });
    response.cookies.set('lawbridge_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('2FA login verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA' },
      { status: 500 }
    );
  }
}
