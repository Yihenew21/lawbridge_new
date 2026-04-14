import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const sql = getDb()

    const resetTokens = await sql`
      SELECT user_id FROM password_resets 
      WHERE token = ${token} AND expires_at > NOW()
    `

    if (resetTokens.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(newPassword)

    await sql.begin(async (sql) => {
      await sql`
        UPDATE users SET password_hash = ${hashedPassword}, updated_at = NOW()
        WHERE id = ${resetTokens[0].user_id}
      `

      await sql`
        DELETE FROM password_resets WHERE token = ${token}
      `
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    )
  }
}
