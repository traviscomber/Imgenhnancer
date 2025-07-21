import { type NextRequest, NextResponse } from "next/server"
import { Buffer } from "buffer"

/**
 * Reads the body once, tries JSON.parse → returns `{ ok, json?, text }`.
 */
async function consume(res: Response) {
  const text = await res.text()
  try {
    return { ok: true, json: JSON.parse(text) }
  } catch {
    return { ok: false, text }
  }
}

/* ----------------------------- model map ------------------------------ */
const REPLICATE_MODELS: Record<string, { version: string; inputField: string }> = {
  "real-esrgan-4x": {
    version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
    inputField: "image",
  },
  "gfpgan-face": {
    version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
    inputField: "img",
  },
  "codeformer-face": {
    version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
    inputField: "image",
  },
  "clarity-upscaler": {
    version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
    inputField: "image",
  },
}

/* Base-64 increases payload by ~37 %. We keep a little buffer under 10 MB. */
/* ---------- size limits ---------- */
const RAW_COMPRESSION_THRESHOLD = 6 * 1024 * 1024 // 6 MB (trigger compression)
const MAX_REPLICATE_PAYLOAD = 8 * 1024 * 1024 // 8 MB JSON body cap
const BASE64_MULTIPLIER = 1.37 // base-64 blow-up

async function compressImage(
  input: ArrayBuffer,
  targetBytes: number,
  initialQuality = 85,
): Promise<{ buffer: Buffer; mime: string; ok: boolean }> {
  try {
    // ⬇️  dynamic import avoids Vercel bundle failures if sharp isn’t present
    const sharp = (await import("sharp")).default
    let quality = initialQuality
    let img = sharp(Buffer.from(input)).rotate()

    // Down-scale ultra-large images
    const meta = await img.metadata()
    if ((meta.width ?? 0) > 4096) img = img.resize(4096)

    while (quality >= 50) {
      const buf = await img.jpeg({ quality, mozjpeg: true }).toBuffer()
      if (buf.byteLength <= targetBytes) {
        return { buffer: buf, mime: "image/jpeg", ok: true }
      }
      quality -= 5
    }

    // Best-effort result
    const fallback = await img.jpeg({ quality: 50, mozjpeg: true }).toBuffer()
    return { buffer: fallback, mime: "image/jpeg", ok: true }
  } catch (err) {
    // sharp unavailable or failed → skip compression
    console.warn("⚠️  sharp compression skipped:", (err as Error).message)
    return { buffer: Buffer.from(input), mime: "application/octet-stream", ok: false }
  }
}

export const maxDuration = 300 // 5 minutes max duration

export async function POST(req: NextRequest) {
  console.log("🚀 Replicate enhancement request received")
  try {
    /* ----------------------------- form-data ----------------------------- */
    const fd = await req.formData()
    const file = fd.get("file") as File | null
    const settingsJson = (fd.get("settings") as string | null) ?? "{}"

    if (!file) {
      console.error("❌ No file provided")
      return NextResponse.json({ success: false, error: "No file provided", step: "file_check" }, { status: 400 })
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("❌ Missing REPLICATE_API_TOKEN")
      return NextResponse.json(
        { success: false, error: "Missing Replicate API configuration", step: "config_check" },
        { status: 500 },
      )
    }

    /* --------------------------- parse settings --------------------------- */
    let settings
    try {
      settings = JSON.parse(settingsJson)
      console.log("📝 Settings:", settings)
    } catch (error) {
      console.error("❌ Invalid settings JSON:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid settings format",
          step: "settings_parse",
        },
        { status: 400 },
      )
    }

    /* -------------------- enrich settings from server map -------------------- */
    if (!settings?.model || !(settings.model in REPLICATE_MODELS)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unknown or missing model "${settings?.model}"`,
          step: "settings_validation",
        },
        { status: 400 },
      )
    }

    // Merge defaults from map
    const modelInfo = REPLICATE_MODELS[settings.model]
    settings = {
      upscaleFactor: 2,
      ...settings,
      version: settings.version ?? modelInfo.version,
      input: settings.input ?? modelInfo.inputField,
    }

    /* --------------------------- raw-file gate --------------------------- */
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_FILE_SIZE) {
      console.error(`❌ File too large: ${file.size / 1024 / 1024} MB`)
      return NextResponse.json(
        {
          success: false,
          error: `File too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB.`,
          step: "file_size_check",
        },
        { status: 400 },
      )
    }

    /* --------------------- read + (optional) compress --------------------- */
    let fileBuffer = await file.arrayBuffer()
    let finalMime = file.type

    const estimatedEncoded = Math.ceil(file.size * BASE64_MULTIPLIER)
    if (file.size > RAW_COMPRESSION_THRESHOLD || estimatedEncoded > MAX_REPLICATE_PAYLOAD) {
      console.log(`🗜️  Compression attempt – original ${file.size} B, est. encoded ${estimatedEncoded} B`)
      const compressed = await compressImage(fileBuffer, MAX_REPLICATE_PAYLOAD / BASE64_MULTIPLIER)
      fileBuffer = compressed.buffer
      if (compressed.ok) finalMime = compressed.mime
      console.log(`✅ Using buffer of ${fileBuffer.byteLength} B after compression step`)
    }

    /* ----------------------------- encode ------------------------------- */
    const base64 = Buffer.from(fileBuffer).toString("base64")
    const dataUrl = `data:${finalMime};base64,${base64}`

    /* ---------------------- create prediction --------------------------- */
    console.log("🌐 Calling Replicate API...")
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        version: settings.version, // ✅ always present now
        input: {
          [settings.input]: dataUrl,
          scale: settings.upscaleFactor ?? 2,
          ...(settings.model === "codeformer-face" && { fidelity: 0.7 }),
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Replicate API error: ${response.status} ${response.statusText}`, errorText)

      return NextResponse.json(
        {
          success: false,
          error: `Replicate API error: ${response.status} ${response.statusText}`,
          details: errorText,
          step: "replicate_api_call",
        },
        { status: response.status },
      )
    }

    const prediction = await response.json()
    console.log("✅ Prediction created:", prediction.id)

    /* --------------------------- polling ------------------------------- */
    let result = prediction
    let attempts = 0
    const maxAttempts = 60 // 5 minutes max (with 5s interval)

    while (["starting", "processing"].includes(result.status) && attempts < maxAttempts) {
      console.log(
        `⏳ Waiting for prediction ${result.id}, status: ${result.status}, attempt ${attempts + 1}/${maxAttempts}`,
      )

      // Wait 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000))

      // Check prediction status
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`, "Content-Type": "application/json" },
      })

      if (!statusResponse.ok) {
        console.error(`❌ Failed to check prediction status: ${statusResponse.status}`)
        break
      }

      result = await statusResponse.json()
      attempts++
    }

    /* --------------------------- timeout ------------------------------- */
    if (attempts >= maxAttempts) {
      console.error("⏱️  Timed out after 5 min")
      return NextResponse.json(
        { success: false, error: "Timed out after 5 min", step: "timeout", predictionId: prediction.id },
        { status: 408 },
      )
    }

    /* --------------------------- final check ------------------------------- */
    if (result.status === "succeeded" && result.output) {
      const url = Array.isArray(result.output) ? result.output[0] : result.output
      console.log("🎉 Enhancement done:", url)
      return NextResponse.json({
        success: true,
        downloadUrl: url,
        predictionId: prediction.id,
        model: settings.model,
        upscaleFactor: settings.upscaleFactor,
        processingTime: `${attempts * 5}s`,
        method: "replicate",
      })
    } else {
      console.error("❌ Enhancement failed:", result)
      return NextResponse.json(
        {
          success: false,
          error: `Enhancement failed: ${result.error || "Unknown error"}`,
          status: result.status,
          step: "replicate_processing",
          details: result,
        },
        { status: 500 },
      )
    }
  } catch (err: any) {
    console.error("❌ Server error:", err)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: err instanceof Error ? err.message : "Unknown error",
        step: "server_error",
      },
      { status: 500 },
    )
  }
}
