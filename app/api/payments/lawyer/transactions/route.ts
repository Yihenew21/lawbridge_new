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
    if (!user || user.role !== "lawyer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = getDb()

    // Get status filter from query params
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get("status")

    let transactions
    if (statusFilter) {
      transactions = await sql`
        SELECT
          ep.id,
          ep.transaction_id,
          ep.amount,
          ep.commission_amount,
          ep.lawyer_amount,
          ep.status,
          ep.case_description,
          ep.client_name,
          ep.client_email,
          ep.created_at,
          ep.verified_at,
          ep.released_at,
          c.id as case_id,
          c.title as case_title,
          c.rating,
          c.rating_comment
        FROM escrow_payments ep
        LEFT JOIN cases c ON c.payment_id = ep.id
        WHERE ep.lawyer_id = ${user.id} AND ep.status = ${statusFilter}
        ORDER BY ep.created_at DESC
      `
    } else {
      transactions = await sql`
        SELECT
          ep.id,
          ep.transaction_id,
          ep.amount,
          ep.commission_amount,
          ep.lawyer_amount,
          ep.status,
          ep.case_description,
          ep.client_name,
          ep.client_email,
          ep.created_at,
          ep.verified_at,
          ep.released_at,
          c.id as case_id,
          c.title as case_title,
          c.rating,
          c.rating_comment
        FROM escrow_payments ep
        LEFT JOIN cases c ON c.payment_id = ep.id
        WHERE ep.lawyer_id = ${user.id}
        ORDER BY ep.created_at DESC
      `
    }

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("Error fetching lawyer transactions:", error)
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}
