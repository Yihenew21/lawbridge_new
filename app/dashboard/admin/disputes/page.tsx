"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle, CheckCircle2, XCircle, Clock, DollarSign } from "lucide-react"
import { toast } from "sonner"

interface Dispute {
  id: string
  payment_id: string
  transaction_id: string
  reason: string
  status: string
  resolution_outcome: string | null
  refund_amount: number | null
  admin_notes: string | null
  created_at: string
  resolved_at: string | null
  payment: {
    amount: number
    lawyer_amount: number
    commission_amount: number
    status: string
  }
  client: {
    name: string
    email: string
  }
  lawyer: {
    name: string
    email: string
  }
  raised_by: string
  resolved_by: string | null
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false)
  const [resolutionOutcome, setResolutionOutcome] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [refundAmount, setRefundAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [commissionRate, setCommissionRate] = useState(15) // Dynamic commission rate

  useEffect(() => {
    fetchDisputes()
    fetchCommissionRate()
  }, [statusFilter])

  const fetchCommissionRate = async () => {
    try {
      const response = await fetch("/api/settings/commission")
      const data = await response.json()
      if (response.ok) {
        setCommissionRate(data.commission_rate)
      }
    } catch (error) {
      console.error("Failed to fetch commission rate:", error)
    }
  }

  const fetchDisputes = async () => {
    try {
      setLoading(true)
      const url = statusFilter === "all"
        ? "/api/payments/admin/disputes"
        : `/api/payments/admin/disputes?status=${statusFilter}`

      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        setDisputes(data.disputes)
        setStats(data.stats)
      } else {
        toast.error(data.error || "Failed to fetch disputes")
      }
    } catch (error) {
      toast.error("Failed to fetch disputes")
    } finally {
      setLoading(false)
    }
  }

  const handleResolveClick = (dispute: Dispute) => {
    setSelectedDispute(dispute)
    setResolutionOutcome("")
    setAdminNotes("")
    setRefundAmount("")
    setResolveDialogOpen(true)
  }

  const handleResolveSubmit = async () => {
    if (!selectedDispute || !resolutionOutcome) {
      toast.error("Please select a resolution outcome")
      return
    }

    if (resolutionOutcome === "partial_refund" && !refundAmount) {
      toast.error("Please enter refund amount for partial refund")
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(
        `/api/payments/admin/disputes/${selectedDispute.id}/resolve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resolution_outcome: resolutionOutcome,
            admin_notes: adminNotes,
            refund_amount: refundAmount ? parseFloat(refundAmount) : undefined,
          }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        toast.success("Dispute resolved successfully")
        setResolveDialogOpen(false)
        fetchDisputes()
      } else {
        toast.error(data.error || "Failed to resolve dispute")
      }
    } catch (error) {
      toast.error("Failed to resolve dispute")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="destructive" className="text-xs">Open</Badge>
      case "under_review":
        return <Badge variant="outline" className="text-xs">Under Review</Badge>
      case "resolved_refund":
        return <Badge variant="default" className="text-xs bg-blue-500">Resolved - Refund</Badge>
      case "resolved_release":
        return <Badge variant="default" className="text-xs bg-green-500">Resolved - Released</Badge>
      case "rejected":
        return <Badge variant="secondary" className="text-xs">Rejected</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>
    }
  }

  return (
    <DashboardShell role="admin">
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold font-serif md:text-3xl">Payment Disputes</h1>
          <p className="mt-1 text-muted-foreground">Review and resolve payment disputes between clients and lawyers.</p>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Open</p>
                    <p className="text-2xl font-bold">{stats.open_count}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Under Review</p>
                    <p className="text-2xl font-bold">{stats.under_review_count}</p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Resolved</p>
                    <p className="text-2xl font-bold">{stats.resolved_count}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{stats.total_count}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Disputes</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="resolved_refund">Resolved - Refund</SelectItem>
              <SelectItem value="resolved_release">Resolved - Release</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Disputes List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 space-y-4"
        >
          {loading ? (
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Loading disputes...</p>
              </CardContent>
            </Card>
          ) : disputes.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No disputes found</p>
              </CardContent>
            </Card>
          ) : (
            disputes.map((dispute) => (
              <Card key={dispute.id} className="border-border/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">
                          Transaction: {dispute.transaction_id}
                        </CardTitle>
                        {getStatusBadge(dispute.status)}
                      </div>
                      <CardDescription className="mt-2">
                        <span className="font-medium">Client:</span> {dispute.client.name} ({dispute.client.email})
                        <br />
                        <span className="font-medium">Lawyer:</span> {dispute.lawyer.name} ({dispute.lawyer.email})
                      </CardDescription>
                    </div>
                    {(dispute.status === "open" || dispute.status === "under_review") && (
                      <Button
                        size="sm"
                        onClick={() => handleResolveClick(dispute)}
                        className="rounded-full"
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Reason:</p>
                      <p className="text-sm text-muted-foreground">{dispute.reason}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Payment Amount:</p>
                        <p className="text-muted-foreground">{dispute.payment.amount} ETB</p>
                      </div>
                      <div>
                        <p className="font-medium">Lawyer Amount:</p>
                        <p className="text-muted-foreground">{dispute.payment.lawyer_amount} ETB</p>
                      </div>
                    </div>
                    {dispute.resolution_outcome && (
                      <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                        <p className="text-sm font-medium">Resolution:</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {dispute.resolution_outcome.replace(/_/g, " ")}
                        </p>
                        {dispute.refund_amount && (
                          <p className="text-sm text-muted-foreground">
                            Refund Amount: {dispute.refund_amount} ETB
                          </p>
                        )}
                        {dispute.admin_notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Notes: {dispute.admin_notes}
                          </p>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(dispute.created_at).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </motion.div>
      </div>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Choose how to resolve this payment dispute. This will update the lawyer's earnings accordingly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Resolution Outcome</Label>
              <Select value={resolutionOutcome} onValueChange={setResolutionOutcome}>
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_refund">Full Refund (Client gets 100%, Lawyer gets 0)</SelectItem>
                  <SelectItem value="partial_refund">Partial Refund (Split amount)</SelectItem>
                  <SelectItem value="no_refund">No Refund (Keep in escrow)</SelectItem>
                  <SelectItem value="release_to_lawyer">Release to Lawyer (Lawyer gets 100%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {resolutionOutcome === "partial_refund" && (
              <div className="space-y-2">
                <Label>Refund Amount (ETB)</Label>
                <Input
                  type="number"
                  placeholder={`Default: ${((selectedDispute?.payment.amount || 0) / 2).toFixed(2)} ETB (50%)`}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                />
                <div className="text-xs text-muted-foreground space-y-1 p-2 bg-secondary/30 rounded">
                  <p className="font-medium">Calculation Preview:</p>
                  <p>• Original Payment: {selectedDispute?.payment.amount} ETB</p>
                  {(() => {
                    const originalAmount = selectedDispute?.payment.amount || 0
                    const clientRefund = refundAmount ? parseFloat(refundAmount) : originalAmount / 2
                    const lawyerPortion = originalAmount - clientRefund
                    const commission = (lawyerPortion * commissionRate) / 100
                    const lawyerGets = lawyerPortion - commission

                    return (
                      <>
                        <p>• Client Refund: {clientRefund.toFixed(2)} ETB ({((clientRefund / originalAmount) * 100).toFixed(1)}%)</p>
                        <p>• Lawyer Portion: {lawyerPortion.toFixed(2)} ETB</p>
                        <p>• Commission ({commissionRate}%): {commission.toFixed(2)} ETB</p>
                        <p className="font-medium text-green-600">• Lawyer Gets (Withdrawable): {lawyerGets.toFixed(2)} ETB</p>
                      </>
                    )
                  })()}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Admin Notes</Label>
              <Textarea
                placeholder="Add notes about this resolution..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResolveDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolveSubmit}
              disabled={submitting || !resolutionOutcome}
            >
              {submitting ? "Resolving..." : "Resolve Dispute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
