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

    const payments = await sql`
      SELECT 
        ca.id,
        ca.bid_amount as amount,
        c.title as case_title,
        u.first_name || ' ' || u.last_name as lawyer_name,
        ca.status,
        ca.created_at as date,
        '#INV-' || TO_CHAR(ca.created_at, 'YYYY-MM-DD') || '-' || ca.id::text as invoice_number
      FROM case_applications ca
      JOIN cases c ON c.id = ca.case_id
      JOIN users u ON u.id = ca.lawyer_id
      WHERE c.client_id = ${user.id}
      ORDER BY ca.created_at DESC
    `

    return NextResponse.json({ payments })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}
