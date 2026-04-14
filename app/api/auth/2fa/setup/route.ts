import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { generateTOTPSecret } from "speakeasy"

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

    const secret = generateTOTPSecret({
      name: `LawBridge (${user.email})`,
      issuer: "LawBridge",
      length: 32,
    })

    return NextResponse.json({
      secret: secret.base32,
      qrCode: secret.otpauth_url,
    })
  } catch (error) {
    console.error("Error setting up 2FA:", error)
    return NextResponse.json(
      { error: "Failed to setup 2FA" },
      { status: 500 }
    )
  }
}
