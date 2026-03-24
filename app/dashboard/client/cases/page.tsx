"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FileText, Search, Plus, Eye, Trash2 } from "lucide-react"
import Link from "next/link"

export default function ClientCasesPage() {
  const [cases, setCases] = useState<any[]>([])
  const [filteredCases, setFilteredCases] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCases()
  }, [])

  useEffect(() => {
    const filtered = cases.filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
    )
    setFilteredCases(filtered)
  }, [search, cases])

  const fetchCases = async () => {
    try {
      const res = await fetch("/api/client/cases", { credentials: "include" })
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

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    e.preventDefault()
    if (!window.confirm("Are you sure you want to delete this case? This action cannot be undone.")) {
      return
    }

    try {
      const res = await fetch(`/api/cases/details?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (res.ok) {
        setCases(cases.filter(c => c.id !== id))
      }
    } catch (err) {
      console.error("Failed to delete case:", err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "default"
      case "closed":
        return "secondary"
      case "pending":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Open"
      case "closed":
        return "Closed"
      case "pending":
        return "Pending"
      default:
        return status
    }
  }

  return (
    <DashboardShell role="client">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold font-serif md:text-3xl">My Cases</h1>
            <p className="mt-1 text-muted-foreground">Manage and track all your legal cases.</p>
          </div>
          <Link href="/post-case">
            <Button className="rounded-full gap-2">
              <Plus className="h-4 w-4" />
              Post a Case
            </Button>
          </Link>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Cases Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          {loading ? (
            <div className="h-64 bg-secondary/50 rounded-lg animate-pulse" />
          ) : filteredCases.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="pt-16 pb-16 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No cases found</p>
                <Link href="/post-case">
                  <Button size="sm" className="mt-4">Post a New Case</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredCases.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <Card className="border-border/50 hover:border-primary/20 transition-colors cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{c.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{c.description?.substring(0, 100)}...</p>
                            <div className="flex items-center gap-2 mt-3">
                              <Badge variant="secondary" className="text-xs">{c.category}</Badge>
                              <Badge variant={getStatusColor(c.status)} className="text-xs">
                                {getStatusLabel(c.status)}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-primary">
                              {c.budget_max ? `ETB ${c.budget_max}` : "TBD"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {c.application_count || 0} applications
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <span className="text-xs text-muted-foreground">
                            Posted {new Date(c.created_at).toLocaleDateString()}
                          </span>
                          <div className="flex gap-2">
                            <Link href={`/cases/${c.id}`} onClick={(e) => e.stopPropagation()}>
                              <Button variant="outline" size="sm" className="gap-2">
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                            </Link>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-2"
                              onClick={(e) => handleDelete(e, c.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardShell>
  )
}
