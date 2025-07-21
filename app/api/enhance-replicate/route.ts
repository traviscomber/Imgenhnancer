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

export async function POST(req: NextRequest) {
  console.log("🚀 /api/enhance-replicate: request received")
  try {
    /* ----------------------------- form-data ----------------------------- */
    const fd = await req.formData()
    const file = fd.get("file") as File | null
    const settings = JSON.parse((fd.get("settings") as string | null) ?? "{}")

    if (!file) {
      console.warn("⚠️  No file in form-data")
      return NextResponse.json({ success: false, error: "No file provided", step: "validation" }, { status: 400 })
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("❌ Missing REPLICATE_API_TOKEN")
      return NextResponse.json(
        { success: false, error: "REPLICATE_API_TOKEN env var missing", step: "configuration" },
        { status: 500 },
      )
    }

    /* --------------------------- model config --------------------------- */
    const models = {
      "real-esrgan-4x": {
        model: "nightmareai/real-esrgan",
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        input: "image",
        maxFile: 8 * 1024 * 1024,
      },
      "gfpgan-face": {
        model: "tencentarc/gfpgan",
        version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
        input: "img",
        maxFile: 6 * 1024 * 1024,
      },
      "codeformer-face": {
        model: "sczhou/codeformer",
        version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
        input: "image",
        maxFile: 6 * 1024 * 1024,
      },
      "clarity-upscaler": {
        model: "philz1337x/clarity-upscaler",
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        input: "image",
        maxFile: 8 * 1024 * 1024,
      },
    } as const

    const cfg = models[settings.model as keyof typeof models] ?? models["real-esrgan-4x"]

    /* --------------------------- raw-file gate --------------------------- */
    if (file.size > cfg.maxFile) {
      console.warn(`⚠️  File is ${file.size} B – exceeds model limit ${cfg.maxFile} B`)
      return NextResponse.json(
        {
          success: false,
          error: `File too large for ${settings.model}. Max ${Math.round(cfg.maxFile / 1024 / 1024)} MB`,
          step: "file-size-check",
        },
        { status: 413 },
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
    console.log("📡  Creating Replicate prediction")
    const createRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        version: cfg.version,
        input: {
          [cfg.input]: dataUrl,
          scale: settings.upscaleFactor ?? 2,
          ...(settings.model === "codeformer-face" && { fidelity: 0.7 }),
        },
      }),
    })

    const createBody = await consume(createRes)
    if (!createRes.ok || !createBody.ok) {
      console.error("❌ Replicate create error:", createBody.ok ? createBody.json : createBody.text)
      return NextResponse.json(
        { success: false, error: (createBody.text ?? "Unknown error").slice(0, 300), step: "create-prediction" },
        { status: createRes.status },
      )
    }

    const predictionId = createBody.json.id as string
    console.log("✅ Prediction created:", predictionId)

    /* --------------------------- polling ------------------------------- */
    for (let i = 1; i <= 60; i++) {
      await new Promise((r) => setTimeout(r, 10_000))
      const statusRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` },
      })
      const body = await consume(statusRes)

      if (!body.ok) {
        console.error("❌ Status JSON parse failed")
        return NextResponse.json(
          { success: false, error: body.text.slice(0, 300), step: "status-parse", predictionId },
          { status: 502 },
        )
      }

      const st = body.json
      if (st.status === "succeeded") {
        const url = Array.isArray(st.output) ? st.output[0] : st.output
        console.log("🎉 Enhancement done:", url)
        return NextResponse.json({
          success: true,
          downloadUrl: url,
          predictionId,
          model: settings.model,
          upscaleFactor: settings.upscaleFactor,
          processingTime: `${i * 10}s`,
          method: "replicate",
        })
      }
      if (st.status === "failed") {
        console.error("❌ Replicate marked prediction failed:", st.error)
        return NextResponse.json(
          { success: false, error: st.error ?? "Enhancement failed", step: "processing", predictionId },
          { status: 500 },
        )
      }
      if (st.status === "canceled") {
        console.warn("⚠️  Replicate canceled prediction")
        return NextResponse.json(
          { success: false, error: "Enhancement canceled", step: "processing", predictionId },
          { status: 500 },
        )
      }
    }

    /* --------------------------- timeout ------------------------------- */
    console.error("⏱️  Timed out after 10 min")
    return NextResponse.json(
      { success: false, error: "Timed out after 10 min", step: "timeout", predictionId },
      { status: 408 },
    )
  } catch (err: any) {
    console.error("❌ Uncaught route error:", err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
        stack: process.env.NODE_ENV !== "production" ? err?.stack : undefined,
        step: "server-error",
      },
      { status: 500 },
    )
  }
}
