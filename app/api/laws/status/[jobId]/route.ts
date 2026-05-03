import { NextRequest, NextResponse } from 'next/server'
import { getJobStatus } from '@/lib/job-processor'

/**
 * GET /api/laws/status/[jobId]
 * Check the status of an async processing job
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const job = await getJobStatus(jobId)

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Calculate estimated time remaining
    let estimatedTimeRemaining = null
    if (job.status === 'processing' && job.progress.currentPage > 0) {
      const pagesRemaining = job.progress.totalPages - job.progress.currentPage
      const avgTimePerPage = 3 // seconds (conservative estimate)
      estimatedTimeRemaining = Math.ceil(pagesRemaining * avgTimePerPage / 60) // minutes
    }

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      progress: {
        currentPage: job.progress.currentPage,
        totalPages: job.progress.totalPages,
        percentage: Math.round((job.progress.currentPage / job.progress.totalPages) * 100),
        status: job.progress.status
      },
      estimatedTimeRemaining: estimatedTimeRemaining ? `${estimatedTimeRemaining} minutes` : null,
      result: job.result,
      error: job.error,
      metadata: job.metadata,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    })

  } catch (error: any) {
    console.error('Error fetching job status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job status' },
      { status: 500 }
    )
  }
}
