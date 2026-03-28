import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id

    if (!id) {
      return NextResponse.json(
        { error: "Case ID is required" },
        { status: 400 }
      )
    }

    const sql = getDb()
    const cases = await sql`
      SELECT 
        id, client_id, title, description, category, budget_min, budget_max,
        location, status, created_at, updated_at
      FROM cases
      WHERE id = ${id}
    `

    if (cases.length === 0) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ case: cases[0] })
  } catch (error) {
    console.error("Error fetching case:", error)
    return NextResponse.json(
      { error: "Failed to fetch case" },
      { status: 500 }
    )
  }
}
