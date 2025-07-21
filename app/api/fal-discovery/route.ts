import { NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"

/**
 * Proper Fal AI discovery using official SDK
 */
export async function GET() {
  try {
    // Configure Fal AI with the API key
    fal.config({
      credentials: process.env.FAL_KEY,
    })

    const results = {
      timestamp: new Date().toISOString(),
      hasApiKey: !!process.env.FAL_KEY,
      sdkVersion: "Using @fal-ai/serverless",
      workingModels: [],
      failedModels: [],
      recommendations: [],
    }

    // Known working Fal AI models from their official documentation
    const knownModels = [
      // Image upscaling models
      "fal-ai/real-esrgan",
      "lucataco/real-esrgan-upscaler",
      "xinntao/realesrgan",

      // Background removal
      "fal-ai/rembg",
      "lucataco/remove-bg",

      // Face enhancement
      "tencentarc/gfpgan",

      // Stable Diffusion (for testing API connectivity)
      "fal-ai/flux/schnell",
      "fal-ai/flux/dev",
      "fal-ai/stable-diffusion-v3-medium",

      // Other upscaling
      "fal-ai/supir",
      "nightmareai/real-esrgan",
    ]

    // Test image (small base64 encoded image)
    const testImageUrl =
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="

    console.log("🔍 Testing Fal AI models with official SDK...")

    for (const modelId of knownModels) {
      try {
        console.log(`Testing model: ${modelId}`)

        // Different input formats for different model types
        let input = {}

        if (modelId.includes("flux") || modelId.includes("stable-diffusion")) {
          // Text-to-image models
          input = {
            prompt: "a simple test image",
            image_size: "square_hd",
            num_inference_steps: 4,
            num_images: 1,
          }
        } else if (modelId.includes("rembg") || modelId.includes("remove-bg")) {
          // Background removal models
          input = {
            image_url: testImageUrl,
          }
        } else if (modelId.includes("esrgan") || modelId.includes("supir") || modelId.includes("gfpgan")) {
          // Upscaling/enhancement models
          input = {
            image_url: testImageUrl,
            scale: 2,
          }
        } else {
          // Generic input
          input = {
            image_url: testImageUrl,
            prompt: "test",
          }
        }

        // Test with fal.subscribe (for real-time models)
        try {
          const result = await fal.subscribe(modelId, {
            input,
            logs: true,
            onQueueUpdate: (update) => {
              console.log(`Queue update for ${modelId}:`, update.status)
            },
          })

          results.workingModels.push({
            modelId,
            method: "fal.subscribe",
            status: "success",
            result: typeof result === "object" ? JSON.stringify(result).slice(0, 200) : String(result).slice(0, 200),
            inputUsed: input,
            category: categorizeModel(modelId),
            timestamp: new Date().toISOString(),
          })

          console.log(`✅ ${modelId} works with fal.subscribe`)
        } catch (subscribeError) {
          console.log(`❌ ${modelId} failed with fal.subscribe:`, subscribeError.message)

          // Try with fal.run (for instant models)
          try {
            const result = await fal.run(modelId, {
              input,
            })

            results.workingModels.push({
              modelId,
              method: "fal.run",
              status: "success",
              result: typeof result === "object" ? JSON.stringify(result).slice(0, 200) : String(result).slice(0, 200),
              inputUsed: input,
              category: categorizeModel(modelId),
              timestamp: new Date().toISOString(),
            })

            console.log(`✅ ${modelId} works with fal.run`)
          } catch (runError) {
            results.failedModels.push({
              modelId,
              method: "both",
              status: "failed",
              subscribeError: subscribeError.message,
              runError: runError.message,
              inputUsed: input,
              category: categorizeModel(modelId),
              timestamp: new Date().toISOString(),
            })

            console.log(`❌ ${modelId} failed with both methods`)
          }
        }
      } catch (generalError) {
        results.failedModels.push({
          modelId,
          method: "general",
          status: "error",
          error: generalError.message,
          category: categorizeModel(modelId),
          timestamp: new Date().toISOString(),
        })
      }
    }

    // Generate recommendations based on working models
    results.recommendations = generateRecommendations(results.workingModels)

    // Add configuration info
    results.configuration = {
      falKeyConfigured: !!process.env.FAL_KEY,
      falKeyLength: process.env.FAL_KEY ? process.env.FAL_KEY.length : 0,
      falKeyPrefix: process.env.FAL_KEY ? process.env.FAL_KEY.substring(0, 8) + "..." : "Not configured",
      sdkConfigured: true,
      testedModels: knownModels.length,
      workingCount: results.workingModels.length,
      failedCount: results.failedModels.length,
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Fal AI discovery error:", error)
    return NextResponse.json(
      {
        error: error.message,
        hasApiKey: !!process.env.FAL_KEY,
        keyLength: process.env.FAL_KEY ? process.env.FAL_KEY.length : 0,
        sdkError: true,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

function categorizeModel(modelId) {
  const categories = {
    upscaling: ["esrgan", "real-esrgan", "supir", "upscal"],
    background: ["rembg", "remove-bg", "background"],
    face: ["gfpgan", "face", "portrait"],
    diffusion: ["flux", "stable-diffusion", "sd"],
    other: [],
  }

  const modelLower = modelId.toLowerCase()

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => modelLower.includes(keyword))) {
      return category
    }
  }

  return "other"
}

function generateRecommendations(workingModels) {
  const recommendations = []

  const upscalingModels = workingModels.filter((m) => m.category === "upscaling")
  const backgroundModels = workingModels.filter((m) => m.category === "background")
  const faceModels = workingModels.filter((m) => m.category === "face")
  const diffusionModels = workingModels.filter((m) => m.category === "diffusion")

  if (upscalingModels.length > 0) {
    recommendations.push({
      type: "Image Upscaling",
      modelId: upscalingModels[0].modelId,
      method: upscalingModels[0].method,
      reason: "Best working upscaling model found",
      usage: "Use for enhancing image resolution",
    })
  }

  if (backgroundModels.length > 0) {
    recommendations.push({
      type: "Background Removal",
      modelId: backgroundModels[0].modelId,
      method: backgroundModels[0].method,
      reason: "Working background removal model",
      usage: "Use for removing image backgrounds",
    })
  }

  if (faceModels.length > 0) {
    recommendations.push({
      type: "Face Enhancement",
      modelId: faceModels[0].modelId,
      method: faceModels[0].method,
      reason: "Working face enhancement model",
      usage: "Use for improving face quality in images",
    })
  }

  if (workingModels.length === 0) {
    recommendations.push({
      type: "Configuration Issue",
      reason: "No working models found - check FAL_KEY configuration",
      solution: "Verify your FAL_KEY is valid and has proper permissions",
    })
  }

  return recommendations
}
