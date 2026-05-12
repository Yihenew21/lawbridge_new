"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
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
import { Bell, Lock, User, LogOut, AlertCircle, Shield } from "lucide-react"
import AvatarUpload from "@/components/AvatarUpload"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

export default function LawyerSettingsPage() {
  const { user, mutate } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
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
    specialization: "",
    bio: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    caseUpdates: true,
    newApplications: true,
    messages: true,
  })

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        specialization: user.specialization || "",
        bio: user.bio || "",
      })
      setLoading(false)
    }
  }, [user])

  const handleSaveProfile = async () => {
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
      } else {
        toast.error("Failed to update profile")
      }
    } catch (err) {
      console.error("Failed to save profile:", err)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return
    }

    setPasswordLoading(true)
    setPasswordError("")
    setPasswordSuccess("")

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (res.ok) {
        setPasswordSuccess("Password changed successfully")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        const data = await res.json()
        setPasswordError(data.error || "Failed to change password")
      }
    } catch (err) {
      setPasswordError("An error occurred")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      window.location.href = "/"
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  return (
    <DashboardShell role="lawyer">
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold font-serif md:text-3xl">Settings</h1>
          <p className="mt-1 text-muted-foreground">Manage your account and preferences</p>
        </motion.div>

        <Tabs defaultValue="profile" className="max-w-2xl">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="2fa">2FA</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your professional profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Profile Picture */}
                  <div className="flex justify-center py-4">
                    <AvatarUpload
                      currentAvatarUrl={user?.avatar_url}
                      onUploadSuccess={async () => {
                        await mutate();
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        className="mt-2 bg-secondary/50 border-border/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        className="mt-2 bg-secondary/50 border-border/50"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="mt-2 bg-secondary/50 border-border/50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="mt-2 bg-secondary/50 border-border/50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      className="mt-2 bg-secondary/50 border-border/50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="mt-2 bg-secondary/50 border-border/50 min-h-24"
                      placeholder="Tell clients about your experience and expertise..."
                    />
                  </div>

                  <Button onClick={handleSaveProfile} disabled={saving} className="mt-4">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {passwordError && (
                    <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-destructive">{passwordError}</span>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm text-emerald-500">{passwordSuccess}</span>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="current">Current Password</Label>
                    <Input
                      id="current"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="mt-2 bg-secondary/50 border-border/50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="new">New Password</Label>
                    <Input
                      id="new"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="mt-2 bg-secondary/50 border-border/50"
                      placeholder="Min. 8 characters"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirm">Confirm Password</Label>
                    <Input
                      id="confirm"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="mt-2 bg-secondary/50 border-border/50"
                    />
                  </div>

                  <Button onClick={handleChangePassword} disabled={passwordLoading} className="mt-4">
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-border/50 border-destructive/20 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" onClick={handleLogout} className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* 2FA Tab */}
          <TabsContent value="2fa" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
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
                          try {
                            const res = await fetch('/api/auth/2fa/setup', {
                              method: 'POST',
                              credentials: 'include'
                            })
                            if (res.ok) {
                              const data = await res.json()
                              setTwoFactorSetup(data)
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
            </motion.div>
          </TabsContent>

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
          <TabsContent value="notifications" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: "emailNotifications", label: "Email Notifications", description: "Receive email updates" },
                    { key: "caseUpdates", label: "Case Updates", description: "Get notified about case progress" },
                    { key: "newApplications", label: "New Applications", description: "Alerts when clients apply" },
                    { key: "messages", label: "Message Notifications", description: "Notify about new messages" },
                  ].map((pref) => (
                    <div key={pref.key} className="flex items-center justify-between pb-4 border-b border-border/50 last:border-0">
                      <div>
                        <p className="font-medium text-sm">{pref.label}</p>
                        <p className="text-xs text-muted-foreground">{pref.description}</p>
                      </div>
                      <Switch
                        checked={notifications[pref.key as keyof typeof notifications]}
                        onCheckedChange={(checked) =>
                          setNotifications({...notifications, [pref.key]: checked})
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
