"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Briefcase,
  DollarSign,
  Star,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  Users,
  MessageSquare,
  AlertCircle,
  Eye,
  Calendar,
} from "lucide-react"

const stats = [
  { label: "Total Earnings", value: "128,500 ETB", icon: DollarSign, trend: "+18% from last month", color: "text-primary" },
  { label: "Active Cases", value: "5", icon: Briefcase, trend: "+2 new this week", color: "text-sky-400" },
  { label: "Client Rating", value: "4.9", icon: Star, trend: "Based on 127 reviews", color: "text-amber-400" },
  { label: "Profile Views", value: "342", icon: Eye, trend: "+24% this month", color: "text-emerald-400" },
]

const activeCases = [
  {
    title: "Child Custody Mediation",
    client: "Meron T.",
    status: "In Progress",
    deadline: "Mar 5, 2026",
    amount: "3,500 ETB",
    priority: "high",
  },
  {
    title: "Divorce Settlement Review",
    client: "Tigist H.",
    status: "In Progress",
    deadline: "Mar 10, 2026",
    amount: "4,500 ETB",
    priority: "medium",
  },
  {
    title: "Prenuptial Agreement Draft",
    client: "Yonas G.",
    status: "Pending Review",
    deadline: "Mar 12, 2026",
    amount: "2,800 ETB",
    priority: "low",
  },
  {
    title: "Guardianship Application",
    client: "Sara B.",
    status: "In Progress",
    deadline: "Mar 15, 2026",
    amount: "3,200 ETB",
    priority: "medium",
  },
  {
    title: "Family Property Division",
    client: "Daniel A.",
    status: "Submitted",
    deadline: "Mar 1, 2026",
    amount: "5,500 ETB",
    priority: "high",
  },
]

const pendingProposals = [
  {
    title: "Adoption Case Support",
    client: "Rahel K.",
    budget: "4,000 - 6,000 ETB",
    posted: "2h ago",
    description: "Need legal assistance for international adoption process...",
  },
  {
    title: "Marriage Annulment Filing",
    client: "Berhanu M.",
    budget: "3,000 - 4,500 ETB",
    posted: "5h ago",
    description: "Seeking legal help for filing a marriage annulment...",
  },
]

const earningsData = [
  { month: "Sep", amount: 15200 },
  { month: "Oct", amount: 18500 },
  { month: "Nov", amount: 22100 },
  { month: "Dec", amount: 19800 },
  { month: "Jan", amount: 25400 },
  { month: "Feb", amount: 28500 },
]

const maxEarning = Math.max(...earningsData.map(d => d.amount))

export default function LawyerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

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
            <h1 className="text-2xl font-bold font-serif md:text-3xl">Lawyer Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Manage your cases, earnings, and client relationships.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </Button>
            <Button className="rounded-full gap-2">
              <Briefcase className="h-4 w-4" />
              Add Service
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
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
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{stat.trend}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="bg-secondary/50 h-11 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-card rounded-lg">Cases</TabsTrigger>
            <TabsTrigger value="proposals" className="data-[state=active]:bg-card rounded-lg">Proposals</TabsTrigger>
            <TabsTrigger value="earnings" className="data-[state=active]:bg-card rounded-lg">Earnings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-2"
              >
                <Card className="border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Active Cases</CardTitle>
                        <CardDescription>Cases requiring your attention</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary gap-1">
                        View All <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3">
                      {activeCases.map((c, i) => (
                        <motion.div
                          key={c.title}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
                          className="group flex items-center gap-4 rounded-xl border border-border/50 bg-secondary/30 p-4 transition-all hover:border-primary/20 hover:bg-secondary/50 cursor-pointer"
                        >
                          <div className={`flex h-2 w-2 shrink-0 rounded-full ${
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
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                    <CardDescription>Common tasks at a glance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      {[
                        { icon: MessageSquare, label: "Reply to Messages", badge: "5", href: "#" },
                        { icon: CheckCircle2, label: "Complete Deliveries", badge: "2", href: "#" },
                        { icon: Users, label: "Review New Clients", badge: "1", href: "#" },
                        { icon: AlertCircle, label: "Pending Disputes", badge: "0", href: "#" },
                      ].map((action) => (
                        <button
                          key={action.label}
                          className="flex items-center gap-3 rounded-xl border border-border/50 bg-secondary/30 p-3 text-left transition-all hover:border-primary/20 hover:bg-secondary/50"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                            <action.icon className="h-4.5 w-4.5" />
                          </div>
                          <span className="flex-1 text-sm text-foreground">{action.label}</span>
                          {parseInt(action.badge) > 0 && (
                            <Badge className="text-[10px]">{action.badge}</Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="proposals">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-4"
            >
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Available Cases</CardTitle>
                  <CardDescription>New cases matching your expertise</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    {pendingProposals.map((p, i) => (
                      <motion.div
                        key={p.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + i * 0.1 }}
                        className="rounded-xl border border-border/50 bg-secondary/30 p-5 transition-all hover:border-primary/20"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-medium text-foreground">{p.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">by {p.client} &middot; Posted {p.posted}</p>
                          </div>
                          <Badge variant="outline" className="text-primary border-primary/30 shrink-0">
                            {p.budget}
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">{p.description}</p>
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" className="rounded-full">Send Proposal</Button>
                          <Button size="sm" variant="ghost" className="rounded-full text-muted-foreground">
                            Skip
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="earnings">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-4"
            >
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Earnings Overview</CardTitle>
                      <CardDescription>Your earnings over the last 6 months</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">128,500 ETB</p>
                      <p className="text-xs text-emerald-400">+18% vs last period</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Simple bar chart */}
                  <div className="flex items-end gap-3 h-48 mt-4">
                    {earningsData.map((d, i) => (
                      <motion.div
                        key={d.month}
                        className="flex-1 flex flex-col items-center gap-2"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                        style={{ transformOrigin: "bottom" }}
                      >
                        <span className="text-xs text-muted-foreground">{(d.amount / 1000).toFixed(1)}K</span>
                        <div
                          className="w-full rounded-t-lg bg-primary/20 hover:bg-primary/40 transition-colors relative group cursor-pointer"
                          style={{ height: `${(d.amount / maxEarning) * 140}px` }}
                        >
                          <div
                            className="absolute bottom-0 left-0 right-0 rounded-t-lg bg-primary transition-all"
                            style={{ height: `${(d.amount / maxEarning) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{d.month}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Recent transactions */}
                  <div className="mt-8 border-t border-border/50 pt-6">
                    <h3 className="text-sm font-medium text-foreground mb-4">Recent Transactions</h3>
                    <div className="flex flex-col gap-3">
                      {[
                        { case: "Child Custody Mediation", client: "Meron T.", amount: "3,500 ETB", status: "Pending", date: "Feb 27" },
                        { case: "Divorce Settlement", client: "Tigist H.", amount: "4,500 ETB", status: "Completed", date: "Feb 22" },
                        { case: "Family Property Division", client: "Daniel A.", amount: "5,500 ETB", status: "Completed", date: "Feb 18" },
                      ].map((tx) => (
                        <div key={tx.case} className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{tx.case}</p>
                            <p className="text-xs text-muted-foreground">{tx.client} &middot; {tx.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-primary">{tx.amount}</p>
                            <Badge variant={tx.status === "Completed" ? "default" : "secondary"} className="text-[10px]">
                              {tx.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
