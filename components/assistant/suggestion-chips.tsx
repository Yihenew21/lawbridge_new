"use client"

import { motion } from "framer-motion"
import {
  Scale,
  Building2,
  Users,
  FileText,
  Gavel,
  Landmark,
} from "lucide-react"

const suggestions = [
  {
    icon: Scale,
    label: "Constitutional Rights",
    query: "What are the fundamental rights and freedoms guaranteed under the FDRE Constitution?",
  },
  {
    icon: Building2,
    label: "Business Registration",
    query: "What are the steps and requirements to register a business in Ethiopia?",
  },
  {
    icon: Users,
    label: "Family Law",
    query: "What are the legal requirements for marriage and divorce under Ethiopian family law?",
  },
  {
    icon: FileText,
    label: "Employment Law",
    query: "What are the key provisions of Ethiopian labor law regarding employee rights and termination?",
  },
  {
    icon: Gavel,
    label: "Criminal Procedure",
    query: "How does the criminal justice process work in Ethiopia from arrest to trial?",
  },
  {
    icon: Landmark,
    label: "Property Rights",
    query: "What are the land ownership and property rights laws in Ethiopia?",
  },
]

interface SuggestionChipsProps {
  onSelect: (query: string) => void
  disabled: boolean
}

export function SuggestionChips({ onSelect, disabled }: SuggestionChipsProps) {
  return (
    <div className="flex flex-col items-center gap-6 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-3 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Scale className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground font-serif">LawBridge Legal Assistant</h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Ask me anything about Ethiopian law. I can help with constitutional rights, business regulations, family law, criminal procedures, and more.
        </p>
      </motion.div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {suggestions.map((s, i) => (
          <motion.button
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.06 }}
            onClick={() => onSelect(s.query)}
            disabled={disabled}
            className="group flex items-start gap-3 rounded-xl border border-border/50 bg-secondary/40 p-3 text-left transition-all hover:border-primary/30 hover:bg-secondary/80 hover:shadow-lg hover:shadow-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
              <s.icon className="h-4 w-4 text-primary/70 transition-colors group-hover:text-primary" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-foreground">{s.label}</span>
              <span className="text-[11px] leading-snug text-muted-foreground line-clamp-2">
                {s.query}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
