"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Loader2, AlertCircle, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Payment {
  id: string
  transaction_id: string
  amount: string
  lawyer_amount: string
  status: string
  case_description: string
  lawyer_name: string
  lawyer_email: string
  created_at: string
  verified_at: string | null
  released_at: string | null
  rejection_reason: string | null
  bank_name: string
  account_number: string
  case_id: string | null
  case_title: string | null
  rating: number | null
  dispute_id: string | null
  dispute_status: string | null
  dispute_resolution: string | null
  dispute_refund_amount: string | null
  dispute_resolved_at: string | null
}

const statusConfig = {
  pending_verification: {
    label: "Pending Verification",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: Clock,
  },
  held_in_escrow: {
    label: "Held in Escrow",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: CheckCircle2,
  },
  released: {
    label: "Released",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    icon: CheckCircle2,
  },
  partial_refund: {
    label: "Partial Refund",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    icon: CheckCircle2,
  },
  disputed: {
    label: "Disputed",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    icon: AlertTriangle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    icon: XCircle,
  },
  refunded: {
    label: "Full Refund",
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    icon: CheckCircle2,
  },
}

export default function ClientPaymentsPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  useEffect(() => {
    fetchPayments()
  }, [statusFilter])

  const fetchPayments = async () => {
    try {
      const url = statusFilter
        ? `/api/payments/client?status=${statusFilter}`
        : "/api/payments/client"

      const res = await fetch(url, {
        credentials: "include",
      })

      const data = await res.json()

      if (res.ok) {
        setPayments(data.payments)
      } else {
        toast.error(data.error || "Failed to fetch payments")
      }
    } catch (err) {
      console.error("Error fetching payments:", err)
      toast.error("Failed to fetch payments")
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = payments.filter((payment) =>
    payment.lawyer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.case_description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = [
    {
      label: "Total Payments",
      value: payments.length.toString(),
      trend: "All time",
    },
    {
      label: "Pending",
      value: payments.filter((p) => p.status === "pending_verification").length.toString(),
      trend: "Awaiting verification",
    },
    {
      label: "In Escrow",
      value: payments.filter((p) => p.status === "held_in_escrow").length.toString(),
      trend: "Active cases",
    },
    {
      label: "Refunds",
      value: payments.filter((p) =>
        (p.status === "released" && p.dispute_resolution === "partial_refund") ||
        (p.status === "refunded" && p.dispute_resolution === "full_refund")
      ).length.toString(),
      trend: "Received",
    },
  ]

  return (
    <DashboardShell role="client">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl font-bold font-serif md:text-3xl">Payments</h1>
            <p className="mt-1 text-muted-foreground">Track and manage your payment submissions</p>
          </div>
          <Link href="/payments/submit">
            <Button className="rounded-full gap-2">
              <Plus className="h-4 w-4" />
              Submit Payment
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
              placeholder="Search by lawyer, transaction ID, or description..."
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
              variant={statusFilter === "pending_verification" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("pending_verification")}
              className="rounded-full"
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === "held_in_escrow" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("held_in_escrow")}
              className="rounded-full"
            >
              In Escrow
            </Button>
            <Button
              variant={statusFilter === "released" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("released")}
              className="rounded-full"
            >
              Released
            </Button>
            <Button
              variant={statusFilter === "disputed" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("disputed")}
              className="rounded-full"
            >
              Disputed
            </Button>
          </div>
        </div>

        {/* Payments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-8"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="py-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No payments found</p>
                  <Link href="/payments/submit">
                    <Button className="mt-4 rounded-full">Submit Your First Payment</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredPayments.map((payment, i) => {
                // Determine display status based on actual status and dispute resolution
                let displayStatus = payment.status
                if (payment.status === 'released' && payment.dispute_resolution === 'partial_refund') {
                  displayStatus = 'partial_refund'
                } else if (payment.status === 'refunded' && payment.dispute_resolution === 'full_refund') {
                  displayStatus = 'refunded'
                }

                const statusInfo = statusConfig[displayStatus as keyof typeof statusConfig]
                const StatusIcon = statusInfo?.icon || Clock

                return (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                  >
                    <Card
                      className="border-border/50 hover:border-primary/20 transition-all cursor-pointer"
                      onClick={() => router.push(`/dashboard/client/payments/${payment.id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground truncate">
                                  {payment.case_title || payment.case_description.substring(0, 50) + "..."}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Lawyer: {payment.lawyer_name}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Transaction ID: {payment.transaction_id}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-3">
                              <Badge className={`${statusInfo?.color} border`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusInfo?.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(payment.created_at).toLocaleDateString()}
                              </span>
                            </div>

                            {payment.rejection_reason && (
                              <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                                <p className="text-xs text-red-600">
                                  <strong>Rejection Reason:</strong> {payment.rejection_reason}
                                </p>
                              </div>
                            )}

                            {/* Dispute/Refund Information */}
                            {payment.dispute_id && payment.dispute_resolved_at && (
                              <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <p className="text-xs font-semibold text-blue-600 mb-2">
                                  Dispute Resolved
                                </p>
                                {payment.dispute_resolution === 'partial_refund' && (
                                  <div className="space-y-1">
                                    <p className="text-xs text-green-600 font-semibold">
                                      ✓ Refund Received: {parseFloat(payment.dispute_refund_amount || '0').toFixed(2)} ETB
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Lawyer Received: {parseFloat(payment.lawyer_amount).toFixed(2)} ETB
                                    </p>
                                    {payment.dispute_admin_notes && (
                                      <p className="text-xs text-blue-900 dark:text-blue-100 mt-2 pt-2 border-t border-blue-500/20">
                                        {payment.dispute_admin_notes}
                                      </p>
                                    )}
                                  </div>
                                )}
                                {payment.dispute_resolution === 'full_refund' && (
                                  <div className="space-y-1">
                                    <p className="text-xs text-green-600 font-semibold">
                                      ✓ Full Refund: {parseFloat(payment.amount).toFixed(2)} ETB
                                    </p>
                                    {payment.dispute_admin_notes && (
                                      <p className="text-xs text-blue-900 dark:text-blue-100 mt-2 pt-2 border-t border-blue-500/20">
                                        {payment.dispute_admin_notes}
                                      </p>
                                    )}
                                  </div>
                                )}
                                {payment.dispute_resolution === 'release_to_lawyer' && (
                                  <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                      Payment released to lawyer
                                    </p>
                                    {payment.dispute_admin_notes && (
                                      <p className="text-xs text-blue-900 dark:text-blue-100 mt-2 pt-2 border-t border-blue-500/20">
                                        {payment.dispute_admin_notes}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">{parseFloat(payment.amount).toFixed(2)} ETB</p>
                            {payment.status === "held_in_escrow" && (
                              <div className="mt-2 flex flex-col gap-2">
                                <Button size="sm" className="rounded-full">
                                  Close Case
                                </Button>
                                <Button size="sm" variant="outline" className="rounded-full">
                                  Cancel
                                </Button>
                              </div>
                            )}
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
