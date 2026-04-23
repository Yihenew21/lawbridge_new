"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { AlertCircle, CheckCircle2, XCircle, Clock, DollarSign, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Payment {
  id: string
  transaction_id: string
  amount: string
  commission_rate: string
  commission_amount: string
  lawyer_amount: string
  status: string
  case_description: string
  client_name: string
  client_email: string
  client_phone: string
  lawyer_name: string
  lawyer_email: string
  created_at: string
  bank_name: string
  account_number: string
  account_holder_name: string
  branch_name: string | null
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [action, setAction] = useState<"approve" | "reject" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/payments/admin/pending")
      const data = await response.json()

      if (response.ok) {
        setPayments(data.payments)
        setStats(data.stats)
      } else {
        toast.error(data.error || "Failed to fetch payments")
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
      toast.error("Failed to fetch payments")
    } finally {
      setLoading(false)
    }
  }

  const handleAction = (payment: Payment, actionType: "approve" | "reject") => {
    setSelectedPayment(payment)
    setAction(actionType)
    setRejectionReason("")
    setActionDialogOpen(true)
  }

  const submitAction = async () => {
    if (!selectedPayment || !action) return

    if (action === "reject" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/payments/${selectedPayment.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          rejection_reason: action === "reject" ? rejectionReason : undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setActionDialogOpen(false)
        fetchPayments()
      } else {
        toast.error(data.error || "Failed to process action")
      }
    } catch (error) {
      console.error("Error processing action:", error)
      toast.error("Failed to process action")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardShell role="admin">
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold font-serif md:text-3xl">Payment Verification</h1>
            <p className="mt-1 text-muted-foreground">Review and approve pending payment submissions</p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                    <Clock className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.total_pending || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Pending Payments</p>
                  </div>
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
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                    <DollarSign className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {parseFloat(stats?.total_amount || "0").toFixed(2)} ETB
                    </p>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Payments List */}
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
          ) : payments.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="py-12">
                <div className="text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending payments</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {payments.map((payment, i) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                >
                  <Card className="border-border/50">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending Verification
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(payment.created_at).toLocaleString()}
                              </span>
                            </div>
                            <h3 className="font-semibold text-lg">
                              Transaction: {payment.transaction_id}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {payment.case_description}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground">Client</p>
                              <p className="text-sm">{payment.client_name}</p>
                              <p className="text-xs text-muted-foreground">{payment.client_email}</p>
                              <p className="text-xs text-muted-foreground">{payment.client_phone}</p>
                            </div>

                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground">Lawyer</p>
                              <p className="text-sm">{payment.lawyer_name}</p>
                              <p className="text-xs text-muted-foreground">{payment.lawyer_email}</p>
                            </div>
                          </div>

                          <div className="p-3 bg-secondary/50 rounded-lg">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">Bank Details</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-xs text-muted-foreground">Bank:</span>
                                <p>{payment.bank_name}</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Account:</span>
                                <p>{payment.account_number}</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Holder:</span>
                                <p>{payment.account_holder_name}</p>
                              </div>
                              {payment.branch_name && (
                                <div>
                                  <span className="text-xs text-muted-foreground">Branch:</span>
                                  <p>{payment.branch_name}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="lg:text-right space-y-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Total Amount</p>
                            <p className="text-3xl font-bold text-primary">
                              {parseFloat(payment.amount).toFixed(2)} ETB
                            </p>
                            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                              <p>Commission ({payment.commission_rate}%): {parseFloat(payment.commission_amount).toFixed(2)} ETB</p>
                              <p>Lawyer Amount: {parseFloat(payment.lawyer_amount).toFixed(2)} ETB</p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => handleAction(payment, "approve")}
                              className="gap-2"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleAction(payment, "reject")}
                              variant="destructive"
                              className="gap-2"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve Payment" : "Reject Payment"}
            </DialogTitle>
            <DialogDescription>
              {action === "approve"
                ? "This will move the payment to escrow and notify the parties."
                : "Please provide a reason for rejecting this payment."}
            </DialogDescription>
          </DialogHeader>

          {action === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={submitAction}
              disabled={submitting}
              variant={action === "approve" ? "default" : "destructive"}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {action === "approve" ? "Approve" : "Reject"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
