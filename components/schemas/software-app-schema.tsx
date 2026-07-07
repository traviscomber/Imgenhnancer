export function SoftwareAppSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "clar1ty - AI Image Enhancer",
    description:
      "Professional AI-powered image enhancement and restoration tool with face preservation and cultural respect for ASEAN heritage photography",
    url: "https://www.clar1ty.art",
    applicationCategory: "ImageProcessingApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free tier with paid credits for enhanced features",
    },
    featureList: [
      "AI-powered image enhancement",
      "Face preservation technology",
      "Photo restoration and upscaling",
      "Multiple enhancement presets",
      "Cultural respect filters",
      "Real-time before/after comparison",
      "Professional quality output",
    ],
    operatingSystem: ["Web Browser"],
    browserRequirements: "Any modern web browser with JavaScript support",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "234",
    },
    creator: {
      "@type": "Organization",
      name: "n3uralia group",
      url: "https://n3uralia.com",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      suppressHydrationWarning
    />
  )
}
