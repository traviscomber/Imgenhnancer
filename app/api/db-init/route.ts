import { NextResponse } from "next/server"
import { initializeDatabase, checkDatabaseConnection, checkTablesExist } from "@/lib/database"

export async function GET() {
  try {
    console.log("🔄 Database initialization check...")

    // Check basic connection
    const connected = await checkDatabaseConnection()
    if (!connected) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: "Could not connect to Supabase database. Please check your connection configuration.",
          troubleshooting: [
            "Verify SUPABASE_URL environment variable is set correctly",
            "Check if SUPABASE_SERVICE_ROLE_KEY is valid and has proper permissions",
            "Ensure your Supabase project is active and accessible",
            "Confirm database credentials are correct",
          ],
        },
        { status: 500 },
      )
    }

    // Check if tables exist
    const tablesExist = await checkTablesExist()

    return NextResponse.json({
      success: true,
      connected: true,
      tablesExist: tablesExist,
      message: tablesExist ? "Database is properly initialized" : "Database connected but tables need to be created",
      instructions: tablesExist
        ? null
        : [
            "Run the following SQL scripts in Supabase SQL Editor in order:",
            "1. scripts/01-create-database-schema.sql",
            "2. scripts/02-add-analytics-tables.sql",
            "3. scripts/03-add-missing-columns.sql",
            "4. scripts/04-create-views.sql",
            "5. scripts/05-seed-demo-data.sql",
          ],
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasPostgresUrl: !!process.env.POSTGRES_URL,
      },
    })
  } catch (error: any) {
    console.error("❌ Database initialization error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Database initialization failed",
        details: error.message,
        troubleshooting: [
          "Check if SUPABASE_URL environment variable is set",
          "Verify SUPABASE_SERVICE_ROLE_KEY has proper permissions",
          "Ensure Supabase project is active and accessible",
          "Check if SSL settings are correct for your environment",
          "Try connecting to Supabase directly through their dashboard",
        ],
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasSupabaseUrl: !!process.env.SUPABASE_URL,
          hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          hasPostgresUrl: !!process.env.POSTGRES_URL,
        },
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    const initialized = await initializeDatabase()

    if (initialized) {
      return NextResponse.json({
        success: true,
        message: "Database initialized successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Database initialization failed",
          message: "Please run the SQL scripts manually in Supabase SQL Editor",
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("❌ Database initialization error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Database initialization failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
