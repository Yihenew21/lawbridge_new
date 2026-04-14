"use client"

import { motion } from "framer-motion"
import { Scale, User, Copy, Check, ExternalLink, Pencil, BookMarked } from "lucide-react"
import { useState } from "react"
import type { UIMessage } from "ai"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { toast } from "sonner"

function getMessageText(message: UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) return ""
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

const MarkdownComponents: import("react-markdown").Components = {
  h1: ({ node, ...props }) => <h1 className="mt-4 mb-2 text-lg font-bold text-foreground" {...props} />,
  h2: ({ node, ...props }) => <h2 className="mt-4 mb-2 text-base font-bold text-foreground" {...props} />,
  h3: ({ node, ...props }) => <h3 className="mt-3 mb-1.5 text-sm font-bold text-foreground" {...props} />,
  h4: ({ node, ...props }) => <h4 className="mt-2 mb-1 text-sm font-semibold text-foreground" {...props} />,
  ul: ({ node, ...props }) => <ul className="my-2 ml-1 flex flex-col gap-1.5 list-none" {...props} />,
  ol: ({ node, ...props }) => <ol className="my-2 ml-4 flex flex-col gap-1.5 list-decimal marker:text-primary marker:font-bold" {...props} />,
  li: ({ node, children, className, ...props }: any) => {
    return (
      <li className="text-sm leading-relaxed" {...props}>
        <span className="flex items-start gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
          <span className="flex-1">{children}</span>
        </span>
      </li>
    )
  },
  p: ({ node, ...props }) => <p className="text-sm leading-relaxed mb-2 last:mb-0 block" {...props} />,
  blockquote: ({ node, ...props }) => (
    <blockquote
      className="my-2 border-l-2 border-primary/40 pl-3 text-sm text-muted-foreground italic"
      {...props}
    />
  ),
  code: ({ node, children, ...props }: any) => (
    <code
      className="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono text-foreground"
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ node, ...props }) => (
    <pre
      className="my-3 overflow-auto rounded-xl bg-secondary/80 p-4 text-xs font-mono ring-1 ring-border/40"
      {...props}
    />
  ),
  table: ({ node, ...props }) => (
    <div className="my-3 overflow-auto rounded-xl ring-1 ring-border/40">
      <table className="w-full text-xs" {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => <thead className="bg-secondary/60" {...props} />,
  th: ({ node, ...props }) => <th className="px-3 py-2 text-left font-semibold text-foreground" {...props} />,
  td: ({ node, ...props }) => <td className="border-t border-border/30 px-3 py-2 text-muted-foreground" {...props} />,
  a: ({ node, href, children, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 mx-0.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 hover:scale-[1.02] border border-primary/20 text-xs font-semibold transition-all duration-200 align-text-bottom shadow-sm group/link"
      {...props}
    >
      {children}
      <ExternalLink className="h-2.5 w-2.5 opacity-60 group-hover/link:opacity-100 shrink-0" />
    </a>
  ),
  strong: ({ node, children, ...props }) => {
    const textStr = Array.isArray(children) ? children.join('') : String(children)
    // Legal citation detection — render as a prominent badge
    if (/article|proclamation|code|section|constitution|regulation|directive|decree|act|schedule|sub-article|clause/i.test(textStr)) {
      return (
        <span className="inline-flex items-center gap-1 mx-0.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-500/25 align-middle shadow-sm">
          <BookMarked className="h-2.5 w-2.5 shrink-0" />
          {children}
        </span>
      )
    }
    return <strong className="font-semibold text-foreground" {...props}>{children}</strong>
  },
  hr: ({ node, ...props }) => <hr className="my-4 border-border/40" {...props} />,
}

export function ChatMessage({ 
  message, 
  isLast,
  onEdit 
}: { 
  message: UIMessage; 
  isLast: boolean;
  onEdit?: (id: string, newText: string) => void 
}) {
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const isAssistant = message.role === "assistant"
  const text = getMessageText(message)
  const [editText, setEditText] = useState(text)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!", { duration: 2000 })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex gap-3 ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      {isAssistant && (
        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/30 shadow-[0_2px_10px_rgba(var(--primary),0.1)]">
          <Scale className="h-5 w-5 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
        </div>
      )}

      <div className={`group relative max-w-[85%] md:max-w-[75%] ${isAssistant ? "" : "order-first"}`}>
        <div
          className={`px-5 py-4 ${
            isAssistant
              ? "rounded-2xl rounded-tl-sm bg-card/60 text-card-foreground ring-1 ring-primary/20 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
              : "rounded-2xl rounded-tr-sm bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-[0_4px_15px_rgba(var(--primary),0.2)]"
          }`}
        >
          {isAssistant ? (
            <div className="flex flex-col gap-1 text-secondary-foreground">
              <ReactMarkdown components={MarkdownComponents} remarkPlugins={[remarkGfm]}>
                {text}
              </ReactMarkdown>
            </div>
          ) : isEditing ? (
            <div className="flex flex-col gap-2 w-full min-w-[200px] md:min-w-[300px]">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full text-sm leading-relaxed bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 rounded-md p-2 outline-none resize-none overflow-y-auto max-h-48"
                rows={Math.min(Math.max(2, editText.split('\n').length), 8)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (onEdit && editText.trim() !== text && editText.trim().length > 0) {
                      onEdit(message.id, editText.trim());
                    }
                    setIsEditing(false);
                  } else if (e.key === 'Escape') {
                    setIsEditing(false);
                    setEditText(text);
                  }
                }}
              />
              <div className="flex justify-end gap-2 mt-1">
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditText(text)
                  }}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (onEdit && editText.trim() !== text && editText.trim().length > 0) {
                      onEdit(message.id, editText.trim())
                    }
                    setIsEditing(false)
                  }}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors font-medium"
                >
                  Save & Resend
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
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

        {!isAssistant && onEdit && !isEditing && (
          <div className="mt-1 flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Pencil className="h-3 w-3" />
              Edit
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
