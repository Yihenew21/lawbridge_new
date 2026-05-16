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

    const body = await request.json()
    const { isOnline } = body

    const sql = getDb()

    // Upsert online status
    await sql`
      INSERT INTO user_online_status (user_id, is_online, last_seen_at, updated_at)
      VALUES (${user.id}, ${isOnline}, NOW(), NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        is_online = ${isOnline},
        last_seen_at = NOW(),
        updated_at = NOW()
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating online status:", error)
    return NextResponse.json(
      { error: "Failed to update online status" },
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

    const searchParams = request.nextUrl.searchParams
    const userIds = searchParams.get("userIds")?.split(",") || []

    if (userIds.length === 0) {
      return NextResponse.json(
        { error: "userIds parameter is required" },
        { status: 400 }
      )
    }

    const sql = getDb()

    const statuses = await sql`
      SELECT
        user_id,
        is_online,
        last_seen_at
      FROM user_online_status
      WHERE user_id = ANY(${userIds}::uuid[])
    `

    return NextResponse.json({ statuses })
  } catch (error) {
    console.error("Error fetching online status:", error)
    return NextResponse.json(
      { error: "Failed to fetch online status" },
      { status: 500 }
    )
  }
}
