import { NextRequest, NextResponse } from 'next/server'
import { getFirestoreDb } from '@/lib/firebase-admin'
import { extractTextFromPDF, isPDF, getPDFMetadata } from '@/lib/pdf-processor'
import { chunkLegalText } from '@/lib/legal-processor'
import { createProcessingJob, updateJobProgress, completeJob, failJob } from '@/lib/job-processor'

// Increased limits for large law books
export const maxDuration = 300 // 5 minutes for synchronous processing

// File size limits
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB (increased from 50MB)
const SYNC_PAGE_LIMIT = 50 // Process synchronously up to 50 pages
const MAX_PAGES_TOTAL = 1000 // Maximum pages allowed (for validation)

// Supported file types
const SUPPORTED_TYPES = {
  'application/pdf': 'pdf',
  'text/plain': 'txt',
}

/**
 * POST /api/laws
 * Upload and process a law book for AI training
 *
 * - Small PDFs (<= 50 pages): Synchronous processing
 * - Large PDFs (> 50 pages): Async job queue with status tracking
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string | null
    const category = formData.get('category') as string | null
    const description = formData.get('description') as string | null

    // Validation: Required fields
    if (!file || !title) {
      return NextResponse.json(
        { error: 'File and title are required' },
        { status: 400 }
      )
    }

    // Validation: Title length
    if (title.trim().length < 3 || title.trim().length > 200) {
      return NextResponse.json(
        { error: 'Title must be between 3 and 200 characters' },
        { status: 400 }
      )
    }

    // Validation: File type
    if (!SUPPORTED_TYPES[file.type as keyof typeof SUPPORTED_TYPES]) {
      return NextResponse.json(
        { error: `Unsupported file type. Only PDF and TXT files are supported. Received: ${file.type}` },
        { status: 400 }
      )
    }

    // Validation: File size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    console.log(`Processing file: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(2)} KB)`)

    const buffer = Buffer.from(await file.arrayBuffer())
    let pageCount = 0

    // Get page count for PDFs
    if (file.type === 'application/pdf') {
      if (!isPDF(buffer)) {
        return NextResponse.json(
          { error: 'File appears to be corrupted or is not a valid PDF' },
          { status: 400 }
        )
      }

      const metadata = await getPDFMetadata(buffer)
      pageCount = metadata.pages

      console.log(`PDF metadata: ${pageCount} pages`)

      // Validation: Maximum pages
      if (pageCount > MAX_PAGES_TOTAL) {
        return NextResponse.json(
          {
            error: `PDF has ${pageCount} pages, which exceeds the maximum of ${MAX_PAGES_TOTAL} pages. Please split the document into smaller files.`
          },
          { status: 400 }
        )
      }

      // Large PDF: Use async processing
      if (pageCount > SYNC_PAGE_LIMIT) {
        console.log(`Large PDF detected (${pageCount} pages). Creating async processing job...`)

        // Store the file temporarily in Firestore for background processing
        const db = getFirestoreDb()
        const tempFileRef = db.collection('temp_uploads').doc()

        await tempFileRef.set({
          buffer: buffer.toString('base64'),
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          title: title.trim(),
          category: category?.trim() || 'General',
          description: description?.trim() || '',
          pageCount,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        })

        // Create processing job
        const jobId = await createProcessingJob(
          file.name,
          file.size,
          pageCount,
          {
            title: title.trim(),
            category: category?.trim(),
            description: description?.trim()
          }
        )

        // Store temp file reference in job
        await db.collection('processing_jobs').doc(jobId).update({
          tempFileId: tempFileRef.id
        })

        // Trigger background processing (you'll need to implement a worker)
        // For now, we'll return the job ID for status polling
        console.log(`✓ Async job created: ${jobId}`)

        return NextResponse.json({
          async: true,
          jobId,
          message: `Large PDF detected (${pageCount} pages). Processing in background. Use GET /api/laws/status/${jobId} to check progress.`,
          estimatedTime: `${Math.ceil(pageCount / 2)} minutes`,
          statusUrl: `/api/laws/status/${jobId}`
        }, { status: 202 }) // 202 Accepted
      }
    }

    // Small PDF or TXT: Process synchronously
    return await processSynchronously(buffer, file, title, category, description, pageCount)

  } catch (error: any) {
    console.error('Error uploading law:', error)

    let errorMessage = 'Failed to upload law document'
    let statusCode = 500

    if (error.message?.includes('Firebase')) {
      errorMessage = 'Database error: Failed to store document. Please try again.'
    } else if (error.message?.includes('memory')) {
      errorMessage = 'File is too large to process. Please try a smaller file.'
      statusCode = 413
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === 'development' ? error.stack : undefined },
      { status: statusCode }
    )
  }
}

/**
 * Process small files synchronously
 */
async function processSynchronously(
  buffer: Buffer,
  file: File,
  title: string,
  category: string | null,
  description: string | null,
  pageCount: number
) {
  let text = ''
  let processingMethod = ''

  // Extract text based on file type
  if (file.type === 'application/pdf') {
    try {
      text = await extractTextFromPDF(buffer, {
        ocrThreshold: 100,
        maxPages: SYNC_PAGE_LIMIT,
        onProgress: (progress) => {
          console.log(`[OCR Progress] Page ${progress.page}/${progress.total}: ${progress.status}`)
        }
      })
      processingMethod = text.includes('--- Page Break ---') ? 'OCR (Image-based)' : 'Direct text extraction'
    } catch (pdfError: any) {
      console.error('PDF processing error:', pdfError)
      return NextResponse.json(
        { error: `Failed to process PDF: ${pdfError.message}` },
        { status: 500 }
      )
    }
  } else if (file.type === 'text/plain') {
    text = buffer.toString('utf-8')
    processingMethod = 'Plain text'

    if (text.includes('�')) {
      return NextResponse.json(
        { error: 'File contains invalid characters. Please ensure the file is UTF-8 encoded.' },
        { status: 400 }
      )
    }
  }

  // Validation: Extracted text
  if (!text || text.trim().length === 0) {
    return NextResponse.json(
      { error: 'No text could be extracted from the file. The file may be empty, corrupted, or encrypted.' },
      { status: 400 }
    )
  }

  if (text.trim().length < 50) {
    return NextResponse.json(
      { error: 'Extracted text is too short (less than 50 characters). Please provide a valid legal document.' },
      { status: 400 }
    )
  }

  console.log(`Text extracted: ${text.length} characters using ${processingMethod}`)

  // Chunk the legal text
  const chunks = chunkLegalText(text, title)

  if (chunks.length === 0) {
    return NextResponse.json(
      { error: 'Failed to chunk the document. The text may be in an unsupported format.' },
      { status: 500 }
    )
  }

  console.log(`Created ${chunks.length} chunks`)

  // Store in Firestore
  const db = getFirestoreDb()
  const lawRef = db.collection('laws').doc()

  await lawRef.set({
    title: title.trim(),
    category: category?.trim() || 'General',
    description: description?.trim() || '',
    fileType: file.type,
    fileName: file.name,
    fileSize: file.size,
    textLength: text.length,
    chunksCount: chunks.length,
    pageCount: pageCount || null,
    processingMethod,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  // Store chunks in batches
  const batchSize = 500
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = db.batch()
    const batchChunks = chunks.slice(i, i + batchSize)

    batchChunks.forEach((content, batchIndex) => {
      const chunkIndex = i + batchIndex
      const chunkRef = lawRef.collection('chunks').doc(`chunk_${chunkIndex}`)
      batch.set(chunkRef, {
        content,
        index: chunkIndex,
        length: content.length,
        createdAt: new Date().toISOString(),
      })
    })

    await batch.commit()
    console.log(`Committed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}`)
  }

  console.log(`✓ Law document uploaded successfully: ${lawRef.id}`)

  return NextResponse.json({
    success: true,
    async: false,
    lawId: lawRef.id,
    chunksCount: chunks.length,
    fileType: file.type,
    fileName: file.name,
    textLength: text.length,
    pageCount: pageCount || null,
    processingMethod,
    message: 'Law document uploaded and processed successfully'
  })
}

/**
 * GET /api/laws
 * List all uploaded law books with metadata
 */
export async function GET() {
  try {
    const db = getFirestoreDb()
    const lawsSnapshot = await db.collection('laws').orderBy('createdAt', 'desc').get()

    const laws = await Promise.all(
      lawsSnapshot.docs.map(async (doc) => {
        const data = doc.data()

        return {
          id: doc.id,
          title: data.title,
          category: data.category,
          description: data.description,
          fileType: data.fileType,
          fileName: data.fileName,
          fileSize: data.fileSize,
          textLength: data.textLength,
          chunksCount: data.chunksCount,
          pageCount: data.pageCount,
          processingMethod: data.processingMethod,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        }
      })
    )

    return NextResponse.json({
      laws,
      total: laws.length
    })
  } catch (error) {
    console.error('Failed to fetch laws:', error)
    return NextResponse.json(
      { error: 'Failed to fetch laws' },
      { status: 500 }
    )
  }
}
