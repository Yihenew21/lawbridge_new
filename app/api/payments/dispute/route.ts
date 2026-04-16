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
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { payment_id, reason } = body

    if (!payment_id || !reason) {
      return NextResponse.json(
        { error: "Payment ID and reason are required" },
        { status: 400 }
      )
    }

    if (reason.trim().length < 10) {
      return NextResponse.json(
        { error: "Reason must be at least 10 characters" },
        { status: 400 }
      )
    }

    const sql = getDb()

    // Verify payment exists and belongs to client
    const payments = await sql`
      SELECT id, status, client_id FROM escrow_payments
      WHERE id = ${payment_id}
    `

    if (payments.length === 0) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      )
    }

    if (payments[0].client_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if payment is in escrow
    if (payments[0].status !== "held_in_escrow") {
      return NextResponse.json(
        { error: "Can only dispute payments that are held in escrow" },
        { status: 400 }
      )
    }

    // Check if there's already an open dispute
    const existingDisputes = await sql`
      SELECT id FROM payment_disputes
      WHERE payment_id = ${payment_id} AND status IN ('open', 'under_review')
    `

    if (existingDisputes.length > 0) {
      return NextResponse.json(
        { error: "There is already an active dispute for this payment" },
        { status: 400 }
      )
    }

    // Create dispute
    const result = await sql`
      INSERT INTO payment_disputes (
        payment_id,
        raised_by,
        reason,
        status
      ) VALUES (
        ${payment_id},
        ${user.id},
        ${reason.trim()},
        'open'
      )
      RETURNING id, payment_id, reason, status, created_at
    `

    // Update payment status to disputed
    await sql`
      UPDATE escrow_payments
      SET status = 'disputed', updated_at = NOW()
      WHERE id = ${payment_id}
    `

    // Create payment status history entry
    await sql`
      INSERT INTO payment_status_history (
        payment_id,
        old_status,
        new_status,
        changed_by,
        notes
      ) VALUES (
        ${payment_id},
        'held_in_escrow',
        'disputed',
        ${user.id},
        'Dispute raised by client'
      )
    `

    return NextResponse.json(
      {
        success: true,
        dispute: result[0],
        message: "Dispute submitted successfully. An admin will review your case."
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating dispute:", error)
    return NextResponse.json(
      { error: "Failed to create dispute" },
      { status: 500 }
    )
  }
}
