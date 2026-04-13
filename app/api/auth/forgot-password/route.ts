import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const sql = getDb()

    const users = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `

    if (users.length === 0) {
      return NextResponse.json(
        { message: "If an account exists, a reset link will be sent" },
        { status: 200 }
      )
    }

    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await sql`
      INSERT INTO password_resets (user_id, token, expires_at, created_at)
      VALUES (${users[0].id}, ${resetToken}, ${resetExpiry}, NOW())
    `

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`

    console.log(`Password reset link: ${resetLink}`)

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
