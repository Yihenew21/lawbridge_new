import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("lawbridge_session")?.value

    if (token) {
      const sql = getDb()
      await sql`DELETE FROM sessions WHERE token = ${token}`
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set("lawbridge_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
