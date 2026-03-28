import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("lawbridge_session")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = getDb()

    const activities = await sql`
      SELECT id, ip_address, user_agent, login_time, logout_time, status
      FROM login_activity
      WHERE user_id = ${user.id}
      ORDER BY login_time DESC
      LIMIT 20
    `

    return NextResponse.json({ activities })
  } catch (error) {
    console.error("Error fetching login activity:", error)
    return NextResponse.json(
      { error: "Failed to fetch login activity" },
      { status: 500 }
    )
  }
}

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

    const { userAgent } = await request.json()
    const ipAddress = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown"

    const sql = getDb()

    await sql`
      INSERT INTO login_activity (user_id, ip_address, user_agent, login_time, status)
      VALUES (${user.id}, ${ipAddress}, ${userAgent}, NOW(), 'active')
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error logging login activity:", error)
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    )
  }
}
