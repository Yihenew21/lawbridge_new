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

    const applications = await sql`
      SELECT ca.*, c.title, c.category, c.description, c.budget_max
      FROM case_applications ca
      JOIN cases c ON ca.case_id = c.id
      WHERE ca.lawyer_id = ${user.id}
      ORDER BY ca.created_at DESC
    `

    return NextResponse.json({ applications })
  } catch (error) {
    console.error("Applications error:", error)
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
    const { applicationId, status } = body

    if (!applicationId || !["pending", "accepted", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      )
    }

    const sql = getDb()

    // Update application status
    await sql`
      UPDATE case_applications
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${applicationId} AND lawyer_id = ${user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update application error:", error)
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    )
  }
}
