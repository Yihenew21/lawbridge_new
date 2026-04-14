"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import {
  Scale,
  Send,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Trash2,
  ChevronDown,
  PanelLeftOpen,
  PanelLeftClose,
  Share2,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ChatMessage } from "@/components/assistant/chat-message"
import { TypingIndicator } from "@/components/assistant/typing-indicator"
import { SuggestionChips } from "@/components/assistant/suggestion-chips"
import { ChatSidebar } from "@/components/assistant/chat-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useChatHistory } from "@/hooks/use-chat-history"
import { ShareModal } from "@/components/assistant/share-modal"

const transport = new DefaultChatTransport({ api: "/api/chat" })

export default function AssistantPage() {
  const [input, setInput] = useState("")
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isUserScrollingRef = useRef(false)

  const {
    sessions,
    activeSessionId,
    mounted,
    createSession,
    updateSession,
    selectSession,
    deleteSession,
    startNewChat,
  } = useChatHistory()

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
  })

  const isLoading = status === "streaming" || status === "submitted"

  // Safely persist messages to localStorage without lagging React
  useEffect(() => {
    if (messages.length > 0 && activeSessionId) {
      const isStreaming = status === "streaming"
      const lastMessage = messages[messages.length - 1]
      
      // Save immediately when the user sends a message, or when the AI finishes its stream!
      if (!isStreaming || lastMessage?.role === "user") {
        updateSession(messages)
      }
    }
  }, [messages, updateSession, activeSessionId, status])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current && !isUserScrollingRef.current) {
      const isStreaming = status === "streaming"
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        // Utilize instant "auto" to prevent jitter during fast stream layout updates, and smooth for final pushes 
        behavior: isStreaming ? "auto" : "smooth",
      })
    }
  }, [messages, status])

  // Scroll detection
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const fromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      setShowScrollBtn(fromBottom > 200)
      
      // Pause automatic scrolling if the user intentionally scrolls upward
      if (fromBottom > 150) {
        isUserScrollingRef.current = true
      } else {
        isUserScrollingRef.current = false
      }
    }
    el.addEventListener("scroll", onScroll)
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  // Open sidebar by default on desktop
  useEffect(() => {
    if (mounted && window.innerWidth >= 1024) {
      setSidebarOpen(true)
    }
  }, [mounted])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!input.trim() || isLoading) return

      // Create session if new chat
      if (!activeSessionId) {
        createSession()
      }

      sendMessage({ text: input.trim() })
      setInput("")
      if (inputRef.current) {
        inputRef.current.style.height = "auto"
      }
    },
    [input, isLoading, activeSessionId, createSession, sendMessage]
  )

  const handleSuggestion = useCallback(
    (query: string) => {
      if (!activeSessionId) {
        createSession()
      }
      sendMessage({ text: query })
    },
    [activeSessionId, createSession, sendMessage]
  )

  const handleEdit = useCallback(
    (id: string, text: string) => {
      const idx = messages.findIndex((m) => m.id === id)
      if (idx === -1) return
      setMessages(messages.slice(0, idx))
      sendMessage({ text })
    },
    [messages, setMessages, sendMessage]
  )

  const [isSharing, setIsSharing] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  
  const handleShare = async () => {
    if (messages.length === 0) {
      toast.error("No messages to share!")
      return
    }
    setIsSharing(true)
    try {
      const res = await fetch("/api/chat/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
      })
      
      if (!res.ok) throw new Error("Share failed")
      
      const { id } = await res.json()
      const url = `${window.location.origin}/assistant/share/${id}`
      setShareUrl(url)
    } catch (err) {
      toast.error("Failed to share chat. Please try again.")
    } finally {
      setIsSharing(false)
    }
  }

  const handleSelectSession = useCallback(
    (id: string) => {
      const restored = selectSession(id)
      setMessages(restored)
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      }
    },
    [selectSession, setMessages]
  )

  const handleNewChat = useCallback(() => {
    startNewChat()
    setMessages([])
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }, [startNewChat, setMessages])

  const handleDeleteSession = useCallback(
    (id: string) => {
      deleteSession(id)
      if (id === activeSessionId) {
        setMessages([])
      }
    },
    [deleteSession, activeSessionId, setMessages]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  const scrollToBottom = () => {
    isUserScrollingRef.current = false
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }

  return (
    <div className="flex h-dvh bg-background">
      {/* Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
      />

      {/* Main chat area */}
      <div className="flex flex-1 flex-col relative overflow-hidden">
        {/* Dynamic Background */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-[10%] left-[25%] h-[400px] w-[400px] rounded-full bg-primary/8 blur-[120px] animate-pulse duration-[5000ms]" />
          <div className="absolute bottom-[15%] right-[20%] h-[350px] w-[350px] rounded-full bg-primary/6 blur-[100px] animate-pulse duration-[7000ms] delay-1000" />
          <div className="absolute top-[50%] right-[40%] h-[200px] w-[200px] rounded-full bg-primary/5 blur-[80px] animate-pulse duration-[4000ms] delay-500" />
        </div>

        {/* ─── Header ─── */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 flex h-14 shrink-0 items-center justify-between border-b border-border/30 bg-background/70 px-3 backdrop-blur-2xl"
        >
          {/* Left: nav */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </button>
            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            {/* Brand */}
            <div className="ml-1 flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 ring-1 ring-primary/25">
                <Scale className="h-4.5 w-4.5 text-primary" />
                {/* Online dot */}
                <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                </span>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-semibold text-foreground leading-none">LawBridge AI</span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Sparkles className="h-2.5 w-2.5 text-primary/60" />
                  Ethiopian Law Expert
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            {/* Token counter */}
            <div className="hidden items-center gap-1.5 rounded-full border border-border/40 bg-secondary/40 px-2.5 py-1 sm:flex">
              <MessageSquare className="h-3 w-3 text-muted-foreground/60" />
              <span className="text-[11px] text-muted-foreground">{messages.length} msgs</span>
            </div>

            <AnimatePresence>
              {messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="flex items-center"
                >
                  <button
                    onClick={handleShare}
                    disabled={isSharing || isLoading}
                    className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-primary disabled:opacity-40"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{isSharing ? "Sharing..." : "Share"}</span>
                  </button>
                  <button
                    onClick={() => { setMessages([]); startNewChat() }}
                    className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <ThemeToggle className="lg:hidden" />
          </div>
        </motion.header>

        {/* ─── Chat area ─── */}
        <div
          ref={scrollRef}
          className="relative flex-1 overflow-y-auto"
        >
          <div className="mx-auto flex max-w-4xl flex-col gap-5 px-4 py-8">
            {messages.length === 0 ? (
              <div className="flex min-h-[70vh] items-center justify-center">
                <SuggestionChips onSelect={handleSuggestion} disabled={isLoading} />
              </div>
            ) : (
              <>
                {messages.map((message, i) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isLast={i === messages.length - 1}
                    onEdit={handleEdit}
                  />
                ))}
                <AnimatePresence>
                  {isLoading &&
                    (messages.length === 0 ||
                      messages[messages.length - 1]?.role === "user") && (
                      <TypingIndicator />
                    )}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* Scroll to bottom button */}
          <AnimatePresence>
            {showScrollBtn && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 8 }}
                onClick={scrollToBottom}
                className="fixed bottom-28 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_4px_16px_rgba(var(--primary),0.4)] ring-1 ring-primary/50 transition-all hover:bg-primary/90 hover:scale-105"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Input Area ─── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="relative z-10 border-t border-border/30 bg-background/70 px-4 pb-5 pt-3 backdrop-blur-2xl"
        >
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-4xl flex-col gap-2"
          >
            {/* Input row */}
            <div className="relative flex items-end gap-2 rounded-2xl border border-border/50 bg-secondary/30 p-2 shadow-[0_2px_20px_rgba(0,0,0,0.06)] transition-all focus-within:border-primary/40 focus-within:shadow-[0_2px_20px_rgba(var(--primary),0.08)] focus-within:ring-1 focus-within:ring-primary/15">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about Ethiopian law..."
                disabled={isLoading}
                rows={1}
                className="flex-1 resize-none bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none disabled:opacity-50 leading-relaxed"
                style={{ maxHeight: "160px" }}
              />
              <motion.button
                type="submit"
                disabled={!input.trim() || isLoading}
                whileTap={{ scale: 0.94 }}
                className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(var(--primary),0.3)] transition-all hover:bg-primary/90 hover:shadow-[0_4px_12px_rgba(var(--primary),0.4)] disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </motion.button>
            </div>

            {/* Disclaimer Banner */}
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-600/90 dark:text-amber-400/90">
              <span className="mt-0.5 shrink-0 text-base leading-none">⚖️</span>
              <p className="leading-relaxed">
                <span className="font-semibold">Legal Information Only —</span>{" "}
                LawBridge AI is not a substitute for professional legal counsel.
                Always consult a licensed attorney for your specific matter.
              </p>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Share Link Modal */}
      <ShareModal
        isOpen={!!shareUrl}
        shareUrl={shareUrl ?? ""}
        onClose={() => setShareUrl(null)}
      />
    </div>
  )
}
