import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const specialization = searchParams.get('specialization')
    const sortBy = searchParams.get('sort') || 'rating'
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : 0
    const verified = searchParams.get('verified') === 'true'
    const search = searchParams.get('search') || ''

    let query = `
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
        (SELECT COUNT(*) FROM case_applications ca JOIN cases c2 ON c2.id = ca.case_id WHERE c2.status = 'closed' AND ca.lawyer_id = u.id) as completed_cases
      FROM users u
      LEFT JOIN case_applications ca ON ca.lawyer_id = u.id
      LEFT JOIN cases c ON c.id = ca.case_id
      LEFT JOIN ratings r ON u.id = r.rated_user_id
      WHERE u.role = 'lawyer'
    `

    if (verified) {
      query += ` AND u.is_verified = true`
    }

    if (specialization) {
      query += ` AND u.specialization = ${specialization}`
    }

    if (search) {
      query += ` AND (u.first_name ILIKE $'%${search}%' OR u.last_name ILIKE $'%${search}%' OR u.specialization ILIKE $'%${search}%')`
    }

    query += ` GROUP BY u.id`

    if (minRating > 0) {
      query += ` HAVING AVG(CAST(r.rating as NUMERIC)) >= ${minRating}`
    }

    if (sortBy === 'rating') {
      query += ` ORDER BY average_rating DESC NULLS LAST, total_ratings DESC`
    } else if (sortBy === 'completed') {
      query += ` ORDER BY completed_cases DESC`
    } else if (sortBy === 'newest') {
      query += ` ORDER BY u.created_at DESC`
    }

    query += ` LIMIT 100`

    const lawyers = await sql(query)

    return NextResponse.json({
      lawyers: lawyers.map((lawyer) => ({
        ...lawyer,
        average_rating: lawyer.average_rating ? parseFloat(lawyer.average_rating) : 0,
        total_cases: parseInt(lawyer.total_cases) || 0,
        total_ratings: parseInt(lawyer.total_ratings) || 0,
        completed_cases: parseInt(lawyer.completed_cases) || 0,
      })),
    })
  } catch (error) {
    console.error('Error fetching lawyers:', error)
    return NextResponse.json({ error: 'Failed to fetch lawyers' }, { status: 500 })
  }
}
