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

    const searchParams = request.nextUrl.searchParams
    const statusFilter = searchParams.get("status")

    const sql = getDb()

    let cases
    if (statusFilter) {
      cases = await sql`
        SELECT c.*, 
          (SELECT COUNT(*) FROM case_applications WHERE case_id = c.id) as application_count
        FROM cases c
        WHERE c.client_id = ${user.id} AND c.status = ${statusFilter}
        ORDER BY c.created_at DESC
      `
    } else {
      cases = await sql`
        SELECT c.*, 
          (SELECT COUNT(*) FROM case_applications WHERE case_id = c.id) as application_count
        FROM cases c
        WHERE c.client_id = ${user.id}
        ORDER BY c.created_at DESC
      `
    }

    return NextResponse.json({ cases })
  } catch (error) {
    console.error("Client cases fetch error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
