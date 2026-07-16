export type PresetCategory = "faces" | "abstract" | "experimental" | "avatar"

// ── Layer 2: Global Restoration Prompt ────────────────────────────────────
// Used by ALL presets. Defines the universal restoration philosophy.
// Preset-specific prompts (Layer 3) are appended AFTER this.
export const GLOBAL_RESTORATION_PROMPT = `Preserve the original image, composition, proportions, perspective, lighting, atmosphere and emotional feeling. Preserve identity, age, ethnicity, clothing, architecture and all existing objects. Restore only missing information. Never redesign the original scene. Intensify clarity, sharpness and high-frequency detail while transforming soft, noisy or unclear areas into deep crystalline structure with luminous gold texture. Enhance flat or plain surfaces with refined crystal facets, subtle sacred geometry, radiant mineral depth and elegant golden highlights. Increase micro-detail, texture richness and dimensional realism without changing the original design. The final image should feel clean, majestic, refined, visually transcendent and extremely detailed while remaining faithful to the original photograph. If information is missing because of severe blur or image degradation, reconstruct it conservatively using Southeast Asian (ASEAN) anatomical and cultural priors rather than Western assumptions. Never invent new people. Never replace ethnicity. Never westernize ambiguous faces. Never modernize historical photographs.`

// ── Layer 3: Preset-specific prompts ──────────────────────────────────────
// These describe ONLY the preset's specialization. Global prompt is prepended by the API.
export const PRESET_PROMPT_CLEAN_ENHANCE = `Remove blur. Reduce compression artifacts. Improve sharpness. Increase fine texture detail. Preserve every object exactly as it appears. Do not reconstruct objects unless absolutely necessary. Do not change colors or composition.`

export const PRESET_PROMPT_OLD_PHOTO_RESTORE = `Repair scratches. Repair cracks. Repair faded areas. Restore damaged faces conservatively. Maintain authentic photographic aging. Preserve historical appearance. When information is missing, reconstruct traditional Southeast Asian clothing, hairstyles, jewelry and materials using historically accurate references. Never modernize people or clothing.`

export const PRESET_PROMPT_FACE_DETAIL = `Preserve facial identity with maximum accuracy. Improve skin texture, pores, eyelashes, eyebrows, lips, eyes and hair detail. Never beautify. Never change facial proportions. Never modify age. Never alter ethnicity. Identity preservation is always more important than beauty enhancement.`

export const PRESET_PROMPT_CULTURAL_DETAIL = `Improve realism of existing carvings, textiles, ornaments, temples, traditional buildings, stone, wood, vegetation and craftsmanship. Only enhance details already suggested by the source image. Never invent architecture. Never invent decorative objects. Never introduce new people. Never replace ethnicity. Never reinterpret the original scene. Favor realism over creativity.`

// Legacy aliases — kept so any remaining references resolve cleanly
export const ASEAN_BASE_PROMPT_FACE = GLOBAL_RESTORATION_PROMPT
export const ASEAN_BASE_PROMPT_SCENE = GLOBAL_RESTORATION_PROMPT
export const ASEAN_BASE_PROMPT = GLOBAL_RESTORATION_PROMPT

export interface PresetSettings {
  model: string
  upscaleFactor: number
  creativity: number  // Replicate range: 0–1. Use 0 for max fidelity.
  resemblance: number // Replicate range: 0–3. Use 3 for max fidelity.
  hdr: number
  dynamic?: number    // Replicate range: 1–50. Use 1 for minimal hallucination.
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

export type PublicPresetKey = "archive_scan" | "asean_portrait_preserve" | "heritage_restore" | "digital_art_upscale"

export const PUBLIC_PRESET_MAP: Record<PublicPresetKey, string[]> = {
  archive_scan: [
    "quality-boost",
    "detail-enhancement",
    "group-photo",
    "architecture-detail",
    "product-photography",
  ],
  asean_portrait_preserve: [
    "vintage-restoration",
    "indonesian-wedding",
    "modern-portrait",
    "professional-headshot",
    "group-photo",
  ],
  heritage_restore: [
    "detail-enhancement-face",
    "indonesian-wedding",
    "modern-portrait",
    "professional-headshot",
    "vintage-restoration",
  ],
  digital_art_upscale: [
    "cultural-detail-asean",
    "landscape-hdr",
    "architecture-sharp",
    "architecture-detail",
    "landscape-scenery",
  ],
}

export const PUBLIC_PRESET_ORDER: PublicPresetKey[] = [
  "archive_scan",
  "asean_portrait_preserve",
  "heritage_restore",
  "digital_art_upscale",
]

export const PUBLIC_PRESET_DETAILS: Record<
  PublicPresetKey,
  {
    title: string
    description: string
    bestFor: string[]
    category: PresetCategory
    recommendedPresetId: string
  }
> = {
  archive_scan: {
    title: "Clean Enhance",
    description: "Improve clarity, sharpness and overall quality without altering the original image.",
    bestFor: [
      "Digital photos and modern files",
      "Product visuals and brand assets",
      "Social content and marketing images",
      "General image cleanup",
    ],
    category: "faces",
    recommendedPresetId: "quality-boost",
  },
  asean_portrait_preserve: {
    title: "Old Photo Restore",
    description: "Restore faded, scratched or damaged photographs with careful, natural cleanup.",
    bestFor: [
      "Family archives and vintage portraits",
      "Scanned prints and memory preservation",
      "Black and white restorations",
      "Aged or water-damaged photos",
    ],
    category: "faces",
    recommendedPresetId: "vintage-restoration",
  },
  heritage_restore: {
    title: "Face Detail",
    description: "Enhance facial features while keeping a natural appearance and full identity preservation.",
    bestFor: [
      "Portraits and wedding photos",
      "Fashion and beauty images",
      "Family images and Asian faces",
      "Professional headshots",
    ],
    category: "faces",
    recommendedPresetId: "detail-enhancement-face",
  },
  digital_art_upscale: {
    title: "Cultural Detail",
    description: "Preserve architecture, clothing, ornaments and cultural textures during enhancement.",
    bestFor: [
      "Heritage buildings and temples",
      "Jewelry, artifacts and traditional costumes",
      "Historical and archival visuals",
      "Cultural and documentary photography",
    ],
    category: "abstract",
    recommendedPresetId: "cultural-detail-asean",
  },
}

export const PUBLIC_PRESET_SETTINGS: Record<
  PublicPresetKey,
  {
    category: PresetCategory
    presetId: string
  }
> = {
  archive_scan: {
    category: "faces",
    presetId: "quality-boost",
  },
  asean_portrait_preserve: {
    category: "faces",
    presetId: "vintage-restoration",
  },
  heritage_restore: {
    category: "faces",
    presetId: "detail-enhancement-face",
  },
  digital_art_upscale: {
    category: "abstract",
    presetId: "cultural-detail-asean",
  },
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
      creativity: 0,
      resemblance: 3,
      dynamic: 1,
      hdr: 0,
      prompt: PRESET_PROMPT_CLEAN_ENHANCE,
    },
    features: ["No Face Changes", "Pure Quality", "Max Preservation", "Safe Enhancement"],
    icon: "⚡",
  },
  "detail-enhancement-face": {
    id: "detail-enhancement-face",
    name: "Face Detail",
    category: "faces",
    description: "Enhance facial features with maximum fidelity and ASEAN-aware identity preservation",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0,
      resemblance: 3,
      dynamic: 1,
      hdr: 0,
      prompt: PRESET_PROMPT_FACE_DETAIL,
    },
    features: ["Identity Lock", "Skin Texture", "ASEAN-Aware", "No Beautify"],
    icon: "👁",
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
      prompt: `${ASEAN_BASE_PROMPT_FACE} Professional photo, Indonesian wedding, traditional attire. Preserve kebaya fabric patterns, batik details, traditional jewelry, headdress ornaments and floral decorations with extreme fidelity. Enhance faces naturally without changing ethnic features, skin tone or expression.`,
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
      prompt: `${ASEAN_BASE_PROMPT_FACE} Professional portrait, natural lighting, Southeast Asian features. Enhance micro-detail in hair, eyes and skin without whitening, slimming or otherwise modifying the face.`,
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
      upscaleFactor: 2,
      creativity: 0,
      resemblance: 3,
      dynamic: 1,
      hdr: 0,
      prompt: PRESET_PROMPT_OLD_PHOTO_RESTORE,
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
      prompt: `${ASEAN_BASE_PROMPT_FACE} Group photograph, multiple people, event photography. Enhance all faces equally without modifying individual features. Preserve natural expressions, cultural attire and diverse Southeast Asian appearances.`,
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
      prompt: `${ASEAN_BASE_PROMPT_FACE} Professional headshot, business portrait, corporate photography, sharp focus. Preserve natural facial features and skin tone. Do not alter ethnicity, age or expression.`,
    },
    features: ["Corporate Ready", "Sharp Focus", "Professional Look", "Clean Background"],
    icon: "💼",
  },
}

// 6 Abstract/Artistic Enhancement Presets
export const ABSTRACT_PRESETS: Record<string, Preset> = {
  "cultural-detail-asean": {
    id: "cultural-detail-asean",
    name: "Cultural Detail",
    category: "abstract",
    description: "Preserve and enrich ASEAN cultural textures, architecture, ornaments and traditional clothing",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0,
      resemblance: 3,
      dynamic: 1,
      hdr: 0,
      prompt: PRESET_PROMPT_CULTURAL_DETAIL,
    },
    features: ["Cultural Fidelity", "No Hallucination", "ASEAN-First", "Conservative Restore"],
    icon: "🏛",
  },
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
      prompt: `${ASEAN_BASE_PROMPT} High resolution, enhanced details, sharp clarity, no face generation.`,
    },
    features: ["No Face Gen", "Pure Clarity", "3x Upscale", "Detail Focus"],
    icon: "🔍",
  },
  "landscape-hdr": {
    id: "landscape-hdr",
    name: "Landscape HDR",
    category: "abstract",
    description: "Nature and landscape photos with maximum HDR depth",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 4,
      creativity: 0.05,
      resemblance: 0.95,
      hdr: 0.9,
      prompt: `${ASEAN_BASE_PROMPT} Landscape photography, natural scenery, HDR enhancement, vivid colors, dramatic sky, enhanced depth.`,
    },
    features: ["4x Upscale", "Max HDR", "Sky Enhancement", "Natural Colors"],
    icon: "🏔️",
  },
  "architecture-sharp": {
    id: "architecture-sharp",
    name: "Architecture Sharp",
    category: "abstract",
    description: "Buildings and structures with ultra-sharp geometric precision",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 4,
      creativity: 0.0,
      resemblance: 0.95,
      hdr: 0.8,
      prompt: `${ASEAN_BASE_PROMPT} Architectural photography, building details, ultra sharp, geometric precision, clean lines, structural clarity.`,
    },
    features: ["4x Upscale", "Ultra Sharp", "Zero Creativity", "Geometric Precision"],
    icon: "🏗️",
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
      prompt: `${ASEAN_BASE_PROMPT} Landscape photography, natural Southeast Asian scenery, enhanced depth, vivid tropical colors.`,
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
      prompt: `${ASEAN_BASE_PROMPT} Architectural photography, building details, geometric precision, sharp lines. Favor traditional ASEAN architectural elements when ambiguous.`,
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

// 15 Avatar Generation Presets - Using proven methodology from top avatar generators
export const AVATAR_PRESETS: Record<string, Preset> = {
  "hyper-realistic-avatar": {
    id: "hyper-realistic-avatar",
    name: "Hyper-Realistic",
    category: "avatar",
    description: "Ultra-realistic enhancement preserving exact identity",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.35,
      resemblance: 0.98,
      hdr: 0.3,
      prompt:
        "Use the uploaded image as face reference. Keep facial identity, features, and expressions exactly the same - preserve gender, age, beard, hair color and style, skin tone, and all facial characteristics. Transform into professional studio portrait with cinematic lighting, shallow depth of field, and photorealistic quality. Single person portrait only.",
    },
    features: ["Exact Identity", "Studio Quality", "Professional", "Natural"],
    icon: "👤",
  },
  "anime-style": {
    id: "anime-style",
    name: "Anime Style",
    category: "avatar",
    description: "Japanese anime character with expressive features",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.65,
      resemblance: 0.92,
      hdr: 0.4,
      prompt:
        "Use the uploaded image as face reference. Keep the person's facial identity exactly the same - preserve their gender, age, facial structure, and key features. Transform the rest into Japanese anime art style with expressive large eyes, vibrant hair colors, anime shading and highlights, and colorful background. Single person anime character portrait only.",
    },
    features: ["Anime Art", "Expressive", "Identity Safe", "Vibrant"],
    icon: "🎌",
  },
  "comic-superhero": {
    id: "comic-superhero",
    name: "Comic Superhero",
    category: "avatar",
    description: "Full-body superhero with exaggerated muscles",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.7,
      resemblance: 0.9,
      hdr: 0.7,
      prompt:
        "Use the uploaded image as face reference. Keep the person's face, facial features, gender, age, beard, and hair exactly identical. Transform the rest of the body and clothing into a full-body comic book superhero with exaggerated muscular physique, dynamic action pose, vibrant superhero costume with cape, bold comic art style with halftone dots and dramatic lighting. Single person superhero only - no additional characters.",
    },
    features: ["Full Body", "Muscular", "Face Safe", "Dynamic"],
    icon: "💥",
  },
  "business-professional": {
    id: "business-professional",
    name: "Business Professional",
    category: "avatar",
    description: "Corporate headshot with elegant illustration style",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.4,
      resemblance: 0.96,
      hdr: 0.2,
      prompt:
        "Use the uploaded image as face reference. Keep facial identity and expressions exactly the same - preserve all facial features, gender, age, and characteristics. Transform into elegant digital illustration portrait with professional business attire, clean neutral background, confident pose, and soft professional lighting. Single person corporate headshot only.",
    },
    features: ["Corporate", "Elegant", "Identity Safe", "Professional"],
    icon: "💼",
  },
  "cyberpunk-avatar": {
    id: "cyberpunk-avatar",
    name: "Cyberpunk",
    category: "avatar",
    description: "Futuristic cyberpunk character with neon aesthetics",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.68,
      resemblance: 0.9,
      hdr: 0.8,
      prompt:
        "Use the uploaded image as face reference. Keep the person's facial identity exactly the same - preserve gender, age, and all facial features. Transform the rest into cyberpunk character with futuristic tech wear outfit, neon-lit urban dystopian background, holographic elements, vibrant neon lighting (pink, cyan, purple), and high-tech accessories. Single person cyberpunk portrait only.",
    },
    features: ["Futuristic", "Neon", "Identity Base", "Tech"],
    icon: "🌃",
  },
  "fantasy-warrior": {
    id: "fantasy-warrior",
    name: "Fantasy Warrior",
    category: "avatar",
    description: "Epic fantasy RPG character with armor and weapons",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.7,
      resemblance: 0.88,
      hdr: 0.6,
      prompt:
        "Use the uploaded image as face reference. Keep the person's face and facial features exactly identical - preserve gender, age, and identity. Transform the rest into epic fantasy warrior with ornate medieval armor, legendary weapons, heroic battle-ready pose, mystical fantasy background with castles or forests, and dramatic cinematic lighting. Single person fantasy character only.",
    },
    features: ["Epic", "Armored", "Face Base", "Heroic"],
    icon: "⚔️",
  },
  "pixar-3d": {
    id: "pixar-3d",
    name: "Pixar 3D",
    category: "avatar",
    description: "Pixar-style 3D animated character",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.65,
      resemblance: 0.92,
      hdr: 0.4,
      prompt:
        "Use the uploaded image as face reference. Keep the person's facial proportions, features, gender, and age exactly the same. Transform into Pixar-style 3D animated character with smooth 3D rendering, expressive friendly features, colorful clothing, vibrant background, and warm animated movie lighting. Single person 3D character only - no additional characters.",
    },
    features: ["3D Animated", "Friendly", "Identity Safe", "Colorful"],
    icon: "🎬",
  },
  "oil-painting": {
    id: "oil-painting",
    name: "Oil Painting",
    category: "avatar",
    description: "Classical oil painting portrait",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.55,
      resemblance: 0.94,
      hdr: 0.3,
      prompt:
        "Use the uploaded image as face reference. Keep facial identity and features exactly the same - preserve gender, age, and all characteristics. Transform into classical oil painting portrait with Renaissance art style, rich oil paint colors, visible painterly brushstrokes, elegant composition, and museum-quality artistic rendering. Single person portrait only.",
    },
    features: ["Classical", "Painterly", "Identity Safe", "Elegant"],
    icon: "🖼️",
  },
  "sci-fi-character": {
    id: "sci-fi-character",
    name: "Sci-Fi Character",
    category: "avatar",
    description: "Science fiction character with futuristic elements",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.68,
      resemblance: 0.9,
      hdr: 0.7,
      prompt:
        "Use the uploaded image as face reference. Keep the person's face and identity exactly identical - preserve gender, age, and facial features. Transform the rest into science fiction character with futuristic space suit or tech outfit, high-tech accessories, space station or spacecraft background, and cinematic sci-fi lighting. Single person sci-fi character only.",
    },
    features: ["Sci-Fi", "Futuristic", "Face Base", "Cinematic"],
    icon: "🚀",
  },
  "watercolor-art": {
    id: "watercolor-art",
    name: "Watercolor Art",
    category: "avatar",
    description: "Soft watercolor painting style",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.5,
      resemblance: 0.94,
      hdr: 0.2,
      prompt:
        "Use the uploaded image as face reference. Keep facial features, identity, gender, and age exactly the same. Transform into soft watercolor painting portrait with flowing watercolor washes, delicate brushwork, pastel color palette, artistic paper texture, and gentle artistic interpretation. Single person watercolor portrait only.",
    },
    features: ["Watercolor", "Soft", "Identity Safe", "Artistic"],
    icon: "🎨",
  },
  "metaverse-nft": {
    id: "metaverse-nft",
    name: "Metaverse NFT",
    category: "avatar",
    description: "Web3 ready avatar with NFT aesthetic",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.65,
      resemblance: 0.92,
      hdr: 0.6,
      prompt:
        "Use the uploaded image as face reference. Keep the person's facial identity exactly the same - preserve gender, age, and features. Transform into metaverse NFT avatar with web3 aesthetic, digital art style, vibrant neon colors, crypto art vibe, blockchain-inspired elements, and futuristic digital background. Single person NFT avatar only.",
    },
    features: ["Web3", "NFT Style", "Identity Safe", "Digital"],
    icon: "🌐",
  },
  "vintage-cartoon": {
    id: "vintage-cartoon",
    name: "Vintage Cartoon",
    category: "avatar",
    description: "Classic cartoon style from golden age animation",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.68,
      resemblance: 0.9,
      hdr: 0.3,
      prompt:
        "Use the uploaded image as face reference. Keep the person's face structure, gender, age, and features exactly the same. Transform into vintage cartoon character with classic 1940s animation style, bold black outlines, retro color palette, simplified shapes, and nostalgic golden age cartoon aesthetic. Single person cartoon character only.",
    },
    features: ["Retro", "Classic", "Identity Base", "Bold"],
    icon: "📺",
  },
  "minimalist-line": {
    id: "minimalist-line",
    name: "Minimalist Line",
    category: "avatar",
    description: "Clean minimalist line art portrait",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.4,
      resemblance: 0.96,
      hdr: 0,
      prompt:
        "Use the uploaded image as face reference. Keep facial proportions, features, gender, and age exactly identical. Transform into minimalist line art portrait with clean simple continuous lines, elegant sketch style, black and white only, negative space, and modern minimalist aesthetic. Single person line art portrait only.",
    },
    features: ["Minimalist", "Clean", "Identity Safe", "Elegant"],
    icon: "✏️",
  },
  "gothic-dark": {
    id: "gothic-dark",
    name: "Gothic Dark",
    category: "avatar",
    description: "Dark gothic aesthetic with dramatic atmosphere",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.68,
      resemblance: 0.9,
      hdr: 0.7,
      prompt:
        "Use the uploaded image as face reference. Keep the person's facial identity exactly the same - preserve gender, age, and features. Transform the rest into gothic dark portrait with Victorian gothic clothing, dramatic dark aesthetic, moody atmospheric lighting, mysterious shadows, and haunting elegant atmosphere. Single person gothic portrait only.",
    },
    features: ["Gothic", "Dramatic", "Face Base", "Moody"],
    icon: "🦇",
  },
  "kawaii-cute": {
    id: "kawaii-cute",
    name: "Kawaii Cute",
    category: "avatar",
    description: "Adorable kawaii style with chibi proportions",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.65,
      resemblance: 0.92,
      hdr: 0.3,
      prompt:
        "Use the uploaded image as face reference. Keep the person's core facial features, gender, and age recognizable. Transform into kawaii cute character with chibi proportions, adorable style, pastel color palette (pink, lavender, mint), big expressive sparkling eyes, cute accessories, and sweet kawaii background. Single person kawaii character only - no additional people.",
    },
    features: ["Kawaii", "Cute", "Face Base", "Pastel"],
    icon: "🌸",
  },
}

// Combined presets
export const ALL_PRESETS = {
  ...FACE_PRESETS,
  ...ABSTRACT_PRESETS,
  ...EXPERIMENTAL_PRESETS,
  ...AVATAR_PRESETS,
}

// Helper functions
export function getPresetsByCategory(category: PresetCategory): Preset[] {
  return Object.values(ALL_PRESETS).filter((preset) => preset.category === category)
}

export function getPreset(id: string): Preset | undefined {
  return ALL_PRESETS[id]
}

export function getPublicPresetIds(key: PublicPresetKey): Preset[] {
  return PUBLIC_PRESET_MAP[key]
    .map((id) => ALL_PRESETS[id])
    .filter((preset): preset is Preset => Boolean(preset))
}

// ── Per-factor parameter adjustments per public preset ───────────────────
// These tables define how creativity / resemblance / hdr shift when the user
// picks a different upscale factor (x2 / x3 / x4) for a given preset.
// Rule of thumb:
//   - Higher factor → slightly more creativity to fill in new pixels
//   - Higher factor → slightly lower resemblance to avoid artefacts
//   - Face presets stay very conservative even at x4 to protect identity
/**
 * Returns the full PresetSettings for a given public preset + upscale factor.
 * Creativity, resemblance, dynamic, fractality and style are FIXED per the
 * spec — only upscaleFactor changes with the mode. The spec explicitly states:
 * "Do NOT increase creativity for any preset. The goal is restoration, not generation."
 */
export function getSettingsForMode(
  publicPresetKey: PublicPresetKey,
  factor: 2 | 3 | 4,
): PresetSettings {
  const presetId = PUBLIC_PRESET_SETTINGS[publicPresetKey].presetId
  const base = ALL_PRESETS[presetId]?.settings

  if (!base) {
    // Fallback — should never happen if preset IDs are in sync
    return {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: factor,
      creativity: -4,
      resemblance: 9,
      dynamic: 1,
      fractality: 5,
      hdr: 0,
      style: "default",
    }
  }

  // Only upscaleFactor changes — all other params stay locked to the preset definition
  return { ...base, upscaleFactor: factor }
}
