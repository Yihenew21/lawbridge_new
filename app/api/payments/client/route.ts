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
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = getDb()

    // Get status filter from query params
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get("status")

    let payments
    if (statusFilter) {
      payments = await sql`
        SELECT
          ep.id,
          ep.transaction_id,
          ep.amount,
          ep.commission_amount,
          ep.lawyer_amount,
          ep.status,
          ep.case_description,
          ep.lawyer_name,
          ep.lawyer_email,
          ep.created_at,
          ep.verified_at,
          ep.released_at,
          ep.rejection_reason,
          oba.bank_name,
          oba.account_number,
          c.id as case_id,
          c.title as case_title,
          c.rating,
          c.rating_comment
        FROM escrow_payments ep
        LEFT JOIN organization_bank_accounts oba ON oba.id = ep.bank_account_id
        LEFT JOIN cases c ON c.payment_id = ep.id
        WHERE ep.client_id = ${user.id} AND ep.status = ${statusFilter}
        ORDER BY ep.created_at DESC
      `
    } else {
      payments = await sql`
        SELECT
          ep.id,
          ep.transaction_id,
          ep.amount,
          ep.commission_amount,
          ep.lawyer_amount,
          ep.status,
          ep.case_description,
          ep.lawyer_name,
          ep.lawyer_email,
          ep.created_at,
          ep.verified_at,
          ep.released_at,
          ep.rejection_reason,
          oba.bank_name,
          oba.account_number,
          c.id as case_id,
          c.title as case_title,
          c.rating,
          c.rating_comment
        FROM escrow_payments ep
        LEFT JOIN organization_bank_accounts oba ON oba.id = ep.bank_account_id
        LEFT JOIN cases c ON c.payment_id = ep.id
        WHERE ep.client_id = ${user.id}
        ORDER BY ep.created_at DESC
      `
    }

    return NextResponse.json({ payments })
  } catch (error) {
    console.error("Error fetching client payments:", error)
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}
