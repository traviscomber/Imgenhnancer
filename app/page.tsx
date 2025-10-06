"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { ImageComparisonSlider } from "@/components/image-comparison-slider"
import Footer from "@/components/footer"
import {
  Sparkles,
  Shield,
  ImageIcon,
  ArrowRight,
  CheckCircle2,
  Brain,
  Globe,
  CheckCircle,
  LogIn,
  Eye,
} from "lucide-react"

// Import auth components from updates
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"
import { UserMenu } from "@/components/auth/user-menu"
import { ProfileDialog } from "@/components/auth/profile-dialog"

// Import utils from updates
import type { EnhancementToggles } from "@/utils/image-processing"
import type { DomemasterOptions } from "@/utils/domemaster"

// Define enhancement models - Updated with face-preserving options from updates
const ENHANCEMENT_MODELS = [
  {
    id: "clarity-upscaler-face-preserve",
    name: "Clarity Upscaler (Face Preserving)",
    description:
      "High-quality AI upscaling that completely preserves original faces without any enhancement or modification. Perfect for maintaining authentic facial features.",
    maxUpscale: 4,
    replicateModel: "philz1337x/clarity-upscaler",
    version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
    category: "upscaling",
    recommended: true,
    status: "working",
    inputField: "image",
    asianFaceCompatibility: "excellent" as const,
    westernBias: false,
    faceEnhancement: false,
    preserveFaces: true,
  },
  {
    id: "clarity-upscaler",
    name: "Clarity Upscaler (Standard)",
    description:
      "High-quality AI upscaling with intelligent parameter optimization. Includes face enhancement for portraits.",
    maxUpscale: 4,
    replicateModel: "philz1337x/clarity-upscaler",
    version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
    category: "upscaling",
    recommended: false,
    status: "working",
    inputField: "image",
    asianFaceCompatibility: "good" as const,
    westernBias: false,
    faceEnhancement: true,
    preserveFaces: false,
  },
  {
    id: "clarity-upscaler-no-face",
    name: "Clarity Upscaler (No Face Enhancement)",
    description:
      "High-quality AI upscaling without face enhancement. Preserves original facial features and expressions exactly as they are.",
    maxUpscale: 4,
    replicateModel: "philz1337x/clarity-upscaler",
    version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
    category: "upscaling",
    recommended: false,
    status: "working",
    inputField: "image",
    asianFaceCompatibility: "excellent" as const,
    westernBias: false,
    faceEnhancement: false,
    preserveFaces: true,
  },
]

// Define interfaces from updates
interface EnhancementSettings {
  model: string
  upscaleFactor: number
  targetUse: string
  format: string
  quality: number
  faceEnhance: boolean
  preserveAsianFeatures: boolean
  pre: EnhancementToggles["pre"]
  post: EnhancementToggles["post"]
}

// NUEVO: Opciones de domemaster (preset/exportación)
interface DomePresetState extends DomemasterOptions {
  enabled: boolean
}

interface ProcessingJob {
  id: number
  file: any
  settings: EnhancementSettings
  status: string
  startTime: number
  progress: string
}

interface CompletedJob {
  id: number
  status: string
  completedAt: number
  originalSize: string
  enhancedSize: string
  fileSize: string
  downloadUrl: string
  originalFileName: string
  model: string
  modelName: string
  method: string
  upscaleFactor: number
  processingTime: string
  predictionId?: string
  preserveAsianFeatures: boolean
}

// Rename component from LandingPage to AIImageEnhancementPortal
const AIImageEnhancementPortal = () => {
  // Authentication state from updates
  const [user, setUser] = useState<any>(null)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [showAuth, setShowAuth] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  // Existing state
  const [flippedCards, setFlippedCards] = useState<{ [key: string]: boolean }>({})
  const [selectedFiles, setSelectedFiles] = useState<any[]>([])
  const [processingQueue, setProcessingQueue] = useState<ProcessingJob[]>([])
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([])
  const [activeTab, setActiveTab] = useState("home")
  const [adminSubTab, setAdminSubTab] = useState("config")
  const [discoveryResults, setDiscoveryResults] = useState<any>(null)
  const [configResults, setConfigResults] = useState<any>(null)
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  // Enhancement Settings with safe defaults - Face Preserving as default from updates
  const [enhancementSettings, setEnhancementSettings] = useState<EnhancementSettings>({
    model: "clarity-upscaler-face-preserve",
    upscaleFactor: 2,
    targetUse: "display",
    format: "PNG",
    quality: 95,
    faceEnhance: false,
    preserveAsianFeatures: true,
    pre: {
      deblock: "off",
      denoise: "off",
      whiteBalance: "off",
    },
    post: {
      localContrast: "off",
      sharpen: "off",
      grain: "off",
    },
  })

  // ASEAN Face Preservation Presets from updates
  const ASEAN_FACE_PRESETS = [
    {
      id: "asean-portrait-safe",
      name: "ASEAN Portrait (Ultra Safe)",
      description:
        "Maximum face preservation for Indonesian/Malaysian/Thai/Filipino portraits. Zero facial modification.",
      icon: "🛡️",
      settings: {
        model: "clarity-upscaler-face-preserve",
        upscaleFactor: 2,
        targetUse: "display",
        format: "PNG",
        quality: 98,
        faceEnhance: false,
        preserveAsianFeatures: true,
        pre: {
          deblock: "off",
          denoise: "off",
          whiteBalance: "off",
        },
        post: {
          localContrast: "off",
          sharpen: "off",
          grain: "off",
        },
      },
      domeSettings: {
        enabled: false,
        size: 4096,
        bleedPercent: 2,
        overlay: false,
        projection: "equidistant" as const,
      },
    },
    {
      id: "asean-family-photo",
      name: "ASEAN Family Photo",
      description: "Gentle enhancement for family photos with multiple ASEAN faces. Preserves all facial features.",
      icon: "👨‍👩‍👧‍👦",
      settings: {
        model: "clarity-upscaler-face-preserve",
        upscaleFactor: 3,
        targetUse: "print",
        format: "PNG",
        quality: 95,
        faceEnhance: false,
        preserveAsianFeatures: true,
        pre: {
          deblock: "low",
          denoise: "off",
          whiteBalance: "off",
        },
        post: {
          localContrast: "off",
          sharpen: "off",
          grain: "very-low",
        },
      },
      domeSettings: {
        enabled: false,
        size: 6144,
        bleedPercent: 3,
        overlay: false,
        projection: "equidistant" as const,
      },
    },
  ]

  // NUEVO: estado del preset domemaster from updates
  const [domePreset, setDomePreset] = useState<DomePresetState>({
    enabled: false,
    size: 8192,
    bleedPercent: 3,
    overlay: false,
    projection: "equidistant",
  })

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const toggleCard = (cardId: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }))
  }

  // Helper functions with complete safety from updates
  const getModelById = (modelId: string | undefined | null) => {
    if (!modelId) return ENHANCEMENT_MODELS[0]
    return ENHANCEMENT_MODELS.find((m) => m.id === modelId) || ENHANCEMENT_MODELS[0]
  }

  const getCurrentModel = () => {
    return getModelById(enhancementSettings?.model)
  }

  const getModelName = (modelId: string | undefined | null) => {
    if (!modelId) return ENHANCEMENT_MODELS[0].name
    const model = getModelById(modelId)
    return model.name
  }

  // Check for existing session on mount from updates
  useEffect(() => {
    const savedUser = localStorage.getItem("ai-enhancer-user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem("ai-enhancer-user")
      }
    }
  }, [])

  const handleLogin = (userData: any) => {
    setIsAuthLoading(true)
    setTimeout(() => {
      setUser(userData)
      localStorage.setItem("ai-enhancer-user", JSON.stringify(userData))
      setShowAuth(false)
      setIsAuthLoading(false)
    }, 800)
  }

  const handleSignup = (userData: any) => {
    setIsAuthLoading(true)
    setTimeout(() => {
      setUser(userData)
      localStorage.setItem("ai-enhancer-user", JSON.stringify(userData))
      setShowAuth(false)
      setIsAuthLoading(false)
    }, 800)
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("ai-enhancer-user")
    setActiveTab("home")
    setSelectedFiles([])
    setProcessingQueue([])
    setCompletedJobs([])
  }

  const handleUpdateProfile = (updates: any) => {
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem("ai-enhancer-user", JSON.stringify(updatedUser))
  }

  const isAdmin = user?.email === "admin@example.com" || user?.email === "demo@example.com"

  const handleFileSelect = useCallback(
    (files: FileList) => {
      if (!user) {
        setShowAuth(true)
        return
      }
      const newFiles = Array.from(files).map((file) => {
        const fileSizeMB = file.size / (1024 * 1024)
        let warning = null

        if (fileSizeMB > 5) {
          warning = "Very large file - will be heavily compressed"
        } else if (fileSizeMB > 2) {
          warning = "Large file - will be compressed for API compatibility"
        } else if (fileSizeMB > 1) {
          warning = "File will be compressed for optimal processing"
        }

        const preview = URL.createObjectURL(file)
        const fileId = Date.now() + Math.random()

        const img = new window.Image()
        img.onload = () => {
          setSelectedFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, width: img.width, height: img.height } : f)),
          )
          URL.revokeObjectURL(img.src)
        }
        img.onerror = () => {
          URL.revokeObjectURL(img.src)
        }
        img.src = preview

        return {
          id: fileId,
          file,
          name: file.name,
          size: file.size,
          preview,
          status: "ready",
          error: null,
          warning: warning,
          width: null,
          height: null,
        }
      })
      setSelectedFiles((prev) => [...prev, ...newFiles])
    },
    [user],
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getTargetResolution = () => {
    if (domePreset.enabled) return `${domePreset.size}x${domePreset.size}`
    if (selectedFiles.length === 0) return "Select image to calculate"

    const firstFile = selectedFiles[0]
    if (firstFile?.width && firstFile?.height) {
      const targetWidth = Math.round(firstFile.width * enhancementSettings.upscaleFactor)
      const targetHeight = Math.round(firstFile.height * enhancementSettings.upscaleFactor)
      return `${targetWidth}x${targetHeight} (${Math.round((targetWidth * targetHeight) / 1000000)}MP)`
    }

    return "Loading dimensions..."
  }

  const getMaxUpscale = () => {
    const selectedModel = getCurrentModel()
    return selectedModel?.maxUpscale || 4
  }

  // Show authentication modal if not logged in from updates
  if (!user && showAuth) {
    return (
      <div className="min-h-screen n3uralia-gradient flex items-center justify-center p-6">
        {authMode === "login" ? (
          <LoginForm onLogin={handleLogin} onSwitchToSignup={() => setAuthMode("signup")} isLoading={isAuthLoading} />
        ) : (
          <SignupForm onSignup={handleSignup} onSwitchToLogin={() => setAuthMode("login")} isLoading={isAuthLoading} />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen n3uralia-gradient">
      {/* Header */}
      <header className="n3uralia-card sticky top-0 z-50 border-b n3uralia-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center n3uralia-glow-gold">
                <Brain className="w-6 h-6 n3uralia-gold-accent" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white n3uralia-gold-accent">n3uralia</h1>
                <p className="text-sm n3uralia-text-muted">AI Image Enhancement Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2 h-2 rounded-full n3uralia-pulse-gold"
                    style={{ backgroundColor: "rgba(218, 165, 32, 1)" }}
                  ></div>
                  <span className="text-white">AI Online</span>
                </div>
                <div className="w-px h-4 bg-white/20"></div>
                <span className="n3uralia-text-muted">{ENHANCEMENT_MODELS.length} Models</span>
              </div>

              {user ? (
                <UserMenu
                  user={user}
                  onLogout={handleLogout}
                  onOpenProfile={() => setShowProfile(true)}
                  isAdmin={isAdmin}
                />
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="n3uralia-button-gold px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Access Platform</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex space-x-1 n3uralia-card rounded-xl p-1">
          {[
            { id: "home", label: "Home", icon: Globe },
            { id: "enhance", label: "Enhance", icon: Sparkles },
            { id: "gallery", label: "Gallery", icon: ImageIcon },
            ...(isAdmin ? [{ id: "admin", label: "Admin", icon: Shield }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (!user && tab.id !== "home") {
                  setShowAuth(true)
                  return
                }
                setActiveTab(tab.id)
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id ? "n3uralia-button-gold" : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-12">
        {activeTab === "home" && (
          <div className="space-y-32">
            {/* Hero Section */}
            <section className="relative py-20 md:py-32">
              <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center space-x-2 n3uralia-card px-4 py-2 rounded-full mb-8">
                    <div
                      className="w-2 h-2 rounded-full n3uralia-pulse-gold"
                      style={{ backgroundColor: "rgba(218, 165, 32, 1)" }}
                    ></div>
                    <span className="text-sm n3uralia-text-muted">AI-Powered Enhancement</span>
                  </div>

                  <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                    ASEAN Face
                    <br />
                    <span className="n3uralia-gold-accent">Preservation</span>
                    <br />& Abstract Art
                  </h1>

                  <p className="text-xl n3uralia-text-muted mb-8 leading-relaxed">
                    Specialized AI enhancement for Southeast Asian portraits and abstract artwork. Preserve authentic
                    facial features and artistic expression with zero Western bias.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => {
                        if (!user) {
                          setShowAuth(true)
                        } else {
                          setActiveTab("enhance")
                        }
                      }}
                      className="n3uralia-button-gold px-8 py-4 rounded-lg text-lg font-semibold transition-all flex items-center justify-center space-x-2 group"
                    >
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      <span>Try For Free</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={() => document.getElementById("examples")?.scrollIntoView({ behavior: "smooth" })}
                      className="n3uralia-button-secondary px-8 py-4 rounded-lg text-lg font-semibold transition-all flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-5 h-5" />
                      <span>View Examples</span>
                    </button>
                  </div>

                  <div className="mt-12 flex items-center gap-8 text-sm">
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">500K+</div>
                      <div className="n3uralia-text-muted">ASEAN Faces</div>
                    </div>
                    <div className="w-px h-12 bg-white/20"></div>
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">100%</div>
                      <div className="n3uralia-text-muted">Feature Preserved</div>
                    </div>
                    <div className="w-px h-12 bg-white/20"></div>
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">2 Core</div>
                      <div className="n3uralia-text-muted">Specializations</div>
                    </div>
                  </div>
                </div>

                {/* Interactive Before/After Comparison Slider */}
                <div className="relative">
                  <ImageComparisonSlider
                    beforeImage="/images/wedding-before.png"
                    afterImage="/images/wedding-after.png"
                    beforeLabel="Original"
                    afterLabel="4x Enhanced"
                    className="shadow-2xl ring-1 ring-gold-300/20"
                  />
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-white/70">
                    <CheckCircle className="w-4 h-4 n3uralia-gold-accent" />
                    <span>🇮🇩 Indonesian Wedding • Face Preserved • 4x Enhancement</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ASEAN Focus Section */}
            <section id="examples" className="container py-16 md:py-24">
              <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <Badge className="n3uralia-badge-gold">
                    <Globe className="w-4 h-4 mr-2" />
                    Built for Southeast Asia
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    Celebrating{" "}
                    <span className="bg-gradient-to-r from-gold-300 to-gold-500 text-transparent bg-clip-text">
                      ASEAN Beauty
                    </span>
                  </h2>
                  <p className="text-lg n3uralia-text-muted">
                    Unlike generic AI models trained primarily on Western faces, n3uralia is specifically designed to
                    understand and preserve the unique beauty of Southeast Asian features.
                  </p>
                  <div className="space-y-4">
                    {[
                      {
                        country: "🇮🇩 Indonesia",
                        features: "Preserves warm skin tones, almond eyes, traditional makeup",
                      },
                      {
                        country: "🇲🇾 Malaysia",
                        features: "Maintains diverse ethnic features, natural complexions",
                      },
                      {
                        country: "🇹🇭 Thailand",
                        features: "Enhances traditional styling, golden hour skin tones",
                      },
                      {
                        country: "🇵🇭 Philippines",
                        features: "Respects unique facial structure, warm undertones",
                      },
                      {
                        country: "🇻🇳 Vietnam",
                        features: "Preserves delicate features, natural beauty",
                      },
                    ].map((item) => (
                      <div
                        key={item.country}
                        className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-gold-200/20"
                      >
                        <CheckCircle2 className="w-5 h-5 n3uralia-gold-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-white">{item.country}</div>
                          <div className="text-sm n3uralia-text-muted">{item.features}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Updated comparison sliders */}
                <div className="space-y-6">
                  <div>
                    <ImageComparisonSlider
                      beforeImage="/images/wedding-before.png"
                      afterImage="/images/wedding-after.png"
                      beforeLabel="Original"
                      afterLabel="4x Enhanced"
                      className="shadow-2xl ring-1 ring-gold-300/20"
                    />
                    <div className="mt-3 text-center">
                      <p className="text-sm text-white/90 font-medium">🇮🇩 Modern Indonesian Wedding</p>
                      <p className="text-xs text-white/60 mt-1">4x Enhancement • Face Preserved • Traditional Attire</p>
                    </div>
                  </div>

                  <div>
                    <ImageComparisonSlider
                      beforeImage="/images/vintage-wedding-blur.png"
                      afterImage="/images/vintage-wedding-clear.jpg"
                      beforeLabel="Heritage Photo"
                      afterLabel="Restored"
                      className="shadow-2xl ring-1 ring-gold-300/20"
                    />
                    <div className="mt-3 text-center">
                      <p className="text-sm text-white/90 font-medium">🏛️ Vintage ASEAN Wedding Heritage</p>
                      <p className="text-xs text-white/60 mt-1">
                        Restoration • Cultural Preservation • Authentic Features
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "enhance" && (
          <div className="n3uralia-card rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Image Enhancement</h3>
            <p className="n3uralia-text-muted">Enhancement interface coming soon.</p>
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="n3uralia-card rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Image Gallery</h3>
            <p className="n3uralia-text-muted">Gallery functionality coming soon.</p>
          </div>
        )}

        {activeTab === "admin" && isAdmin && (
          <div className="n3uralia-card rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Admin Panel</h3>
            <p className="n3uralia-text-muted">Admin functionality coming soon.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Profile Dialog */}
      {user && (
        <ProfileDialog
          user={user}
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          onUpdateProfile={handleUpdateProfile}
          completedJobs={completedJobs.length}
          totalProcessingTime={`${Math.floor(completedJobs.length * 1.5)}m`}
        />
      )}
    </div>
  )
}

export default AIImageEnhancementPortal
