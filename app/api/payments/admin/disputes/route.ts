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
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const sql = getDb()

    // Build query with optional status filter
    let disputes
    if (status && status !== "all") {
      disputes = await sql`
        SELECT
          pd.id,
          pd.payment_id,
          pd.reason,
          pd.status,
          pd.resolution_outcome,
          pd.refund_amount,
          pd.admin_notes,
          pd.created_at,
          pd.resolved_at,
          ep.transaction_id,
          ep.amount,
          ep.lawyer_amount,
          ep.commission_amount,
          ep.status as payment_status,
          client.first_name || ' ' || client.last_name as client_name,
          client.email as client_email,
          lawyer.first_name || ' ' || lawyer.last_name as lawyer_name,
          lawyer.email as lawyer_email,
          raised_by.first_name || ' ' || raised_by.last_name as raised_by_name,
          resolved_by.first_name || ' ' || resolved_by.last_name as resolved_by_name
        FROM payment_disputes pd
        JOIN escrow_payments ep ON ep.id = pd.payment_id
        JOIN users client ON client.id = ep.client_id
        JOIN users lawyer ON lawyer.id = ep.lawyer_id
        JOIN users raised_by ON raised_by.id = pd.raised_by
        LEFT JOIN users resolved_by ON resolved_by.id = pd.resolved_by
        WHERE pd.status = ${status}
        ORDER BY pd.created_at DESC
      `
    } else {
      disputes = await sql`
        SELECT
          pd.id,
          pd.payment_id,
          pd.reason,
          pd.status,
          pd.resolution_outcome,
          pd.refund_amount,
          pd.admin_notes,
          pd.created_at,
          pd.resolved_at,
          ep.transaction_id,
          ep.amount,
          ep.lawyer_amount,
          ep.commission_amount,
          ep.status as payment_status,
          client.first_name || ' ' || client.last_name as client_name,
          client.email as client_email,
          lawyer.first_name || ' ' || lawyer.last_name as lawyer_name,
          lawyer.email as lawyer_email,
          raised_by.first_name || ' ' || raised_by.last_name as raised_by_name,
          resolved_by.first_name || ' ' || resolved_by.last_name as resolved_by_name
        FROM payment_disputes pd
        JOIN escrow_payments ep ON ep.id = pd.payment_id
        JOIN users client ON client.id = ep.client_id
        JOIN users lawyer ON lawyer.id = ep.lawyer_id
        JOIN users raised_by ON raised_by.id = pd.raised_by
        LEFT JOIN users resolved_by ON resolved_by.id = pd.resolved_by
        ORDER BY pd.created_at DESC
      `
    }

    // Get summary statistics
    const stats = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'open') as open_count,
        COUNT(*) FILTER (WHERE status = 'under_review') as under_review_count,
        COUNT(*) FILTER (WHERE status IN ('resolved_refund', 'resolved_release')) as resolved_count,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
        COUNT(*) as total_count
      FROM payment_disputes
    `

    return NextResponse.json({
      disputes: disputes.map(d => ({
        id: d.id,
        payment_id: d.payment_id,
        transaction_id: d.transaction_id,
        reason: d.reason,
        status: d.status,
        resolution_outcome: d.resolution_outcome,
        refund_amount: d.refund_amount,
        admin_notes: d.admin_notes,
        created_at: d.created_at,
        resolved_at: d.resolved_at,
        payment: {
          amount: d.amount,
          lawyer_amount: d.lawyer_amount,
          commission_amount: d.commission_amount,
          status: d.payment_status
        },
        client: {
          name: d.client_name,
          email: d.client_email
        },
        lawyer: {
          name: d.lawyer_name,
          email: d.lawyer_email
        },
        raised_by: d.raised_by_name,
        resolved_by: d.resolved_by_name
      })),
      stats: stats[0]
    })
  } catch (error) {
    console.error("Error fetching disputes:", error)
    return NextResponse.json(
      { error: "Failed to fetch disputes" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("lawbridge_session")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const body = await request.json()
    const { dispute_id, status } = body

    if (!dispute_id || !status) {
      return NextResponse.json(
        { error: "Dispute ID and status are required" },
        { status: 400 }
      )
    }

    const validStatuses = ["open", "under_review"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Use resolve endpoint for final resolution." },
        { status: 400 }
      )
    }

    const sql = getDb()

    await sql`
      UPDATE payment_disputes
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${dispute_id}
    `

    return NextResponse.json({
      success: true,
      message: "Dispute status updated"
    })
  } catch (error) {
    console.error("Error updating dispute status:", error)
    return NextResponse.json(
      { error: "Failed to update dispute status" },
      { status: 500 }
    )
  }
}
