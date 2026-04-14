"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Check, X, Share2, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface ShareModalProps {
  isOpen: boolean
  shareUrl: string
  onClose: () => void
}

export function ShareModal({ isOpen, shareUrl, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-select the URL when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.select()
      }, 200)
    }
    setCopied(false)
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback: select the input so user can Ctrl+C
      inputRef.current?.select()
      toast.info("Press Ctrl+C to copy!")
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="relative rounded-2xl border border-border/40 bg-card/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl ring-1 ring-primary/10">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header */}
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/30 shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
                  <Share2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Share this Conversation</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Anyone with this link can view the chat</p>
                </div>
              </div>

              {/* URL Display */}
              <div className="mb-4 overflow-hidden rounded-xl border border-border/50 bg-secondary/40 ring-1 ring-inset ring-border/30">
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <input
                    ref={inputRef}
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-transparent text-xs text-foreground/90 outline-none selection:bg-primary/30 font-mono truncate"
                    onClick={() => inputRef.current?.select()}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <motion.button
                  onClick={handleCopy}
                  whileTap={{ scale: 0.97 }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 shadow-sm ${
                    copied
                      ? "bg-green-500/10 text-green-500 border border-green-500/20"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_12px_rgba(var(--primary),0.25)]"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </motion.button>

                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-border/50 bg-secondary/60 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
