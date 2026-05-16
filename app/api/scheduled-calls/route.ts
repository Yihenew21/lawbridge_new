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
    const upcoming = searchParams.get("upcoming") === "true"

    const sql = getDb()

    let query
    if (upcoming) {
      // Get upcoming scheduled calls
      query = sql`
        SELECT
          svc.*,
          u1.first_name as organizer_first_name,
          u1.last_name as organizer_last_name,
          u2.first_name as participant_first_name,
          u2.last_name as participant_last_name
        FROM scheduled_video_calls svc
        JOIN users u1 ON svc.organizer_id = u1.id
        JOIN users u2 ON svc.participant_id = u2.id
        WHERE (svc.organizer_id = ${user.id} OR svc.participant_id = ${user.id})
          AND svc.status = 'scheduled'
          AND svc.scheduled_at > NOW()
        ORDER BY svc.scheduled_at ASC
      `
    } else {
      // Get all scheduled calls
      query = sql`
        SELECT
          svc.*,
          u1.first_name as organizer_first_name,
          u1.last_name as organizer_last_name,
          u2.first_name as participant_first_name,
          u2.last_name as participant_last_name
        FROM scheduled_video_calls svc
        JOIN users u1 ON svc.organizer_id = u1.id
        JOIN users u2 ON svc.participant_id = u2.id
        WHERE (svc.organizer_id = ${user.id} OR svc.participant_id = ${user.id})
        ORDER BY svc.scheduled_at DESC
        LIMIT 50
      `
    }

    const scheduledCalls = await query

    return NextResponse.json({ scheduledCalls })
  } catch (error) {
    console.error("Error fetching scheduled calls:", error)
    return NextResponse.json(
      { error: "Failed to fetch scheduled calls" },
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
    const {
      conversationId,
      participantId,
      title,
      description,
      scheduledAt,
      durationMinutes = 60
    } = body

    if (!conversationId || !participantId || !title || !scheduledAt) {
      return NextResponse.json(
        { error: "conversationId, participantId, title, and scheduledAt are required" },
        { status: 400 }
      )
    }

    // Validate scheduled time is in the future
    const scheduledDate = new Date(scheduledAt)
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: "Scheduled time must be in the future" },
        { status: 400 }
      )
    }

    const sql = getDb()

    // Verify conversation exists
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
    const roomId = `lawbridge-scheduled-${crypto.randomBytes(8).toString("hex")}`

    // Create scheduled call
    const result = await sql`
      INSERT INTO scheduled_video_calls (
        conversation_id,
        organizer_id,
        participant_id,
        title,
        description,
        scheduled_at,
        duration_minutes,
        room_id,
        status
      )
      VALUES (
        ${conversationId},
        ${user.id},
        ${participantId},
        ${title},
        ${description || null},
        ${scheduledAt},
        ${durationMinutes},
        ${roomId},
        'scheduled'
      )
      RETURNING *
    `

    const scheduledCall = result[0]

    // Create system message
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
        ${"📅 Video call scheduled: " + title + " at " + new Date(scheduledAt).toLocaleString()},
        'system'
      )
    `

    return NextResponse.json(
      { scheduledCall },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error scheduling video call:", error)
    return NextResponse.json(
      { error: "Failed to schedule video call" },
      { status: 500 }
    )
  }
}
