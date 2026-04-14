"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, MapPin, DollarSign, Clock, AlertCircle, Search, Filter, Plus } from "lucide-react"
import { toast } from "sonner"

const categories = [
  "Family Law",
  "Property Disputes",
  "Business Contracts",
  "Criminal Defense",
  "Employment Law",
  "Intellectual Property",
  "Immigration",
  "Tax Law",
  "Real Estate",
  "Corporate Law",
  "Other",
]

export default function CasesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [cases, setCases] = useState<any[]>([])
  const [filteredCases, setFilteredCases] = useState<any[]>([])
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)

  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    location: "",
  })

  useEffect(() => {
    fetchCases()
    fetchUser()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [cases, filters])

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (err) {
      console.error("Failed to fetch user:", err)
    }
  }

  const fetchCases = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/cases", {
        credentials: "include",
      })

      if (!res.ok) {
        setError("Failed to load cases")
        setLoading(false)
        return
      }

      const data = await res.json()
      setCases(data.cases || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = cases

    if (filters.search) {
      filtered = filtered.filter((c) =>
        c.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        c.description.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter((c) => c.category === filters.category)
    }

    if (filters.location) {
      filtered = filtered.filter((c) => c.location === filters.location)
    }

    setFilteredCases(filtered)
  }

  const handleApply = (caseId: string) => {
    if (user?.role === "lawyer") {
      router.push(`/cases/${caseId}/apply`)
    } else {
      toast.error("Only lawyers can apply for cases")
    }
  }

  const handlePostCase = () => {
    if (user?.role === "client") {
      router.push("/post-case")
    } else {
      toast.error("Only clients can post cases")
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-32 pb-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            whileHover={{ x: -4 }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Legal Cases</h1>
                <p className="text-lg text-muted-foreground">
                  Browse and apply for cases from clients in your area of expertise
                </p>
              </div>
              {user?.role === "client" && (
                <Button onClick={handlePostCase} className="gap-2 rounded-xl">
                  <Plus className="h-4 w-4" />
                  Post a Case
                </Button>
              )}
            </div>

            {/* Filters */}
            <div className="rounded-2xl bg-card border border-border/50 p-6 space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search cases..."
                      className="pl-10 h-11 bg-secondary/50 border-border/50"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Category</label>
                  <Select value={filters.category} onValueChange={(val) => setFilters({ ...filters, category: val })}>
                    <SelectTrigger className="h-11 bg-secondary/50 border-border/50">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Location</label>
                  <Input
                    placeholder="Filter by location"
                    className="h-11 bg-secondary/50 border-border/50"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex items-center gap-3 mb-8"
              >
                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </motion.div>
            )}

            {/* Cases Grid */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-48 rounded-2xl bg-secondary/50 border border-border/50 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="rounded-2xl bg-card border border-border/50 p-16 text-center">
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No cases found</h3>
                <p className="text-muted-foreground">
                  {cases.length === 0
                    ? "No cases have been posted yet"
                    : "No cases match your filters. Try adjusting your search."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCases.map((caseItem, index) => (
                  <motion.div
                    key={caseItem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-2xl bg-card border border-border/50 p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{caseItem.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{caseItem.description}</p>
                      </div>
                      <span className="ml-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium whitespace-nowrap">
                        {caseItem.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 py-4 border-y border-border/50">
                      {caseItem.budget_min && caseItem.budget_max && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Budget</p>
                            <p className="text-sm font-medium text-foreground">
                              ETB {caseItem.budget_min} - {caseItem.budget_max}
                            </p>
                          </div>
                        </div>
                      )}
                      {caseItem.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Location</p>
                            <p className="text-sm font-medium text-foreground">{caseItem.location}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Posted</p>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(caseItem.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {user?.role === "lawyer" && (
                        <Button
                          onClick={() => handleApply(caseItem.id)}
                          className="flex-1 rounded-lg"
                        >
                          Apply Now
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/cases/${caseItem.id}`)}
                        className="flex-1 rounded-lg"
                      >
                        View Details
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  )
}
