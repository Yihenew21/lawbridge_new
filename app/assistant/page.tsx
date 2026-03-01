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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatMessage } from "@/components/assistant/chat-message"
import { TypingIndicator } from "@/components/assistant/typing-indicator"
import { SuggestionChips } from "@/components/assistant/suggestion-chips"
import { ChatSidebar } from "@/components/assistant/chat-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useChatHistory } from "@/hooks/use-chat-history"

const transport = new DefaultChatTransport({ api: "/api/chat" })

export default function AssistantPage() {
  const [input, setInput] = useState("")
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

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

  // Persist messages whenever they change
  const prevMessagesLenRef = useRef(0)
  useEffect(() => {
    if (messages.length > 0 && messages.length !== prevMessagesLenRef.current) {
      prevMessagesLenRef.current = messages.length
      updateSession(messages)
    }
  }, [messages, updateSession])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages, isLoading])

  // Scroll detection
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const fromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      setShowScrollBtn(fromBottom > 200)
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

  const handleSelectSession = useCallback(
    (id: string) => {
      const restored = selectSession(id)
      setMessages(restored)
      prevMessagesLenRef.current = restored.length
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      }
    },
    [selectSession, setMessages]
  )

  const handleNewChat = useCallback(() => {
    startNewChat()
    setMessages([])
    prevMessagesLenRef.current = 0
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }, [startNewChat, setMessages])

  const handleDeleteSession = useCallback(
    (id: string) => {
      deleteSession(id)
      if (id === activeSessionId) {
        setMessages([])
        prevMessagesLenRef.current = 0
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
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 flex items-center justify-between border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-xl"
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20">
                <Scale className="h-4 w-4 text-primary" />
                <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  LawBridge Legal Assistant
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary/60" />
                  AI-powered Ethiopian Law Expert
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMessages([])
                    prevMessagesLenRef.current = 0
                    startNewChat()
                  }}
                  className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>
              </motion.div>
            )}
            <div className="hidden items-center gap-1 rounded-full bg-secondary/60 px-2.5 py-1 text-[11px] text-muted-foreground ring-1 ring-border/30 sm:flex">
              <MessageSquare className="h-3 w-3" />
              {messages.length} messages
            </div>
            <ThemeToggle className="ml-1 lg:hidden" />
          </div>
        </motion.header>

        {/* Chat area */}
        <div
          ref={scrollRef}
          className="relative flex-1 overflow-y-auto scroll-smooth"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
            {messages.length === 0 ? (
              <div className="flex min-h-[60vh] items-center justify-center">
                <SuggestionChips
                  onSelect={handleSuggestion}
                  disabled={isLoading}
                />
              </div>
            ) : (
              <>
                {messages.map((message, i) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isLast={i === messages.length - 1}
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={scrollToBottom}
                className="fixed bottom-28 right-6 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground shadow-lg ring-1 ring-border/50 transition-colors hover:bg-secondary/80"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Input area */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="border-t border-border/50 bg-background/80 px-4 py-3 backdrop-blur-xl"
        >
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-3xl items-end gap-2"
          >
            <div className="relative flex flex-1 items-end rounded-xl border border-border/50 bg-secondary/40 transition-all focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Ethiopian law..."
                disabled={isLoading}
                rows={1}
                className="flex-1 resize-none bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-50"
                style={{ maxHeight: "160px" }}
              />
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-11 w-11 shrink-0 rounded-xl transition-all disabled:opacity-30"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
          <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted-foreground/50">
            LawBridge AI provides legal information, not legal advice. Always consult
            a licensed attorney for specific legal matters.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
