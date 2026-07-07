import { NextRequest, NextResponse } from 'next/server'

interface LogEntry {
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical'
  message: string
  context?: Record<string, unknown>
  userId?: string
  requestId?: string
  userAgent?: string
  ip?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const entries = Array.isArray(body) ? body : [body]

    // Validate entries
    const validEntries = entries.filter((entry: unknown) => {
      const e = entry as any
      return (
        e.timestamp &&
        e.level &&
        e.message &&
        ['debug', 'info', 'warn', 'error', 'critical'].includes(e.level)
      )
    })

    if (validEntries.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No valid log entries',
          },
        },
        { status: 400 }
      )
    }

    // Log entries
    for (const entry of validEntries) {
      console.log(
        `[${entry.level.toUpperCase()}] ${entry.timestamp}`,
        entry.message,
        entry.context || ''
      )
    }

    // Store logs in database or external service
    // Example: await db.logs.createMany(validEntries)

    // Send to external logging service
    if (process.env.SENTRY_DSN) {
      // Example: Send to Sentry
      const criticalLogs = validEntries.filter(
        (e: LogEntry) => e.level === 'error' || e.level === 'critical'
      )

      for (const log of criticalLogs) {
        await fetch(process.env.SENTRY_DSN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_id: Math.random().toString(16).slice(2),
            message: log.message,
            level: log.level,
            extra: log.context,
            user: {
              id: log.userId,
              ip_address: log.ip,
            },
            tags: {
              userId: log.userId,
              requestId: log.requestId,
            },
            timestamp: new Date(log.timestamp).getTime() / 1000,
          }),
        }).catch(err => console.error('Failed to send Sentry log:', err))
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${validEntries.length} log entries`,
    })
  } catch (error) {
    console.error('Failed to process logs:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to process logs',
        },
      },
      { status: 500 }
    )
  }
}
