"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react"

export default function ApplyCasePage() {
  const router = useRouter()
  const params = useParams()
  const caseId = params.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [caseData, setCaseData] = useState<any>(null)

  const [formData, setFormData] = useState({
    bid_amount: "",
    cover_letter: "",
  })

  useEffect(() => {
    fetchCaseDetails()
  }, [caseId])

  const fetchCaseDetails = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/cases/${caseId}`, {
        credentials: "include",
      })

      if (!res.ok) {
        setError("Case not found")
        setLoading(false)
        return
      }

      const data = await res.json()
      setCaseData(data.case)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load case details")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.cover_letter) {
      setError("Please write a cover letter")
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch("/api/cases/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          case_id: caseId,
          bid_amount: formData.bid_amount ? parseFloat(formData.bid_amount) : null,
          cover_letter: formData.cover_letter,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to submit application")
        setSubmitting(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/cases")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-32 pb-20 px-6 bg-background">
        <div className="max-w-3xl mx-auto">
          <motion.button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            whileHover={{ x: -4 }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </motion.button>

          {loading ? (
            <div className="space-y-4">
              <div className="h-12 rounded-lg bg-secondary/50 animate-pulse" />
              <div className="h-64 rounded-lg bg-secondary/50 animate-pulse" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {caseData && (
                <div className="rounded-2xl bg-card border border-border/50 p-8">
                  <h1 className="text-3xl font-serif font-bold text-foreground mb-4">{caseData.title}</h1>
                  <div className="space-y-4 mb-6 pb-6 border-b border-border/50">
                    <p className="text-base text-muted-foreground">{caseData.description}</p>
                    <div className="flex flex-wrap gap-4">
                      {caseData.category && (
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {caseData.category}
                        </span>
                      )}
                      {caseData.location && (
                        <span className="text-sm text-muted-foreground">📍 {caseData.location}</span>
                      )}
                      {caseData.budget_min && (
                        <span className="text-sm text-muted-foreground">
                          💰 ETB {caseData.budget_min} - {caseData.budget_max}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 flex items-center gap-3"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  <div>
                    <p className="font-medium text-green-600">Application submitted successfully!</p>
                    <p className="text-sm text-green-600/80">Redirecting...</p>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex items-center gap-3"
                >
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </motion.div>
              )}

              <div className="rounded-2xl bg-card border border-border/50 p-8">
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Submit Your Application</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="bid_amount" className="text-sm font-medium mb-2 block">
                      Your Bid Amount (ETB)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">ETB</span>
                      <Input
                        id="bid_amount"
                        type="number"
                        placeholder="Enter your bid amount"
                        className="h-11 bg-secondary/50 border-border/50 pl-10"
                        value={formData.bid_amount}
                        onChange={(e) => setFormData({ ...formData, bid_amount: e.target.value })}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">Optional - you can discuss fees after being selected</p>
                  </div>

                  <div>
                    <Label htmlFor="cover_letter" className="text-sm font-medium mb-2 block">
                      Cover Letter *
                    </Label>
                    <textarea
                      id="cover_letter"
                      placeholder="Introduce yourself, explain your expertise, and why you're a great fit for this case. Share relevant experience..."
                      className="w-full h-40 rounded-xl bg-secondary/50 border border-border/50 px-4 py-3 text-sm placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 resize-none"
                      value={formData.cover_letter}
                      onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">{formData.cover_letter.length}/1000</p>
                  </div>

                  <div className="rounded-lg bg-secondary/50 p-4 border border-border/50">
                    <h3 className="font-semibold text-sm mb-3">Application Tips</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>✓ Be specific about your experience with similar cases</li>
                      <li>✓ Highlight your relevant qualifications and expertise</li>
                      <li>✓ Explain your approach to solving their legal issue</li>
                      <li>✓ Be professional and responsive to questions</li>
                    </ul>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="flex-1"
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={submitting || !formData.cover_letter}
                    >
                      {submitting ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
