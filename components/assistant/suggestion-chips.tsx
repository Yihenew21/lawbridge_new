"use client"

import { motion } from "framer-motion"
import {
  Scale,
  Building2,
  Users,
  FileText,
  Gavel,
  Landmark,
  BookOpen,
  Briefcase,
  ChevronRight,
} from "lucide-react"

const suggestions = [
  {
    icon: Scale,
    label: "Constitutional Rights",
    description: "Fundamental freedoms & citizen protections",
    query: "What are the fundamental rights and freedoms guaranteed under the FDRE Constitution?",
    color: "from-violet-500/20 to-purple-500/5",
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/10 group-hover:bg-violet-500",
  },
  {
    icon: Building2,
    label: "Business Registration",
    description: "Steps to legally register your business",
    query: "What are the steps and requirements to register a business in Ethiopia?",
    color: "from-blue-500/20 to-sky-500/5",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10 group-hover:bg-blue-500",
  },
  {
    icon: Users,
    label: "Family Law",
    description: "Marriage, divorce and custody law",
    query: "What are the legal requirements for marriage and divorce under Ethiopian family law?",
    color: "from-rose-500/20 to-pink-500/5",
    iconColor: "text-rose-400",
    iconBg: "bg-rose-500/10 group-hover:bg-rose-500",
  },
  {
    icon: Briefcase,
    label: "Employment Law",
    description: "Employee rights and termination rules",
    query: "What are the key provisions of Ethiopian labor law regarding employee rights and termination?",
    color: "from-amber-500/20 to-yellow-500/5",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10 group-hover:bg-amber-500",
  },
  {
    icon: Gavel,
    label: "Criminal Procedure",
    description: "From arrest to trial in Ethiopia",
    query: "How does the criminal justice process work in Ethiopia from arrest to trial?",
    color: "from-red-500/20 to-orange-500/5",
    iconColor: "text-red-400",
    iconBg: "bg-red-500/10 group-hover:bg-red-500",
  },
  {
    icon: Landmark,
    label: "Property Rights",
    description: "Land ownership and property law",
    query: "What are the land ownership and property rights laws in Ethiopia?",
    color: "from-emerald-500/20 to-green-500/5",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10 group-hover:bg-emerald-500",
  },
]

const stats = [
  { label: "Laws Indexed", value: "500+" },
  { label: "Legal Topics", value: "80+" },
  { label: "Languages", value: "EN / AM" },
]

interface SuggestionChipsProps {
  onSelect: (query: string) => void
  disabled: boolean
}

export function SuggestionChips({ onSelect, disabled }: SuggestionChipsProps) {
  return (
    <div className="flex flex-col items-center gap-8 px-4 w-full max-w-3xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-5 text-center"
      >
        {/* Animated Logo */}
        <div className="relative">
          <div className="relative flex h-24 w-24 items-center justify-center">
            {/* Outer spinning ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-primary/20 border-dashed"
            />
            {/* Mid glow ring */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 blur-md animate-pulse" />
            {/* Inner icon container */}
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 ring-1 ring-primary/30 shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]">
              <Scale className="h-8 w-8 text-primary drop-shadow-[0_0_12px_rgba(var(--primary),0.6)]" />
            </div>
          </div>
          {/* Status badge */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-medium text-emerald-400 whitespace-nowrap">AI Online</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            LawBridge{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Legal AI
            </span>
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Your intelligent guide to Ethiopian law. Ask anything — I'll provide clear, accurate legal information instantly.
          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 divide-x divide-border/50">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center px-4 first:pl-0 last:pr-0">
              <span className="text-base font-bold text-foreground">{stat.value}</span>
              <span className="text-[10px] text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Suggestion Grid */}
      <div className="w-full">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-3 text-center text-xs font-medium text-muted-foreground/60 uppercase tracking-widest"
        >
          Quick Topics
        </motion.p>
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {suggestions.map((s, i) => (
            <motion.button
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => onSelect(s.query)}
              disabled={disabled}
              className="group relative overflow-hidden flex items-center gap-3 rounded-2xl border border-border/40 bg-card/40 p-3.5 text-left backdrop-blur-sm transition-all duration-300 hover:border-border/80 hover:bg-card/80 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
              
              {/* Icon */}
              <div className={`relative shrink-0 flex h-9 w-9 items-center justify-center rounded-xl ${s.iconBg} transition-all duration-300 group-hover:text-white group-hover:shadow-lg`}>
                <s.icon className={`h-4 w-4 ${s.iconColor} transition-colors duration-300 group-hover:text-white`} />
              </div>

              {/* Text */}
              <div className="relative flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{s.label}</p>
                <p className="text-[10px] text-muted-foreground/70 truncate">{s.description}</p>
              </div>

              {/* Arrow */}
              <ChevronRight className="relative h-3.5 w-3.5 shrink-0 text-muted-foreground/30 transition-all duration-300 group-hover:text-foreground/60 group-hover:translate-x-0.5" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bottom hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-[11px] text-muted-foreground/40 text-center"
      >
        Press <kbd className="mx-0.5 rounded border border-border/60 bg-secondary px-1.5 py-px text-[9px] font-mono">Enter</kbd> to send · <kbd className="mx-0.5 rounded border border-border/60 bg-secondary px-1.5 py-px text-[9px] font-mono">Shift+Enter</kbd> for new line
      </motion.p>
    </div>
  )
}
