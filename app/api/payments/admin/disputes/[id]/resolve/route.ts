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
    const { resolution_outcome, admin_notes, refund_amount } = body

    if (!resolution_outcome) {
      return NextResponse.json(
        { error: "Resolution outcome is required" },
        { status: 400 }
      )
    }

    const validOutcomes = ["full_refund", "partial_refund", "no_refund", "release_to_lawyer"]
    if (!validOutcomes.includes(resolution_outcome)) {
      return NextResponse.json(
        { error: "Invalid resolution outcome" },
        { status: 400 }
      )
    }

    const sql = getDb()

    // Get current commission rate from platform settings
    const settingsResult = await sql`
      SELECT value FROM platform_settings WHERE key = 'commission_rate'
    `
    const platformCommissionRate = settingsResult.length > 0
      ? parseFloat(settingsResult[0].value)
      : 15.0

    // Get dispute details
    const disputes = await sql`
      SELECT
        pd.id,
        pd.payment_id,
        pd.status,
        ep.amount,
        ep.lawyer_amount,
        ep.commission_amount,
        ep.commission_rate,
        ep.status as payment_status,
        ep.lawyer_id,
        ep.client_id
      FROM payment_disputes pd
      JOIN escrow_payments ep ON ep.id = pd.payment_id
      WHERE pd.id = ${id}
    `

    if (disputes.length === 0) {
      return NextResponse.json(
        { error: "Dispute not found" },
        { status: 404 }
      )
    }

    const dispute = disputes[0]

    if (dispute.status !== "open" && dispute.status !== "under_review") {
      return NextResponse.json(
        { error: "Dispute is already resolved" },
        { status: 400 }
      )
    }

    // Calculate refund and lawyer amounts based on resolution outcome
    let finalRefundAmount = 0
    let finalLawyerAmount = parseFloat(dispute.lawyer_amount)
    let finalCommissionAmount = parseFloat(dispute.commission_amount)
    let newPaymentStatus = dispute.payment_status
    let newDisputeStatus = "resolved_refund"

    switch (resolution_outcome) {
      case "full_refund":
        // Client gets full amount back, lawyer gets nothing
        finalRefundAmount = parseFloat(dispute.amount)
        finalLawyerAmount = 0
        finalCommissionAmount = 0
        newPaymentStatus = "refunded"
        newDisputeStatus = "resolved_refund"
        break

      case "partial_refund":
        // Client gets half of original amount (or custom refund_amount)
        // Lawyer gets other half minus commission on that half
        if (refund_amount !== undefined && refund_amount !== null) {
          finalRefundAmount = parseFloat(refund_amount)
        } else {
          // Default: client gets exactly half of original payment
          finalRefundAmount = parseFloat(dispute.amount) / 2
        }

        // Calculate lawyer's portion: other half minus commission
        const lawyerPortion = parseFloat(dispute.amount) - finalRefundAmount
        // Use platform commission rate (from admin settings)
        const commissionRate = platformCommissionRate
        const commissionOnLawyerPortion = (lawyerPortion * commissionRate) / 100
        finalLawyerAmount = lawyerPortion - commissionOnLawyerPortion
        finalCommissionAmount = commissionOnLawyerPortion

        newPaymentStatus = "released"
        newDisputeStatus = "resolved_refund"
        break

      case "no_refund":
        // No refund, but payment stays in escrow (not released to lawyer)
        finalRefundAmount = 0
        finalLawyerAmount = parseFloat(dispute.lawyer_amount)
        finalCommissionAmount = parseFloat(dispute.commission_amount)
        newPaymentStatus = "held_in_escrow"
        newDisputeStatus = "rejected"
        break

      case "release_to_lawyer":
        // Full amount released to lawyer
        finalRefundAmount = 0
        finalLawyerAmount = parseFloat(dispute.lawyer_amount)
        finalCommissionAmount = parseFloat(dispute.commission_amount)
        newPaymentStatus = "released"
        newDisputeStatus = "resolved_release"
        break
    }

    // Start transaction
    await sql`BEGIN`

    try {
      // Update dispute record
      await sql`
        UPDATE payment_disputes
        SET
          status = ${newDisputeStatus},
          resolution_outcome = ${resolution_outcome},
          refund_amount = ${finalRefundAmount},
          admin_notes = ${admin_notes || null},
          resolved_by = ${user.id},
          resolved_at = NOW(),
          updated_at = NOW()
        WHERE id = ${id}
      `

      // Update payment record with new lawyer amount, commission, and status
      await sql`
        UPDATE escrow_payments
        SET
          lawyer_amount = ${finalLawyerAmount},
          commission_amount = ${finalCommissionAmount},
          status = ${newPaymentStatus},
          released_at = ${newPaymentStatus === "released" ? sql`NOW()` : null},
          updated_at = NOW()
        WHERE id = ${dispute.payment_id}
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
          ${dispute.payment_id},
          ${dispute.payment_status},
          ${newPaymentStatus},
          ${user.id},
          ${`Dispute resolved: ${resolution_outcome}. ${admin_notes || ""}`}
        )
      `

      await sql`COMMIT`

      return NextResponse.json(
        {
          success: true,
          message: "Dispute resolved successfully",
          resolution: {
            outcome: resolution_outcome,
            refund_amount: finalRefundAmount,
            lawyer_amount: finalLawyerAmount,
            commission_amount: finalCommissionAmount,
            payment_status: newPaymentStatus
          }
        },
        { status: 200 }
      )
    } catch (error) {
      await sql`ROLLBACK`
      throw error
    }
  } catch (error) {
    console.error("Error resolving dispute:", error)
    return NextResponse.json(
      { error: "Failed to resolve dispute" },
      { status: 500 }
    )
  }
}
