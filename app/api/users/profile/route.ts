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

    const sql = getDb()
    const users = await sql`
      SELECT id, email, first_name, last_name, role, phone, specialization, license_number, bio, created_at
      FROM users
      WHERE id = ${user.id}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: users[0] })
  } catch (error) {
    console.error("Profile fetch error:", error)
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
    const { first_name, last_name, phone, bio, specialization } = body

    const sql = getDb()
    await sql`
      UPDATE users
      SET first_name = ${first_name}, last_name = ${last_name}, phone = ${phone}, bio = ${bio}, specialization = ${specialization}
      WHERE id = ${user.id}
    `

    const updated = await sql`
      SELECT id, email, first_name, last_name, role, phone, specialization, license_number, bio
      FROM users
      WHERE id = ${user.id}
    `

    return NextResponse.json({ user: updated[0] })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
