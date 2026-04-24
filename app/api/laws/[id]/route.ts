import { NextRequest, NextResponse } from 'next/server'
import { getFirestoreDb } from '@/lib/firebase-admin'

/**
 * DELETE /api/laws/:id
 * Delete a law book and all its chunks
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lawId = params.id

    if (!lawId) {
      return NextResponse.json(
        { error: 'Law ID is required' },
        { status: 400 }
      )
    }

    const db = getFirestoreDb()

    // Delete all chunks first
    const chunksSnapshot = await db.collection(`laws/${lawId}/chunks`).get()
    const deletePromises = chunksSnapshot.docs.map(doc => doc.ref.delete())
    await Promise.all(deletePromises)

    // Delete the law document
    await db.collection('laws').doc(lawId).delete()

    return NextResponse.json({
      success: true,
      message: 'Law book deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete law:', error)
    return NextResponse.json(
      { error: 'Failed to delete law' },
      { status: 500 }
    )
  }
}
