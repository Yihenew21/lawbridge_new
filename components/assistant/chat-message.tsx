"use client"

import { motion } from "framer-motion"
import { Scale, User, Copy, Check } from "lucide-react"
import { useState } from "react"
import type { UIMessage } from "ai"

function getMessageText(message: UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) return ""
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

function formatContent(text: string) {
  const lines = text.split("\n")
  const elements: React.ReactNode[] = []
  let listBuffer: string[] = []
  let orderedBuffer: string[] = []

  const flushList = () => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-2 ml-4 flex flex-col gap-1">
          {listBuffer.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
              <span>{formatInlineText(item)}</span>
            </li>
          ))}
        </ul>
      )
      listBuffer = []
    }
  }

  const flushOrdered = () => {
    if (orderedBuffer.length > 0) {
      elements.push(
        <ol key={`ol-${elements.length}`} className="my-2 ml-4 flex flex-col gap-1">
          {orderedBuffer.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                {i + 1}
              </span>
              <span>{formatInlineText(item)}</span>
            </li>
          ))}
        </ol>
      )
      orderedBuffer = []
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith("# ")) {
      flushList()
      flushOrdered()
      elements.push(
        <h2 key={`h-${elements.length}`} className="mt-4 mb-2 text-base font-bold text-foreground font-serif">
          {trimmed.slice(2)}
        </h2>
      )
    } else if (trimmed.startsWith("## ")) {
      flushList()
      flushOrdered()
      elements.push(
        <h3 key={`h-${elements.length}`} className="mt-3 mb-1.5 text-sm font-bold text-foreground">
          {trimmed.slice(3)}
        </h3>
      )
    } else if (trimmed.startsWith("### ")) {
      flushList()
      flushOrdered()
      elements.push(
        <h4 key={`h-${elements.length}`} className="mt-2 mb-1 text-sm font-semibold text-foreground">
          {trimmed.slice(4)}
        </h4>
      )
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      flushOrdered()
      listBuffer.push(trimmed.slice(2))
    } else if (/^\d+\.\s/.test(trimmed)) {
      flushList()
      orderedBuffer.push(trimmed.replace(/^\d+\.\s/, ""))
    } else if (trimmed === "") {
      flushList()
      flushOrdered()
    } else {
      flushList()
      flushOrdered()
      elements.push(
        <p key={`p-${elements.length}`} className="text-sm leading-relaxed">
          {formatInlineText(trimmed)}
        </p>
      )
    }
  }
  flushList()
  flushOrdered()
  return elements
}

function formatInlineText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export function ChatMessage({ message, isLast }: { message: UIMessage; isLast: boolean }) {
  const [copied, setCopied] = useState(false)
  const isAssistant = message.role === "assistant"
  const text = getMessageText(message)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex gap-3 ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      {isAssistant && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20">
          <Scale className="h-4 w-4 text-primary" />
        </div>
      )}

      <div className={`group relative max-w-[85%] md:max-w-[75%] ${isAssistant ? "" : "order-first"}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isAssistant
              ? "bg-secondary/80 text-secondary-foreground ring-1 ring-border/50"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {isAssistant ? (
            <div className="flex flex-col gap-1 text-secondary-foreground">{formatContent(text)}</div>
          ) : (
            <p className="text-sm leading-relaxed">{text}</p>
          )}
        </div>

        {isAssistant && text && (
          <div className="mt-1 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>

      {!isAssistant && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted ring-1 ring-border/50">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  )
}
