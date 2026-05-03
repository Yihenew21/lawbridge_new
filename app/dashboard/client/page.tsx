"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  MessageSquare,
  CreditCard,
  Star,
  Users,
  Video,
} from "lucide-react"
import Link from "next/link"

export default function ClientDashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [cases, setCases] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [userRes, statsRes] = await Promise.all([
        fetch("/api/auth/me", { credentials: "include" }),
        fetch("/api/client/stats", { credentials: "include" }),
      ])

      if (userRes.ok) {
        const userData = await userRes.json()
        setUser(userData.user)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.stats)
        setCases(statsData.recentCases || [])
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = stats ? [
    { label: "Active Cases", value: stats.activeCases, icon: FileText, color: "text-sky-400" },
    { label: "Pending Review", value: stats.pendingCases, icon: Clock, color: "text-amber-400" },
    { label: "Completed", value: stats.completedCases, icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Total Spent", value: `${Math.round(stats.totalSpent)} ETB`, icon: CreditCard, color: "text-primary" },
  ] : []

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
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold font-serif md:text-3xl">
                Welcome back, {user?.first_name || "Client"}
              </h1>
              <p className="mt-1 text-muted-foreground">Here{"'"}s your case management dashboard.</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
            >
              <Card className="border-border/50 bg-card hover:border-primary/20 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-secondary ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Active Cases */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Your Cases</CardTitle>
                    <CardDescription>Your posted cases</CardDescription>
                  </div>
                  <Link href="/dashboard/client/cases">
                    <Button variant="ghost" size="sm" className="text-primary gap-1">
                      View All <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {loading ? (
                    <div className="h-32 bg-secondary/50 rounded-lg animate-pulse" />
                  ) : cases.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No cases yet</p>
                      <Link href="/post-case">
                        <Button size="sm" className="mt-4">Post a Case</Button>
                      </Link>
                    </div>
                  ) : (
                    cases.slice(0, 3).map((c, i) => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                        className="group flex flex-col gap-3 rounded-xl border border-border/50 bg-secondary/30 p-4 transition-all hover:border-primary/20 hover:bg-secondary/50 cursor-pointer"
                        onClick={() => window.location.href = `/cases/${c.id}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="font-medium text-foreground text-sm">{c.title}</h3>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span>{c.category}</span>
                              <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {c.application_count || 0} applications
                              </Badge>
                            </div>
                          </div>
                          <Badge
                            variant={getStatusColor(c.status)}
                            className="shrink-0 text-xs"
                          >
                            {getStatusLabel(c.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{new Date(c.created_at).toLocaleDateString()}</span>
                          {c.budget_max && <span className="font-medium text-primary">ETB {c.budget_max}</span>}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <Link href="/post-case" className="w-full">
                    <Button variant="outline" size="sm" className="w-full gap-2 justify-start">
                      <Plus className="h-4 w-4" />
                      Post a Case
                    </Button>
                  </Link>
                  <Link href="/lawyers" className="w-full">
                    <Button variant="outline" size="sm" className="w-full gap-2 justify-start hover:text-primary transition-colors">
                      <Users className="h-4 w-4" />
                      Browse Lawyers
                    </Button>
                  </Link>
                  <Link href="/insights" className="w-full">
                    <Button variant="outline" size="sm" className="w-full gap-2 justify-start hover:text-primary transition-colors">
                      <Video className="h-4 w-4" />
                      Watch Insights / Vlogs
                    </Button>
                  </Link>
                  <Link href="/dashboard/client/messages" className="w-full">
                    <Button variant="outline" size="sm" className="w-full gap-2 justify-start">
                      <MessageSquare className="h-4 w-4" />
                      Messages
                    </Button>
                  </Link>
                  <Link href="/dashboard/client/payments" className="w-full">
                    <Button variant="outline" size="sm" className="w-full gap-2 justify-start">
                      <CreditCard className="h-4 w-4" />
                      Payments
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardShell>
  )
}
