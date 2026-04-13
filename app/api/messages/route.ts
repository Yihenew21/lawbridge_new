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

    const searchParams = request.nextUrl.searchParams
    const conversationId = searchParams.get("conversationId")

    const sql = getDb()

    if (conversationId) {
      // Get messages for a specific conversation
      const messages = await sql`
        SELECT m.*, u.first_name, u.last_name
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = ${conversationId}
        ORDER BY m.created_at ASC
      `
      return NextResponse.json({ messages })
    } else {
      // Get all conversations for the user
      const conversations = await sql`
        SELECT DISTINCT 
          c.id, c.client_id, c.lawyer_id,
          u1.first_name as client_first, u1.last_name as client_last,
          u2.first_name as lawyer_first, u2.last_name as lawyer_last,
          (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count,
          (SELECT MAX(created_at) FROM messages WHERE conversation_id = c.id) as last_message_at
        FROM case_conversations c
        JOIN users u1 ON c.client_id = u1.id
        JOIN users u2 ON c.lawyer_id = u2.id
        WHERE c.client_id = ${user.id} OR c.lawyer_id = ${user.id}
        ORDER BY last_message_at DESC
      `
      return NextResponse.json({ conversations })
    }
  } catch (error) {
    console.error("Messages fetch error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
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

    const body = await request.json()
    const { conversationId, message } = body

    if (!conversationId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sql = getDb()

    // Insert message
    await sql`
      INSERT INTO messages (conversation_id, sender_id, content)
      VALUES (${conversationId}, ${user.id}, ${message})
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Message send error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
