"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Lock, Eye, EyeOff, Sparkles, Mail } from "lucide-react"
import { login } from "@/lib/auth"

interface LoginModalProps {
  onSuccess: () => void
}

export function LoginModal({ onSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSettingUp, setIsSettingUp] = useState(false)

  const handleSetupAdmin = async () => {
    setIsSettingUp(true)
    setError("")

    try {
      const response = await fetch("/api/setup-admin", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setError("")
        alert("Admin user created! You can now login with admin@clarity.art / N3uralia.2025")
      } else {
        setError(data.error || "Failed to setup admin user")
      }
    } catch (err) {
      setError("Failed to setup admin user")
      console.error("[v0] Setup error:", err)
    } finally {
      setIsSettingUp(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedEmail || !trimmedPassword || !confirmPassword.trim()) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (trimmedPassword !== confirmPassword.trim()) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (trimmedPassword.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    console.log("[v0] Attempting sign up with email:", trimmedEmail)

    try {
      const signupResponse = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
        }),
      })

      const signupData = await signupResponse.json()

      if (!signupResponse.ok) {
        console.error("[v0] Sign up error:", signupData.error)
        setError(signupData.error || "Failed to create account")
        setPassword("")
        setConfirmPassword("")
        return
      }

      console.log("[v0] Sign up successful, attempting login")

      // Auto-login after sign up
      const { user, error: loginError } = await login(trimmedEmail, trimmedPassword)
      if (!loginError && user) {
        console.log("[v0] Auto-login successful")
        onSuccess()
      } else {
        console.error("[v0] Auto-login failed:", loginError)
        setError("Account created! Please sign in.")
        setMode("signin")
        setPassword("")
        setConfirmPassword("")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error("[v0] Sign up exception:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedEmail || !trimmedPassword) {
      setError("Please enter both email and password")
      setIsLoading(false)
      return
    }

    console.log("[v0] Attempting login with email:", trimmedEmail)

    try {
      const { user, error: loginError } = await login(trimmedEmail, trimmedPassword)

      if (loginError) {
        console.error("[v0] Login error:", loginError)
        if (loginError.includes("Invalid login credentials")) {
          setError("Invalid credentials. First time? Click 'Setup Admin User' below to create your account.")
        } else {
          setError(loginError)
        }
        setPassword("")
      } else if (user) {
        console.log("[v0] Login successful:", user)
        onSuccess()
      } else {
        setError("Login failed - no user returned")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error("[v0] Login exception:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-gray-900/95 backdrop-blur-lg border-amber-500/20 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <Sparkles className="w-8 h-8 text-black" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl text-white">Welcome to Clarity</CardTitle>
            <CardDescription className="text-gray-400 text-base">
              {mode === "signin" ? "Sign in to continue" : "Create your account"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={mode === "signin" ? handleSubmit : handleSignUp} className="space-y-6">
            {error && (
              <Alert className="bg-red-900/20 border-red-500/50">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label htmlFor="email" className="text-white text-base">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                  placeholder="admin@clarity.art"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-white text-base">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-12 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                  placeholder="Enter password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-white text-base">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-11 h-12 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                    placeholder="Confirm password"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold text-base shadow-lg shadow-amber-500/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {mode === "signin" ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-5 w-5" />
                  {mode === "signin" ? "Sign In" : "Sign Up"}
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin")
                setError("")
                setPassword("")
                setConfirmPassword("")
              }}
              className="text-sm text-gray-400 hover:text-amber-500 transition-colors"
            >
              {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          {mode === "signin" && (
            <div className="mt-6 pt-6 border-t border-gray-800 space-y-3">
              <p className="text-center text-sm text-gray-500">Default admin: admin@clarity.art / N3uralia.2025</p>
              <Button
                type="button"
                onClick={handleSetupAdmin}
                disabled={isSettingUp}
                variant="outline"
                className="w-full border-amber-500/30 text-amber-500 hover:bg-amber-500/10 bg-transparent"
              >
                {isSettingUp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up admin...
                  </>
                ) : (
                  "First time? Setup Admin User"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
