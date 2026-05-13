"use client"

import { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Upload, X } from "lucide-react"
import { toast } from "sonner"

export default function ReportIssuePage() {
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    issueType: "",
    severity: "",
    title: "",
    description: "",
    stepsToReproduce: "",
    expectedBehavior: "",
    actualBehavior: "",
    browserInfo: "",
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Upload files if any
      let attachmentUrls: string[] = []

      if (files.length > 0) {
        const uploadFormData = new FormData()
        files.forEach((file) => {
          uploadFormData.append("files", file)
        })

        const uploadResponse = await fetch("/api/support/upload", {
          method: "POST",
          body: uploadFormData,
        })

        const uploadData = await uploadResponse.json()

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || "Failed to upload attachments")
        }

        attachmentUrls = uploadData.urls
      }

      const response = await fetch("/api/support/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          issueType: formData.issueType,
          severity: formData.severity,
          title: formData.title,
          description: formData.description,
          stepsToReproduce: formData.stepsToReproduce,
          expectedBehavior: formData.expectedBehavior,
          actualBehavior: formData.actualBehavior,
          browserInfo: formData.browserInfo,
          attachmentUrls,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit issue report")
      }

      toast.success(data.message || "Issue reported successfully! Our team will investigate and get back to you.")
      setFormData({
        issueType: "",
        severity: "",
        title: "",
        description: "",
        stepsToReproduce: "",
        expectedBehavior: "",
        actualBehavior: "",
        browserInfo: "",
      })
      setFiles([])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit report. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex h-10 items-center justify-center rounded-full border border-orange-500/20 bg-orange-500/5 px-5 mb-6">
            <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
            <span className="text-sm font-medium text-orange-600">Report an Issue</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight mb-6">
            Report a <span className="text-primary italic">Problem</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Help us improve LawBridge by reporting bugs, technical issues, or problems you encounter
          </p>
        </motion.div>

        {/* Report Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl">Issue Details</CardTitle>
              <CardDescription>
                Please provide as much detail as possible to help us resolve the issue quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Issue Type and Severity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="issueType">Issue Type *</Label>
                    <Select
                      value={formData.issueType}
                      onValueChange={(value) => setFormData({ ...formData, issueType: value })}
                      required
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select issue type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug">Bug / Error</SelectItem>
                        <SelectItem value="performance">Performance Issue</SelectItem>
                        <SelectItem value="ui">UI / Display Problem</SelectItem>
                        <SelectItem value="payment">Payment Issue</SelectItem>
                        <SelectItem value="security">Security Concern</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="severity">Severity *</Label>
                    <Select
                      value={formData.severity}
                      onValueChange={(value) => setFormData({ ...formData, severity: value })}
                      required
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical - Cannot use platform</SelectItem>
                        <SelectItem value="high">High - Major functionality broken</SelectItem>
                        <SelectItem value="medium">Medium - Feature not working</SelectItem>
                        <SelectItem value="low">Low - Minor inconvenience</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title">Issue Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Brief summary of the issue"
                    required
                    className="mt-2"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the issue in detail..."
                    required
                    className="mt-2 min-h-[100px]"
                  />
                </div>

                {/* Steps to Reproduce */}
                <div>
                  <Label htmlFor="stepsToReproduce">Steps to Reproduce</Label>
                  <Textarea
                    id="stepsToReproduce"
                    value={formData.stepsToReproduce}
                    onChange={(e) => setFormData({ ...formData, stepsToReproduce: e.target.value })}
                    placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                    className="mt-2 min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Help us reproduce the issue by listing the exact steps
                  </p>
                </div>

                {/* Expected vs Actual Behavior */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="expectedBehavior">Expected Behavior</Label>
                    <Textarea
                      id="expectedBehavior"
                      value={formData.expectedBehavior}
                      onChange={(e) => setFormData({ ...formData, expectedBehavior: e.target.value })}
                      placeholder="What should happen?"
                      className="mt-2 min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="actualBehavior">Actual Behavior</Label>
                    <Textarea
                      id="actualBehavior"
                      value={formData.actualBehavior}
                      onChange={(e) => setFormData({ ...formData, actualBehavior: e.target.value })}
                      placeholder="What actually happens?"
                      className="mt-2 min-h-[80px]"
                    />
                  </div>
                </div>

                {/* Browser/Device Info */}
                <div>
                  <Label htmlFor="browserInfo">Browser / Device Information</Label>
                  <Input
                    id="browserInfo"
                    value={formData.browserInfo}
                    onChange={(e) => setFormData({ ...formData, browserInfo: e.target.value })}
                    placeholder="e.g., Chrome 120 on Windows 11, Safari on iPhone 15"
                    className="mt-2"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <Label htmlFor="files">Screenshots / Attachments</Label>
                  <div className="mt-2">
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, PDF up to 10MB
                        </p>
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    {files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                          >
                            <span className="text-sm truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
                  {loading ? "Submitting..." : "Submit Report"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-blue-700 dark:text-blue-400">
                What happens next?
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Our team will review your report within 24 hours</li>
                <li>• Critical issues are prioritized and addressed immediately</li>
                <li>• You'll receive updates via email as we investigate</li>
                <li>• We may contact you for additional information if needed</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </main>
  )
}
