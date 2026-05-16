import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import crypto from "crypto"

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
    const status = searchParams.get("status")

    const sql = getDb()

    let query
    if (conversationId) {
      // Get call history for a specific conversation
      query = sql`
        SELECT
          vcs.id,
          vcs.conversation_id,
          vcs.initiator_id,
          vcs.receiver_id,
          vcs.room_id,
          vcs.call_type,
          vcs.status,
          vcs.started_at,
          vcs.ended_at,
          vcs.duration_seconds,
          vcs.created_at,
          u1.first_name as initiator_first_name,
          u1.last_name as initiator_last_name,
          u2.first_name as receiver_first_name,
          u2.last_name as receiver_last_name
        FROM video_call_sessions vcs
        JOIN users u1 ON vcs.initiator_id = u1.id
        JOIN users u2 ON vcs.receiver_id = u2.id
        WHERE vcs.conversation_id = ${conversationId}
          AND (vcs.initiator_id = ${user.id} OR vcs.receiver_id = ${user.id})
        ORDER BY vcs.created_at DESC
        LIMIT 50
      `
    } else {
      // Get all call history for the user
      query = sql`
        SELECT
          vcs.id,
          vcs.conversation_id,
          vcs.initiator_id,
          vcs.receiver_id,
          vcs.room_id,
          vcs.call_type,
          vcs.status,
          vcs.started_at,
          vcs.ended_at,
          vcs.duration_seconds,
          vcs.created_at,
          u1.first_name as initiator_first_name,
          u1.last_name as initiator_last_name,
          u2.first_name as receiver_first_name,
          u2.last_name as receiver_last_name
        FROM video_call_sessions vcs
        JOIN users u1 ON vcs.initiator_id = u1.id
        JOIN users u2 ON vcs.receiver_id = u2.id
        WHERE (vcs.initiator_id = ${user.id} OR vcs.receiver_id = ${user.id})
          ${status ? sql`AND vcs.status = ${status}` : sql``}
        ORDER BY vcs.created_at DESC
        LIMIT 100
      `
    }

    const calls = await query

    return NextResponse.json({ calls })
  } catch (error) {
    console.error("Error fetching video calls:", error)
    return NextResponse.json(
      { error: "Failed to fetch video calls" },
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
    const { conversationId, receiverId, callType = "video" } = body

    if (!conversationId || !receiverId) {
      return NextResponse.json(
        { error: "conversationId and receiverId are required" },
        { status: 400 }
      )
    }

    const sql = getDb()

    // Verify conversation exists and user is part of it
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

    // Generate unique room ID
    const roomId = `lawbridge-${conversationId}-${crypto.randomBytes(8).toString("hex")}`

    // Create video call session
    const result = await sql`
      INSERT INTO video_call_sessions (
        conversation_id,
        initiator_id,
        receiver_id,
        room_id,
        call_type,
        status
      )
      VALUES (
        ${conversationId},
        ${user.id},
        ${receiverId},
        ${roomId},
        ${callType},
        'initiated'
      )
      RETURNING id, conversation_id, initiator_id, receiver_id, room_id, call_type, status, created_at
    `

    const call = result[0]

    // Create a system message in the conversation
    await sql`
      INSERT INTO messages (
        conversation_id,
        sender_id,
        content,
        message_type
      )
      VALUES (
        ${conversationId},
        ${user.id},
        ${callType === "video" ? "📹 Video call initiated" : "📞 Audio call initiated"},
        'system'
      )
    `

    return NextResponse.json(
      { call },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error initiating video call:", error)
    return NextResponse.json(
      { error: "Failed to initiate video call" },
      { status: 500 }
    )
  }
}
