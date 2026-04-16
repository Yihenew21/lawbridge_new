import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getDb } from "@/lib/db"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // In Next 15 Dynamic Route Params is a Promise
) {
  try {
    const token = request.cookies.get("lawbridge_session")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user || user.role !== "lawyer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const serviceId = resolvedParams.id

    const sql = getDb()

    await sql`
      DELETE FROM lawyer_services
      WHERE id = ${serviceId} AND lawyer_id = ${user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Service deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    )
  }
}
