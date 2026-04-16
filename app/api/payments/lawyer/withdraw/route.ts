import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("lawbridge_session")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user || user.role !== "lawyer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { amount, withdrawal_method, account_details } = body

    // Validate required fields
    if (!amount || !withdrawal_method || !account_details) {
      return NextResponse.json(
        { error: "Amount, withdrawal method, and account details are required" },
        { status: 400 }
      )
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      )
    }

    // Validate withdrawal method
    if (!["bank_transfer", "mobile_money"].includes(withdrawal_method)) {
      return NextResponse.json(
        { error: "Invalid withdrawal method" },
        { status: 400 }
      )
    }

    const sql = getDb()

    // Calculate available balance
    const earnings = await sql`
      SELECT COALESCE(SUM(lawyer_amount), 0) as released_earnings
      FROM escrow_payments
      WHERE lawyer_id = ${user.id} AND status = 'released'
    `

    const withdrawals = await sql`
      SELECT COALESCE(SUM(amount), 0) as total_withdrawn
      FROM lawyer_withdrawals
      WHERE lawyer_id = ${user.id} AND status = 'completed'
    `

    const availableBalance = parseFloat(earnings[0].released_earnings) - parseFloat(withdrawals[0].total_withdrawn)

    // Check if sufficient balance
    if (amount > availableBalance) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          available_balance: availableBalance.toFixed(2),
          requested_amount: amount
        },
        { status: 400 }
      )
    }

    // Create withdrawal request
    const result = await sql`
      INSERT INTO lawyer_withdrawals (
        lawyer_id,
        amount,
        withdrawal_method,
        account_details,
        status
      ) VALUES (
        ${user.id},
        ${amount},
        ${withdrawal_method},
        ${JSON.stringify(account_details)},
        'pending'
      )
      RETURNING id, lawyer_id, amount, withdrawal_method, status, created_at
    `

    return NextResponse.json(
      {
        success: true,
        withdrawal: result[0],
        message: "Withdrawal request submitted successfully. It will be processed by admin."
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating withdrawal request:", error)
    return NextResponse.json(
      { error: "Failed to create withdrawal request" },
      { status: 500 }
    )
  }
}

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

    // Fetch withdrawal history
    const withdrawals = await sql`
      SELECT
        id,
        amount,
        withdrawal_method,
        account_details,
        status,
        notes,
        created_at,
        processed_at
      FROM lawyer_withdrawals
      WHERE lawyer_id = ${user.id}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ withdrawals })
  } catch (error) {
    console.error("Error fetching withdrawals:", error)
    return NextResponse.json(
      { error: "Failed to fetch withdrawals" },
      { status: 500 }
    )
  }
}
