import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { jwtVerify } from 'jose'

const sql = neon(process.env.DATABASE_URL)
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

async function getUser(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) return null

  try {
    const verified = await jwtVerify(token, secret)
    return verified.payload
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lawyerId = searchParams.get('lawyer_id')
    const caseId = searchParams.get('case_id')

    let query = `
      SELECT r.*, u.first_name, u.last_name
      FROM ratings r
      JOIN users u ON r.rater_id = u.id
      WHERE 1=1
    `
    const params = []

    if (lawyerId) {
      query += ` AND r.rated_user_id = $${params.length + 1}`
      params.push(lawyerId)
    }

    if (caseId) {
      query += ` AND r.case_id = $${params.length + 1}`
      params.push(caseId)
    }

    query += ` ORDER BY r.created_at DESC`

    const ratings = await sql(query)
    return NextResponse.json({ ratings })
  } catch (err) {
    console.error('Failed to fetch ratings:', err)
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { case_id, rated_user_id, rating, review } = body

    if (!case_id || !rated_user_id || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO ratings (case_id, rater_id, rated_user_id, rating, review, created_at)
      VALUES (${case_id}, ${user.id}, ${rated_user_id}, ${rating}, ${review || null}, NOW())
      RETURNING *
    `

    return NextResponse.json({ rating: result[0] }, { status: 201 })
  } catch (err) {
    console.error('Failed to create rating:', err)
    return NextResponse.json({ error: 'Failed to create rating' }, { status: 500 })
  }
}
