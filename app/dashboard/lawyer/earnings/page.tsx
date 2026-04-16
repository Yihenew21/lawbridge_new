"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, TrendingUp, DollarSign, Lock, Unlock, Download } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface EarningsSummary {
  pending_earnings: string
  available_balance: string
  total_withdrawn: string
  total_earnings: string
  pending_count: number
  released_count: number
}

interface MonthlyEarning {
  month: string
  month_key: string
  amount: string
}

export default function LawyerEarningsPage() {
  const router = useRouter()
  const [summary, setSummary] = useState<EarningsSummary | null>(null)
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarning[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    try {
      const res = await fetch("/api/payments/lawyer/earnings", {
        credentials: "include",
      })

      const data = await res.json()

      if (res.ok) {
        setSummary(data.summary)
        setMonthlyEarnings(data.monthly_earnings)
      } else {
        toast.error(data.error || "Failed to fetch earnings")
      }
    } catch (err) {
      console.error("Error fetching earnings:", err)
      toast.error("Failed to fetch earnings")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardShell role="lawyer">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardShell>
    )
  }

  const maxEarning = Math.max(...monthlyEarnings.map(d => parseFloat(d.amount)), 1)

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
            <p className="mt-1 text-muted-foreground">View your detailed earnings and transaction history</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/lawyer/withdraw">
              <Button className="rounded-full gap-2">
                <DollarSign className="h-4 w-4" />
                Withdraw
              </Button>
            </Link>
            <Button variant="outline" className="rounded-full gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Pending Earnings",
              value: `${parseFloat(summary?.pending_earnings || "0").toFixed(2)} ETB`,
              icon: Lock,
              color: "text-amber-400",
              description: "Locked in escrow",
            },
            {
              label: "Available Balance",
              value: `${parseFloat(summary?.available_balance || "0").toFixed(2)} ETB`,
              icon: Unlock,
              color: "text-green-400",
              description: "Ready to withdraw",
            },
            {
              label: "Total Withdrawn",
              value: `${parseFloat(summary?.total_withdrawn || "0").toFixed(2)} ETB`,
              icon: DollarSign,
              color: "text-blue-400",
              description: "All time",
            },
            {
              label: "Total Earnings",
              value: `${parseFloat(summary?.total_earnings || "0").toFixed(2)} ETB`,
              icon: TrendingUp,
              color: "text-primary",
              description: "All time",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-secondary ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{stat.description}</p>
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
              {monthlyEarnings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No earnings data available yet
                </div>
              ) : (
                <div className="flex items-end gap-3 h-48 mt-4">
                  {monthlyEarnings.map((d, i) => {
                    const amount = parseFloat(d.amount)
                    const heightPercent = (amount / maxEarning) * 100

                    return (
                      <motion.div
                        key={d.month_key}
                        className="flex-1 flex flex-col items-center gap-2"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                        style={{ transformOrigin: "bottom" }}
                      >
                        <span className="text-xs text-muted-foreground">
                          {(amount / 1000).toFixed(1)}K
                        </span>
                        <div
                          className="w-full rounded-t-lg bg-primary/20 hover:bg-primary/40 transition-colors relative group cursor-pointer"
                          style={{ height: `${Math.max(heightPercent, 5)}%` }}
                        >
                          <div
                            className="absolute bottom-0 left-0 right-0 rounded-t-lg bg-primary transition-all"
                            style={{ height: "100%" }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{d.month}</span>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Card
            className="border-border/50 hover:border-primary/20 transition-all cursor-pointer"
            onClick={() => router.push("/dashboard/lawyer/payments")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Cases</p>
                  <p className="text-3xl font-bold text-amber-500 mt-2">{summary?.pending_count || 0}</p>
                  <p className="text-xs text-muted-foreground mt-2">Awaiting completion</p>
                </div>
                <Lock className="h-12 w-12 text-amber-500/20" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-border/50 hover:border-primary/20 transition-all cursor-pointer"
            onClick={() => router.push("/dashboard/lawyer/payments")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Cases</p>
                  <p className="text-3xl font-bold text-green-500 mt-2">{summary?.released_count || 0}</p>
                  <p className="text-xs text-muted-foreground mt-2">All time</p>
                </div>
                <TrendingUp className="h-12 w-12 text-green-500/20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardShell>
  )
}
