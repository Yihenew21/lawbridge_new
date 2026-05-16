import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function PATCH(
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

    const { id: callId } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: "status is required" },
        { status: 400 }
      )
    }

    const validStatuses = ["ringing", "ongoing", "ended", "missed", "declined", "failed"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    const sql = getDb()

    // Verify user is part of this call
    const call = await sql`
      SELECT id, conversation_id, initiator_id, receiver_id, status as current_status
      FROM video_call_sessions
      WHERE id = ${callId}
        AND (initiator_id = ${user.id} OR receiver_id = ${user.id})
      LIMIT 1
    `

    if (call.length === 0) {
      return NextResponse.json(
        { error: "Call not found or access denied" },
        { status: 404 }
      )
    }

    // Update call status
    let updateQuery
    if (status === "ongoing" && call[0].current_status !== "ongoing") {
      // Mark call as started
      updateQuery = sql`
        UPDATE video_call_sessions
        SET status = ${status}, started_at = NOW(), updated_at = NOW()
        WHERE id = ${callId}
        RETURNING id, status, started_at, ended_at, duration_seconds
      `
    } else if (status === "ended" && call[0].current_status === "ongoing") {
      // Mark call as ended and calculate duration
      updateQuery = sql`
        UPDATE video_call_sessions
        SET status = ${status}, ended_at = NOW(), updated_at = NOW()
        WHERE id = ${callId}
        RETURNING id, status, started_at, ended_at, duration_seconds
      `
    } else {
      // Just update status
      updateQuery = sql`
        UPDATE video_call_sessions
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${callId}
        RETURNING id, status, started_at, ended_at, duration_seconds
      `
    }

    const result = await updateQuery

    // Create system message for call status
    let systemMessage = ""
    switch (status) {
      case "ended":
        const duration = result[0].duration_seconds
        const minutes = Math.floor(duration / 60)
        const seconds = duration % 60
        systemMessage = `Call ended (${minutes}m ${seconds}s)`
        break
      case "missed":
        systemMessage = "Missed call"
        break
      case "declined":
        systemMessage = "Call declined"
        break
      case "failed":
        systemMessage = "Call failed"
        break
    }

    if (systemMessage) {
      await sql`
        INSERT INTO messages (
          conversation_id,
          sender_id,
          content,
          message_type
        )
        VALUES (
          ${call[0].conversation_id},
          ${user.id},
          ${systemMessage},
          'system'
        )
      `
    }

    return NextResponse.json({ call: result[0] })
  } catch (error) {
    console.error("Error updating video call:", error)
    return NextResponse.json(
      { error: "Failed to update video call" },
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

    const { id: callId } = await params
    const sql = getDb()

    const call = await sql`
      SELECT
        vcs.*,
        u1.first_name as initiator_first_name,
        u1.last_name as initiator_last_name,
        u2.first_name as receiver_first_name,
        u2.last_name as receiver_last_name
      FROM video_call_sessions vcs
      JOIN users u1 ON vcs.initiator_id = u1.id
      JOIN users u2 ON vcs.receiver_id = u2.id
      WHERE vcs.id = ${callId}
        AND (vcs.initiator_id = ${user.id} OR vcs.receiver_id = ${user.id})
      LIMIT 1
    `

    if (call.length === 0) {
      return NextResponse.json(
        { error: "Call not found or access denied" },
        { status: 404 }
      )
    }

    return NextResponse.json({ call: call[0] })
  } catch (error) {
    console.error("Error fetching video call:", error)
    return NextResponse.json(
      { error: "Failed to fetch video call" },
      { status: 500 }
    )
  }
}
