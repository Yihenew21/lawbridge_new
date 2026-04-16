import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("lawbridge_session")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const sql = getDb()

    // Fetch payment details
    const payments = await sql`
      SELECT
        ep.id,
        ep.transaction_id,
        ep.amount,
        ep.commission_rate,
        ep.commission_amount,
        ep.lawyer_amount,
        ep.status,
        ep.case_description,
        ep.client_name,
        ep.client_email,
        ep.client_phone,
        ep.lawyer_name,
        ep.lawyer_email,
        ep.created_at,
        ep.verified_at,
        ep.released_at,
        ep.rejection_reason,
        oba.bank_name,
        oba.account_number,
        oba.account_holder_name,
        oba.branch_name,
        c.id as case_id,
        c.title as case_title,
        c.rating,
        c.rating_comment,
        c.rated_at
      FROM escrow_payments ep
      LEFT JOIN organization_bank_accounts oba ON oba.id = ep.bank_account_id
      LEFT JOIN cases c ON c.payment_id = ep.id
      WHERE ep.id = ${id} AND ep.client_id = ${user.id}
      LIMIT 1
    `

    if (payments.length === 0) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      )
    }

    // Fetch status history
    const history = await sql`
      SELECT
        psh.old_status,
        psh.new_status,
        psh.notes,
        psh.created_at,
        u.first_name || ' ' || u.last_name as changed_by_name,
        u.role as changed_by_role
      FROM payment_status_history psh
      LEFT JOIN users u ON u.id = psh.changed_by
      WHERE psh.payment_id = ${id}
      ORDER BY psh.created_at ASC
    `

    // Check if there's an active dispute
    const disputes = await sql`
      SELECT
        id,
        reason,
        status,
        created_at,
        resolved_at,
        resolution_outcome
      FROM payment_disputes
      WHERE payment_id = ${id}
      ORDER BY created_at DESC
      LIMIT 1
    `

    return NextResponse.json({
      payment: payments[0],
      history,
      dispute: disputes[0] || null
    })
  } catch (error) {
    console.error("Error fetching payment details:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment details" },
      { status: 500 }
    )
  }
}
