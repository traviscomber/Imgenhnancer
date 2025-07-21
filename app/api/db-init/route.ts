import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // Check database connection
    const healthCheck = await Database.healthCheck()

    if (healthCheck.status !== "healthy") {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed",
          details: healthCheck,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    // Check if tables exist by trying to query them
    const tableChecks = []

    try {
      const users = await Database.getUserStats()
      tableChecks.push({ table: "users", status: "exists", count: users?.length || 0 })
    } catch (error) {
      tableChecks.push({
        table: "users",
        status: "missing",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }

    try {
      const models = await Database.getActiveModels()
      tableChecks.push({ table: "ai_models", status: "exists", count: models?.length || 0 })
    } catch (error) {
      tableChecks.push({
        table: "ai_models",
        status: "missing",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }

    try {
      const jobs = await Database.getAllJobs(1)
      tableChecks.push({ table: "processing_jobs", status: "exists", count: jobs?.length || 0 })
    } catch (error) {
      tableChecks.push({
        table: "processing_jobs",
        status: "missing",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }

    try {
      const health = await Database.getSystemHealth()
      tableChecks.push({ table: "system_health (view)", status: "exists", count: health?.length || 0 })
    } catch (error) {
      tableChecks.push({
        table: "system_health (view)",
        status: "missing",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }

    // Check environment variables
    const envCheck = {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      REPLICATE_API_TOKEN: !!process.env.REPLICATE_API_TOKEN,
      FAL_API_KEY: !!process.env.FAL_API_KEY,
    }

    const missingTables = tableChecks.filter((check) => check.status === "missing")
    const allTablesExist = missingTables.length === 0

    return NextResponse.json({
      success: true,
      message: allTablesExist ? "Database is properly initialized" : "Some tables are missing",
      database_connection: healthCheck,
      tables: tableChecks,
      environment_variables: envCheck,
      missing_tables: missingTables,
      recommendations: allTablesExist
        ? []
        : [
            "Run the SQL scripts in Supabase SQL Editor in this order:",
            "1. scripts/01-create-database-schema.sql",
            "2. scripts/02-add-analytics-tables.sql",
            "3. scripts/03-add-missing-columns.sql",
            "4. scripts/04-create-views.sql",
            "5. scripts/05-seed-demo-data.sql",
          ],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database initialization check failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Database initialization check failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        troubleshooting: [
          "Check that your Supabase environment variables are correct",
          "Verify that your Supabase project is active",
          "Ensure the database tables have been created",
          "Check the Supabase logs for any errors",
        ],
      },
      { status: 500 },
    )
  }
}
