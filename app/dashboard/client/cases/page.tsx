"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Search, Plus, Filter, Clock, CheckCircle2, AlertCircle, Eye } from "lucide-react"

const allCases = [
  {
    id: 1,
    title: "Property Boundary Dispute",
    lawyer: "Solomon Bekele",
    category: "Property Disputes",
    status: "In Progress",
    progress: 65,
    date: "Feb 15, 2026",
    amount: "3,800 ETB",
    lastUpdate: "2 hours ago",
  },
  {
    id: 2,
    title: "Business Partnership Agreement",
    lawyer: "Dawit Mengistu",
    category: "Business Contracts",
    status: "In Progress",
    progress: 40,
    date: "Feb 20, 2026",
    amount: "5,000 ETB",
    lastUpdate: "1 day ago",
  },
  {
    id: 3,
    title: "Child Custody Mediation",
    lawyer: "Abeba Tesfaye",
    category: "Family Law",
    status: "Submitted",
    progress: 90,
    date: "Feb 10, 2026",
    amount: "3,500 ETB",
    lastUpdate: "3 hours ago",
  },
  {
    id: 4,
    title: "Employment Dispute Resolution",
    lawyer: "Tadese Worku",
    category: "Employment Law",
    status: "Pending Review",
    progress: 30,
    date: "Feb 25, 2026",
    amount: "2,500 ETB",
    lastUpdate: "5 days ago",
  },
  {
    id: 5,
    title: "Will & Testament Drafting",
    lawyer: "Almaz Kebede",
    category: "Legal Documents",
    status: "Completed",
    progress: 100,
    date: "Jan 15, 2026",
    amount: "1,800 ETB",
    lastUpdate: "Completed",
  },
]

export default function ClientCasesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeStatus, setActiveStatus] = useState("all")

  const filteredCases = allCases.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.lawyer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = activeStatus === "all" || c.status === activeStatus
    return matchesSearch && matchesStatus
  })

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
          <Button className="rounded-full gap-2">
            <Plus className="h-4 w-4" />
            New Case
          </Button>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cases or lawyers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-border/50"
            />
          </div>
          <Button variant="outline" className="rounded-full gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </motion.div>

        {/* Status Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Tabs value={activeStatus} onValueChange={setActiveStatus}>
            <TabsList className="bg-secondary/50 h-11 p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-card rounded-lg">All Cases ({allCases.length})</TabsTrigger>
              <TabsTrigger value="In Progress" className="data-[state=active]:bg-card rounded-lg">In Progress</TabsTrigger>
              <TabsTrigger value="Submitted" className="data-[state=active]:bg-card rounded-lg">Submitted</TabsTrigger>
              <TabsTrigger value="Completed" className="data-[state=active]:bg-card rounded-lg">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Cases List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                {filteredCases.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="group flex flex-col gap-4 rounded-xl border border-border/50 bg-secondary/30 p-5 transition-all hover:border-primary/20 hover:bg-secondary/50 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-foreground text-base">{c.title}</h3>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span>{c.lawyer}</span>
                          <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {c.category}
                          </Badge>
                        </div>
                      </div>
                      <Badge
                        variant={c.status === "Completed" ? "default" : c.status === "Submitted" ? "outline" : "secondary"}
                        className="shrink-0 text-xs"
                      >
                        {c.status}
                      </Badge>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs font-medium text-foreground">{c.progress}%</span>
                      </div>
                      <Progress value={c.progress} className="h-1.5" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{c.date}</span>
                      <span className="font-medium text-primary">{c.amount}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              {filteredCases.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No cases found. Try adjusting your search.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardShell>
  )
}
