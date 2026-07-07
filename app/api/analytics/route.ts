import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const AnalyticsEventSchema = z.object({
  userId: z.string(),
  eventName: z.string(),
  properties: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = AnalyticsEventSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid analytics event',
            details: validation.error.flatten(),
          },
        },
        { status: 400 }
      )
    }

    const event = validation.data
    const timestamp = event.timestamp ? new Date(event.timestamp) : new Date()

    // Log event
    console.log('[ANALYTICS]', {
      userId: event.userId,
      event: event.eventName,
      properties: event.properties,
      timestamp: timestamp.toISOString(),
    })

    // Store event in database
    // Example: await db.analyticsEvents.create({
    //   userId: event.userId,
    //   eventName: event.eventName,
    //   properties: event.properties,
    //   timestamp,
    // })

    // Send to external analytics service
    if (process.env.MIXPANEL_TOKEN) {
      // Example: Send to Mixpanel
      const data = {
        event: event.eventName,
        properties: {
          distinct_id: event.userId,
          time: Math.floor(timestamp.getTime() / 1000),
          ...event.properties,
        },
      }

      const encodedData = Buffer.from(JSON.stringify(data)).toString('base64')

      await fetch(`https://api.mixpanel.com/track?data=${encodedData}`, {
        method: 'GET',
      }).catch(err => console.error('Failed to send Mixpanel event:', err))
    }

    return NextResponse.json({
      success: true,
      message: 'Event recorded',
    })
  } catch (error) {
    console.error('Failed to record analytics event:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to record analytics event',
        },
      },
      { status: 500 }
    )
  }
}
