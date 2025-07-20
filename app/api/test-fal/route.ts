import { NextResponse } from "next/server"

/**
 * Test endpoint to discover available Fal AI models
 */
export async function GET() {
  try {
    const auth = { Authorization: `Key ${process.env.FAL_KEY}` }

    // Test more realistic endpoints based on Fal AI's actual model names
    const testEndpoints = [
      // Real-ESRGAN variants
      "https://fal.run/fal-ai/real-esrgan",
      "https://fal.run/lucataco/real-esrgan",
      "https://fal.run/xinntao/real-esrgan",
      "https://fal.run/tencentarc/gfpgan",

      // ESRGAN variants
      "https://fal.run/fal-ai/esrgan",
      "https://fal.run/lucataco/esrgan",

      // Other upscaling models
      "https://fal.run/fal-ai/supir",
      "https://fal.run/fal-ai/waifu2x",

      // Queue versions
      "https://queue.fal.run/fal-ai/real-esrgan",
      "https://queue.fal.run/lucataco/real-esrgan",

      // Try some known working models
      "https://fal.run/fal-ai/remove-background",
      "https://fal.run/fal-ai/flux/schnell",
    ]

    const results = []

    // Also try to get the list of available models
    try {
      const modelsResponse = await fetch("https://fal.run/", {
        method: "GET",
        headers: auth,
      })
      results.push({
        endpoint: "https://fal.run/ (models list)",
        status: modelsResponse.status,
        response: (await modelsResponse.text()).slice(0, 500),
        success: modelsResponse.ok,
      })
    } catch (error) {
      results.push({
        endpoint: "https://fal.run/ (models list)",
        status: "ERROR",
        response: error.message,
        success: false,
      })
    }

    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            ...auth,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image:
              "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
            scale: 2,
          }),
        })

        const text = await response.text()
        results.push({
          endpoint,
          status: response.status,
          response: text.slice(0, 300),
          success: response.ok,
          isUpscaling: endpoint.includes("esrgan") || endpoint.includes("supir") || endpoint.includes("waifu"),
        })
      } catch (error) {
        results.push({
          endpoint,
          status: "ERROR",
          response: error.message,
          success: false,
          isUpscaling: endpoint.includes("esrgan") || endpoint.includes("supir") || endpoint.includes("waifu"),
        })
      }
    }

    return NextResponse.json({
      message: "Fal AI endpoint test results",
      results,
      hasApiKey: !!process.env.FAL_KEY,
      workingEndpoints: results.filter((r) => r.success),
      upscalingEndpoints: results.filter((r) => r.isUpscaling && r.success),
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
