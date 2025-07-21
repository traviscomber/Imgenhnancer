import { type NextRequest, NextResponse } from "next/server"
import { Buffer } from "buffer"

/**
 * Reads the response body exactly once and tries to JSON-parse it.
 * If parsing fails, throws an Error that contains the raw text in `message`.
 */
async function parseJsonSafe(res: Response) {
  const raw = await res.text()
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error(raw)
  }
}

export async function POST(request: NextRequest) {
  console.log("🚀 Starting enhance-replicate API call")

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const settingsStr = formData.get("settings") as string | null

    /* ─── basic validation ─────────────────────────────────────────────── */
    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided", step: "validation" }, { status: 400 })
    }
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { success: false, error: "Replicate API token not configured", step: "configuration" },
        { status: 500 },
      )
    }

    let settings: any
    try {
      settings = JSON.parse(settingsStr ?? "{}")
    } catch {
      settings = { model: "real-esrgan-4x", upscaleFactor: 2 }
    }

    console.log("📋 Settings:", settings)
    console.log("📁 File:", { name: file.name, size: file.size, type: file.type })

    /* ─── model configuration ──────────────────────────────────────────── */
    const modelConfigs = {
      "real-esrgan-4x": {
        model: "nightmareai/real-esrgan",
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        inputField: "image",
        maxSize: 8 * 1024 * 1024, // 8 MB
      },
      "gfpgan-face": {
        model: "tencentarc/gfpgan",
        version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
        inputField: "img",
        maxSize: 6 * 1024 * 1024, // 6 MB
      },
      "codeformer-face": {
        model: "sczhou/codeformer",
        version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
        inputField: "image",
        maxSize: 6 * 1024 * 1024, // 6 MB
      },
      "clarity-upscaler": {
        model: "philz1337x/clarity-upscaler",
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        inputField: "image",
        maxSize: 8 * 1024 * 1024, // 8 MB
      },
    } as const

    const modelConfig = modelConfigs[settings.model as keyof typeof modelConfigs] ?? modelConfigs["real-esrgan-4x"]

    /* ─── size check ───────────────────────────────────────────────────── */
    if (file.size > modelConfig.maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large for ${settings.model}. Max ${Math.round(modelConfig.maxSize / 1024 / 1024)} MB`,
          step: "file-size-check",
        },
        { status: 413 },
      )
    }

    /* ─── encode file ──────────────────────────────────────────────────── */
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    /* ─── build replicate payload ──────────────────────────────────────── */
    const input: Record<string, unknown> = {
      [modelConfig.inputField]: dataUrl,
      scale: settings.upscaleFactor ?? 2,
    }
    if (settings.model === "codeformer-face") input.fidelity = 0.7

    /* ─── create prediction ────────────────────────────────────────────── */
    const createRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ version: modelConfig.version, input }),
    })

    if (!createRes.ok) {
      const message = await createRes.text()
      return NextResponse.json(
        { success: false, error: message.slice(0, 300), step: "create-prediction" },
        { status: createRes.status },
      )
    }

    const prediction = await createRes.json()
    console.log("✅ Prediction created:", prediction.id)

    /* ─── poll for completion ──────────────────────────────────────────── */
    const maxAttempts = 60
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise((r) => setTimeout(r, 10_000))
      console.log(`🔄 Poll ${attempt}/${maxAttempts}`)

      const statusRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` },
      })

      if (!statusRes.ok) {
        const msg = await statusRes.text()
        console.error("❌ Status fetch failed:", msg)
        continue
      }

      let status: any
      try {
        status = await parseJsonSafe(statusRes)
      } catch (err) {
        console.error("❌ Non-JSON status:", err.message)
        return NextResponse.json(
          { success: false, error: err.message.slice(0, 300), step: "status-parse", predictionId: prediction.id },
          { status: 502 },
        )
      }

      if (status.status === "succeeded") {
        const downloadUrl = Array.isArray(status.output) ? status.output[0] : status.output
        if (typeof downloadUrl !== "string") {
          return NextResponse.json(
            { success: false, error: "Invalid download URL", step: "url-validation" },
            { status: 500 },
          )
        }
        return NextResponse.json({
          success: true,
          downloadUrl,
          predictionId: prediction.id,
          model: settings.model,
          upscaleFactor: settings.upscaleFactor,
          processingTime: `${attempt * 10}s`,
          method: "replicate",
        })
      }

      if (status.status === "failed") {
        return NextResponse.json(
          {
            success: false,
            error: status.error ?? "Enhancement failed",
            step: "processing",
            predictionId: prediction.id,
          },
          { status: 500 },
        )
      }

      if (status.status === "canceled") {
        return NextResponse.json(
          { success: false, error: "Enhancement canceled", step: "processing", predictionId: prediction.id },
          { status: 500 },
        )
      }
    }

    /* ─── timeout ─────────────────────────────────────────────────────── */
    return NextResponse.json(
      { success: false, error: "Enhancement timed out after 10 min", step: "timeout", predictionId: prediction.id },
      { status: 408 },
    )
  } catch (err: any) {
    console.error("❌ Enhancement error:", err)
    return NextResponse.json(
      { success: false, error: err.message ?? "Internal server error", step: "server-error" },
      { status: 500 },
    )
  }
}
