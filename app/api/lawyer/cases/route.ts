import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getDb } from "@/lib/db"

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

    const statusFilter = request.nextUrl.searchParams.get("status")
    const sql = getDb()

    let cases
    if (statusFilter) {
      cases = await sql`
        SELECT c.*, ca.bid_amount, ca.status as application_status, ca.id as application_id
        FROM cases c
        JOIN case_applications ca ON c.id = ca.case_id
        WHERE ca.lawyer_id = ${user.id} AND ca.status = ${statusFilter}
        ORDER BY c.created_at DESC
      `
    } else {
      cases = await sql`
        SELECT c.*, ca.bid_amount, ca.status as application_status, ca.id as application_id
        FROM cases c
        JOIN case_applications ca ON c.id = ca.case_id
        WHERE ca.lawyer_id = ${user.id}
        ORDER BY c.created_at DESC
      `
    }

    return NextResponse.json({ cases })
  } catch (error) {
    console.error("Lawyer cases error:", error)
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    )
  }
}
