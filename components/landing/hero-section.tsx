"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, Star, Users } from "lucide-react"

const floatingCards = [
  { icon: Shield, label: "Verified Lawyers", value: "500+", delay: 0.8 },
  { icon: Star, label: "Client Rating", value: "4.9/5", delay: 1.0 },
  { icon: Users, label: "Cases Resolved", value: "10K+", delay: 1.2 },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-primary/3 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-20">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-8 gap-2 rounded-full border-primary/30 bg-primary/5 px-4 py-1.5 text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Now serving across all Ethiopian regions
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="max-w-4xl text-balance font-serif text-5xl font-bold leading-tight tracking-tight md:text-7xl lg:text-8xl"
          >
            Justice Made{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">Accessible</span>
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="absolute bottom-2 left-0 h-3 bg-primary/20 rounded-full md:bottom-3 md:h-4"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl leading-relaxed"
          >
            Connect with verified Ethiopian lawyers in minutes. From family
            law to business contracts, get the expert legal help you need — 
            all from one secure platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          >
            <Link href="/auth/register">
              <Button size="lg" className="group rounded-full px-8 text-base font-semibold h-12">
                Find a Lawyer
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/auth/register?role=lawyer">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 text-base h-12 border-border/60 bg-secondary/50 hover:bg-secondary text-foreground"
              >
                Join as a Lawyer
              </Button>
            </Link>
          </motion.div>

          {/* Floating stat cards */}
          <div className="mt-20 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            {floatingCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: card.delay }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 transition-all hover:border-primary/30 hover:bg-card"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <card.icon className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold text-foreground">{card.value}</span>
                <span className="text-sm text-muted-foreground">{card.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
