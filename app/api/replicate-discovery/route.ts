import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

/**
 * GET /api/replicate-discovery
 *
 * Discovers and tests available Replicate models for image enhancement
 */
export async function GET(req: NextRequest) {
  console.log("🔍 Starting Replicate model discovery...")

  const results = {
    timestamp: new Date().toISOString(),
    configuration: {
      hasApiKey: false,
      testedModels: 0,
    },
    workingModels: [],
    failedModels: [],
    recommendations: [],
    summary: {
      totalTested: 0,
      working: 0,
      failed: 0,
    },
  }

  try {
    // Check API key
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("❌ REPLICATE_API_TOKEN not configured")
      return NextResponse.json({
        ...results,
        error: "REPLICATE_API_TOKEN not configured",
      })
    }

    results.configuration.hasApiKey = true
    console.log("✅ API token is configured")

    // Initialize Replicate client
    let replicate
    try {
      replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })
    } catch (error) {
      console.error("❌ Failed to initialize Replicate client:", error)
      return NextResponse.json({
        ...results,
        error: "Failed to initialize Replicate client",
      })
    }

    // Models to test
    const modelsToTest = [
      {
        id: "real-esrgan-4x",
        modelId: "nightmareai/real-esrgan",
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        category: "upscaling",
        priority: "high",
        isPrimary: true,
        description: "AI-powered image upscaling using Real-ESRGAN",
      },
      {
        id: "gfpgan-face",
        modelId: "tencentarc/gfpgan",
        version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
        category: "face",
        priority: "medium",
        isPrimary: false,
        description: "Specialized face restoration and enhancement",
      },
      {
        id: "codeformer-face",
        modelId: "sczhou/codeformer",
        version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
        category: "face",
        priority: "medium",
        isPrimary: false,
        description: "Robust face restoration with fidelity control",
      },
      {
        id: "clarity-upscaler",
        modelId: "philz1337x/clarity-upscaler",
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        category: "upscaling",
        priority: "low",
        isPrimary: false,
        description: "High-quality image upscaling with clarity enhancement",
      },
    ]

    results.configuration.testedModels = modelsToTest.length
    results.summary.totalTested = modelsToTest.length

    // Test each model
    for (const model of modelsToTest) {
      console.log(`🧪 Testing model: ${model.modelId}`)

      try {
        // Try to get model info
        const [owner, name] = model.modelId.split("/")
        const modelInfo = await replicate.models.get(owner, name)

        console.log(`✅ Model accessible: ${model.modelId}`)

        // Try to create a test prediction (don't wait for completion)
        const tinyImage =
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"

        let testInput
        if (model.id === "real-esrgan-4x" || model.id === "real-esrgan-2x") {
          testInput = { image: tinyImage, scale: 2 }
        } else if (model.id === "gfpgan-face") {
          testInput = { img: tinyImage, scale: 2 }
        } else if (model.id === "codeformer-face") {
          testInput = {
            image: tinyImage,
            fidelity: 0.7,
            upscale: 2,
            face_upsample: true,
            background_enhance: true,
            codeformer_fidelity: 0.7,
          }
        } else if (model.id === "clarity-upscaler") {
          testInput = {
            image: tinyImage,
            scale_factor: 2,
            dynamic: 6,
            creativity: 0.35,
            resemblance: 0.6,
            tiling: false,
            sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
          }
        }

        const prediction = await replicate.predictions.create({
          version: model.version,
          input: testInput,
        })

        if (prediction?.id) {
          console.log(`✅ Test prediction created for ${model.modelId}: ${prediction.id}`)

          results.workingModels.push({
            ...model,
            predictionId: prediction.id,
            status: "working",
          })
          results.summary.working++
        } else {
          console.log(`⚠️ No prediction ID returned for ${model.modelId}`)
          results.failedModels.push({
            ...model,
            error: "No prediction ID returned",
            status: "failed",
          })
          results.summary.failed++
        }
      } catch (error) {
        console.error(`❌ Model test failed for ${model.modelId}:`, error.message)
        results.failedModels.push({
          ...model,
          error: error.message,
          status: "failed",
        })
        results.summary.failed++
      }
    }

    // Generate recommendations
    if (results.workingModels.length > 0) {
      const primaryModel = results.workingModels.find((m) => m.isPrimary)
      if (primaryModel) {
        results.recommendations.push({
          type: "Primary Model Ready",
          modelId: primaryModel.modelId,
          priority: "high",
          reason: "Real-ESRGAN is working and ready for general image upscaling",
          usage: "Recommended for most image enhancement tasks",
        })
      }

      const faceModels = results.workingModels.filter((m) => m.category === "face")
      if (faceModels.length > 0) {
        results.recommendations.push({
          type: "Face Enhancement Available",
          priority: "medium",
          reason: `${faceModels.length} face enhancement model(s) are working`,
          usage: "Use for portraits and face-focused images",
        })
      }
    }

    if (results.failedModels.length > 0) {
      results.recommendations.push({
        type: "Model Access Issues",
        priority: "low",
        reason: `${results.failedModels.length} model(s) failed to initialize`,
        solution: "Check Replicate API permissions and model availability",
      })
    }

    console.log(`🔍 Discovery completed: ${results.summary.working}/${results.summary.totalTested} models working`)

    return NextResponse.json(results)
  } catch (error) {
    console.error("❌ Discovery failed:", error)
    return NextResponse.json(
      {
        ...results,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
