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

    // Get total unread count from all conversations
    const result = await sql`
      SELECT COALESCE(SUM(unread_count), 0) as total_unread
      FROM conversation_participants
      WHERE user_id = ${user.id}
    `

    const totalUnread = parseInt(result[0]?.total_unread || "0")

    return NextResponse.json({ unreadCount: totalUnread })
  } catch (error) {
    console.error("Error fetching unread count:", error)
    return NextResponse.json(
      { error: "Failed to fetch unread count" },
      { status: 500 }
    )
  }
}
