import { NextResponse } from "next/server"
import { checkDatabaseHealth } from "@/lib/database-manager"

export async function GET() {
  try {
    const health = await checkDatabaseHealth()

    return NextResponse.json({
      success: true,
      health,
      timestamp: new Date().toISOString(),
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
