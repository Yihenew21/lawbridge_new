"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import {
  Scale,
  LayoutDashboard,
  FileText,
  MessageSquare,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  Briefcase,
  Bell,
  Shield,
  ChevronDown,
} from "lucide-react"

interface DashboardShellProps {
  children: React.ReactNode
  role: "client" | "lawyer"
}

const clientLinks = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard/client" },
  { icon: FileText, label: "My Cases", href: "/dashboard/client/cases" },
  { icon: MessageSquare, label: "Messages", href: "/dashboard/client/messages", badge: 3 },
  { icon: CreditCard, label: "Payments", href: "/dashboard/client/payments" },
  { icon: Settings, label: "Settings", href: "/dashboard/client/settings" },
]

const lawyerLinks = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard/lawyer" },
  { icon: Briefcase, label: "My Services", href: "/dashboard/lawyer/services" },
  { icon: FileText, label: "Active Cases", href: "/dashboard/lawyer/cases" },
  { icon: MessageSquare, label: "Messages", href: "/dashboard/lawyer/messages", badge: 5 },
  { icon: CreditCard, label: "Earnings", href: "/dashboard/lawyer/earnings" },
  { icon: Shield, label: "Verification", href: "/dashboard/lawyer/verification" },
  { icon: Settings, label: "Settings", href: "/dashboard/lawyer/settings" },
]

export function DashboardShell({ children, role }: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const links = role === "client" ? clientLinks : lawyerLinks
  const userName = user ? `${user.first_name} ${user.last_name?.charAt(0) || ""}.` : role === "client" ? "Client" : "Lawyer"
  const userRole = user?.role === "lawyer" ? "Verified Lawyer" : user?.role === "student" ? "Student" : "Client"

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-[280px] lg:flex-col lg:fixed lg:inset-y-0 border-r border-border/50 bg-card/50">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border/50">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Scale className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight font-serif text-foreground">LawBridge</span>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-4">
            <div className="flex flex-col gap-1">
              {links.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    )}
                  >
                    <link.icon className="h-4.5 w-4.5" />
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>

          <div className="border-t border-border/50 p-4">
            <div className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                {userName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                <p className="text-xs text-muted-foreground">{userRole}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 py-3 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Scale className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight font-serif text-foreground">LawBridge</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm">
            <Bell className="h-4.5 w-4.5" />
          </Button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-border/50 bg-card lg:hidden"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Scale className="h-4 w-4" />
                    </div>
                    <span className="text-lg font-bold tracking-tight font-serif text-foreground">LawBridge</span>
                  </Link>
                  <button onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
                <nav className="flex-1 px-4 py-4">
                  <div className="flex flex-col gap-1">
                    {links.map((link) => {
                      const isActive = pathname === link.href
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                            isActive
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                          )}
                        >
                          <link.icon className="h-4.5 w-4.5" />
                          <span>{link.label}</span>
                          {link.badge && (
                            <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </nav>
                <div className="border-t border-border/50 p-4">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-[280px]">
        <div className="pt-16 lg:pt-0">
          {children}
        </div>
      </div>
    </div>
  )
}
