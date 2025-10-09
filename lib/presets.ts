export type PresetCategory = "faces" | "abstract" | "experimental"

export interface PresetSettings {
  model: string
  upscaleFactor: number
  creativity: number
  resemblance: number
  hdr: number
  prompt?: string
}

export interface Preset {
  id: string
  name: string
  category: PresetCategory
  description: string
  settings: PresetSettings
  features: string[]
  icon: string
}

// 6 Face Enhancement Presets
export const FACE_PRESETS: Record<string, Preset> = {
  "quality-boost": {
    id: "quality-boost",
    name: "Quality Boost",
    category: "faces",
    description: "Pure quality enhancement without adding or modifying faces",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.15,
      resemblance: 0.95,
      hdr: 0,
      prompt: "high quality photo, sharp details, natural enhancement, preserve original features",
    },
    features: ["No Face Changes", "Pure Quality", "Max Preservation", "Safe Enhancement"],
    icon: "⚡",
  },
  "indonesian-wedding": {
    id: "indonesian-wedding",
    name: "Indonesian Wedding",
    category: "faces",
    description: "Perfect for Javanese, Sundanese, Minang traditional weddings",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.35,
      resemblance: 0.75,
      hdr: 0,
      prompt: "professional photo, Indonesian wedding, traditional attire, cultural preservation",
    },
    features: ["Kebaya Detail", "Batik Preservation", "Face Protection", "Rich Colors"],
    icon: "🤵👰",
  },
  "modern-portrait": {
    id: "modern-portrait",
    name: "Modern Portrait",
    category: "faces",
    description: "Contemporary portraits with natural ASEAN skin tones",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.35,
      resemblance: 0.8,
      hdr: 0,
      prompt: "professional portrait photo, natural lighting, Asian features",
    },
    features: ["Natural Skin", "Sharp Details", "Face Safe", "Studio Quality"],
    icon: "📸",
  },
  "vintage-restoration": {
    id: "vintage-restoration",
    name: "Vintage Restoration",
    category: "faces",
    description: "Restore old family photos while preserving original features",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 3,
      creativity: 0.25,
      resemblance: 0.85,
      hdr: 0,
      prompt: "vintage photograph restoration, historical photo, authentic preservation",
    },
    features: ["High Fidelity", "Damage Repair", "Feature Lock", "Authentic Look"],
    icon: "🕰️",
  },
  "group-photo": {
    id: "group-photo",
    name: "Group Photo",
    category: "faces",
    description: "Enhance multiple faces in family or event photos",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.3,
      resemblance: 0.8,
      hdr: 0,
      prompt: "group photograph, multiple people, event photography, natural expressions",
    },
    features: ["Multi-Face", "Balanced Detail", "Event Ready", "Natural Tones"],
    icon: "👨‍👩‍👧‍👦",
  },
  "professional-headshot": {
    id: "professional-headshot",
    name: "Professional Headshot",
    category: "faces",
    description: "Corporate and business portraits with crisp details",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.4,
      resemblance: 0.75,
      hdr: 0.1,
      prompt: "professional headshot, business portrait, corporate photography, sharp focus",
    },
    features: ["Corporate Ready", "Sharp Focus", "Professional Look", "Clean Background"],
    icon: "💼",
  },
}

// 6 Abstract/Artistic Enhancement Presets
export const ABSTRACT_PRESETS: Record<string, Preset> = {
  "detail-enhancement": {
    id: "detail-enhancement",
    name: "Detail Enhancement",
    category: "abstract",
    description: "Pure detail and clarity boost without adding faces",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 3,
      creativity: 0.2,
      resemblance: 0.9,
      hdr: 0.1,
      prompt: "high resolution, enhanced details, sharp clarity, no face generation",
    },
    features: ["No Face Gen", "Pure Clarity", "3x Upscale", "Detail Focus"],
    icon: "🔍",
  },
  "artistic-enhancement": {
    id: "artistic-enhancement",
    name: "Artistic Enhancement",
    category: "abstract",
    description: "Creative interpretation with artistic flair",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.7,
      resemblance: 0.5,
      hdr: 0.3,
      prompt: "artistic interpretation, creative enhancement, vibrant colors, artistic style",
    },
    features: ["Creative Freedom", "Vibrant Colors", "Artistic Style", "Bold Details"],
    icon: "🎨",
  },
  "landscape-scenery": {
    id: "landscape-scenery",
    name: "Landscape & Scenery",
    category: "abstract",
    description: "Nature and landscape photos with enhanced depth",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 3,
      creativity: 0.5,
      resemblance: 0.6,
      hdr: 0.5,
      prompt: "landscape photography, natural scenery, enhanced depth, vivid colors",
    },
    features: ["HDR Depth", "Sky Enhancement", "Natural Colors", "3x Upscale"],
    icon: "🏞️",
  },
  "architecture-detail": {
    id: "architecture-detail",
    name: "Architecture & Detail",
    category: "abstract",
    description: "Buildings and structures with sharp geometric details",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 4,
      creativity: 0.4,
      resemblance: 0.7,
      hdr: 0.2,
      prompt: "architectural photography, building details, geometric precision, sharp lines",
    },
    features: ["4x Upscale", "Sharp Lines", "Geometric Precision", "Texture Detail"],
    icon: "🏛️",
  },
  "product-photography": {
    id: "product-photography",
    name: "Product Photography",
    category: "abstract",
    description: "E-commerce and product shots with crisp details",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 3,
      creativity: 0.45,
      resemblance: 0.75,
      hdr: 0.15,
      prompt: "product photography, commercial quality, sharp details, clean background",
    },
    features: ["Commercial Quality", "Clean Details", "True Colors", "3x Upscale"],
    icon: "📦",
  },
  "abstract-art": {
    id: "abstract-art",
    name: "Abstract Art",
    category: "abstract",
    description: "Maximum creativity for abstract and artistic images",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.85,
      resemblance: 0.4,
      hdr: 0.4,
      prompt: "abstract art, creative interpretation, artistic vision, bold transformation",
    },
    features: ["Max Creativity", "Bold Transform", "Artistic Vision", "Unique Results"],
    icon: "✨",
  },
}

// 6 Experimental Presets - Push the boundaries!
export const EXPERIMENTAL_PRESETS: Record<string, Preset> = {
  "hyper-realistic": {
    id: "hyper-realistic",
    name: "Hyper-Realistic",
    category: "experimental",
    description: "Maximum detail and photorealism with aggressive enhancement",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 4,
      creativity: 0.65,
      resemblance: 0.55,
      hdr: 0.6,
      prompt: "hyper realistic photo, extreme detail, photorealistic rendering, ultra sharp, professional photography",
    },
    features: ["4x Upscale", "Extreme Detail", "HDR Boost", "Photorealistic"],
    icon: "🔬",
  },
  "cinematic-grade": {
    id: "cinematic-grade",
    name: "Cinematic Grade",
    category: "experimental",
    description: "Film-quality color grading with dramatic lighting",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 3,
      creativity: 0.75,
      resemblance: 0.45,
      hdr: 0.7,
      prompt: "cinematic color grading, film quality, dramatic lighting, movie scene, professional cinematography",
    },
    features: ["Film Quality", "Dramatic HDR", "Color Science", "Cinematic Look"],
    icon: "🎬",
  },
  "ai-imagination": {
    id: "ai-imagination",
    name: "AI Imagination",
    category: "experimental",
    description: "Let AI reimagine your image with maximum creative freedom",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.95,
      resemblance: 0.3,
      hdr: 0.5,
      prompt: "creative AI interpretation, imaginative enhancement, artistic vision, bold transformation, unique style",
    },
    features: ["Max Creativity", "AI Freedom", "Unique Results", "Experimental"],
    icon: "🧠",
  },
  "ultra-sharp": {
    id: "ultra-sharp",
    name: "Ultra Sharp",
    category: "experimental",
    description: "Extreme sharpness and clarity for technical photography",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 4,
      creativity: 0.3,
      resemblance: 0.85,
      hdr: 0.2,
      prompt: "ultra sharp, extreme clarity, technical photography, microscopic detail, precision focus",
    },
    features: ["4x Upscale", "Razor Sharp", "Technical Grade", "Micro Detail"],
    icon: "🔍",
  },
  "neon-pop": {
    id: "neon-pop",
    name: "Neon Pop",
    category: "experimental",
    description: "Vibrant neon colors with cyberpunk aesthetic",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.8,
      resemblance: 0.4,
      hdr: 0.8,
      prompt:
        "neon colors, cyberpunk aesthetic, vibrant glow, electric colors, futuristic enhancement, bold saturation",
    },
    features: ["Neon Glow", "Cyberpunk", "Vibrant Colors", "Futuristic"],
    icon: "⚡",
  },
  "dream-state": {
    id: "dream-state",
    name: "Dream State",
    category: "experimental",
    description: "Ethereal, dreamlike quality with soft artistic interpretation",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 3,
      creativity: 0.85,
      resemblance: 0.35,
      hdr: 0.4,
      prompt:
        "dreamlike atmosphere, ethereal quality, soft artistic interpretation, surreal enhancement, magical realism",
    },
    features: ["Ethereal", "Dreamlike", "Soft Focus", "Surreal"],
    icon: "✨",
  },
}

// Combined presets
export const ALL_PRESETS = {
  ...FACE_PRESETS,
  ...ABSTRACT_PRESETS,
  ...EXPERIMENTAL_PRESETS,
}

// Helper functions
export function getPresetsByCategory(category: PresetCategory): Preset[] {
  return Object.values(ALL_PRESETS).filter((preset) => preset.category === category)
}

export function getPreset(id: string): Preset | undefined {
  return ALL_PRESETS[id]
}
