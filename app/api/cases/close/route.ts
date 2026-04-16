import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function PUT(request: NextRequest) {
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
    const { id, rating, rating_comment } = body

    if (!id) {
      return NextResponse.json({ error: "Case ID is required" }, { status: 400 })
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating is required and must be between 1 and 5" },
        { status: 400 }
      )
    }

    const sql = getDb()

    // Verify ownership
    const cases = await sql`
      SELECT client_id, payment_id FROM cases WHERE id = ${id}
    `
    if (cases.length === 0 || cases[0].client_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const caseData = cases[0]

    // Check if case has associated payment
    if (!caseData.payment_id) {
      return NextResponse.json(
        { error: "This case has no associated payment" },
        { status: 400 }
      )
    }

    // Verify payment is in escrow
    const payments = await sql`
      SELECT id, status FROM escrow_payments WHERE id = ${caseData.payment_id}
    `
    if (payments.length === 0) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      )
    }

    if (payments[0].status !== "held_in_escrow") {
      return NextResponse.json(
        { error: "Payment must be in escrow status to close case" },
        { status: 400 }
      )
    }

    // Update case with rating and close it
    await sql`
      UPDATE cases
      SET
        status = 'closed',
        rating = ${rating},
        rating_comment = ${rating_comment || null},
        rated_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
    `

    // Release payment from escrow
    await sql`
      UPDATE escrow_payments
      SET
        status = 'released',
        released_at = NOW(),
        updated_at = NOW()
      WHERE id = ${caseData.payment_id}
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
        ${caseData.payment_id},
        'held_in_escrow',
        'released',
        ${user.id},
        'Case closed by client with rating: ' || ${rating} || '/5'
      )
    `

    // Update the winning application's status
    await sql`
      UPDATE case_applications
      SET status = 'closed', updated_at = NOW()
      WHERE case_id = ${id} AND status = 'accepted'
    `

    return NextResponse.json({
      success: true,
      message: "Case closed successfully and payment released to lawyer"
    })
  } catch (error) {
    console.error("Close case error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
