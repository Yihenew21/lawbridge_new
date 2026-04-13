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

    // Get active cases count
    const activeCases = await sql`
      SELECT COUNT(*) as count FROM cases WHERE client_id = ${user.id} AND status = 'open'
    `

    // Get pending review count
    const pendingCases = await sql`
      SELECT COUNT(*) as count FROM cases WHERE client_id = ${user.id} AND status = 'pending'
    `

    // Get completed cases count
    const completedCases = await sql`
      SELECT COUNT(*) as count FROM cases WHERE client_id = ${user.id} AND status = 'closed'
    `

    // Get total spent (sum of budgets)
    const totalSpent = await sql`
      SELECT COALESCE(SUM(budget_max), 0) as total FROM cases WHERE client_id = ${user.id}
    `

    // Get recent cases
    const recentCases = await sql`
      SELECT * FROM cases WHERE client_id = ${user.id} ORDER BY created_at DESC LIMIT 5
    `

    return NextResponse.json({
      stats: {
        activeCases: activeCases[0].count,
        pendingCases: pendingCases[0].count,
        completedCases: completedCases[0].count,
        totalSpent: totalSpent[0].total
      },
      recentCases
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
