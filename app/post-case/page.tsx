"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react"

const categories = [
  "Family Law",
  "Property Disputes",
  "Business Contracts",
  "Criminal Defense",
  "Employment Law",
  "Intellectual Property",
  "Immigration",
  "Tax Law",
  "Real Estate",
  "Corporate Law",
  "Other",
]

const locations = [
  "Addis Ababa",
  "Bahir Dar",
  "Hawassa",
  "Dire Dawa",
  "Mekelle",
  "Jimma",
  "Adama",
  "Gondar",
  "Djibouti",
  "Remote",
]

export default function PostCasePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budget_min: "",
    budget_max: "",
    location: "",
  })

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 2) {
      setStep(2)
      return
    }

    if (!formData.title || !formData.description || !formData.category) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
          budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
          location: formData.location || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to post case")
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/cases")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-32 pb-20 px-6 bg-background">
        <div className="max-w-2xl mx-auto">
          <motion.button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
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
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Post a Case</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Describe your legal needs and connect with qualified lawyers
            </p>

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 flex items-center gap-3 mb-8"
              >
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                <div>
                  <p className="font-medium text-green-600">Case posted successfully!</p>
                  <p className="text-sm text-green-600/80">Redirecting to cases...</p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex items-center gap-3 mb-8"
              >
                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </motion.div>
            )}

            <div className="rounded-2xl bg-card border border-border/50 p-8">
              {/* Progress indicator */}
              <div className="flex items-center gap-4 mb-8">
                <motion.div
                  initial={false}
                  animate={{ scale: step >= 1 ? 1 : 0.8 }}
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm ${
                    step >= 1
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  1
                </motion.div>
                <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-secondary"}`} />
                <motion.div
                  initial={false}
                  animate={{ scale: step >= 2 ? 1 : 0.8 }}
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm ${
                    step >= 2
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  2
                </motion.div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium mb-2 block">
                        Case Title *
                      </Label>
                      <Input
                        id="title"
                        placeholder="e.g., Need legal review for property contract"
                        className="h-11 bg-secondary/50 border-border/50"
                        value={formData.title}
                        onChange={(e) => updateField("title", e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">Be specific about your legal issue</p>
                    </div>

                    <div>
                      <Label htmlFor="category" className="text-sm font-medium mb-2 block">
                        Legal Category *
                      </Label>
                      <Select value={formData.category} onValueChange={(val) => updateField("category", val)}>
                        <SelectTrigger className="h-11 bg-secondary/50 border-border/50">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-sm font-medium mb-2 block">
                        Detailed Description *
                      </Label>
                      <textarea
                        id="description"
                        placeholder="Describe your case in detail. Include relevant facts, timeline, and what you need help with."
                        className="w-full h-32 rounded-xl bg-secondary/50 border border-border/50 px-4 py-3 text-sm placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 resize-none"
                        value={formData.description}
                        onChange={(e) => updateField("description", e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">{formData.description.length}/1000</p>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="budget_min" className="text-sm font-medium mb-2 block">
                          Budget (Min)
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">ETB</span>
                          <Input
                            id="budget_min"
                            type="number"
                            placeholder="0"
                            className="h-11 bg-secondary/50 border-border/50 pl-10"
                            value={formData.budget_min}
                            onChange={(e) => updateField("budget_min", e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="budget_max" className="text-sm font-medium mb-2 block">
                          Budget (Max)
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">ETB</span>
                          <Input
                            id="budget_max"
                            type="number"
                            placeholder="0"
                            className="h-11 bg-secondary/50 border-border/50 pl-10"
                            value={formData.budget_max}
                            onChange={(e) => updateField("budget_max", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-sm font-medium mb-2 block">
                        Preferred Location
                      </Label>
                      <Select value={formData.location} onValueChange={(val) => updateField("location", val)}>
                        <SelectTrigger className="h-11 bg-secondary/50 border-border/50">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((loc) => (
                            <SelectItem key={loc} value={loc}>
                              {loc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-lg bg-secondary/50 p-4 border border-border/50">
                      <h3 className="font-semibold text-sm mb-3">Case Summary</h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-muted-foreground">Title:</span> {formData.title}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Category:</span> {formData.category}
                        </p>
                        {formData.budget_min && (
                          <p>
                            <span className="text-muted-foreground">Budget:</span> ETB {formData.budget_min} - {formData.budget_max || "Open"}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-4 pt-4">
                  {step === 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                      disabled={loading}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? "Posting..." : step === 1 ? "Next" : "Post Case"}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  )
}
