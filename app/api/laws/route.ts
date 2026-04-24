import { NextRequest, NextResponse } from 'next/server'
import { getFirestoreDb } from '@/lib/firebase-admin'
import { chunkLegalText } from '@/lib/legal-processor'

export const maxDuration = 60

/**
 * POST /api/laws
 * Upload and process a law book for AI training
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const category = formData.get('category') as string
    const description = formData.get('description') as string

    if (!file || !title) {
      return NextResponse.json(
        { error: 'File and title are required' },
        { status: 400 }
      )
    }

    // Extract text from file
    let text = ''
    if (file.type === 'application/pdf') {
      return NextResponse.json(
        { error: 'PDF support coming soon. Please upload .txt files for now.' },
        { status: 400 }
      )
    } else {
      // Text file
      const buffer = await file.arrayBuffer()
      text = new TextDecoder().decode(buffer)
    }

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: 'Could not extract text from file' },
        { status: 400 }
      )
    }

    // Chunk the text using the legal processor
    const chunks = chunkLegalText(text, title)

    // Store in Firestore
    const db = getFirestoreDb()
    const lawRef = await db.collection('laws').add({
      title,
      category: category || 'General',
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Store chunks in subcollection
    const chunkPromises = chunks.map((content, index) => {
      return db.collection(`laws/${lawRef.id}/chunks`).add({
        content,
        index,
        lawId: lawRef.id,
      })
    })

    await Promise.all(chunkPromises)

    return NextResponse.json({
      success: true,
      message: `Law book "${title}" uploaded and processed into ${chunks.length} chunks.`,
      lawId: lawRef.id,
      chunksCount: chunks.length,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process and upload law book' },
      { status: 500 }
    )
  }
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

        // Get chunk count
        const chunksSnapshot = await db.collection(`laws/${doc.id}/chunks`).get()

        return {
          id: doc.id,
          title: data.title,
          category: data.category,
          description: data.description,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          chunksCount: chunksSnapshot.size,
        }
      })
    )

    return NextResponse.json({ laws })
  } catch (error) {
    console.error('Failed to fetch laws:', error)
    return NextResponse.json(
      { error: 'Failed to fetch laws' },
      { status: 500 }
    )
  }
}
