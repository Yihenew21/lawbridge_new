import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { checkRateLimit, getRateLimitIdentifier, RATE_LIMITS } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request)
    const rateLimit = checkRateLimit(`contact:${identifier}`, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3, // 3 submissions per hour
    })

    if (!rateLimit.allowed) {
      const resetIn = Math.ceil((rateLimit.resetTime - Date.now()) / 1000 / 60)
      return NextResponse.json(
        { error: `Too many submissions. Please try again in ${resetIn} minutes.` },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { name, email, phone, category, subject, message } = body

    // Validation
    if (!name || !email || !category || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, category, subject, and message are required" },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    const sql = getDb()

    // Insert contact submission
    const result = await sql`
      INSERT INTO contact_submissions (
        name, email, phone, category, subject, message, status
      )
      VALUES (
        ${name.trim()},
        ${email.toLowerCase().trim()},
        ${phone?.trim() || null},
        ${category},
        ${subject.trim()},
        ${message.trim()},
        'pending'
      )
      RETURNING id, created_at
    `

    return NextResponse.json({
      success: true,
      message: "Your message has been submitted successfully. We'll get back to you within 24 hours.",
      submissionId: result[0].id,
    })
  } catch (error) {
    console.error("Contact submission error:", error)
    return NextResponse.json(
      { error: "Failed to submit contact form" },
      { status: 500 }
    )
  }
}
