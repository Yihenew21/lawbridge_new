import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const sql = getDb()
    const lawyerId = request.nextUrl.searchParams.get("lawyerId")
    
    let insights
    if (lawyerId) {
      insights = await sql`
        SELECT id, lawyer_id, lawyer_name, title, content, category, video_url, created_at
        FROM insights
        WHERE lawyer_id = ${lawyerId}
        ORDER BY created_at DESC
      `
    } else {
      // Public endpoint: Fetch all insights
      insights = await sql`
        SELECT id, lawyer_id, lawyer_name, title, content, category, video_url, created_at
        FROM insights
        ORDER BY created_at DESC
      `
    }

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("Insights fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch insights" },
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
      return NextResponse.json({ error: "Unauthorized. Only verified lawyers can post insights." }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, category, video_url } = body

    if (!title || !content || !category) {
      return NextResponse.json({ error: "Title, content, and category are required" }, { status: 400 })
    }

    const lawyerName = `${user.first_name} ${user.last_name}`

    const sql = getDb()

    const result = await sql`
      INSERT INTO insights (lawyer_id, lawyer_name, title, content, category, video_url)
      VALUES (${user.id}, ${lawyerName}, ${title}, ${content}, ${category}, ${video_url || null})
      RETURNING *
    `

    return NextResponse.json({ success: true, insight: result[0] })
  } catch (error) {
    console.error("Insights post error:", error)
    return NextResponse.json(
      { error: "An error occurred while posting insight" },
      { status: 500 }
    )
  }
}
