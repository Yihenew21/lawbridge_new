import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get("lawbridge_session")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: conversationId } = await params
    const sql = getDb()

    // Verify user is part of this conversation
    const conversation = await sql`
      SELECT id FROM conversations
      WHERE id = ${conversationId}
        AND (participant_1_id = ${user.id} OR participant_2_id = ${user.id})
      LIMIT 1
    `

    if (conversation.length === 0) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 }
      )
    }

    // Upsert typing indicator (expires in 10 seconds)
    await sql`
      INSERT INTO typing_indicators (conversation_id, user_id, started_at, expires_at)
      VALUES (
        ${conversationId},
        ${user.id},
        NOW(),
        NOW() + INTERVAL '10 seconds'
      )
      ON CONFLICT (conversation_id, user_id)
      DO UPDATE SET
        started_at = NOW(),
        expires_at = NOW() + INTERVAL '10 seconds'
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating typing indicator:", error)
    return NextResponse.json(
      { error: "Failed to update typing indicator" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get("lawbridge_session")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: conversationId } = await params
    const sql = getDb()

    // Get active typing indicators (excluding current user)
    const typingUsers = await sql`
      SELECT
        ti.user_id,
        u.first_name,
        u.last_name
      FROM typing_indicators ti
      JOIN users u ON ti.user_id = u.id
      WHERE ti.conversation_id = ${conversationId}
        AND ti.user_id != ${user.id}
        AND ti.expires_at > NOW()
    `

    return NextResponse.json({ typingUsers })
  } catch (error) {
    console.error("Error fetching typing indicators:", error)
    return NextResponse.json(
      { error: "Failed to fetch typing indicators" },
      { status: 500 }
    )
  }
}
