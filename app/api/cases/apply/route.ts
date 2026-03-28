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
      return NextResponse.json(
        { error: "Only lawyers can apply for cases" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { case_id, bid_amount, cover_letter } = body

    if (!case_id) {
      return NextResponse.json(
        { error: "Case ID is required" },
        { status: 400 }
      )
    }

    const sql = getDb()

    // Check if case exists
    const caseExists = await sql`
      SELECT id FROM cases WHERE id = ${case_id} AND status = 'open'
    `

    if (caseExists.length === 0) {
      return NextResponse.json(
        { error: "Case not found or is no longer open" },
        { status: 404 }
      )
    }

    // Check if lawyer already applied
    const existingApp = await sql`
      SELECT id FROM case_applications WHERE case_id = ${case_id} AND lawyer_id = ${user.id}
    `

    if (existingApp.length > 0) {
      return NextResponse.json(
        { error: "You have already applied for this case" },
        { status: 400 }
      )
    }

    // Create application
    const result = await sql`
      INSERT INTO case_applications (case_id, lawyer_id, bid_amount, cover_letter, status)
      VALUES (${case_id}, ${user.id}, ${bid_amount}, ${cover_letter}, 'pending')
      RETURNING id, case_id, lawyer_id, bid_amount, cover_letter, status, created_at
    `

    return NextResponse.json(
      {
        application: result[0],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    )
  }
}
