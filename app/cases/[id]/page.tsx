"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { RatingDisplay } from "@/components/rating-display"
import { RatingForm } from "@/components/rating-form"
import { ArrowLeft, MapPin, DollarSign, Clock, AlertCircle, User, Briefcase, Star, Trash2 } from "lucide-react"

export default function CaseDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const caseId = params.id as string

  const [loading, setLoading] = useState(true)
  const [caseData, setCaseData] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [ratings, setRatings] = useState<any[]>([])
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchCase()
    fetchUser()
    fetchRatings()
  }, [caseId])

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (err) {
      console.error("Failed to fetch user:", err)
    }
  }

  const fetchCase = async () => {
    try {
      const res = await fetch(`/api/cases/details?id=${caseId}`, {
        credentials: "include",
      })

      if (!res.ok) {
        setError("Failed to load case")
        setLoading(false)
        return
      }

      const data = await res.json()
      setCaseData(data.case)
      setApplications(data.applications || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const fetchRatings = async () => {
    try {
      const res = await fetch(`/api/ratings?case_id=${caseId}`, {
        credentials: "include",
      })

      if (res.ok) {
        const data = await res.json()
        setRatings(data.ratings || [])
      }
    } catch (err) {
      console.error("Failed to fetch ratings:", err)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-32 pb-20 px-6 bg-background flex items-center justify-center">
          <div className="w-full max-w-2xl h-96 rounded-2xl bg-secondary/50 border border-border/50 animate-pulse" />
        </div>
        <Footer />
      </>
    )
  }

  if (!caseData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-32 pb-20 px-6 bg-background flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Case not found</h2>
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-32 pb-20 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
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
            {/* Case Header */}
            <div className="rounded-2xl bg-card border border-border/50 p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-4xl font-serif font-bold text-foreground mb-2">{caseData.title}</h1>
                  <p className="text-lg text-muted-foreground">{caseData.category}</p>
                </div>
                <Badge className="text-lg px-4 py-2">
                  {caseData.status === "open" ? "Open" : caseData.status === "closed" ? "Closed" : "Pending"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-border/50">
                {caseData.budget_min && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Budget</p>
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      ETB {caseData.budget_min} - {caseData.budget_max}
                    </p>
                  </div>
                )}
                {caseData.location && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Location</p>
                    </div>
                    <p className="text-lg font-semibold text-foreground">{caseData.location}</p>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Posted</p>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {new Date(caseData.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Applications</p>
                  </div>
                  <p className="text-lg font-semibold text-foreground">{applications.length}</p>
                </div>
              </div>
            </div>

            {/* Case Description */}
            <div className="rounded-2xl bg-card border border-border/50 p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Case Details</h2>
              <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {caseData.description}
              </p>
            </div>

            {/* Client Info */}
            <div className="rounded-2xl bg-card border border-border/50 p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Client Information
              </h2>
              <div className="space-y-3">
                <p>
                  <span className="text-muted-foreground">Name:</span>{" "}
                  <span className="font-semibold text-foreground">
                    {caseData.first_name} {caseData.last_name}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <span className="font-semibold text-foreground">{caseData.email}</span>
                </p>
                {caseData.phone && (
                  <p>
                    <span className="text-muted-foreground">Phone:</span>{" "}
                    <span className="font-semibold text-foreground">{caseData.phone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Applications */}
            {applications.length > 0 && user?.id === caseData.client_id && (
              <div className="rounded-2xl bg-card border border-border/50 p-8 mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Applications ({applications.length})
                </h2>
                <div className="space-y-4">
                  {applications.map((app, index) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-xl bg-secondary/50 border border-border/50 p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {app.first_name} {app.last_name}
                          </h3>
                          {app.specialization && (
                            <p className="text-sm text-muted-foreground">{app.specialization}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={app.status === "pending" ? "default" : app.status === "accepted" ? "default" : "secondary"}>
                            {app.status}
                          </Badge>
                          {app.status === "pending" && caseData.status === "open" && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                                onClick={async () => {
                                  if (window.confirm(`Are you sure you want to hire ${app.first_name} ${app.last_name}? This will lock the case and create a conversation.`)) {
                                    await fetch("/api/applications", {
                                      method: "PUT",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ applicationId: app.id, status: "accepted" })
                                    });
                                    window.location.reload();
                                  }
                                }}
                              >
                                Accept Bid
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                                onClick={async () => {
                                  if (window.confirm("Reject this bid?")) {
                                    await fetch("/api/applications", {
                                      method: "PUT",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ applicationId: app.id, status: "rejected" })
                                    });
                                    window.location.reload();
                                  }
                                }}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      {app.cover_letter && (
                        <p className="text-sm text-muted-foreground mb-4">{app.cover_letter}</p>
                      )}
                      {app.bid_amount && (
                        <p className="text-sm font-semibold text-primary">
                          Bid: ETB {app.bid_amount}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Ratings Section */}
            {user?.role === "client" && user?.id === caseData.client_id && caseData.status === "closed" && (
              <div className="rounded-2xl bg-card border border-border/50 p-8 mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Rate the Lawyer
                </h2>
                <RatingForm caseId={caseId} lawyerId={caseData.assigned_lawyer_id} onSuccess={fetchRatings} />
              </div>
            )}

            {/* Reviews Section */}
            {ratings.length > 0 && (
              <div className="rounded-2xl bg-card border border-border/50 p-8 mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Reviews ({ratings.length})
                </h2>
                <RatingDisplay ratings={ratings} />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              {user?.role === "lawyer" && caseData.status === "open" && (
                <Button
                  onClick={() => router.push(`/cases/${caseId}/apply`)}
                  className="flex-1 rounded-xl h-12 text-base"
                >
                  Apply for This Case
                </Button>
              )}
              {user?.id === caseData.client_id && (
                <>
                  <Button
                    onClick={() => router.push(`/dashboard/client`)}
                    className="flex-1 rounded-xl h-12 text-base"
                  >
                    Go to My Cases
                  </Button>
                  {caseData.status === "pending" && (
                    <Button
                      variant="default"
                      className="flex-1 rounded-xl h-12 text-base bg-emerald-600 hover:bg-emerald-700"
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to mark this case as completed and close it? You'll then be able to leave a rating.")) {
                          try {
                            const res = await fetch("/api/cases/close", {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: caseId })
                            });
                            if (res.ok) window.location.reload();
                          } catch (e) {
                            console.error(e);
                          }
                        }
                      }}
                    >
                      <Star className="w-5 h-5 mr-2" />
                      Mark as Completed
                    </Button>
                  )}

                  {caseData.status === "open" && (
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to delete this case? This action cannot be undone.")) {
                          try {
                            const res = await fetch(`/api/cases/details?id=${caseId}`, { method: "DELETE" });
                            if (res.ok) router.push("/dashboard/client/cases");
                          } catch (e) {
                            console.error("Failed to delete case", e);
                          }
                        }
                      }}
                      className="flex-1 rounded-xl h-12 text-base"
                    >
                      <Trash2 className="w-5 h-5 mr-2" />
                      Delete Case
                    </Button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  )
}
