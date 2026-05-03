/**
 * Async Job Processing System for Large PDFs
 *
 * This module handles background processing of large PDF documents
 * that exceed the synchronous processing limits.
 */

import { getFirestoreDb } from './firebase-admin'

export interface ProcessingJob {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: {
    currentPage: number
    totalPages: number
    status: string
  }
  result?: {
    lawId: string
    chunksCount: number
    textLength: number
  }
  error?: string
  createdAt: string
  updatedAt: string
  metadata: {
    fileName: string
    fileSize: number
    title: string
    category?: string
    description?: string
  }
}

/**
 * Create a new processing job
 */
export async function createProcessingJob(
  fileName: string,
  fileSize: number,
  totalPages: number,
  metadata: {
    title: string
    category?: string
    description?: string
  }
): Promise<string> {
  const db = getFirestoreDb()
  const jobRef = db.collection('processing_jobs').doc()

  await jobRef.set({
    status: 'pending',
    progress: {
      currentPage: 0,
      totalPages,
      status: 'Queued for processing'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      fileName,
      fileSize,
      ...metadata
    }
  })

  return jobRef.id
}

/**
 * Update job progress
 */
export async function updateJobProgress(
  jobId: string,
  progress: {
    currentPage: number
    totalPages: number
    status: string
  }
): Promise<void> {
  const db = getFirestoreDb()
  await db.collection('processing_jobs').doc(jobId).update({
    status: 'processing',
    progress,
    updatedAt: new Date().toISOString()
  })
}

/**
 * Mark job as completed
 */
export async function completeJob(
  jobId: string,
  result: {
    lawId: string
    chunksCount: number
    textLength: number
  }
): Promise<void> {
  const db = getFirestoreDb()
  await db.collection('processing_jobs').doc(jobId).update({
    status: 'completed',
    result,
    updatedAt: new Date().toISOString()
  })
}

/**
 * Mark job as failed
 */
export async function failJob(jobId: string, error: string): Promise<void> {
  const db = getFirestoreDb()
  await db.collection('processing_jobs').doc(jobId).update({
    status: 'failed',
    error,
    updatedAt: new Date().toISOString()
  })
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string): Promise<ProcessingJob | null> {
  const db = getFirestoreDb()
  const jobDoc = await db.collection('processing_jobs').doc(jobId).get()

  if (!jobDoc.exists) {
    return null
  }

  return {
    id: jobDoc.id,
    ...jobDoc.data()
  } as ProcessingJob
}

/**
 * Clean up old jobs (older than 7 days)
 */
export async function cleanupOldJobs(): Promise<number> {
  const db = getFirestoreDb()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const oldJobs = await db
    .collection('processing_jobs')
    .where('createdAt', '<', sevenDaysAgo.toISOString())
    .get()

  const batch = db.batch()
  oldJobs.docs.forEach(doc => {
    batch.delete(doc.ref)
  })

  await batch.commit()
  return oldJobs.size
}
