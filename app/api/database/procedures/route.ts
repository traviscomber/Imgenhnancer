import { NextResponse } from "next/server"
import { createDatabaseProcedures } from "@/lib/database-manager"

export async function POST() {
  try {
    const success = await createDatabaseProcedures()

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create database procedures",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Database procedures created successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Creating database procedures failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Creating database procedures failed",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
