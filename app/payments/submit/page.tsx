"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ArrowLeft, AlertCircle, CheckCircle2, Copy, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface BankAccount {
  id: string
  bank_name: string
  account_number: string
  account_holder_name: string
  branch_name: string | null
}

export default function PaymentSubmitPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [selectedBank, setSelectedBank] = useState<string>("")
  const [copiedField, setCopiedField] = useState<string>("")

  const [formData, setFormData] = useState({
    lawyer_name: "",
    lawyer_email: "",
    amount: "",
    transaction_id: "",
    client_phone: "",
    case_description: "",
  })

  // Get bank prefix based on selected bank
  const getBankPrefix = (bankName: string): string => {
    const name = bankName.toLowerCase()
    if (name.includes("telebirr")) return "TB-"
    if (name.includes("commercial") || name.includes("cbe")) return "CBE-"
    if (name.includes("abyssinia") || name.includes("boa")) return "BOA-"
    if (name.includes("awash")) return "AWA-"
    if (name.includes("dashen")) return "DAS-"
    if (name.includes("nib")) return "NIB-"
    if (name.includes("wegagen")) return "WEG-"
    if (name.includes("united")) return "UNI-"
    if (name.includes("cooperative") || name.includes("coop")) return "COOP-"
    if (name.includes("oromia")) return "OIB-"
    return "OTH-" // Other banks
  }

  const selectedBankAccount = bankAccounts.find(acc => acc.id === selectedBank)

  useEffect(() => {
    fetchBankAccounts()
  }, [])

  const fetchBankAccounts = async () => {
    try {
      const res = await fetch("/api/bank-accounts", {
        credentials: "include",
      })
      const data = await res.json()
      if (res.ok) {
        setBankAccounts(data.accounts)
      }
    } catch (err) {
      console.error("Error fetching bank accounts:", err)
    } finally {
      setLoadingAccounts(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopiedField(""), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedBank) {
      setError("Please select a bank account")
      return
    }

    if (!formData.lawyer_name || !formData.lawyer_email || !formData.amount ||
        !formData.transaction_id || !formData.client_phone || !formData.case_description) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      // Add bank prefix to transaction ID
      const bankPrefix = selectedBankAccount ? getBankPrefix(selectedBankAccount.bank_name) : ""
      const fullTransactionId = bankPrefix + formData.transaction_id

      const res = await fetch("/api/payments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          transaction_id: fullTransactionId,
          bank_account_id: selectedBank,
          amount: parseFloat(formData.amount),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to submit payment")
        setLoading(false)
        return
      }

      setSuccess(true)
      toast.success("Payment submitted successfully!")
      setTimeout(() => {
        router.push("/dashboard/client/payments")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setLoading(false)
    }
  }

  return (
    <DashboardShell role="client">
      <div className="p-6 lg:p-8">
        <motion.button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold font-serif md:text-3xl">Submit Payment</h1>
          <p className="mt-1 text-muted-foreground">
            Transfer money to our bank account and submit proof of payment
          </p>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 flex items-center gap-3 mt-6"
            >
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              <div>
                <p className="font-medium text-green-600">Payment submitted successfully!</p>
                <p className="text-sm text-green-600/80">Redirecting to payments page...</p>
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
            {/* Bank Accounts */}
            <div className="lg:col-span-1">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Step 1: Select Bank</CardTitle>
                  <CardDescription>Choose where to send payment</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingAccounts ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bankAccounts.map((account) => (
                        <motion.div
                          key={account.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedBank(account.id)}
                          className={`cursor-pointer rounded-lg border p-4 transition-all ${
                            selectedBank === account.id
                              ? "border-primary bg-primary/5"
                              : "border-border/50 hover:border-primary/50"
                          }`}
                        >
                          <p className="font-semibold text-sm">{account.bank_name}</p>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">Account Number</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  copyToClipboard(account.account_number, account.id)
                                }}
                                className="text-primary hover:text-primary/80"
                              >
                                {copiedField === account.id ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                            <p className="text-sm font-mono">{account.account_number}</p>
                            <p className="text-xs text-muted-foreground">{account.account_holder_name}</p>
                            {account.branch_name && (
                              <p className="text-xs text-muted-foreground">{account.branch_name}</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            <div className="lg:col-span-2">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Step 2: Submit Payment Details</CardTitle>
                  <CardDescription>Fill in the form after making the transfer</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="lawyer_name" className="text-sm font-medium mb-2 block">
                          Lawyer Name *
                        </Label>
                        <Input
                          id="lawyer_name"
                          placeholder="Full name"
                          className="h-11 bg-secondary/50 border-border/50"
                          value={formData.lawyer_name}
                          onChange={(e) => updateField("lawyer_name", e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="lawyer_email" className="text-sm font-medium mb-2 block">
                          Lawyer Email *
                        </Label>
                        <Input
                          id="lawyer_email"
                          type="email"
                          placeholder="lawyer@example.com"
                          className="h-11 bg-secondary/50 border-border/50"
                          value={formData.lawyer_email}
                          onChange={(e) => updateField("lawyer_email", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      </div>

                      <div>
                        <Label htmlFor="transaction_id" className="text-sm font-medium mb-2 block">
                          Transaction ID *
                        </Label>
                        <div className="relative">
                          {selectedBankAccount && (
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono text-muted-foreground pointer-events-none">
                              {getBankPrefix(selectedBankAccount.bank_name)}
                            </div>
                          )}
                          <Input
                            id="transaction_id"
                            placeholder={selectedBankAccount ? "Enter transaction number" : "Select bank first"}
                            className={`h-11 bg-secondary/50 border-border/50 ${selectedBankAccount ? 'pl-16' : ''}`}
                            value={formData.transaction_id}
                            onChange={(e) => updateField("transaction_id", e.target.value)}
                            disabled={!selectedBankAccount}
                            required
                          />
                        </div>
                        {selectedBankAccount && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Full ID: {getBankPrefix(selectedBankAccount.bank_name)}{formData.transaction_id || "..."}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="client_phone" className="text-sm font-medium mb-2 block">
                        Your Phone Number *
                      </Label>
                      <Input
                        id="client_phone"
                        type="tel"
                        placeholder="+251..."
                        className="h-11 bg-secondary/50 border-border/50"
                        value={formData.client_phone}
                        onChange={(e) => updateField("client_phone", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="case_description" className="text-sm font-medium mb-2 block">
                        Case Description *
                      </Label>
                      <textarea
                        id="case_description"
                        placeholder="Describe the legal service you're paying for..."
                        className="w-full h-32 rounded-xl bg-secondary/50 border border-border/50 px-4 py-3 text-sm placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 resize-none"
                        value={formData.case_description}
                        onChange={(e) => updateField("case_description", e.target.value)}
                        required
                      />
                    </div>

                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
                      <p className="text-sm text-amber-600">
                        <strong>Important:</strong> Make sure you have transferred the money to the selected bank account
                        before submitting this form. Your payment will be verified by our admin team.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading || !selectedBank}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Payment"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardShell>
  )
}
