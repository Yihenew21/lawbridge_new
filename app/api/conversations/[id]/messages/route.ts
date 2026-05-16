import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

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

    // Get pagination params
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "50")
    const before = searchParams.get("before") // message ID to fetch messages before

    // Fetch messages
    let messages
    if (before) {
      messages = await sql`
        SELECT
          m.id,
          m.conversation_id,
          m.sender_id,
          m.content,
          m.message_type,
          m.is_edited,
          m.edited_at,
          m.is_deleted,
          m.reply_to_id,
          m.created_at,
          u.first_name,
          u.last_name,
          u.avatar_url,
          -- Get attachments
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', ma2.id,
                  'file_url', ma2.file_url,
                  'file_name', ma2.file_name,
                  'file_type', ma2.file_type,
                  'file_size', ma2.file_size
                )
              )
              FROM message_attachments ma2
              WHERE ma2.message_id = m.id
            ),
            '[]'::json
          ) as attachments,
          -- Get read receipts
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'user_id', mrr2.user_id,
                  'read_at', mrr2.read_at
                )
              )
              FROM message_read_receipts mrr2
              WHERE mrr2.message_id = m.id
            ),
            '[]'::json
          ) as read_receipts
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = ${conversationId}
          AND m.is_deleted = false
          AND m.created_at < (SELECT created_at FROM messages WHERE id = ${before})
        ORDER BY m.created_at DESC
        LIMIT ${limit}
      `
    } else {
      messages = await sql`
        SELECT
          m.id,
          m.conversation_id,
          m.sender_id,
          m.content,
          m.message_type,
          m.is_edited,
          m.edited_at,
          m.is_deleted,
          m.reply_to_id,
          m.created_at,
          u.first_name,
          u.last_name,
          u.avatar_url,
          -- Get attachments
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', ma2.id,
                  'file_url', ma2.file_url,
                  'file_name', ma2.file_name,
                  'file_type', ma2.file_type,
                  'file_size', ma2.file_size
                )
              )
              FROM message_attachments ma2
              WHERE ma2.message_id = m.id
            ),
            '[]'::json
          ) as attachments,
          -- Get read receipts
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'user_id', mrr2.user_id,
                  'read_at', mrr2.read_at
                )
              )
              FROM message_read_receipts mrr2
              WHERE mrr2.message_id = m.id
            ),
            '[]'::json
          ) as read_receipts
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = ${conversationId}
          AND m.is_deleted = false
        ORDER BY m.created_at DESC
        LIMIT ${limit}
      `
    }

    // Reverse to get chronological order
    messages.reverse()

    // Mark messages as read
    const unreadMessageIds = messages
      .filter((m: any) => m.sender_id !== user.id)
      .map((m: any) => m.id)

    if (unreadMessageIds.length > 0) {
      await sql`
        INSERT INTO message_read_receipts (message_id, user_id)
        SELECT unnest(${unreadMessageIds}::uuid[]), ${user.id}
        ON CONFLICT (message_id, user_id) DO NOTHING
      `

      // Reset unread count
      await sql`
        UPDATE conversation_participants
        SET unread_count = 0
        WHERE conversation_id = ${conversationId} AND user_id = ${user.id}
      `
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

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
    const body = await request.json()
    const { content, messageType = "text", replyToId, attachments } = body

    // Validate: either content or attachments must be present
    if ((!content || content.trim().length === 0) && (!attachments || attachments.length === 0)) {
      return NextResponse.json(
        { error: "Message content or attachments are required" },
        { status: 400 }
      )
    }

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

    // Insert message
    // Use placeholder text if content is empty but attachments exist
    const messageContent = content && content.trim().length > 0
      ? content.trim()
      : (attachments && attachments.length > 0 ? '[Attachment]' : '')

    const result = await sql`
      INSERT INTO messages (
        conversation_id,
        sender_id,
        content,
        message_type,
        reply_to_id
      )
      VALUES (
        ${conversationId},
        ${user.id},
        ${messageContent},
        ${messageType},
        ${replyToId || null}
      )
      RETURNING id, conversation_id, sender_id, content, message_type, reply_to_id, created_at
    `

    const message = result[0]

    // Insert attachments if provided
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        await sql`
          INSERT INTO message_attachments (
            message_id,
            file_url,
            file_name,
            file_type,
            file_size
          )
          VALUES (
            ${message.id},
            ${attachment.file_url},
            ${attachment.file_name},
            ${attachment.file_type},
            ${attachment.file_size}
          )
        `
      }
    }

    return NextResponse.json(
      { message },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
