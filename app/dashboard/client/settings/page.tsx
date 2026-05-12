"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { User, Lock, Bell, Shield, LogOut, Save, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import AvatarUpload from "@/components/AvatarUpload"
import { useAuth } from "@/hooks/use-auth"

export default function ClientSettingsPage() {
  const router = useRouter()
  const { user, mutate } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("profile")
  const [saving, setSaving] = useState(false)
  const [twoFactorLoading, setTwoFactorLoading] = useState(false)
  const [twoFactorError, setTwoFactorError] = useState("")
  const [twoFactorSetup, setTwoFactorSetup] = useState<any>(null)
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [showDisable2FADialog, setShowDisable2FADialog] = useState(false)

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  })

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const [notifications, setNotifications] = useState({
    case_updates: true,
    new_messages: true,
    payment_reminders: true,
    weekly_digest: false,
  })

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
      })
      setLoading(false)
    }
  }, [user])

  const handleUpdateProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        await mutate()
        toast.success("Profile updated successfully!")
      }
    } catch (err) {
      console.error("Failed to update profile:", err)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (password.new !== password.confirm) {
      toast.error("Passwords do not match")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: password.current,
          newPassword: password.new,
        }),
      })

      if (res.ok) {
        setPassword({ current: "", new: "", confirm: "" })
        toast.success("Password changed successfully!")
      } else {
        toast.error("Failed to change password")
      }
    } catch (err) {
      console.error("Failed to change password:", err)
      toast.error("Failed to change password")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      router.push("/auth/login")
    } catch (err) {
      console.error("Failed to logout:", err)
    }
  }

  const sections = [
    { id: "profile", title: "Profile Information", icon: User },
    { id: "password", title: "Password & Security", icon: Lock },
    { id: "2fa", title: "Two-Factor Auth", icon: Shield },
    { id: "notifications", title: "Notifications", icon: Bell },
  ]

  if (loading) return null

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

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                    activeTab === section.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-foreground hover:bg-secondary"
                  }`}
                >
                  <section.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{section.title}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex justify-center py-4">
                    <AvatarUpload
                      currentAvatarUrl={user?.avatar_url}
                      onUploadSuccess={async () => {
                        await mutate();
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleUpdateProfile} disabled={saving} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Password & Security</CardTitle>
                  <CardDescription>Change your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="current">Current Password</Label>
                    <Input
                      id="current"
                      type="password"
                      value={password.current}
                      onChange={(e) => setPassword({ ...password, current: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new">New Password</Label>
                    <Input
                      id="new"
                      type="password"
                      value={password.new}
                      onChange={(e) => setPassword({ ...password, new: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm">Confirm Password</Label>
                    <Input
                      id="confirm"
                      type="password"
                      value={password.confirm}
                      onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleChangePassword} disabled={saving} className="gap-2">
                      <Lock className="h-4 w-4" />
                      Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 2FA Tab */}
            {activeTab === "2fa" && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {twoFactorError && (
                    <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-destructive">{twoFactorError}</span>
                    </div>
                  )}

                  {!user?.two_factor_enabled ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Two-factor authentication is not enabled on your account. Enable it to add an extra layer of security.
                      </p>
                      <Button
                        onClick={async () => {
                          setTwoFactorLoading(true)
                          setTwoFactorError('')
                          try {
                            const res = await fetch('/api/auth/2fa/setup', {
                              method: 'POST',
                              credentials: 'include'
                            })
                            if (res.ok) {
                              const data = await res.json()
                              setTwoFactorSetup(data)
                            } else {
                              setTwoFactorError('Failed to setup 2FA')
                            }
                          } catch (err) {
                            setTwoFactorError('Failed to setup 2FA')
                          } finally {
                            setTwoFactorLoading(false)
                          }
                        }}
                        disabled={twoFactorLoading}
                      >
                        {twoFactorLoading ? 'Setting up...' : 'Enable 2FA'}
                      </Button>

                      {twoFactorSetup && (
                        <div className="space-y-4 mt-4">
                          <div className="bg-secondary/50 p-4 rounded-lg">
                            <p className="text-sm font-medium mb-3">Scan this code with your authenticator app:</p>
                            <div className="bg-white p-3 rounded inline-block mb-3">
                              <img src={twoFactorSetup.qrCode} alt="2FA QR Code" className="w-48 h-48" />
                            </div>
                            <div className="mt-3">
                              <p className="text-xs font-medium mb-2">Backup Codes (save these securely):</p>
                              <div className="bg-background p-3 rounded text-xs font-mono space-y-1">
                                {twoFactorSetup.backupCodes?.map((code: string, i: number) => (
                                  <div key={i}>{code}</div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="2fa_code">Enter the 6-digit code:</Label>
                            <Input
                              id="2fa_code"
                              value={twoFactorCode}
                              onChange={(e) => setTwoFactorCode(e.target.value)}
                              placeholder="000000"
                              maxLength={6}
                              className="mt-2 text-center text-2xl tracking-widest text-foreground"
                            />
                          </div>
                          <Button
                            onClick={async () => {
                              setTwoFactorError('')
                              try {
                                const res = await fetch('/api/auth/2fa/verify', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  credentials: 'include',
                                  body: JSON.stringify({ code: twoFactorCode })
                                })
                                const data = await res.json()
                                if (res.ok) {
                                  setTwoFactorSetup(null)
                                  setTwoFactorCode('')
                                  await mutate()
                                  toast.success('2FA enabled successfully!')
                                } else {
                                  setTwoFactorError(data.error || 'Failed to verify code')
                                }
                              } catch (err) {
                                setTwoFactorError('Failed to verify code')
                              }
                            }}
                          >
                            Verify & Enable
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-3 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm text-emerald-700">Two-factor authentication is enabled</span>
                      </div>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => setShowDisable2FADialog(true)}
                        disabled={twoFactorLoading}
                      >
                        {twoFactorLoading ? 'Disabling...' : 'Disable 2FA'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Disable 2FA Confirmation Dialog */}
            <AlertDialog open={showDisable2FADialog} onOpenChange={setShowDisable2FADialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to disable 2FA? This will make your account less secure.
                    You can always enable it again later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={async () => {
                      setTwoFactorLoading(true)
                      setTwoFactorError('')
                      try {
                        const res = await fetch('/api/auth/2fa/disable', {
                          method: 'POST',
                          credentials: 'include'
                        })
                        if (res.ok) {
                          await mutate()
                          toast.success('2FA disabled successfully')
                        } else {
                          const data = await res.json()
                          setTwoFactorError(data.error || 'Failed to disable 2FA')
                        }
                      } catch (err) {
                        setTwoFactorError('Failed to disable 2FA')
                      } finally {
                        setTwoFactorLoading(false)
                      }
                    }}
                  >
                    Disable 2FA
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose what notifications you receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground capitalize">
                          {key.replace(/_/g, " ")}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            [key]: e.target.checked,
                          })
                        }
                        className="w-5 h-5"
                      />
                    </div>
                  ))}
                  <div className="flex justify-end pt-4">
                    <Button className="gap-2">
                      <Save className="h-4 w-4" />
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <Card className="border-destructive/50 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" onClick={handleLogout} className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </DashboardShell>
  )
}
