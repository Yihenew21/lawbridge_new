import { NextResponse } from "next/server"
import { verifyPassword, createToken, getUserByEmail } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { checkRateLimit, getRateLimitIdentifier, RATE_LIMITS } from "@/lib/rate-limit"

const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 30 * 60 * 1000 // 30 minutes

export async function POST(request: Request) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = checkRateLimit(`login:${identifier}`, RATE_LIMITS.LOGIN);

    if (!rateLimit.allowed) {
      const resetIn = Math.ceil((rateLimit.resetTime - Date.now()) / 1000 / 60);
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${resetIn} minutes.` },
        { status: 429 }
      );
    }

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Get client info
    const ipAddress = identifier;
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Find user
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const sql = getDb();

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const unlockTime = new Date(user.locked_until);
      const minutesLeft = Math.ceil((unlockTime.getTime() - Date.now()) / 1000 / 60);
      return NextResponse.json(
        { error: `Account is locked due to too many failed login attempts. Try again in ${minutesLeft} minutes.` },
        { status: 423 }
      );
    }

    // Check account status
    if (user.account_status !== 'active') {
      return NextResponse.json(
        { error: `Account is ${user.account_status}. Please contact support.` },
        { status: 403 }
      );
    }

    // Verify password
    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) {
      // Increment failed login attempts
      const newFailedAttempts = (user.failed_login_attempts || 0) + 1;

      if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
        // Lock the account
        const lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
        await sql`
          UPDATE users
          SET failed_login_attempts = ${newFailedAttempts},
              locked_until = ${lockUntil.toISOString()}
          WHERE id = ${user.id}
        `;

        return NextResponse.json(
          { error: `Too many failed login attempts. Account locked for 30 minutes.` },
          { status: 423 }
        );
      } else {
        // Just increment the counter
        await sql`
          UPDATE users
          SET failed_login_attempts = ${newFailedAttempts}
          WHERE id = ${user.id}
        `;

        const attemptsLeft = MAX_FAILED_ATTEMPTS - newFailedAttempts;
        return NextResponse.json(
          { error: `Invalid email or password. ${attemptsLeft} attempts remaining.` },
          { status: 401 }
        );
      }
    }

    // Reset failed login attempts on successful login
    await sql`
      UPDATE users
      SET failed_login_attempts = 0,
          locked_until = NULL,
          last_login_at = NOW(),
          last_login_ip = ${ipAddress}
      WHERE id = ${user.id}
    `;

    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      // Return a special response indicating 2FA is required
      return NextResponse.json({
        requires2FA: true,
        userId: user.id,
        email: user.email,
      }, { status: 200 });
    }

    // Create JWT token
    const sessionUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
    }
    const token = await createToken(sessionUser)

    // Store session in database
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000)
    await sql`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})
    `

    // Set cookie on the response
    const response = NextResponse.json({ user: sessionUser })
    response.cookies.set("lawbridge_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
