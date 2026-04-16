"use client"

import { motion } from "framer-motion"
import { Scale } from "lucide-react"

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="flex items-end gap-3"
    >
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/30 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
        <Scale className="h-5 w-5 text-primary" />
      </div>

      {/* Bubble */}
      <div className="flex items-center gap-px rounded-2xl rounded-tl-sm bg-card/60 px-5 py-4 ring-1 ring-primary/20 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        {/* Animated dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block h-2 w-2 rounded-full bg-primary/50"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.18,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <span className="ml-2.5 text-xs text-muted-foreground/60 select-none">Analyzing...</span>
      </div>
    </motion.div>
  )
}
