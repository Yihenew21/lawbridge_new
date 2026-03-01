"use client"

import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Download, Filter, Plus } from "lucide-react"

const payments = [
  {
    id: 1,
    case: "Child Custody Mediation",
    lawyer: "Abeba Tesfaye",
    amount: "3,500 ETB",
    status: "Completed",
    date: "Feb 27, 2026",
    method: "Bank Transfer",
    invoice: "#INV-2026-001",
  },
  {
    id: 2,
    case: "Divorce Settlement Review",
    lawyer: "Solomon Bekele",
    amount: "4,500 ETB",
    status: "Completed",
    date: "Feb 22, 2026",
    method: "Card Payment",
    invoice: "#INV-2026-002",
  },
  {
    id: 3,
    case: "Business Partnership Agreement",
    lawyer: "Dawit Mengistu",
    amount: "5,000 ETB",
    status: "Pending",
    date: "Mar 5, 2026",
    method: "Bank Transfer",
    invoice: "#INV-2026-003",
  },
  {
    id: 4,
    case: "Property Boundary Dispute",
    lawyer: "Solomon Bekele",
    amount: "3,800 ETB",
    status: "Partial",
    date: "Mar 1, 2026",
    method: "Card Payment",
    invoice: "#INV-2026-004",
  },
]

const stats = [
  { label: "Total Spent", value: "45,200 ETB", trend: "This quarter" },
  { label: "Outstanding", value: "8,800 ETB", trend: "2 pending invoices" },
  { label: "Average Payment", value: "4,300 ETB", trend: "Per case" },
]

export default function ClientPaymentsPage() {
  return (
    <DashboardShell role="client">
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold font-serif md:text-3xl">Payments</h1>
            <p className="mt-1 text-muted-foreground">View and manage your invoices and payments.</p>
          </div>
          <Button className="rounded-full gap-2">
            <Plus className="h-4 w-4" />
            Add Payment Method
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{stat.trend}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Payments Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Payment History</CardTitle>
                  <CardDescription>All your transactions and invoices</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="rounded-full gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Case</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Lawyer</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Invoice</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, i) => (
                      <motion.tr
                        key={payment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <p className="font-medium text-foreground">{payment.case}</p>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{payment.lawyer}</td>
                        <td className="py-3 px-4 font-semibold text-primary">{payment.amount}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              payment.status === "Completed"
                                ? "default"
                                : payment.status === "Pending"
                                  ? "outline"
                                  : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">{payment.date}</td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">{payment.invoice}</td>
                        <td className="py-3 px-4">
                          <Button size="sm" variant="ghost" className="gap-1.5 text-primary">
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardShell>
  )
}
