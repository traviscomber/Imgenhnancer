export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "clar1ty",
    url: "https://www.clar1ty.art",
    logo: "https://www.clar1ty.art/logo.png",
    description:
      "Professional AI-powered image enhancement and restoration optimized for ASEAN heritage photography",
    sameAs: [
      "https://twitter.com/n3uralia",
      "https://instagram.com/n3uralia",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "support@clar1ty.art",
      url: "https://www.clar1ty.art/support",
    },
    founder: {
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
