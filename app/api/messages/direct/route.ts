import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const lawyerId = searchParams.get('lawyer_id')

    if (!lawyerId) {
      return NextResponse.json({ error: 'lawyer_id required' }, { status: 400 })
    }

    // Get conversation with lawyer
    const messages = await sql`
      SELECT 
        m.id,
        m.sender_id,
        m.receiver_id,
        m.message_text,
        m.created_at,
        u.first_name,
        u.last_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = ${lawyerId} OR m.receiver_id = ${lawyerId})
      ORDER BY m.created_at DESC
      LIMIT 50
    `

    return NextResponse.json({ messages: messages.reverse() })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { lawyerId, message } = body

    if (!lawyerId || !message) {
      return NextResponse.json({ error: 'lawyerId and message required' }, { status: 400 })
    }

    // For now, store message - in production would get senderId from auth token
    const result = await sql`
      INSERT INTO messages (sender_id, receiver_id, message_text, created_at)
      VALUES (
        '00000000-0000-0000-0000-000000000000',
        ${lawyerId},
        ${message},
        NOW()
      )
      RETURNING id
    `

    return NextResponse.json({ message: 'Message sent', id: result[0].id }, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
