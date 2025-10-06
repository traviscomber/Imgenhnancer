import * as fal from "@fal-ai/serverless-client"

// Configure FAL client
fal.config({
  credentials: process.env.FAL_API_KEY,
})

const imagesToGenerate = [
  {
    filename: "hero-asean-bride.jpg",
    prompt:
      "Professional wedding portrait photography of an Indonesian bride, wearing traditional white kebaya lace blouse and elegant white hijab, authentic Southeast Asian facial features, medium brown skin tone, natural Indonesian beauty, soft studio lighting, high quality photography, cultural authenticity, 4k, photorealistic",
    description: "Hero - Indonesian Bride",
  },
  {
    filename: "wedding-original.jpg",
    prompt:
      "Indonesian wedding couple photo, slightly blurry low resolution, traditional Javanese wedding attire, kebaya and batik, authentic Southeast Asian faces, medium brown skin tones, natural lighting, realistic photo quality, 512x512",
    description: "Wedding Original",
  },
  {
    filename: "wedding-enhanced.jpg",
    prompt:
      "Indonesian wedding couple photo, crystal clear 4x enhanced resolution, traditional Javanese wedding attire, kebaya and batik, authentic Southeast Asian faces perfectly preserved, medium brown skin tones, enhanced clarity, professional photography, realistic photo quality, 2048x2048",
    description: "Wedding Enhanced",
  },
  {
    filename: "abstract-original.jpg",
    prompt:
      "Colorful geometric abstract digital painting, vibrant colors, modern art style, digital brushstrokes, artistic composition, slightly lower resolution, contemporary art, 512x512",
    description: "Abstract Original",
  },
  {
    filename: "abstract-enhanced.jpg",
    prompt:
      "Colorful geometric abstract digital painting, vibrant colors enhanced, modern art style, sharp digital brushstrokes with visible texture, artistic composition, 4x enhanced resolution, contemporary art, crystal clear details, 2048x2048",
    description: "Abstract Enhanced",
  },
  {
    filename: "family-original.jpg",
    prompt:
      "Malaysian family group photo with 5 people, multiple generations, authentic Southeast Asian Malaysian faces, natural skin tones, casual clothing, warm lighting, slightly blurry medium quality photo, realistic photography, 512x512",
    description: "Family Original",
  },
  {
    filename: "family-enhanced.jpg",
    prompt:
      "Malaysian family group photo with 5 people, multiple generations, authentic Southeast Asian Malaysian faces perfectly preserved, natural skin tones, casual clothing, warm lighting, 3x enhanced crystal clear photo, all facial features maintained, realistic photography, 1536x1536",
    description: "Family Enhanced",
  },
  {
    filename: "mixed-media-original.jpg",
    prompt:
      "Mixed media abstract artwork, textured canvas with acrylic paint and collage elements, earth tones and gold accents, artistic brushstrokes, contemporary art style, medium resolution, 512x512",
    description: "Mixed Media Original",
  },
  {
    filename: "mixed-media-enhanced.jpg",
    prompt:
      "Mixed media abstract artwork, highly detailed textured canvas with visible acrylic paint layers and collage elements, earth tones and brilliant gold accents, every brushstroke clearly visible, contemporary art style, 4x enhanced resolution showing all texture details, 2048x2048",
    description: "Mixed Media Enhanced",
  },
]

async function generateImage(image) {
  console.log(`\n🎨 Generating: ${image.description}`)
  console.log(`📝 Prompt: ${image.prompt.substring(0, 100)}...`)

  try {
    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: image.prompt,
        image_size: "square_hd",
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: true,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log(`⏳ ${image.description}: Processing...`)
        }
      },
    })

    if (result.data?.images?.[0]?.url) {
      console.log(`✅ ${image.description} generated successfully!`)
      console.log(`🔗 URL: ${result.data.images[0].url}`)
      console.log(`💾 Save as: public/images/${image.filename}`)
      console.log(`📋 Copy this line for page.tsx:`)
      console.log(`   <img src="${result.data.images[0].url}" alt="${image.description}" />`)
      return result.data.images[0].url
    } else {
      console.error(`❌ ${image.description}: No image URL returned`)
      return null
    }
  } catch (error) {
    console.error(`❌ ${image.description} failed:`, error)
    return null
  }
}

async function generateAllImages() {
  console.log("🚀 Starting AI Image Generation for Landing Page")
  console.log("=".repeat(60))

  const results = {}

  for (const image of imagesToGenerate) {
    const url = await generateImage(image)
    if (url) {
      results[image.filename] = url
    }
    // Wait 2 seconds between generations to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  console.log("\n" + "=".repeat(60))
  console.log("✅ Image generation complete!")
  console.log("\n📋 Generated Image URLs:")
  console.log(JSON.stringify(results, null, 2))

  console.log("\n📝 Next steps:")
  console.log("1. Copy the URLs above")
  console.log("2. Update app/page.tsx to use these direct URLs")
  console.log("3. Or download images and save to public/images/")

  return results
}

// Run the generation
generateAllImages().catch(console.error)
