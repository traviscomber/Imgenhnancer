// Credit system configuration and utilities
// Updated cost structure: 2x=4cr, 3x=9cr, 4x=16cr (quadratic scaling)

export const CREDIT_COSTS = {
  // Image enhancement costs (quadratic scaling)
  ENHANCE_BASE: 4,
  ENHANCE_2X: 4,
  ENHANCE_3X: 9,
  ENHANCE_4X: 16,

  // Face swap operations
  FACE_SWAP: 8,

  // Analysis (free)
  ANALYZE: 0,
} as const

// Subscription tiers with monthly allowances
export const SUBSCRIPTION_TIERS = [
  {
    id: "free",
    name: "Free",
    monthlyCredits: 10,
    price: 0,
    maxFileSize: 2, // MB
    description: "Get started with basic enhancements",
    features: ["10 credits/month", "2MB max file size", "Basic enhancements"],
  },
  {
    id: "starter",
    name: "Starter",
    monthlyCredits: 240,
    price: 9,
    maxFileSize: 10,
    description: "Perfect for casual users",
    features: ["240 credits/month (~60 4x enhances)", "10MB max file size", "All enhancements"],
  },
  {
    id: "creator",
    name: "Creator",
    monthlyCredits: 600,
    price: 19,
    maxFileSize: 15,
    description: "Great for content creators",
    features: ["600 credits/month (~150 4x enhances)", "15MB max file size", "Priority processing"],
  },
  {
    id: "studio",
    name: "Studio",
    monthlyCredits: 1500,
    price: 39,
    maxFileSize: 30,
    description: "For professional studios",
    features: ["1500 credits/month (~375 4x enhances)", "30MB max file size", "Priority support"],
  },
  {
    id: "business",
    name: "Business",
    monthlyCredits: 3000,
    price: 99,
    maxFileSize: 50,
    description: "Enterprise solution",
    features: ["3000+ credits/month (~750 4x enhances)", "50MB+ max file size", "Dedicated support"],
  },
]

// PAYG credit packs
export const PAYG_CREDIT_PACKS = [
  {
    id: "payg-50",
    name: "50 Credits",
    credits: 50,
    price: 5,
    expiryDays: 365,
    pricePerCredit: 0.1,
  },
  {
    id: "payg-150",
    name: "150 Credits",
    credits: 150,
    price: 12,
    expiryDays: 365,
    pricePerCredit: 0.08,
    popular: true,
  },
  {
    id: "payg-450",
    name: "450 Credits",
    credits: 450,
    price: 29,
    expiryDays: 365,
    pricePerCredit: 0.064,
  },
  {
    id: "payg-1500",
    name: "1500 Credits",
    credits: 1500,
    price: 79,
    expiryDays: 365,
    pricePerCredit: 0.053,
  },
]

// Legacy: Monthly subscription packages (kept for backward compatibility)
export const CREDIT_PACKAGES = SUBSCRIPTION_TIERS.filter(
  (tier) => tier.price > 0 && tier.id !== "free"
).map((tier) => ({
  id: tier.id,
  name: tier.name,
  credits: tier.monthlyCredits,
  price: tier.price,
  description: tier.description,
  pricePerCredit: tier.price / tier.monthlyCredits,
  popular: tier.id === "creator",
}))

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

export function getSubscriptionTierById(tierId: string) {
  return SUBSCRIPTION_TIERS.find((tier) => tier.id === tierId)
}

export function getPaygPackageById(packageId: string) {
  return PAYG_CREDIT_PACKS.find((pkg) => pkg.id === packageId)
}

export function calculateEnhancementsPerMonth(credits: number, upscaleFactor: 4 = 4): number {
  const costPer4x = CREDIT_COSTS.ENHANCE_4X
  return Math.floor(credits / costPer4x)
}
