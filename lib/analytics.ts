import { track } from "@vercel/analytics"

// Analytics event types
export type AnalyticsEvent =
  | "image_uploaded"
  | "preset_selected"
  | "category_switched"
  | "enhancement_started"
  | "enhancement_completed"
  | "enhancement_failed"
  | "image_downloaded"
  | "advanced_settings_opened"
  | "slider_interacted"
  | "cta_clicked"
  | "example_viewed"
  | "language_switched"
  | "geo_detected"

// Get GEO location data from Cloudflare headers (or fallback)
export function getGeoLocation(): {
  country?: string
  region?: string
  continent?: string
} {
  if (typeof window === "undefined") return {}

  // Try to get from Cloudflare headers (works on Vercel with Cloudflare)
  const country = (globalThis as any).__CLOUDFLARE_COUNTRY || undefined
  const continent = (globalThis as any).__CLOUDFLARE_CONTINENT || undefined

  return {
    country,
    continent,
  }
}

// Track language switch for GEO + language analytics
export function trackLanguageSwitch(language: "en" | "es", previousLanguage?: "en" | "es") {
  const geo = getGeoLocation()
  trackEvent("language_switched", {
    language,
    previous_language: previousLanguage,
    country: geo.country,
    continent: geo.continent,
  })
}

// Track custom events with properties
export function trackEvent(event: AnalyticsEvent, properties?: Record<string, any>) {
  try {
    track(event, properties)
    console.log(`[Analytics] ${event}`, properties)
  } catch (error) {
    console.error("[Analytics] Error tracking event:", error)
  }
}

// Track image upload
export function trackImageUpload(fileCount: number, totalSize: number) {
  trackEvent("image_uploaded", {
    file_count: fileCount,
    total_size_mb: (totalSize / 1024 / 1024).toFixed(2),
  })
}

// Track preset selection
export function trackPresetSelection(presetId: string, category: string) {
  trackEvent("preset_selected", {
    preset_id: presetId,
    category,
  })
}

// Track category switch
export function trackCategorySwitch(fromCategory: string, toCategory: string) {
  trackEvent("category_switched", {
    from: fromCategory,
    to: toCategory,
  })
}

// Track enhancement start
export function trackEnhancementStart(settings: {
  model: string
  upscaleFactor: number
  creativity: number
  resemblance: number
  category: string
  presetId: string
}) {
  trackEvent("enhancement_started", settings)
}

// Track enhancement completion
export function trackEnhancementComplete(
  processingTime: string,
  fileCount: number,
  settings: {
    model: string
    upscaleFactor: number
    category: string
  },
) {
  trackEvent("enhancement_completed", {
    processing_time: processingTime,
    file_count: fileCount,
    ...settings,
  })
}

// Track enhancement failure
export function trackEnhancementFailure(error: string, settings: Record<string, any>) {
  trackEvent("enhancement_failed", {
    error_message: error,
    ...settings,
  })
}

// Track image download
export function trackImageDownload(filename: string, settings: Record<string, any>) {
  trackEvent("image_downloaded", {
    filename,
    ...settings,
  })
}

// Track advanced settings interaction
export function trackAdvancedSettings(opened: boolean) {
  trackEvent("advanced_settings_opened", {
    opened,
  })
}

// Track slider interaction
export function trackSliderInteraction(sliderType: string, page: string) {
  trackEvent("slider_interacted", {
    slider_type: sliderType,
    page,
  })
}

// Track CTA clicks
export function trackCTAClick(ctaLocation: string, ctaText: string) {
  trackEvent("cta_clicked", {
    location: ctaLocation,
    text: ctaText,
  })
}

// Track example views
export function trackExampleView(exampleType: string, tab: string) {
  trackEvent("example_viewed", {
    example_type: exampleType,
    tab,
  })
}
