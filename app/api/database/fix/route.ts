import { NextResponse } from "next/server"
import { checkDatabaseHealth, autoFixDatabaseIssues } from "@/lib/database-manager"

export async function POST(request: Request) {
  try {
    // Get issues to fix from request body or run a health check
    let issues

    try {
      const body = await request.json()
      issues = body.issues
    } catch {
      // If no issues provided, run a health check
      const healthResult = await checkDatabaseHealth()
      issues = healthResult.issues
    }

    if (!issues || !Array.isArray(issues) || issues.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No issues to fix",
        timestamp: new Date().toISOString(),
      })
    }

    // Filter for auto-fixable issues
    const fixableIssues = issues.filter((issue) => issue.autoFixable)

    if (fixableIssues.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No auto-fixable issues found",
        timestamp: new Date().toISOString(),
      })
    }

    // Run auto-fix
    const fixResult = await autoFixDatabaseIssues(fixableIssues)

    // Run another health check to verify fixes
    const updatedHealth = await checkDatabaseHealth()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      fixResult,
      currentHealth: updatedHealth,
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
