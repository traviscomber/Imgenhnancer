/**
 * Feature flags and availability for AI Image Enhancement
 * Based on competitive analysis of Remini, MyHeritage, VanceAI, Topaz, Pixelcut
 */

export interface Feature {
  id: string
  name: string
  description: string
  category: "enhancement" | "creative" | "restoration" | "professional" | "social"
  tier: "free" | "pro" | "business"
  status: "available" | "coming-soon" | "beta"
  model?: string
  icon: string
  estimatedTime?: string
  competitors: string[] // Who offers this
}

export const AVAILABLE_FEATURES: Feature[] = [
  // ===== ENHANCEMENT FEATURES =====
  {
    id: "upscale-2x",
    name: "2x Upscaling",
    description: "Double your image resolution with AI",
    category: "enhancement",
    tier: "free",
    status: "available",
    model: "nightmareai/real-esrgan",
    icon: "🔍",
    estimatedTime: "10-20s",
    competitors: ["Remini", "VanceAI", "Topaz", "Pixelcut"],
  },
  {
    id: "upscale-4x",
    name: "4x HD Upscaling",
    description: "Quadruple resolution for HD quality",
    category: "enhancement",
    tier: "pro",
    status: "available",
    model: "philz1337x/clarity-upscaler",
    icon: "✨",
    estimatedTime: "30-60s",
    competitors: ["Remini", "VanceAI", "Topaz"],
  },
  {
    id: "upscale-8x",
    name: "8x Ultra HD",
    description: "Professional 8x upscaling",
    category: "enhancement",
    tier: "business",
    status: "available",
    model: "nightmareai/real-esrgan",
    icon: "🚀",
    estimatedTime: "60-120s",
    competitors: ["Topaz"],
  },
  {
    id: "face-enhance",
    name: "Face Enhancement",
    description: "Restore and enhance facial features",
    category: "enhancement",
    tier: "free",
    status: "available",
    model: "tencentarc/gfpgan",
    icon: "👤",
    estimatedTime: "15-30s",
    competitors: ["Remini", "MyHeritage", "VanceAI"],
  },
  {
    id: "sharpen",
    name: "Advanced Sharpening",
    description: "Professional image sharpening",
    category: "enhancement",
    tier: "free",
    status: "available",
    icon: "🎯",
    estimatedTime: "5-10s",
    competitors: ["VanceAI", "Topaz"],
  },
  {
    id: "denoise",
    name: "Noise Reduction",
    description: "Remove grain and digital noise",
    category: "enhancement",
    tier: "pro",
    status: "available",
    icon: "🧹",
    estimatedTime: "10-20s",
    competitors: ["Topaz", "VanceAI"],
  },
  {
    id: "deblur",
    name: "Motion Deblur",
    description: "Fix motion blur and camera shake",
    category: "enhancement",
    tier: "pro",
    status: "coming-soon",
    model: "google-research/maxim",
    icon: "🌀",
    estimatedTime: "30-45s",
    competitors: ["Topaz"],
  },

  // ===== CREATIVE FEATURES =====
  {
    id: "background-removal",
    name: "Background Removal",
    description: "Instantly remove image background",
    category: "creative",
    tier: "free",
    status: "available",
    model: "cjwbw/rembg",
    icon: "🎭",
    estimatedTime: "5-10s",
    competitors: ["Remini", "Pixelcut", "VanceAI"],
  },
  {
    id: "background-replace",
    name: "AI Background Replace",
    description: "Replace background with AI-generated scene",
    category: "creative",
    tier: "pro",
    status: "coming-soon",
    model: "stability-ai/sdxl",
    icon: "🖼️",
    estimatedTime: "30-60s",
    competitors: ["Pixelcut", "VanceAI"],
  },
  {
    id: "object-removal",
    name: "Magic Eraser",
    description: "Remove unwanted objects from photos",
    category: "creative",
    tier: "pro",
    status: "coming-soon",
    model: "stability-ai/stable-diffusion-inpainting",
    icon: "🪄",
    estimatedTime: "20-40s",
    competitors: ["Pixelcut", "VanceAI"],
  },
  {
    id: "generative-fill",
    name: "Generative Fill",
    description: "AI-powered content fill and extension",
    category: "creative",
    tier: "business",
    status: "coming-soon",
    model: "stability-ai/sdxl",
    icon: "🎨",
    estimatedTime: "40-80s",
    competitors: ["VanceAI"],
  },
  {
    id: "style-transfer",
    name: "AI Style Transfer",
    description: "Apply artistic styles to your photos",
    category: "creative",
    tier: "pro",
    status: "coming-soon",
    model: "pytorch/style-transfer",
    icon: "🎭",
    estimatedTime: "30-60s",
    competitors: ["VanceAI"],
  },
  {
    id: "relighting",
    name: "AI Relighting",
    description: "Change lighting and shadows",
    category: "creative",
    tier: "business",
    status: "coming-soon",
    icon: "💡",
    estimatedTime: "45-90s",
    competitors: [],
  },

  // ===== RESTORATION FEATURES =====
  {
    id: "colorize",
    name: "Colorization",
    description: "Add color to black & white photos",
    category: "restoration",
    tier: "free",
    status: "available",
    model: "tensorlake/colorize",
    icon: "🌈",
    estimatedTime: "15-30s",
    competitors: ["MyHeritage", "VanceAI", "Remini"],
  },
  {
    id: "scratch-removal",
    name: "Scratch Removal",
    description: "Fix scratches and damage",
    category: "restoration",
    tier: "pro",
    status: "available",
    icon: "🔧",
    estimatedTime: "20-40s",
    competitors: ["MyHeritage"],
  },
  {
    id: "photo-restore",
    name: "Photo Restoration",
    description: "Comprehensive restoration for old photos",
    category: "restoration",
    tier: "pro",
    status: "available",
    model: "sczhou/codeformer",
    icon: "⚡",
    estimatedTime: "30-60s",
    competitors: ["MyHeritage", "VanceAI"],
  },
  {
    id: "animate-photo",
    name: "Deep Nostalgia™",
    description: "Animate faces in old photos",
    category: "restoration",
    tier: "pro",
    status: "coming-soon",
    model: "lucataco/animate-diff",
    icon: "🎬",
    estimatedTime: "60-120s",
    competitors: ["MyHeritage"],
  },
  {
    id: "age-progression",
    name: "Age Progression",
    description: "See how faces age over time",
    category: "restoration",
    tier: "business",
    status: "coming-soon",
    icon: "👴",
    estimatedTime: "40-80s",
    competitors: [],
  },

  // ===== PROFESSIONAL FEATURES =====
  {
    id: "batch-processing",
    name: "Batch Processing",
    description: "Process multiple images at once",
    category: "professional",
    tier: "pro",
    status: "coming-soon",
    icon: "📚",
    estimatedTime: "varies",
    competitors: ["VanceAI", "Topaz", "Pixelcut"],
  },
  {
    id: "video-enhance",
    name: "Video Enhancement",
    description: "Upscale and enhance videos",
    category: "professional",
    tier: "business",
    status: "coming-soon",
    model: "chenxwh/video-enhance",
    icon: "🎥",
    estimatedTime: "2-5 min",
    competitors: ["Remini", "Topaz"],
  },
  {
    id: "color-grading",
    name: "Color Grading",
    description: "Professional color correction",
    category: "professional",
    tier: "business",
    status: "coming-soon",
    icon: "🎨",
    estimatedTime: "15-30s",
    competitors: ["Topaz"],
  },
  {
    id: "watermark-removal",
    name: "Watermark Removal",
    description: "Remove watermarks and text",
    category: "professional",
    tier: "business",
    status: "coming-soon",
    model: "hitomi/watermark-remover",
    icon: "🚫",
    estimatedTime: "20-40s",
    competitors: ["VanceAI"],
  },
  {
    id: "format-conversion",
    name: "Format Conversion",
    description: "Convert between image formats",
    category: "professional",
    tier: "free",
    status: "available",
    icon: "🔄",
    estimatedTime: "1-5s",
    competitors: ["VanceAI"],
  },

  // ===== SOCIAL FEATURES =====
  {
    id: "social-share",
    name: "Social Sharing",
    description: "Share directly to social media",
    category: "social",
    tier: "free",
    status: "coming-soon",
    icon: "📱",
    estimatedTime: "instant",
    competitors: ["Remini", "Pixelcut"],
  },
  {
    id: "collaboration",
    name: "Team Collaboration",
    description: "Work together on projects",
    category: "social",
    tier: "business",
    status: "coming-soon",
    icon: "👥",
    estimatedTime: "N/A",
    competitors: [],
  },
  {
    id: "gallery",
    name: "Public Gallery",
    description: "Showcase your enhanced photos",
    category: "social",
    tier: "pro",
    status: "coming-soon",
    icon: "🖼️",
    estimatedTime: "N/A",
    competitors: [],
  },
]

export const getFeaturesByTier = (tier: "free" | "pro" | "business") => {
  return AVAILABLE_FEATURES.filter(
    (f) => f.tier === tier || (tier === "pro" && f.tier === "free") || (tier === "business" && f.tier !== "business"),
  )
}

export const getFeaturesByCategory = (category: Feature["category"]) => {
  return AVAILABLE_FEATURES.filter((f) => f.category === category)
}

export const getAvailableFeatures = () => {
  return AVAILABLE_FEATURES.filter((f) => f.status === "available")
}

export const getComingSoonFeatures = () => {
  return AVAILABLE_FEATURES.filter((f) => f.status === "coming-soon")
}

export const getFeatureById = (id: string) => {
  return AVAILABLE_FEATURES.find((f) => f.id === id)
}

export const FEATURE_TIERS = {
  free: {
    name: "Free",
    price: 0,
    features: getFeaturesByTier("free"),
    limits: {
      imagesPerDay: 5,
      maxResolution: "2048x2048",
      upscaleFactor: 2,
      watermark: true,
    },
  },
  pro: {
    name: "Pro",
    price: 9.99,
    features: getFeaturesByTier("pro"),
    limits: {
      imagesPerDay: 100,
      maxResolution: "4096x4096",
      upscaleFactor: 4,
      watermark: false,
    },
  },
  business: {
    name: "Business",
    price: 29.99,
    features: getFeaturesByTier("business"),
    limits: {
      imagesPerDay: -1, // unlimited
      maxResolution: "8192x8192",
      upscaleFactor: 8,
      watermark: false,
    },
  },
}
