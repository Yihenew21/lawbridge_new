import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { sendEmail, generatePasswordResetEmailHtml, generatePasswordResetEmailText } from "@/lib/email"
import { checkRateLimit, getRateLimitIdentifier, RATE_LIMITS } from "@/lib/rate-limit"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = checkRateLimit(`password-reset:${identifier}`, RATE_LIMITS.PASSWORD_RESET);

    if (!rateLimit.allowed) {
      const resetIn = Math.ceil((rateLimit.resetTime - Date.now()) / 1000 / 60);
      return NextResponse.json(
        { error: `Too many password reset requests. Please try again in ${resetIn} minutes.` },
        { status: 429 }
      );
    }
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const sql = getDb()

    const users = await sql`
      SELECT id, email, first_name, last_name FROM users WHERE email = ${email.toLowerCase()}
    `

    if (users.length === 0) {
      return NextResponse.json(
        { message: "If an account exists, a reset link will be sent" },
        { status: 200 }
      )
    }

    const user = users[0]
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await sql`
      INSERT INTO password_resets (user_id, token, expires_at, created_at)
      VALUES (${user.id}, ${resetToken}, ${resetExpiry}, NOW())
    `

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}`

    // Send password reset email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset Your Password - LawBridge Ethiopia',
        html: generatePasswordResetEmailHtml(resetLink, `${user.first_name} ${user.last_name}`),
        text: generatePasswordResetEmailText(resetLink, `${user.first_name} ${user.last_name}`),
      })
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      // Don't reveal email sending failure to prevent user enumeration
    }

    return NextResponse.json(
      { message: "If an account exists, a reset link will be sent" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error requesting password reset:", error)
    return NextResponse.json(
      { error: "Failed to process reset request" },
      { status: 500 }
    )
  }
}
