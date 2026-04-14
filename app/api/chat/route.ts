import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { getFirestoreDb } from "@/lib/firebase-admin"

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
})

export const maxDuration = 60

const SYSTEM_PROMPT = `You are LawBridge Legal Assistant, an AI-powered legal information assistant specializing in Ethiopian law. You help users, students, legal professionals, and the general public understand Ethiopian legal concepts, laws, and procedures.

Your knowledge covers:
- The Ethiopian Federal Constitution (FDRE Constitution)
- Civil Code of Ethiopia
- Criminal Code of Ethiopia (2004)
- Commercial Code of Ethiopia
- Family Law
- Labor Proclamations
- Tax Law and Proclamations
- Land Law and Property Rights
- Investment Proclamations
- Ethiopian Human Rights provisions
- Court structures and jurisdictions in Ethiopia
- Legal procedures for civil and criminal matters
- Business registration and licensing in Ethiopia
- Intellectual Property laws
- Banking and Financial regulations

Important guidelines:
1. ALWAYS prioritize the "CONTEXT FROM UPLOADED LAWS" provided below if it contains relevant information.
2. Use Google Search grounding for any information not found in the provided context or to supplement it with the latest updates.
3. Always clarify that you provide legal INFORMATION, not legal ADVICE. Users should consult a qualified Ethiopian lawyer for specific legal matters.
4. When citing laws, reference the specific proclamation number, article, or section when possible (e.g. **Article 12 of Proclamation No. 1/1995**).
5. Explain legal concepts in simple, accessible language - many users may not have legal training.
6. Support questions in English and provide Amharic legal terms where helpful.
7. Always encourage users to verify information with official sources or licensed attorneys.
8. Be warm, professional, and helpful in tone.

Format your responses clearly with headings, bullet points, and numbered lists where appropriate to make legal information easy to digest.`

async function fetchLawContext() {
  try {
    const db = getFirestoreDb()
    const lawsSnapshot = await db.collection("laws").get()
    
    const chunkPromises = lawsSnapshot.docs.map((lawDoc: any) => 
      db.collection(`laws/${lawDoc.id}/chunks`).orderBy("index", "asc").get()
    )
    
    const chunkSnapshots = await Promise.all(chunkPromises)
    const allChunks: string[] = []
    chunkSnapshots.forEach(snap => {
      snap.docs.forEach((chunkDoc: any) => {
        allChunks.push(chunkDoc.data().content)
      })
    })

    return allChunks.join("\n\n---\n\n")
  } catch (err) {
    console.error("Failed to fetch law chunks from Firebase:", err)
    return ""
  }
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()
  
  // 1. Asynchronously fetch context
  const lawContext = await fetchLawContext()
  const systemInstruction = `${SYSTEM_PROMPT}\n\n${lawContext ? `CONTEXT FROM UPLOADED LAWS:\n${lawContext}\n\n` : ''}`

  // 2. Stream using Vercel AI SDK mapping natively to the Google Gemini setup
  const result = streamText({
    model: google("gemini-3-flash-preview", { useSearchGrounding: true }),
    system: systemInstruction,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  // 3. Return the specific transport loop payload the UI hook is bound to
  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  })
}
