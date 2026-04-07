import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

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

    const { eventType, eventData } = await request.json()

    if (!eventType) {
      return NextResponse.json(
        { error: "Event type is required" },
        { status: 400 }
      )
    }

    const sql = getDb()

    await sql`
      INSERT INTO user_analytics (
        user_id, event_type, event_data, 
        user_agent, ip_address, created_at
      )
      VALUES (
        ${user.id}, ${eventType}, ${JSON.stringify(eventData)},
        ${request.headers.get("user-agent")},
        ${request.headers.get("x-forwarded-for") || "unknown"},
        NOW()
      )
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking analytics:", error)
    return NextResponse.json(
      { error: "Failed to track analytics" },
      { status: 500 }
    )
  }
}

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

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get("days") || "30")

    const analytics = await sql`
      SELECT event_type, COUNT(*) as count, 
             MAX(created_at) as last_event
      FROM user_analytics
      WHERE user_id = ${user.id}
        AND created_at > NOW() - INTERVAL '${days} days'
      GROUP BY event_type
      ORDER BY count DESC
    `

    const lastLogin = await sql`
      SELECT MAX(login_time) as last_login
      FROM login_activity
      WHERE user_id = ${user.id}
    `

    return NextResponse.json({
      analytics,
      lastLogin: lastLogin[0]?.last_login,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
