"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="relative py-32" ref={ref}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-12 md:p-20 text-center"
        >
          {/* Background glow */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
            <div className="absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-primary/5 blur-2xl" />
          </div>
          
          <div className="relative z-10">
            <h2 className="font-serif text-4xl font-bold md:text-5xl lg:text-6xl text-balance">
              Ready to Get Started?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
              Join thousands of Ethiopians who trust LawBridge for their legal needs. 
              Your first consultation is just a click away.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="group rounded-full px-8 text-base font-semibold h-12">
                  Create Free Account
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/assistant">
                <Button
                  variant="outline"
                  size="lg"
                  className="group rounded-full px-8 text-base h-12 border-primary/30 bg-primary/5 hover:bg-primary/10 text-foreground"
                >
                  <Sparkles className="mr-1.5 h-4 w-4 text-primary" />
                  Try AI Legal Assistant
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
