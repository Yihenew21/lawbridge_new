"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    quote: "LawBridge connected me with an amazing family lawyer in just hours. The entire process was transparent and the escrow system gave me peace of mind.",
    name: "Meron Tadesse",
    role: "Client",
    location: "Addis Ababa",
    rating: 5,
    initials: "MT",
  },
  {
    quote: "As a lawyer, this platform has completely transformed how I find clients. The verification system builds real trust and I get paid promptly every time.",
    name: "Yonas Girma",
    role: "Lawyer",
    location: "Bahir Dar",
    rating: 5,
    initials: "YG",
  },
  {
    quote: "I needed help with a property dispute and was worried about finding a reliable lawyer. LawBridge made it so easy and affordable. Highly recommend!",
    name: "Tigist Haile",
    role: "Client",
    location: "Hawassa",
    rating: 5,
    initials: "TH",
  },
]

export function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="testimonials" className="relative py-32 bg-secondary/30" ref={ref}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-sm font-medium uppercase tracking-widest text-primary">
            Testimonials
          </span>
          <h2 className="mt-4 font-serif text-4xl font-bold md:text-5xl text-balance">
            What Our Users Say
          </h2>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 transition-all duration-300 hover:border-primary/20"
            >
              <Quote className="h-8 w-8 text-primary/20 mb-4" />
              
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>

              <p className="text-foreground/90 leading-relaxed text-sm">
                {'"'}{t.quote}{'"'}
              </p>

              <div className="mt-6 flex items-center gap-3 border-t border-border/50 pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role} &middot; {t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
