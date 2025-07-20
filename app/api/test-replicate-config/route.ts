/**
 * Five-step Replicate configuration self-test.
 * 1)  Environment variable present
 * 2)  Able to instantiate client
 * 3)  Able to fetch a known model
 * 4)  Able to create a tiny prediction
 * 5)  Able to poll prediction → “succeeded”
 */
import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

type Step = { step: string; success: boolean; message?: string }

export async function GET(_req: NextRequest) {
  const steps: Step[] = []
  try {
    /* ---------- 1. ENV ---------- */
    const token = process.env.REPLICATE_API_TOKEN
    if (!token) {
      steps.push({ step: "env", success: false, message: "REPLICATE_API_TOKEN not set" })
      return NextResponse.json({ success: false, steps }, { status: 500 })
    }
    steps.push({ step: "env", success: true })

    /* ---------- 2. CLIENT ---------- */
    const replicate = new Replicate({ auth: token })
    steps.push({ step: "client", success: true })

    /* ---------- 3. MODEL FETCH ---------- */
    const model = await replicate.models.get("nightmareai", "real-esrgan")
    steps.push({ step: "model", success: true, message: `latest_version=${model.latest_version?.id}` })

    /* ---------- 4. PREDICTION CREATE ---------- */
    const tinyPixel =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="
    const prediction = await replicate.predictions.create({
      version: model.latest_version?.id ?? "",
      input: { image: tinyPixel, scale: 2 },
    })
    steps.push({ step: "prediction-create", success: true, message: prediction.id })

    /* ---------- 5. POLL UNTIL DONE ---------- */
    const final = await pollPrediction(replicate, prediction.id)
    const ok = final.status === "succeeded"
    steps.push({ step: "prediction-final", success: ok, message: `status=${final.status}` })

    return NextResponse.json({ success: ok, steps }, { status: ok ? 200 : 500 })
  } catch (err: any) {
    steps.push({ step: "catch", success: false, message: err?.message })
    return NextResponse.json({ success: false, steps }, { status: 500 })
  }
}

async function pollPrediction(replicate: Replicate, id: string, timeoutMs = 1000 * 60 * 2) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const p = await replicate.predictions.get(id)
    if (["succeeded", "failed", "canceled"].includes(p.status)) return p
    await new Promise((r) => setTimeout(r, 1500))
  }
  throw new Error("Prediction timed out")
}
