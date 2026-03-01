"use client"

import { useState, useCallback, useEffect } from "react"
import type { UIMessage } from "ai"
import type { ChatSession } from "@/components/assistant/chat-sidebar"

const STORAGE_KEY = "lawbridge-chat-sessions"
const MESSAGES_KEY_PREFIX = "lawbridge-messages-"

function getMessageText(message: UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) return ""
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

function generateTitle(messages: UIMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user")
  if (!firstUser) return "New Conversation"
  const text = getMessageText(firstUser)
  return text.length > 50 ? text.slice(0, 50) + "..." : text
}

function generatePreview(messages: UIMessage[]): string {
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant")
  if (!lastAssistant) return "No response yet"
  const text = getMessageText(lastAssistant)
  return text.length > 80 ? text.slice(0, 80) + "..." : text
}

function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveSessions(sessions: ChatSession[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

function loadMessages(sessionId: string): UIMessage[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(MESSAGES_KEY_PREFIX + sessionId)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveMessages(sessionId: string, messages: UIMessage[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(MESSAGES_KEY_PREFIX + sessionId, JSON.stringify(messages))
}

function removeMessages(sessionId: string) {
  if (typeof window === "undefined") return
  localStorage.removeItem(MESSAGES_KEY_PREFIX + sessionId)
}

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const loaded = loadSessions()
    setSessions(loaded)
    setMounted(true)
  }, [])

  const createSession = useCallback((): string => {
    const id = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const session: ChatSession = {
      id,
      title: "New Conversation",
      preview: "Start typing to begin...",
      timestamp: Date.now(),
      messageCount: 0,
    }
    setSessions((prev) => {
      const next = [session, ...prev]
      saveSessions(next)
      return next
    })
    setActiveSessionId(id)
    return id
  }, [])

  const updateSession = useCallback(
    (messages: UIMessage[]) => {
      if (!activeSessionId || messages.length === 0) return

      const title = generateTitle(messages)
      const preview = generatePreview(messages)

      setSessions((prev) => {
        const next = prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                title,
                preview,
                timestamp: Date.now(),
                messageCount: messages.length,
              }
            : s
        )
        saveSessions(next)
        return next
      })
      saveMessages(activeSessionId, messages)
    },
    [activeSessionId]
  )

  const selectSession = useCallback(
    (id: string): UIMessage[] => {
      setActiveSessionId(id)
      return loadMessages(id)
    },
    []
  )

  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const next = prev.filter((s) => s.id !== id)
        saveSessions(next)
        return next
      })
      removeMessages(id)
      if (activeSessionId === id) {
        setActiveSessionId(null)
      }
    },
    [activeSessionId]
  )

  const startNewChat = useCallback(() => {
    setActiveSessionId(null)
  }, [])

  return {
    sessions,
    activeSessionId,
    mounted,
    createSession,
    updateSession,
    selectSession,
    deleteSession,
    startNewChat,
    setActiveSessionId,
  }
}
