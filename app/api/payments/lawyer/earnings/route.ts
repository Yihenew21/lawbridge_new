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

    // Calculate earnings summary
    const summary = await sql`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'held_in_escrow' THEN lawyer_amount ELSE 0 END), 0) as pending_earnings,
        COALESCE(SUM(CASE WHEN status = 'released' THEN lawyer_amount ELSE 0 END), 0) as released_earnings,
        COALESCE(SUM(CASE WHEN status IN ('held_in_escrow', 'released') THEN lawyer_amount ELSE 0 END), 0) as total_earnings,
        COUNT(CASE WHEN status = 'held_in_escrow' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'released' THEN 1 END) as released_count
      FROM escrow_payments
      WHERE lawyer_id = ${user.id}
    `

    // Calculate withdrawn amount
    const withdrawals = await sql`
      SELECT COALESCE(SUM(amount), 0) as total_withdrawn
      FROM lawyer_withdrawals
      WHERE lawyer_id = ${user.id} AND status = 'completed'
    `

    // Calculate available balance (released - withdrawn)
    const availableBalance = parseFloat(summary[0].released_earnings) - parseFloat(withdrawals[0].total_withdrawn)

    // Get monthly breakdown (last 6 months)
    const monthlyEarnings = await sql`
      SELECT
        TO_CHAR(released_at, 'Mon') as month,
        TO_CHAR(released_at, 'YYYY-MM') as month_key,
        COALESCE(SUM(lawyer_amount), 0) as amount
      FROM escrow_payments
      WHERE lawyer_id = ${user.id} AND status = 'released'
        AND released_at >= NOW() - INTERVAL '6 months'
      GROUP BY month_key, month
      ORDER BY month_key ASC
    `

    return NextResponse.json({
      summary: {
        pending_earnings: summary[0].pending_earnings,
        available_balance: availableBalance.toFixed(2),
        total_withdrawn: withdrawals[0].total_withdrawn,
        total_earnings: summary[0].total_earnings,
        pending_count: summary[0].pending_count,
        released_count: summary[0].released_count
      },
      monthly_earnings: monthlyEarnings
    })
  } catch (error) {
    console.error("Error fetching lawyer earnings:", error)
    return NextResponse.json(
      { error: "Failed to fetch earnings" },
      { status: 500 }
    )
  }
}
