"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Loader2, AlertCircle, Clock, CheckCircle2, Lock, Star } from "lucide-react"
import { toast } from "sonner"

interface Transaction {
  id: string
  transaction_id: string
  amount: string
  commission_amount: string
  lawyer_amount: string
  status: string
  case_description: string
  client_name: string
  client_email: string
  created_at: string
  verified_at: string | null
  released_at: string | null
  case_id: string | null
  case_title: string | null
  rating: number | null
  rating_comment: string | null
}

const statusConfig = {
  pending_verification: {
    label: "Pending Verification",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: Clock,
  },
  held_in_escrow: {
    label: "Locked in Escrow",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: Lock,
  },
  released: {
    label: "Released",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    icon: CheckCircle2,
  },
  disputed: {
    label: "Disputed",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    icon: AlertCircle,
  },
}

export default function LawyerPaymentsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  useEffect(() => {
    fetchTransactions()
  }, [statusFilter])

  const fetchTransactions = async () => {
    try {
      const url = statusFilter
        ? `/api/payments/lawyer/transactions?status=${statusFilter}`
        : "/api/payments/lawyer/transactions"

      const res = await fetch(url, {
        credentials: "include",
      })

      const data = await res.json()

      if (res.ok) {
        setTransactions(data.transactions)
      } else {
        toast.error(data.error || "Failed to fetch transactions")
      }
    } catch (err) {
      console.error("Error fetching transactions:", err)
      toast.error("Failed to fetch transactions")
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter((tx) =>
    tx.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.case_description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = [
    {
      label: "Total Transactions",
      value: transactions.length.toString(),
      trend: "All time",
    },
    {
      label: "Locked",
      value: transactions.filter((t) => t.status === "held_in_escrow").length.toString(),
      trend: "In escrow",
    },
    {
      label: "Released",
      value: transactions.filter((t) => t.status === "released").length.toString(),
      trend: "Completed",
    },
  ]

  return (
    <DashboardShell role="lawyer">
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold font-serif md:text-3xl">Payment Transactions</h1>
            <p className="mt-1 text-muted-foreground">View all your payment transactions</p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{stat.trend}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client, transaction ID, or description..."
              className="pl-10 bg-secondary/50 border-border/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={statusFilter === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("")}
              className="rounded-full"
            >
              All
            </Button>
            <Button
              variant={statusFilter === "held_in_escrow" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("held_in_escrow")}
              className="rounded-full"
            >
              Locked
            </Button>
            <Button
              variant={statusFilter === "released" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("released")}
              className="rounded-full"
            >
              Released
            </Button>
          </div>
        </div>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="py-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No transactions found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredTransactions.map((tx, i) => {
                const statusInfo = statusConfig[tx.status as keyof typeof statusConfig]
                const StatusIcon = statusInfo?.icon || Clock

                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                  >
                    <Card className="border-border/50 hover:border-primary/20 transition-all">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground truncate">
                                  {tx.case_title || tx.case_description.substring(0, 50) + "..."}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Client: {tx.client_name}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Transaction ID: {tx.transaction_id}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-3">
                              <Badge className={`${statusInfo?.color} border`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusInfo?.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(tx.created_at).toLocaleDateString()}
                              </span>
                              {tx.released_at && (
                                <span className="text-xs text-green-600">
                                  Released: {new Date(tx.released_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            {tx.rating && (
                              <div className="mt-3 flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= tx.rating!
                                          ? "fill-amber-400 text-amber-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                {tx.rating_comment && (
                                  <p className="text-xs text-muted-foreground">
                                    "{tx.rating_comment}"
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Total Amount</p>
                            <p className="text-lg font-semibold text-foreground">
                              {parseFloat(tx.amount).toFixed(2)} ETB
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Commission: {parseFloat(tx.commission_amount).toFixed(2)} ETB
                            </p>
                            <p className="text-sm font-bold text-primary mt-2">
                              You receive: {parseFloat(tx.lawyer_amount).toFixed(2)} ETB
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardShell>
  )
}
