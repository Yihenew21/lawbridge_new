"use client"

import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Filter, TrendingUp } from "lucide-react"

const earningsData = [
  { month: "Sep", amount: 15200 },
  { month: "Oct", amount: 18500 },
  { month: "Nov", amount: 22100 },
  { month: "Dec", amount: 19800 },
  { month: "Jan", amount: 25400 },
  { month: "Feb", amount: 28500 },
]

const transactions = [
  {
    id: 1,
    case: "Child Custody Mediation",
    client: "Meron T.",
    amount: "3,500 ETB",
    status: "Pending",
    date: "Feb 27, 2026",
  },
  {
    id: 2,
    case: "Divorce Settlement Review",
    client: "Tigist H.",
    amount: "4,500 ETB",
    status: "Completed",
    date: "Feb 22, 2026",
  },
  {
    id: 3,
    case: "Family Property Division",
    client: "Daniel A.",
    amount: "5,500 ETB",
    status: "Completed",
    date: "Feb 18, 2026",
  },
  {
    id: 4,
    case: "Guardianship Application",
    client: "Sara B.",
    amount: "3,200 ETB",
    status: "Completed",
    date: "Feb 15, 2026",
  },
  {
    id: 5,
    case: "Prenuptial Agreement Draft",
    client: "Yonas G.",
    amount: "2,800 ETB",
    status: "Pending",
    date: "Feb 10, 2026",
  },
]

const maxEarning = Math.max(...earningsData.map(d => d.amount))

export default function LawyerEarningsPage() {
  return (
    <DashboardShell role="lawyer">
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold font-serif md:text-3xl">Earnings</h1>
            <p className="mt-1 text-muted-foreground">View your detailed earnings and transaction history.</p>
          </div>
          <Button variant="outline" className="rounded-full gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Total Earnings (6 months)", value: "128,500 ETB" },
            { label: "Pending Payments", value: "6,300 ETB" },
            { label: "Average Monthly", value: "21,417 ETB" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Earnings Trend</CardTitle>
              <CardDescription>Your earnings over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </motion.div>

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Transactions</CardTitle>
                  <CardDescription>All your case earnings and payments</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="rounded-full gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {transactions.map((tx, i) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-4 transition-all hover:border-primary/20 hover:bg-secondary/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.case}</p>
                      <p className="text-xs text-muted-foreground">{tx.client} · {tx.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{tx.amount}</p>
                      <Badge variant={tx.status === "Completed" ? "default" : "secondary"} className="text-[10px]">
                        {tx.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardShell>
  )
}
