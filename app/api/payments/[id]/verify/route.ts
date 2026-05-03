import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("lawbridge_session")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, rejection_reason } = body

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      )
    }

    if (action === "reject" && !rejection_reason) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      )
    }

    const sql = getDb()

    // Get payment details
    const payments = await sql`
      SELECT id, status, amount, lawyer_id, client_id
      FROM escrow_payments
      WHERE id = ${id}
    `

    if (payments.length === 0) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      )
    }

    const payment = payments[0]

    if (payment.status !== "pending_verification") {
      return NextResponse.json(
        { error: "Payment is not pending verification" },
        { status: 400 }
      )
    }

    if (action === "approve") {
      // Approve payment - move to escrow
      await sql`
        UPDATE escrow_payments
        SET
          status = 'held_in_escrow',
          verified_at = NOW(),
          updated_at = NOW()
        WHERE id = ${id}
      `

      // Create status history entry
      await sql`
        INSERT INTO payment_status_history (
          payment_id,
          old_status,
          new_status,
          changed_by,
          notes
        ) VALUES (
          ${id},
          'pending_verification',
          'held_in_escrow',
          ${user.id},
          'Payment approved by admin'
        )
      `

      return NextResponse.json(
        {
          success: true,
          message: "Payment approved successfully"
        },
        { status: 200 }
      )
    } else {
      // Reject payment
      await sql`
        UPDATE escrow_payments
        SET
          status = 'rejected',
          rejection_reason = ${rejection_reason},
          updated_at = NOW()
        WHERE id = ${id}
      `

      // Create status history entry
      await sql`
        INSERT INTO payment_status_history (
          payment_id,
          old_status,
          new_status,
          changed_by,
          notes
        ) VALUES (
          ${id},
          'pending_verification',
          'rejected',
          ${user.id},
          ${`Payment rejected: ${rejection_reason}`}
        )
      `

      return NextResponse.json(
        {
          success: true,
          message: "Payment rejected successfully"
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    )
  }
}
