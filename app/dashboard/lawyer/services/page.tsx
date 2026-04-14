"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, Star, X } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function LawyerServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    description: "",
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/lawyer/services", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setServices(data.services || [])
      }
    } catch (err) {
      console.error("Failed to fetch services:", err)
      toast.error("Failed to fetch services")
    } finally {
      setLoading(false)
    }
  }

  const handleAddService = async () => {
    if (!formData.title || !formData.category || !formData.price || !formData.description) {
      toast.error("Please fill in all fields")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/lawyer/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setIsModalOpen(false)
        setFormData({ title: "", category: "", price: "", description: "" })
        fetchServices()
        toast.success("Service added successfully!")
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to add service")
      }
    } catch (e) {
      console.error(e)
      toast.error("An unexpected error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteService = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return
    try {
      const res = await fetch(`/api/lawyer/services/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (res.ok) {
        toast.success("Service deleted")
        fetchServices()
      } else {
        toast.error("Failed to delete service")
      }
    } catch (err) {
      toast.error("Failed to delete")
    }
  }

  return (
    <DashboardShell role="lawyer">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold font-serif md:text-3xl">My Services</h1>
            <p className="mt-1 text-muted-foreground">Manage your legal services and offerings</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="rounded-full gap-2">
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        </motion.div>

        {/* Services Grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <>
              <div className="h-64 bg-secondary/50 rounded-lg animate-pulse" />
              <div className="h-64 bg-secondary/50 rounded-lg animate-pulse" />
              <div className="h-64 bg-secondary/50 rounded-lg animate-pulse" />
            </>
          ) : services.length === 0 ? (
            <Card className="border-border/50 col-span-full">
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-muted-foreground">No services yet</p>
              </CardContent>
            </Card>
          ) : (
            services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card className="border-border/50 bg-card hover:border-primary/20 transition-all h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <CardTitle className="text-base">{service.title}</CardTitle>
                        <Badge variant="secondary" className="mt-2">{service.category}</Badge>
                      </div>
                      {service.active && (
                        <Badge className="shrink-0">Active</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div>
                        <p className="text-lg font-bold text-primary">{service.price}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs text-muted-foreground">{service.rating} ({service.reviews} reviews)</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">{service.inquiries} inquiries</Badge>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 gap-1">
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteService(service.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl bg-card border border-border/50 p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Add New Service</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                disabled={submitting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Service Title</Label>
                <Input
                  placeholder="e.g. Legal Consultation"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Input
                    placeholder="e.g. Family Law"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Price Formatter</Label>
                  <Input
                    placeholder="e.g. 500 ETB/hr"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your service..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-2 min-h-[100px]"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddService}
                disabled={submitting}
              >
                {submitting ? "Publishing..." : "Publish Service"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardShell>
  )
}
