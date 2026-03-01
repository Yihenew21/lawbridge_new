"use client"

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
  TrendingUp,
  MessageSquare,
  CreditCard,
  Star,
} from "lucide-react"
import Link from "next/link"

const stats = [
  { label: "Active Cases", value: "3", icon: FileText, trend: "+1 this week", color: "text-sky-400" },
  { label: "Pending Review", value: "1", icon: Clock, trend: "Awaiting approval", color: "text-amber-400" },
  { label: "Completed", value: "12", icon: CheckCircle2, trend: "+2 this month", color: "text-emerald-400" },
  { label: "Total Spent", value: "45,200 ETB", icon: CreditCard, trend: "This quarter", color: "text-primary" },
]

const activeCases = [
  {
    title: "Property Boundary Dispute",
    lawyer: "Solomon Bekele",
    category: "Property Disputes",
    status: "In Progress",
    progress: 65,
    date: "Feb 15, 2026",
    amount: "3,800 ETB",
  },
  {
    title: "Business Partnership Agreement",
    lawyer: "Dawit Mengistu",
    category: "Business Contracts",
    status: "In Progress",
    progress: 40,
    date: "Feb 20, 2026",
    amount: "5,000 ETB",
  },
  {
    title: "Child Custody Mediation",
    lawyer: "Abeba Tesfaye",
    category: "Family Law",
    status: "Submitted",
    progress: 90,
    date: "Feb 10, 2026",
    amount: "3,500 ETB",
  },
]

const recentMessages = [
  { from: "Abeba Tesfaye", message: "I have submitted the final custody agreement for your review.", time: "2h ago", unread: true },
  { from: "Dawit Mengistu", message: "Let's schedule a call to discuss the partnership terms.", time: "5h ago", unread: true },
  { from: "Solomon Bekele", message: "The land survey results are in. Everything looks good.", time: "1d ago", unread: false },
]

export default function ClientDashboard() {
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
          <div>
            <h1 className="text-2xl font-bold font-serif md:text-3xl">Welcome back, Meron</h1>
            <p className="mt-1 text-muted-foreground">Here{"'"}s an overview of your legal cases.</p>
          </div>
          <Link href="/lawyers">
            <Button className="rounded-full gap-2">
              <Plus className="h-4 w-4" />
              New Case
            </Button>
          </Link>
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
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
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
                    <CardTitle className="text-lg">Active Cases</CardTitle>
                    <CardDescription>Your ongoing legal matters</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary gap-1">
                    View All <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {activeCases.map((c, i) => (
                    <motion.div
                      key={c.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                      className="group flex flex-col gap-3 rounded-xl border border-border/50 bg-secondary/30 p-4 transition-all hover:border-primary/20 hover:bg-secondary/50 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="font-medium text-foreground text-sm">{c.title}</h3>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>{c.lawyer}</span>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {c.category}
                            </Badge>
                          </div>
                        </div>
                        <Badge
                          variant={c.status === "Submitted" ? "default" : "secondary"}
                          className="shrink-0 text-xs"
                        >
                          {c.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={c.progress} className="flex-1 h-1.5" />
                        <span className="text-xs text-muted-foreground">{c.progress}%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{c.date}</span>
                        <span className="font-medium text-primary">{c.amount}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Messages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Messages</CardTitle>
                    <CardDescription>Recent conversations</CardDescription>
                  </div>
                  <Badge className="text-[10px]">3 new</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {recentMessages.map((msg, i) => (
                    <motion.div
                      key={msg.from}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                      className="group flex gap-3 rounded-xl border border-border/50 bg-secondary/30 p-3 transition-all hover:border-primary/20 hover:bg-secondary/50 cursor-pointer"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {msg.from.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{msg.from}</p>
                          <span className="text-[10px] text-muted-foreground shrink-0">{msg.time}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{msg.message}</p>
                      </div>
                      {msg.unread && (
                        <div className="flex h-2 w-2 shrink-0 rounded-full bg-primary mt-1.5" />
                      )}
                    </motion.div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-3 text-primary gap-1">
                  <MessageSquare className="h-3.5 w-3.5" /> View All Messages
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardShell>
  )
}
