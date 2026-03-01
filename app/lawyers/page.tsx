"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Star,
  MapPin,
  Shield,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  MessageSquare,
  Clock,
  Briefcase,
} from "lucide-react"

const allLawyers = [
  { name: "Abeba Tesfaye", specialty: "Family Law", location: "Addis Ababa", rating: 4.9, reviews: 127, rate: "3,500", bio: "10+ years in family law, specializing in divorce and child custody cases.", initials: "AT", responseTime: "< 1 hour", casesWon: 95 },
  { name: "Dawit Mengistu", specialty: "Business Contracts", location: "Addis Ababa", rating: 4.8, reviews: 98, rate: "5,000", bio: "Corporate law expert with experience in international business contracts.", initials: "DM", responseTime: "< 2 hours", casesWon: 87 },
  { name: "Hana Alemayehu", specialty: "Criminal Defense", location: "Bahir Dar", rating: 5.0, reviews: 64, rate: "4,200", bio: "Former public defender with an impeccable track record in criminal cases.", initials: "HA", responseTime: "< 30 min", casesWon: 92 },
  { name: "Solomon Bekele", specialty: "Property Disputes", location: "Hawassa", rating: 4.7, reviews: 83, rate: "3,800", bio: "Land and property specialist with deep knowledge of Ethiopian land law.", initials: "SB", responseTime: "< 1 hour", casesWon: 88 },
  { name: "Kidist Worku", specialty: "Employment Law", location: "Dire Dawa", rating: 4.6, reviews: 45, rate: "3,200", bio: "Advocate for worker rights with expertise in labor dispute resolution.", initials: "KW", responseTime: "< 3 hours", casesWon: 78 },
  { name: "Bereket Tadesse", specialty: "Family Law", location: "Addis Ababa", rating: 4.9, reviews: 156, rate: "4,500", bio: "Renowned family law practitioner specializing in adoption and guardianship.", initials: "BT", responseTime: "< 1 hour", casesWon: 94 },
  { name: "Rahel Gebremedhin", specialty: "Business Contracts", location: "Mekelle", rating: 4.5, reviews: 38, rate: "3,000", bio: "Startup-focused lawyer helping new businesses navigate Ethiopian commercial law.", initials: "RG", responseTime: "< 2 hours", casesWon: 82 },
  { name: "Yared Alemu", specialty: "Criminal Defense", location: "Addis Ababa", rating: 4.8, reviews: 112, rate: "6,000", bio: "High-profile criminal defense attorney with 15+ years of courtroom experience.", initials: "YA", responseTime: "< 1 hour", casesWon: 91 },
]

const categories = ["All", "Family Law", "Business Contracts", "Criminal Defense", "Property Disputes", "Employment Law"]
const locations = ["All Locations", "Addis Ababa", "Bahir Dar", "Hawassa", "Dire Dawa", "Mekelle"]

export default function LawyersPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [location, setLocation] = useState("All Locations")
  const [sortBy, setSortBy] = useState("rating")

  const filtered = allLawyers
    .filter((l) => {
      const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.bio.toLowerCase().includes(search.toLowerCase())
      const matchCategory = category === "All" || l.specialty === category
      const matchLocation = location === "All Locations" || l.location === location
      return matchSearch && matchCategory && matchLocation
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating
      if (sortBy === "reviews") return b.reviews - a.reviews
      if (sortBy === "price-low") return parseInt(a.rate.replace(",", "")) - parseInt(b.rate.replace(",", ""))
      if (sortBy === "price-high") return parseInt(b.rate.replace(",", "")) - parseInt(a.rate.replace(",", ""))
      return 0
    })

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-8 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-serif text-4xl font-bold md:text-5xl text-balance">
              Find Your Lawyer
            </h1>
            <p className="mt-3 text-muted-foreground text-lg max-w-2xl">
              Browse through our verified legal professionals and find the perfect match for your case.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 flex flex-col gap-4 rounded-2xl border border-border/50 bg-card p-4 lg:flex-row lg:items-center"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lawyers by name or expertise..."
                className="pl-10 bg-secondary/50 border-border/50 h-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px] bg-secondary/50 border-border/50 h-11">
                  <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-[180px] bg-secondary/50 border-border/50 h-11">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-secondary/50 border-border/50 h-11">
                  <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          <p className="mt-4 text-sm text-muted-foreground">
            Showing {filtered.length} lawyer{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {filtered.map((lawyer, i) => (
                <motion.div
                  key={lawyer.name}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/30"
                >
                  <div className="flex gap-5">
                    <div className="relative shrink-0">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary text-lg font-bold font-serif">
                        {lawyer.initials}
                      </div>
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Shield className="h-3.5 w-3.5" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-semibold text-foreground">{lawyer.name}</h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="text-xs">{lawyer.specialty}</Badge>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {lawyer.location}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-lg font-bold text-primary">{lawyer.rate}</span>
                          <p className="text-xs text-muted-foreground">ETB / session</p>
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-2">{lawyer.bio}</p>

                      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                          <span className="font-medium text-foreground">{lawyer.rating}</span>
                          ({lawyer.reviews} reviews)
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {lawyer.responseTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" />
                          {lawyer.casesWon}% success
                        </span>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button size="sm" className="rounded-full flex-1 sm:flex-none">
                          <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                          Book Consultation
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-full">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
                <Search className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No lawyers found</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                Try adjusting your search filters or browse all available lawyers.
              </p>
              <Button
                variant="outline"
                className="mt-4 rounded-full"
                onClick={() => { setSearch(""); setCategory("All"); setLocation("All Locations") }}
              >
                Clear Filters
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
