"use client"

import { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, HelpCircle, ChevronDown, ChevronUp } from "lucide-react"

const faqData = [
  {
    category: "General",
    questions: [
      {
        question: "What is LawBridge?",
        answer: "LawBridge is Ethiopia's first legal services marketplace that connects clients with verified lawyers. We provide a secure platform for posting legal cases, finding qualified lawyers, and managing legal services efficiently."
      },
      {
        question: "How does LawBridge work?",
        answer: "Clients post their legal cases on our platform, verified lawyers review and apply to cases they're qualified for, clients select their preferred lawyer, and all communication and payments are handled securely through our platform."
      },
      {
        question: "Is LawBridge free to use?",
        answer: "Creating an account and browsing lawyers is free. We charge a small service fee on completed transactions to maintain the platform and ensure quality service."
      },
    ]
  },
  {
    category: "For Clients",
    questions: [
      {
        question: "How do I post a case?",
        answer: "After creating an account, go to your dashboard and click 'Post a Case'. Fill in the details about your legal issue, including category, description, and budget. Once submitted, verified lawyers will be able to review and apply."
      },
      {
        question: "How do I choose the right lawyer?",
        answer: "Review lawyer profiles, check their specializations, experience, ratings, and reviews from previous clients. You can also review their applications to your case and communicate with them before making a decision."
      },
      {
        question: "How are payments handled?",
        answer: "We use an escrow system. When you hire a lawyer, the payment is held securely by LawBridge. The funds are released to the lawyer only after you confirm the service has been completed satisfactorily."
      },
      {
        question: "What if I'm not satisfied with the service?",
        answer: "If you're not satisfied, you can raise a dispute through our platform. Our team will review the case and mediate between you and the lawyer to reach a fair resolution."
      },
    ]
  },
  {
    category: "For Lawyers",
    questions: [
      {
        question: "How do I become a verified lawyer on LawBridge?",
        answer: "Register as a lawyer, complete your profile, and submit your verification documents (license, bar association membership, etc.). Our team will review your application within 3-5 business days."
      },
      {
        question: "How do I get paid?",
        answer: "Once a client confirms service completion, funds are released from escrow to your LawBridge wallet. You can withdraw to your bank account at any time with no minimum threshold."
      },
      {
        question: "Can I set my own rates?",
        answer: "Yes, you can set your hourly rate or propose custom pricing when applying to cases. Clients can see your rates on your profile and in your applications."
      },
      {
        question: "How do I publish insights?",
        answer: "Go to your lawyer dashboard, navigate to the Insights section, and click 'Publish Insight'. You can share articles, videos, and legal advice to showcase your expertise."
      },
    ]
  },
  {
    category: "Payments & Security",
    questions: [
      {
        question: "Is my payment information secure?",
        answer: "Yes, we use industry-standard encryption and secure payment gateways. We never store your full payment card details on our servers."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept major credit/debit cards, mobile money (Telebirr, M-Pesa), and bank transfers for Ethiopian users."
      },
      {
        question: "How long does it take to receive a refund?",
        answer: "Approved refunds are processed within 5-7 business days. The time it takes to appear in your account depends on your payment method and bank."
      },
    ]
  },
  {
    category: "Account & Privacy",
    questions: [
      {
        question: "How do I reset my password?",
        answer: "Click 'Forgot Password' on the login page, enter your email, and we'll send you a password reset link. Follow the instructions in the email to create a new password."
      },
      {
        question: "Can I delete my account?",
        answer: "Yes, you can request account deletion from your settings page. Note that this action is permanent and all your data will be removed from our system."
      },
      {
        question: "How is my personal information protected?",
        answer: "We follow strict data protection policies and comply with privacy regulations. Your personal information is encrypted and never shared with third parties without your consent."
      },
    ]
  },
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openIndex, setOpenIndex] = useState<string | null>(null)

  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`
    setOpenIndex(openIndex === key ? null : key)
  }

  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

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
          <div className="inline-flex h-10 items-center justify-center rounded-full border border-primary/20 bg-primary/5 px-5 mb-6">
            <HelpCircle className="w-4 h-4 mr-2 text-primary" />
            <span className="text-sm font-medium text-primary">Frequently Asked Questions</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight mb-6">
            <span className="text-primary italic">FAQ</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Find answers to common questions about LawBridge
          </p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg rounded-2xl border-border/50 focus:border-primary"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {filteredFAQ.map((category, catIdx) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + catIdx * 0.05 }}
            >
              <div className="mb-4">
                <Badge variant="outline" className="px-3 py-1">
                  {category.category}
                </Badge>
              </div>
              <div className="space-y-3">
                {category.questions.map((item, qIdx) => {
                  const key = `${catIdx}-${qIdx}`
                  const isOpen = openIndex === key

                  return (
                    <Card
                      key={qIdx}
                      className="border-border/50 hover:border-primary/30 transition-all cursor-pointer"
                      onClick={() => toggleQuestion(catIdx, qIdx)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-semibold text-foreground flex-1">
                            {item.question}
                          </h3>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                          )}
                        </div>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-4 text-muted-foreground leading-relaxed"
                          >
                            {item.answer}
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Still Have Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-8 pb-8 text-center">
              <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
              <p className="text-muted-foreground mb-6">
                Can't find the answer you're looking for? Contact our support team.
              </p>
              <a href="/support/contact">
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium">
                  Contact Support
                </button>
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </main>
  )
}
