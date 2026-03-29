"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Filter, Clock, CheckCircle2, AlertCircle, Eye } from "lucide-react"
import Link from "next/link"

export default function LawyerCasesPage() {
  const [cases, setCases] = useState<any[]>([])
  const [filteredCases, setFilteredCases] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCases()
  }, [])

  useEffect(() => {
    filterCases()
  }, [search, status, cases])

  const fetchCases = async () => {
    try {
      const res = await fetch("/api/lawyer/cases", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setCases(data.cases || [])
      }
    } catch (err) {
      console.error("Failed to fetch cases:", err)
    } finally {
      setLoading(false)
    }
  }

  const filterCases = () => {
    let filtered = cases

    if (status !== "all") {
      filtered = filtered.filter(c => c.application_status === status)
    }

    if (search) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFilteredCases(filtered)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-400" />
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      default:
        return null
    }
  }

  return (
    <DashboardShell role="lawyer">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold font-serif md:text-3xl">My Cases</h1>
            <p className="mt-1 text-muted-foreground">Cases you've applied for or accepted</p>
          </div>
          <Link href="/cases">
            <Button className="rounded-full gap-2">
              <Plus className="h-4 w-4" />
              Browse More
            </Button>
          </Link>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cases..."
              className="pl-10 h-10 bg-secondary/50 border-border/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Tabs value={status} onValueChange={setStatus} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="rejected" className="hidden sm:inline-flex">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Cases List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 space-y-3"
        >
          {loading ? (
            <div className="h-32 bg-secondary/50 rounded-lg animate-pulse" />
          ) : filteredCases.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-muted-foreground">No cases found</p>
                <Link href="/cases">
                  <Button size="sm" className="mt-4">Browse Available Cases</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredCases.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
              >
                <Card className="border-border/50 bg-card hover:border-primary/20 transition-all cursor-pointer"
                  onClick={() => window.location.href = `/cases/${c.id}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground text-sm">{c.title}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-[10px]">{c.category}</Badge>
                          <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                          <span>{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary">{c.bid_amount} ETB</p>
                          <div className="flex items-center gap-1 mt-1">
                            {getStatusIcon(c.application_status)}
                            <span className="text-xs text-muted-foreground capitalize">{c.application_status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </DashboardShell>
  )
}
