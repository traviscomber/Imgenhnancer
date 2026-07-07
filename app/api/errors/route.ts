import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ErrorSchema = z.object({
  message: z.string(),
  stack: z.string().optional(),
  metadata: z
    .object({
      userId: z.string().optional(),
      requestId: z.string().optional(),
      url: z.string().optional(),
      userAgent: z.string().optional(),
      statusCode: z.number().optional(),
      timestamp: z.string().optional(),
    })
    .optional(),
  timestamp: z.string().datetime(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = ErrorSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid error format',
          },
        },
        { status: 400 }
      )
    }

    const error = validation.data

    // Log error
    console.error('[ERROR CAPTURE]', {
      message: error.message,
      stack: error.stack,
      metadata: error.metadata,
      timestamp: error.timestamp,
    })

    // Store error in database
    // Example: await db.errors.create({
    //   message: error.message,
    //   stack: error.stack,
    //   userId: error.metadata?.userId,
    //   requestId: error.metadata?.requestId,
    //   url: error.metadata?.url,
    //   userAgent: error.metadata?.userAgent,
    //   statusCode: error.metadata?.statusCode,
    //   timestamp: new Date(error.timestamp),
    // })

    // Send to error tracking service
    if (process.env.SENTRY_DSN) {
      // Example: Send to Sentry
      await fetch(process.env.SENTRY_DSN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: `error-${Date.now()}-${Math.random()}`,
          message: error.message,
          exception: {
            values: [
              {
                type: 'Error',
                value: error.message,
                stacktrace: {
                  frames: parseStackTrace(error.stack),
                },
              },
            ],
          },
          level: 'error',
          user: {
            id: error.metadata?.userId,
            ip_address: error.metadata?.userAgent,
          },
          tags: {
            userId: error.metadata?.userId,
            requestId: error.metadata?.requestId,
          },
          extra: {
            url: error.metadata?.url,
            statusCode: error.metadata?.statusCode,
          },
          timestamp: Math.floor(new Date(error.timestamp).getTime() / 1000),
        }),
      }).catch(err => console.error('Failed to send Sentry error:', err))
    }

    return NextResponse.json({
      success: true,
      message: 'Error captured',
    })
  } catch (error) {
    console.error('Failed to capture error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to capture error',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * Parse stack trace string into Sentry-compatible format
 */
function parseStackTrace(
  stack?: string
): Array<{
  filename: string
  function: string
  lineno: number
  colno: number
}> {
  if (!stack) return []

  const lines = stack.split('\n')
  return lines
    .slice(1) // Skip the first line (error message)
    .filter(line => line.trim())
    .map(line => {
      const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/)
      if (match) {
        return {
          function: match[1],
          filename: match[2],
          lineno: parseInt(match[3], 10),
          colno: parseInt(match[4], 10),
        }
      }
      return {
        function: 'unknown',
        filename: 'unknown',
        lineno: 0,
        colno: 0,
      }
    })
}
