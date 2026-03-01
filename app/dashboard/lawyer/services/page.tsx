"use client"

import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye } from "lucide-react"

const services = [
  {
    id: 1,
    title: "Family Law Consultation",
    category: "Family Law",
    price: "500 ETB/hour",
    description: "Expert guidance on divorce, custody, and family matters.",
    rating: 4.9,
    reviews: 27,
    active: true,
    inquiries: 5,
  },
  {
    id: 2,
    title: "Divorce Settlement",
    category: "Family Law",
    price: "2,000-3,500 ETB",
    description: "Complete divorce settlement and agreement drafting.",
    rating: 4.8,
    reviews: 19,
    active: true,
    inquiries: 3,
  },
  {
    id: 3,
    title: "Business Contract Review",
    category: "Business Contracts",
    price: "1,500 ETB/document",
    description: "Thorough review and negotiation of business contracts.",
    rating: 4.9,
    reviews: 31,
    active: true,
    inquiries: 8,
  },
  {
    id: 4,
    title: "Property Dispute Resolution",
    category: "Property Disputes",
    price: "3,000-5,000 ETB",
    description: "Legal representation for property boundary and ownership disputes.",
    rating: 4.7,
    reviews: 15,
    active: true,
    inquiries: 2,
  },
  {
    id: 5,
    title: "Trademark Registration",
    category: "Legal Documents",
    price: "800 ETB",
    description: "Assistance with trademark registration process.",
    rating: 4.6,
    reviews: 8,
    active: false,
    inquiries: 0,
  },
]

export default function LawyerServicesPage() {
  return (
    <DashboardShell role="lawyer">
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold font-serif md:text-3xl">My Services</h1>
            <p className="mt-1 text-muted-foreground">Manage and create your legal service offerings.</p>
          </div>
          <Button className="rounded-full gap-2">
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        </motion.div>

        {/* Services Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Card className="border-border/50 h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base">{service.title}</CardTitle>
                      <CardDescription className="mt-1">{service.category}</CardDescription>
                    </div>
                    <Badge variant={service.active ? "default" : "secondary"} className="text-[10px] shrink-0">
                      {service.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground">{service.description}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div>
                      <p className="text-lg font-bold text-primary">{service.price}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ★ {service.rating} ({service.reviews} reviews)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{service.inquiries}</p>
                      <p className="text-xs text-muted-foreground">Active inquiries</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button size="sm" variant="outline" className="rounded-lg gap-1.5 flex-1">
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-lg gap-1.5 text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}
