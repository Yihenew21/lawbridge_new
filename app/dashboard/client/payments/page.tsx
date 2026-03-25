"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Download, Filter } from "lucide-react"
import Link from "next/link"

export default function ClientPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/client/payments", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setPayments(data.payments || [])
      }
    } catch (err) {
      console.error("Failed to fetch payments:", err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "pending":
        return "outline"
      case "failed":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const filteredPayments = payments.filter(p =>
    filter === "all" || p.status === filter
  )

  const totalSpent = payments
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  return (
    <DashboardShell role="client">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold font-serif md:text-3xl">Payments & Invoices</h1>
          <p className="mt-1 text-muted-foreground">View your payment history and invoices.</p>
        </motion.div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold mt-2">ETB {totalSpent.toLocaleString()}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold mt-2">{payments.length}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold mt-2">
                    ETB {payments
                      .filter(p => p.status === "pending")
                      .reduce((sum, p) => sum + (p.amount || 0), 0)
                      .toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Payments Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-8"
        >
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>All your transactions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-secondary text-foreground border border-border/50 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-32 bg-secondary/50 rounded-lg animate-pulse" />
              ) : filteredPayments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No payments found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-3 px-4 font-semibold text-sm">Invoice</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Case</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Lawyer</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((payment, i) => (
                        <motion.tr
                          key={payment.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.05 * i }}
                          className="border-b border-border/50 hover:bg-secondary/50 transition-colors"
                        >
                          <td className="py-4 px-4 text-sm font-medium">{payment.invoice_number}</td>
                          <td className="py-4 px-4 text-sm">{payment.case_title}</td>
                          <td className="py-4 px-4 text-sm">{payment.lawyer_name}</td>
                          <td className="py-4 px-4 text-sm font-semibold">ETB {payment.amount?.toLocaleString()}</td>
                          <td className="py-4 px-4 text-sm">{new Date(payment.date).toLocaleDateString()}</td>
                          <td className="py-4 px-4 text-sm">
                            <Badge variant={getStatusColor(payment.status)}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-sm">
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardShell>
  )
}
