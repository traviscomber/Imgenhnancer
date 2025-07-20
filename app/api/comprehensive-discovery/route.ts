import { NextResponse } from "next/server"

/**
 * Comprehensive Fal AI endpoint discovery system
 */
export async function GET() {
  try {
    const auth = { Authorization: `Key ${process.env.FAL_KEY}` }
    const results = {
      timestamp: new Date().toISOString(),
      hasApiKey: !!process.env.FAL_KEY,
      discoveryStrategies: [],
      workingEndpoints: [],
      failedEndpoints: [],
      recommendations: [],
    }

    // Strategy 1: Test official Fal AI documentation endpoints
    console.log("🔍 Strategy 1: Testing official documented endpoints...")
    const officialEndpoints = [
      // Image upscaling models
      "fal-ai/real-esrgan",
      "fal-ai/esrgan",
      "fal-ai/supir",
      "fal-ai/waifu2x",

      // Background removal
      "fal-ai/rembg",
      "fal-ai/remove-background",

      // Face enhancement
      "fal-ai/gfpgan",
      "tencentarc/gfpgan",

      // Popular community models
      "lucataco/real-esrgan-upscaler",
      "lucataco/remove-bg",
      "xinntao/realesrgan",
      "nightmareai/real-esrgan",

      // Stable Diffusion models (for reference)
      "fal-ai/flux/schnell",
      "fal-ai/flux/dev",
      "fal-ai/stable-diffusion-v3-medium",
    ]

    const strategy1Results = await testEndpointList("Official Endpoints", officialEndpoints, auth)
    results.discoveryStrategies.push(strategy1Results)

    // Strategy 2: Test different URL patterns
    console.log("🔍 Strategy 2: Testing URL pattern variations...")
    const baseModels = ["real-esrgan", "esrgan", "rembg", "gfpgan"]
    const urlPatterns = [
      (model) => `fal-ai/${model}`,
      (model) => `lucataco/${model}`,
      (model) => `xinntao/${model}`,
      (model) => `tencentarc/${model}`,
      (model) => `nightmareai/${model}`,
      (model) => `${model}`,
    ]

    const patternEndpoints = []
    baseModels.forEach((model) => {
      urlPatterns.forEach((pattern) => {
        patternEndpoints.push(pattern(model))
      })
    })

    const strategy2Results = await testEndpointList("URL Patterns", patternEndpoints, auth)
    results.discoveryStrategies.push(strategy2Results)

    // Strategy 3: Test queue vs direct endpoints
    console.log("🔍 Strategy 3: Testing queue vs direct endpoints...")
    const workingModels = [
      ...strategy1Results.working.map((w) => w.endpoint),
      ...strategy2Results.working.map((w) => w.endpoint),
    ]

    const queueTests = []
    for (const model of workingModels.slice(0, 5)) {
      // Test first 5 working models
      queueTests.push({
        direct: `https://fal.run/${model}`,
        queue: `https://queue.fal.run/${model}`,
        model,
      })
    }

    const strategy3Results = await testQueueVsDirect(queueTests, auth)
    results.discoveryStrategies.push(strategy3Results)

    // Strategy 4: Try to discover models via API introspection
    console.log("🔍 Strategy 4: API introspection...")
    const strategy4Results = await tryApiIntrospection(auth)
    results.discoveryStrategies.push(strategy4Results)

    // Strategy 5: Test with different input formats
    console.log("🔍 Strategy 5: Testing input format variations...")
    const bestWorkingEndpoints = results.discoveryStrategies.flatMap((s) => s.working || []).slice(0, 3) // Test top 3 working endpoints

    const strategy5Results = await testInputFormats(bestWorkingEndpoints, auth)
    results.discoveryStrategies.push(strategy5Results)

    // Compile final results
    results.workingEndpoints = results.discoveryStrategies
      .flatMap((s) => s.working || [])
      .filter((endpoint, index, self) => index === self.findIndex((e) => e.endpoint === endpoint.endpoint)) // Remove duplicates

    results.failedEndpoints = results.discoveryStrategies
      .flatMap((s) => s.failed || [])
      .filter((endpoint, index, self) => index === self.findIndex((e) => e.endpoint === endpoint.endpoint)) // Remove duplicates

    // Generate recommendations
    results.recommendations = generateRecommendations(results)

    return NextResponse.json(results)
  } catch (error) {
    console.error("Comprehensive discovery error:", error)
    return NextResponse.json(
      {
        error: error.message,
        hasApiKey: !!process.env.FAL_KEY,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

async function testEndpointList(strategyName, endpoints, auth) {
  const results = {
    strategy: strategyName,
    totalTested: endpoints.length,
    working: [],
    failed: [],
    summary: {},
  }

  const testImage =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="

  for (const endpoint of endpoints) {
    try {
      const fullUrl = endpoint.startsWith("http") ? endpoint : `https://fal.run/${endpoint}`

      // Try multiple input formats for each endpoint
      const inputVariations = [
        { image: testImage, scale: 2 },
        { image_url: testImage, scale: 2 },
        { img: testImage, scale: 2 },
        { input_image: testImage, scale: 2 },
        { prompt: "test", image: testImage },
        { image: testImage },
        { image_url: testImage },
      ]

      let bestResult = null
      let bestStatus = 0

      for (const input of inputVariations) {
        try {
          const response = await fetch(fullUrl, {
            method: "POST",
            headers: {
              ...auth,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
          })

          const text = await response.text()

          if (response.status > bestStatus) {
            bestStatus = response.status
            bestResult = {
              endpoint: fullUrl,
              model: endpoint,
              status: response.status,
              response: text.slice(0, 500),
              success: response.ok,
              inputFormat: input,
              category: categorizeEndpoint(endpoint),
              responseTime: Date.now(),
            }
          }

          if (response.ok) break // If successful, no need to try other inputs
        } catch (inputError) {
          // Continue to next input variation
        }
      }

      if (bestResult) {
        if (bestResult.success) {
          results.working.push(bestResult)
        } else {
          results.failed.push(bestResult)
        }
      }
    } catch (error) {
      results.failed.push({
        endpoint: endpoint.startsWith("http") ? endpoint : `https://fal.run/${endpoint}`,
        model: endpoint,
        status: "ERROR",
        response: error.message,
        success: false,
        category: categorizeEndpoint(endpoint),
      })
    }
  }

  results.summary = {
    working: results.working.length,
    failed: results.failed.length,
    successRate: `${((results.working.length / results.totalTested) * 100).toFixed(1)}%`,
    categories: groupByCategory(results.working),
  }

  return results
}

async function testQueueVsDirect(queueTests, auth) {
  const results = {
    strategy: "Queue vs Direct",
    totalTested: queueTests.length * 2,
    working: [],
    failed: [],
    comparison: [],
  }

  const testImage =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="

  for (const test of queueTests) {
    const comparison = {
      model: test.model,
      direct: null,
      queue: null,
      recommendation: null,
    }

    // Test direct endpoint
    try {
      const directResponse = await fetch(test.direct, {
        method: "POST",
        headers: {
          ...auth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: testImage, scale: 2 }),
      })

      const directText = await directResponse.text()
      comparison.direct = {
        endpoint: test.direct,
        status: directResponse.status,
        success: directResponse.ok,
        response: directText.slice(0, 200),
      }

      if (directResponse.ok) {
        results.working.push({
          endpoint: test.direct,
          model: test.model,
          type: "direct",
          status: directResponse.status,
          success: true,
        })
      } else {
        results.failed.push({
          endpoint: test.direct,
          model: test.model,
          type: "direct",
          status: directResponse.status,
          success: false,
        })
      }
    } catch (error) {
      comparison.direct = {
        endpoint: test.direct,
        status: "ERROR",
        success: false,
        response: error.message,
      }
    }

    // Test queue endpoint
    try {
      const queueResponse = await fetch(test.queue, {
        method: "POST",
        headers: {
          ...auth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: testImage, scale: 2 }),
      })

      const queueText = await queueResponse.text()
      comparison.queue = {
        endpoint: test.queue,
        status: queueResponse.status,
        success: queueResponse.ok,
        response: queueText.slice(0, 200),
      }

      if (queueResponse.ok) {
        results.working.push({
          endpoint: test.queue,
          model: test.model,
          type: "queue",
          status: queueResponse.status,
          success: true,
        })
      } else {
        results.failed.push({
          endpoint: test.queue,
          model: test.model,
          type: "queue",
          status: queueResponse.status,
          success: false,
        })
      }
    } catch (error) {
      comparison.queue = {
        endpoint: test.queue,
        status: "ERROR",
        success: false,
        response: error.message,
      }
    }

    // Generate recommendation
    if (comparison.direct?.success && comparison.queue?.success) {
      comparison.recommendation = "Both work - use direct for faster response"
    } else if (comparison.direct?.success) {
      comparison.recommendation = "Use direct endpoint"
    } else if (comparison.queue?.success) {
      comparison.recommendation = "Use queue endpoint"
    } else {
      comparison.recommendation = "Neither endpoint works"
    }

    results.comparison.push(comparison)
  }

  return results
}

async function tryApiIntrospection(auth) {
  const results = {
    strategy: "API Introspection",
    attempts: [],
    working: [],
    failed: [],
  }

  const introspectionUrls = [
    "https://fal.run/",
    "https://fal.run/models",
    "https://api.fal.ai/models",
    "https://api.fal.ai/",
    "https://queue.fal.run/",
    "https://fal.run/docs",
    "https://fal.run/api/docs",
  ]

  for (const url of introspectionUrls) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: auth,
      })

      const text = await response.text()
      const attempt = {
        url,
        status: response.status,
        success: response.ok,
        contentType: response.headers.get("content-type"),
        responseLength: text.length,
        containsModels: text.toLowerCase().includes("model"),
        containsEndpoints: text.toLowerCase().includes("endpoint"),
        response: text.slice(0, 1000),
      }

      results.attempts.push(attempt)

      if (response.ok) {
        results.working.push(attempt)
      } else {
        results.failed.push(attempt)
      }
    } catch (error) {
      results.failed.push({
        url,
        status: "ERROR",
        success: false,
        response: error.message,
      })
    }
  }

  return results
}

async function testInputFormats(workingEndpoints, auth) {
  const results = {
    strategy: "Input Format Testing",
    endpointTests: [],
    bestFormats: {},
  }

  const inputFormats = [
    { name: "Standard", data: { image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//2Q==", scale: 2 } },
    { name: "URL Format", data: { image_url: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//2Q==", scale: 2 } },
    {
      name: "Input Image",
      data: { input_image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//2Q==", scale: 2 },
    },
    { name: "Img Field", data: { img: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//2Q==", scale: 2 } },
    {
      name: "With Prompt",
      data: { image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//2Q==", prompt: "enhance", scale: 2 },
    },
    {
      name: "Face Enhance",
      data: { image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//2Q==", face_enhance: true, scale: 2 },
    },
  ]

  for (const endpoint of workingEndpoints.slice(0, 3)) {
    const endpointTest = {
      endpoint: endpoint.endpoint,
      formatResults: [],
    }

    for (const format of inputFormats) {
      try {
        const response = await fetch(endpoint.endpoint, {
          method: "POST",
          headers: {
            ...auth,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(format.data),
        })

        const text = await response.text()
        endpointTest.formatResults.push({
          format: format.name,
          status: response.status,
          success: response.ok,
          response: text.slice(0, 200),
        })
      } catch (error) {
        endpointTest.formatResults.push({
          format: format.name,
          status: "ERROR",
          success: false,
          response: error.message,
        })
      }
    }

    results.endpointTests.push(endpointTest)
  }

  return results
}

function categorizeEndpoint(endpoint) {
  const categories = {
    upscaling: ["esrgan", "real-esrgan", "supir", "waifu2x", "upscal"],
    background: ["rembg", "remove-bg", "background"],
    face: ["gfpgan", "face", "portrait"],
    diffusion: ["flux", "stable-diffusion", "sd"],
    other: [],
  }

  const endpointLower = endpoint.toLowerCase()

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => endpointLower.includes(keyword))) {
      return category
    }
  }

  return "other"
}

function groupByCategory(endpoints) {
  const groups = {}
  endpoints.forEach((endpoint) => {
    const category = endpoint.category || "other"
    if (!groups[category]) groups[category] = 0
    groups[category]++
  })
  return groups
}

function generateRecommendations(results) {
  const recommendations = []

  const workingUpscaling = results.workingEndpoints.filter((e) => e.category === "upscaling")
  const workingBackground = results.workingEndpoints.filter((e) => e.category === "background")
  const workingFace = results.workingEndpoints.filter((e) => e.category === "face")

  if (workingUpscaling.length > 0) {
    recommendations.push({
      type: "Image Upscaling",
      endpoint: workingUpscaling[0].endpoint,
      model: workingUpscaling[0].model,
      reason: "Best working upscaling model found",
    })
  }

  if (workingBackground.length > 0) {
    recommendations.push({
      type: "Background Removal",
      endpoint: workingBackground[0].endpoint,
      model: workingBackground[0].model,
      reason: "Working background removal model",
    })
  }

  if (workingFace.length > 0) {
    recommendations.push({
      type: "Face Enhancement",
      endpoint: workingFace[0].endpoint,
      model: workingFace[0].model,
      reason: "Working face enhancement model",
    })
  }

  if (results.workingEndpoints.length === 0) {
    recommendations.push({
      type: "API Key Issue",
      reason: "No working endpoints found - check your FAL_KEY permissions",
    })
  }

  return recommendations
}
