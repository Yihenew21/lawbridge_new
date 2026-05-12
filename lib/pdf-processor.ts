/**
 * PDF Text Extraction with OCR Support
 * Production-ready implementation with image-based OCR for scanned documents
 *
 * Approach:
 * 1. Use pdf-parse for text-based PDFs (fast, accurate)
 * 2. For scanned PDFs: Convert pages to images → Apply Tesseract OCR
 * 3. This matches best practices and provides better OCR accuracy
 */

import { createWorker } from 'tesseract.js'
import { fromPath } from 'pdf2pic'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

// Dynamic import for pdf-parse (CommonJS module compatibility with Next.js)
let pdfParseModule: any = null

async function getPdfParse() {
  if (!pdfParseModule) {
    pdfParseModule = await import('pdf-parse')
    return pdfParseModule.default || pdfParseModule
  }
  return pdfParseModule
}

/**
 * Extract text from a PDF buffer
 * Automatically detects scanned PDFs and applies image-based OCR
 *
 * @param buffer - PDF file buffer
 * @param options - Processing options
 * @returns Extracted text content
 */
export async function extractTextFromPDF(
  buffer: Buffer,
  options: {
    ocrThreshold?: number // Minimum chars to consider text-based (default: 100)
    maxPages?: number // Max pages to process for OCR (default: 1000)
    onProgress?: (progress: { page: number; total: number; status: string }) => void
  } = {}
): Promise<string> {
  const { ocrThreshold = 100, maxPages = 1000, onProgress } = options

  try {
    // Step 1: Try extracting text with pdf-parse
    const pdfParse = await getPdfParse()
    const data = await pdfParse(buffer)
    let text = data.text
    const pageCount = data.numpages

    console.log(`PDF has ${pageCount} pages. Extracted ${text.trim().length} characters with pdf-parse.`)

    // Step 2: Check if PDF is text-based or scanned
    if (text && text.trim().length >= ocrThreshold) {
      console.log('✓ Text-based PDF detected. Using direct extraction.')
      return text
    }

    // Step 3: Scanned PDF detected - use image-based OCR
    console.log('⚠ Scanned PDF detected. Converting to images for OCR...')

    if (pageCount > maxPages) {
      throw new Error(
        `PDF has ${pageCount} pages, which exceeds the maximum of ${maxPages} pages for OCR processing. ` +
        `Please split the document or increase the maxPages limit.`
      )
    }

    // Step 4: Convert PDF to images and apply OCR
    text = await extractTextFromScannedPDF(buffer, pageCount, onProgress)

    if (!text || text.trim().length === 0) {
      throw new Error(
        'Could not extract text from PDF. The document may be a scanned PDF with poor quality, ' +
        'or it may be encrypted/protected.'
      )
    }

    console.log(`✓ OCR completed. Extracted ${text.length} characters from ${pageCount} pages.`)
    return text

  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error(
      'Failed to extract text from PDF: ' +
      (error instanceof Error ? error.message : 'Unknown error')
    )
  }
}

/**
 * Extract text from scanned PDF by converting pages to images
 *
 * @param buffer - PDF file buffer
 * @param pageCount - Number of pages in PDF
 * @param onProgress - Progress callback
 * @returns Extracted text from all pages
 */
async function extractTextFromScannedPDF(
  buffer: Buffer,
  pageCount: number,
  onProgress?: (progress: { page: number; total: number; status: string }) => void
): Promise<string> {
  const tempDir = join(tmpdir(), `lawbridge-pdf-${Date.now()}`)
  const tempPdfPath = join(tempDir, 'input.pdf')

  try {
    // Create temp directory
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true })
    }

    // Write PDF to temp file (pdf2pic requires file path)
    await writeFile(tempPdfPath, buffer)

    // Initialize Tesseract worker
    const worker = await createWorker('eng')

    // Configure pdf2pic converter
    const converter = fromPath(tempPdfPath, {
      density: 300, // DPI - higher = better quality but slower
      saveFilename: 'page',
      savePath: tempDir,
      format: 'png',
      width: 2480, // A4 at 300 DPI
      height: 3508,
    })

    const allText: string[] = []

    // Process each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      try {
        onProgress?.({
          page: pageNum,
          total: pageCount,
          status: `Converting page ${pageNum}/${pageCount} to image...`
        })

        // Convert page to image
        const result = await converter(pageNum, { responseType: 'image' })

        if (!result || !result.path) {
          console.warn(`Failed to convert page ${pageNum} to image`)
          continue
        }

        onProgress?.({
          page: pageNum,
          total: pageCount,
          status: `Running OCR on page ${pageNum}/${pageCount}...`
        })

        // Run OCR on the image
        const { data: { text } } = await worker.recognize(result.path)

        if (text && text.trim().length > 0) {
          allText.push(text.trim())
          console.log(`✓ Page ${pageNum}: Extracted ${text.trim().length} characters`)
        } else {
          console.warn(`⚠ Page ${pageNum}: No text extracted`)
        }

        // Clean up page image
        try {
          await unlink(result.path)
        } catch (e) {
          // Ignore cleanup errors
        }

      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError)
        // Continue with next page
      }
    }

    // Terminate worker
    await worker.terminate()

    // Combine all page text
    return allText.join('\n\n--- Page Break ---\n\n')

  } finally {
    // Cleanup temp directory
    try {
      await unlink(tempPdfPath)
      // Note: We don't remove the directory itself as it may contain other temp files
    } catch (e) {
      console.warn('Failed to cleanup temp files:', e)
    }
  }
}

/**
 * Validate if a buffer contains a valid PDF
 *
 * @param buffer - File buffer to check
 * @returns true if buffer is a PDF
 */
export function isPDF(buffer: Buffer): boolean {
  // PDF files start with %PDF-
  const header = buffer.slice(0, 5).toString('utf-8')
  return header === '%PDF-'
}

/**
 * Get PDF metadata (page count, info)
 *
 * @param buffer - PDF file buffer
 * @returns PDF metadata
 */
export async function getPDFMetadata(buffer: Buffer): Promise<{
  pages: number
  info: any
}> {
  try {
    const pdfParse = await getPdfParse()
    const data = await pdfParse(buffer)

    return {
      pages: data.numpages,
      info: data.info,
    }
  } catch (error) {
    console.error('Failed to get PDF metadata:', error)
    return {
      pages: 0,
      info: {},
    }
  }
}
