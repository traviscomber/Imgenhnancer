"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Lock, Eye, EyeOff, Sparkles } from "lucide-react"
import { login } from "@/lib/auth"

interface LoginModalProps {
  onSuccess: () => void
}

export function LoginModal({ onSuccess }: LoginModalProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!password) {
      setError("Please enter the password")
      setIsLoading(false)
      return
    }

    // Simulate a brief loading state for better UX
    setTimeout(() => {
      const user = login(password)

      if (user) {
        console.log("[v0] Login successful")
        onSuccess()
      } else {
        setError("Incorrect password. Please try again.")
        setPassword("")
      }
      setIsLoading(false)
    }, 500)
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
            <CardDescription className="text-gray-400 text-base">Enter the access password to continue</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert className="bg-red-900/20 border-red-500/50">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label htmlFor="password" className="text-white text-base">
                Access Password
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
                  autoFocus
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

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold text-base shadow-lg shadow-amber-500/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-5 w-5" />
                  Access Enhancer
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-center text-sm text-gray-500">
              This is a protected area. Contact your administrator if you need access.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
