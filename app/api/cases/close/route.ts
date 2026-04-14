import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("lawbridge_session")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: "Case ID is required" }, { status: 400 })
    }

    const sql = getDb()

    // Verify ownership
    const cases = await sql`SELECT client_id FROM cases WHERE id = ${id}`
    if (cases.length === 0 || cases[0].client_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await sql`
      UPDATE cases
      SET status = 'closed', updated_at = NOW()
      WHERE id = ${id}
    `

    // Update the winning application's status just in case it's needed for other closed-case logic
    await sql`
      UPDATE case_applications
      SET status = 'closed', updated_at = NOW()
      WHERE case_id = ${id} AND status = 'accepted'
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Close case error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
