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

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ user: null }, { status: 401 })
  }
}
