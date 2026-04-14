import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages payload" }, { status: 400 })
    }

    const sql = getDb()
    
    // Ensure the table exists
    await sql`
      CREATE TABLE IF NOT EXISTS shared_chats (
        id VARCHAR(50) PRIMARY KEY,
        messages JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Generate random short ID for URL
    const id = crypto.randomBytes(12).toString("hex")

    // Insert payload
    await sql`
      INSERT INTO shared_chats (id, messages)
      VALUES (${id}, ${JSON.stringify(messages)}::jsonb)
    `

    return NextResponse.json({ id })
  } catch (error) {
    console.error("Failed to share chat via Postgres:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
