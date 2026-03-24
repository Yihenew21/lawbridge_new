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

    if (user.role !== "lawyer") {
      return NextResponse.json(
        { error: "Only lawyers can access verification" },
        { status: 403 }
      )
    }

    const sql = getDb()

    const verification = await sql`
      SELECT id, status, license_number, license_expiry, verified_at, rejection_reason
      FROM lawyer_verifications
      WHERE lawyer_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 1
    `

    return NextResponse.json({
      verification: verification.length > 0 ? verification[0] : null,
    })
  } catch (error) {
    console.error("Error fetching verification:", error)
    return NextResponse.json(
      { error: "Failed to fetch verification" },
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
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "lawyer") {
      return NextResponse.json(
        { error: "Only lawyers can request verification" },
        { status: 403 }
      )
    }

    const { licenseNumber, licenseExpiry, documentUrls } = await request.json()

    if (!licenseNumber || !licenseExpiry) {
      return NextResponse.json(
        { error: "License number and expiry are required" },
        { status: 400 }
      )
    }

    const sql = getDb()

    await sql`
      INSERT INTO lawyer_verifications (
        lawyer_id, license_number, license_expiry, document_urls, 
        status, created_at
      )
      VALUES (
        ${user.id}, ${licenseNumber}, ${licenseExpiry},
        ${JSON.stringify(documentUrls)}, 'pending', NOW()
      )
    `

    return NextResponse.json({ success: true, message: "Verification request submitted" })
  } catch (error) {
    console.error("Error submitting verification:", error)
    return NextResponse.json(
      { error: "Failed to submit verification" },
      { status: 500 }
    )
  }
}
