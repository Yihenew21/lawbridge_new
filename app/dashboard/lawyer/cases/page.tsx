"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Clock, CheckCircle2, AlertCircle } from "lucide-react"

const allCases = [
  {
    id: 1,
    title: "Child Custody Mediation",
    client: "Meron T.",
    status: "In Progress",
    deadline: "Mar 5, 2026",
    amount: "3,500 ETB",
    priority: "high",
    progress: 75,
  },
  {
    id: 2,
    title: "Divorce Settlement Review",
    client: "Tigist H.",
    status: "In Progress",
    deadline: "Mar 10, 2026",
    amount: "4,500 ETB",
    priority: "medium",
    progress: 60,
  },
  {
    id: 3,
    title: "Prenuptial Agreement Draft",
    client: "Yonas G.",
    status: "Pending Review",
    deadline: "Mar 12, 2026",
    amount: "2,800 ETB",
    priority: "low",
    progress: 40,
  },
  {
    id: 4,
    title: "Guardianship Application",
    client: "Sara B.",
    status: "In Progress",
    deadline: "Mar 15, 2026",
    amount: "3,200 ETB",
    priority: "medium",
    progress: 50,
  },
  {
    id: 5,
    title: "Family Property Division",
    client: "Daniel A.",
    status: "Submitted",
    deadline: "Mar 1, 2026",
    amount: "5,500 ETB",
    priority: "high",
    progress: 90,
  },
]

export default function LawyerCasesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeStatus, setActiveStatus] = useState("all")

  const filteredCases = allCases.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.client.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = activeStatus === "all" || c.status === activeStatus
    return matchesSearch && matchesStatus
  })

  return (
    <DashboardShell role="lawyer">
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold font-serif md:text-3xl">My Cases</h1>
            <p className="mt-1 text-muted-foreground">Manage and track all your active cases.</p>
          </div>
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
              placeholder="Search cases or clients..."
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
              <TabsTrigger value="Pending Review" className="data-[state=active]:bg-card rounded-lg">Pending Review</TabsTrigger>
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
                    className="group flex items-center gap-4 rounded-xl border border-border/50 bg-secondary/30 p-4 transition-all hover:border-primary/20 hover:bg-secondary/50 cursor-pointer"
                  >
                    <div className={`flex h-3 w-3 shrink-0 rounded-full ${
                      c.priority === "high" ? "bg-destructive" : c.priority === "medium" ? "bg-amber-400" : "bg-emerald-400"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-medium text-foreground">{c.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{c.client}</p>
                        </div>
                        <Badge
                          variant={c.status === "Submitted" ? "default" : c.status === "Pending Review" ? "outline" : "secondary"}
                          className="shrink-0 text-[10px]"
                        >
                          {c.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <p className="text-sm font-medium text-primary">{c.amount}</p>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                        <Clock className="h-3 w-3" /> {c.deadline}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {filteredCases.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground/30" />
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
