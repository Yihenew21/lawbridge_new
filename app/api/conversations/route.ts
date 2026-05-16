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

    // Get all conversations for the user with participant details and unread counts
    const conversations = await sql`
      SELECT
        c.id,
        c.participant_1_id,
        c.participant_2_id,
        c.case_id,
        c.last_message_at,
        c.created_at,
        -- Get the other participant's details
        CASE
          WHEN c.participant_1_id = ${user.id} THEN u2.id
          ELSE u1.id
        END as other_user_id,
        CASE
          WHEN c.participant_1_id = ${user.id} THEN u2.first_name
          ELSE u1.first_name
        END as other_user_first_name,
        CASE
          WHEN c.participant_1_id = ${user.id} THEN u2.last_name
          ELSE u1.last_name
        END as other_user_last_name,
        CASE
          WHEN c.participant_1_id = ${user.id} THEN u2.avatar_url
          ELSE u1.avatar_url
        END as other_user_avatar,
        CASE
          WHEN c.participant_1_id = ${user.id} THEN u2.role
          ELSE u1.role
        END as other_user_role,
        -- Get last message preview
        (
          SELECT content
          FROM messages
          WHERE conversation_id = c.id
            AND is_deleted = false
          ORDER BY created_at DESC
          LIMIT 1
        ) as last_message_content,
        (
          SELECT sender_id
          FROM messages
          WHERE conversation_id = c.id
            AND is_deleted = false
          ORDER BY created_at DESC
          LIMIT 1
        ) as last_message_sender_id,
        -- Get unread count
        COALESCE(
          (
            SELECT unread_count
            FROM conversation_participants
            WHERE conversation_id = c.id AND user_id = ${user.id}
          ),
          0
        ) as unread_count,
        -- Get online status
        COALESCE(
          (
            SELECT is_online
            FROM user_online_status
            WHERE user_id = CASE
              WHEN c.participant_1_id = ${user.id} THEN c.participant_2_id
              ELSE c.participant_1_id
            END
          ),
          false
        ) as other_user_online,
        COALESCE(
          (
            SELECT last_seen_at
            FROM user_online_status
            WHERE user_id = CASE
              WHEN c.participant_1_id = ${user.id} THEN c.participant_2_id
              ELSE c.participant_1_id
            END
          ),
          c.created_at
        ) as other_user_last_seen
      FROM conversations c
      JOIN users u1 ON c.participant_1_id = u1.id
      JOIN users u2 ON c.participant_2_id = u2.id
      WHERE c.participant_1_id = ${user.id} OR c.participant_2_id = ${user.id}
      ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC
    `

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
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
    const { otherUserId, caseId } = body

    if (!otherUserId) {
      return NextResponse.json(
        { error: "otherUserId is required" },
        { status: 400 }
      )
    }

    const sql = getDb()

    // Check if conversation already exists
    const existing = await sql`
      SELECT id FROM conversations
      WHERE (participant_1_id = ${user.id} AND participant_2_id = ${otherUserId})
         OR (participant_1_id = ${otherUserId} AND participant_2_id = ${user.id})
      LIMIT 1
    `

    if (existing.length > 0) {
      return NextResponse.json({ conversation: existing[0] })
    }

    // Create new conversation
    const result = await sql`
      INSERT INTO conversations (participant_1_id, participant_2_id, case_id)
      VALUES (${user.id}, ${otherUserId}, ${caseId || null})
      RETURNING id, participant_1_id, participant_2_id, case_id, created_at
    `

    // Initialize conversation participants
    await sql`
      INSERT INTO conversation_participants (conversation_id, user_id)
      VALUES
        (${result[0].id}, ${user.id}),
        (${result[0].id}, ${otherUserId})
    `

    return NextResponse.json(
      { conversation: result[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    )
  }
}
