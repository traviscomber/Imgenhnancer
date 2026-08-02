import { track } from "@vercel/analytics"
import "@/lib/hero-slider-runtime"

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

  const country = (globalThis as any).__CLOUDFLARE_COUNTRY || undefined
  const continent = (globalThis as any).__CLOUDFLARE_CONTINENT || undefined

  return {
    country,
    continent,
  }
}

export function trackLanguageSwitch(language: "en" | "es", previousLanguage?: "en" | "es") {
  const geo = getGeoLocation()
  trackEvent("language_switched", {
    language,
    previous_language: previousLanguage,
    country: geo.country,
    continent: geo.continent,
  })
}

export function trackEvent(event: AnalyticsEvent, properties?: Record<string, any>) {
  try {
    track(event, properties)
    console.log(`[Analytics] ${event}`, properties)
  } catch (error) {
    console.error("[Analytics] Error tracking event:", error)
  }
}

export function trackImageUpload(fileCount: number, totalSize: number) {
  trackEvent("image_uploaded", {
    file_count: fileCount,
    total_size_mb: (totalSize / 1024 / 1024).toFixed(2),
  })
}

export function trackPresetSelection(presetId: string, category: string) {
  trackEvent("preset_selected", {
    preset_id: presetId,
    category,
  })
}

export function trackCategorySwitch(fromCategory: string, toCategory: string) {
  trackEvent("category_switched", {
    from: fromCategory,
    to: toCategory,
  })
}

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

export function trackEnhancementFailure(error: string, settings: Record<string, any>) {
  trackEvent("enhancement_failed", {
    error_message: error,
    ...settings,
  })
}

export function trackImageDownload(filename: string, settings: Record<string, any>) {
  trackEvent("image_downloaded", {
    filename,
    ...settings,
  })
}

export function trackAdvancedSettings(opened: boolean) {
  trackEvent("advanced_settings_opened", {
    opened,
  })
}

export function trackSliderInteraction(sliderType: string, page: string) {
  trackEvent("slider_interacted", {
    slider_type: sliderType,
    page,
  })
}

export function trackCTAClick(ctaLocation: string, ctaText: string) {
  trackEvent("cta_clicked", {
    location: ctaLocation,
    text: ctaText,
  })
}

export function trackExampleView(exampleType: string, tab: string) {
  trackEvent("example_viewed", {
    example_type: exampleType,
    tab,
  })
}
