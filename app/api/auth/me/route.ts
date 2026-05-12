import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getDb } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("lawbridge_session")?.value
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    // Verify session exists in database and is not expired
    const sql = getDb()
    const sessions = await sql`
      SELECT id FROM sessions
      WHERE token = ${token} AND expires_at > NOW()
      LIMIT 1
    `

    if (sessions.length === 0) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    // Get complete user details from database (not from JWT)
    const users = await sql`
      SELECT id, email, role, first_name, last_name, phone, specialization, bio,
             avatar_url, email_verified, account_status, two_factor_enabled
      FROM users
      WHERE id = ${user.id}
      LIMIT 1
    `

    if (users.length === 0) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const userData = users[0]

    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        specialization: userData.specialization,
        bio: userData.bio,
        avatar_url: userData.avatar_url,
        email_verified: userData.email_verified || false,
        account_status: userData.account_status || 'active',
        two_factor_enabled: userData.two_factor_enabled || false,
      }
    })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ user: null }, { status: 401 })
  }
}
