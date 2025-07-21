"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, Eye, EyeOff, Zap } from "lucide-react"

interface LoginFormProps {
  onLogin: (userData: any) => void
  onSwitchToSignup: () => void
  isLoading: boolean
}

export function LoginForm({ onLogin, onSwitchToSignup, isLoading }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields")
      return
    }

    // Simulate login validation
    const userData = {
      id: Date.now().toString(),
      email: formData.email,
      name: formData.email.split("@")[0],
      role: formData.email === "admin@example.com" ? "admin" : formData.email === "demo@example.com" ? "admin" : "user",
      createdAt: new Date().toISOString(),
    }

    onLogin(userData)
  }

  return (
    <Card className="w-full max-w-md bg-black/40 backdrop-blur-lg border-white/10">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
        <CardDescription className="text-gray-400">Sign in to your AI Enhancement Portal account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="bg-red-900/20 border-red-500/20">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-6 space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{" "}
              <button
                onClick={onSwitchToSignup}
                className="text-blue-400 hover:text-blue-300 underline"
                disabled={isLoading}
              >
                Sign up
              </button>
            </p>
          </div>

          <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-400 font-medium mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-gray-300">
              <p>Admin: admin@example.com (any password)</p>
              <p>User: demo@example.com (any password)</p>
              <p>Or create your own account</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
