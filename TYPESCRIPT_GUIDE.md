# TypeScript Best Practices Guide

## Overview
This document outlines TypeScript conventions and best practices used in the clar1ty.art project.

## Type Definitions

### Component Props
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({ variant = 'primary', ...props }: ButtonProps) {}
```

### API Response Types
```typescript
interface APIResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

interface ImageEnhancementResult {
  originalUrl: string
  enhancedUrl: string
  processingTime: number
}
```

### Database Models
```typescript
interface User {
  id: string
  email: string
  name: string
  credits: number
  createdAt: Date
  updatedAt: Date
}

interface ImageProcessingJob {
  id: string
  userId: string
  inputImageUrl: string
  outputImageUrl?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string
}
```

## Utility Types

### Common Patterns
```typescript
// Extract type from array
type ArrayElement<T extends readonly unknown[]> = T[number]

// Make all properties optional
type Partial<T> = { [K in keyof T]?: T[K] }

// Make all properties readonly
type Readonly<T> = { readonly [K in keyof T]: T[K] }

// Pick specific properties
type Subset<T, K extends keyof T> = Pick<T, K>

// Omit properties
type Without<T, K extends keyof T> = Omit<T, K>
```

### Union and Literal Types
```typescript
type ImageFormat = 'jpg' | 'png' | 'webp'
type ProcessingStatus = 'idle' | 'loading' | 'success' | 'error'
type Nullable<T> = T | null
type Optional<T> = T | undefined
```

## Function Types

### API Handlers
```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    // Validation and processing
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'ERROR', message: String(error) } },
      { status: 500 }
    )
  }
}
```

### React Hooks
```typescript
import { useState, useEffect, useCallback } from 'react'

function useImageEnhancement() {
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const enhance = useCallback(async (imageUrl: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await enhanceImage(imageUrl)
      setImage(result.enhancedUrl)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [])

  return { image, loading, error, enhance }
}
```

### Server Actions
```typescript
'use server'

import { revalidatePath } from 'next/cache'

export async function updateUserProfile(userId: string, data: Partial<User>) {
  try {
    const updated = await db.users.update(userId, data)
    revalidatePath(`/profile/${userId}`)
    return { success: true, data: updated }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
```

## Generics

### Generic Components
```typescript
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string
}

export function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return <ul>{items.map(item => <li key={keyExtractor(item)}>{renderItem(item)}</li>)}</ul>
}
```

### Generic Hooks
```typescript
function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
): { loading: boolean; error: Error | null; value: T | null } {
  const [state, setState] = useState<{ loading: boolean; error: null | Error; value: T | null }>({
    loading: immediate,
    error: null,
    value: null,
  })

  useEffect(() => {
    asyncFunction()
      .then(value => setState({ loading: false, error: null, value }))
      .catch(error => setState({ loading: false, error, value: null }))
  }, [asyncFunction])

  return state
}
```

## Common Mistakes to Avoid

### 1. Any Type Usage
❌ **Bad:**
```typescript
function process(data: any) {
  return data.value
}
```

✅ **Good:**
```typescript
interface Data {
  value: string
}

function process(data: Data) {
  return data.value
}
```

### 2. Implicit Any
❌ **Bad:**
```typescript
function calculateTotal(items) { // items is any
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

✅ **Good:**
```typescript
interface Item {
  price: number
}

function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

### 3. Weak Typing
❌ **Bad:**
```typescript
function updateUser(id: string | number, data: any) {
  // Hard to track what properties are valid
}
```

✅ **Good:**
```typescript
function updateUser(id: string, data: Partial<User>) {
  // Clear what data structure is expected
}
```

## Enabling Strict Mode

Recommended TypeScript compiler options in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true
  }
}
```

## Testing TypeScript Code

```typescript
import { describe, it, expect } from '@jest/globals'

describe('calculateTotal', () => {
  it('should sum item prices', () => {
    const items: Item[] = [
      { price: 10 },
      { price: 20 },
      { price: 30 }
    ]
    expect(calculateTotal(items)).toBe(60)
  })

  it('should handle empty array', () => {
    expect(calculateTotal([])).toBe(0)
  })
})
```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript DOM API](https://www.typescriptlang.org/docs/handbook/dom-manipulation.html)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
