import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

/**
 * POST /api/enhance-replicate
 *
 * Body (JSON)
 *  ├─ image:         base64 string OR http/https URL
 *  ├─ modelVersion:  Replicate version ID (not the “owner/model” slug)
 *  ├─ upscale:       1–4 depending on the selected model (optional, default 2)
 *  └─ enhance:       true = apply face/detail enhancement if the model supports it (optional, default true)
 *
 * This route processes images with Replicate AI models
 */
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN ?? "" })

interface EnhanceBody {
  image: string // base64 string OR http/https URL
  modelVersion: string // Replicate version ID (not the “owner/model” slug)
  upscale?: number // 1–4 depending on the selected model
  enhance?: boolean // true = apply face/detail enhancement if the model supports it
}

export async function POST(req: NextRequest) {
  const step = { current: "start" }
  const startTime = Date.now()

  console.log("🚀 Starting image enhancement with Replicate...")
  console.log("📊 Request headers:", Object.fromEntries(req.headers.entries()))

  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("❌ REPLICATE_API_TOKEN not configured")
      return NextResponse.json({ error: "REPLICATE_API_TOKEN not configured", step: "env" }, { status: 500 })
    }

    console.log("✅ API token is configured")

    /* ---------- Parse & validate input ---------- */
    step.current = "parse-body"
    const { image, modelVersion, upscale = 2, enhance = true } = (await req.json()) as EnhanceBody

    if (!image) {
      console.error("❌ Missing `image`")
      return NextResponse.json({ error: "Missing `image`", step: step.current }, { status: 400 })
    }
    if (!modelVersion) {
      console.error("❌ Missing `modelVersion` (Replicate version id)")
      return NextResponse.json(
        { error: "Missing `modelVersion` (Replicate version id)", step: step.current },
        { status: 400 },
      )
    }

    console.log(`🖼️ Processing image: ${image}`)
    console.log(`🤖 Selected model version: ${modelVersion}`)
    console.log(`📈 Upscale factor: ${upscale}x`)
    console.log(`⚙️ Enhance enabled: ${enhance}`)

    /* ---------- Acquire image bytes if a URL was passed ---------- */
    step.current = "fetch-image"
    let imageData: string
    if (image.startsWith("data:")) {
      imageData = image
    } else {
      const res = await fetch(image)
      if (!res.ok) {
        console.error(`❌ Could not fetch image URL – ${res.statusText}`)
        return NextResponse.json(
          { error: `Could not fetch image URL – ${res.statusText}`, step: step.current },
          { status: 400 },
        )
      }
      const buffer = Buffer.from(await res.arrayBuffer())
      const contentType = res.headers.get("content-type")
      const ext = guessExt(contentType)
      console.log(`📊 Fetched image type: ${contentType}, format: ${ext}`)
      imageData = `data:image/${ext};base64,${buffer.toString("base64")}`
    }

    /* ---------- Create prediction ---------- */
    step.current = "prediction-create"
    const prediction = await replicate.predictions.create({
      version: modelVersion,
      input: {
        image: imageData,
        scale: upscale,
        enhance,
      },
    })

    console.log("✅ Prediction creation response received")
    console.log(`📊 Prediction object keys: ${Object.keys(prediction || {}).join(", ")}`)

    /* ---------- Poll prediction until finished ---------- */
    step.current = "prediction-poll"
    const final = await poll(prediction.id)
    if (final.status !== "succeeded") {
      console.error("❌ Prediction failed with status:", final.status)
      console.error("❌ Prediction error:", final.error)
      console.error("❌ Prediction logs:", final.logs)
      return NextResponse.json({ error: "Prediction failed", detail: final, step: step.current }, { status: 500 })
    }

    console.log(`🎉 Enhancement successful!`)
    console.log(`📥 Output URL: ${final.output}`)

    /* ---------- Done ---------- */
    const totalTime = Date.now() - startTime
    console.log(`⏱️ Total processing time: ${Math.round(totalTime / 1000)}s`)
    console.log(`🏁 Final status: ${final.status}`)

    return NextResponse.json({ output: final.output }, { status: 200 })
  } catch (err: any) {
    const totalTime = Date.now() - startTime
    console.error("[enhance-replicate]", step.current, err)
    console.error("❌ Unexpected enhancement error:", err)
    console.error("❌ Error stack:", err.stack)

    return NextResponse.json({ error: err?.message ?? "Unknown error", step: step.current }, { status: 500 })
  }
}

function guessExt(contentType: string | null) {
  return contentType?.includes("png") ? "png" : contentType?.includes("webp") ? "webp" : "jpeg"
}

async function poll(id: string, timeoutMs = 1000 * 60 * 10) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const p = await replicate.predictions.get(id)
    if (["succeeded", "failed", "canceled"].includes(p.status)) return p
    await new Promise((r) => setTimeout(r, 2000))
  }
  throw new Error("Prediction timed out")
}
