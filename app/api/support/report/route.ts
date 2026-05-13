import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { checkRateLimit, getRateLimitIdentifier, RATE_LIMITS } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request)
    const rateLimit = checkRateLimit(`issue-report:${identifier}`, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 5, // 5 reports per hour
    })

    if (!rateLimit.allowed) {
      const resetIn = Math.ceil((rateLimit.resetTime - Date.now()) / 1000 / 60)
      return NextResponse.json(
        { error: `Too many submissions. Please try again in ${resetIn} minutes.` },
        { status: 429 }
      )
    }

    // Get user if authenticated (optional)
    const token = request.cookies.get("lawbridge_session")?.value
    let userId = null
    if (token) {
      const user = await verifyToken(token)
      if (user) {
        userId = user.id
      }
    }

    const body = await request.json()
    const {
      issueType,
      severity,
      title,
      description,
      stepsToReproduce,
      expectedBehavior,
      actualBehavior,
      browserInfo,
      attachmentUrls,
    } = body

    // Validation
    if (!issueType || !severity || !title || !description) {
      return NextResponse.json(
        { error: "Issue type, severity, title, and description are required" },
        { status: 400 }
      )
    }

    const sql = getDb()

    // Insert issue report
    const result = await sql`
      INSERT INTO issue_reports (
        user_id,
        issue_type,
        severity,
        title,
        description,
        steps_to_reproduce,
        expected_behavior,
        actual_behavior,
        browser_info,
        attachment_urls,
        status
      )
      VALUES (
        ${userId},
        ${issueType},
        ${severity},
        ${title.trim()},
        ${description.trim()},
        ${stepsToReproduce?.trim() || null},
        ${expectedBehavior?.trim() || null},
        ${actualBehavior?.trim() || null},
        ${browserInfo?.trim() || null},
        ${JSON.stringify(attachmentUrls || [])},
        'pending'
      )
      RETURNING id, created_at
    `

    return NextResponse.json({
      success: true,
      message: "Issue reported successfully. Our team will investigate and get back to you.",
      reportId: result[0].id,
    })
  } catch (error) {
    console.error("Issue report error:", error)
    return NextResponse.json(
      { error: "Failed to submit issue report" },
      { status: 500 }
    )
  }
}
