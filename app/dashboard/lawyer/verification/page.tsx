"use client"

import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Shield, CheckCircle2, AlertCircle, Upload } from "lucide-react"

const verificationSteps = [
  {
    id: 1,
    title: "Identity Verification",
    description: "Verify your personal identity with government-issued ID",
    status: "completed",
    date: "Completed on Feb 15, 2026",
  },
  {
    id: 2,
    title: "Bar License",
    description: "Upload and verify your bar license",
    status: "completed",
    date: "Completed on Feb 20, 2026",
  },
  {
    id: 3,
    title: "Professional References",
    description: "Provide references from colleagues or judges",
    status: "pending",
    date: "Pending review",
  },
  {
    id: 4,
    title: "Background Check",
    description: "Professional background verification",
    status: "in_progress",
    date: "In progress",
  },
]

export default function LawyerVerificationPage() {
  return (
    <DashboardShell role="lawyer">
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold font-serif md:text-3xl">Verification & Credentials</h1>
          <p className="mt-1 text-muted-foreground">Complete your verification to unlock all features and build client trust.</p>
        </motion.div>

        {/* Verification Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8"
        >
          <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-lg font-bold text-foreground">Verification Progress</p>
                  <p className="text-sm text-muted-foreground">2 of 4 steps completed</p>
                </div>
                <Badge className="text-base px-3 py-1">50%</Badge>
              </div>
              <div className="flex gap-2 h-2 rounded-full bg-secondary/50 overflow-hidden">
                <div className="w-1/2 bg-primary rounded-full" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Verification Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          {verificationSteps.map((step) => (
            <Card key={step.id} className={`border-border/50 ${
              step.status === "completed" ? "bg-emerald-500/5" : step.status === "in_progress" ? "bg-amber-500/5" : ""
            }`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      step.status === "completed" ? "bg-emerald-500/10 text-emerald-600" :
                      step.status === "in_progress" ? "bg-amber-500/10 text-amber-600" :
                      "bg-secondary text-muted-foreground"
                    }`}>
                      {step.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : step.status === "in_progress" ? (
                        <AlertCircle className="h-5 w-5" />
                      ) : (
                        <Shield className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">{step.title}</CardTitle>
                      <CardDescription className="mt-1">{step.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={
                    step.status === "completed" ? "default" :
                    step.status === "in_progress" ? "outline" :
                    "secondary"
                  } className="text-[10px] shrink-0">
                    {step.status === "completed" ? "Verified" :
                     step.status === "in_progress" ? "In Progress" :
                     "Pending"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{step.date}</p>
                {step.status !== "completed" && (
                  <Button size="sm" className="mt-4 rounded-full w-full">
                    <Upload className="h-3.5 w-3.5 mr-2" />
                    {step.status === "pending" ? "Upload Documents" : "View Status"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Professional Information</CardTitle>
              <CardDescription>Details used for verification and client profiles</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>License Number</Label>
                  <Input defaultValue="LIC-2020-12345" className="bg-secondary/50 border-border/50" disabled />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Bar Council</Label>
                  <Input defaultValue="Ethiopian Bar Association" className="bg-secondary/50 border-border/50" disabled />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Specializations</Label>
                <Textarea
                  defaultValue="Family Law, Property Disputes, Criminal Defense"
                  className="bg-secondary/50 border-border/50 min-h-20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Professional Bio</Label>
                <Textarea
                  defaultValue="Experienced family law attorney with 10+ years of practice. Specialized in divorce settlements, custody mediation, and property disputes."
                  className="bg-secondary/50 border-border/50 min-h-24"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="rounded-full">Save Changes</Button>
                <Button variant="outline" className="rounded-full">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardShell>
  )
}
