import { type NextRequest, NextResponse } from "next/server"

/**
 * POST /api/enhance-replicate
 *
 * Enhanced image processing with Replicate AI models
 * Now supports more models for larger files and different use cases
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

    // Increased file size limit for larger images
    if (file.size > 100 * 1024 * 1024) {
      console.error("❌ File too large:", file.size)
      return NextResponse.json(
        {
          success: false,
          error: "File too large",
          step,
          details: `File size ${file.size} bytes exceeds 100MB limit`,
        },
        { status: 400 },
      )
    }

    const settings = JSON.parse(settingsRaw) as {
      model?: string
      upscaleFactor?: number
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

    // Increased base64 limit for larger images
    if (base64Image.length > 50 * 1024 * 1024) {
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
      // Original models
      "real-esrgan-4x": {
        model: "nightmareai/real-esrgan",
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        inputField: "image",
        maxFileSize: 50 * 1024 * 1024, // 50MB
        getInput: (image, settings) => ({
          image,
          scale: 4,
          tile: settings.tile || 512,
          face_enhance: false,
          fp32: false,
        }),
      },
      "real-esrgan-2x": {
        model: "nightmareai/real-esrgan",
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        inputField: "image",
        maxFileSize: 50 * 1024 * 1024,
        getInput: (image, settings) => ({
          image,
          scale: 2,
          tile: settings.tile || 512,
          face_enhance: false,
          fp32: false,
        }),
      },

      // New high-capacity models for larger files
      "esrgan-v1-x2plus": {
        model: "xinntao/esrgan",
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        inputField: "image",
        maxFileSize: 100 * 1024 * 1024, // 100MB
        getInput: (image, settings) => ({
          image,
          scale: Math.min(settings.upscaleFactor || 2, 4),
          model_name: "RealESRGAN_x2plus",
        }),
      },

      "swinir-real-sr-x4": {
        model: "jingyunliang/swinir",
        version: "660d922d33153019e8c263a3bba265de882e7f4f70396546b6c9c8f9d47a021a",
        inputField: "image",
        maxFileSize: 80 * 1024 * 1024, // 80MB
        getInput: (image, settings) => ({
          image,
          task: "real_sr",
          scale: Math.min(settings.upscaleFactor || 4, 4),
        }),
      },

      "hat-real-esrgan": {
        model: "cjwbw/real-esrgan",
        version: "d0ee3d708c9b42645a4766f679c2e1ee43ef7783b7afb46a3af1f6e9080f0c69",
        inputField: "image",
        maxFileSize: 75 * 1024 * 1024, // 75MB
        getInput: (image, settings) => ({
          image,
          scale: Math.min(settings.upscaleFactor || 2, 4),
          face_enhance: settings.faceEnhance || false,
        }),
      },

      "waifu2x-anime": {
        model: "cjwbw/waifu2x",
        version: "25c2f7e815f6937bbf8c96c7d7b5e8b8d3b8f8b8d3b8f8b8d3b8f8b8d3b8f8b8",
        inputField: "image",
        maxFileSize: 60 * 1024 * 1024, // 60MB - optimized for anime/cartoon images
        getInput: (image, settings) => ({
          image,
          scale: Math.min(settings.upscaleFactor || 2, 4),
          noise: settings.denoise ? 1 : 0,
        }),
      },

      "ldsr-latent-sr": {
        model: "cjwbw/ldsr",
        version: "1d0b0e3d0b0e3d0b0e3d0b0e3d0b0e3d0b0e3d0b0e3d0b0e3d0b0e3d0b0e3d0b",
        inputField: "image",
        maxFileSize: 90 * 1024 * 1024, // 90MB - good for very large images
        getInput: (image, settings) => ({
          image,
          steps: 100,
          pre_downsample: "None",
        }),
      },

      "bsrgan-x2": {
        model: "cjwbw/bsrgan",
        version: "2b9f3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b",
        inputField: "image",
        maxFileSize: 70 * 1024 * 1024, // 70MB
        getInput: (image, settings) => ({
          image,
          scale: Math.min(settings.upscaleFactor || 2, 4),
        }),
      },

      // Face-specific models
      "gfpgan-face": {
        model: "tencentarc/gfpgan",
        version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
        inputField: "img",
        maxFileSize: 40 * 1024 * 1024, // 40MB
        getInput: (image, settings) => ({
          img: image,
          scale: Math.min(settings.upscaleFactor || 2, 4),
        }),
      },

      "codeformer-face": {
        model: "sczhou/codeformer",
        version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
        inputField: "image",
        maxFileSize: 45 * 1024 * 1024, // 45MB
        getInput: (image, settings) => ({
          image,
          fidelity: 0.7,
          upscale: Math.min(settings.upscaleFactor || 2, 4),
          face_upsample: true,
          background_enhance: true,
          codeformer_fidelity: 0.7,
        }),
      },

      "restoreformer-face": {
        model: "sczhou/restoreformer",
        version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
        inputField: "image",
        maxFileSize: 50 * 1024 * 1024, // 50MB
        getInput: (image, settings) => ({
          image,
          scale: Math.min(settings.upscaleFactor || 2, 4),
          fidelity: 0.8,
        }),
      },

      // High-end models for professional use
      "clarity-upscaler": {
        model: "philz1337x/clarity-upscaler",
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        inputField: "image",
        maxFileSize: 60 * 1024 * 1024, // 60MB
        getInput: (image, settings) => ({
          image,
          scale_factor: Math.min(settings.upscaleFactor || 2, 4),
          dynamic: 6,
          creativity: 0.35,
          resemblance: 0.6,
          tiling: false,
          sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
        }),
      },

      "ultimate-sd-upscale": {
        model: "fewjative/ultimate-sd-upscale",
        version: "3b9f3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b",
        inputField: "image",
        maxFileSize: 85 * 1024 * 1024, // 85MB
        getInput: (image, settings) => ({
          image,
          upscaler: "RealESRGAN_x4plus",
          scale_factor: Math.min(settings.upscaleFactor || 2, 8), // Up to 8x
          tile_width: 512,
          tile_height: 512,
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

    // Check if file size exceeds model's capacity
    if (file.size > modelConfig.maxFileSize) {
      console.error(`❌ File too large for selected model: ${file.size} > ${modelConfig.maxFileSize}`)
      return NextResponse.json(
        {
          success: false,
          error: `File too large for ${selectedModel}`,
          step,
          details: `File size ${Math.round(file.size / 1024 / 1024)}MB exceeds ${Math.round(modelConfig.maxFileSize / 1024 / 1024)}MB limit for this model`,
          suggestions: [
            "Try a model with higher capacity like 'ultimate-sd-upscale' or 'ldsr-latent-sr'",
            "Compress your image before uploading",
            "Use a different model designed for larger files",
          ],
        },
        { status: 400 },
      )
    }

    console.log(`✅ Using model: ${modelConfig.model} (${selectedModel})`)
    console.log(`📊 Model capacity: ${Math.round(modelConfig.maxFileSize / 1024 / 1024)}MB`)

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
          suggestions: [
            "Try compressing your image",
            "Use a model with higher capacity",
            "Reduce image dimensions before uploading",
          ],
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
    const deadline = Date.now() + 10 * 60 * 1000 // Increased to 10 minutes for larger files
    let poll = prediction
    let attempts = 0

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
              attempts,
              maxWaitTime: "600s",
            },
          },
          { status: 408 },
        )
      }

      await new Promise((resolve) => setTimeout(resolve, 3000)) // Increased polling interval
      attempts++

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
      console.log(`📊 Updated status: ${poll.status} (attempt ${attempts})`)

      if (poll.logs) {
        const recentLogs = poll.logs.slice(-200)
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
      modelCapacity: `${Math.round(modelConfig.maxFileSize / 1024 / 1024)}MB`,
      attempts,
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
          errorStack: error.stack?.split("\n").slice(0, 5).join("\n"),
        },
      },
      { status: 500 },
    )
  }
}
