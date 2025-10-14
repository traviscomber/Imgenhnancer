// Credit system configuration and utilities
// Based on Topaz pricing but 20% less cost for users

export const CREDIT_COSTS = {
  // Image enhancement costs (20% less than Topaz's 8 credits)
  ENHANCE_BASE: 6,
  ENHANCE_2X: 6,
  ENHANCE_3X: 8,
  ENHANCE_4X: 10,

  // Face swap operations
  FACE_SWAP: 8,

  // Analysis (free)
  ANALYZE: 0,
} as const

export const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    credits: 100,
    price: 9.99,
    description: "Perfect for trying out the service",
    pricePerCredit: 0.1,
  },
  {
    id: "pro",
    name: "Pro",
    credits: 500,
    price: 39.99,
    description: "Best value for regular users",
    pricePerCredit: 0.08,
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    credits: 1500,
    price: 99.99,
    description: "For professional use",
    pricePerCredit: 0.067,
  },
]

export function calculateCreditsNeeded(operation: keyof typeof CREDIT_COSTS, upscaleFactor?: number): number {
  if (operation === "ANALYZE") return 0

  if (operation === "ENHANCE_BASE" && upscaleFactor) {
    switch (upscaleFactor) {
      case 2:
        return CREDIT_COSTS.ENHANCE_2X
      case 3:
        return CREDIT_COSTS.ENHANCE_3X
      case 4:
        return CREDIT_COSTS.ENHANCE_4X
      default:
        return CREDIT_COSTS.ENHANCE_BASE
    }
  }

  return CREDIT_COSTS[operation]
}

export function formatCredits(credits: number): string {
  return credits.toLocaleString()
}

export function getPackageByCredits(credits: number) {
  return CREDIT_PACKAGES.find((pkg) => pkg.credits === credits)
}
