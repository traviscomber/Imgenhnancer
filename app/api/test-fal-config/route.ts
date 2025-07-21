import { NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"

/**
 * Test Fal AI configuration and basic connectivity.
 * Returns a JSON object with individual test results.
 */
export async function GET() {
  try {
    // ----- Basic configuration object -----
    const results: {
      timestamp: string
      configuration: {
        hasApiKey: boolean
        keyLength: number
        keyPrefix: string
        keyFormat: string
        sdkInstalled: boolean
      }
      tests: Array<Record<string, unknown>>
      summary?: {
        totalTests: number
        successful: number
        falConfigured: boolean
        recommendation: string
      }
      error?: string
      solution?: string
    } = {
      timestamp: new Date().toISOString(),
      configuration: {
        hasApiKey: !!process.env.FAL_KEY,
        keyLength: process.env.FAL_KEY ? process.env.FAL_KEY.length : 0,
        keyPrefix: process.env.FAL_KEY ? `${process.env.FAL_KEY.slice(0, 8)}…` : "Not configured",
        keyFormat: process.env.FAL_KEY ? "Looks like a UUID" : "No key",
        sdkInstalled: true,
      },
      tests: [],
    }

    // Short-circuit if no key
    if (!process.env.FAL_KEY) {
      results.error = "FAL_KEY environment variable is not configured"
      results.solution = "Add your Fal AI API key to the project’s environment variables"
      return NextResponse.json(results, { status: 400 })
    }

    // Configure Fal SDK
    fal.config({ credentials: process.env.FAL_KEY })

    /* ------------------------------------------------------------------ */
    /* Test 1 – Text-to-Image generation with a stable, lightweight model */
    /* ------------------------------------------------------------------ */
    try {
      const run1 = await fal.run("fal-ai/flux/schnell", {
        input: {
          prompt: "A red circle on a white background",
          image_size: "square_sd",
          num_images: 1,
          num_inference_steps: 4,
        },
      })

      results.tests.push({
        test: "fal-ai/flux/schnell",
        status: "success",
        imageUrl: run1.images?.[0]?.url ?? null,
      })
    } catch (err: any) {
      results.tests.push({
        test: "fal-ai/flux/schnell",
        status: "failed",
        error: err?.message ?? String(err),
      })
    }

    /* ------------------------------------------------------------------ */
    /* Test 2 – Background-removal on a small in-memory PNG               */
    /* ------------------------------------------------------------------ */
    try {
      // 1×1 transparent PNG – tiny yet valid
      const tinyPngBase64 =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wIAAgEB/wH7KwAAAABJRU5ErkJggg=="

      const run2 = await fal.run("fal-ai/rembg", {
        input: { image_url: `data:image/png;base64,${tinyPngBase64}` },
      })

      results.tests.push({
        test: "fal-ai/rembg",
        status: "success",
        outputUrl: run2.images?.[0]?.url ?? null,
      })
    } catch (err: any) {
      results.tests.push({
        test: "fal-ai/rembg",
        status: "failed",
        error: err?.message ?? String(err),
      })
    }

    /* ------------------- Build a helpful summary object ---------------- */
    const successful = results.tests.filter((t) => t.status === "success").length
    results.summary = {
      totalTests: results.tests.length,
      successful,
      falConfigured: successful === results.tests.length,
      recommendation:
        successful === results.tests.length
          ? "All tests succeeded – Fal AI configuration looks good."
          : "One or more tests failed – please review your Fal AI key or network connectivity.",
    }

    return NextResponse.json(results, { status: successful ? 200 : 206 })
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err?.message ?? "Unknown server error",
        details: String(err),
      },
      { status: 500 },
    )
  }
}
