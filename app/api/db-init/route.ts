import { NextResponse } from "next/server"
import { db, supabase } from "@/lib/database"

export async function GET() {
  try {
    console.log("🔍 Checking database connection...")

    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .limit(1)

    if (connectionError) {
      console.error("❌ Database connection failed:", connectionError)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: connectionError.message,
        },
        { status: 500 },
      )
    }

    console.log("✅ Database connection successful")

    // Check if core tables exist
    const coreTableChecks = await Promise.all([
      db.checkTableExists("users"),
      db.checkTableExists("ai_models"),
      db.checkTableExists("processing_jobs"),
      db.checkTableExists("user_sessions"),
      db.checkTableExists("system_logs"),
      db.checkTableExists("usage_analytics"),
    ])

    const tableStatus = {
      users: coreTableChecks[0],
      ai_models: coreTableChecks[1],
      processing_jobs: coreTableChecks[2],
      user_sessions: coreTableChecks[3],
      system_logs: coreTableChecks[4],
      usage_analytics: coreTableChecks[5],
    }

    console.log("📊 Table status:", tableStatus)

    // Get table counts if tables exist
    const tableCounts: any = {}
    for (const [tableName, exists] of Object.entries(tableStatus)) {
      if (exists) {
        try {
          tableCounts[tableName] = await db.getTableCount(tableName)
        } catch (error) {
          console.warn(`⚠️ Could not get count for ${tableName}:`, error)
          tableCounts[tableName] = "unknown"
        }
      } else {
        tableCounts[tableName] = 0
      }
    }

    console.log("📈 Table counts:", tableCounts)

    // Check if views exist
    const { data: viewsData, error: viewsError } = await supabase
      .from("information_schema.views")
      .select("table_name")
      .eq("table_schema", "public")
      .in("table_name", ["user_stats", "model_performance", "daily_usage_stats", "system_health"])

    const viewsExist = viewsData?.map((v) => v.table_name) || []
    console.log("👁️ Views found:", viewsExist)

    // Environment check
    const envCheck = {
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }

    console.log("🔐 Environment variables:", envCheck)

    const allTablesExist = Object.values(tableStatus).every((exists) => exists)
    const hasData = Object.values(tableCounts).some((count) => typeof count === "number" && count > 0)

    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        tables: tableStatus,
        tableCounts,
        views: viewsExist,
        allTablesExist,
        hasData,
      },
      environment: envCheck,
      recommendations: allTablesExist
        ? hasData
          ? ["Database is ready to use!"]
          : ["Run the seed data script to populate demo data"]
        : [
            "Run the SQL scripts in order: 01-create-database-schema.sql, 02-add-analytics-tables.sql, 03-add-missing-columns.sql, 04-create-views.sql, 05-seed-demo-data.sql",
          ],
    })
  } catch (error: any) {
    console.error("💥 Database initialization check failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Database check failed",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
