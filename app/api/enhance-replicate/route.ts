import { type NextRequest, NextResponse } from "next/server"

/**
 * POST /api/enhance-replicate
 *
 * Enhanced image processing with Replicate AI models
 * Updated to address facial bias issues and provide better options for diverse datasets
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()
  let step = "initialization"

  console.log("🚀 Starting Replicate image enhancement...")
  console.log("📊 Request method:", req.method)
  console.log("📊 Request headers:", Object.fromEntries(req.headers.entries()))

  try {
    /* ------------------------------------------------------------------ */
    step = "validate-token"
    const token = process.env.REPLICATE_API_TOKEN
    if (!token) {
      console.error("❌ REPLICATE_API_TOKEN not configured")
      return NextResponse.json(
        {
          success: false,
          error: "Replicate API token not configured",
          step,
          details: "Environment variable REPLICATE_API_TOKEN is missing",
        },
        { status: 500 },
      )
    }
    if (!token.startsWith("r8_")) {
      console.error("❌ Invalid REPLICATE_API_TOKEN format")
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Replicate API token format",
          step,
          details: "Token should start with 'r8_'",
        },
        { status: 500 },
      )
    }
    console.log("✅ API token is configured and has correct format")

    /* ------------------------------------------------------------------ */
    step = "parse-form"
    const formData = await req.formData().catch((e) => {
      console.error("❌ Failed to parse form data:", e)
      throw new Error(`Could not parse multipart form: ${e}`)
    })

    const file = formData.get("file") as File | null
    const settingsRaw = (formData.get("settings") as string) || "{}"
    if (!file) {
      console.error("❌ No file field in form-data")
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
          step,
          details: "File field is missing from form data",
        },
        { status: 400 },
      )
    }

    if (!file.type.startsWith("image/")) {
      console.error("❌ Invalid file type:", file.type)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type",
          step,
          details: `Expected image file, got ${file.type}`,
        },
        { status: 400 },
      )
    }

    if (file.size > 50 * 1024 * 1024) {
      console.error("❌ File too large:", file.size)
      return NextResponse.json(
        {
          success: false,
          error: "File too large",
          step,
          details: `File size ${file.size} bytes exceeds 50MB limit`,
        },
        { status: 400 },
      )
    }

    const settings = JSON.parse(settingsRaw) as {
      model?: string
      upscaleFactor?: number
      preserveEthnicity?: boolean
      datasetRegion?: string
    }

    console.log("📊 File info:", {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      hasFile: !!file,
    })
    console.log("📊 Settings:", settings)

    /* ------------------------------------------------------------------ */
    step = "buffer→b64"
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`
    if (base64Image.length > 10 * 1024 * 1024) {
      console.error("❌ Base64 image too large:", base64Image.length)
      return NextResponse.json(
        {
          success: false,
          error: "Image too large for processing",
          step,
          details: `Base64 size ${base64Image.length} exceeds limit`,
        },
        { status: 400 },
      )
    }
    console.log(`✅ Converted to base64: ${base64Image.length} characters`)

    /* ------------------------------------------------------------------ */
    step = "model-map"
    const modelMap = {
      "real-esrgan-4x": {
        model: "nightmareai/real-esrgan",
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        inputField: "image",
        biasLevel: "low", // Real-ESRGAN has minimal facial bias
        ethnicityPreservation: "excellent",
        recommendedFor: ["indonesian", "asian", "diverse"],
        getInput: (image, settings) => ({
          image,
          scale: 4,
          tile: settings.tile || 512,
          face_enhance: false, // Disable face enhancement to preserve ethnicity
          fp32: false,
        }),
      },
      "real-esrgan-2x": {
        model: "nightmareai/real-esrgan",
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        inputField: "image",
        biasLevel: "low",
        ethnicityPreservation: "excellent",
        recommendedFor: ["indonesian", "asian", "diverse"],
        getInput: (image, settings) => ({
          image,
          scale: 2,
          tile: settings.tile || 512,
          face_enhance: false, // Preserve original facial features
          fp32: false,
        }),
      },
      "gfpgan-face": {
        model: "tencentarc/gfpgan",
        version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
        inputField: "img",
        biasLevel: "medium", // Some bias but better than Clarity
        ethnicityPreservation: "good",
        recommendedFor: ["asian", "diverse"],
        getInput: (image, settings) => ({
          img: image,
          scale: Math.min(settings.upscaleFactor || 2, 4),
          // GFPGAN has better diversity in training data
        }),
      },
      "codeformer-face": {
        model: "sczhou/codeformer",
        version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
        inputField: "image",
        biasLevel: "medium",
        ethnicityPreservation: "good",
        recommendedFor: ["asian", "diverse"],
        getInput: (image, settings) => ({
          image,
          fidelity: 0.9, // Higher fidelity to preserve original features
          upscale: Math.min(settings.upscaleFactor || 2, 4),
          face_upsample: true,
          background_enhance: true,
          codeformer_fidelity: 0.9, // Preserve original facial characteristics
        }),
      },
      // Updated Clarity Upscaler with bias warning
      "clarity-upscaler": {
        model: "philz1337x/clarity-upscaler",
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        inputField: "image",
        biasLevel: "high", // WARNING: Known to introduce facial bias
        ethnicityPreservation: "poor",
        recommendedFor: ["caucasian"], // Not recommended for diverse datasets
        biasWarning:
          "This model may alter facial features and ethnicity. Not recommended for Indonesian or diverse datasets.",
        getInput: (image, settings) => ({
          image,
          scale_factor: Math.min(settings.upscaleFactor || 2, 4),
          dynamic: 3, // Reduced from 6 to minimize alterations
          creativity: 0.1, // Reduced from 0.35 to preserve original features
          resemblance: 0.9, // Increased from 0.6 to maintain similarity
          tiling: false,
          sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
        }),
      },
      // New bias-aware alternative
      "esrgan-conservative": {
        model: "nightmareai/real-esrgan",
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        inputField: "image",
        biasLevel: "minimal",
        ethnicityPreservation: "excellent",
        recommendedFor: ["indonesian", "asian", "diverse", "conservative"],
        getInput: (image, settings) => ({
          image,
          scale: Math.min(settings.upscaleFactor || 2, 4),
          tile: 256, // Smaller tiles for more conservative processing
          face_enhance: false, // Never enhance faces to preserve ethnicity
          fp32: true, // Higher precision for better preservation
        }),
      },
    }

    const selectedModel = settings.model || "real-esrgan-4x"
    const modelConfig = modelMap[selectedModel]

    if (!modelConfig) {
      console.error(`❌ Unknown model: ${selectedModel}`)
      console.error(`❌ Available models: ${Object.keys(modelMap).join(", ")}`)
      return NextResponse.json(
        {
          success: false,
          error: `Unknown model: ${selectedModel}`,
          step,
          details: `Available models: ${Object.keys(modelMap).join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Check for bias warning with Indonesian dataset
    const datasetRegion = settings.datasetRegion || "indonesian"
    if (modelConfig.biasLevel === "high" && datasetRegion === "indonesian") {
      console.warn(`⚠️ Bias warning for model ${selectedModel} with Indonesian dataset`)
      return NextResponse.json(
        {
          success: false,
          error: "Model not suitable for Indonesian dataset",
          step: "bias-check",
          details: modelConfig.biasWarning,
          recommendations: [
            "Use 'real-esrgan-4x' for best ethnicity preservation",
            "Try 'esrgan-conservative' for minimal alterations",
            "Consider 'gfpgan-face' for face-focused enhancement with better diversity",
          ],
          alternativeModels: Object.entries(modelMap)
            .filter(([_, config]) => config.recommendedFor.includes("indonesian"))
            .map(([id, config]) => ({
              id,
              name: config.model,
              ethnicityPreservation: config.ethnicityPreservation,
              biasLevel: config.biasLevel,
            })),
        },
        { status: 400 },
      )
    }

    console.log(`✅ Using model: ${modelConfig.model} (${selectedModel})`)
    console.log(`📊 Bias level: ${modelConfig.biasLevel}, Ethnicity preservation: ${modelConfig.ethnicityPreservation}`)

    /* ------------------------------------------------------------------ */
    step = "create-prediction"
    const createRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: modelConfig.version,
        input: modelConfig.getInput(base64Image, settings),
      }),
    })

    if (createRes.status === 413) {
      console.error("❌ Image too large for Replicate (413)")
      return NextResponse.json(
        {
          success: false,
          error: "Image too large for Replicate (413)",
          step,
        },
        { status: 413 },
      )
    }

    if (!createRes.ok) {
      const t = await createRes.text()
      console.error(`❌ Prediction creation failed: ${t}`)
      return NextResponse.json(
        {
          success: false,
          error: "Prediction creation failed",
          step,
          details: t.slice(0, 500),
        },
        { status: createRes.status },
      )
    }

    const prediction = (await createRes.json()) as {
      id: string
      status: string
    }

    console.log("✅ Prediction creation response received")
    console.log(`📊 Prediction keys: ${Object.keys(prediction || {}).join(", ")}`)

    if (!prediction || !prediction.id) {
      throw new Error("No prediction ID returned from Replicate")
    }

    console.log(`🔮 Prediction created: ${prediction.id}`)
    console.log(`📊 Initial status: ${prediction.status}`)

    /* ------------------------------------------------------------------ */
    step = "poll"
    const deadline = Date.now() + 5 * 60 * 1000
    let poll = prediction
    while (["starting", "processing"].includes(poll.status)) {
      if (Date.now() > deadline) {
        console.error("❌ Prediction timed out after maximum attempts")
        return NextResponse.json(
          {
            success: false,
            error: "Prediction timed out",
            step,
            details: {
              predictionId: poll.id,
              finalStatus: poll.status,
              attempts: 0,
              maxWaitTime: "300s",
            },
          },
          { status: 408 },
        )
      }

      await new Promise((resolve) => setTimeout(resolve, 2000))

      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${poll.id}`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!pollRes.ok) {
        const t = await pollRes.text()
        console.error(`❌ Polling failed: ${t}`)
        return NextResponse.json(
          {
            success: false,
            error: "Polling failed",
            step,
            details: t.slice(0, 500),
          },
          { status: pollRes.status },
        )
      }

      poll = await pollRes.json()
      console.log(`📊 Updated status: ${poll.status}`)

      if (poll.logs) {
        const recentLogs = poll.logs.slice(-200) // Last 200 chars
        console.log(`📝 Recent logs: ${recentLogs}`)
      }
    }

    if (poll.status !== "succeeded" || !poll.output) {
      console.error("❌ Prediction finished without output", poll)
      return NextResponse.json(
        {
          success: false,
          error: "Prediction finished without output",
          step,
          details: poll,
        },
        { status: 500 },
      )
    }

    const outputUrl = Array.isArray(poll.output) ? poll.output[0] : poll.output

    console.log(`🎯 Enhanced image URL: ${outputUrl}`)

    /* ------------------------------------------------------------------ */
    step = "done"
    const processingTime = `${Math.round((Date.now() - startTime) / 1000)}s`

    const result = {
      success: true,
      downloadUrl: outputUrl,
      model: selectedModel,
      modelName: modelConfig.model,
      replicateModel: modelConfig.model,
      predictionId: poll.id,
      processingTime,
      originalFileName: file.name,
      fileSize: `${Math.round(buffer.length / 1024)}KB`,
      enhancedSize: `Enhanced with ${modelConfig.model}`,
      upscaleFactor: settings.upscaleFactor || 2,
      logs: poll.logs,
      step: "completed",
      biasLevel: modelConfig.biasLevel,
      ethnicityPreservation: modelConfig.ethnicityPreservation,
      datasetCompatibility: modelConfig.recommendedFor.includes(datasetRegion) ? "compatible" : "not-recommended",
    }

    console.log(`🎉 Enhancement completed successfully in ${processingTime}`)
    console.log(`📊 Final result keys: ${Object.keys(result).join(", ")}`)

    return NextResponse.json(result)
  } catch (error) {
    const processingTime = `${Math.round((Date.now() - startTime) / 1000)}s`

    console.error(`❌ Enhancement failed at step ${step}:`, error)
    console.error(`❌ Error name: ${error.name}`)
    console.error(`❌ Error message: ${error.message}`)
    console.error(`❌ Error stack: ${error.stack}`)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error occurred",
        step,
        processingTime,
        timestamp: new Date().toISOString(),
        details: {
          errorName: error.name,
          errorStack: error.stack?.split("\n").slice(0, 5).join("\n"), // First 5 lines of stack
        },
      },
      { status: 500 },
    )
  }
}
