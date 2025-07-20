import { NextResponse } from "next/server"

/**
 * Try to discover what Fal AI models are actually available
 */
export async function GET() {
  try {
    const auth = { Authorization: `Key ${process.env.FAL_KEY}` }

    // Try to get the list of available models
    const discoveryAttempts = []

    // Try different ways to discover models
    const discoveryEndpoints = [
      "https://fal.run/",
      "https://fal.run/models",
      "https://api.fal.ai/models",
      "https://queue.fal.run/",
    ]

    for (const endpoint of discoveryEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: auth,
        })
        const text = await response.text()
        discoveryAttempts.push({
          endpoint,
          status: response.status,
          response: text.slice(0, 1000),
          success: response.ok,
        })
      } catch (error) {
        discoveryAttempts.push({
          endpoint,
          status: "ERROR",
          response: error.message,
          success: false,
        })
      }
    }

    // Try some known working models from Fal AI's public examples
    const knownModels = [
      "fal-ai/flux/schnell",
      "fal-ai/flux/dev",
      "fal-ai/stable-diffusion-v3-medium",
      "fal-ai/rembg",
      "lucataco/remove-bg",
      "lucataco/real-esrgan-upscaler",
      "xinntao/realesrgan",
      "tencentarc/gfpgan",
      "nightmareai/real-esrgan",
      "lucataco/esrgan",
    ]

    const modelTests = []

    // Test a few models with a simple request
    for (const model of knownModels.slice(0, 5)) {
      try {
        const response = await fetch(`https://fal.run/${model}`, {
          method: "POST",
          headers: {
            ...auth,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Minimal test payload
            prompt: "test",
            image:
              "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
          }),
        })

        const text = await response.text()
        modelTests.push({
          model,
          endpoint: `https://fal.run/${model}`,
          status: response.status,
          response: text.slice(0, 300),
          success: response.ok,
          isUpscaling: model.includes("esrgan") || model.includes("gfpgan") || model.includes("upscal"),
        })
      } catch (error) {
        modelTests.push({
          model,
          endpoint: `https://fal.run/${model}`,
          status: "ERROR",
          response: error.message,
          success: false,
          isUpscaling: model.includes("esrgan") || model.includes("gfpgan") || model.includes("upscal"),
        })
      }
    }

    return NextResponse.json({
      message: "Fal AI model discovery results",
      hasApiKey: !!process.env.FAL_KEY,
      discoveryAttempts,
      modelTests,
      workingModels: modelTests.filter((m) => m.success),
      upscalingModels: modelTests.filter((m) => m.isUpscaling && m.success),
      recommendation: "Use the working models found above for image enhancement",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message,
        hasApiKey: !!process.env.FAL_KEY,
      },
      { status: 500 },
    )
  }
}
