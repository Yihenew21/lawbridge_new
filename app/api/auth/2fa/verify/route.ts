import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { verifyTOTP } from "speakeasy"

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

    const { totpSecret, code } = await request.json()

    if (!totpSecret || !code) {
      return NextResponse.json(
        { error: "TOTP secret and code are required" },
        { status: 400 }
      )
    }

    const verified = verifyTOTP({
      secret: totpSecret,
      encoding: "base32",
      token: code,
      window: 2,
    })

    if (!verified) {
      return NextResponse.json(
        { error: "Invalid TOTP code" },
        { status: 400 }
      )
    }

    const sql = getDb()

    await sql`
      UPDATE users 
      SET two_factor_secret = ${totpSecret}, 
          two_factor_enabled = true,
          updated_at = NOW()
      WHERE id = ${user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error verifying 2FA:", error)
    return NextResponse.json(
      { error: "Failed to verify 2FA" },
      { status: 500 }
    )
  }
}
