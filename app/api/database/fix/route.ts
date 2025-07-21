import { NextResponse } from "next/server"
import { autoFixDatabaseIssues, checkDatabaseHealth } from "@/lib/database-manager"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { issues } = body

    if (!issues || !Array.isArray(issues)) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing or invalid issues array",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    const fixResult = await autoFixDatabaseIssues(issues)
    const currentHealth = await checkDatabaseHealth()

    return NextResponse.json({
      success: true,
      fixResult,
      currentHealth,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database auto-fix failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Database auto-fix failed",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
