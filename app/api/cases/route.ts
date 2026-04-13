import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("lawbridge_session")?.value

    const sql = getDb()
    const cases = await sql`
      SELECT 
        id, client_id, title, description, category, budget_min, budget_max,
        location, status, created_at, updated_at
      FROM cases
      WHERE status = 'open'
      ORDER BY created_at DESC
    `

    return NextResponse.json({ cases })
  } catch (error) {
    console.error("Error fetching cases:", error)
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("lawbridge_session")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user || user.role !== "client") {
      return NextResponse.json(
        { error: "Only clients can post cases" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, category, budget_min, budget_max, location } = body

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Title, description, and category are required" },
        { status: 400 }
      )
    }

    const sql = getDb()
    const result = await sql`
      INSERT INTO cases (client_id, title, description, category, budget_min, budget_max, location, status)
      VALUES (${user.id}, ${title}, ${description}, ${category}, ${budget_min}, ${budget_max}, ${location}, 'open')
      RETURNING id, client_id, title, description, category, budget_min, budget_max, location, status, created_at
    `

    return NextResponse.json(
      {
        case: result[0],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating case:", error)
    return NextResponse.json(
      { error: "Failed to create case" },
      { status: 500 }
    )
  }
}
