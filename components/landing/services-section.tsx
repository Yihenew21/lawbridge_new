"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  Building2,
  Briefcase,
  ShieldAlert,
  FileText,
  Home,
  ArrowUpRight,
} from "lucide-react"

const services = [
  {
    icon: Heart,
    title: "Family Law",
    description: "Divorce, child custody, adoption, and family dispute resolution with compassionate legal experts.",
    cases: "2.4K+ cases",
    color: "from-rose-500/10 to-rose-500/5",
    iconColor: "text-rose-400",
  },
  {
    icon: Home,
    title: "Property Disputes",
    description: "Land ownership conflicts, boundary disputes, and real estate transaction support.",
    cases: "1.8K+ cases",
    color: "from-emerald-500/10 to-emerald-500/5",
    iconColor: "text-emerald-400",
  },
  {
    icon: Building2,
    title: "Business Contracts",
    description: "Contract drafting, review, negotiation, and corporate legal advisory services.",
    cases: "3.1K+ cases",
    color: "from-sky-500/10 to-sky-500/5",
    iconColor: "text-sky-400",
  },
  {
    icon: ShieldAlert,
    title: "Criminal Defense",
    description: "Expert defense representation across all criminal matters and court proceedings.",
    cases: "1.2K+ cases",
    color: "from-amber-500/10 to-amber-500/5",
    iconColor: "text-amber-400",
  },
  {
    icon: Briefcase,
    title: "Employment Law",
    description: "Workplace disputes, wrongful termination, contract negotiation, and labor rights.",
    cases: "980+ cases",
    color: "from-primary/10 to-primary/5",
    iconColor: "text-primary",
  },
  {
    icon: FileText,
    title: "Legal Documents",
    description: "Will drafting, power of attorney, notarization, and legal documentation services.",
    cases: "4.5K+ cases",
    color: "from-cyan-500/10 to-cyan-500/5",
    iconColor: "text-cyan-400",
  },
]

export function ServicesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section id="services" className="relative py-32 bg-secondary/30" ref={ref}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-sm font-medium uppercase tracking-widest text-primary">
            Legal Categories
          </span>
          <h2 className="mt-4 font-serif text-4xl font-bold md:text-5xl text-balance">
            Expert Services for Every Need
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground leading-relaxed">
            Whatever legal challenge you face, our verified professionals are ready to help.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/30 cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-secondary ${service.iconColor} transition-all duration-300 group-hover:scale-110`}>
                    <service.icon className="h-6 w-6" />
                  </div>
                  <motion.div
                    animate={hoveredIndex === i ? { x: 0, opacity: 1 } : { x: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowUpRight className="h-5 w-5 text-primary" />
                  </motion.div>
                </div>

                <h3 className="mt-5 text-lg font-semibold text-foreground">{service.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                
                <div className="mt-4">
                  <Badge variant="secondary" className="text-xs">
                    {service.cases}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
