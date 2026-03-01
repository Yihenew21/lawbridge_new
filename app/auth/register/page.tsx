"use client"

import { Suspense, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Upload,
  CheckCircle2,
  Shield,
  AlertCircle,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const specialties = ["Family Law", "Property Disputes", "Business Contracts", "Criminal Defense", "Employment Law", "Legal Documents"]
const locations = ["Addis Ababa", "Bahir Dar", "Hawassa", "Dire Dawa", "Mekelle", "Jimma", "Adama"]

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register: registerUser } = useAuth()
  const initialRole = searchParams.get("role") === "lawyer" ? "lawyer" : searchParams.get("role") === "student" ? "student" : "client"

  const [role, setRole] = useState<"client" | "lawyer" | "student">(initialRole)
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState("")

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    location: "",
    specialty: "",
    barId: "",
    licenseNumber: "",
  })

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const totalSteps = role === "lawyer" ? 3 : 2

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < totalSteps) {
      setStep(step + 1)
      return
    }
    if (formData.password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    setLoading(true)
    setError("")
    try {
      const nameParts = formData.fullName.trim().split(" ")
      const first_name = nameParts[0] || ""
      const last_name = nameParts.slice(1).join(" ") || ""

      const user = await registerUser({
        email: formData.email,
        password: formData.password,
        first_name,
        last_name,
        role,
        phone: formData.phone || undefined,
        specialization: formData.specialty || undefined,
        license_number: formData.licenseNumber || undefined,
      })
      const dest = user.role === "lawyer" ? "/dashboard/lawyer" : user.role === "student" ? "/assistant" : "/dashboard/client"
      router.refresh()
      window.location.href = dest
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-card">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/3 left-1/4 h-64 w-64 rounded-full bg-primary/3 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link href="/" className="flex items-center gap-2.5 mb-12">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 ring-2 ring-primary/30 shadow-sm">
              <Image
                src="/logo.png"
                alt="LawBridge logo"
                width={44}
                height={44}
                className="h-9 w-9 object-contain"
                priority
              />
            </div>
            <span className="text-2xl font-bold tracking-tight font-serif text-foreground">LawBridge</span>
          </Link>

          <h2 className="font-serif text-4xl font-bold text-foreground leading-tight text-balance">
            {role === "client"
              ? "Get expert legal help in minutes"
              : "Grow your practice with LawBridge"}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-md">
            {role === "client"
              ? "Join thousands of Ethiopians who trust LawBridge to connect them with verified legal professionals."
              : "Reach more clients, manage cases efficiently, and get paid securely through our platform."}
          </p>

          <div className="mt-12">
            <div className="flex flex-col gap-4">
              {(role === "client"
                ? [
                    { icon: Shield, text: "All lawyers are verified and licensed" },
                    { icon: Lock, text: "Secure escrow payment system" },
                    { icon: CheckCircle2, text: "Satisfaction guaranteed or dispute resolution" },
                  ]
                : [
                    { icon: User, text: "Reach thousands of potential clients" },
                    { icon: Shield, text: "Verified badge builds client trust" },
                    { icon: CheckCircle2, text: "Get paid promptly and securely" },
                  ]
              ).map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-muted-foreground">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 ring-2 ring-primary/30 shadow-sm">
              <Image
                src="/logo.png"
                alt="LawBridge logo"
                width={40}
                height={40}
                className="h-8 w-8 object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight font-serif text-foreground">LawBridge</span>
          </div>

          <h1 className="text-2xl font-bold font-serif">Create your account</h1>
          <p className="mt-2 text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>

          {/* Role toggle */}
          <div className="mt-8 flex rounded-xl bg-secondary/50 p-1">
            {(["client", "lawyer", "student"] as const).map((r) => (
              <button
                key={r}
                onClick={() => { setRole(r); setStep(1); setError("") }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                  role === r
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === "client" ? "Client" : r === "lawyer" ? "Lawyer" : "Student"}
              </button>
            ))}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Progress */}
          <div className="mt-6 flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i < step ? "bg-primary" : "bg-secondary"
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-2">
              Step {step} of {totalSteps}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-5"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        className="pl-10 h-11 bg-secondary/50 border-border/50"
                        value={formData.fullName}
                        onChange={(e) => updateField("fullName", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="regEmail">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="regEmail"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10 h-11 bg-secondary/50 border-border/50"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="+251 9XX XXX XXX"
                        className="pl-10 h-11 bg-secondary/50 border-border/50"
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="regPassword">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="regPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password (min 8 chars)"
                        className="pl-10 pr-10 h-11 bg-secondary/50 border-border/50"
                        value={formData.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
                        className={`pl-10 pr-10 h-11 bg-secondary/50 border-border/50 ${
                          confirmPassword && confirmPassword !== formData.password
                            ? "border-destructive/50 focus-visible:ring-destructive/50"
                            : confirmPassword && confirmPassword === formData.password
                              ? "border-green-500/50 focus-visible:ring-green-500/50"
                              : ""
                        }`}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== formData.password && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Passwords do not match
                      </p>
                    )}
                    {confirmPassword && confirmPassword === formData.password && (
                      <p className="text-xs text-green-500 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Passwords match
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-5"
                >
                  <div className="flex flex-col gap-2">
                    <Label>Location</Label>
                    <Select value={formData.location} onValueChange={(v) => updateField("location", v)}>
                      <SelectTrigger className="h-11 bg-secondary/50 border-border/50">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Select your city" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {role === "lawyer" && (
                    <div className="flex flex-col gap-2">
                      <Label>Specialty</Label>
                      <Select value={formData.specialty} onValueChange={(v) => updateField("specialty", v)}>
                        <SelectTrigger className="h-11 bg-secondary/50 border-border/50">
                          <SelectValue placeholder="Select your specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          {specialties.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {role === "client" && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Almost done!</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            After creating your account, you can immediately browse lawyers and post your first case.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 3 && role === "lawyer" && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-5"
                >
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Verification Required</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          To ensure trust and quality, all lawyers must provide their Ethiopian Bar Association credentials.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="barId">Bar Registration ID</Label>
                    <Input
                      id="barId"
                      placeholder="Enter your Bar ID"
                      className="h-11 bg-secondary/50 border-border/50"
                      value={formData.barId}
                      onChange={(e) => updateField("barId", e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="license">License Number</Label>
                    <Input
                      id="license"
                      placeholder="Enter your license number"
                      className="h-11 bg-secondary/50 border-border/50"
                      value={formData.licenseNumber}
                      onChange={(e) => updateField("licenseNumber", e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Upload Documents</Label>
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-secondary/30 p-8 transition-colors hover:border-primary/30 cursor-pointer">
                      <Upload className="h-8 w-8 text-muted-foreground mb-3" />
                      <p className="text-sm text-foreground font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">License, ID card, and Bar certificate (PDF, JPG)</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 mt-2">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 rounded-xl"
                  onClick={() => setStep(step - 1)}
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                </Button>
              )}
              <Button type="submit" className="flex-1 h-11 rounded-xl font-medium" disabled={loading}>
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  />
                ) : step < totalSteps ? (
                  <>Continue <ArrowRight className="ml-1.5 h-4 w-4" /></>
                ) : (
                  "Create " + (role === "client" ? "Client" : role === "lawyer" ? "Lawyer" : "Student") + " Account"
                )}
              </Button>
            </div>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link href="#" className="text-primary hover:underline">Terms of Service</Link>
            {" and "}
            <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
