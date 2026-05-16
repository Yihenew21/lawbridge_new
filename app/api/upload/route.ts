import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'crypto'

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME || ''
const PUBLIC_URL = process.env.S3_PUBLIC_URL || ''

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("lawbridge_session")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'uploads'

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      )
    }

    // Log file info for debugging
    console.log('📎 File upload attempt:', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    // Get file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''

    // Validate file type - check both MIME type and extension
    const isImage = file.type.startsWith('image/') ||
                    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'bmp', 'svg'].includes(fileExtension)

    const isPDF = file.type === 'application/pdf' || fileExtension === 'pdf'

    const isWord = file.type === 'application/msword' ||
                   file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                   ['doc', 'docx'].includes(fileExtension)

    const isText = file.type === 'text/plain' || fileExtension === 'txt'

    if (!isImage && !isPDF && !isWord && !isText) {
      console.error('❌ Invalid file type:', file.type, 'Extension:', fileExtension)
      return NextResponse.json(
        { error: `Invalid file type: ${file.name}. Allowed: images (JPG, PNG, HEIC, etc.), PDF, Word, text files` },
        { status: 400 }
      )
    }

    console.log('✅ File validation passed:', { isImage, isPDF, isWord, isText })

    // Generate unique filename
    const uniqueFilename = `${folder}/${user.id}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${fileExtension}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFilename,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read',
    })

    await s3Client.send(command)

    // Return public URL
    const publicUrl = `${PUBLIC_URL}/${uniqueFilename}`

    return NextResponse.json({
      url: publicUrl,
      filename: file.name,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error("File upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
