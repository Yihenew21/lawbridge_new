"use client"

import { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  HelpCircle,
  BookOpen,
  Users,
  CreditCard,
  Shield,
  MessageSquare,
  FileText,
  ChevronRight
} from "lucide-react"
import Link from "next/link"

const helpCategories = [
  {
    icon: Users,
    title: "Getting Started",
    description: "Learn the basics of using LawBridge",
    articles: [
      { title: "How to create an account", href: "#" },
      { title: "Finding the right lawyer", href: "#" },
      { title: "Posting your first case", href: "#" },
      { title: "Understanding lawyer profiles", href: "#" },
    ]
  },
  {
    icon: FileText,
    title: "For Clients",
    description: "Help for clients seeking legal services",
    articles: [
      { title: "How to post a case", href: "#" },
      { title: "Reviewing lawyer applications", href: "#" },
      { title: "Managing your cases", href: "#" },
      { title: "Communication with lawyers", href: "#" },
    ]
  },
  {
    icon: Shield,
    title: "For Lawyers",
    description: "Resources for legal professionals",
    articles: [
      { title: "Lawyer verification process", href: "#" },
      { title: "Applying to cases", href: "#" },
      { title: "Building your profile", href: "#" },
      { title: "Publishing insights", href: "#" },
    ]
  },
  {
    icon: CreditCard,
    title: "Payments & Billing",
    description: "Understanding payments and transactions",
    articles: [
      { title: "How payments work", href: "#" },
      { title: "Escrow system explained", href: "#" },
      { title: "Withdrawal process", href: "#" },
      { title: "Payment disputes", href: "#" },
    ]
  },
  {
    icon: MessageSquare,
    title: "Communication",
    description: "Messaging and notifications",
    articles: [
      { title: "Using the messaging system", href: "#" },
      { title: "Notification settings", href: "#" },
      { title: "Video consultations", href: "#" },
      { title: "Document sharing", href: "#" },
    ]
  },
  {
    icon: BookOpen,
    title: "Legal Resources",
    description: "Educational content and guides",
    articles: [
      { title: "Understanding Ethiopian law", href: "#" },
      { title: "Legal terminology guide", href: "#" },
      { title: "Case preparation tips", href: "#" },
      { title: "Your legal rights", href: "#" },
    ]
  },
]

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex h-10 items-center justify-center rounded-full border border-primary/20 bg-primary/5 px-5 mb-6">
            <HelpCircle className="w-4 h-4 mr-2 text-primary" />
            <span className="text-sm font-medium text-primary">Support Center</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight mb-6">
            How can we <span className="text-primary italic">help</span> you?
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Search our knowledge base or browse categories below
          </p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg rounded-2xl border-border/50 focus:border-primary"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 flex flex-wrap justify-center gap-3"
        >
          <Link href="/support/contact">
            <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-primary/10 hover:border-primary transition-all">
              Contact Support
            </Badge>
          </Link>
          <Link href="/support/faq">
            <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-primary/10 hover:border-primary transition-all">
              FAQ
            </Badge>
          </Link>
          <Link href="/support/report">
            <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-primary/10 hover:border-primary transition-all">
              Report an Issue
            </Badge>
          </Link>
        </motion.div>

        {/* Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {helpCategories.map((category, idx) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
            >
              <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all duration-300 border-border/50">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {category.articles.map((article) => (
                      <li key={article.title}>
                        <Link
                          href={article.href}
                          className="flex items-center justify-between text-sm text-muted-foreground hover:text-primary transition-colors group"
                        >
                          <span>{article.title}</span>
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Still Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-8 pb-8 text-center">
              <h2 className="text-2xl font-bold mb-3">Still need help?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Can't find what you're looking for? Our support team is here to assist you.
              </p>
              <Link href="/support/contact">
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium">
                  Contact Support Team
                </button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </main>
  )
}
