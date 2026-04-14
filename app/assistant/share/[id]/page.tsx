import { getDb } from "@/lib/db"
import { ChatMessage } from "@/components/assistant/chat-message"
import Link from "next/link"
import { Scale } from "lucide-react"

async function getSharedChat(id: string) {
  try {
    const sql = getDb()
    
    // Add safety check in case the table hasn't been created yet by a POST request
    await sql`
      CREATE TABLE IF NOT EXISTS shared_chats (
        id VARCHAR(50) PRIMARY KEY,
        messages JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    const result = await sql`
      SELECT messages, created_at 
      FROM shared_chats 
      WHERE id = ${id}
      LIMIT 1
    `
    
    if (result.length === 0) return null
    return {
      messages: result[0].messages,
      createdAt: result[0].created_at,
    }
  } catch (error) {
    console.error("Failed to fetch Postgres chat:", error)
    return null
  }
}

export default async function SharedChatPage({ 
  params 
}: { 
  params: Promise<{ id: string }> | { id: string } 
}) {
  const resolvedParams = await Promise.resolve(params)
  const chat = await getSharedChat(resolvedParams.id)

  if (!chat) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <Scale className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
        <h1 className="text-2xl font-bold text-foreground">Chat Not Found</h1>
        <p className="text-muted-foreground mt-2 max-w-sm">This shared conversation link may have expired or never existed.</p>
        <Link href="/assistant" className="mt-6 font-semibold text-primary hover:underline hover:text-primary/80 transition-colors">
          Return to Assistant
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background relative overflow-hidden">
      {/* Background Blobs for Immersion */}
      <div className="pointer-events-none fixed -top-[20%] -left-[10%] h-[50%] w-[50%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen mix-blend-mode-normal animate-slow-pulse" />
      <div className="pointer-events-none fixed -bottom-[20%] -right-[10%] h-[50%] w-[50%] rounded-full bg-primary/10 blur-[100px] mix-blend-screen mix-blend-mode-normal animate-pulse delay-1000" />
      
      {/* Decoupled Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 bg-background/60 px-4 backdrop-blur-3xl z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
              <Scale className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-none tracking-tight">
                LawBridge AI Shared Log
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                {new Date(chat.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <Link href="/assistant" className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-medium hover:bg-primary/90 transition-all shadow-md hover:shadow-lg">
          Start Your Own Chat
        </Link>
      </header>
      
      {/* Render Engine Container */}
      <div className="relative flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
          {chat.messages.map((message: any, i: number) => (
            <ChatMessage
              key={message.id || i}
              message={message}
              isLast={i === chat.messages.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
