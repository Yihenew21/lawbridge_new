import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const sql = getDb()

    // Fetch all active bank accounts
    const accounts = await sql`
      SELECT
        id,
        bank_name,
        account_number,
        account_holder_name,
        branch_name,
        swift_code
      FROM organization_bank_accounts
      WHERE is_active = true
      ORDER BY created_at ASC
    `

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error("Error fetching bank accounts:", error)
    return NextResponse.json(
      { error: "Failed to fetch bank accounts" },
      { status: 500 }
    )
  }
}
