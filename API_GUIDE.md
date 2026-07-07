# API Architecture & Best Practices

## Overview
This document describes the API structure, patterns, and conventions for clar1ty.art's backend services.

## API Structure

### Directory Organization
```
app/
├── api/
│   ├── auth/
│   │   ├── login/
│   │   │   └── route.ts
│   │   ├── signup/
│   │   │   └── route.ts
│   │   └── logout/
│   │       └── route.ts
│   ├── images/
│   │   ├── enhance/
│   │   │   └── route.ts
│   │   └── upload/
│   │       └── route.ts
│   ├── user/
│   │   ├── profile/
│   │   │   └── route.ts
│   │   └── credits/
│   │       └── route.ts
│   └── middleware.ts
├── page.tsx
└── layout.tsx
```

## API Response Standards

All endpoints should return a consistent response format:

```typescript
interface SuccessResponse<T> {
  success: true
  data: T
  message?: string
}

interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

type APIResponse<T> = SuccessResponse<T> | ErrorResponse
```

## Authentication

### Auth Header
```typescript
// All protected endpoints require Authorization header
Authorization: Bearer <session_token>
```

### Validation Example
```typescript
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await getSession(request)
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )
  }
  
  // Process authenticated request
}
```

## Input Validation

Use Zod for schema validation:

```typescript
import { z } from 'zod'

const EnhanceImageSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
  preset: z.enum(['default', 'portrait', 'landscape']),
  intensity: z.number().min(0).max(100),
})

type EnhanceImageRequest = z.infer<typeof EnhanceImageSchema>

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const validation = EnhanceImageSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'VALIDATION_ERROR', 
          message: 'Invalid request body',
          details: validation.error.flatten()
        } 
      },
      { status: 400 }
    )
  }
  
  const data = validation.data
  // Process validated data
}
```

## Error Handling

### Standard Error Codes
```typescript
enum APIErrorCode {
  // 4xx Errors
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  ValidationError = 'VALIDATION_ERROR',
  RateLimitExceeded = 'RATE_LIMIT_EXCEEDED',
  
  // 5xx Errors
  InternalError = 'INTERNAL_ERROR',
  DatabaseError = 'DATABASE_ERROR',
  ExternalServiceError = 'EXTERNAL_SERVICE_ERROR',
}
```

### Error Response Example
```typescript
function createErrorResponse(
  code: APIErrorCode,
  message: string,
  status: number,
  details?: Record<string, unknown>
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  )
}

// Usage
return createErrorResponse(
  APIErrorCode.ValidationError,
  'Invalid image format',
  400,
  { supportedFormats: ['jpg', 'png', 'webp'] }
)
```

## Rate Limiting

Implement rate limiting for API protection:

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requests per hour
})

export async function POST(request: NextRequest) {
  const identifier = request.headers.get('x-forwarded-for') || 'anonymous'
  
  const { success } = await ratelimit.limit(identifier)
  
  if (!success) {
    return createErrorResponse(
      APIErrorCode.RateLimitExceeded,
      'Too many requests',
      429
    )
  }
  
  // Process request
}
```

## Image Enhancement Endpoint

Example: `/api/images/enhance`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { enhanceImageWithReplicate } from '@/lib/ai'
import { getSession } from '@/lib/auth'

const EnhanceRequestSchema = z.object({
  imageUrl: z.string().url(),
  preset: z.enum(['default', 'portrait', 'landscape', 'custom']),
  intensity: z.number().min(0).max(100).default(50),
})

export async function POST(request: NextRequest) {
  // 1. Authentication
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )
  }

  // 2. Validation
  const body = await request.json()
  const validation = EnhanceRequestSchema.safeParse(body)
  
  if (!validation.success) {
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'VALIDATION_ERROR', 
          message: 'Invalid request',
          details: validation.error.flatten()
        } 
      },
      { status: 400 }
    )
  }

  // 3. Check credits
  const user = await db.users.findById(session.userId)
  if (user.credits < 1) {
    return NextResponse.json(
      { 
        success: false, 
        error: { code: 'INSUFFICIENT_CREDITS', message: 'Not enough credits' } 
      },
      { status: 402 }
    )
  }

  // 4. Process
  try {
    const result = await enhanceImageWithReplicate(
      validation.data.imageUrl,
      validation.data.preset,
      validation.data.intensity
    )

    // 5. Deduct credits
    await db.users.update(session.userId, {
      credits: user.credits - 1,
    })

    // 6. Log job
    await db.jobs.create({
      userId: session.userId,
      inputImageUrl: validation.data.imageUrl,
      outputImageUrl: result.url,
      status: 'completed',
      processingTime: result.processingTime,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Enhancement failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'EXTERNAL_SERVICE_ERROR', 
          message: 'Image enhancement failed' 
        } 
      },
      { status: 500 }
    )
  }
}
```

## Performance Optimization

### Caching
```typescript
import { unstable_cache } from 'next/cache'

export const getCachedUser = unstable_cache(
  (userId: string) => db.users.findById(userId),
  ['user'],
  { revalidate: 3600, tags: ['users'] }
)
```

### Streaming Large Responses
```typescript
export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    async start(controller) {
      const items = await fetchItems()
      for (const item of items) {
        controller.enqueue(JSON.stringify(item) + '\n')
      }
      controller.close()
    },
  })

  return new NextResponse(stream, {
    headers: { 'Content-Type': 'application/x-ndjson' },
  })
}
```

## Logging & Monitoring

```typescript
import { log } from '@/lib/logger'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Process request
    const duration = Date.now() - startTime
    
    log.info('API request successful', {
      method: request.method,
      url: request.url,
      duration,
      userId: session?.userId,
    })
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    const duration = Date.now() - startTime
    
    log.error('API request failed', {
      method: request.method,
      url: request.url,
      duration,
      error: error instanceof Error ? error.message : String(error),
      userId: session?.userId,
    })
    
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Server error' } },
      { status: 500 }
    )
  }
}
```

## CORS Configuration

```typescript
// app/api/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers: response.headers })
  }
  
  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

## API Documentation Template

```markdown
# Enhance Image

Enhance an image using AI and the specified preset.

## Request

```
POST /api/images/enhance
Authorization: Bearer <token>
Content-Type: application/json

{
  "imageUrl": "https://example.com/image.jpg",
  "preset": "portrait",
  "intensity": 50
}
```

## Response

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "url": "https://example.com/enhanced-image.jpg",
    "processingTime": 1234
  }
}
```

## Error Responses

- 400 Bad Request - Invalid parameters
- 401 Unauthorized - Missing authentication
- 402 Payment Required - Insufficient credits
- 429 Too Many Requests - Rate limited
- 500 Internal Server Error - Server error
```
