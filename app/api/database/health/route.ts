import { NextResponse } from "next/server"
import { checkDatabaseHealth } from "@/lib/database-manager"

export async function GET() {
  try {
    const healthResult = await checkDatabaseHealth()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      health: healthResult,
    })
  } catch (error) {
    console.error("Database health check failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Database health check failed",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
