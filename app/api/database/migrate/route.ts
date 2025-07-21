import { NextResponse } from "next/server"
import { runMigration } from "@/lib/database-manager"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { version } = body

    if (!version) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing version parameter",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    const success = await runMigration(version)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: `Migration ${version} failed`,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `Migration ${version} applied successfully`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database migration failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Database migration failed",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
