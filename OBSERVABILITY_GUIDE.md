# Observability & Monitoring Guide

## Overview
This document describes the monitoring, logging, and analytics infrastructure for clar1ty.art.

## Architecture

```
Application
    ↓
Monitoring Library (lib/monitoring.ts)
    ↓
┌─────────┬──────────┬────────────┐
↓         ↓          ↓            ↓
Logs    Metrics   Analytics    Errors
(API)    (API)      (API)       (API)
↓         ↓          ↓            ↓
┌─────────┴──────────┴────────────┴──────────┐
↓                                              ↓
Console/Database          External Services
                         (Datadog, Sentry, etc)
```

## Components

### 1. Logger (lib/monitoring.ts)

Centralized logging with buffering and batching:

```typescript
import { logger, LogLevel } from '@/lib/monitoring'

// Basic logging
await logger.log(LogLevel.INFO, 'User logged in', { userId: 123 })

// Different log levels
await logger.log(LogLevel.DEBUG, 'Debug info')
await logger.log(LogLevel.WARN, 'Warning message')
await logger.log(LogLevel.ERROR, 'Error occurred')
await logger.log(LogLevel.CRITICAL, 'Critical issue')

// Flush logs to server
await logger.flush()
```

**Features:**
- Automatic buffering (flushes when full)
- Context preservation
- Graceful shutdown handling
- Development mode console output

### 2. Error Tracking

Capture and report errors with full context:

```typescript
import { captureError } from '@/lib/monitoring'

try {
  // Some operation
} catch (error) {
  await captureError(error, {
    userId: user.id,
    url: window.location.href,
    statusCode: 500,
  })
}
```

**Integration Points:**
- Sentry for error aggregation
- Automatic stack trace parsing
- User context preservation
- Request information

### 3. Performance Metrics

Track application performance:

```typescript
import { recordMetric, trackAPIRequest } from '@/lib/monitoring'

// Record custom metric
const startTime = Date.now()
// ... operation ...
const duration = Date.now() - startTime
await recordMetric('operation.duration', duration, 'ms', {
  operation: 'imageProcessing',
  preset: 'portrait',
})

// Track API request (automatically called in handlers)
await trackAPIRequest('POST', '/api/images/enhance', duration, 200)
```

**Metrics Tracked:**
- API request duration
- Image processing time
- Database query duration
- User action timing
- Resource loading time

### 4. Image Processing Analytics

Specialized tracking for image enhancement events:

```typescript
import { trackImageProcessing } from '@/lib/monitoring'

await trackImageProcessing({
  userId: user.id,
  preset: 'portrait',
  imageFormat: 'jpg',
  processingTime: 1234,
  success: true,
})
```

**Data Points:**
- Processing duration by preset
- Image format distribution
- Success/failure rates
- User engagement per preset

### 5. User Analytics

Track user interactions and events:

```typescript
import { trackUserEvent } from '@/lib/monitoring'

// Track user actions
await trackUserEvent({
  userId: user.id,
  eventName: 'image_enhanced',
  properties: {
    preset: 'portrait',
    imageSize: '2MB',
    processingTime: 1234,
  },
})

// Track feature usage
await trackUserEvent({
  userId: user.id,
  eventName: 'feature_used',
  properties: {
    feature: 'comparison_slider',
    duration: 5000,
  },
})
```

**Common Events:**
- `user_signup`
- `user_login`
- `credits_purchased`
- `image_enhanced`
- `feature_used`
- `error_occurred`

## API Endpoints

### POST /api/metrics
Record performance metrics:

```bash
curl -X POST http://localhost:3000/api/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "name": "api.post.images.enhance",
    "value": 1234,
    "unit": "ms",
    "context": {
      "statusCode": 200,
      "userId": "user123"
    }
  }'
```

### POST /api/analytics
Record user events:

```bash
curl -X POST http://localhost:3000/api/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "eventName": "image_enhanced",
    "properties": {
      "preset": "portrait",
      "processingTime": 1234
    }
  }'
```

### POST /api/logs
Submit log entries:

```bash
curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -d '[
    {
      "timestamp": "2024-01-01T12:00:00Z",
      "level": "info",
      "message": "User action",
      "context": { "userId": "user123" }
    }
  ]'
```

### POST /api/errors
Report errors:

```bash
curl -X POST http://localhost:3000/api/errors \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Failed to process image",
    "stack": "Error: ...",
    "metadata": {
      "userId": "user123",
      "url": "https://example.com/enhance",
      "statusCode": 500
    },
    "timestamp": "2024-01-01T12:00:00Z"
  }'
```

## Integration with External Services

### Sentry (Error Tracking)

Setup in `next.config.mjs`:

```javascript
const Sentry = require('@sentry/nextjs')

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})
```

Environment variables:
```
SENTRY_DSN=https://your-sentry-dsn@sentry.io/12345
```

### Datadog (Metrics & Logs)

Setup in environment:

```
DATADOG_API_KEY=your-api-key
DATADOG_SITE=datadoghq.com
```

The monitoring library will automatically send metrics to Datadog.

### Mixpanel (Analytics)

Setup in environment:

```
MIXPANEL_TOKEN=your-mixpanel-token
```

### Vercel Analytics

Already integrated via `@vercel/analytics` package. No additional setup needed.

```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

## Dashboards & Reports

### Key Metrics to Monitor

1. **Performance**
   - API response time (p50, p95, p99)
   - Image processing duration
   - Time to First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)

2. **Reliability**
   - Error rate (% of requests)
   - 4xx/5xx error counts
   - Image processing success rate
   - API availability (uptime)

3. **Usage**
   - Daily active users (DAU)
   - Monthly active users (MAU)
   - Images processed per day
   - Credits consumed per user
   - Feature usage distribution

4. **Engagement**
   - Session duration
   - Images processed per session
   - Preset popularity
   - Comparison slider interactions

### Recommended Dashboard Layout

```
┌──────────────────────────────────────┐
│    Real-time Metrics                 │
├──────────────────────────────────────┤
│ P95 Response Time │ Error Rate │ DAU  │
│     1.2s          │   0.5%     │ 342  │
├──────────────────────────────────────┤
│ Top Errors                           │
│ • Failed image upload (15%)          │
│ • Payment processing (8%)            │
│ • Database timeout (5%)              │
├──────────────────────────────────────┤
│ Performance Trends (24h)             │
│ [Line chart: response time trend]    │
│ [Line chart: error rate trend]       │
├──────────────────────────────────────┤
│ User Engagement (24h)                │
│ • Presets used: [bar chart]          │
│ • Features used: [pie chart]         │
└──────────────────────────────────────┘
```

## Alerting

### Alert Rules

Set up alerts for:

1. **Performance Degradation**
   - API response time > 5s (warning)
   - API response time > 10s (critical)
   - Image processing > 30s (warning)

2. **Error Rate**
   - Error rate > 1% (warning)
   - Error rate > 5% (critical)
   - 5xx errors spike > 10x baseline (critical)

3. **Availability**
   - Service down > 1 minute (critical)
   - Database connection failures (critical)
   - External API failures (warning)

4. **Resource Usage**
   - Memory usage > 80% (warning)
   - Database connections > 90% limit (warning)
   - Queue size > 1000 (warning)

### Notification Channels

Configure alerts to notify:
- **Slack**: For immediate team notification
- **Email**: For critical issues
- **PagerDuty**: For on-call escalation
- **SMS**: For critical production issues

## Best Practices

### 1. Structured Logging

Always include context:

```typescript
// ❌ Bad
logger.log(LogLevel.ERROR, 'Error occurred')

// ✅ Good
logger.log(LogLevel.ERROR, 'Image processing failed', {
  userId: user.id,
  imageUrl,
  preset,
  errorCode: 'PROCESSING_TIMEOUT',
  duration: elapsedTime,
})
```

### 2. Performance Tracking

Monitor at multiple levels:

```typescript
// Route level
const startTime = Date.now()
// ... handler ...
await trackAPIRequest('POST', '/api/images/enhance', Date.now() - startTime, 200)

// Operation level
const opStart = Date.now()
const result = await enhanceImage(imageUrl)
await recordMetric('image.enhance', Date.now() - opStart)
```

### 3. Error Context

Always capture relevant context:

```typescript
try {
  // operation
} catch (error) {
  await captureError(error, {
    userId: session.userId,
    requestId: request.headers.get('x-request-id'),
    url: request.url,
    statusCode: 500,
  })
}
```

### 4. Sampling

For high-volume events, implement sampling:

```typescript
// Sample 10% of successful events
if (Math.random() < 0.1) {
  await trackUserEvent({
    userId: user.id,
    eventName: 'image_viewed',
  })
}
```

## Privacy & Security

### Data Retention

- Logs: 30 days
- Error reports: 90 days
- Analytics events: 1 year
- Metrics: Keep indefinitely (aggregated)

### PII Handling

Never log or track:
- Passwords or API keys
- Credit card information
- Email addresses (unless necessary)
- IP addresses (aggregate only)

Sanitize URLs:
```typescript
const sanitizedUrl = url.replace(/\?.*/, '') // Remove query params
```

## Troubleshooting

### Logs Not Appearing

1. Check if logger.flush() is being called
2. Verify /api/logs endpoint is accessible
3. Check browser console for errors
4. Verify environment variables are set

### Metrics Missing

1. Ensure recordMetric() is being called
2. Check /api/metrics endpoint
3. Verify external service credentials
4. Check network tab for failed requests

### Analytics Not Tracking

1. Verify /api/analytics endpoint
2. Check userId is properly set
3. Ensure trackUserEvent() is called
4. Check external analytics service setup

## Related Documentation

- [TypeScript Guide](./TYPESCRIPT_GUIDE.md)
- [API Guide](./API_GUIDE.md)
- [Monitoring Library](./lib/monitoring.ts)
