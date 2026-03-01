"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Shield, ArrowRight } from "lucide-react"

const lawyers = [
  {
    name: "Abeba Tesfaye",
    specialty: "Family Law",
    location: "Addis Ababa",
    rating: 4.9,
    reviews: 127,
    rate: "3,500 ETB",
    verified: true,
    initials: "AT",
  },
  {
    name: "Dawit Mengistu",
    specialty: "Business Contracts",
    location: "Addis Ababa",
    rating: 4.8,
    reviews: 98,
    rate: "5,000 ETB",
    verified: true,
    initials: "DM",
  },
  {
    name: "Hana Alemayehu",
    specialty: "Criminal Defense",
    location: "Bahir Dar",
    rating: 5.0,
    reviews: 64,
    rate: "4,200 ETB",
    verified: true,
    initials: "HA",
  },
  {
    name: "Solomon Bekele",
    specialty: "Property Disputes",
    location: "Hawassa",
    rating: 4.7,
    reviews: 83,
    rate: "3,800 ETB",
    verified: true,
    initials: "SB",
  },
]

export function LawyersSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="lawyers" className="relative py-32" ref={ref}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left"
        >
          <div>
            <span className="text-sm font-medium uppercase tracking-widest text-primary">
              Top Professionals
            </span>
            <h2 className="mt-4 font-serif text-4xl font-bold md:text-5xl text-balance">
              Featured Lawyers
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground leading-relaxed">
              Work with Ethiopia{"'"}s most trusted and highly rated legal professionals.
            </p>
          </div>
          <Link href="/lawyers">
            <Button variant="outline" className="group rounded-full">
              View All Lawyers
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {lawyers.map((lawyer, i) => (
            <motion.div
              key={lawyer.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/30"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-bold font-serif">
                    {lawyer.initials}
                  </div>
                  {lawyer.verified && (
                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Shield className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>

                <h3 className="mt-4 text-base font-semibold text-foreground">{lawyer.name}</h3>
                <Badge variant="secondary" className="mt-2 text-xs">
                  {lawyer.specialty}
                </Badge>

                <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {lawyer.location}
                </div>

                <div className="mt-3 flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="text-sm font-medium text-foreground">{lawyer.rating}</span>
                  <span className="text-xs text-muted-foreground">({lawyer.reviews})</span>
                </div>

                <div className="mt-4 w-full border-t border-border/50 pt-4">
                  <span className="text-xs text-muted-foreground">Starting from</span>
                  <p className="text-lg font-bold text-primary">{lawyer.rate}</p>
                </div>

                <Link href="/lawyers" className="mt-4 w-full">
                  <Button variant="outline" className="w-full rounded-full text-sm" size="sm">
                    View Profile
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
