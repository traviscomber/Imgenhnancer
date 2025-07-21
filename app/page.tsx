"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, ImageIcon, X, LogIn, Sparkles, Camera, Palette, Wand2, Rocket } from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"
import { UserMenu } from "@/components/auth/user-menu"

const AIImageEnhancementPortal = () => {
  /* ----------------------------------------------------------------
     State & refs
  ---------------------------------------------------------------- */
  const [user, setUser] = useState<any | null>(null)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [showAuth, setShowAuth] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)

  const [selectedFiles, setSelectedFiles] = useState<any[]>([])
  const [processingQueue, setProcessingQueue] = useState<any[]>([])
  const [completedJobs, setCompletedJobs] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"home" | "enhance" | "results" | "pricing">("home")

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  /* ----------------------------------------------------------------
     Demo helpers
  ---------------------------------------------------------------- */
  useEffect(() => {
    const saved = localStorage.getItem("ai-enhancer-user")
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch {
        localStorage.removeItem("ai-enhancer-user")
      }
    }
  }, [])

  const handleLogin = (u: any) => {
    setIsAuthLoading(true)
    setTimeout(() => {
      setUser(u)
      localStorage.setItem("ai-enhancer-user", JSON.stringify(u))
      setIsAuthLoading(false)
      setShowAuth(false)
    }, 800)
  }

  const handleSignup = (u: any) => handleLogin(u)

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("ai-enhancer-user")
    setActiveTab("home")
  }

  /* ----------------------------------------------------------------
     Enhancement model list (static for demo)
  ---------------------------------------------------------------- */
  const enhancementModels = [
    {
      id: "real-esrgan-4x",
      name: "Real-ESRGAN 4×",
      maxUpscale: 4,
      processingTime: "30-60 s",
      description: "Professional upscaling for photos and artwork",
      bestFor: "Photos, artwork, general images",
      category: "General Purpose",
      status: "working",
      recommended: true,
      icon: ImageIcon,
    },
    {
      id: "gfpgan-face",
      name: "GFPGAN",
      maxUpscale: 4,
      processingTime: "45-90 s",
      description: "Specialized face restoration and enhancement",
      bestFor: "Portrait photos, face restoration",
      category: "Face Enhancement",
      status: "working",
      recommended: false,
      icon: Camera,
    },
    {
      id: "codeformer-face",
      name: "CodeFormer",
      maxUpscale: 4,
      processingTime: "60-120 s",
      description: "Advanced face restoration with fidelity control",
      bestFor: "Professional portraits, headshots",
      category: "Portrait Enhancement",
      status: "working",
      recommended: false,
      icon: Palette,
    },
    {
      id: "clarity-upscaler",
      name: "Clarity Upscaler",
      maxUpscale: 4,
      processingTime: "45-75 s",
      description: "High-quality upscaling with clarity enhancement",
      bestFor: "Professional photography, print",
      category: "Professional",
      status: "working",
      recommended: false,
      icon: Wand2,
    },
  ]

  /* ----------------------------------------------------------------
     Utilities
  ---------------------------------------------------------------- */
  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  /* ----------------------------------------------------------------
     File handlers
  ---------------------------------------------------------------- */
  const handleFileSelect = useCallback(
    (files: FileList) => {
      if (!user) {
        setShowAuth(true)
        return
      }
      const newFiles = Array.from(files).map((f) => ({
        id: Date.now() + Math.random(),
        file: f,
        name: f.name,
        size: f.size,
        preview: URL.createObjectURL(f),
        status: "ready",
      }))
      setSelectedFiles((p) => [...p, ...newFiles])
    },
    [user],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect],
  )

  /* ----------------------------------------------------------------
     Render
  ---------------------------------------------------------------- */
  if (!user && showAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        {authMode === "login" ? (
          <LoginForm onLogin={handleLogin} onSwitchToSignup={() => setAuthMode("signup")} isLoading={isAuthLoading} />
        ) : (
          <SignupForm onSignup={handleSignup} onSwitchToLogin={() => setAuthMode("login")} isLoading={isAuthLoading} />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* ----------------------------------------------------------------
           Header
      ---------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">AI Enhancer Pro</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            {["home", "enhance", "results", "pricing"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  if (["enhance", "results"].includes(t) && !user) {
                    setShowAuth(true)
                    return
                  }
                  setActiveTab(t as any)
                }}
                className={activeTab === t ? "text-white" : "text-blue-200 hover:text-white transition-colors"}
              >
                {t === "results" ? "Gallery" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </nav>

          {/* User area */}
          {user ? (
            <UserMenu user={user} onLogout={handleLogout} onOpenProfile={() => {}} isAdmin={false} />
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="text-blue-200 hover:text-white transition-colors text-sm font-medium"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* ----------------------------------------------------------------
           Main
      ---------------------------------------------------------------- */}
      <main className="max-w-7xl mx-auto px-6">
        {activeTab === "home" && (
          <section className="py-24 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6">
              Professional&nbsp;
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                AI Image Enhancement
              </span>
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
              Upscale, restore, and enhance your photos with state-of-the-art models—no Photoshop required.
            </p>
            <button
              onClick={() => {
                if (!user) {
                  setShowAuth(true)
                  return
                }
                setActiveTab("enhance")
              }}
              className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <Rocket className="w-5 h-5" />
              <span>Get Started Free</span>
            </button>
          </section>
        )}

        {activeTab === "enhance" && (
          <section className="py-16 grid lg:grid-cols-3 gap-10">
            {/* ----------------------------------------------------------------
                 Upload area (2 columns)
            ---------------------------------------------------------------- */}
            <div className="lg:col-span-2">
              <div className="bg-black/20 rounded-2xl border border-white/10 p-10 backdrop-blur-lg">
                <h2 className="text-2xl font-semibold text-white mb-6">Upload Images</h2>

                {/* Drop zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => user && fileInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-blue-400/50 rounded-2xl p-16 text-center hover:border-blue-400 transition-colors"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">
                    {user ? "Drop images here or click to browse" : "Sign in to upload images"}
                  </h3>
                  <p className="text-blue-200 mb-4 text-lg">JPEG, PNG, WebP up to 50 MB</p>
                  {!user && (
                    <button
                      onClick={() => setShowAuth(true)}
                      className="mt-6 inline-flex items-center space-x-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Sign In</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                  className="hidden"
                />

                {/* Selected files list */}
                {selectedFiles.length > 0 && (
                  <div className="mt-10 space-y-4">
                    {selectedFiles.map((f) => (
                      <div key={f.id} className="flex items-center justify-between bg-white/5 p-4 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <img
                            src={f.preview || "/placeholder.svg"}
                            alt=""
                            className="w-14 h-14 object-cover rounded-lg"
                          />
                          <div>
                            <p className="text-white font-medium">{f.name}</p>
                            <p className="text-blue-200 text-sm">{formatFileSize(f.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedFiles((p) => p.filter((x) => x.id !== f.id))}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ----------------------------------------------------------------
                 Simple settings / status
            ---------------------------------------------------------------- */}
            <div className="space-y-6">
              <div className="bg-black/20 rounded-2xl border border-white/10 p-6 backdrop-blur-lg">
                <h3 className="text-xl font-semibold text-white mb-4">Enhancement Settings</h3>
                <p className="text-blue-200 text-sm">
                  Choose an AI model below (demo — settings panel abbreviated for brevity).
                </p>
                <ul className="mt-6 space-y-4">
                  {enhancementModels.map((m) => (
                    <li key={m.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <m.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white">{m.name}</span>
                      </div>
                      <span className="text-blue-400 text-sm">{m.processingTime}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-2xl border border-green-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Status</h3>
                <p className="text-blue-200 text-sm">
                  Images queued: <span className="font-medium">{selectedFiles.length}</span>
                </p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "pricing" && (
          <section className="py-24 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Pricing coming soon</h2>
          </section>
        )}

        {activeTab === "results" && (
          <section className="py-24 text-center">
            {completedJobs.length === 0 ? (
              <p className="text-blue-200">No enhanced images yet.</p>
            ) : (
              <p className="text-blue-200">Gallery placeholder.</p>
            )}
          </section>
        )}
      </main>

      {/* ----------------------------------------------------------------
           Footer
      ---------------------------------------------------------------- */}
      <footer className="bg-black/20 border-t border-white/10 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
          <p className="text-blue-200 text-sm">© {new Date().getFullYear()} AI Enhancer Pro — All rights reserved</p>
          <div className="flex items-center space-x-6 text-sm">
            <a href="#" className="text-blue-200 hover:text-white">
              Privacy
            </a>
            <a href="#" className="text-blue-200 hover:text-white">
              Terms
            </a>
            <a href="#" className="text-blue-200 hover:text-white">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AIImageEnhancementPortal
