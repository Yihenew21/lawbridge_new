"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Shield, CheckCircle2, AlertCircle, XCircle, Loader2, Upload } from "lucide-react"
import VerificationDocumentUpload from "@/components/VerificationDocumentUpload"

interface Verification {
  id: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  license_number: string
  license_expiry: string
  verified_at: string | null
  rejection_reason: string | null
}

export default function LawyerVerificationPage() {
  const [verification, setVerification] = useState<Verification | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [licenseNumber, setLicenseNumber] = useState('')
  const [licenseExpiry, setLicenseExpiry] = useState('')
  const [barAssociation, setBarAssociation] = useState('')
  const [documentUrls, setDocumentUrls] = useState<string[]>([])

  useEffect(() => {
    fetchVerification()
  }, [])

  const fetchVerification = async () => {
    try {
      const response = await fetch('/api/lawyers/verification')
      const data = await response.json()

      if (response.ok) {
        setVerification(data.verification)
        if (data.verification) {
          setLicenseNumber(data.verification.license_number || '')
          setLicenseExpiry(data.verification.license_expiry || '')
        }
      } else {
        setError(data.error || 'Failed to load verification status')
      }
    } catch (error) {
      setError('An error occurred while loading verification status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    if (!licenseNumber || !licenseExpiry) {
      setError('License number and expiry date are required')
      setIsSubmitting(false)
      return
    }

    if (documentUrls.length === 0) {
      setError('Please upload at least one verification document')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/lawyers/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseNumber,
          licenseExpiry,
          barAssociation,
          documentUrls,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        await fetchVerification()
      } else {
        setError(data.error || 'Failed to submit verification request')
      }
    } catch (error) {
      setError('An error occurred while submitting verification request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Verified</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      case 'under_review':
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Under Review</Badge>
      case 'pending':
        return <Badge variant="secondary"><Shield className="w-3 h-3 mr-1" />Pending</Badge>
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <DashboardShell role="lawyer">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell role="lawyer">
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold font-serif md:text-3xl">Verification & Credentials</h1>
          <p className="mt-1 text-muted-foreground">
            {verification
              ? 'Your verification status and professional credentials'
              : 'Complete your verification to unlock all features and build client trust'}
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <div className="p-4 rounded-lg bg-red-50 text-red-700 flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {verification ? (
          <>
            {/* Verification Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-8"
            >
              <Card className={`border-border/50 ${
                verification.status === 'approved' ? 'bg-green-500/5' :
                verification.status === 'rejected' ? 'bg-red-500/5' :
                verification.status === 'under_review' ? 'bg-amber-500/5' :
                'bg-blue-500/5'
              }`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-lg font-bold text-foreground">Verification Status</p>
                      <p className="text-sm text-muted-foreground">
                        {verification.status === 'approved' && 'Your account is verified'}
                        {verification.status === 'rejected' && 'Your verification was rejected'}
                        {verification.status === 'under_review' && 'Your verification is being reviewed'}
                        {verification.status === 'pending' && 'Your verification is pending review'}
                      </p>
                    </div>
                    {getStatusBadge(verification.status)}
                  </div>

                  {verification.status === 'approved' && verification.verified_at && (
                    <p className="text-sm text-muted-foreground">
                      Verified on {new Date(verification.verified_at).toLocaleDateString()}
                    </p>
                  )}

                  {verification.status === 'rejected' && verification.rejection_reason && (
                    <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason:</p>
                      <p className="text-sm text-red-700">{verification.rejection_reason}</p>
                      <Button size="sm" className="mt-3" onClick={() => setVerification(null)}>
                        Submit New Request
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Verification Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Verification Details</CardTitle>
                  <CardDescription>Your submitted verification information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">License Number</Label>
                      <p className="text-foreground font-medium mt-1">{verification.license_number}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">License Expiry</Label>
                      <p className="text-foreground font-medium mt-1">
                        {new Date(verification.license_expiry).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          /* Verification Form */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8"
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Submit Verification Request</CardTitle>
                <CardDescription>
                  Provide your professional credentials for verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="licenseNumber">License Number *</Label>
                      <Input
                        id="licenseNumber"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="e.g., LIC-2020-12345"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="licenseExpiry">License Expiry Date *</Label>
                      <Input
                        id="licenseExpiry"
                        type="date"
                        value={licenseExpiry}
                        onChange={(e) => setLicenseExpiry(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="barAssociation">Bar Association</Label>
                    <Input
                      id="barAssociation"
                      value={barAssociation}
                      onChange={(e) => setBarAssociation(e.target.value)}
                      placeholder="e.g., Ethiopian Bar Association"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Verification Documents *</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload your bar license, ID, and any other supporting documents
                    </p>
                    <VerificationDocumentUpload
                      onUploadComplete={setDocumentUrls}
                      existingDocuments={documentUrls}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-full"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Submit for Verification
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardShell>
  )
}
