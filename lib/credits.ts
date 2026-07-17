// Credit system configuration and utilities
// Final cost structure: 2x=6cr, 3x=8cr, 4x=10cr

export const CREDIT_COSTS = {
  // Image enhancement costs
  ENHANCE_BASE: 6,
  ENHANCE_2X: 6,
  ENHANCE_3X: 8,
  ENHANCE_4X: 10,

  // Face swap operations
  FACE_SWAP: 8,

  // Analysis (free)
  ANALYZE: 0,
} as const

// Subscription tiers with monthly allowances and complete spec fields
export const SUBSCRIPTION_TIERS = [
  {
    id: "free",
    name: "Free",
    monthlyCredits: 10,
    creditsType: "one_time", // Free credits are one-time only
    price: 0,
    billing: "free",
    maxFileSize: 2, // MB
    batchLimit: 0, // No batch processing
    processingQueue: "standard",
    support: "none",
    teamWorkflow: false,
    invoicePayment: false,
    optionalApi: false,
    usageRights: "personal",
    description: "Get started with basic enhancements",
    features: ["10 credits (one-time)", "2MB max file size", "Personal use only"],
  },
  {
    id: "starter",
    name: "Starter",
    monthlyCredits: 240,
    creditsType: "monthly",
    price: 9,
    billing: "monthly",
    maxFileSize: 10,
    batchLimit: 0, // No batch
    processingQueue: "standard",
    support: "email",
    teamWorkflow: false,
    invoicePayment: false,
    optionalApi: false,
    usageRights: "personal",
    description: "Perfect for casual users",
    features: ["240 credits/month (~40 4x enhances)", "10MB max file size", "Personal use only", "Email support"],
  },
  {
    id: "creator",
    name: "Creator",
    monthlyCredits: 600,
    creditsType: "monthly",
    price: 19,
    billing: "monthly",
    maxFileSize: 15,
    batchLimit: 20, // Up to 20 images per batch
    processingQueue: "priority",
    support: "email",
    teamWorkflow: false,
    invoicePayment: false,
    optionalApi: false,
    usageRights: "small_business", // Small business / commercial light
    description: "Great for content creators",
    features: ["600 credits/month (~100 4x enhances)", "15MB max file size", "Batch up to 20 images", "Priority queue", "Small business usage", "Email support"],
    badge: "most_popular",
  },
  {
    id: "studio",
    name: "Studio",
    monthlyCredits: 1500,
    creditsType: "monthly",
    price: 39,
    billing: "monthly",
    maxFileSize: 30,
    batchLimit: 100, // Up to 100 images per batch
    processingQueue: "high_priority",
    support: "priority_email",
    teamWorkflow: false,
    invoicePayment: false,
    optionalApi: false,
    usageRights: "full_commercial",
    description: "For professional studios",
    features: ["1500 credits/month (~250 4x enhances)", "30MB max file size", "Batch up to 100 images", "High priority queue", "Full commercial usage", "Priority support"],
  },
  {
    id: "archive_business",
    name: "Archive / Business",
    monthlyCredits: 3000,
    creditsType: "monthly",
    price: 99,
    billing: "monthly_custom",
    maxFileSize: 30, // Note: 50MB+ requires special handling
    maxFileSizeNote: "50MB+ available on request",
    batchLimit: null, // Custom/unlimited
    processingQueue: "highest_priority",
    support: "dedicated",
    teamWorkflow: true, // Team collaboration features
    invoicePayment: true, // Invoice-based billing option
    optionalApi: true, // API access optional
    usageRights: "institutional",
    description: "For institutional and high-volume professional work",
    features: ["3000+ credits/month (~500 4x enhances)", "30MB max (50MB+ on request)", "Unlimited batch processing", "Highest priority queue", "Team collaboration", "Institutional usage rights", "Dedicated account manager", "Invoice billing", "Optional API access"],
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
