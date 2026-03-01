"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Search, MessageSquare, CreditCard, CheckCircle2 } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Describe Your Case",
    description: "Post your legal need with details about your case category, budget, and timeline.",
    number: "01",
  },
  {
    icon: MessageSquare,
    title: "Connect with Lawyers",
    description: "Browse verified lawyer profiles or receive proposals from qualified professionals.",
    number: "02",
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    description: "Pay securely through our escrow system. Funds are held safely until work is delivered.",
    number: "03",
  },
  {
    icon: CheckCircle2,
    title: "Get Results",
    description: "Receive your legal service, review the work, and release payment when satisfied.",
    number: "04",
  },
]

export function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="how-it-works" className="relative py-32" ref={ref}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-sm font-medium uppercase tracking-widest text-primary">
            Simple Process
          </span>
          <h2 className="mt-4 font-serif text-4xl font-bold md:text-5xl text-balance">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground leading-relaxed">
            Getting legal help has never been easier. Four simple steps to connect you with the right lawyer.
          </p>
        </motion.div>

        <div className="relative mt-20 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Connecting line */}
          <div className="absolute top-16 left-[10%] right-[10%] hidden h-px bg-border lg:block">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="h-full w-full origin-left bg-primary/30"
            />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
              className="group relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card text-primary transition-all duration-300 group-hover:border-primary/50 group-hover:bg-primary/10 group-hover:scale-110">
                  <step.icon className="h-7 w-7" />
                </div>
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
