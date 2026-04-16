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
  Bot,
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
    today: filtered.filter((s) => Date.now() - s.timestamp < 86400000),
    week: filtered.filter(
      (s) => Date.now() - s.timestamp >= 86400000 && Date.now() - s.timestamp < 604800000
    ),
    older: filtered.filter((s) => Date.now() - s.timestamp >= 604800000),
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
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 top-0 z-50 flex h-dvh w-72 flex-col bg-card border-r border-border/40 shadow-[4px_0_40px_rgba(0,0,0,0.08)] lg:relative lg:z-auto"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border/40">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
                  <Scale className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground leading-none">History</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{sessions.length} conversations</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <button
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* New Chat Button */}
            <div className="px-3 pt-3">
              <motion.button
                onClick={onNewChat}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_4px_12px_rgba(var(--primary),0.3)] active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                New Conversation
              </motion.button>
            </div>

            {/* Search */}
            <div className="px-3 pt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="h-9 w-full rounded-xl border border-border/40 bg-secondary/40 pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto px-3 pt-3 pb-3 space-y-4">
              {filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-3 pt-12 text-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/60 ring-1 ring-border/30">
                    <Bot className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {searchQuery ? "No matches found" : "No conversations yet"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/50">
                      {searchQuery
                        ? "Try a different search term"
                        : "Start asking a legal question"}
                    </p>
                  </div>
                </motion.div>
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
            <div className="border-t border-border/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[10px] text-muted-foreground/40">
                  Stored locally · Private & secure
                </p>
              </div>
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
    <div className="flex flex-col gap-0.5">
      <span className="mb-1 px-2 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/40">
        {label}
      </span>
      {sessions.map((session) => {
        const isActive = session.id === activeSessionId
        const isHovered = session.id === hoveredId
        return (
          <motion.div
            key={session.id}
            layout
            className="relative"
            onMouseEnter={() => setHoveredId(session.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <button
              onClick={() => onSelectSession(session.id)}
              className={`w-full flex flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 ring-1 ring-primary/20 shadow-sm"
                  : "hover:bg-secondary/60"
              }`}
            >
              {/* Coloured left marker for active */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary" />
              )}

              <div className="flex items-center justify-between gap-1">
                <span
                  className={`truncate text-xs font-medium leading-tight ${
                    isActive ? "text-primary" : "text-foreground"
                  }`}
                >
                  {session.title}
                </span>

                <AnimatePresence>
                  {(isHovered || isActive) && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.12 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteSession(session.id)
                      }}
                      className="shrink-0 flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <p className="truncate text-[10px] text-muted-foreground/60 leading-snug">
                {session.preview}
              </p>

              <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-muted-foreground/35">
                <Clock className="h-2 w-2" />
                <span>{formatRelativeTime(session.timestamp)}</span>
                <span>·</span>
                <MessageSquare className="h-2 w-2" />
                <span>{session.messageCount}</span>
              </div>
            </button>
          </motion.div>
        )
      })}
    </div>
  )
}
