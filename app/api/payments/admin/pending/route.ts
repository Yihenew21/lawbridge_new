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

    const sql = getDb()

    // Get all pending payments
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
        oba.bank_name,
        oba.account_number,
        oba.account_holder_name,
        oba.branch_name
      FROM escrow_payments ep
      LEFT JOIN organization_bank_accounts oba ON oba.id = ep.bank_account_id
      WHERE ep.status = 'pending_verification'
      ORDER BY ep.created_at DESC
    `

    // Get stats
    const stats = await sql`
      SELECT
        COUNT(*) as total_pending,
        COALESCE(SUM(amount), 0) as total_amount
      FROM escrow_payments
      WHERE status = 'pending_verification'
    `

    return NextResponse.json({
      payments,
      stats: stats[0]
    })
  } catch (error) {
    console.error("Error fetching pending payments:", error)
    return NextResponse.json(
      { error: "Failed to fetch pending payments" },
      { status: 500 }
    )
  }
}
