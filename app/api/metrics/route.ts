import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const MetricSchema = z.object({
  name: z.string(),
  value: z.number(),
  unit: z.string().default('ms'),
  timestamp: z.string().datetime().optional(),
  context: z.record(z.unknown()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = MetricSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid metric format',
            details: validation.error.flatten(),
          },
        },
        { status: 400 }
      )
    }

    const metric = validation.data

    // Log metric for analytics
    console.log('[METRIC]', metric.name, metric.value, metric.unit)

    // Store metric in database or external service
    // Example: await db.metrics.create(metric)

    // Track to external monitoring service
    if (process.env.DATADOG_API_KEY) {
      // Example: Send to Datadog
      await fetch('https://api.datadoghq.com/api/v1/series', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': process.env.DATADOG_API_KEY,
        },
        body: JSON.stringify({
          series: [
            {
              metric: `clar1ty.${metric.name}`,
              points: [[Date.now() / 1000, metric.value]],
              type: 'gauge',
              tags: Object.entries(metric.context || {}).map(
                ([k, v]) => `${k}:${v}`
              ),
            },
          ],
        }),
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Metric recorded',
    })
  } catch (error) {
    console.error('Failed to record metric:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to record metric',
        },
      },
      { status: 500 }
    )
  }
}
