import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

/**
 * GET /api/test-replicate-config
 *
 * Comprehensive 5-step validation of Replicate API configuration
 */
export async function GET(req: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    configuration: {
      hasApiKey: false,
      keyPrefix: null,
    },
    tests: [],
    summary: {
      totalTests: 5,
      successful: 0,
      replicateConfigured: false,
      recommendation: "",
    },
  }

  try {
    console.log("🧪 Starting Replicate API configuration test...")

    // Step 1: Check API Key Configuration
    console.log("🔑 Step 1: Checking API key configuration...")
    const hasApiKey = !!process.env.REPLICATE_API_TOKEN
    results.configuration.hasApiKey = hasApiKey

    if (hasApiKey) {
      const key = process.env.REPLICATE_API_TOKEN
      results.configuration.keyPrefix = `${key.substring(0, 12)}...${key.substring(key.length - 8)}`
      results.tests.push({
        test: "1. API Key Configuration",
        status: "success",
        result: `Token configured: ${results.configuration.keyPrefix}`,
      })
      results.summary.successful++
      console.log("✅ API key is configured")
    } else {
      results.tests.push({
        test: "1. API Key Configuration",
        status: "failed",
        result: "REPLICATE_API_TOKEN environment variable not found",
        error: "Missing API token",
      })
      results.summary.recommendation = "Configure REPLICATE_API_TOKEN environment variable"
      console.log("❌ API key not found")
      return NextResponse.json(results)
    }

    // Step 2: Initialize Replicate Client
    console.log("🔧 Step 2: Initializing Replicate client...")
    let replicate
    try {
      replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })
      results.tests.push({
        test: "2. Replicate Client Initialization",
        status: "success",
        result: "Replicate client initialized successfully",
      })
      results.summary.successful++
      console.log("✅ Replicate client initialized")
    } catch (error) {
      results.tests.push({
        test: "2. Replicate Client Initialization",
        status: "failed",
        result: "Failed to initialize Replicate client",
        error: error.message,
      })
      console.log("❌ Failed to initialize Replicate client:", error.message)
      return NextResponse.json(results)
    }

    // Step 3: Test API Connectivity
    console.log("🌐 Step 3: Testing API connectivity...")
    try {
      // Try to get account info (this validates the token)
      const account = await replicate.accounts.current()
      results.tests.push({
        test: "3. API Connectivity",
        status: "success",
        result: `Connected as: ${account.username || account.name || "Unknown"}`,
      })
      results.summary.successful++
      console.log("✅ API connectivity confirmed")
    } catch (error) {
      results.tests.push({
        test: "3. API Connectivity",
        status: "failed",
        result: "Failed to connect to Replicate API",
        error: error.message,
      })
      console.log("❌ API connectivity failed:", error.message)
    }

    // Step 4: Test Primary Model Access
    console.log("🤖 Step 4: Testing primary model access...")
    try {
      // Use the correct method to get model info
      const model = await replicate.models.get("nightmareai", "real-esrgan")
      results.tests.push({
        test: "4. Primary Model Access",
        status: "success",
        result: `Can access nightmareai/real-esrgan model: ${model.name}`,
      })
      results.summary.successful++
      console.log("✅ Primary model access confirmed")
    } catch (error) {
      results.tests.push({
        test: "4. Primary Model Access",
        status: "failed",
        result: "Cannot access nightmareai/real-esrgan model",
        error: error.message,
      })
      console.log("❌ Primary model access failed:", error.message)
    }

    // Step 5: Test Prediction Creation
    console.log("🔮 Step 5: Testing prediction creation...")
    try {
      // Create a tiny test image (1x1 pixel base64)
      const tinyImage =
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"

      const prediction = await replicate.predictions.create({
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        input: {
          image: tinyImage,
          scale: 2,
        },
      })

      if (prediction && prediction.id) {
        results.tests.push({
          test: "5. Test Prediction Creation",
          status: "success",
          result: `Created prediction: ${prediction.id} (${prediction.status})`,
        })
        results.summary.successful++
        console.log("✅ Test prediction created successfully")
      } else {
        results.tests.push({
          test: "5. Test Prediction Creation",
          status: "failed",
          result: "Prediction creation returned invalid response",
          error: "No prediction ID returned",
        })
        console.log("❌ Test prediction failed - no ID returned")
      }
    } catch (error) {
      results.tests.push({
        test: "5. Test Prediction Creation",
        status: "failed",
        result: "Failed to create test prediction",
        error: error.message,
      })
      console.log("❌ Test prediction creation failed:", error.message)
    }

    // Final Summary
    results.summary.replicateConfigured = results.summary.successful >= 4 // Need at least 4/5 tests to pass
    results.summary.recommendation = results.summary.replicateConfigured
      ? "All critical tests passed! Replicate is configured and ready for image enhancement."
      : `${results.summary.successful}/${results.summary.totalTests} tests passed. Check failed tests above for issues.`

    console.log(`🧪 Configuration test completed: ${results.summary.successful}/${results.summary.totalTests} passed`)
    console.log(`🎯 Replicate configured: ${results.summary.replicateConfigured}`)

    return NextResponse.json(results)
  } catch (error) {
    console.error("❌ Configuration test failed with unexpected error:", error)
    return NextResponse.json(
      {
        ...results,
        error: `Configuration test failed: ${error.message}`,
        summary: {
          ...results.summary,
          recommendation: "Unexpected error during configuration test - check server logs",
        },
      },
      { status: 500 },
    )
  }
}
