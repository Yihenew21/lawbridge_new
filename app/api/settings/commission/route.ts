import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET() {
  try {
    const sql = getDb()

    const settings = await sql`
      SELECT key, value
      FROM platform_settings
      WHERE key = 'commission_rate'
    `

    const commissionRate = settings.length > 0 ? parseFloat(settings[0].value) : 15.0

    return NextResponse.json({
      commission_rate: commissionRate
    })
  } catch (error) {
    console.error("Error fetching commission rate:", error)
    // Return default if error
    return NextResponse.json({
      commission_rate: 15.0
    })
  }
}
