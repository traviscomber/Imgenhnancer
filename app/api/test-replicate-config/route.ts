import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

/**
 * GET /api/test-replicate-config
 *
 * Comprehensive 5-step validation of Replicate API configuration
 */
export async function GET(req: NextRequest) {
  console.log("🧪 Starting Replicate configuration test...")

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
      failed: 0,
      replicateConfigured: false,
      recommendation: "",
    },
  }

  try {
    // Test 1: Check if API key exists
    console.log("🔍 Test 1: Checking API key presence...")
    if (!process.env.REPLICATE_API_TOKEN) {
      results.tests.push({
        test: "1. API Key Presence",
        status: "failed",
        result: "REPLICATE_API_TOKEN environment variable not found",
        error: "Missing environment variable",
      })
      results.summary.failed++
    } else {
      results.configuration.hasApiKey = true
      results.configuration.keyPrefix = `${process.env.REPLICATE_API_TOKEN.substring(0, 12)}...${process.env.REPLICATE_API_TOKEN.slice(-8)}`
      results.tests.push({
        test: "1. API Key Presence",
        status: "success",
        result: `Found API key: ${results.configuration.keyPrefix}`,
      })
      results.summary.successful++
      console.log("✅ API key found")
    }

    // Test 2: Initialize Replicate client
    console.log("🔍 Test 2: Initializing Replicate client...")
    let replicate
    try {
      replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })
      results.tests.push({
        test: "2. Client Initialization",
        status: "success",
        result: "Replicate client initialized successfully",
      })
      results.summary.successful++
      console.log("✅ Client initialized")
    } catch (error) {
      results.tests.push({
        test: "2. Client Initialization",
        status: "failed",
        result: "Failed to initialize Replicate client",
        error: error.message,
      })
      results.summary.failed++
      console.log("❌ Client initialization failed:", error.message)
    }

    // Test 3: Test API connectivity
    console.log("🔍 Test 3: Testing API connectivity...")
    if (replicate) {
      try {
        const [owner, name] = "nightmareai/real-esrgan".split("/")
        const model = await replicate.models.get(owner, name)
        results.tests.push({
          test: "3. API Connectivity",
          status: "success",
          result: `Successfully connected to Replicate API and accessed model: ${model.name}`,
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
        results.summary.failed++
        console.log("❌ API connectivity failed:", error.message)
      }
    } else {
      results.tests.push({
        test: "3. API Connectivity",
        status: "failed",
        result: "Cannot test connectivity - client not initialized",
        error: "Client initialization failed",
      })
      results.summary.failed++
    }

    // Test 4: Test primary model access
    console.log("🔍 Test 4: Testing primary model access...")
    if (replicate) {
      try {
        const [owner, name] = "nightmareai/real-esrgan".split("/")
        const model = await replicate.models.get(owner, name)

        if (model && model.latest_version) {
          results.tests.push({
            test: "4. Primary Model Access",
            status: "success",
            result: `Can access nightmareai/real-esrgan model (version: ${model.latest_version.id.substring(0, 8)}...)`,
          })
          results.summary.successful++
          console.log("✅ Primary model accessible")
        } else {
          results.tests.push({
            test: "4. Primary Model Access",
            status: "failed",
            result: "Cannot access nightmareai/real-esrgan model",
            error: "Model or version not found",
          })
          results.summary.failed++
          console.log("❌ Primary model not accessible")
        }
      } catch (error) {
        results.tests.push({
          test: "4. Primary Model Access",
          status: "failed",
          result: "Cannot access nightmareai/real-esrgan model",
          error: error.message,
        })
        results.summary.failed++
        console.log("❌ Primary model access failed:", error.message)
      }
    } else {
      results.tests.push({
        test: "4. Primary Model Access",
        status: "failed",
        result: "Cannot test model access - client not initialized",
        error: "Client initialization failed",
      })
      results.summary.failed++
    }

    // Test 5: Test prediction creation
    console.log("🔍 Test 5: Testing prediction creation...")
    if (replicate) {
      try {
        // Use a tiny 1x1 pixel image for testing
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
            test: "5. Prediction Creation",
            status: "success",
            result: `Successfully created test prediction: ${prediction.id}`,
          })
          results.summary.successful++
          console.log("✅ Test prediction created:", prediction.id)
        } else {
          results.tests.push({
            test: "5. Prediction Creation",
            status: "failed",
            result: "Failed to create prediction - no prediction ID returned",
            error: "Prediction creation failed",
          })
          results.summary.failed++
          console.log("❌ Test prediction creation failed")
        }
      } catch (error) {
        results.tests.push({
          test: "5. Prediction Creation",
          status: "failed",
          result: "Failed to create test prediction",
          error: error.message,
        })
        results.summary.failed++
        console.log("❌ Prediction creation failed:", error.message)
      }
    } else {
      results.tests.push({
        test: "5. Prediction Creation",
        status: "failed",
        result: "Cannot test prediction creation - client not initialized",
        error: "Client initialization failed",
      })
      results.summary.failed++
    }

    // Generate summary and recommendation
    results.summary.replicateConfigured = results.summary.successful >= 4

    if (results.summary.successful === 5) {
      results.summary.recommendation = "Replicate is fully configured and ready to use"
    } else if (results.summary.successful >= 3) {
      results.summary.recommendation = "Replicate is mostly configured but has some issues"
    } else {
      results.summary.recommendation = "Replicate configuration needs attention"
    }

    console.log(
      `🧪 Configuration test completed: ${results.summary.successful}/${results.summary.totalTests} tests passed`,
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error("❌ Configuration test failed:", error)
    return NextResponse.json(
      {
        ...results,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
