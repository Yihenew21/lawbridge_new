import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { hashPassword, createToken, getUserByEmail } from "@/lib/auth"

const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, first_name, last_name, role, phone, specialization, license_number, bio } = body

    // Validate required fields
    if (!email || !password || !first_name || !last_name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Validate role
    if (!["client", "lawyer", "student"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be client, lawyer, or student" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const password_hash = await hashPassword(password)

    // Create user
    const sql = getDb()
    const users = await sql`
      INSERT INTO users (email, password_hash, first_name, last_name, role, phone, specialization, license_number, bio)
      VALUES (
        ${email.toLowerCase()},
        ${password_hash},
        ${first_name},
        ${last_name},
        ${role},
        ${phone || null},
        ${specialization || null},
        ${license_number || null},
        ${bio || null}
      )
      RETURNING id, email, first_name, last_name, role
    `

    const user = users[0]

    // Create session token
    const sessionUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
    }
    const token = await createToken(sessionUser)

    // Store session in database
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000)
    await sql`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})
    `

    // Set cookie on the response
    const response = NextResponse.json({ user: sessionUser }, { status: 201 })
    response.cookies.set("lawbridge_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
