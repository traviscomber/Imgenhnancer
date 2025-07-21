import { NextResponse } from "next/server"
import { Database } from "@/lib/database"

export async function GET() {
  try {
    // Test database connection
    const connectionTest = await Database.testConnection()

    if (!connectionTest.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed",
          error: connectionTest.message,
        },
        { status: 500 },
      )
    }

    // Check if core tables exist
    const tables = ["users", "ai_models", "processing_jobs", "user_roles", "user_sessions"]
    const tableStatus = {}

    for (const table of tables) {
      const result = await Database.checkTableExists(table)
      tableStatus[table] = result.exists
    }

    // Check environment variables
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      REPLICATE_API_TOKEN: !!process.env.REPLICATE_API_TOKEN,
      FAL_API_KEY: !!process.env.FAL_API_KEY,
    }

    // Get basic stats if tables exist
    let stats = null
    if (tableStatus["users"] && tableStatus["processing_jobs"]) {
      try {
        const [userCount, jobCount, modelCount] = await Promise.all([
          Database.supabase.from("users").select("count").single(),
          Database.supabase.from("processing_jobs").select("count").single(),
          Database.supabase.from("ai_models").select("count").single(),
        ])

        stats = {
          users: userCount.data?.count || 0,
          jobs: jobCount.data?.count || 0,
          models: modelCount.data?.count || 0,
        }
      } catch (error) {
        console.error("Error getting stats:", error)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      connection: connectionTest,
      tables: tableStatus,
      environment: envVars,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database initialization error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Database initialization failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    // This endpoint could be used to run database migrations or setup
    return NextResponse.json({
      success: true,
      message: "Database setup endpoint - not implemented yet",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Database setup failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
