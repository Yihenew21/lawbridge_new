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

    // Soft delete all messages in this conversation
    // This marks them as deleted but doesn't remove from database
    await sql`
      UPDATE messages
      SET is_deleted = true, deleted_at = NOW()
      WHERE conversation_id = ${conversationId}
        AND is_deleted = false
    `

    // Reset unread count for this user
    await sql`
      UPDATE conversation_participants
      SET unread_count = 0
      WHERE conversation_id = ${conversationId}
        AND user_id = ${user.id}
    `

    return NextResponse.json({
      success: true,
      message: "Chat history cleared successfully"
    })
  } catch (error) {
    console.error("Error clearing chat history:", error)
    return NextResponse.json(
      { error: "Failed to clear chat history" },
      { status: 500 }
    )
  }
}
