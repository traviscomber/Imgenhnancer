// Responsive utility functions and configurations for mobile-first design

export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}

export const mobileFirstResponsive = {
  // Container sizing
  containerPadding: "px-4 md:px-6 lg:px-8",
  containerMaxWidth: "max-w-7xl",

  // Typography scaling
  headingHero: "text-3xl md:text-5xl lg:text-6xl",
  headingLarge: "text-2xl md:text-4xl lg:text-5xl",
  headingMedium: "text-xl md:text-3xl lg:text-4xl",
  headingSmall: "text-lg md:text-2xl lg:text-3xl",
  bodyLarge: "text-base md:text-lg",
  bodyBase: "text-sm md:text-base",
  bodySmall: "text-xs md:text-sm",

  // Spacing
  sectionPaddingY: "py-8 md:py-12 lg:py-16",
  sectionPaddingX: "px-4 md:px-8 lg:px-12",
  gutterX: "gap-4 md:gap-6 lg:gap-8",
  gutterY: "gap-4 md:gap-6 lg:gap-8",

  // Grid layouts
  grid2Col: "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8",
  grid3Col: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8",
  grid4Col: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6",

  // Card sizing
  cardPadding: "p-4 md:p-6 lg:p-8",
  cardRounded: "rounded-lg md:rounded-2xl",

  // Button sizing
  buttonPaddingSmall: "px-3 py-2 md:px-4 md:py-2",
  buttonPaddingMedium: "px-4 py-2 md:px-6 md:py-3",
  buttonPaddingLarge: "px-6 py-3 md:px-8 md:py-4",

  // Form inputs
  inputHeight: "h-10 md:h-12",
  inputPadding: "px-3 py-2 md:px-4 md:py-3",
}

/**
 * Mobile-optimized image sizes for next/image
 */
export const getImageSizes = (type: "hero" | "card" | "thumbnail" | "full") => {
  const sizes = {
    hero: "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1280px",
    card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    thumbnail: "(max-width: 640px) 80px, (max-width: 1024px) 120px, 160px",
    full: "100vw",
  }
  return sizes[type]
}

/**
 * Tailwind responsive patterns
 */
export const responsivePatterns = {
  textCenter: "text-left md:text-center lg:text-center",
  textRight: "text-left md:text-right lg:text-right",
  flexCol: "flex flex-col md:flex-row lg:flex-row",
  flexColReverse: "flex flex-col-reverse md:flex-row-reverse lg:flex-row-reverse",
  hideOnMobile: "hidden md:block",
  showOnMobile: "block md:hidden",
  hideOnDesktop: "block md:hidden",
  showOnDesktop: "hidden md:block",
  minHeightScreen: "min-h-screen md:min-h-[calc(100vh-4rem)]",
}

/**
 * Mobile-friendly touch targets (minimum 44x44px for accessibility)
 */
export const touchTargets = {
  button: "min-w-[44px] min-h-[44px]",
  link: "min-h-[44px]",
  clickable: "min-w-[48px] min-h-[48px]",
}

/**
 * Viewport meta tag configuration for mobile
 */
export const viewportConfig = {
  width: "device-width",
  "initial-scale": 1,
  "maximum-scale": 5,
  "user-scalable": "yes",
  "viewport-fit": "cover",
}
