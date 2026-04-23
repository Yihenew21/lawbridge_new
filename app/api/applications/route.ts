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
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const caseId = searchParams.get("caseId")

    const sql = getDb()

    if (caseId) {
      // Get all applications for a specific case
      const applications = await sql`
        SELECT ca.*, u.first_name, u.last_name, u.specialization, u.phone, u.email
        FROM case_applications ca
        JOIN users u ON ca.lawyer_id = u.id
        WHERE ca.case_id = ${caseId}
        ORDER BY ca.created_at DESC
      `
      return NextResponse.json({ applications })
    } else if (userId) {
      // Get all applications submitted by a lawyer
      const applications = await sql`
        SELECT ca.*, c.title, c.category, c.budget_min, c.budget_max
        FROM case_applications ca
        JOIN cases c ON ca.case_id = c.id
        WHERE ca.lawyer_id = ${userId}
        ORDER BY ca.created_at DESC
      `
      return NextResponse.json({ applications })
    } else {
      return NextResponse.json({ error: "Missing required params" }, { status: 400 })
    }
  } catch (error) {
    console.error("Applications fetch error:", error)
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
    const { applicationId, status } = body

    if (!applicationId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sql = getDb()

    // Verify the user is the case owner
    const app = await sql`
      SELECT ca.*, c.client_id
      FROM case_applications ca
      JOIN cases c ON ca.case_id = c.id
      WHERE ca.id = ${applicationId}
    `

    if (app.length === 0 || app[0].client_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await sql`
      UPDATE case_applications
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${applicationId}
    `

    // If accepting, create a conversation and assign the case
    if (status === "accepted") {
      // 1. Create a conversation
      await sql`
        INSERT INTO case_conversations (case_id, client_id, lawyer_id)
        VALUES (${app[0].case_id}, ${user.id}, ${app[0].lawyer_id})
        ON CONFLICT (case_id, client_id, lawyer_id) DO NOTHING
      `

      // 2. Mark the case as pending and assign the lawyer
      await sql`
        UPDATE cases
        SET status = 'pending', assigned_lawyer_id = ${app[0].lawyer_id}, updated_at = NOW()
        WHERE id = ${app[0].case_id}
      `

      // 3. Mark all other open applications for this case as rejected
      await sql`
        UPDATE case_applications
        SET status = 'rejected', updated_at = NOW()
        WHERE case_id = ${app[0].case_id} AND id != ${applicationId} AND status = 'pending'
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Application update error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
