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

    const services = await sql`
      SELECT id, title, category, price, description, active
      FROM lawyer_services
      WHERE lawyer_id = ${user.id}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ services })
  } catch (error) {
    console.error("Services fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch services" },
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
    if (!user || user.role !== "lawyer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, category, price, description } = body

    if (!title || !category || !price || !description) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const sql = getDb()

    const newService = await sql`
      INSERT INTO lawyer_services (lawyer_id, title, category, price, description)
      VALUES (${user.id}, ${title}, ${category}, ${price}, ${description})
      RETURNING id, title, category, price, description, active
    `

    return NextResponse.json({ service: newService[0] }, { status: 201 })
  } catch (error) {
    console.error("Services creation error:", error)
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    )
  }
}
