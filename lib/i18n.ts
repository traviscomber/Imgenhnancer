export const translations = {
  en: {
    // Header
    examples: "Examples",
    professional_use: "Professional Use",
    try_enhancer: "Try Enhancer",

    // SEO & Meta
    meta_title: "clar1ty - AI Image Enhancer by n3uralia group",
    meta_description:
      "Transform your images with AI-powered enhancement and restoration. Professional-grade image upscaling optimized for ASEAN heritage. Built by n3uralia group.",
    meta_story_title: "clar1ty - AI Image Enhancement for ASEAN Heritage",
    meta_story_description:
      "Discover how clar1ty preserves cultural identity while enhancing image quality. Powered by N3uralia's LoRA technology trained on ASEAN faces.",

    // Story section
    story_headline: "AI Enhancement Trained for ASEAN Heritage",
    story_subtitle: "Preserving cultural identity while enhancing image quality",
    story_para1:
      "clar1ty uses specialized LoRA models trained on diverse ASEAN faces and cultural contexts. Unlike generic AI enhancers, we understand the nuances of skin tones, lighting, and heritage photography.",
    story_para2:
      "Our technology preserves facial features and cultural identity while enhancing clarity, color accuracy, and detail. Each enhancement respects the original composition and cultural significance.",
    story_para3: "Built by N3uralia group, a collective dedicated to bridging AI and cultural preservation.",
    story_para4: "Soon expanding to Latin America and other regions with specialized cultural models.",

    // Why section
    why_asean_faces: "Trained on ASEAN Faces",
    why_asean_desc:
      "Specialized models understand diverse skin tones, lighting conditions, and cultural contexts specific to Southeast Asian photography.",
    why_identity: "Identity Preservation",
    why_identity_desc:
      "Every enhancement respects facial features and cultural elements. No homogenization, no generic results.",
    why_pro: "Professional Grade",
    why_pro_desc:
      "Used by heritage organizations, professional photographers, and cultural institutions across ASEAN.",
    why_expansion: "Global Expansion",
    why_expansion_desc:
      "LATAM specialization coming soon. Building culturally-aware AI, region by region.",

    // CTA
    get_started: "Get Started Free",
    explore_now: "Explore Now",
  },
  es: {
    // Header
    examples: "Ejemplos",
    professional_use: "Uso Profesional",
    try_enhancer: "Probar Enhancer",

    // SEO & Meta
    meta_title: "clar1ty - Potenciador de Imágenes por IA de n3uralia group",
    meta_description:
      "Transforma tus imágenes con mejora y restauración impulsadas por IA. Upscaling de imágenes de grado profesional optimizado para el patrimonio de Asia Sudoriental. Creado por n3uralia group.",
    meta_story_title: "clar1ty - Mejora de Imágenes por IA para el Patrimonio de ASEAN",
    meta_story_description:
      "Descubre cómo clar1ty preserva la identidad cultural mientras mejora la calidad de la imagen. Impulsado por la tecnología LoRA de N3uralia entrenada en rostros de ASEAN.",

    // Story section
    story_headline: "Mejora de IA Entrenada para el Patrimonio de ASEAN",
    story_subtitle: "Preservando la identidad cultural mientras se mejora la calidad de la imagen",
    story_para1:
      "clar1ty utiliza modelos LoRA especializados entrenados en rostros diversos de ASEAN y contextos culturales. A diferencia de los mejoradores de IA genéricos, entendemos los matices de tonos de piel, iluminación y fotografía de patrimonio.",
    story_para2:
      "Nuestra tecnología preserva características faciales e identidad cultural mientras mejora la claridad, la precisión del color y el detalle. Cada mejora respeta la composición original y la importancia cultural.",
    story_para3: "Creado por el grupo N3uralia, un colectivo dedicado a cerrar la brecha entre IA y preservación cultural.",
    story_para4:
      "Pronto se expandirá a América Latina y otras regiones con modelos culturales especializados.",

    // Why section
    why_asean_faces: "Entrenado en Rostros de ASEAN",
    why_asean_desc:
      "Los modelos especializados comprenden tonos de piel diversos, condiciones de iluminación y contextos culturales específicos de la fotografía del Sudeste Asiático.",
    why_identity: "Preservación de Identidad",
    why_identity_desc:
      "Cada mejora respeta características faciales y elementos culturales. Sin homogeneización, sin resultados genéricos.",
    why_pro: "Grado Profesional",
    why_pro_desc:
      "Utilizado por organizaciones de patrimonio, fotógrafos profesionales e instituciones culturales en toda ASEAN.",
    why_expansion: "Expansión Global",
    why_expansion_desc:
      "Próxima especialización en LATAM. Construyendo IA culturalmente consciente, región por región.",

    // CTA
    get_started: "Comenzar Gratis",
    explore_now: "Explorar Ahora",
  },
}

export function t(key: string, language: "en" | "es"): string {
  const keys = key.split(".")
  let value: any = translations[language]

  for (const k of keys) {
    value = value?.[k]
  }

  // Fallback to English if translation not found
  if (!value) {
    value = translations.en
    for (const k of keys) {
      value = value?.[k]
    }
  }

  return value || key
}
