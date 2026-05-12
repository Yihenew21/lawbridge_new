import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import speakeasy from "speakeasy"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("lawbridge_session")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 }
      )
    }

    const sql = getDb()

    // Get user's 2FA secret
    const users = await sql`
      SELECT two_factor_secret FROM users WHERE id = ${user.id}
    `

    if (users.length === 0 || !users[0].two_factor_secret) {
      return NextResponse.json(
        { error: "2FA not set up" },
        { status: 400 }
      )
    }

    const verified = speakeasy.totp.verify({
      secret: users[0].two_factor_secret,
      encoding: "base32",
      token: code,
      window: 2,
    })

    if (!verified) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      )
    }

    // Enable 2FA
    await sql`
      UPDATE users
      SET two_factor_enabled = true,
          updated_at = NOW()
      WHERE id = ${user.id}
    `

    return NextResponse.json({ success: true, message: "2FA enabled successfully" })
  } catch (error) {
    console.error("Error verifying 2FA:", error)
    return NextResponse.json(
      { error: "Failed to verify 2FA" },
      { status: 500 }
    )
  }
}
