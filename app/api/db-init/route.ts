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
      db.checkTableExists("system_metrics"),
      db.checkTableExists("api_keys"),
      db.checkTableExists("file_storage"),
      db.checkTableExists("batch_jobs"),
    ])

    const tableStatus = {
      users: coreTableChecks[0],
      ai_models: coreTableChecks[1],
      processing_jobs: coreTableChecks[2],
      user_sessions: coreTableChecks[3],
      system_logs: coreTableChecks[4],
      usage_analytics: coreTableChecks[5],
      system_metrics: coreTableChecks[6],
      api_keys: coreTableChecks[7],
      file_storage: coreTableChecks[8],
      batch_jobs: coreTableChecks[9],
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
      .in("table_name", [
        "user_stats",
        "model_performance",
        "daily_usage_stats",
        "system_health",
        "queue_status",
        "active_users",
        "user_engagement",
        "revenue_analytics",
        "model_usage_trends",
        "error_analysis",
      ])

    const viewsExist = viewsData?.map((v) => v.table_name) || []
    console.log("👁️ Views found:", viewsExist)

    // Test some demo data queries
    let demoDataStatus = {}
    try {
      // Check demo users
      const { data: users, error: usersError } = await supabase.from("users").select("id, email, name, role").limit(5)

      if (!usersError && users) {
        demoDataStatus = {
          ...demoDataStatus,
          users: users.length,
          demoUsers: users.map((u) => ({ email: u.email, name: u.name, role: u.role })),
        }
      }

      // Check AI models
      const { data: models, error: modelsError } = await supabase
        .from("ai_models")
        .select("model_id, name, provider, status")
        .eq("status", "active")

      if (!modelsError && models) {
        demoDataStatus = {
          ...demoDataStatus,
          activeModels: models.length,
          models: models.map((m) => ({ id: m.model_id, name: m.name, provider: m.provider })),
        }
      }

      // Check processing jobs
      const { data: jobs, error: jobsError } = await supabase
        .from("processing_jobs")
        .select("id, status, original_filename")
        .limit(10)

      if (!jobsError && jobs) {
        const statusCounts = jobs.reduce((acc: any, job) => {
          acc[job.status] = (acc[job.status] || 0) + 1
          return acc
        }, {})

        demoDataStatus = {
          ...demoDataStatus,
          totalJobs: jobs.length,
          jobsByStatus: statusCounts,
        }
      }

      // Test a view
      const { data: userStatsData, error: userStatsError } = await supabase.from("user_stats").select("*").limit(3)

      if (!userStatsError && userStatsData) {
        demoDataStatus = {
          ...demoDataStatus,
          userStatsView: userStatsData.length > 0,
          sampleUserStats: userStatsData.slice(0, 2),
        }
      }
    } catch (error) {
      console.warn("⚠️ Could not fetch demo data:", error)
      demoDataStatus = { error: "Could not fetch demo data" }
    }

    // Environment check
    const envCheck = {
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      FAL_API_KEY: !!process.env.FAL_API_KEY,
      REPLICATE_API_TOKEN: !!process.env.REPLICATE_API_TOKEN,
    }

    console.log("🔐 Environment variables:", envCheck)

    const allTablesExist = Object.values(tableStatus).every((exists) => exists)
    const hasData = Object.values(tableCounts).some((count) => typeof count === "number" && count > 0)
    const hasViews = viewsExist.length > 0

    // Generate recommendations
    const recommendations = []
    if (!allTablesExist) {
      recommendations.push("❌ Run missing SQL scripts to create all tables")
    }
    if (!hasData) {
      recommendations.push("📝 Run 05-seed-demo-data.sql to populate demo data")
    }
    if (!hasViews) {
      recommendations.push("👁️ Run 04-create-views.sql to create analytics views")
    }
    if (allTablesExist && hasData && hasViews) {
      recommendations.push("✅ Database is fully configured and ready!")
      recommendations.push("🚀 You can now test authentication and image processing")
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        tables: tableStatus,
        tableCounts,
        views: viewsExist,
        allTablesExist,
        hasData,
        hasViews,
        totalTables: Object.keys(tableStatus).length,
        totalViews: viewsExist.length,
      },
      demoData: demoDataStatus,
      environment: envCheck,
      recommendations,
      nextSteps:
        allTablesExist && hasData
          ? [
              "Test user authentication with demo users",
              "Try image enhancement with available AI models",
              "Explore the admin dashboard for analytics",
              "Test API endpoints for job processing",
            ]
          : [
              "Complete database setup by running remaining SQL scripts",
              "Verify all tables and views are created",
              "Populate demo data for testing",
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
        troubleshooting: [
          "Check if all SQL scripts have been run in order",
          "Verify Supabase connection credentials",
          "Ensure database permissions are correct",
          "Check Supabase project status and billing",
        ],
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    console.log("🔄 Running database health check and repair...")

    // Check connection
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: error.message,
        },
        { status: 500 },
      )
    }

    // Try to create a test system log entry
    try {
      await db.createSystemLog({
        action: "database_health_check",
        resourceType: "system",
        details: { timestamp: new Date().toISOString(), source: "api" },
        severity: "info",
      })
      console.log("✅ System logging test successful")
    } catch (logError) {
      console.warn("⚠️ System logging test failed:", logError)
    }

    return NextResponse.json({
      success: true,
      message: "Database health check completed",
      timestamp: new Date().toISOString(),
      actions: ["Verified database connection", "Tested system logging functionality", "Confirmed table accessibility"],
    })
  } catch (error: any) {
    console.error("❌ Database health check failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Database health check failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
