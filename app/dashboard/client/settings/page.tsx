"use client"

import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Lock, Bell, Shield, LogOut } from "lucide-react"

const sections = [
  {
    id: "profile",
    title: "Profile Information",
    icon: User,
    description: "Update your personal details",
  },
  {
    id: "password",
    title: "Password & Security",
    icon: Lock,
    description: "Change your password and manage security",
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: Bell,
    description: "Control how you receive updates",
  },
  {
    id: "privacy",
    title: "Privacy & Data",
    icon: Shield,
    description: "Manage your data and privacy settings",
  },
]

export default function ClientSettingsPage() {
  return (
    <DashboardShell role="client">
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold font-serif md:text-3xl">Settings</h1>
          <p className="mt-1 text-muted-foreground">Manage your account and preferences.</p>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 flex flex-col gap-2"
          >
            {sections.map((section) => (
              <button
                key={section.id}
                className="flex items-start gap-3 rounded-xl border border-border/50 bg-secondary/30 p-4 text-left transition-all hover:border-primary/20 hover:bg-secondary/50"
              >
                <section.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">{section.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                </div>
              </button>
            ))}
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input defaultValue="Meron" className="bg-secondary/50 border-border/50" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input defaultValue="Tesfaye" className="bg-secondary/50 border-border/50" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input defaultValue="meron@example.com" type="email" className="bg-secondary/50 border-border/50" />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input defaultValue="+251 911 234567" className="bg-secondary/50 border-border/50" />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    placeholder="Tell us about yourself..."
                    defaultValue="Experienced professional seeking legal guidance."
                    className="bg-secondary/50 border-border/50 min-h-24"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="rounded-full">Save Changes</Button>
                  <Button variant="outline" className="rounded-full">Cancel</Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/30 bg-destructive/5 mt-6">
              <CardHeader>
                <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible and destructive actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Delete Account</p>
                    <p className="text-xs text-muted-foreground mt-1">Permanently delete your account and all associated data.</p>
                  </div>
                  <Button variant="destructive" className="rounded-full">Delete</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardShell>
  )
}
