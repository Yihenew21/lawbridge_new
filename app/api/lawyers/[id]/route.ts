import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sql = neon(process.env.DATABASE_URL!)
  try {
    const lawyerId = (await params).id

    const lawyer = await sql`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.specialization,
        u.bio,
        u.is_verified,
        u.created_at,
        COUNT(DISTINCT c.id) as total_cases,
        AVG(CAST(r.rating as NUMERIC)) as average_rating,
        COUNT(DISTINCT r.id) as total_ratings,
        (SELECT COUNT(*) FROM cases WHERE status = 'closed' AND assigned_lawyer_id = u.id) as completed_cases
      FROM users u
      LEFT JOIN cases c ON u.id = c.assigned_lawyer_id
      LEFT JOIN ratings r ON u.id = r.rated_user_id
      WHERE u.id = ${lawyerId} AND u.role = 'lawyer'
      GROUP BY u.id
    `

    if (lawyer.length === 0) {
      return NextResponse.json({ error: 'Lawyer not found' }, { status: 404 })
    }

    const lawyerData = lawyer[0]

    // Fetch recent ratings
    const ratings = await sql`
      SELECT 
        r.id,
        r.rating,
        r.review,
        r.created_at,
        u.first_name,
        u.last_name
      FROM ratings r
      JOIN users u ON r.rater_id = u.id
      WHERE r.rated_user_id = ${lawyerId}
      ORDER BY r.created_at DESC
      LIMIT 5
    `

    // Fetch Services
    const services = await sql`
      SELECT id, title, category, price, description
      FROM lawyer_services
      WHERE lawyer_id = ${lawyerId} AND active = true
    `

    // Fetch Insights
    const insights = await sql`
      SELECT id, title, category, content, video_url, created_at
      FROM insights
      WHERE lawyer_id = ${lawyerId}
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      lawyer: {
        ...lawyerData,
        average_rating: lawyerData.average_rating ? parseFloat(lawyerData.average_rating) : 0,
        total_cases: parseInt(lawyerData.total_cases) || 0,
        total_ratings: parseInt(lawyerData.total_ratings) || 0,
        completed_cases: parseInt(lawyerData.completed_cases) || 0,
        ratings: ratings || [],
        services: services || [],
        insights: insights || [],
      },
    })
  } catch (error) {
    console.error('Error fetching lawyer profile:', error)
    return NextResponse.json({ error: 'Failed to fetch lawyer profile' }, { status: 500 })
  }
}
