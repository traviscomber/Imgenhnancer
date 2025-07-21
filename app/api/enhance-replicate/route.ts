import { type NextRequest, NextResponse } from "next/server"
import { Buffer } from "buffer"
import sharp from "sharp"

/* -------- make sure we aren't deployed on the edge (Sharp needs Node) ------- */
export const runtime = "nodejs"

/* ---------- helpers --------------------------------------------------------- */
const BASE64_MULTIPLIER = 1.37 // ≈ expansion factor from raw bytes → base64
const MAX_PAYLOAD = 9 * 1024 * 1024 // 9 MB (Replicate accepts up to ~10 MB)

/** Consumes a `Response` exactly once, tries to JSON-parse – falls back to raw */
async function consume(res: Response) {
  const text = await res.text()
  try {
    return { ok: true, json: JSON.parse(text) }
  } catch {
    return { ok: false, text }
  }
}

/** Iteratively resize / recompress until `jpeg` buffer ≤ `targetBytes`          */
async function autoCompress(buf: Buffer, targetBytes: number, { startQuality = 90, minQuality = 50, step = 10 } = {}) {
  let quality = startQuality
  const image = sharp(buf).rotate()
  const meta = await image.metadata()
  let width = meta.width || 4096

  while (buf.length > targetBytes && quality >= minQuality) {
    width = Math.floor(width * 0.9) // 10 % shrink each round
    buf = await sharp(buf).resize({ width }).jpeg({ quality }).toBuffer()
    quality -= step
  }

  return buf
}

/* ---------- main handler ---------------------------------------------------- */
export async function POST(req: NextRequest) {
  try {
    /* form-data -------------------------------------------------------------- */
    const fd = await req.formData()
    const file = fd.get("file") as File | null
    const settings = JSON.parse((fd.get("settings") as string | null) ?? "{}")

    if (!file)
      return NextResponse.json({ success: false, error: "No file provided", step: "validation" }, { status: 400 })

    if (!process.env.REPLICATE_API_TOKEN)
      return NextResponse.json(
        { success: false, error: "REPLICATE_API_TOKEN missing", step: "configuration" },
        { status: 500 },
      )

    /* model config ----------------------------------------------------------- */
    const models = {
      "real-esrgan-4x": {
        model: "nightmareai/real-esrgan",
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        input: "image",
        max: 8 * 1024 * 1024,
      },
      "gfpgan-face": {
        model: "tencentarc/gfpgan",
        version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
        input: "img",
        max: 6 * 1024 * 1024,
      },
      "codeformer-face": {
        model: "sczhou/codeformer",
        version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
        input: "image",
        max: 6 * 1024 * 1024,
      },
      "clarity-upscaler": {
        model: "philz1337x/clarity-upscaler",
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        input: "image",
        max: 8 * 1024 * 1024,
      },
    } as const

    const cfg = models[settings.model as keyof typeof models] ?? models["real-esrgan-4x"]

    /* raw-size gate ---------------------------------------------------------- */
    if (file.size > cfg.max)
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Max ${Math.round(cfg.max / 1024 / 1024)} MB`,
          step: "file-size-check",
        },
        { status: 413 },
      )

    /* read & maybe compress -------------------------------------------------- */
    let buf = Buffer.from(await file.arrayBuffer())

    // additional guard: ensure base64 payload ≤ limit (accounts for 37 % bloat)
    if (buf.length * BASE64_MULTIPLIER > MAX_PAYLOAD) {
      buf = await autoCompress(buf, Math.floor(MAX_PAYLOAD / BASE64_MULTIPLIER))
    }

    const dataUrl = `data:image/jpeg;base64,${buf.toString("base64")}`

    /* payload-size sanity check --------------------------------------------- */
    if (dataUrl.length > MAX_PAYLOAD * 1.1)
      // small head-room for prefix chars
      return NextResponse.json(
        {
          success: false,
          error: "Image could not be compressed under Replicate’s 10 MB limit",
          step: "auto-compress",
        },
        { status: 413 },
      )

    /* create prediction ------------------------------------------------------ */
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
      return NextResponse.json(
        { success: false, error: (createBody.text ?? "Unknown").slice(0, 300), step: "create-prediction" },
        { status: createRes.status },
      )
    }
    const predictionId = createBody.json.id as string

    /* poll for completion ---------------------------------------------------- */
    for (let poll = 1; poll <= 60; poll++) {
      await new Promise((r) => setTimeout(r, 10_000))

      const statusRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` },
      })
      const body = await consume(statusRes)

      if (!body.ok)
        return NextResponse.json(
          { success: false, error: body.text.slice(0, 300), step: "status-parse", predictionId },
          { status: 502 },
        )

      const st = body.json
      if (st.status === "succeeded") {
        const url = Array.isArray(st.output) ? st.output[0] : st.output
        return NextResponse.json({
          success: true,
          downloadUrl: url,
          predictionId,
          model: settings.model,
          upscaleFactor: settings.upscaleFactor,
          processingTime: `${poll * 10}s`,
          method: "replicate",
        })
      }
      if (st.status === "failed")
        return NextResponse.json(
          { success: false, error: st.error ?? "Enhancement failed", step: "processing", predictionId },
          { status: 500 },
        )
      if (st.status === "canceled")
        return NextResponse.json(
          { success: false, error: "Enhancement canceled", step: "processing", predictionId },
          { status: 500 },
        )
    }

    /* timeout ---------------------------------------------------------------- */
    return NextResponse.json(
      { success: false, error: "Timed out after 10 min", step: "timeout", predictionId },
      { status: 408 },
    )
  } catch (err: any) {
    console.error("❌ Fatal error:", err)
    return NextResponse.json(
      { success: false, error: err.message ?? "Internal error", step: "server-error" },
      { status: 500 },
    )
  }
}
