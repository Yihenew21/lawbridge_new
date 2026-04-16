"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Clock, CheckCircle2, XCircle, AlertTriangle, Star } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface PaymentDetail {
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
  verified_at: string | null
  released_at: string | null
  rejection_reason: string | null
  bank_name: string
  account_number: string
  account_holder_name: string
  branch_name: string | null
  case_id: string | null
  case_title: string | null
  rating: number | null
  rating_comment: string | null
  rated_at: string | null
}

interface StatusHistory {
  old_status: string | null
  new_status: string
  notes: string | null
  created_at: string
  changed_by_name: string | null
  changed_by_role: string | null
}

interface Dispute {
  id: string
  reason: string
  status: string
  created_at: string
  resolved_at: string | null
  resolution_outcome: string | null
}

const statusConfig = {
  pending_verification: { label: "Pending Verification", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
  held_in_escrow: { label: "Held in Escrow", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: CheckCircle2 },
  released: { label: "Released", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle2 },
  disputed: { label: "Disputed", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: AlertTriangle },
  rejected: { label: "Rejected", color: "bg-gray-500/10 text-gray-600 border-gray-500/20", icon: XCircle },
  refunded: { label: "Refunded", color: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: CheckCircle2 },
}

export default function PaymentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const paymentId = params.id as string

  const [payment, setPayment] = useState<PaymentDetail | null>(null)
  const [history, setHistory] = useState<StatusHistory[]>([])
  const [dispute, setDispute] = useState<Dispute | null>(null)
  const [loading, setLoading] = useState(true)

  // Close case modal state
  const [closeModalOpen, setCloseModalOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [ratingComment, setRatingComment] = useState("")
  const [closingCase, setClosingCase] = useState(false)

  // Dispute modal state
  const [disputeModalOpen, setDisputeModalOpen] = useState(false)
  const [disputeReason, setDisputeReason] = useState("")
  const [submittingDispute, setSubmittingDispute] = useState(false)

  useEffect(() => {
    fetchPaymentDetails()
  }, [paymentId])

  const fetchPaymentDetails = async () => {
    try {
      const res = await fetch(`/api/payments/client/${paymentId}`, {
        credentials: "include",
      })

      const data = await res.json()

      if (res.ok) {
        setPayment(data.payment)
        setHistory(data.history)
        setDispute(data.dispute)
      } else {
        toast.error(data.error || "Failed to fetch payment details")
      }
    } catch (err) {
      console.error("Error fetching payment details:", err)
      toast.error("Failed to fetch payment details")
    } finally {
      setLoading(false)
    }
  }

  const handleCloseCase = async () => {
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    if (!payment?.case_id) {
      toast.error("No case associated with this payment")
      return
    }

    setClosingCase(true)

    try {
      const res = await fetch("/api/cases/close", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: payment.case_id,
          rating,
          rating_comment: ratingComment || null,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Case closed successfully!")
        setCloseModalOpen(false)
        fetchPaymentDetails()
      } else {
        toast.error(data.error || "Failed to close case")
      }
    } catch (err) {
      console.error("Error closing case:", err)
      toast.error("Failed to close case")
    } finally {
      setClosingCase(false)
    }
  }

  const handleSubmitDispute = async () => {
    if (disputeReason.trim().length < 10) {
      toast.error("Reason must be at least 10 characters")
      return
    }

    setSubmittingDispute(true)

    try {
      const res = await fetch("/api/payments/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          payment_id: paymentId,
          reason: disputeReason.trim(),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Dispute submitted successfully!")
        setDisputeModalOpen(false)
        fetchPaymentDetails()
      } else {
        toast.error(data.error || "Failed to submit dispute")
      }
    } catch (err) {
      console.error("Error submitting dispute:", err)
      toast.error("Failed to submit dispute")
    } finally {
      setSubmittingDispute(false)
    }
  }

  if (loading) {
    return (
      <DashboardShell role="client">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardShell>
    )
  }

  if (!payment) {
    return (
      <DashboardShell role="client">
        <div className="p-6 lg:p-8">
          <p className="text-muted-foreground">Payment not found</p>
        </div>
      </DashboardShell>
    )
  }

  const statusInfo = statusConfig[payment.status as keyof typeof statusConfig]
  const StatusIcon = statusInfo?.icon || Clock

  return (
    <DashboardShell role="client">
      <div className="p-6 lg:p-8">
        <motion.button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Payments
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold font-serif md:text-3xl">Payment Details</h1>
              <p className="mt-1 text-muted-foreground">Transaction ID: {payment.transaction_id}</p>
            </div>
            <Badge className={`${statusInfo?.color} border`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo?.label}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="text-lg font-bold text-primary">{parseFloat(payment.amount).toFixed(2)} ETB</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Lawyer Receives</p>
                      <p className="text-lg font-semibold">{parseFloat(payment.lawyer_amount).toFixed(2)} ETB</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Case Description</p>
                    <p className="text-sm mt-1">{payment.case_description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Lawyer</p>
                      <p className="text-sm font-medium">{payment.lawyer_name}</p>
                      <p className="text-xs text-muted-foreground">{payment.lawyer_email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Bank Account</p>
                      <p className="text-sm font-medium">{payment.bank_name}</p>
                      <p className="text-xs text-muted-foreground">{payment.account_number}</p>
                    </div>
                  </div>

                  {payment.rejection_reason && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                      <p className="text-sm text-red-600">
                        <strong>Rejection Reason:</strong> {payment.rejection_reason}
                      </p>
                    </div>
                  )}

                  {payment.rating && (
                    <div className="rounded-lg bg-secondary/50 border border-border/50 p-4">
                      <p className="text-xs text-muted-foreground mb-2">Your Rating</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${star <= payment.rating! ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      {payment.rating_comment && (
                        <p className="text-sm mt-2">{payment.rating_comment}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status History */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Status History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {history.map((item, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          {i < history.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm font-medium">{item.new_status.replace(/_/g, " ").toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(item.created_at).toLocaleString()}
                          </p>
                          {item.notes && <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>}
                          {item.changed_by_name && (
                            <p className="text-xs text-muted-foreground">By: {item.changed_by_name}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Dispute Info */}
              {dispute && (
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Dispute Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <Badge className="mt-1">{dispute.status.replace(/_/g, " ").toUpperCase()}</Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Reason</p>
                        <p className="text-sm mt-1">{dispute.reason}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Submitted</p>
                        <p className="text-sm mt-1">{new Date(dispute.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Actions */}
            <div>
              <Card className="border-border/50 sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {payment.status === "held_in_escrow" && (
                    <>
                      <Dialog open={closeModalOpen} onOpenChange={setCloseModalOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full rounded-full">Close Case & Rate</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Close Case</DialogTitle>
                            <DialogDescription>
                              Rate the lawyer and close this case. Payment will be released.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label>Rating *</Label>
                              <div className="flex items-center gap-2 mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none"
                                  >
                                    <Star
                                      className={`h-8 w-8 cursor-pointer transition-colors ${
                                        star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300 hover:text-amber-200"
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="rating_comment">Comment (Optional)</Label>
                              <Textarea
                                id="rating_comment"
                                placeholder="Share your experience..."
                                value={ratingComment}
                                onChange={(e) => setRatingComment(e.target.value)}
                                className="mt-2"
                              />
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setCloseModalOpen(false)} className="flex-1">
                              Cancel
                            </Button>
                            <Button onClick={handleCloseCase} disabled={closingCase || rating === 0} className="flex-1">
                              {closingCase ? <Loader2 className="h-4 w-4 animate-spin" /> : "Close Case"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={disputeModalOpen} onOpenChange={setDisputeModalOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full rounded-full">Cancel Case</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Raise Dispute</DialogTitle>
                            <DialogDescription>
                              Explain why you want to cancel this case. An admin will review your request.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label htmlFor="dispute_reason">Reason *</Label>
                              <Textarea
                                id="dispute_reason"
                                placeholder="Explain the issue in detail (minimum 10 characters)..."
                                value={disputeReason}
                                onChange={(e) => setDisputeReason(e.target.value)}
                                className="mt-2 h-32"
                              />
                            </div>
                            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                              <p className="text-xs text-amber-600">
                                This will put the payment in dispute status. An admin will review and decide the outcome.
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setDisputeModalOpen(false)} className="flex-1">
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSubmitDispute}
                              disabled={submittingDispute || disputeReason.trim().length < 10}
                              className="flex-1"
                            >
                              {submittingDispute ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Dispute"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}

                  {payment.status === "pending_verification" && (
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
                      <p className="text-xs text-amber-600">
                        Your payment is being verified by our admin team. This usually takes 24-48 hours.
                      </p>
                    </div>
                  )}

                  {payment.status === "released" && (
                    <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
                      <p className="text-xs text-green-600">
                        Payment has been released to the lawyer. Thank you for using LawBridge!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardShell>
  )
}
