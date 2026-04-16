"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Withdrawal {
  id: string
  amount: string
  withdrawal_method: string
  account_details: any
  status: string
  notes: string | null
  created_at: string
  processed_at: string | null
}

const statusConfig = {
  pending: { label: "Pending", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Clock },
  completed: { label: "Completed", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle2 },
  failed: { label: "Failed", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: XCircle },
}

export default function LawyerWithdrawPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingBalance, setLoadingBalance] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [availableBalance, setAvailableBalance] = useState("0")
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    amount: "",
    withdrawal_method: "",
    account_name: "",
    account_number: "",
    bank_name: "",
    phone_number: "",
  })

  useEffect(() => {
    fetchBalance()
    fetchWithdrawals()
  }, [])

  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/payments/lawyer/earnings", {
        credentials: "include",
      })
      const data = await res.json()
      if (res.ok) {
        setAvailableBalance(data.summary.available_balance)
      }
    } catch (err) {
      console.error("Error fetching balance:", err)
    } finally {
      setLoadingBalance(false)
    }
  }

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch("/api/payments/lawyer/withdraw", {
        credentials: "include",
      })
      const data = await res.json()
      if (res.ok) {
        setWithdrawals(data.withdrawals)
      }
    } catch (err) {
      console.error("Error fetching withdrawals:", err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.amount || !formData.withdrawal_method) {
      setError("Please fill in all required fields")
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError("Invalid amount")
      return
    }

    if (amount > parseFloat(availableBalance)) {
      setError("Insufficient balance")
      return
    }

    // Build account details based on method
    let accountDetails: any = {}
    if (formData.withdrawal_method === "bank_transfer") {
      if (!formData.account_name || !formData.account_number || !formData.bank_name) {
        setError("Please fill in all bank details")
        return
      }
      accountDetails = {
        account_name: formData.account_name,
        account_number: formData.account_number,
        bank_name: formData.bank_name,
      }
    } else if (formData.withdrawal_method === "mobile_money") {
      if (!formData.phone_number) {
        setError("Please provide phone number")
        return
      }
      accountDetails = {
        phone_number: formData.phone_number,
      }
    }

    setLoading(true)

    try {
      const res = await fetch("/api/payments/lawyer/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount,
          withdrawal_method: formData.withdrawal_method,
          account_details: accountDetails,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to submit withdrawal request")
        setLoading(false)
        return
      }

      setSuccess(true)
      toast.success("Withdrawal request submitted successfully!")

      // Reset form
      setFormData({
        amount: "",
        withdrawal_method: "",
        account_name: "",
        account_number: "",
        bank_name: "",
        phone_number: "",
      })

      // Refresh data
      fetchBalance()
      fetchWithdrawals()

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardShell role="lawyer">
      <div className="p-6 lg:p-8">
        <motion.button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Earnings
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold font-serif md:text-3xl">Withdraw Funds</h1>
          <p className="mt-1 text-muted-foreground">Request withdrawal from your available balance</p>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 flex items-center gap-3 mt-6"
            >
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              <div>
                <p className="font-medium text-green-600">Withdrawal request submitted!</p>
                <p className="text-sm text-green-600/80">It will be processed by admin team</p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex items-center gap-3 mt-6"
            >
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Withdrawal Form */}
            <div className="lg:col-span-2">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Withdrawal Request</CardTitle>
                  <CardDescription>Fill in the details to request a withdrawal</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="amount" className="text-sm font-medium mb-2 block">
                        Amount (ETB) *
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="h-11 bg-secondary/50 border-border/50"
                        value={formData.amount}
                        onChange={(e) => updateField("amount", e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Available: {parseFloat(availableBalance).toFixed(2)} ETB
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="withdrawal_method" className="text-sm font-medium mb-2 block">
                        Withdrawal Method *
                      </Label>
                      <Select
                        value={formData.withdrawal_method}
                        onValueChange={(val) => updateField("withdrawal_method", val)}
                      >
                        <SelectTrigger className="h-11 bg-secondary/50 border-border/50">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.withdrawal_method === "bank_transfer" && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="bank_name" className="text-sm font-medium mb-2 block">
                            Bank Name *
                          </Label>
                          <Input
                            id="bank_name"
                            placeholder="e.g., Commercial Bank of Ethiopia"
                            className="h-11 bg-secondary/50 border-border/50"
                            value={formData.bank_name}
                            onChange={(e) => updateField("bank_name", e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="account_name" className="text-sm font-medium mb-2 block">
                            Account Holder Name *
                          </Label>
                          <Input
                            id="account_name"
                            placeholder="Full name as per bank account"
                            className="h-11 bg-secondary/50 border-border/50"
                            value={formData.account_name}
                            onChange={(e) => updateField("account_name", e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="account_number" className="text-sm font-medium mb-2 block">
                            Account Number *
                          </Label>
                          <Input
                            id="account_number"
                            placeholder="Bank account number"
                            className="h-11 bg-secondary/50 border-border/50"
                            value={formData.account_number}
                            onChange={(e) => updateField("account_number", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    )}

                    {formData.withdrawal_method === "mobile_money" && (
                      <div>
                        <Label htmlFor="phone_number" className="text-sm font-medium mb-2 block">
                          Phone Number *
                        </Label>
                        <Input
                          id="phone_number"
                          type="tel"
                          placeholder="+251..."
                          className="h-11 bg-secondary/50 border-border/50"
                          value={formData.phone_number}
                          onChange={(e) => updateField("phone_number", e.target.value)}
                          required
                        />
                      </div>
                    )}

                    <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
                      <p className="text-sm text-blue-600">
                        <strong>Note:</strong> Withdrawal requests are processed within 2-3 business days.
                        You will be notified once the transfer is completed.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading || loadingBalance || parseFloat(availableBalance) <= 0}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Withdrawal Request"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Balance Card */}
            <div>
              <Card className="border-border/50 sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Available Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingBalance ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div>
                      <p className="text-4xl font-bold text-primary">
                        {parseFloat(availableBalance).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">ETB</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Withdrawal History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Withdrawal History</CardTitle>
                <CardDescription>Your past withdrawal requests</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : withdrawals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No withdrawal history yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {withdrawals.map((withdrawal, i) => {
                      const statusInfo = statusConfig[withdrawal.status as keyof typeof statusConfig]
                      const StatusIcon = statusInfo?.icon || Clock

                      return (
                        <motion.div
                          key={withdrawal.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + i * 0.05 }}
                          className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <p className="text-sm font-semibold text-primary">
                                {parseFloat(withdrawal.amount).toFixed(2)} ETB
                              </p>
                              <Badge className={`${statusInfo?.color} border text-xs`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusInfo?.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {withdrawal.withdrawal_method.replace("_", " ").toUpperCase()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(withdrawal.created_at).toLocaleDateString()}
                            </p>
                            {withdrawal.notes && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Note: {withdrawal.notes}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </DashboardShell>
  )
}
