"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare,
  Plus,
  Trash2,
  Clock,
  Scale,
  ChevronLeft,
  Search,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"

export interface ChatSession {
  id: string
  title: string
  preview: string
  timestamp: number
  messageCount: number
}

interface ChatSidebarProps {
  isOpen: boolean
  onClose: () => void
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onNewChat: () => void
  onDeleteSession: (id: string) => void
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function ChatSidebar({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const filtered = sessions.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.preview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const grouped = {
    today: filtered.filter(
      (s) => Date.now() - s.timestamp < 86400000
    ),
    week: filtered.filter(
      (s) => Date.now() - s.timestamp >= 86400000 && Date.now() - s.timestamp < 604800000
    ),
    older: filtered.filter(
      (s) => Date.now() - s.timestamp >= 604800000
    ),
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 top-0 z-50 flex h-dvh w-80 flex-col border-r border-border/50 bg-card lg:relative lg:z-auto"
          >
            {/* Sidebar header */}
            <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20">
                  <Scale className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">Chat History</span>
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* New chat button */}
            <div className="px-3 pt-3">
              <Button
                onClick={onNewChat}
                className="w-full gap-2 rounded-xl font-medium"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                New Conversation
              </Button>
            </div>

            {/* Search */}
            <div className="px-3 pt-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="h-8 w-full rounded-lg border border-border/50 bg-secondary/40 pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Session list */}
            <div className="flex-1 overflow-y-auto px-3 pt-3 pb-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 pt-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/60">
                    <MessageSquare className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {searchQuery ? "No matches found" : "No conversations yet"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/60">
                      {searchQuery
                        ? "Try a different search term"
                        : "Start a new conversation to get legal insights"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {grouped.today.length > 0 && (
                    <SessionGroup
                      label="Today"
                      sessions={grouped.today}
                      activeSessionId={activeSessionId}
                      hoveredId={hoveredId}
                      setHoveredId={setHoveredId}
                      onSelectSession={onSelectSession}
                      onDeleteSession={onDeleteSession}
                    />
                  )}
                  {grouped.week.length > 0 && (
                    <SessionGroup
                      label="This Week"
                      sessions={grouped.week}
                      activeSessionId={activeSessionId}
                      hoveredId={hoveredId}
                      setHoveredId={setHoveredId}
                      onSelectSession={onSelectSession}
                      onDeleteSession={onDeleteSession}
                    />
                  )}
                  {grouped.older.length > 0 && (
                    <SessionGroup
                      label="Older"
                      sessions={grouped.older}
                      activeSessionId={activeSessionId}
                      hoveredId={hoveredId}
                      setHoveredId={setHoveredId}
                      onSelectSession={onSelectSession}
                      onDeleteSession={onDeleteSession}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border/50 px-4 py-3">
              <p className="text-[10px] leading-relaxed text-muted-foreground/40 text-center">
                Chat history is stored locally on your device.
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}

function SessionGroup({
  label,
  sessions,
  activeSessionId,
  hoveredId,
  setHoveredId,
  onSelectSession,
  onDeleteSession,
}: {
  label: string
  sessions: ChatSession[]
  activeSessionId: string | null
  hoveredId: string | null
  setHoveredId: (id: string | null) => void
  onSelectSession: (id: string) => void
  onDeleteSession: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
        {label}
      </span>
      {sessions.map((session) => {
        const isActive = session.id === activeSessionId
        const isHovered = session.id === hoveredId
        return (
          <motion.button
            key={session.id}
            layout
            onClick={() => onSelectSession(session.id)}
            onMouseEnter={() => setHoveredId(session.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`group relative flex w-full flex-col gap-1 rounded-xl px-3 py-2.5 text-left transition-all ${
              isActive
                ? "bg-primary/10 ring-1 ring-primary/20"
                : "hover:bg-secondary/60"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`truncate text-xs font-medium ${
                  isActive ? "text-primary" : "text-foreground"
                }`}
              >
                {session.title}
              </span>
              <AnimatePresence>
                {(isHovered || isActive) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteSession(session.id)
                    }}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <p className="truncate text-[11px] text-muted-foreground/60">
              {session.preview}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/40">
              <Clock className="h-2.5 w-2.5" />
              <span>{formatRelativeTime(session.timestamp)}</span>
              <span>·</span>
              <span>{session.messageCount} messages</span>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
