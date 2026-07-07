'use server'

/**
 * Monitoring & Observability Utilities
 * Provides error tracking, performance metrics, and user analytics
 */

import { headers } from 'next/headers'

// ============================================================================
// Logger Implementation
// ============================================================================

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical',
}

interface LogEntry {
  timestamp: Date
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  userId?: string
  requestId?: string
  userAgent?: string
  ip?: string
}

class Logger {
  private buffer: LogEntry[] = []
  private readonly MAX_BUFFER_SIZE = 100

  async log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      userId: context?.userId as string | undefined,
      requestId: context?.requestId as string | undefined,
      userAgent: context?.userAgent as string | undefined,
      ip: context?.ip as string | undefined,
    }

    // Add to buffer
    this.buffer.push(entry)

    // Flush if buffer is full
    if (this.buffer.length >= this.MAX_BUFFER_SIZE) {
      await this.flush()
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${level.toUpperCase()}]`, message, context)
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return

    const entriesToLog = [...this.buffer]
    this.buffer = []

    // Send to external logging service (e.g., Datadog, LogRocket)
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entriesToLog),
      })
    } catch (error) {
      console.error('Failed to flush logs:', error)
    }
  }
}

export const logger = new Logger()

// ============================================================================
// Error Tracking
// ============================================================================

interface ErrorMetadata {
  userId?: string
  requestId?: string
  url?: string
  userAgent?: string
  statusCode?: number
  timestamp?: Date
}

export async function captureError(
  error: unknown,
  metadata?: ErrorMetadata
): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined

  await logger.log(LogLevel.ERROR, errorMessage, {
    ...metadata,
    stack: errorStack,
  })

  // Send to error tracking service (e.g., Sentry)
  try {
    await fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: errorMessage,
        stack: errorStack,
        metadata,
        timestamp: new Date(),
      }),
    })
  } catch (err) {
    console.error('Failed to capture error:', err)
  }
}

// ============================================================================
// Performance Metrics
// ============================================================================

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: Date
  context?: Record<string, unknown>
}

export async function recordMetric(
  name: string,
  value: number,
  unit: string = 'ms',
  context?: Record<string, unknown>
): Promise<void> {
  const metric: PerformanceMetric = {
    name,
    value,
    unit,
    timestamp: new Date(),
    context,
  }

  // Send to metrics service (e.g., DataDog, New Relic)
  try {
    await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
    })
  } catch (error) {
    console.error('Failed to record metric:', error)
  }
}

// ============================================================================
// API Performance Tracking
// ============================================================================

export async function trackAPIRequest(
  method: string,
  path: string,
  duration: number,
  statusCode: number,
  context?: Record<string, unknown>
): Promise<void> {
  const metricName = `api.${method.toLowerCase()}.${path.replace(/\//g, '.')}`

  await recordMetric(metricName, duration, 'ms', {
    statusCode,
    ...context,
  })

  // Track slow requests
  if (duration > 1000) {
    await logger.log(LogLevel.WARN, `Slow API request: ${method} ${path}`, {
      duration,
      statusCode,
      ...context,
    })
  }
}

// ============================================================================
// Image Processing Analytics
// ============================================================================

export interface ImageProcessingEvent {
  userId: string
  preset: string
  imageFormat: string
  processingTime: number
  success: boolean
  error?: string
}

export async function trackImageProcessing(
  event: ImageProcessingEvent
): Promise<void> {
  await recordMetric(
    `image.processing.${event.preset}`,
    event.processingTime,
    'ms',
    {
      userId: event.userId,
      format: event.imageFormat,
      success: event.success,
      error: event.error,
    }
  )

  if (!event.success) {
    await logger.log(
      LogLevel.WARN,
      `Image processing failed: ${event.preset}`,
      event
    )
  }
}

// ============================================================================
// User Analytics
// ============================================================================

export interface UserEvent {
  userId: string
  eventName: string
  properties?: Record<string, unknown>
  timestamp?: Date
}

export async function trackUserEvent(event: UserEvent): Promise<void> {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        timestamp: event.timestamp || new Date(),
      }),
    })
  } catch (error) {
    console.error('Failed to track user event:', error)
  }
}

// ============================================================================
// Request Context
// ============================================================================

export async function getRequestContext(): Promise<{
  requestId: string
  userAgent: string
  ip: string
}> {
  const headersList = await headers()

  const requestId =
    headersList.get('x-request-id') || `req-${Date.now()}-${Math.random()}`
  const userAgent = headersList.get('user-agent') || 'unknown'
  const ip = headersList.get('x-forwarded-for') || '0.0.0.0'

  return { requestId, userAgent, ip }
}

// ============================================================================
// Cleanup
// ============================================================================

// Ensure logs are flushed on shutdown
process.on('SIGTERM', async () => {
  await logger.flush()
})

process.on('SIGINT', async () => {
  await logger.flush()
})
