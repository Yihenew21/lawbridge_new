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

    const sql = getDb()

    // Get transactions
    const transactions = await sql`
      SELECT ca.id, c.title as case_title, ca.bid_amount, ca.status, ca.created_at
      FROM case_applications ca
      JOIN cases c ON ca.case_id = c.id
      WHERE ca.lawyer_id = ${user.id} AND ca.status IN ('accepted', 'pending')
      ORDER BY ca.created_at DESC
    `

    const earningsData = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        month: d.toLocaleString('default', { month: 'short' }),
        amount: 0,
        year: d.getFullYear(),
        monthNum: d.getMonth()
      };
    });

    transactions.forEach(t => {
      if (t.status === 'accepted') {
        const tDate = new Date(t.created_at);
        const match = earningsData.find(e => e.year === tDate.getFullYear() && e.monthNum === tDate.getMonth());
        if (match) {
          match.amount += (parseFloat(t.bid_amount) || 0);
        }
      }
    });

    // Calculate totals
    const completedTotal = transactions
      .filter((t) => t.status === "accepted")
      .reduce((sum, t) => sum + (parseFloat(t.bid_amount) || 0), 0)

    const pendingTotal = transactions
      .filter((t) => t.status === "pending")
      .reduce((sum, t) => sum + (parseFloat(t.bid_amount) || 0), 0)

    return NextResponse.json({
      earnings: {
        totalEarnings: completedTotal,
        pendingEarnings: pendingTotal,
        earningsData,
        transactions: transactions.map((t) => ({
          id: t.id,
          case: t.case_title,
          amount: `${Math.round(parseFloat(t.bid_amount) || 0)} ETB`,
          status: t.status === "accepted" ? "Completed" : "Pending",
          date: new Date(t.created_at).toLocaleDateString(),
        })),
      },
    })
  } catch (error) {
    console.error("Earnings error:", error)
    return NextResponse.json(
      { error: "Failed to fetch earnings" },
      { status: 500 }
    )
  }
}
