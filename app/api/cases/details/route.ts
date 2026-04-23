import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const caseId = searchParams.get("id")

    if (!caseId) {
      return NextResponse.json({ error: "Case ID required" }, { status: 400 })
    }

    const sql = getDb()
    const cases = await sql`
      SELECT c.*, u.first_name, u.last_name, u.email, u.phone, u.specialization
      FROM cases c
      JOIN users u ON c.client_id = u.id
      WHERE c.id = ${caseId}
    `

    if (cases.length === 0) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Get applications for this case
    const applications = await sql`
      SELECT ca.*, u.first_name, u.last_name, u.specialization, u.phone, u.email
      FROM case_applications ca
      JOIN users u ON ca.lawyer_id = u.id
      WHERE ca.case_id = ${caseId}
      ORDER BY ca.created_at DESC
    `

    return NextResponse.json({
      case: cases[0],
      applications: applications
    })
  } catch (error) {
    console.error("Case details error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
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
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, title, description, category, budget_min, budget_max, location, status } = body

    const sql = getDb()
    
    // Verify ownership
    const cases = await sql`SELECT client_id FROM cases WHERE id = ${id}`
    if (cases.length === 0 || cases[0].client_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await sql`
      UPDATE cases
      SET title = ${title}, description = ${description}, category = ${category},
          budget_min = ${budget_min}, budget_max = ${budget_max}, location = ${location},
          status = ${status}, updated_at = NOW()
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Case update error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("lawbridge_session")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const caseId = searchParams.get("id")

    if (!caseId) {
      return NextResponse.json({ error: "Case ID required" }, { status: 400 })
    }

    const sql = getDb()
    
    // Verify ownership
    const cases = await sql`SELECT client_id FROM cases WHERE id = ${caseId}`
    if (cases.length === 0 || cases[0].client_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete applications first
    await sql`DELETE FROM case_applications WHERE case_id = ${caseId}`
    
    // Delete case
    await sql`DELETE FROM cases WHERE id = ${caseId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Case delete error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
